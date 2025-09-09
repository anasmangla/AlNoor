import os
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlmodel import SQLModel
from sqlalchemy import select
from app.models import Product


DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./alnoor.db")

engine = create_async_engine(DATABASE_URL, echo=False, future=True)
SessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def init_db() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    # Try to ensure new columns exist across supported dialects
    try:
        # SQLite path: add column if missing
        if engine.url.get_backend_name().startswith("sqlite"):
            async with engine.begin() as conn:
                res = await conn.exec_driver_sql("PRAGMA table_info(product)")
                cols = {row[1] for row in res}
                if "stock" not in cols:
                    await conn.exec_driver_sql("ALTER TABLE product ADD COLUMN stock REAL DEFAULT 0")
                if "unit" not in cols:
                    await conn.exec_driver_sql("ALTER TABLE product ADD COLUMN unit TEXT DEFAULT ''")
                if "is_weight_based" not in cols:
                    await conn.exec_driver_sql("ALTER TABLE product ADD COLUMN is_weight_based BOOLEAN DEFAULT 0")
                # OrderItem table
                res2 = await conn.exec_driver_sql("PRAGMA table_info(orderitem)")
                cols2 = {row[1] for row in res2}
                if "unit" not in cols2:
                    await conn.exec_driver_sql("ALTER TABLE orderitem ADD COLUMN unit TEXT DEFAULT ''")
        else:
            # Postgres path: safe add if not exists
            async with engine.begin() as conn:
                await conn.exec_driver_sql(
                    "ALTER TABLE IF NOT EXISTS product ADD COLUMN IF NOT EXISTS stock DOUBLE PRECISION DEFAULT 0"
                )
                await conn.exec_driver_sql(
                    "ALTER TABLE IF NOT EXISTS product ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT ''"
                )
                await conn.exec_driver_sql(
                    "ALTER TABLE IF NOT EXISTS product ADD COLUMN IF NOT EXISTS is_weight_based BOOLEAN DEFAULT FALSE"
                )
                await conn.exec_driver_sql(
                    "ALTER TABLE IF NOT EXISTS orderitem ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT ''"
                )
    except Exception:
        # Best-effort; ignore if cannot alter (e.g., permissions)
        pass


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with SessionLocal() as session:
        yield session


async def seed_if_empty() -> None:
    async with SessionLocal() as session:
        result = await session.execute(select(Product))
        has_any = result.scalars().first()
        if not has_any:
            session.add_all(
                [
                    Product(name="Chicken (whole)", price=12.99, stock=10, unit="each", is_weight_based=False),
                    Product(name="Lamb", price=9.99, stock=100, unit="lb", is_weight_based=True),
                    Product(name="Eggs", price=4.50, stock=30, unit="dozen", is_weight_based=False),
                ]
            )
            await session.commit()
