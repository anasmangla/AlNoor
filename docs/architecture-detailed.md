# Al Noor Farm Website & POS – Detailed Architecture

This initial codebase establishes a full‑stack web application for Al Noor Farm’s ecommerce platform and point‑of‑sale (POS) system. It uses Next.js for a dynamic frontend, FastAPI for a high‑performance backend API, and PostgreSQL for data persistence. All sensitive credentials (database URLs, API keys) are managed via environment variables (with a provided .env.example), and Square payment integration is stubbed out as a placeholder (to be implemented with real keys later). Tailwind CSS is used for rapid UI styling and the project structure is organized for ease of development and deployment.

## Tech Stack and Architecture

- Frontend: Next.js (App Router, React), Tailwind CSS for consistent styling.
- Backend: FastAPI REST API (Python) for products, orders, auth, etc.; Pydantic for schemas; SQLAlchemy/SQLModel ORM.
- Database: PostgreSQL; async SQLAlchemy sessions for I/O.
- Auth: Admin JWT (OAuth2 password flow); passwords hashed with Passlib Bcrypt; JWT secret via env.
- Payments: Square integration placeholders with env stubs (SQUARE_ACCESS_TOKEN, SQUARE_LOCATION_ID).
- Deployment: Designed for Bluehost/cPanel using manual GitHub sync and app setup for Node.js and Python.

## Frontend – Next.js Application

- Structure (App Router):
  - app/page.tsx (home), app/products/page.tsx (listing), app/products/[id]/page.tsx (details), app/cart/page.tsx, app/checkout/page.tsx, app/confirmation/page.tsx.
  - Admin: app/admin/login/page.tsx, app/admin/products/page.tsx, app/admin/orders/page.tsx, app/admin/pos/page.tsx.
  - components/ for UI (Navbar, Footer, ProductCard, ProductForm, CartItem).
  - Tailwind configured per tailwindcss.com; global styles imported in layout.
- Data fetching: SSR or client fetch to FastAPI (e.g., fetch(`${NEXT_PUBLIC_API_BASE_URL}/products`)).
- Cart state: React Context (persist to localStorage if desired).

## Backend – FastAPI Application

- Modules: app/main.py (create app, include routers), app/models.py, app/schemas.py, app/database.py (Async engine/session), app/routes/{auth,products,orders,pos}.py, app/utils/security.py.
- Auth: /auth/login issues JWT (PyJWT); OAuth2PasswordBearer to protect admin routes; bcrypt password hashing.
- Products API: Public GET /products, GET /products/{id}; Admin POST/PUT/DELETE /products (JWT).
- Orders API: Public POST /orders (calculate totals server‑side; Square hook), Admin GET/PUT /orders.
- POS: Reuse orders endpoints; future /pos/charge to initiate Square Terminal checkout.
- CORS: Allow frontend origin in dev; HTTPS in production.

## Database Model (baseline)

- Product: id, name, description, price, unit, is_weight_based, stock, active.
- Order: id, created_at, customer_name/email, status, source (online|pos), total.
- OrderItem: id, order_id, product_id, qty_or_weight, price_each, subtotal.
- User: id, username, password_hash, role.

## Payments (Square)

- Placeholder now; later integrate Web Payments SDK (frontend) and Payments/Terminal APIs (backend) using sandbox creds from env (developer.squareup.com).

## Deployment Notes (Bluehost/cPanel)

- Frontend: Node.js app (npm install/build/start) proxied by cPanel.
- Backend: Python app (Passenger + Uvicorn/Gunicorn) with requirements.txt; configure env vars in cPanel.
- Ensure frontend can reach backend (rewrite/proxy or CORS).

## Environment & Configuration

- .env.example (already included) documents: DATABASE_URL, SECRET_KEY, SQUARE_ACCESS_TOKEN, SQUARE_LOCATION_ID, SQUARE_ENV, NEXT_PUBLIC_API_BASE_URL.

## Future Work

- Implement real Square flows (online & Terminal), admin CRUD UI, richer product images, and email notifications; add automated tests and CI checks.

