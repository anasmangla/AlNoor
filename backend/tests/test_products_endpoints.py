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
        "weight": 5.25,
        "cut_type": "Whole bird",
        "price_per_unit": 3.81,
        "origin": "Test Farm",
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
    assert created["weight"] == pytest.approx(payload["weight"])
    assert created["cut_type"] == payload["cut_type"]
    assert created["price_per_unit"] == pytest.approx(payload["price_per_unit"])
    assert created["origin"] == payload["origin"]
    assert created["stock_status"] == "in_stock"
    assert created["stock_status_label"] == "In stock"
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
        json={
            "price": 21.5,
            "stock": 8,
            "weight": 6.0,
            "cut_type": "Halved",
            "price_per_unit": 3.58,
            "origin": "Updated Farm",
        },
        headers=headers,
    )
    assert resp.status_code == 200
    updated = resp.json()
    assert updated["price"] == pytest.approx(21.5)
    assert updated["stock"] == pytest.approx(8)
    assert updated["weight"] == pytest.approx(6.0)
    assert updated["cut_type"] == "Halved"
    assert updated["price_per_unit"] == pytest.approx(3.58)
    assert updated["origin"] == "Updated Farm"
    assert updated["stock_status"] == "in_stock"
    assert updated["backorder_available"] is False

    # Fetch by id
    resp = await client.get(f"/products/{product_id}")
    assert resp.status_code == 200
    fetched = resp.json()
    assert fetched["id"] == product_id
    assert fetched["stock_status"] in {"in_stock", "low_stock", "out_of_stock"}
    assert isinstance(fetched["stock_status_label"], str) and fetched["stock_status_label"]

    resp = await client.get("/products")
    assert resp.status_code == 200
    listing = resp.json()
    entry = next(p for p in listing if p["id"] == product_id)
    assert entry["stock_status"] == fetched["stock_status"]
    assert entry["stock_status_label"]

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


@pytest.mark.asyncio
async def test_product_stock_status_transitions(client):
    token = await login_admin(client)
    headers = {"Authorization": f"Bearer {token}"}

    payload = {
        "name": f"Low Stock Product {uuid.uuid4().hex[:6]}",
        "price": 5.0,
        "stock": 4,
        "unit": "each",
        "is_weight_based": False,
        "image_url": "",
        "description": "Created for stock status test",
    }

    resp = await client.post("/products", json=payload, headers=headers)
    assert resp.status_code == 201
    product = resp.json()
    product_id = product["id"]
    assert product["stock_status"] == "low_stock"
    assert product["backorder_available"] is False

    resp = await client.put(
        f"/products/{product_id}",
        json={"stock": 0},
        headers=headers,
    )
    assert resp.status_code == 200
    updated = resp.json()
    assert updated["stock_status"] == "out_of_stock"
    assert updated["backorder_available"] is True

    resp = await client.get(f"/products/{product_id}")
    assert resp.status_code == 200
    fetched = resp.json()
    assert fetched["stock_status_label"] == "Out of stock"
    assert fetched["backorder_available"] is True

    resp = await client.delete(f"/products/{product_id}", headers=headers)
    assert resp.status_code == 204
