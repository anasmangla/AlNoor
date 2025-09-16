import pytest
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.database import init_db, seed_if_empty


async def get_token(ac: AsyncClient) -> str:
    resp = await ac.post("/auth/login", json={"username": "admin", "password": "admin123"})
    assert resp.status_code == 200
    return resp.json()["access_token"]


@pytest.mark.asyncio
async def test_pos_checkout_succeeds():
    await init_db()
    await seed_if_empty()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        token = await get_token(ac)
        headers = {"Authorization": f"Bearer {token}"}

        resp = await ac.get("/products", headers=headers)
        assert resp.status_code == 200
        products = resp.json()
        assert isinstance(products, list) and len(products) > 0
        product_id = products[0]["id"]

        resp = await ac.post(
            "/pos/checkout",
            headers=headers,
            json={
                "items": [{"product_id": product_id, "quantity": 1}],
                "customer_name": "POS Tester",
            },
        )
        assert resp.status_code == 200
        body = resp.json()
        assert body["source"] == "pos"
        assert body["total_amount"] > 0
        assert isinstance(body["items"], list) and len(body["items"]) == 1
        assert body["items"][0]["product_id"] == product_id
        assert body["fulfillment_method"] == "pickup"
