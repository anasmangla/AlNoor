## Backend (FastAPI)

- Dev server: `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`
- Install deps: `pip install -r requirements.txt`
- Env: configure `.env` (see root .env.example)

Endpoints (starter):
- `GET /` → welcome message
- `GET /health` → { status: "ok" }

### Health check usage

The `/health` endpoint is intended for uptime monitors and load balancers. It
returns HTTP 200 with a JSON body when the application and dependencies are
ready to serve traffic.

```bash
curl -sSf http://localhost:8000/health
# {"status":"ok"}
```

Configure your infrastructure monitors to alert if the request returns a
non-200 status or times out.

