## AlNoor

![Al Noor Farm Logo](assets/alnoorlogo.png)

A minimal Python/Flask starter with tests and CI/CD to deploy via GitHub Actions over SSH.

### Deploy Workflow (Secrets)
- SSH_HOST: target server hostname or IP (e.g., example.com).
- SSH_USER: SSH username (e.g., cPanel user).
- SSH_KEY: private key contents (PEM) with access to the server.
- SSH_PORT: optional SSH port (default 22).

### How Deployment Works
- Trigger: push to `main` or run the workflow manually (Actions → Deploy to Bluehost → Run workflow).
- Steps: SSH to server, `cd ~/public_html/alnoor`, `git fetch`, `git reset --hard origin/main`.
- Server path: ensure `~/public_html/alnoor` matches your document root.

### Local Development
- Create venv: `python -m venv venv` then `./venv/Scripts/Activate.ps1`.
- Install: `pip install -r requirements.txt`.
- Run app: `python src/app.py` → http://127.0.0.1:5000/
- Tests: `python -m unittest discover -s tests -p "test_*.py"`.

Embed the logo in HTML:

```html
<img src="assets/alnoorlogo.png" alt="Al Noor Farm Logo" width="220" />
```

### Project Layout
- `src/`: application code (`main.py`, `app.py`).
- `tests/`: unit tests (`test_main.py`, `test_app.py`).
- `.github/workflows/`: CI/CD (`deploy.yml`).
- `scripts/`: setup helpers.

### Documentation
- Project overview (non‑technical): [docs/overview.md](docs/overview.md)
