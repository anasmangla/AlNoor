import uuid

import pytest
from fastapi import HTTPException
from sqlalchemy import select

from app.database import get_session, init_db, seed_if_empty
from app.models import Product as ProductModel, User
from app.routes import products as products_routes
from app.routes.products import LOW_STOCK_THRESHOLD, _compute_stock_meta
from app.schemas import ProductCreate, ProductUpdate


async def login_admin(client):
    resp = await client.post(
        "/auth/login",
        json={"username": "admin", "password": "admin123"},
    )
    assert resp.status_code == 200
    return resp.json()["access_token"]


async def _get_admin_user(session):
    admin = (
        await session.execute(select(User).where(User.username == "admin"))
    ).scalars().first()
    assert admin is not None
    return admin


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

    base_name = f"Status Product {uuid.uuid4().hex[:6]}"

    create_resp = await client.post(
        "/products",
        headers=headers,
        json={
            "name": base_name,
            "price": 5.25,
            "stock": 0,
            "unit": "each",
            "is_weight_based": False,
            "image_url": "http://example.com/original.png",
            "description": "Initial",
            "weight": 0.5,
            "cut_type": "Whole",
            "price_per_unit": 5.25,
            "origin": "Origin Farm",
        },
    )
    assert create_resp.status_code == 201
    created = create_resp.json()
    product_id = created["id"]
    assert created["stock_status"] == "out_of_stock"
    assert created["stock_status_label"] == "Out of stock"
    assert created["backorder_available"] is True

    update_resp = await client.put(
        f"/products/{product_id}",
        headers=headers,
        json={
            "stock": 2,
            "name": f"{base_name} Updated",
            "unit": "box",
            "is_weight_based": True,
            "image_url": "http://example.com/image.png",
            "description": "Now updated",
            "weight": 1.2,
            "cut_type": "Diced",
            "price_per_unit": 7.5,
            "origin": "Updated Farm",
        },
    )
    assert update_resp.status_code == 200
    updated = update_resp.json()
    assert updated["stock_status"] == "low_stock"
    assert updated["stock_status_label"] == "Low stock"
    assert updated["backorder_available"] is False
    assert updated["name"].endswith("Updated")
    assert updated["unit"] == "box"
    assert updated["is_weight_based"] is True
    assert updated["image_url"] == "http://example.com/image.png"
    assert updated["description"] == "Now updated"
    assert updated["weight"] == pytest.approx(1.2)
    assert updated["cut_type"] == "Diced"
    assert updated["price_per_unit"] == pytest.approx(7.5)
    assert updated["origin"] == "Updated Farm"

    final_resp = await client.put(
        f"/products/{product_id}",
        headers=headers,
        json={"stock": 12},
    )
    assert final_resp.status_code == 200
    final = final_resp.json()
    assert final["stock_status"] == "in_stock"
    assert final["stock_status_label"] == "In stock"
    assert final["backorder_available"] is False

    delete_resp = await client.delete(f"/products/{product_id}", headers=headers)
    assert delete_resp.status_code == 204


def test_compute_stock_meta_branches():
    status, label, backorder = _compute_stock_meta(0)
    assert status == "out_of_stock"
    assert label == "Out of stock"
    assert backorder is True

    low_value = max(0.5, LOW_STOCK_THRESHOLD / 2)
    status, label, backorder = _compute_stock_meta(low_value)
    assert status == "low_stock"
    assert label == "Low stock"
    assert backorder is False

    status, label, backorder = _compute_stock_meta(LOW_STOCK_THRESHOLD + 5)
    assert status == "in_stock"
    assert label == "In stock"
    assert backorder is False


@pytest.mark.asyncio
async def test_products_module_direct_flows():
    await init_db()
    await seed_if_empty()
    async for session in get_session():
        admin_user = await _get_admin_user(session)

        listing = await products_routes.list_products(session=session)
        assert listing

        unique_name = f"Direct Product {uuid.uuid4().hex[:6]}"
        payload = ProductCreate(
            name=unique_name,
            price=12.5,
            stock=3,
            unit="pack",
            is_weight_based=False,
            image_url="http://example.com/direct.png",
            description="Direct test product",
            weight=2.5,
            cut_type="Sliced",
            price_per_unit=4.2,
            origin="Direct Farm",
        )
        created = await products_routes.create_product(payload, session=session, user=admin_user)
        assert created.name == unique_name
        assert created.stock_status in {"in_stock", "low_stock", "out_of_stock"}

        updated = await products_routes.update_product(
            created.id,
            ProductUpdate(
                name=f"{unique_name} Updated",
                price=14.0,
                stock=1,
                unit="box",
                is_weight_based=True,
                image_url="http://example.com/updated.png",
                description="Updated via direct test",
                weight=3.1,
                cut_type="Cubed",
                price_per_unit=5.6,
                origin="Updated Farm",
            ),
            session=session,
            user=admin_user,
        )
        assert updated.name.endswith("Updated")
        assert updated.unit == "box"
        assert updated.is_weight_based is True
        assert updated.description == "Updated via direct test"

        fetched = await products_routes.get_product(created.id, session=session)
        assert fetched.id == created.id
        assert fetched.price_per_unit == pytest.approx(5.6)

        await products_routes.delete_product(created.id, session=session, user=admin_user)

        with pytest.raises(HTTPException) as exc:
            await products_routes.get_product(created.id, session=session)
        assert exc.value.status_code == 404

        with pytest.raises(HTTPException) as exc:
            await products_routes.update_product(
                created.id,
                ProductUpdate(name="Missing"),
                session=session,
                user=admin_user,
            )
        assert exc.value.status_code == 404

        with pytest.raises(HTTPException) as exc:
            await products_routes.delete_product(created.id, session=session, user=admin_user)
        assert exc.value.status_code == 404
        break
