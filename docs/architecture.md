# Al Noor Farm – Full‑Stack Architecture (Plan)

This document outlines the intended full‑stack architecture for Al Noor Farm’s ecommerce + POS platform using Next.js (frontend), FastAPI (backend), and PostgreSQL (database). It complements the current repo scaffold and guides future implementation.

## Tech Stack
- Frontend: Next.js (App Router, TypeScript) + Tailwind CSS for utility‑first styling.
- Backend: FastAPI (Python) with Pydantic schemas and SQLAlchemy/SQLModel ORM.
- DB: PostgreSQL with async SQLAlchemy engine and sessions.
- Auth: JWT (OAuth2 password flow) securing admin and POS routes.
- Payments: Square API integration (stubbed initially; sandbox env later).
- Config: Environment variables via .env (no secrets in code).

## Frontend (Next.js)
- Pages (App Router):
  - `/` (home), `/products`, `/products/[id]`, `/cart`, `/checkout`, `/confirmation`.
  - Admin: `/admin/login`, `/admin/products`, `/admin/orders`, `/admin/pos`.
- Components: Navbar, Footer, ProductCard/Form, CartItem, etc.
- State: Cart via React Context; fetch data from backend over HTTPS.
- Styling: Tailwind CSS per official guide (tailwindcss.com).

## Backend (FastAPI)
- Structure: `app/main.py` (create app, include routers), `app/models.py`, `app/schemas.py`, `app/database.py`, `app/routes/{auth,products,orders,pos}.py`, `app/utils/security.py`.
- Auth: `/auth/login` issues JWT (PyJWT); passwords hashed with Bcrypt/Passlib; `get_current_user` dependency protects admin routes (fastapi.tiangolo.com examples).
- Products API: Public `GET /products` and `GET /products/{id}`; Admin `POST/PUT/DELETE /products` (JWT required).
- Orders API: `POST /orders` (server‑side total calc; payment hook to Square), Admin `GET/PUT /orders`.
- POS: Reuse Orders endpoints; future `/pos/charge` to initiate Square Terminal checkout.
- CORS: Allow frontend origin in development; HTTPS in production.

## Data Model (baseline)
- Product: id, name, description, price, unit, is_weight_based, stock, active.
- Order: id, created_at, customer_name/email, status, source (online|pos), total.
- OrderItem: id, order_id, product_id, qty_or_weight, price_each, subtotal.
- User: id, username, password_hash, role.

## Payments (Square)
- Placeholder now; later use Square SDK with sandbox credentials from env (developer.squareup.com). Frontend uses Web Payments SDK; POS may use Terminal API.

## Deployment (Bluehost / cPanel)
- Run Next.js Node app (npm install/build/start) and FastAPI via Passenger (Uvicorn/Gunicorn). Configure env vars in cPanel. Optionally keep GitHub Actions pull‑and‑install step for code sync.

## Environment Variables (.env)
- `DATABASE_URL` (e.g., postgresql+asyncpg://user:pass@host:5432/db)
- `SECRET_KEY` (JWT signing key)
- `SQUARE_ACCESS_TOKEN`, `SQUARE_LOCATION_ID`
- `NEXT_PUBLIC_API_BASE_URL` (frontend → backend URL)
- Optional: `SQUARE_ENV=sandbox|production`

## Next Steps
1) Initialize Next.js (frontend/) and Tailwind. 2) Scaffold FastAPI (backend/) with models and auth. 3) Wire product list/detail, cart, and checkout. 4) Add admin CRUD and orders. 5) Replace payment stubs with Square sandbox.

