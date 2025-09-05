param(
  [switch]$Install
)

$ErrorActionPreference = 'Stop'

# Resolve repo root from this script path
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path $scriptDir -Parent

Write-Host "Al Noor dev runner starting..." -ForegroundColor Green

# Ensure Python venv exists
$venvPy = Join-Path $repoRoot 'venv\Scripts\python.exe'
if (!(Test-Path $venvPy)) {
  Write-Host "Creating Python virtual environment..." -ForegroundColor Yellow
  try { python -m venv (Join-Path $repoRoot 'venv') } catch { py -3 -m venv (Join-Path $repoRoot 'venv') }
  if (!(Test-Path $venvPy)) { throw "Failed to create venv. Ensure Python is installed and on PATH." }
}

if ($Install) {
  Write-Host "Installing backend Python deps..." -ForegroundColor Yellow
  & $venvPy -m pip install --upgrade pip | Out-Null
  & $venvPy -m pip install -r (Join-Path $repoRoot 'backend\requirements.txt')

  Write-Host "Installing frontend Node deps..." -ForegroundColor Yellow
  Push-Location (Join-Path $repoRoot 'frontend')
  try { npm install } finally { Pop-Location }
}

# Start backend (FastAPI via Uvicorn)
Write-Host "Starting FastAPI on http://127.0.0.1:8000 ..." -ForegroundColor Cyan
$backend = Start-Process -FilePath $venvPy -ArgumentList @('-m','uvicorn','app.main:app','--reload','--host','0.0.0.0','--port','8000') `
  -WorkingDirectory (Join-Path $repoRoot 'backend') -PassThru -WindowStyle Hidden

# Start frontend (Next.js)
Write-Host "Starting Next.js dev server on http://localhost:3000 ..." -ForegroundColor Cyan
$frontend = Start-Process -FilePath 'npm' -ArgumentList @('run','dev') `
  -WorkingDirectory (Join-Path $repoRoot 'frontend') -PassThru

Write-Host "Frontend PID: $($frontend.Id) | Backend PID: $($backend.Id)" -ForegroundColor DarkGray
Write-Host "Press Ctrl+C in the npm window to stop. This script will stop the backend when frontend exits." -ForegroundColor DarkGray

try {
  Wait-Process -Id $frontend.Id
} finally {
  if ($backend -and -not $backend.HasExited) {
    Write-Host "Stopping backend..." -ForegroundColor Yellow
    try { Stop-Process -Id $backend.Id -Force } catch {}
  }
}

Write-Host "Dev processes stopped." -ForegroundColor Green

