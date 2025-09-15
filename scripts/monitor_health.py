#!/usr/bin/env python3
"""Simple uptime monitor for the frontend and backend health endpoints."""

from __future__ import annotations

import argparse
import sys
import time
from datetime import datetime
from collections.abc import Sequence
from urllib import error, request


DEFAULT_FRONTEND_URL = "http://localhost:3000/__health"
DEFAULT_BACKEND_URL = "http://localhost:8000/health"


def fetch_status(url: str, timeout: float) -> tuple[bool, int | None, str]:
    """Return a tuple with success flag, HTTP status, and optional detail."""

    try:
        with request.urlopen(url, timeout=timeout) as response:  # nosec B310
            status_code = response.status
            body = response.read(512).decode("utf-8", "replace")
        return status_code == 200, status_code, body.strip()
    except error.HTTPError as http_error:
        detail = http_error.read().decode("utf-8", "replace")
        return False, http_error.code, detail.strip()
    except Exception as exc:  # pylint: disable=broad-except
        return False, None, str(exc)


def monitor(
    targets: Sequence[tuple[str, str]],
    interval: float,
    timeout: float,
    once: bool,
) -> bool:
    """Poll each target and return True when every check passes."""

    overall_ok = True
    while True:
        timestamp = datetime.now().isoformat(timespec="seconds")
        for name, url in targets:
            is_ok, status_code, detail = fetch_status(url, timeout)
            status_text = str(status_code) if status_code is not None else "-"
            result = "OK" if is_ok else "FAIL"
            print(f"[{timestamp}] {name.upper():8} {result:4} ({status_text}) {url}")
            if not is_ok and detail:
                print(f"    {detail[:200]}")
            overall_ok = overall_ok and is_ok
        if once:
            return overall_ok
        try:
            time.sleep(interval)
        except KeyboardInterrupt:
            print("\nInterrupted. Exiting monitor loop.")
            return overall_ok


def parse_args(argv: Sequence[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Poll the frontend /__health and backend /health endpoints and report uptime."
        )
    )
    parser.add_argument(
        "--frontend",
        default=DEFAULT_FRONTEND_URL,
        help="Frontend health check URL (set empty string to skip).",
    )
    parser.add_argument(
        "--backend",
        default=DEFAULT_BACKEND_URL,
        help="Backend health check URL (set empty string to skip).",
    )
    parser.add_argument(
        "--interval",
        type=float,
        default=60.0,
        help="Seconds to wait between checks (default: 60).",
    )
    parser.add_argument(
        "--timeout",
        type=float,
        default=5.0,
        help="Seconds to wait for each response (default: 5).",
    )
    parser.add_argument(
        "--once",
        action="store_true",
        help="Run a single round of checks and exit with a failing status if any fail.",
    )
    return parser.parse_args(argv)


def main(argv: Sequence[str] | None = None) -> int:
    args = parse_args(argv or sys.argv[1:])

    targets: list[tuple[str, str]] = []
    if args.frontend:
        targets.append(("frontend", args.frontend))
    if args.backend:
        targets.append(("backend", args.backend))

    if not targets:
        print("No endpoints provided. Use --frontend or --backend.")
        return 1

    all_ok = monitor(targets, args.interval, args.timeout, args.once)
    return 0 if all_ok else 1


if __name__ == "__main__":
    sys.exit(main())
