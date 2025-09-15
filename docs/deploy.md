# Deployment Guide

This guide walks through preparing and launching the Al Noor Farm frontend (Next.js) and backend (FastAPI) applications in a production setting such as a shared cPanel host.

## Prerequisites
- Node.js 18 or newer
- Python 3.10 or newer
- Access to configure environment variables for both the Node.js and Python applications
- Ability to run build commands (npm, pip) on the deployment host or via CI/CD

## Required Environment Variables

### Shared values
- `NEXT_PUBLIC_API_BASE_URL` – Base URL where the FastAPI service is reachable (e.g., `https://example.com/api`).
- `DATABASE_URL` – PostgreSQL connection string (planning for production use).

### Frontend (Next.js)
- `NEXT_PUBLIC_BASE_PATH=/alnoor` – Required when the storefront is mounted under `/alnoor`.
- `NEXT_PUBLIC_API_BASE_URL` – Must match the public path to the backend (e.g., `https://example.com/api`).
- Optional Square integration: `NEXT_PUBLIC_SQUARE_APP_ID`, `NEXT_PUBLIC_SQUARE_LOCATION_ID`, `NEXT_PUBLIC_SQUARE_ENV`.
- Optional server config: `PORT` (defaults to `3000`), `HOST` (defaults to `0.0.0.0`).

### Backend (FastAPI)
- `SECRET_KEY` – Required for signing JWTs/sessions.
- `DATABASE_URL` – Matches the connection string above; currently used for future persistence work.
- Admin placeholders: `ADMIN_USERNAME`, `ADMIN_PASSWORD`.
- Optional Square integration: `SQUARE_ACCESS_TOKEN`, `SQUARE_LOCATION_ID`, `SQUARE_ENV`.
- Optional SMTP: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_TLS`, `CONTACT_TO`.

> Copy `.env.example` to `.env` in both the `frontend/` and `backend/` directories and adjust values before building.

## Build and Start the Next.js Server
1. Change into the frontend directory: `cd frontend`.
2. Install dependencies: `npm install`.
3. Ensure environment variables are available (e.g., via `.env` or cPanel UI). Set `NEXT_PUBLIC_BASE_PATH=/alnoor` if serving from that subpath.
4. Build the production bundle: `npm run build`.
5. Start the server: `npm run start`.
6. Verify the app responds at `https://<domain>/alnoor` (or the configured base path) and that API requests target `NEXT_PUBLIC_API_BASE_URL`.

## Build and Start the FastAPI Application
1. Change into the backend directory: `cd backend`.
2. Create/activate a virtual environment (recommended):
   ```bash
   python -m venv .venv
   source .venv/bin/activate
   ```
3. Install dependencies: `pip install -r requirements.txt` (or `pip install -r ../requirements.txt` from the repo root).
4. Confirm required variables (especially `SECRET_KEY` and `DATABASE_URL`) are configured in the environment.
5. Launch the ASGI server for production (example using Uvicorn):
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```
   On cPanel, point the Python application to `passenger_wsgi.py`, which exposes `app.main:app` as `application`.
6. Ensure the service is reachable at `https://<domain>/api` (or your chosen route) so the Next.js client can access it.

## Directory Paths and Routing Notes
- The Next.js application expects to live under `/alnoor`; update `NEXT_PUBLIC_BASE_PATH` and web server rewrites accordingly.
- Reserve a path such as `/api` (or another prefix) for the FastAPI backend and configure your reverse proxy or .htaccess rules to forward requests there.
- Static links on the landing page redirect `/store`, `/admin`, and `/pos` into the `/alnoor` Next.js app.

Keep the deployment scripts and environment variable definitions in sync with any future backend database or authentication changes.
