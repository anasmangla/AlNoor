import uuid

import httpx
import pytest
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import init_db, seed_if_empty, SessionLocal
from app.models import Product as ProductModel, User as UserModel
from app.routes.pos import (
    TerminalCheckoutRequest,
    create_terminal_checkout,
    poll_terminal_checkout,
    pos_checkout,
)
from app.schemas import OrderCreate, OrderItemIn


@pytest.fixture
async def db_session():
    await init_db()
    await seed_if_empty()
    async with SessionLocal() as session:
        yield session


async def _get_admin_user(session: AsyncSession) -> UserModel:
    result = await session.execute(select(UserModel))
    return result.scalars().first()


async def _make_product(session: AsyncSession, **overrides) -> ProductModel:
    product = ProductModel(
        name=f"POS Logic Product {uuid.uuid4().hex[:6]}",
        price=overrides.get("price", 7.5),
        stock=overrides.get("stock", 5),
        unit=overrides.get("unit", "each"),
    )
    session.add(product)
    await session.commit()
    await session.refresh(product)
    return product


@pytest.mark.asyncio
async def test_pos_checkout_forces_pos_source(db_session):
    user = await _get_admin_user(db_session)
    product = await _make_product(db_session, stock=5)
    payload = OrderCreate(items=[OrderItemIn(product_id=product.id, quantity=1)], source="web")

    order = await pos_checkout(payload, session=db_session, user=user)
    assert order.source == "pos"
    assert order.status in {"processing", "paid"}


@pytest.mark.asyncio
async def test_create_terminal_checkout_simulated(db_session, monkeypatch):
    user = await _get_admin_user(db_session)
    payload = TerminalCheckoutRequest(amount_cents=500, device_id="dev-1", reference_id="ref-123")

    monkeypatch.delenv("SQUARE_ACCESS_TOKEN", raising=False)
    monkeypatch.delenv("SQUARE_LOCATION_ID", raising=False)

    resp = await create_terminal_checkout(payload, user=user)
    assert resp.status == "PENDING"
    assert resp.checkout_id


@pytest.mark.asyncio
async def test_create_terminal_checkout_success(db_session, monkeypatch):
    user = await _get_admin_user(db_session)
    payload = TerminalCheckoutRequest(amount_cents=825, device_id="dev-2", reference_id="Order 123")

    class DummyResponse:
        def __init__(self, status_code: int, data: dict):
            self.status_code = status_code
            self._data = data

        def json(self):
            return self._data

    class DummyClient:
        def __init__(self, *args, **kwargs):
            self.kwargs = kwargs

        async def __aenter__(self):
            return self

        async def __aexit__(self, exc_type, exc, tb):
            return False

        async def post(self, url, headers=None, json=None):
            DummyClient.last_request = {"url": url, "json": json}
            return DummyResponse(200, {"checkout": {"id": "chk-1", "status": "IN_PROGRESS", "device_checkout_options": {"device_id": "url"}}})

    monkeypatch.setenv("SQUARE_ACCESS_TOKEN", "token-pos")
    monkeypatch.setenv("SQUARE_LOCATION_ID", "loc-pos")
    monkeypatch.setenv("SQUARE_ENV", "sandbox")
    monkeypatch.setattr(httpx, "AsyncClient", DummyClient)

    resp = await create_terminal_checkout(payload, user=user)
    assert resp.checkout_id == "chk-1"
    assert resp.status == "IN_PROGRESS"
    assert DummyClient.last_request["json"]["order"]["line_items"][0]["base_price_money"]["amount"] == 825


@pytest.mark.asyncio
async def test_create_terminal_checkout_http_error(db_session, monkeypatch):
    user = await _get_admin_user(db_session)
    payload = TerminalCheckoutRequest(amount_cents=600)

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
            return ErrorResponse(402, {"errors": [{"detail": "Declined"}]})

    monkeypatch.setenv("SQUARE_ACCESS_TOKEN", "token-pos")
    monkeypatch.setenv("SQUARE_LOCATION_ID", "loc-pos")
    monkeypatch.setenv("SQUARE_ENV", "production")
    monkeypatch.setattr(httpx, "AsyncClient", ErrorClient)

    with pytest.raises(HTTPException) as exc:
        await create_terminal_checkout(payload, user=user)
    assert exc.value.status_code == 400
    assert "Terminal create failed" in exc.value.detail


@pytest.mark.asyncio
async def test_create_terminal_checkout_exception_fallback(db_session, monkeypatch):
    user = await _get_admin_user(db_session)
    payload = TerminalCheckoutRequest(amount_cents=700)

    class ExplodingClient:
        def __init__(self, *args, **kwargs):
            self.kwargs = kwargs

        async def __aenter__(self):
            return self

        async def __aexit__(self, exc_type, exc, tb):
            return False

        async def post(self, url, headers=None, json=None):
            raise RuntimeError("network error")

    monkeypatch.setenv("SQUARE_ACCESS_TOKEN", "token-pos")
    monkeypatch.setenv("SQUARE_LOCATION_ID", "loc-pos")
    monkeypatch.setattr(httpx, "AsyncClient", ExplodingClient)

    resp = await create_terminal_checkout(payload, user=user)
    assert resp.status == "PENDING"


@pytest.mark.asyncio
async def test_poll_terminal_checkout_paths(monkeypatch, db_session):
    user = await _get_admin_user(db_session)

    monkeypatch.delenv("SQUARE_ACCESS_TOKEN", raising=False)
    resp = await poll_terminal_checkout("chk-123", user=user)
    assert resp.status == "COMPLETED"

    class PollResponse:
        def __init__(self, status_code: int, data: dict):
            self.status_code = status_code
            self._data = data

        def json(self):
            return self._data

    class PollClient:
        def __init__(self, *args, **kwargs):
            self.kwargs = kwargs

        async def __aenter__(self):
            return self

        async def __aexit__(self, exc_type, exc, tb):
            return False

        async def get(self, url, headers=None):
            return PollResponse(200, {"checkout": {"id": "chk-123", "status": "IN_PROGRESS"}})

    monkeypatch.setenv("SQUARE_ACCESS_TOKEN", "token-pos")
    monkeypatch.setenv("SQUARE_ENV", "sandbox")
    monkeypatch.setattr(httpx, "AsyncClient", PollClient)

    resp = await poll_terminal_checkout("chk-123", user=user)
    assert resp.status == "IN_PROGRESS"

    class FailingClient:
        def __init__(self, *args, **kwargs):
            self.kwargs = kwargs

        async def __aenter__(self):
            return self

        async def __aexit__(self, exc_type, exc, tb):
            return False

        async def get(self, url, headers=None):
            raise RuntimeError("downstream")

    monkeypatch.setattr(httpx, "AsyncClient", FailingClient)
    resp = await poll_terminal_checkout("chk-456", user=user)
    assert resp.status == "COMPLETED"
