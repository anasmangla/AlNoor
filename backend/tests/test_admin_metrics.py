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
