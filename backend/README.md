## Backend (FastAPI)

- Dev server: `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`
- Install deps: `pip install -r requirements.txt`
- Env: configure `.env` (see root .env.example)

Endpoints (starter):
- `GET /` → welcome message
- `GET /health` → { status: "ok" }

