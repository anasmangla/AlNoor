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
async def test_product_crud_flow(client):
    unique_name = f"Integration Product {uuid.uuid4().hex[:8]}"
    payload = {
        "name": unique_name,
        "price": 19.99,
        "stock": 12,
        "unit": "each",
        "is_weight_based": False,
        "image_url": "",
        "description": "Created during integration test",
    }

    # Unauthorized create should fail
    resp = await client.post("/products", json=payload)
    assert resp.status_code == 401

    token = await login_admin(client)
    headers = {"Authorization": f"Bearer {token}"}

    # Create
    resp = await client.post("/products", json=payload, headers=headers)
    assert resp.status_code == 201
    created = resp.json()
    product_id = created["id"]
    assert created["name"] == payload["name"]
    assert created["price"] == pytest.approx(payload["price"])
    assert created["stock"] == pytest.approx(payload["stock"])

    # Validation error on update
    resp = await client.put(
        f"/products/{product_id}",
        json={"price": -1},
        headers=headers,
    )
    assert resp.status_code == 422

    # Successful update
    resp = await client.put(
        f"/products/{product_id}",
        json={"price": 21.5, "stock": 8},
        headers=headers,
    )
    assert resp.status_code == 200
    updated = resp.json()
    assert updated["price"] == pytest.approx(21.5)
    assert updated["stock"] == pytest.approx(8)

    # Fetch by id
    resp = await client.get(f"/products/{product_id}")
    assert resp.status_code == 200
    fetched = resp.json()
    assert fetched["id"] == product_id

    # Delete and verify removal
    resp = await client.delete(f"/products/{product_id}", headers=headers)
    assert resp.status_code == 204

    resp = await client.get(f"/products/{product_id}")
    assert resp.status_code == 404

    resp = await client.delete(f"/products/{product_id}", headers=headers)
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_get_missing_product(client):
    resp = await client.get("/products/999999")
    assert resp.status_code == 404
    body = resp.json()
    assert body["detail"] == "Product not found"
