import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.database import init_db, seed_if_empty
from app.schemas import ContactCreate


@pytest.mark.asyncio
async def test_health_ok():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        resp = await ac.get("/health")
        assert resp.status_code == 200
        assert resp.json().get("status") == "ok"


@pytest.mark.asyncio
async def test_products_seeded():
    # Ensure DB and seed are ready
    await init_db()
    await seed_if_empty()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        resp = await ac.get("/products")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
    assert len(data) >= 1


@pytest.mark.asyncio
async def test_contact_create():
    await init_db()
    async with AsyncClient(app=app, base_url="http://test") as ac:
        resp = await ac.post("/contact", json={"name": "Tester", "email": "test@example.com", "message": "Hello"})
        assert resp.status_code == 201
        body = resp.json()
        assert body["name"] == "Tester"
