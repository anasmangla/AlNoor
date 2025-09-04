<#
Sets up the AlNoor project:
- Creates folders (src, tests, assets, scripts, .github/workflows)
- Adds .gitignore, .env.example, index.html, .htaccess
- Adds GitHub Actions workflow for Bluehost auto-deploy over SSH
- Initializes git, sets remotes, first commit
Adjust the vars below before running if needed.
#>

# -------------------- CONFIG --------------------
$RepoUrl      = "https://github.com/anasmangla/AlNoor.git"
$Branch       = "main"
$Domain       = "alnoorfarm716.com"
# Server document root (the path where you cloned in cPanel’s Version Control)
$ServerWebDir = "~/public_html/alnoor"
# ------------------------------------------------

$ErrorActionPreference = "Stop"
$root = Get-Location

# 1) Folders
New-Item -ItemType Directory -Force -Path "$root/src" | Out-Null
New-Item -ItemType Directory -Force -Path "$root/tests" | Out-Null
New-Item -ItemType Directory -Force -Path "$root/assets" | Out-Null
New-Item -ItemType Directory -Force -Path "$root/scripts" | Out-Null
New-Item -ItemType Directory -Force -Path "$root/.github/workflows" | Out-Null

# 2) .gitignore
@"
# General
.DS_Store
Thumbs.db

# Node
node_modules/
npm-debug.log*

# Python
venv/
__pycache__/
*.pyc

# Env & secrets
.env
*.secret
*.pem
*.key

# Build artifacts
dist/
build/
"@ | Set-Content -NoNewline "$root\.gitignore"

# 3) .env.example
@"
# Copy to .env on local/server and fill values
EXAMPLE_KEY=change_me
"@ | Set-Content -NoNewline "$root\.env.example"

# 4) Simple landing page (optional)
@"
<!doctype html>
<meta charset="utf-8">
<title>AlNoor OK</title>
<h1>Deployed ✅</h1>
<p>This is the default test page for $Domain.</p>
"@ | Set-Content -NoNewline "$root\index.html"

# 5) .htaccess (placed at project root; copy to server docroot if needed)
@"
RewriteEngine On
# Force HTTPS and non-www
RewriteCond %{HTTPS} !=on [OR]
RewriteCond %{HTTP_HOST} ^www\. [NC]
RewriteRule ^ https://$Domain%{REQUEST_URI} [L,R=301]

# Compression
AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json image/svg+xml

# Static caching
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/css "access plus 7 days"
  ExpiresByType application/javascript "access plus 7 days"
  ExpiresByType image/png "access plus 30 days"
  ExpiresByType image/jpeg "access plus 30 days"
  ExpiresByType image/svg+xml "access plus 30 days"
</IfModule>
"@ | Set-Content -NoNewline "$root\.htaccess"

# 6) GitHub Actions workflow
$workflow = @'
name: Deploy to Bluehost

on:
  push:
    branches: [ "$Branch" ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: SSH into Bluehost and pull latest
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: \${{ secrets.SSH_HOST }}
          username: \${{ secrets.SSH_USER }}
          key: \${{ secrets.SSH_KEY }}
          port: \${{ secrets.SSH_PORT || 22 }}
          script: |
            cd $ServerWebDir
            git status
            git fetch --all
            git reset --hard origin/$Branch
'@
$workflow | Set-Content -NoNewline "$root\.github\workflows\deploy.yml"

# 7) Server pull helper script (run on Bluehost if you want a manual one-liner)
@"
#!/usr/bin/env bash
set -euo pipefail
cd $ServerWebDir
git fetch --all
git reset --hard origin/$Branch
git clean -fd
git status
"@ | Set-Content -NoNewline "$root\scripts\server_pull.sh"

# 8) Initialize git & connect to GitHub
if (-not (Test-Path "$root\.git")) {
  git init | Out-Null
}
git branch -M $Branch
# Set identity if not set globally (safe to rerun)
git config user.name  "Anas Mangla" | Out-Null
git config user.email "anas.mangla@gmail.com" | Out-Null

# Add remote if missing
$remotes = git remote
if ($remotes -notmatch "\borigin\b") {
  git remote add origin $RepoUrl
}

git add .
git commit -m "Project scaffolding, CI/CD deploy, and config" | Out-Null

# Pull then push (first-time sync safety)
try {
  git pull --rebase origin $Branch
} catch {
  Write-Host "No remote branch yet or conflicts; continuing…"
}
git push -u origin $Branch
Write-Host "✅ Local setup complete. Next: add GitHub Action secrets (SSH_HOST, SSH_USER, SSH_KEY, optional SSH_PORT)."
