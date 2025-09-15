import pytest


@pytest.mark.asyncio
async def test_login_success(client):
    resp = await client.post(
        "/auth/login",
        json={"username": "admin", "password": "admin123"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data and data["access_token"]
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_login_failure(client):
    resp = await client.post(
        "/auth/login",
        json={"username": "admin", "password": "wrong"},
    )
    assert resp.status_code == 401
    body = resp.json()
    assert body["detail"] == "Invalid credentials"
