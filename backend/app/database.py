import os
from dotenv import load_dotenv
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlmodel import SQLModel
from sqlalchemy import select
from app.models import Product


load_dotenv()
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
                if "image_url" not in cols:
                    await conn.exec_driver_sql("ALTER TABLE product ADD COLUMN image_url TEXT DEFAULT ''")
                if "description" not in cols:
                    await conn.exec_driver_sql("ALTER TABLE product ADD COLUMN description TEXT DEFAULT ''")
                if "weight" not in cols:
                    await conn.exec_driver_sql("ALTER TABLE product ADD COLUMN weight REAL DEFAULT 0")
                if "cut_type" not in cols:
                    await conn.exec_driver_sql("ALTER TABLE product ADD COLUMN cut_type TEXT DEFAULT ''")
                if "price_per_unit" not in cols:
                    await conn.exec_driver_sql("ALTER TABLE product ADD COLUMN price_per_unit REAL DEFAULT 0")
                if "origin" not in cols:
                    await conn.exec_driver_sql("ALTER TABLE product ADD COLUMN origin TEXT DEFAULT ''")
                # OrderItem table
                res2 = await conn.exec_driver_sql("PRAGMA table_info(orderitem)")
                cols2 = {row[1] for row in res2}
                if "unit" not in cols2:
                    await conn.exec_driver_sql("ALTER TABLE orderitem ADD COLUMN unit TEXT DEFAULT ''")
                # Order table
                res3 = await conn.exec_driver_sql("PRAGMA table_info([order])")
                cols3 = {row[1] for row in res3}
                if "customer_name" not in cols3:
                    await conn.exec_driver_sql("ALTER TABLE [order] ADD COLUMN customer_name TEXT DEFAULT ''")
                if "customer_email" not in cols3:
                    await conn.exec_driver_sql("ALTER TABLE [order] ADD COLUMN customer_email TEXT DEFAULT ''")
                if "created_at" not in cols3:
                    await conn.exec_driver_sql("ALTER TABLE [order] ADD COLUMN created_at TIMESTAMP")
                # ContactMessage table
                res4 = await conn.exec_driver_sql("PRAGMA table_info(contactmessage)")
                cols4 = {row[1] for row in res4}
                if "ip" not in cols4:
                    await conn.exec_driver_sql("ALTER TABLE contactmessage ADD COLUMN ip TEXT DEFAULT ''")
                if "phone" not in cols4:
                    await conn.exec_driver_sql("ALTER TABLE contactmessage ADD COLUMN phone TEXT DEFAULT ''")
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
                    "ALTER TABLE IF NOT EXISTS product ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT ''"
                )
                await conn.exec_driver_sql(
                    "ALTER TABLE IF NOT EXISTS product ADD COLUMN IF NOT EXISTS description TEXT DEFAULT ''"
                )
                await conn.exec_driver_sql(
                    "ALTER TABLE IF NOT EXISTS product ADD COLUMN IF NOT EXISTS weight DOUBLE PRECISION DEFAULT 0"
                )
                await conn.exec_driver_sql(
                    "ALTER TABLE IF NOT EXISTS product ADD COLUMN IF NOT EXISTS cut_type TEXT DEFAULT ''"
                )
                await conn.exec_driver_sql(
                    "ALTER TABLE IF NOT EXISTS product ADD COLUMN IF NOT EXISTS price_per_unit DOUBLE PRECISION DEFAULT 0"
                )
                await conn.exec_driver_sql(
                    "ALTER TABLE IF NOT EXISTS product ADD COLUMN IF NOT EXISTS origin TEXT DEFAULT ''"
                )
                await conn.exec_driver_sql(
                    "ALTER TABLE IF NOT EXISTS orderitem ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT ''"
                )
                await conn.exec_driver_sql(
                    "ALTER TABLE IF NOT EXISTS \"order\" ADD COLUMN IF NOT EXISTS customer_name TEXT DEFAULT ''"
                )
                await conn.exec_driver_sql(
                    "ALTER TABLE IF NOT EXISTS \"order\" ADD COLUMN IF NOT EXISTS customer_email TEXT DEFAULT ''"
                )
                await conn.exec_driver_sql(
                    "ALTER TABLE IF NOT EXISTS \"order\" ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW()"
                )
                await conn.exec_driver_sql(
                    "ALTER TABLE IF NOT EXISTS contactmessage ADD COLUMN IF NOT EXISTS ip TEXT DEFAULT ''"
                )
                await conn.exec_driver_sql(
                    "ALTER TABLE IF NOT EXISTS contactmessage ADD COLUMN IF NOT EXISTS phone TEXT DEFAULT ''"
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
                    Product(
                        name="Chicken (whole)",
                        price=12.99,
                        stock=10,
                        unit="each",
                        is_weight_based=False,
                        image_url="https://images.unsplash.com/photo-1604908811745-d763b5bb00ca?auto=format&fit=crop&w=800&q=80",
                        description="Pasture-raised whole chicken dressed and ready for roasting.",
                        weight=4.5,
                        cut_type="Whole bird",
                        price_per_unit=2.89,
                        origin="Hudson Valley, NY",
                    ),
                    Product(
                        name="Lamb",
                        price=9.99,
                        stock=100,
                        unit="lb",
                        is_weight_based=True,
                        image_url="https://images.unsplash.com/photo-1484980972926-edee96e0960d?auto=format&fit=crop&w=800&q=80",
                        description="Tender grass-fed lamb perfect for braising or grilling.",
                        weight=1.0,
                        cut_type="Butcher's selection",
                        price_per_unit=9.99,
                        origin="Catskills, NY",
                    ),
                    Product(
                        name="Eggs",
                        price=4.50,
                        stock=30,
                        unit="dozen",
                        is_weight_based=False,
                        image_url="https://images.unsplash.com/photo-1517957754645-7082cf4a5812?auto=format&fit=crop&w=800&q=80",
                        description="Farm fresh brown eggs collected daily.",
                        weight=1.5,
                        cut_type="Grade A large",
                        price_per_unit=4.50,
                        origin="Albany, NY",
                    ),
                ]
            )
            await session.commit()
