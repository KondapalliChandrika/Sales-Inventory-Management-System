# Sales & Inventory Management System

React + FastAPI + MySQL application for managing products, customers, sales orders and inventory,
with a manager approval workflow and email notifications.


## Features

- **JWT authentication** with three roles — Admin, Manager, Sales
- **Products & customers** — CRUD, search, pagination, soft delete
- **Sales orders** — stock validation, tax, totals; order lines snapshot the price
- **Approval workflow** — orders above a configurable threshold are held for a manager; stock is *reserved*
  meanwhile. Approve → stock deducted & order completed. Reject → reservation released. Managers can't approve their own orders.
- **Email notifications** — managers on approval request; creator on approve/reject. Sent after commit, logged in `email_logs`.
- **Inventory** — stock in / adjustments, low-stock alerts, full append-only stock ledger
- **Dashboard** — sales today/month, sales trend chart, orders by status, approvals, low stock, recent orders
- **Transactions** — row locks (`SELECT … FOR UPDATE`) prevent overselling and double approval
- **Consistent errors** — every error is `{ "error": { "code", "message", "details" } }`

## Prerequisites

- Python 3.10+
- Node.js 18+
- MySQL 8.0.16+ (CHECK constraints are enforced from 8.0.16)

## 1. Database

Nothing to do — just have MySQL running. When the backend starts it automatically:

1. creates the database from `DATABASE_URL` if it doesn't exist (skips if it does),
2. runs the Alembic migrations, creating any missing tables (skips if already up to date), and
3. adds the demo data (users, products, customers, settings) if there are no users yet (skips otherwise).

Set `AUTO_MIGRATE=false` / `AUTO_SEED=false` in `.env` to turn these off.

## 2. Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

uvicorn app.main:app --reload --port 8001   # creates DB, tables and demo data on first start
                              # API docs: http://localhost:8001/docs
```

Run the tests (in-memory SQLite, no MySQL needed):

```bash
pytest -q
```

### Email

With `EMAIL_ENABLED=false` (default) emails are rendered, logged to the console and recorded in `email_logs`
with status `SKIPPED`. To send real emails, set `EMAIL_ENABLED=true` and the `SMTP_*` values in `.env`.

## 3. Frontend

```bash
cd frontend
npm install
npm run dev            # http://localhost:5173
```

## Demo accounts (added automatically on first start; `python seed.py` re-adds any missing ones)

| Role    | Email               | Password    |
|---------|---------------------|-------------|
| Admin   | admin@example.com   | Admin@123   |
| Manager | manager@example.com | Manager@123 |
| Sales   | sales@example.com   | Sales@123   |

Try it: log in as **Sales**, create an order for 1 laptop (₹58,000 + 18% tax > ₹50,000 threshold) → it goes to
*Pending Approval*. Log in as **Manager** → *Approvals* → approve or reject.

## Project structure

```
backend/
  app/
    core/           config, database session, JWT/bcrypt, exceptions, auth dependencies
    models/         SQLAlchemy models
    schemas/        Pydantic request/response models (validation)
    repositories/   database queries only
    services/       business logic + transactions (order workflow, inventory, email, dashboard)
    api/v1/         HTTP endpoints (thin: validate → call service → return)
    email_templates/
  alembic/          migrations
  tests/
frontend/
  src/
    theme/          ★ all colors (colors.js) — consumed by tailwind.config.js
    constants/      routes, roles, status → label/tone maps, navigation
    api/            axios client + one module per resource
    hooks/          react-query hooks (server state)
    context/        AuthContext
    components/     ui/ (Button, Table, Modal…), layout/, common/ (route guards)
    features/       one folder per screen/domain
```

### Colors

All colors are defined once in `frontend/src/theme/colors.js` and registered in `tailwind.config.js`.
Components only use token classes such as `bg-background-100`, `text-content-secondary`, `bg-primary-600`,
`text-danger-700` — never raw Tailwind palette classes or hex values. To re-theme the app, edit `colors.js`.
