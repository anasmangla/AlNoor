import uuid

import httpx
import pytest
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.database import init_db, seed_if_empty


async def get_token(ac: AsyncClient) -> str:
    resp = await ac.post("/auth/login", json={"username": "admin", "password": "admin123"})
    assert resp.status_code == 200
    return resp.json()["access_token"]


async def create_product(ac: AsyncClient, headers: dict, **overrides) -> dict:
    payload = {
        "name": f"Order Test Product {uuid.uuid4().hex[:6]}",
        "price": 10.0,
        "stock": 5,
        "unit": "each",
        "is_weight_based": False,
        "image_url": "",
        "description": "Created for order tests",
    }
    payload.update(overrides)
    resp = await ac.post("/products", json=payload, headers=headers)
    assert resp.status_code == 201
    return resp.json()


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

        # Ensure plentiful stock via admin update
        token = await get_token(ac)
        headers = {"Authorization": f"Bearer {token}"}
        resp = await ac.put(
            f"/products/{pid}", headers=headers, json={"stock": 999, "price": products[0]["price"]}
        )
        assert resp.status_code == 200
        updated_product = resp.json()
        assert updated_product["stock"] >= 999

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
        assert order["status"] == "pending"
        assert order["fulfillment_method"] == "pickup"
        assert order["total_amount"] == pytest.approx(updated_product["price"])

        # Fetch the order by id (auth required)
        resp = await ac.get(f"/orders/{order_id}", headers=headers)
        assert resp.status_code == 200
        body = resp.json()
        assert body["id"] == order_id
        assert body["total_amount"] >= 0
        assert isinstance(body["items"], list) and len(body["items"]) == 1
        assert body["status"] == "pending"
        assert body["fulfillment_method"] == "pickup"
        assert body["items"][0]["subtotal"] == pytest.approx(order["total_amount"])
        created_at = body.get("created_at")

        # Update status
        resp = await ac.put(
            f"/orders/{order_id}",
            headers=headers,
            json={"status": "processing"},
        )
        assert resp.status_code == 200
        updated = resp.json()
        assert updated["status"] == "processing"
        assert updated["fulfillment_method"] == "pickup"

        # List orders for admin
        resp = await ac.get("/orders", headers=headers)
        assert resp.status_code == 200
        listed = resp.json()
        assert isinstance(listed, list) and len(listed) >= 1
        listed_order = next(o for o in listed if o["id"] == order_id)
        assert listed_order["status"] == "processing"
        assert listed_order["items"][0]["product_id"] == pid
        assert listed_order["items"][0]["quantity"] == pytest.approx(1)

        # Product stock should decrease after order creation
        resp = await ac.get(f"/products/{pid}")
        assert resp.status_code == 200
        after = resp.json()
        assert after["stock"] == pytest.approx(updated_product["stock"] - 1)

        # Listing with date filters
        resp = await ac.get("/orders", headers=headers, params={"start_date": "invalid", "end_date": "invalid"})
        assert resp.status_code == 200

        if created_at:
            resp = await ac.get(
                "/orders",
                headers=headers,
                params={"start_date": created_at, "end_date": created_at},
            )
            assert resp.status_code == 200
            filtered = resp.json()
            assert any(o["id"] == order_id for o in filtered)


@pytest.mark.asyncio
async def test_get_order_404():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        token = await get_token(ac)
        headers = {"Authorization": f"Bearer {token}"}
        resp = await ac.get("/orders/999999", headers=headers)
        assert resp.status_code == 404


@pytest.mark.asyncio
async def test_create_order_validation_errors():
    await init_db()
    await seed_if_empty()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Empty items rejected
        resp = await ac.post("/orders", json={"items": []})
        assert resp.status_code == 400
        assert resp.json()["detail"] == "No items"

        # Non-existent product rejected
        resp = await ac.post(
            "/orders",
            json={"items": [{"product_id": 987654, "quantity": 1}]},
        )
        assert resp.status_code == 404
        assert resp.json()["detail"] == "Product 987654 not found"

        token = await get_token(ac)
        headers = {"Authorization": f"Bearer {token}"}
        product_payload = {
            "name": f"Order Validation Product {uuid.uuid4().hex[:6]}",
            "price": 3.5,
            "stock": 2,
            "unit": "each",
            "is_weight_based": False,
            "image_url": "",
            "description": "Temporary product for order validation tests",
        }
        resp = await ac.post("/products", json=product_payload, headers=headers)
        assert resp.status_code == 201
        product = resp.json()
        product_id = product["id"]

        # Insufficient stock rejected
        resp = await ac.post(
            "/orders",
            json={"items": [{"product_id": product_id, "quantity": 5}]},
        )
        assert resp.status_code == 400
        assert resp.json()["detail"] == f"Insufficient stock for product {product_id}"

        # Invalid fulfillment method rejected by validation
        resp = await ac.post(
            "/orders",
            json={
                "items": [{"product_id": product_id, "quantity": 1}],
                "fulfillment_method": "drive_thru",
            },
        )
        assert resp.status_code == 422
        error = resp.json()
        assert error["detail"][0]["type"] == "literal_error"

        # Clean up
        resp = await ac.delete(f"/products/{product_id}", headers=headers)
        assert resp.status_code == 204


