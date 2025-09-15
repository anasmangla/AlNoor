import uuid

import pytest


async def login_admin(client):
    resp = await client.post(
        "/auth/login",
        json={"username": "admin", "password": "admin123"},
    )
    assert resp.status_code == 200
    return resp.json()["access_token"]


@pytest.mark.asyncio
async def test_contact_create_list_delete(client):
    unique_email = f"integration-{uuid.uuid4().hex[:8]}@example.com"
    payload = {
        "name": "Integration Tester",
        "email": unique_email,
        "message": "Checking contact endpoint",
    }

    resp = await client.post("/contact", json=payload)
    assert resp.status_code == 201
    created = resp.json()
    message_id = created["id"]
    assert created["email"] == unique_email

    # Unauthorized admin list is rejected
    resp = await client.get("/admin/messages")
    assert resp.status_code == 401

    token = await login_admin(client)
    headers = {"Authorization": f"Bearer {token}"}

    resp = await client.get("/admin/messages", headers=headers)
    assert resp.status_code == 200
    messages = resp.json()
    assert any(m["id"] == message_id for m in messages)

    resp = await client.delete(f"/admin/messages/{message_id}", headers=headers)
    assert resp.status_code == 204

    # Deleting again should yield not found
    resp = await client.delete(f"/admin/messages/{message_id}", headers=headers)
    assert resp.status_code == 404

    resp = await client.get("/admin/messages", headers=headers)
    ids = [m["id"] for m in resp.json()]
    assert message_id not in ids


@pytest.mark.asyncio
async def test_contact_invalid_email_validation(client):
    resp = await client.post(
        "/contact",
        json={"name": "Invalid", "email": "not-an-email", "message": "Hello"},
    )
    assert resp.status_code == 422
