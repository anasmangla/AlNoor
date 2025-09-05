#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/start-dev.sh [-i|--install]

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd -- "${SCRIPT_DIR}/.." && pwd)"

INSTALL=0
if [[ "${1:-}" == "-i" || "${1:-}" == "--install" ]]; then
  INSTALL=1
fi

echo "[dev] Root: ${ROOT_DIR}"

# Python venv
PY_BIN="python3"
command -v python3 >/dev/null 2>&1 || PY_BIN="python"
if [[ ! -f "${ROOT_DIR}/venv/bin/python" ]]; then
  echo "[dev] Creating Python venv..."
  "${PY_BIN}" -m venv "${ROOT_DIR}/venv"
fi
VENV_PY="${ROOT_DIR}/venv/bin/python"

if [[ ${INSTALL} -eq 1 ]]; then
  echo "[dev] Installing backend deps..."
  "${VENV_PY}" -m pip install --upgrade pip >/dev/null
  "${VENV_PY}" -m pip install -r "${ROOT_DIR}/backend/requirements.txt"

  echo "[dev] Installing frontend deps..."
  (cd "${ROOT_DIR}/frontend" && npm install)
fi

echo "[dev] Starting FastAPI at http://127.0.0.1:8000 ..."
"${VENV_PY}" -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 \
  --app-dir "${ROOT_DIR}/backend" &
BACK_PID=$!

cleanup() {
  echo "[dev] Stopping backend (pid ${BACK_PID})..."
  kill ${BACK_PID} 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "[dev] Starting Next.js at http://localhost:3000 ..."
(cd "${ROOT_DIR}/frontend" && npm run dev)

