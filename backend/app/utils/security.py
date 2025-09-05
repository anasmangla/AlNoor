import os
import time
from typing import Any, Dict, Optional

import jwt
from passlib.context import CryptContext


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(subject: str, expires_in_seconds: int = 60 * 60 * 24) -> str:
    secret = os.getenv("SECRET_KEY", "changeme")
    now = int(time.time())
    payload: Dict[str, Any] = {"sub": subject, "iat": now, "exp": now + expires_in_seconds}
    return jwt.encode(payload, secret, algorithm="HS256")


def decode_token(token: str) -> Optional[Dict[str, Any]]:
    secret = os.getenv("SECRET_KEY", "changeme")
    try:
        decoded = jwt.decode(token, secret, algorithms=["HS256"])
        return decoded  # type: ignore[return-value]
    except jwt.PyJWTError:
        return None

