import uuid

import httpx
import pytest
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import init_db, seed_if_empty, SessionLocal
from app.models import Product as ProductModel, User as UserModel
from app.routes.orders import create_order, list_orders, get_order, update_order
from app.schemas import OrderCreate, OrderItemIn, OrderUpdate


@pytest.fixture
async def db_session():
    await init_db()
    await seed_if_empty()
    async with SessionLocal() as session:
        yield session


async def _make_product(session: AsyncSession, **overrides) -> ProductModel:
    product = ProductModel(
        name=f"Direct Order Product {uuid.uuid4().hex[:6]}",
        price=overrides.get("price", 5.0),
        stock=overrides.get("stock", 5),
        unit=overrides.get("unit", "each"),
        is_weight_based=overrides.get("is_weight_based", False),
        image_url=overrides.get("image_url", ""),
        description=overrides.get("description", ""),
    )
    session.add(product)
    await session.commit()
    await session.refresh(product)
    return product


async def _get_admin_user(session: AsyncSession) -> UserModel:
    result = await session.execute(select(UserModel))
    return result.scalars().first()


@pytest.mark.asyncio
async def test_create_order_direct_success(db_session):
    product = await _make_product(db_session, stock=4, price=8.5)
    user = await _get_admin_user(db_session)
    payload = OrderCreate(
        items=[OrderItemIn(product_id=product.id, quantity=2)],
        source="pos",
        customer_name="Direct Buyer",
    )

    order = await create_order(payload, session=db_session)
    assert order.status == "processing"
    assert order.total_amount == pytest.approx(product.price * 2)

    orders_list = await list_orders(user=user, session=db_session)
    assert any(o.id == order.id for o in orders_list)

    detail = await get_order(order.id, user=user, session=db_session)
    assert detail.id == order.id

    updated = await update_order(
        order.id,
        OrderUpdate(status="completed"),
        user=user,
        session=db_session,
    )
    assert updated.status == "completed"

    if detail.created_at:
        window = detail.created_at.isoformat()
        filtered = await list_orders(user=user, session=db_session, start_date=window, end_date=window)
        assert any(o.id == order.id for o in filtered)

    filtered = await list_orders(user=user, session=db_session, start_date="bad", end_date="bad")
    assert any(o.id == order.id for o in filtered)


@pytest.mark.asyncio
async def test_create_order_direct_errors(db_session):
    with pytest.raises(HTTPException) as exc:
        await create_order(OrderCreate(items=[], source="web"), session=db_session)
    assert exc.value.status_code == 400

    product = await _make_product(db_session, stock=1)

    with pytest.raises(HTTPException) as exc:
        await create_order(
            OrderCreate(items=[OrderItemIn(product_id=product.id + 999999, quantity=1)]),
            session=db_session,
        )
    assert exc.value.status_code == 404

    with pytest.raises(HTTPException) as exc:
        await create_order(
            OrderCreate(items=[OrderItemIn(product_id=product.id, quantity=5)]),
            session=db_session,
        )
    assert exc.value.status_code == 400
    assert f"Insufficient stock" in exc.value.detail


@pytest.mark.asyncio
async def test_create_order_square_payment_success_direct(db_session, monkeypatch):
    product = await _make_product(db_session, stock=3, price=15.5)

    called: dict = {}

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

    monkeypatch.setenv("SQUARE_ACCESS_TOKEN", "token-dir")
    monkeypatch.setenv("SQUARE_LOCATION_ID", "loc-dir")
    monkeypatch.setenv("SQUARE_ENV", "sandbox")
    monkeypatch.setattr(httpx, "AsyncClient", DummyClient)

    payload = OrderCreate(
        items=[OrderItemIn(product_id=product.id, quantity=1)],
        source="pos",
        fulfillment_method="delivery",
        payment_token="nonce-dir",
    )
    order = await create_order(payload, session=db_session)
    assert order.status == "paid"
    assert order.fulfillment_method == "delivery"
    assert called["url"].startswith("https://connect.squareupsandbox.com")
    assert called["payload"]["amount_money"]["amount"] == int(round(product.price * 100))


@pytest.mark.asyncio
async def test_create_order_square_payment_http_error_direct(db_session, monkeypatch):
    product = await _make_product(db_session, stock=2, price=9.0)

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

    monkeypatch.setenv("SQUARE_ACCESS_TOKEN", "token-http")
    monkeypatch.setenv("SQUARE_LOCATION_ID", "loc-http")
    monkeypatch.setenv("SQUARE_ENV", "production")
    monkeypatch.setattr(httpx, "AsyncClient", ErrorClient)

    with pytest.raises(HTTPException) as exc:
        await create_order(
            OrderCreate(items=[OrderItemIn(product_id=product.id, quantity=1)], payment_token="nonce-http"),
            session=db_session,
        )
    assert exc.value.status_code == 400
    assert "Payment failed" in exc.value.detail


@pytest.mark.asyncio
async def test_create_order_square_payment_exception_direct(db_session, monkeypatch):
    product = await _make_product(db_session, stock=2, price=11.0)

    class ExplodingClient:
        def __init__(self, *args, **kwargs):
            self.kwargs = kwargs

        async def __aenter__(self):
            return self

        async def __aexit__(self, exc_type, exc, tb):
            return False

        async def post(self, url, headers=None, json=None):
            raise RuntimeError("square timeout")

    monkeypatch.setenv("SQUARE_ACCESS_TOKEN", "token-exc")
    monkeypatch.setenv("SQUARE_LOCATION_ID", "loc-exc")
    monkeypatch.setenv("SQUARE_ENV", "sandbox")
    monkeypatch.setattr(httpx, "AsyncClient", ExplodingClient)

    with pytest.raises(HTTPException) as exc:
        await create_order(
            OrderCreate(items=[OrderItemIn(product_id=product.id, quantity=1)], payment_token="nonce-exc"),
            session=db_session,
        )
    assert exc.value.status_code == 400
    assert exc.value.detail.startswith("Payment error: square timeout")
