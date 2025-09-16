import asyncio

import pytest
from fastapi import HTTPException
from starlette.requests import Request

from sqlalchemy import select

from app.database import get_session, init_db, seed_if_empty
from app.deps import get_bearer_token, get_current_user
from app.models import User
from app.utils.security import create_access_token


def build_request(headers=None, cookies=None) -> Request:
    headers = headers or {}
    raw_headers = [(k.lower().encode(), v.encode()) for k, v in headers.items()]
    if cookies:
        cookie_header = "; ".join(f"{k}={v}" for k, v in cookies.items())
        raw_headers.append((b"cookie", cookie_header.encode()))

    scope = {
        "type": "http",
        "headers": raw_headers,
        "app": None,
        "path": "/",
        "method": "GET",
        "query_string": b"",
        "client": ("test", 0),
        "server": ("test", 0),
        "scheme": "http",
        "root_path": "",
    }

    async def receive() -> dict:
        return {"type": "http.request"}

    return Request(scope, receive)


@pytest.mark.asyncio
async def test_get_bearer_token_header_priority():
    request = build_request(headers={"Authorization": "Bearer abc123"})
    assert get_bearer_token(request) == "abc123"


@pytest.mark.asyncio
async def test_get_bearer_token_cookie_fallback():
    request = build_request(cookies={"alnoor_token": "cookie-token"})
    assert get_bearer_token(request) == "cookie-token"


@pytest.mark.asyncio
async def test_get_current_user_success():
    await init_db()
    await seed_if_empty()
    token = create_access_token("admin")
    request = build_request(headers={"Authorization": f"Bearer {token}"})
    async for session in get_session():
        user = await get_current_user(request, session=session)
        assert user.username == "admin"
        break


@pytest.mark.asyncio
async def test_get_current_user_invalid_token():
    await init_db()
    request = build_request(headers={"Authorization": "Bearer invalid"})
    async for session in get_session():
        with pytest.raises(HTTPException) as exc:
            await get_current_user(request, session=session)
        assert exc.value.status_code == 401
        assert "Invalid token" in exc.value.detail
        break


@pytest.mark.asyncio
async def test_get_current_user_missing_token():
    request = build_request()
    async for session in get_session():
        with pytest.raises(HTTPException) as exc:
            await get_current_user(request, session=session)
        assert exc.value.status_code == 401
        assert exc.value.detail == "Not authenticated"
        break


@pytest.mark.asyncio
async def test_get_current_user_numeric_subject():
    await init_db()
    await seed_if_empty()
    async for session in get_session():
        admin = await session.execute(select(User).where(User.username == "admin"))
        admin_obj = admin.scalars().first()
        assert admin_obj is not None
        token = create_access_token(str(admin_obj.id))
        request = build_request(headers={"Authorization": f"Bearer {token}"})
        user = await get_current_user(request, session=session)
        assert user.id == admin_obj.id
        break


@pytest.mark.asyncio
async def test_get_current_user_unknown_numeric_subject():
    await init_db()
    token = create_access_token("999999")
    request = build_request(headers={"Authorization": f"Bearer {token}"})
    async for session in get_session():
        with pytest.raises(HTTPException) as exc:
            await get_current_user(request, session=session)
        assert exc.value.status_code == 401
        assert "Invalid token" in exc.value.detail
        break
