## Al Noor Farm � Ecommerce & POS

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
- Prereqs: Node 18+, Python 3.10+
- Quick start (Windows): `powershell -ExecutionPolicy Bypass -File ./scripts/dev.ps1 -Install`
- Quick start (macOS/Linux): `chmod +x ./scripts/dev.sh && ./scripts/dev.sh --install`
- Manual:
  - Backend: `cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload`
  - Frontend: `cd frontend && npm install && npm run dev`

Build and test scripts:
- Build: `./scripts/build.ps1` (Windows) or run equivalent Node commands on Unix
- Test: `./scripts/test.ps1` (runs frontend Jest and backend pytest)

### Environment
Copy `.env.example` to `.env` and adjust:
- `DATABASE_URL`, `SECRET_KEY`, `SQUARE_ACCESS_TOKEN`, `SQUARE_LOCATION_ID`, `SQUARE_ENV`
- `NEXT_PUBLIC_API_BASE_URL` (frontend)
- Demo admin (placeholder): `ADMIN_USERNAME`, `ADMIN_PASSWORD`

### Backend Endpoints (current)
- `GET /` welcome; `GET /health` status
- `GET /products`, `GET /products/{id}` � public
- `POST /products`, `PUT /products/{id}`, `DELETE /products/{id}` � admin (JWT required)
- `POST /orders` � computes totals and creates order; decrements stock
- `GET /orders`, `GET /orders/{id}` � admin list/detail orders
- `POST /auth/login` � returns bearer token
- `POST /pos/checkout` � creates POS order

### Frontend Highlights
- Storefront lists products from API.
- Admin products CRUD against the same API (no auth gating yet).
- Checkout posts a demo order and redirects to confirmation.
- POS simulates a running sale and checkout (creates order with source=pos).

### Deployment (BlueHost cPanel – manual)
- Frontend (Next.js):
  - cPanel > Setup Node.js App
  - Application Root: path to `frontend`
  - Application URL: `/` or a subpath like `/alnoor`
  - Startup file: `server.js`
  - Run NPM Install, then `npm run build`, then start the app
  - If mounted under a subpath, set `NEXT_PUBLIC_BASE_PATH=/alnoor` in the app environment
- Backend (FastAPI):
  - cPanel > Setup Python App
  - Application Root: path to `backend`
  - WSGI: `passenger_wsgi.py` (contains `from app.main import app as application`)
  - Run Pip Install for `requirements.txt`
  - Configure environment variables: `DATABASE_URL`, `SECRET_KEY`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `SQUARE_*`, optional SMTP
- Apache routing:
  - `.htaccess` in document root points `/` to `public/index.html` and falls back unknown paths to that file
  - Paths `/alnoor` (Next.js app) and `/api` (FastAPI) are excluded from the fallback
  - In production, set `NEXT_PUBLIC_API_BASE_URL=https://<your-api-host-or-path>`
  - Static homepage links point into the Next app at `/alnoor` (Store/Admin/POS)

### Notes
- DB and JWT verification are stubs. Replace in‑memory stores with Postgres via SQLAlchemy/SQLModel and real JWT as you progress.
- See `docs/architecture*.md` for the broader plan.


