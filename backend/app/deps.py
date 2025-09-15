import os
from typing import Optional

from fastapi import Depends, HTTPException, Request, status

from app.utils.security import decode_token


def get_bearer_token(request: Request) -> Optional[str]:
    auth = request.headers.get("Authorization")
    if auth:
        parts = auth.split()
        if len(parts) == 2 and parts[0].lower() == "bearer":
            return parts[1]
    cookie_token = request.cookies.get("alnoor_token")
    if cookie_token:
        return cookie_token
    return None


def get_current_user(request: Request) -> str:
    token = get_bearer_token(request)
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    decoded = decode_token(token)
    if not decoded or "sub" not in decoded:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    username = str(decoded["sub"]).strip()
    # Simple role check: only the configured admin is allowed
    admin_user = os.getenv("ADMIN_USERNAME", "admin")
    if username != admin_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    return username

