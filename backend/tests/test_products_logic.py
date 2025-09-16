import importlib
import uuid

import pytest
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import init_db, seed_if_empty, SessionLocal
from app.models import Product as ProductModel, User as UserModel
from app.routes.products import (
    _compute_stock_meta,
    _serialize_product,
    create_product,
    delete_product,
    get_product,
    list_products,
    update_product,
)
from app.schemas import ProductCreate, ProductUpdate


@pytest.fixture
async def db_session():
    await init_db()
    await seed_if_empty()
    async with SessionLocal() as session:
        yield session


async def _get_admin_user(session: AsyncSession) -> UserModel:
    result = await session.execute(select(UserModel))
    return result.scalars().first()


def test_compute_stock_meta():
    assert _compute_stock_meta(-1) == ("out_of_stock", "Out of stock", True)
    assert _compute_stock_meta(0) == ("out_of_stock", "Out of stock", True)
    assert _compute_stock_meta(2) == ("low_stock", "Low stock", False)
    assert _compute_stock_meta(9) == ("in_stock", "In stock", False)


@pytest.mark.asyncio
async def test_product_crud_direct(db_session):
    user = await _get_admin_user(db_session)
    payload = ProductCreate(
        name=f"Direct Logic Product {uuid.uuid4().hex[:6]}",
        price=4.75,
        stock=6,
        unit="each",
        is_weight_based=False,
        image_url="",
        description="Created via direct route call",
        weight=1.5,
        cut_type="Sample",
        price_per_unit=4.75,
        origin="Test Farm",
    )

    created = await create_product(payload, session=db_session, user=user)
    assert created.stock_status == "in_stock"
    assert created.stock_status_label == "In stock"
    product_id = created.id

    row = await db_session.get(ProductModel, product_id)
    serialized = _serialize_product(row)
    assert serialized.id == product_id
    assert serialized.backorder_available is False

    update = ProductUpdate(
        name="Updated Logic Product",
        price=5.25,
        stock=0,
        unit="lb",
        is_weight_based=True,
        image_url="https://example.com/img.jpg",
        description="Updated description",
        weight=2.5,
        cut_type="Updated",
        price_per_unit=5.25,
        origin="Updated Farm",
    )
    updated = await update_product(product_id, update, session=db_session, user=user)
    assert updated.name == "Updated Logic Product"
    assert updated.price == pytest.approx(5.25)
    assert updated.stock == pytest.approx(0)
    assert updated.stock_status == "out_of_stock"
    assert updated.backorder_available is True
    assert updated.unit == "lb"
    assert updated.is_weight_based is True
    assert updated.image_url == "https://example.com/img.jpg"
    assert updated.description == "Updated description"
    assert updated.weight == pytest.approx(2.5)
    assert updated.cut_type == "Updated"
    assert updated.price_per_unit == pytest.approx(5.25)

    listing = await list_products(session=db_session)
    assert any(entry.id == product_id for entry in listing)

    fetched = await get_product(product_id, session=db_session)
    assert fetched.id == product_id
    assert fetched.origin == "Updated Farm"

    await delete_product(product_id, session=db_session, user=user)

    with pytest.raises(HTTPException) as exc:
        await get_product(product_id, session=db_session)
    assert exc.value.status_code == 404


def test_low_stock_threshold_invalid_env_reload(monkeypatch):
    import app.routes.products as products_module

    monkeypatch.setenv("LOW_STOCK_THRESHOLD", "invalid")
    importlib.reload(products_module)
    assert products_module.LOW_STOCK_THRESHOLD == 5.0

    monkeypatch.delenv("LOW_STOCK_THRESHOLD", raising=False)
    importlib.reload(products_module)

