from typing import List, Dict, Optional
import os
import uuid
from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas import OrderCreate, OrderOut, OrderItemOut, OrderUpdate
from app.deps import get_current_user
from app.database import get_session
from app.models import Product as ProductModel, Order as OrderModel, OrderItem as OrderItemModel


router = APIRouter()


@router.post("/orders", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
async def create_order(
    payload: OrderCreate,
    session: AsyncSession = Depends(get_session),
):
    # Fetch all products referenced
    product_ids = [i.product_id for i in payload.items]
    if not product_ids:
        raise HTTPException(status_code=400, detail="No items")
    result = await session.execute(select(ProductModel).where(ProductModel.id.in_(product_ids)))
    products = {p.id: p for p in result.scalars().all()}

    items_out: List[OrderItemOut] = []
    total = 0.0
    # Validate stock and compute totals
    for item in payload.items:
        prod = products.get(item.product_id)
        if not prod:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        price_each = float(prod.price)
        quantity = float(item.quantity)
        # Check stock
        if float(getattr(prod, "stock", 0.0)) < quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for product {prod.id}",
            )
        subtotal = price_each * quantity
        total += subtotal
        items_out.append(
            OrderItemOut(
                product_id=prod.id,
                name=prod.name,
                unit=getattr(prod, "unit", ""),
                quantity=quantity,
                price_each=price_each,
                subtotal=subtotal,
            )
        )

    status_val = "pending"
    if (payload.source or "").lower() == "pos":
        status_val = "processing"

    # Optional Square payment (sandbox/production) if token and env configured
    token = getattr(payload, "payment_token", None)
    access_token = os.getenv("SQUARE_ACCESS_TOKEN")
    location_id = os.getenv("SQUARE_LOCATION_ID")
    env = (os.getenv("SQUARE_ENV") or "sandbox").lower()
    use_square = bool(token and access_token and location_id)

    if use_square:
        try:
            import httpx  # type: ignore

            base = (
                "https://connect.squareupsandbox.com"
                if env == "sandbox"
                else "https://connect.squareup.com"
            )
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json",
                "Square-Version": "2024-05-15",
            }
            body = {
                "idempotency_key": str(uuid.uuid4()),
                "source_id": token,
                "location_id": location_id,
                "amount_money": {
                    "amount": int(round(total * 100)),
                    "currency": "USD",
                },
            }
            async with httpx.AsyncClient(timeout=20) as client:
                resp = await client.post(f"{base}/v2/payments", headers=headers, json=body)
            data = resp.json()
            if resp.status_code >= 300:
                detail = data.get("errors") if isinstance(data, dict) else data
                raise HTTPException(status_code=400, detail=f"Payment failed: {detail}")
            else:
                status_val = "paid"
        except HTTPException:
            raise
        except Exception as e:  # If SDK call fails, surface error gracefully
            raise HTTPException(status_code=400, detail=f"Payment error: {e}")

    order_row = OrderModel(
        total_amount=round(total, 2),
        status=status_val,
        source=(payload.source or "web"),
        customer_name=payload.customer_name or "",
        customer_email=str(payload.customer_email or ""),
    )
    session.add(order_row)
    await session.flush()  # get order id

    # Create order items
    for i in items_out:
        session.add(
            OrderItemModel(
                order_id=order_row.id,  # type: ignore[arg-type]
                product_id=i.product_id,
                name=i.name,
                unit=i.unit,
                quantity=i.quantity,
                price_each=i.price_each,
            )
        )

    # Decrement stock
    for item in payload.items:
        prod = products[item.product_id]
        prod.stock = float(prod.stock) - float(item.quantity)
        session.add(prod)

    await session.commit()
    await session.refresh(order_row)

    return OrderOut(
        id=order_row.id,  # type: ignore[arg-type]
        items=items_out,
        total_amount=order_row.total_amount,
        status=order_row.status,
        source=order_row.source,
        customer_name=(getattr(order_row, "customer_name", None) or None),
        customer_email=(getattr(order_row, "customer_email", None) or None),
        created_at=getattr(order_row, "created_at", None),
    )


