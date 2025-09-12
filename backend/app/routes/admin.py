from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.deps import get_current_user
from app.database import get_session
from app.models import Order as OrderModel, Product as ProductModel


router = APIRouter()


@router.get("/admin/metrics")
async def admin_metrics(
    user: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
    low_stock_threshold: float = 5,
    low_stock_limit: int = 5,
) -> Dict[str, Any]:
    # Today range (UTC)
    now = datetime.now(timezone.utc)
    start = datetime(year=now.year, month=now.month, day=now.day, tzinfo=timezone.utc)
    month_start = datetime(year=now.year, month=now.month, day=1, tzinfo=timezone.utc)

    # Totals
    total_rev_q = await session.execute(select(func.coalesce(func.sum(OrderModel.total_amount), 0)))
    total_revenue = float(total_rev_q.scalar_one() or 0)
    total_orders_q = await session.execute(select(func.count(OrderModel.id)))
    total_orders = int(total_orders_q.scalar_one() or 0)

    # Today
    today_rev_q = await session.execute(
        select(func.coalesce(func.sum(OrderModel.total_amount), 0)).where(OrderModel.created_at >= start)
    )
    revenue_today = float(today_rev_q.scalar_one() or 0)
    today_orders_q = await session.execute(select(func.count(OrderModel.id)).where(OrderModel.created_at >= start))
    orders_today = int(today_orders_q.scalar_one() or 0)

    # This month
    month_rev_q = await session.execute(
        select(func.coalesce(func.sum(OrderModel.total_amount), 0)).where(OrderModel.created_at >= month_start)
    )
    revenue_month = float(month_rev_q.scalar_one() or 0)
    month_orders_q = await session.execute(select(func.count(OrderModel.id)).where(OrderModel.created_at >= month_start))
    orders_month = int(month_orders_q.scalar_one() or 0)

    # Low stock
    low_q = await session.execute(
        select(ProductModel).where(ProductModel.stock <= low_stock_threshold).order_by(ProductModel.stock.asc())
    )
    low = [
        {
            "id": p.id,
            "name": p.name,
            "stock": float(p.stock),
            "unit": p.unit,
        }
        for p in low_q.scalars().all()
    ][: low_stock_limit]

    return {
        "orders_total": total_orders,
        "revenue_total": round(total_revenue, 2),
        "orders_today": orders_today,
        "revenue_today": round(revenue_today, 2),
        "orders_month": orders_month,
        "revenue_month": round(revenue_month, 2),
        "low_stock_threshold": low_stock_threshold,
        "low_stock": low,
    }
