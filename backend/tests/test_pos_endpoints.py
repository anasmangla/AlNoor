import pytest

import httpx

from app.database import get_session
from app.routes import orders as orders_routes
from app.routes import pos as pos_routes


async def login_admin(client):
    resp = await client.post(
        "/auth/login",
        json={"username": "admin", "password": "admin123"},
    )
    assert resp.status_code == 200
    return resp.json()["access_token"]


@pytest.mark.asyncio
async def test_pos_checkout_flow(client, monkeypatch):
    resp = await client.get("/products")
    assert resp.status_code == 200
    products = resp.json()
    assert products, "Seeded products expected"
    product_id = products[0]["id"]

    checkout_body = {
        "items": [{"product_id": product_id, "quantity": 1}],
        "customer_name": "POS Tester",
    }

    # Unauthorized attempt
    resp = await client.post("/pos/checkout", json=checkout_body)
    assert resp.status_code == 401

    token = await login_admin(client)
    headers = {"Authorization": f"Bearer {token}"}

    # Ensure stock replenished before checkout
    resp = await client.put(
        f"/products/{product_id}", headers=headers, json={"stock": 999, "price": products[0]["price"]}
    )
    assert resp.status_code == 200

    async def create_order_with_real_session(payload):
        async for session in get_session():
            return await orders_routes.create_order(payload, session=session)

    monkeypatch.setattr(pos_routes, "create_order", create_order_with_real_session)

    # Successful checkout
    resp = await client.post("/pos/checkout", json=checkout_body, headers=headers)
    assert resp.status_code == 200
    order = resp.json()
    assert order["source"] == "pos"
    assert order["status"] in {"paid", "processing", "completed"}
    assert len(order["items"]) == 1

    # Invalid product id should fail
    resp = await client.post(
        "/pos/checkout",
        json={"items": [{"product_id": 999999, "quantity": 1}]},
        headers=headers,
    )
    assert resp.status_code == 404
    body = resp.json()
    assert "not found" in body["detail"].lower()


@pytest.mark.asyncio
async def test_terminal_checkout_simulated(client):
    token = await login_admin(client)
    headers = {"Authorization": f"Bearer {token}"}
    resp = await client.post(
        "/pos/terminal/checkout",
        json={"amount_cents": 500},
        headers=headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "PENDING"
    assert data["checkout_id"]


@pytest.mark.asyncio
async def test_terminal_checkout_http_error(client, monkeypatch):
    token = await login_admin(client)
    headers = {"Authorization": f"Bearer {token}"}
    monkeypatch.setenv("SQUARE_ACCESS_TOKEN", "token")
    monkeypatch.setenv("SQUARE_LOCATION_ID", "location")

    class ErrorClient:
        def __init__(self, *args, **kwargs):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, exc_type, exc, tb):
            return False

        async def post(self, *args, **kwargs):
            class Resp:
                status_code = 400

                def json(self):
                    return {"errors": ["failure"]}

            return Resp()

    monkeypatch.setattr(pos_routes, "httpx", httpx)
    monkeypatch.setattr(pos_routes.httpx, "AsyncClient", ErrorClient)

    resp = await client.post(
        "/pos/terminal/checkout",
        json={"amount_cents": 500, "device_id": "dev-1"},
        headers=headers,
    )
    assert resp.status_code == 400
    assert "Terminal create failed" in resp.json()["detail"]


@pytest.mark.asyncio
async def test_terminal_checkout_success(client, monkeypatch):
    token = await login_admin(client)
    headers = {"Authorization": f"Bearer {token}"}
    monkeypatch.setenv("SQUARE_ACCESS_TOKEN", "token")
    monkeypatch.setenv("SQUARE_LOCATION_ID", "location")

    class SuccessClient:
        def __init__(self, *args, **kwargs):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, exc_type, exc, tb):
            return False

        async def post(self, *args, **kwargs):
            class Resp:
                status_code = 200

                def json(self):
                    return {
                        "checkout": {
                            "id": "chk_123",
                            "status": "IN_PROGRESS",
                            "device_checkout_options": {"device_id": "dev-1"},
                        }
                    }

            return Resp()

    monkeypatch.setattr(pos_routes.httpx, "AsyncClient", SuccessClient)

    resp = await client.post(
        "/pos/terminal/checkout",
        json={"amount_cents": 500, "reference_id": "Ref"},
        headers=headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["checkout_id"] == "chk_123"
    assert data["status"] == "IN_PROGRESS"
    assert data["url"] == "dev-1"


@pytest.mark.asyncio
async def test_poll_terminal_checkout_simulated(client):
    token = await login_admin(client)
    headers = {"Authorization": f"Bearer {token}"}
    resp = await client.get("/pos/terminal/checkout/demo", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "COMPLETED"


@pytest.mark.asyncio
async def test_poll_terminal_checkout_success_and_fallback(client, monkeypatch):
    token = await login_admin(client)
    headers = {"Authorization": f"Bearer {token}"}
    monkeypatch.setenv("SQUARE_ACCESS_TOKEN", "token")

    class PollClient:
        def __init__(self, *args, **kwargs):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, exc_type, exc, tb):
            return False

        async def get(self, *args, **kwargs):
            class Resp:
                status_code = 200

                def json(self):
                    return {"checkout": {"id": "chk_789", "status": "COMPLETED"}}

            return Resp()

    monkeypatch.setattr(pos_routes.httpx, "AsyncClient", PollClient)

    resp = await client.get("/pos/terminal/checkout/abc", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["status"] == "COMPLETED"

    class ErrorClient:
        def __init__(self, *args, **kwargs):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, exc_type, exc, tb):
            return False

        async def get(self, *args, **kwargs):
            raise RuntimeError("network error")

    monkeypatch.setattr(pos_routes.httpx, "AsyncClient", ErrorClient)

    resp = await client.get("/pos/terminal/checkout/abc", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["status"] == "COMPLETED"