@router.get("/orders", response_model=List[OrderOut])
async def list_orders(
    user: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
):
    # Fetch orders with optional date filter
    stmt = select(OrderModel)
    if start_date:
        try:
            from datetime import datetime
            sd = datetime.fromisoformat(start_date)
            stmt = stmt.where(OrderModel.created_at >= sd)
        except Exception:
            pass
    if end_date:
        try:
            from datetime import datetime
            ed = datetime.fromisoformat(end_date)
            stmt = stmt.where(OrderModel.created_at <= ed)
        except Exception:
            pass
    result = await session.execute(stmt)
    orders = result.scalars().all()
    # Fetch items for all orders and bucket by order_id
    result_items = await session.execute(select(OrderItemModel))
    items = result_items.scalars().all()
    by_order: Dict[int, List[OrderItemOut]] = {}
    for it in items:
        lst = by_order.setdefault(int(it.order_id), [])
        subtotal = float(it.price_each) * float(it.quantity)
        lst.append(
            OrderItemOut(
                product_id=int(it.product_id),
                name=it.name,
                unit=getattr(it, "unit", ""),
                quantity=float(it.quantity),
                price_each=float(it.price_each),
                subtotal=subtotal,
            )
        )
    return [
        OrderOut(
            id=int(o.id),
            items=by_order.get(int(o.id), []),
            total_amount=float(o.total_amount),
            status=o.status,
            source=o.source,
            customer_name=(getattr(o, "customer_name", None) or None),
            customer_email=(getattr(o, "customer_email", None) or None),
            created_at=getattr(o, "created_at", None),
        )
        for o in orders
    ]


@router.get("/orders/{order_id}", response_model=OrderOut)
async def get_order(
    order_id: int,
    user: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(select(OrderModel).where(OrderModel.id == order_id))
    order = result.scalars().first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    # Fetch items for this order
    result_items = await session.execute(
        select(OrderItemModel).where(OrderItemModel.order_id == int(order.id))
    )
    items = [
        OrderItemOut(
            product_id=int(it.product_id),
            name=it.name,
            unit=getattr(it, "unit", ""),
            quantity=float(it.quantity),
            price_each=float(it.price_each),
            subtotal=float(it.price_each) * float(it.quantity),
        )
        for it in result_items.scalars().all()
    ]
    return OrderOut(
        id=int(order.id),
        items=items,
        total_amount=float(order.total_amount),
        status=order.status,
        source=order.source,
        customer_name=(getattr(order, "customer_name", None) or None),
        customer_email=(getattr(order, "customer_email", None) or None),
        created_at=getattr(order, "created_at", None),
    )


@router.put("/orders/{order_id}", response_model=OrderOut)
async def update_order(
    order_id: int,
    payload: OrderUpdate,
    user: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    # Find order
    result = await session.execute(select(OrderModel).where(OrderModel.id == order_id))
    order = result.scalars().first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    # Update allowed fields
    order.status = payload.status
    session.add(order)
    await session.commit()
    await session.refresh(order)
    # Return populated view
    result_items = await session.execute(
        select(OrderItemModel).where(OrderItemModel.order_id == int(order.id))
    )
    items = [
        OrderItemOut(
            product_id=int(it.product_id),
            name=it.name,
            unit=getattr(it, "unit", ""),
            quantity=float(it.quantity),
            price_each=float(it.price_each),
            subtotal=float(it.price_each) * float(it.quantity),
        )
        for it in result_items.scalars().all()
    ]
    return OrderOut(
        id=int(order.id),
        items=items,
        total_amount=float(order.total_amount),
        status=order.status,
        source=order.source,
        customer_name=(getattr(order, "customer_name", None) or None),
        customer_email=(getattr(order, "customer_email", None) or None),
        created_at=getattr(order, "created_at", None),
    )
