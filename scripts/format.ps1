$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path | Split-Path -Parent

Write-Host "Formatting backend (Black)..." -ForegroundColor Cyan
$venvPy = Join-Path $root 'venv\Scripts\python.exe'
if (Test-Path $venvPy) {
  & $venvPy -m pip install -q black
  & $venvPy -m black (Join-Path $root 'backend')
} else {
  Write-Host "Python venv not found at venv/. Skipping Black." -ForegroundColor DarkGray
}

Write-Host "Formatting frontend (Prettier)..." -ForegroundColor Cyan
Push-Location (Join-Path $root 'frontend')
try {
  if (Test-Path package.json) {
    npx --yes prettier . --write
  } else {
    Write-Host "No frontend project found." -ForegroundColor DarkGray
  }
} finally {
  Pop-Location
}

