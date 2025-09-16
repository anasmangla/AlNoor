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
async def test_admin_metrics_requires_auth(client):
    # Create an order to ensure metrics have data
    products_resp = await client.get("/products")
    assert products_resp.status_code == 200
    products = products_resp.json()
    assert products, "Expected seeded products"
    product_id = products[0]["id"]

    token = await login_admin(client)
    headers = {"Authorization": f"Bearer {token}"}

    # Refill stock to avoid depletion across runs
    resp = await client.put(
        f"/products/{product_id}", headers=headers, json={"stock": 999, "price": products[0]["price"]}
    )
    assert resp.status_code == 200

    order_resp = await client.post(
        "/orders",
        json={"items": [{"product_id": product_id, "quantity": 1}]},
    )
    assert order_resp.status_code == 201

    # Unauthorized access denied
    resp = await client.get("/admin/metrics")
    assert resp.status_code == 401

    resp = await client.get("/admin/metrics", headers=headers)
    assert resp.status_code == 200
    metrics = resp.json()
    for key in [
        "orders_total",
        "revenue_total",
        "orders_today",
        "revenue_today",
        "orders_month",
        "revenue_month",
        "low_stock_threshold",
        "low_stock",
    ]:
        assert key in metrics
    assert metrics["orders_total"] >= 1
    assert isinstance(metrics["low_stock"], list)


@pytest.mark.asyncio
async def test_admin_metrics_custom_low_stock_window(client):
    token = await login_admin(client)
    headers = {"Authorization": f"Bearer {token}"}

    created_records = []
    try:
        for idx, stock in enumerate([0.2, 0.4, 0.6]):
            payload = {
                "name": f"Low Stock Item {uuid.uuid4().hex[:6]}-{idx}",
                "price": 3.5 + idx,
                "stock": stock,
                "unit": "each",
                "is_weight_based": False,
                "image_url": "",
                "description": "Low stock test item",
                "weight": 1.0,
                "cut_type": "Whole",
                "price_per_unit": 3.5 + idx,
                "origin": "Test Farm",
            }
            resp = await client.post("/products", json=payload, headers=headers)
            assert resp.status_code == 201
            body = resp.json()
            created_records.append({"id": body["id"], "stock": body["stock"]})

        metrics_resp = await client.get(
            "/admin/metrics",
            headers=headers,
            params={"low_stock_threshold": "1", "low_stock_limit": "2"},
        )
        assert metrics_resp.status_code == 200
        metrics = metrics_resp.json()

        assert metrics["low_stock_threshold"] == pytest.approx(1)
        assert len(metrics["low_stock"]) == 2
        assert all(item["stock"] <= 1 for item in metrics["low_stock"])

        expected_ids = [
            record["id"]
            for record in sorted(created_records, key=lambda item: item["stock"])[:2]
        ]
        returned_ids = [item["id"] for item in metrics["low_stock"]]
        assert returned_ids == expected_ids
    finally:
        for record in created_records:
            resp = await client.delete(f"/products/{record['id']}", headers=headers)
            assert resp.status_code in {204, 404}
