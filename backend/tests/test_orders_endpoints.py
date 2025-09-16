import pytest
from fastapi import HTTPException
from httpx import AsyncClient, ASGITransport
from sqlalchemy import select

import httpx

from app.main import app
from app.database import get_session, init_db, seed_if_empty
from app.models import Product as ProductModel, User
from app.routes import orders as orders_routes
from app.schemas import OrderCreate, OrderItemIn, OrderUpdate


async def get_token(ac: AsyncClient) -> str:
    resp = await ac.post("/auth/login", json={"username": "admin", "password": "admin123"})
    assert resp.status_code == 200
    return resp.json()["access_token"]


async def _ensure_seed_product(session):
    result = await session.execute(select(ProductModel))
    product = result.scalars().first()
    assert product is not None
    product.stock = max(float(getattr(product, "stock", 0.0)), 1000.0)
    session.add(product)
    await session.commit()
    await session.refresh(product)
    return product


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

        # Fetch the order by id (auth required)
        resp = await ac.get(f"/orders/{order_id}", headers=headers)
        assert resp.status_code == 200
        body = resp.json()
        assert body["id"] == order_id
        assert body["total_amount"] >= 0
        assert isinstance(body["items"], list) and len(body["items"]) == 1
        assert body["status"] == "pending"
        assert body["fulfillment_method"] == "pickup"

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


@pytest.mark.asyncio
async def test_get_order_404():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        token = await get_token(ac)
        headers = {"Authorization": f"Bearer {token}"}
        resp = await ac.get("/orders/999999", headers=headers)
        assert resp.status_code == 404


@pytest.mark.asyncio
async def test_create_order_requires_items(client: AsyncClient):
    resp = await client.post("/orders", json={"items": []})
    assert resp.status_code == 400
    body = resp.json()
    assert body["detail"] == "No items"


@pytest.mark.asyncio
async def test_create_order_missing_product(client: AsyncClient):
    resp = await client.get("/products")
    assert resp.status_code == 200
    products = resp.json()
    assert products, "Seed products expected"
    missing_id = max(p["id"] for p in products) + 1000

    resp = await client.post(
        "/orders",
        json={"items": [{"product_id": missing_id, "quantity": 1}]},
    )
    assert resp.status_code == 404
    assert "not found" in resp.json()["detail"].lower()


@pytest.mark.asyncio
async def test_create_order_insufficient_stock(client: AsyncClient):
    products_resp = await client.get("/products")
    assert products_resp.status_code == 200
    products = products_resp.json()
    product = next(p for p in products if p["stock"] > 0)

    resp = await client.post(
        "/orders",
        json={
            "items": [
                {
                    "product_id": product["id"],
                    "quantity": float(product["stock"]) + 1000.0,
                }
            ]
        },
    )
    assert resp.status_code == 400
    assert "insufficient stock" in resp.json()["detail"].lower()


@pytest.mark.asyncio
async def test_create_order_pos_delivery_flow(client: AsyncClient):
    products_resp = await client.get("/products")
    assert products_resp.status_code == 200
    products = products_resp.json()
    product = next(p for p in products if p["stock"] >= 1)

    resp = await client.post(
        "/orders",
        json={
            "items": [{"product_id": product["id"], "quantity": 1}],
            "source": "POS",
            "fulfillment_method": "delivery",
            "customer_name": "Delivery Tester",
            "customer_email": "delivery@example.com",
        },
    )
    assert resp.status_code == 201
    created = resp.json()
    assert created["status"] == "processing"
    assert created["fulfillment_method"] == "delivery"
    assert created["source"] == "pos"
    assert created["customer_name"] == "Delivery Tester"
    assert created["customer_email"] == "delivery@example.com"


@pytest.mark.asyncio
async def test_list_orders_requires_auth(client: AsyncClient):
    resp = await client.get("/orders")
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_list_orders_with_auth(client: AsyncClient):
    products_resp = await client.get("/products")
    assert products_resp.status_code == 200
    products = products_resp.json()
    product = next(p for p in products if p["stock"] >= 1)

    create_resp = await client.post(
        "/orders",
        json={"items": [{"product_id": product["id"], "quantity": 1}]},
    )
    assert create_resp.status_code == 201
    order_id = create_resp.json()["id"]

    token = await get_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    list_resp = await client.get("/orders", headers=headers)
    assert list_resp.status_code == 200
    orders = list_resp.json()
    assert any(o["id"] == order_id for o in orders)
    assert all("items" in o for o in orders)


