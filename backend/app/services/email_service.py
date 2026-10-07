import logging
import smtplib
from email.message import EmailMessage
from pathlib import Path
from typing import Any

from jinja2 import Environment, FileSystemLoader, select_autoescape
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import SessionLocal
from app.models.email_log import EmailLog
from app.models.enums import ApprovalAction, EmailStatus, UserRole
from app.repositories import order_repo, user_repo

logger = logging.getLogger(__name__)

_templates = Environment(
    loader=FileSystemLoader(Path(__file__).resolve().parent.parent / "email_templates"),
    autoescape=select_autoescape(["html"]),
)

EMAIL_THEME = {
    "background": "#F8FAFC",
    "surface": "#FFFFFF",
    "border": "#E2E8F0",
    "text": "#0F172A",
    "muted": "#475569",
    "primary": "#4F46E5",
    "success": "#047857",
    "danger": "#B91C1C",
    "warning": "#B45309",
}


def _send_smtp(to_email: str, subject: str, html: str) -> None:
    msg = EmailMessage()
    msg["From"] = settings.SMTP_FROM
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.set_content("Please view this email in an HTML-capable client.")
    msg.add_alternative(html, subtype="html")

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15) as smtp:
        if settings.SMTP_USE_TLS:
            smtp.starttls()
        if settings.SMTP_USER:
            smtp.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        smtp.send_message(msg)


def send_email(
    db: Session, *, to_email: str, subject: str, template: str, context: dict[str, Any], order_id: int | None = None
) -> EmailStatus:
    html = _templates.get_template(template).render(**context, theme=EMAIL_THEME, app_name=settings.APP_NAME)
    status, error = EmailStatus.SENT, None

    if not settings.EMAIL_ENABLED:
        status = EmailStatus.SKIPPED
        logger.info("EMAIL_ENABLED=false — skipped email to %s: %s", to_email, subject)
    else:
        try:
            _send_smtp(to_email, subject, html)
            logger.info("Email sent to %s: %s", to_email, subject)
        except Exception as exc:
            status, error = EmailStatus.FAILED, str(exc)[:1000]
            logger.exception("Failed to send email to %s", to_email)

    db.add(EmailLog(to_email=to_email, subject=subject, template=template,
                    status=status, error=error, related_order_id=order_id))
    return status


def _order_url(order_id: int) -> str:
    return f"{settings.FRONTEND_URL.rstrip('/')}/orders/{order_id}"


def notify_approval_required(order_id: int) -> None:
    with SessionLocal() as db:
        order = order_repo.get_detail(db, order_id)
        if order is None:
            return
        recipients = user_repo.active_by_roles(db, [UserRole.MANAGER]) or user_repo.active_by_roles(
            db, [UserRole.ADMIN]
        )
        if not recipients:
            logger.warning("No active managers to notify for order %s", order.order_number)
        for manager in recipients:
            send_email(
                db,
                to_email=manager.email,
                subject=f"Approval required: {order.order_number}",
                template="approval_required.html",
                context={"recipient": manager, "order": order, "order_url": _order_url(order.id)},
                order_id=order.id,
            )
        db.commit()


def notify_order_decision(order_id: int) -> None:
    with SessionLocal() as db:
        order = order_repo.get_detail(db, order_id)
        if order is None:
            return
        decision = next(
            (a for a in reversed(order.approvals) if a.action in (ApprovalAction.APPROVED, ApprovalAction.REJECTED)),
            None,
        )
        if decision is None:
            return
        approved = decision.action == ApprovalAction.APPROVED
        send_email(
            db,
            to_email=order.creator.email,
            subject=f"Order {order.order_number} {'approved' if approved else 'rejected'}",
            template="order_approved.html" if approved else "order_rejected.html",
            context={"recipient": order.creator, "order": order, "decision": decision,
                     "order_url": _order_url(order.id)},
            order_id=order.id,
        )
        db.commit()
