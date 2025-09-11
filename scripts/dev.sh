#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT="$DIR/start-dev.sh"
if [[ ! -f "$SCRIPT" ]]; then
  echo "start-dev.sh not found in scripts/" >&2
  exit 1
fi

"$SCRIPT" "${1:-}"

