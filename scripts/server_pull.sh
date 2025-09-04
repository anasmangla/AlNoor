#!/usr/bin/env bash
set -euo pipefail
cd ~/public_html/alnoor
git fetch --all
git reset --hard origin/main
git clean -fd
git status