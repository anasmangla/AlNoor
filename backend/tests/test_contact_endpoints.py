import uuid

from typing import List

import pytest


class _DummySMTP:
    def __init__(self, host: str, port: int, timeout: int = 10) -> None:
        self.host = host
        self.port = port
        self.timeout = timeout
        self.starttls_called = False
        self.login_args: List[str] | None = None
        self.sent_message = None

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False

    def starttls(self) -> None:
        self.starttls_called = True

    def login(self, username: str, password: str) -> None:
        self.login_args = [username, password]

    def send_message(self, message) -> None:
        self.sent_message = message


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


@pytest.mark.asyncio
async def test_contact_rate_limiting_enforced(client):
    payload = {
        "name": "Limiter",
        "email": "limit@example.com",
        "message": "Please respond",
    }

    for _ in range(3):
        resp = await client.post("/contact", json=payload)
        assert resp.status_code == 201

    resp = await client.post("/contact", json=payload)
    assert resp.status_code == 429
    assert resp.json()["detail"] == "Too many messages, please try later"


@pytest.mark.asyncio
async def test_contact_email_notification_branch(client, monkeypatch):
    monkeypatch.setenv("SMTP_HOST", "smtp.test")
    monkeypatch.setenv("CONTACT_TO", "owner@example.com")
    monkeypatch.setenv("SMTP_USER", "notifier@test")
    monkeypatch.setenv("SMTP_PASS", "secret")
    monkeypatch.setenv("SMTP_PORT", "2525")
    monkeypatch.setenv("SMTP_TLS", "true")

    instances: List[_DummySMTP] = []

    def _factory(host: str, port: int, timeout: int = 10) -> _DummySMTP:
        smtp = _DummySMTP(host, port, timeout)
        instances.append(smtp)
        return smtp

    monkeypatch.setattr("app.routes.contact.smtplib.SMTP", _factory)

    resp = await client.post(
        "/contact",
        json={
            "name": "Email Branch",
            "email": "notify@example.com",
            "message": "Trigger email",
        },
    )
    assert resp.status_code == 201

    # Ensure the dummy SMTP class captured the expected interactions
    assert instances, "Expected the SMTP factory to be invoked"
    dummy = instances[-1]
    assert dummy.host == "smtp.test"
    assert dummy.port == 2525
    assert dummy.starttls_called is True
    assert dummy.login_args == ["notifier@test", "secret"]
    assert dummy.sent_message is not None
