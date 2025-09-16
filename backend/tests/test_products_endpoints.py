import uuid

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
    assert created["stock_status"] == "in_stock"
    assert created["backorder_available"] is False

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
    assert updated["stock_status"] == "in_stock"
    assert updated["backorder_available"] is False

    # Set stock to zero to enable backorders
    resp = await client.put(
        f"/products/{product_id}",
        json={"stock": 0},
        headers=headers,
    )
    assert resp.status_code == 200
    zeroed = resp.json()
    assert zeroed["stock_status"] == "out_of_stock"
    assert zeroed["backorder_available"] is True

    # Create backorder request
    resp = await client.post(
        f"/products/{product_id}/backorder",
        json={"email": "reserve@example.com", "name": "Reserve", "quantity": 2},
    )
    assert resp.status_code == 201
    backorder = resp.json()
    assert backorder["product_id"] == product_id
    assert backorder["status"] == "pending"

    # Duplicate request within window should be rejected
    resp = await client.post(
        f"/products/{product_id}/backorder",
        json={"email": "reserve@example.com"},
    )
    assert resp.status_code == 400

    # Restock and ensure backorder endpoint is disabled
    resp = await client.put(
        f"/products/{product_id}",
        json={"stock": 3},
        headers=headers,
    )
    assert resp.status_code == 200
    restocked = resp.json()
    assert restocked["stock_status"] == "low_stock"
    assert restocked["backorder_available"] is False

    resp = await client.post(
        f"/products/{product_id}/backorder",
        json={"email": "another@example.com"},
    )
    assert resp.status_code == 400

    # Fetch by id
    resp = await client.get(f"/products/{product_id}")
    assert resp.status_code == 200
    fetched = resp.json()
    assert fetched["id"] == product_id
    assert fetched["stock_status"] in {"in_stock", "low_stock", "out_of_stock"}

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
