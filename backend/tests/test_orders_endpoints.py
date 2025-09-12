import pytest
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.database import init_db, seed_if_empty


async def get_token(ac: AsyncClient) -> str:
    resp = await ac.post("/auth/login", json={"username": "admin", "password": "admin123"})
    assert resp.status_code == 200
    return resp.json()["access_token"]


@pytest.mark.asyncio
async def test_get_and_update_order_flow():
    await init_db()
    await seed_if_empty()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Get a product to order
        resp = await ac.get("/products")
        assert resp.status_code == 200
        products = resp.json()
        assert isinstance(products, list) and len(products) > 0
        pid = products[0]["id"]

        # Create an order (no auth required)
        resp = await ac.post(
            "/orders",
            json={
                "items": [{"product_id": pid, "quantity": 1}],
                "source": "web",
            },
        )
        assert resp.status_code == 201
        order = resp.json()
        order_id = order["id"]

        # Admin token
        token = await get_token(ac)
        headers = {"Authorization": f"Bearer {token}"}

        # Fetch the order by id (auth required)
        resp = await ac.get(f"/orders/{order_id}", headers=headers)
        assert resp.status_code == 200
        body = resp.json()
        assert body["id"] == order_id
        assert body["total_amount"] >= 0
        assert isinstance(body["items"], list) and len(body["items"]) == 1

        # Update status
        resp = await ac.put(
            f"/orders/{order_id}",
            headers=headers,
            json={"status": "processing"},
        )
        assert resp.status_code == 200
        updated = resp.json()
        assert updated["status"] == "processing"


@pytest.mark.asyncio
async def test_get_order_404():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        token = await get_token(ac)
        headers = {"Authorization": f"Bearer {token}"}
        resp = await ac.get("/orders/999999", headers=headers)
        assert resp.status_code == 404

