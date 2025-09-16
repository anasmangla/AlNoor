#!/usr/bin/env python3
"""Render the redirect landing page and update static links for the configured base path."""
from __future__ import annotations

import os
import re
from pathlib import Path
from string import Template

REPO_ROOT = Path(__file__).resolve().parent.parent
TEMPLATE_PATH = REPO_ROOT / "templates" / "root-redirect.html"
OUTPUT_PATH = REPO_ROOT / "index.html"
PUBLIC_LANDING_PATH = REPO_ROOT / "public" / "index.html"


def normalise_base_path(raw: str | None) -> str:
    """Ensure the base path starts with a slash and has no trailing slash."""
    if raw is None:
        return "/alnoor"
    cleaned = raw.strip()
    if not cleaned:
        return "/alnoor"
    if not cleaned.startswith("/"):
        cleaned = f"/{cleaned}"
    if len(cleaned) > 1 and cleaned.endswith("/"):
        cleaned = cleaned.rstrip("/")
    return cleaned or "/"


def base_with_trailing_slash(base_path: str) -> str:
    """Return the base path with a trailing slash (except for root)."""
    if base_path == "/":
        return "/"
    return f"{base_path}/"


def render_redirect_page(base_path: str) -> str:
    template = Template(TEMPLATE_PATH.read_text(encoding="utf-8"))
    prefix = "" if base_path == "/" else base_path
    redirect_target = base_with_trailing_slash(base_path)
    substitutions = {
        "redirect_target": redirect_target,
        "meta_refresh": f"0; url={redirect_target}",
        "store_href": f"{prefix}/products",
        "admin_href": f"{prefix}/admin/login",
        "pos_href": f"{prefix}/admin/pos",
    }
    return template.substitute(substitutions)


def update_static_landing_page(base_path: str) -> None:
    """Rewrite the public landing page links to respect the configured base path."""
    prefix = "" if base_path == "/" else base_path
    html = PUBLIC_LANDING_PATH.read_text(encoding="utf-8")
    html = re.sub(r'data-app-base="[^"]+"', f'data-app-base="{base_path}"', html)
    html = re.sub(r"\|\|\s*'[^']+'", f"|| '{base_path}'", html)

    def rewrite_slug(source: str, slug: str) -> str:
        target = f"{prefix}/{slug}" if prefix else f"/{slug}"
        if not target.startswith('/'):
            target = '/' + target
        pattern = re.compile(rf'href="/[^"]*{re.escape(slug)}"')
        return pattern.sub(f'href="{target}"', source)

    for slug in ("products", "admin/login", "admin/pos"):
        html = rewrite_slug(html, slug)
    PUBLIC_LANDING_PATH.write_text(html, encoding="utf-8")


def main() -> None:
    base_env = os.getenv("ALNOOR_BASE_PATH") or os.getenv("NEXT_PUBLIC_BASE_PATH")
    base_path = normalise_base_path(base_env)
    OUTPUT_PATH.write_text(render_redirect_page(base_path), encoding="utf-8")
    update_static_landing_page(base_path)
    print(f"Wrote {OUTPUT_PATH.relative_to(REPO_ROOT)} for base path '{base_path}'.")
    print(
        "Updated public/index.html links to match the configured base path.",
    )


if __name__ == "__main__":
    main()
