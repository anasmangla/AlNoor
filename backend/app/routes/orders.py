from typing import List, Dict
from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas import OrderCreate, OrderOut, OrderItemOut
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

    order_row = OrderModel(
        total_amount=round(total, 2),
        status="paid",  # Placeholder until real payment
        source=(payload.source or "web"),
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
    )


@router.get("/orders", response_model=List[OrderOut])
async def list_orders(
    user: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    # Fetch orders
    result = await session.execute(select(OrderModel))
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
    o = result.scalars().first()
    if not o:
        raise HTTPException(status_code=404, detail="Order not found")
    result_items = await session.execute(
        select(OrderItemModel).where(OrderItemModel.order_id == order_id)
    )
    items_out = []
    for it in result_items.scalars().all():
        subtotal = float(it.price_each) * float(it.quantity)
        items_out.append(
            OrderItemOut(
                product_id=int(it.product_id),
                name=it.name,
                unit=getattr(it, "unit", ""),
                quantity=float(it.quantity),
                price_each=float(it.price_each),
                subtotal=subtotal,
            )
        )
    return OrderOut(
        id=int(o.id),
        items=items_out,
        total_amount=float(o.total_amount),
        status=o.status,
        source=o.source,
    )
