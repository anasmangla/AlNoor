import pytest

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
