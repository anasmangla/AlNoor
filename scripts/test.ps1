$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path | Split-Path -Parent

Write-Host "Running frontend tests (Jest)..." -ForegroundColor Cyan
Push-Location (Join-Path $root 'frontend')
try {
  if (Test-Path package.json) {
    npm test --silent -- --coverage
  } else { Write-Host "No frontend tests" -ForegroundColor DarkGray }
} finally {
  Pop-Location
}

Write-Host "Running backend tests (pytest)..." -ForegroundColor Cyan
Push-Location (Join-Path $root 'backend')
try {
  $venv = Join-Path $root 'venv\Scripts\python.exe'
  if (Test-Path $venv) {
    & $venv -m pip install -q -r (Join-Path $root 'backend\requirements.txt') pytest pytest-asyncio httpx pytest-cov
    & $venv -m pytest -q
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
  } else {
    Write-Host "Python venv not found at venv/. Skipping backend tests." -ForegroundColor DarkGray
  }
} finally {
  Pop-Location
}
