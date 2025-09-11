$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path | Split-Path -Parent

Write-Host "Building frontend (Next.js)..." -ForegroundColor Cyan
Push-Location (Join-Path $root 'frontend')
try {
  if (Test-Path package-lock.json) { npm ci } else { npm install }
  npm run build
} finally {
  Pop-Location
}

Write-Host "Backend (FastAPI) has no build step. Ensure requirements are installed." -ForegroundColor DarkGray