@pytest.mark.asyncio
async def test_create_order_pos_sets_processing():
    await init_db()
    await seed_if_empty()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        token = await get_token(ac)
        headers = {"Authorization": f"Bearer {token}"}
        product = await create_product(ac, headers, stock=3, price=7.5)

        resp = await ac.post(
            "/orders",
            json={
                "items": [{"product_id": product["id"], "quantity": 1}],
                "source": "pos",
            },
        )
        assert resp.status_code == 201
        order = resp.json()
        assert order["status"] == "processing"
        assert order["source"] == "pos"
        assert order["fulfillment_method"] == "pickup"
        assert order["total_amount"] == pytest.approx(product["price"])


@pytest.mark.asyncio
async def test_create_order_square_payment_success(monkeypatch):
    await init_db()
    await seed_if_empty()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        token = await get_token(ac)
        headers = {"Authorization": f"Bearer {token}"}
        product = await create_product(ac, headers, stock=6, price=15.25)

        called: dict[str, object] = {}

        class DummyResponse:
            def __init__(self, status_code: int, data: dict):
                self.status_code = status_code
                self._data = data

            def json(self) -> dict:
                return self._data

        class DummyClient:
            def __init__(self, *args, **kwargs):
                self.kwargs = kwargs

            async def __aenter__(self):
                return self

            async def __aexit__(self, exc_type, exc, tb):
                return False

            async def post(self, url, headers=None, json=None):
                called["url"] = url
                called["payload"] = json
                return DummyResponse(200, {"payment": {"status": "COMPLETED"}})

        monkeypatch.setenv("SQUARE_ACCESS_TOKEN", "token-123")
        monkeypatch.setenv("SQUARE_LOCATION_ID", "loc-123")
        monkeypatch.setenv("SQUARE_ENV", "sandbox")
        monkeypatch.setattr(httpx, "AsyncClient", DummyClient)

        resp = await ac.post(
            "/orders",
            json={
                "items": [{"product_id": product["id"], "quantity": 2}],
                "payment_token": "nonce-xyz",
                "fulfillment_method": "delivery",
                "source": "pos",
                "customer_name": "Square Buyer",
                "customer_email": "buyer@example.com",
            },
        )
        assert resp.status_code == 201
        order = resp.json()
        assert order["status"] == "paid"
        assert order["fulfillment_method"] == "delivery"
        assert order["total_amount"] == pytest.approx(product["price"] * 2)
        assert called["url"].startswith("https://connect.squareupsandbox.com")
        amount_money = called["payload"]["amount_money"]["amount"]
        assert amount_money == int(round(product["price"] * 2 * 100))


@pytest.mark.asyncio
async def test_create_order_square_payment_http_error(monkeypatch):
    await init_db()
    await seed_if_empty()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        token = await get_token(ac)
        headers = {"Authorization": f"Bearer {token}"}
        product = await create_product(ac, headers, stock=4, price=9.0)

        class ErrorResponse:
            def __init__(self, status_code: int, data: dict):
                self.status_code = status_code
                self._data = data

            def json(self):
                return self._data

        class ErrorClient:
            def __init__(self, *args, **kwargs):
                self.kwargs = kwargs

            async def __aenter__(self):
                return self

            async def __aexit__(self, exc_type, exc, tb):
                return False

            async def post(self, url, headers=None, json=None):
                return ErrorResponse(402, {"errors": [{"detail": "Card declined"}]})

        monkeypatch.setenv("SQUARE_ACCESS_TOKEN", "token-err")
        monkeypatch.setenv("SQUARE_LOCATION_ID", "loc-err")
        monkeypatch.setenv("SQUARE_ENV", "production")
        monkeypatch.setattr(httpx, "AsyncClient", ErrorClient)

        resp = await ac.post(
            "/orders",
            json={
                "items": [{"product_id": product["id"], "quantity": 1}],
                "payment_token": "nonce-err",
            },
        )
        assert resp.status_code == 400
        detail = resp.json()["detail"]
        assert "Payment failed" in detail

        resp = await ac.delete(f"/products/{product['id']}", headers=headers)
        assert resp.status_code == 204


@pytest.mark.asyncio
async def test_create_order_square_payment_exception(monkeypatch):
    await init_db()
    await seed_if_empty()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        token = await get_token(ac)
        headers = {"Authorization": f"Bearer {token}"}
        product = await create_product(ac, headers, stock=3, price=11.0)

        class ExplodingClient:
            def __init__(self, *args, **kwargs):
                self.kwargs = kwargs

            async def __aenter__(self):
                return self

            async def __aexit__(self, exc_type, exc, tb):
                return False

            async def post(self, url, headers=None, json=None):
                raise RuntimeError("square timeout")

        monkeypatch.setenv("SQUARE_ACCESS_TOKEN", "token-ex")
        monkeypatch.setenv("SQUARE_LOCATION_ID", "loc-ex")
        monkeypatch.setenv("SQUARE_ENV", "sandbox")
        monkeypatch.setattr(httpx, "AsyncClient", ExplodingClient)

        resp = await ac.post(
            "/orders",
            json={
                "items": [{"product_id": product["id"], "quantity": 1}],
                "payment_token": "nonce-ex",
            },
        )
        assert resp.status_code == 400
        assert resp.json()["detail"].startswith("Payment error: square timeout")

        resp = await ac.delete(f"/products/{product['id']}", headers=headers)
        assert resp.status_code == 204
