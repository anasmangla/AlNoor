## Al Noor Farm – Ecommerce & POS

![Al Noor Farm Logo](assets/alnoorlogo.png)

Full‑stack scaffold for storefront, admin, and POS:
- Frontend: Next.js (App Router, TypeScript, Tailwind CSS)
- Backend: FastAPI (Python) with placeholder auth/orders and in‑memory data
- Database: PostgreSQL planned; env configured. Current routes use in‑memory data.
- Payments: Square integration placeholders (env stubs only)

### Repository Structure
- `frontend/`: Next.js app (App Router). Pages: `/`, `/products`, `/cart`, `/checkout`, `/confirmation`, `/admin/login`, `/admin/products`, `/admin/orders`, `/admin/pos`.
- `backend/`: FastAPI app with routers: `products`, `orders`, `auth`, `pos`.
- `assets/`, `docs/`, `scripts/`: static assets, docs, and helper scripts.
- `.env.example`: all required env variables (no secrets committed).

### Local Development
- Prereqs: Node 18+, Python 3.10+, PostgreSQL (optional for now)
- One‑shot dev (Windows): `powershell -ExecutionPolicy Bypass -File .\\scripts\\start-dev.ps1 -Install`
- One‑shot dev (macOS/Linux): `chmod +x ./scripts/start-dev.sh && ./scripts/start-dev.sh --install`
- Manual:
  - Backend: `cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload`
  - Frontend: `cd frontend && npm install && npm run dev`

### Environment
Copy `.env.example` to `.env` and adjust:
- `DATABASE_URL`, `SECRET_KEY`, `SQUARE_ACCESS_TOKEN`, `SQUARE_LOCATION_ID`, `SQUARE_ENV`
- `NEXT_PUBLIC_API_BASE_URL` (frontend)
- Demo admin (placeholder): `ADMIN_USERNAME`, `ADMIN_PASSWORD`

### Backend Endpoints (current)
- `GET /` welcome; `GET /health` status
- `GET /products`, `GET /products/{id}` – public
- `POST /products`, `PUT /products/{id}`, `DELETE /products/{id}` – in‑memory
- `POST /orders` – computes totals from products, returns order
- `GET /orders`, `GET /orders/{id}` – list/detail orders (in‑memory)
- `POST /auth/login` – returns placeholder bearer token
- `POST /pos/checkout` – creates POS order (alias to `/orders`)

### Frontend Highlights
- Storefront lists products from API.
- Admin products CRUD against the same API (no auth gating yet).
- Checkout posts a demo order and redirects to confirmation.
- POS simulates a running sale and checkout (creates order with source=pos).

### Deployment (BlueHost cPanel – manual)
- Frontend: Setup Node.js App pointing to `frontend/`, run `npm install`, `npm run build`, `npm start` or Next server per cPanel setup.
- Backend: Setup Python App pointing to `backend/`, install `requirements.txt`, WSGI entry `from app.main import app as application`.
- Configure environment variables in cPanel for both apps.
- Ensure CORS or routing so frontend reaches API (`NEXT_PUBLIC_API_BASE_URL`).

### Notes
- DB and JWT verification are stubs. Replace in‑memory stores with Postgres via SQLAlchemy/SQLModel and real JWT as you progress.
- See `docs/architecture*.md` for the broader plan.