@pytest.mark.asyncio
async def test_get_order_requires_auth(client: AsyncClient):
    products_resp = await client.get("/products")
    products = products_resp.json()
    product = next(p for p in products if p["stock"] >= 1)
    order_resp = await client.post(
        "/orders",
        json={"items": [{"product_id": product["id"], "quantity": 1}]},
    )
    assert order_resp.status_code == 201
    order_id = order_resp.json()["id"]

    resp = await client.get(f"/orders/{order_id}")
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_update_order_not_found(client: AsyncClient):
    token = await get_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    resp = await client.put(
        "/orders/0",
        headers=headers,
        json={"status": "cancelled"},
    )
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_create_order_square_payment_failure_direct(monkeypatch):
    await init_db()
    await seed_if_empty()
    async for session in get_session():
        product = await _ensure_seed_product(session)

        class FailingClient:
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
                        return {"errors": ["declined"]}

                return Resp()

        monkeypatch.setenv("SQUARE_ACCESS_TOKEN", "token")
        monkeypatch.setenv("SQUARE_LOCATION_ID", "location")
        monkeypatch.setenv("SQUARE_ENV", "sandbox")
        monkeypatch.setattr(httpx, "AsyncClient", FailingClient)

        payload = OrderCreate(
            items=[OrderItemIn(product_id=product.id, quantity=1)],
            payment_token="nonce",
            source="web",
        )

        with pytest.raises(HTTPException) as exc:
            await orders_routes.create_order(payload, session=session)
        assert exc.value.status_code == 400
        assert "payment failed" in exc.value.detail.lower()
        break


@pytest.mark.asyncio
async def test_create_order_square_payment_success_direct(monkeypatch):
    await init_db()
    await seed_if_empty()
    async for session in get_session():
        product = await _ensure_seed_product(session)

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
                        return {"payment": "ok"}

                return Resp()

        monkeypatch.setenv("SQUARE_ACCESS_TOKEN", "token")
        monkeypatch.setenv("SQUARE_LOCATION_ID", "location")
        monkeypatch.setenv("SQUARE_ENV", "sandbox")
        monkeypatch.setattr(httpx, "AsyncClient", SuccessClient)

        payload = OrderCreate(
            items=[OrderItemIn(product_id=product.id, quantity=1)],
            payment_token="nonce",
            source="web",
        )

        created = await orders_routes.create_order(payload, session=session)
        assert created.status == "paid"
        assert created.total_amount > 0
        assert created.fulfillment_method == "pickup"
        break


@pytest.mark.asyncio
async def test_create_order_square_payment_exception_direct(monkeypatch):
    await init_db()
    await seed_if_empty()
    async for session in get_session():
        product = await _ensure_seed_product(session)

        class ErrorClient:
            def __init__(self, *args, **kwargs):
                pass

            async def __aenter__(self):
                return self

            async def __aexit__(self, exc_type, exc, tb):
                return False

            async def post(self, *args, **kwargs):
                raise RuntimeError("boom")

        monkeypatch.setenv("SQUARE_ACCESS_TOKEN", "token")
        monkeypatch.setenv("SQUARE_LOCATION_ID", "location")
        monkeypatch.setenv("SQUARE_ENV", "sandbox")
        monkeypatch.setattr(httpx, "AsyncClient", ErrorClient)

        payload = OrderCreate(
            items=[OrderItemIn(product_id=product.id, quantity=1)],
            payment_token="nonce",
            source="web",
        )

        with pytest.raises(HTTPException) as exc:
            await orders_routes.create_order(payload, session=session)
        assert exc.value.status_code == 400
        assert "payment error" in exc.value.detail.lower()
        break


@pytest.mark.asyncio
async def test_list_orders_filters_direct():
    await init_db()
    await seed_if_empty()
    async for session in get_session():
        product = await _ensure_seed_product(session)
        payload = OrderCreate(
            items=[OrderItemIn(product_id=product.id, quantity=1)],
            source="web",
        )
        created = await orders_routes.create_order(payload, session=session)
        admin_user = (
            await session.execute(select(User).where(User.username == "admin"))
        ).scalars().first()
        assert admin_user is not None

        results = await orders_routes.list_orders(
            user=admin_user,
            session=session,
            start_date="2000-01-01",
            end_date="2100-01-01",
        )
        assert any(o.id == created.id for o in results)

        results_invalid = await orders_routes.list_orders(
            user=admin_user,
            session=session,
            start_date="invalid",
            end_date="invalid",
        )
        assert results_invalid
        break


@pytest.mark.asyncio
async def test_update_order_direct_success():
    await init_db()
    await seed_if_empty()
    async for session in get_session():
        product = await _ensure_seed_product(session)
        created = await orders_routes.create_order(
            OrderCreate(
                items=[OrderItemIn(product_id=product.id, quantity=1)],
                source="pos",
            ),
            session=session,
        )
        admin_user = (
            await session.execute(select(User).where(User.username == "admin"))
        ).scalars().first()
        assert admin_user is not None

        updated = await orders_routes.update_order(
            created.id,
            OrderUpdate(status="completed"),
            user=admin_user,
            session=session,
        )
        assert updated.status == "completed"
        assert updated.source == "pos"
        break

