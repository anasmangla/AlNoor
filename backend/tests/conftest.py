from pathlib import Path
import sys

import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy import delete

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.main import app
from app.database import init_db, seed_if_empty, get_session
from app.models import (
    ContactMessage,
    Review,
    VisitorFeedback,
)

@pytest.fixture
async def client() -> AsyncClient:
    await init_db()
    await seed_if_empty()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.fixture(autouse=True)
async def clear_contact_messages():
    await init_db()
    async for session in get_session():
        await session.execute(delete(VisitorFeedback))
        await session.execute(delete(ContactMessage))
        await session.execute(delete(Review))
        await session.commit()
        break
