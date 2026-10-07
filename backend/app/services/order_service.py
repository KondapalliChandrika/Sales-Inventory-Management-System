from collections import defaultdict
from datetime import date
from decimal import ROUND_HALF_UP, Decimal

from sqlalchemy.orm import Session

from app.core.exceptions import BusinessRuleError, ConflictError, ForbiddenError, NotFoundError
from app.models.enums import ApprovalAction, OrderStatus, UserRole
from app.models.mixins import utcnow
from app.models.order import OrderApproval, SalesOrder, SalesOrderItem
from app.models.product import Product
from app.models.user import User
from app.repositories import customer_repo, order_repo, product_repo
from app.schemas.order import OrderCreate
from app.services import inventory_service, settings_service
from app.utils.pagination import PageParams, paginate

CENT = Decimal("0.01")


def _money(value: Decimal) -> Decimal:
    return value.quantize(CENT, rounding=ROUND_HALF_UP)


def _order_number(order_id: int) -> str:
    return f"SO-{date.today().year}-{order_id:06d}"


def _is_manager(user: User) -> bool:
    return user.role in (UserRole.MANAGER, UserRole.ADMIN)


def get_order(db: Session, order_id: int, user: User) -> SalesOrder:
    order = order_repo.get_detail(db, order_id)
    if order is None:
        raise NotFoundError("Order not found")
    if not _is_manager(user) and order.created_by != user.id:
        raise ForbiddenError("You can only view your own orders")
    return order


def list_orders(db: Session, user: User, params: PageParams, **filters) -> dict:
    if not _is_manager(user):
        filters["created_by"] = user.id
    return paginate(db, order_repo.list_query(**filters), params)


def list_pending(db: Session, params: PageParams, search: str | None = None) -> dict:
    stmt = order_repo.list_query(status=OrderStatus.PENDING_APPROVAL, search=search)
    return paginate(db, stmt, params)


def create_order(db: Session, data: OrderCreate, user: User) -> SalesOrder:
    quantities: dict[int, int] = defaultdict(int)
    for line in data.items:
        quantities[line.product_id] += line.quantity

    customer = customer_repo.get(db, data.customer_id)
    if customer is None:
        raise NotFoundError("Customer not found")
    if not customer.is_active:
        raise BusinessRuleError("Customer is inactive", code="CUSTOMER_INACTIVE")

    products = product_repo.lock_many(db, list(quantities))
    missing = set(quantities) - set(products)
    if missing:
        raise NotFoundError("Product(s) not found", details={"product_ids": sorted(missing)})

    for product_id, qty in quantities.items():
        product = products[product_id]
        if not product.is_active:
            raise BusinessRuleError(f"Product {product.sku} is inactive", code="PRODUCT_INACTIVE")
        inventory_service.ensure_available(product, qty)

    items = [
        SalesOrderItem(
            product_id=pid,
            quantity=qty,
            unit_price=products[pid].unit_price,
            line_total=_money(products[pid].unit_price * qty),
        )
        for pid, qty in quantities.items()
    ]
    subtotal = _money(sum((i.line_total for i in items), Decimal("0")))
    tax_rate = settings_service.get_tax_rate(db)
    tax = _money(subtotal * tax_rate / 100)
    total = subtotal + tax
    requires_approval = total > settings_service.get_approval_threshold(db)

    order = SalesOrder(
        customer_id=customer.id,
        created_by=user.id,
        status=OrderStatus.PENDING_APPROVAL if requires_approval else OrderStatus.COMPLETED,
        subtotal=subtotal,
        tax_rate=tax_rate,
        tax=tax,
        total=total,
        requires_approval=requires_approval,
        notes=data.notes,
        items=items,
    )
    db.add(order)
    db.flush()
    order.order_number = _order_number(order.id)

    for item in items:
        product = products[item.product_id]
        if requires_approval:
            inventory_service.reserve(db, product, item.quantity, user, order.id)
        else:
            inventory_service.deduct(db, product, item.quantity, user, order.id)

    if requires_approval:
        db.add(OrderApproval(order_id=order.id, action=ApprovalAction.REQUESTED, acted_by=user.id))
    else:
        order.completed_at = utcnow()

    db.commit()
    return order_repo.get_detail(db, order.id)


def _lock_pending_order(db: Session, order_id: int) -> SalesOrder:
    order = order_repo.get_for_update(db, order_id)
    if order is None:
        raise NotFoundError("Order not found")
    if order.status != OrderStatus.PENDING_APPROVAL:
        raise ConflictError(
            f"Order is already {order.status.value.replace('_', ' ').lower()}",
            code="ORDER_ALREADY_PROCESSED",
        )
    return order


def _locked_products(db: Session, order: SalesOrder) -> dict[int, Product]:
    return product_repo.lock_many(db, [item.product_id for item in order.items])


def approve_order(db: Session, order_id: int, manager: User, comment: str | None) -> SalesOrder:
    order = _lock_pending_order(db, order_id)
    if order.created_by == manager.id:
        raise ForbiddenError("You cannot approve your own order", code="SELF_APPROVAL")

    products = _locked_products(db, order)
    for item in order.items:
        inventory_service.consume_reservation(db, products[item.product_id], item.quantity, manager, order.id)

    order.status = OrderStatus.COMPLETED
    order.completed_at = utcnow()
    db.add(OrderApproval(order_id=order.id, action=ApprovalAction.APPROVED, acted_by=manager.id, comment=comment))
    db.commit()
    return order_repo.get_detail(db, order.id)


def reject_order(db: Session, order_id: int, manager: User, reason: str) -> SalesOrder:
    order = _lock_pending_order(db, order_id)
    if order.created_by == manager.id:
        raise ForbiddenError("You cannot reject your own order — cancel it instead", code="SELF_APPROVAL")

    products = _locked_products(db, order)
    for item in order.items:
        inventory_service.release(db, products[item.product_id], item.quantity, manager, order.id)

    order.status = OrderStatus.REJECTED
    db.add(OrderApproval(order_id=order.id, action=ApprovalAction.REJECTED, acted_by=manager.id, comment=reason))
    db.commit()
    return order_repo.get_detail(db, order.id)


def cancel_order(db: Session, order_id: int, user: User) -> SalesOrder:
    order = _lock_pending_order(db, order_id)
    if order.created_by != user.id and user.role != UserRole.ADMIN:
        raise ForbiddenError("Only the order creator can cancel this order")

    products = _locked_products(db, order)
    for item in order.items:
        inventory_service.release(db, products[item.product_id], item.quantity, user, order.id)

    order.status = OrderStatus.CANCELLED
    db.add(OrderApproval(order_id=order.id, action=ApprovalAction.CANCELLED, acted_by=user.id))
    db.commit()
    return order_repo.get_detail(db, order.id)
