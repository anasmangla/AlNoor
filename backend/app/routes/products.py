import os
import smtplib
from datetime import datetime, timedelta
from email.message import EmailMessage
from typing import List, Tuple

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.deps import get_current_user
from app.models import Product as ProductModel, User
from app.schemas import (
    BackorderRequestCreate,
    BackorderRequestOut,
    ProductCreate,
    ProductOut,
    ProductUpdate,
)


router = APIRouter()

try:
    LOW_STOCK_THRESHOLD = float(os.getenv("LOW_STOCK_THRESHOLD", "5"))
except (TypeError, ValueError):
    LOW_STOCK_THRESHOLD = 5.0


def _compute_stock_meta(stock: float) -> Tuple[str, str, bool]:
    amount = float(stock or 0)
    if amount <= 0:
        return "out_of_stock", "Out of stock", True
    if amount <= LOW_STOCK_THRESHOLD:
        return "low_stock", "Low stock", False
    return "in_stock", "In stock", False


def _serialize_product(product: ProductModel) -> ProductOut:
    status, label, backorder = _compute_stock_meta(product.stock)
    return ProductOut(
        id=int(product.id),
        name=product.name,
        price=float(product.price),
        stock=float(getattr(product, "stock", 0)),
        unit=getattr(product, "unit", ""),
        is_weight_based=bool(getattr(product, "is_weight_based", False)),
        image_url=getattr(product, "image_url", "") or "",
        description=getattr(product, "description", "") or "",
        weight=float(getattr(product, "weight", 0.0) or 0.0),
        cut_type=getattr(product, "cut_type", "") or "",
        price_per_unit=float(getattr(product, "price_per_unit", 0.0) or 0.0),
        origin=getattr(product, "origin", "") or "",
        stock_status=status,
        stock_status_label=label,
        backorder_available=backorder,
    )


@router.get("/products", response_model=List[ProductOut])
async def list_products(session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(ProductModel))
    rows = result.scalars().all()

    return [_serialize_product(p) for p in rows]


@router.get("/products/{product_id}", response_model=ProductOut)
async def get_product(product_id: int, session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(ProductModel).where(ProductModel.id == product_id))
    p = result.scalars().first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    return _serialize_product(p)

@router.post("/products", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
async def create_product(
    payload: ProductCreate,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
):
    p = ProductModel(
        name=payload.name,
        price=payload.price,
        stock=payload.stock or 0,
        unit=payload.unit or "",
        is_weight_based=bool(payload.is_weight_based),
        image_url=payload.image_url or "",
        description=payload.description or "",
        weight=payload.weight or 0.0,
        cut_type=payload.cut_type or "",
        price_per_unit=payload.price_per_unit or 0.0,
        origin=payload.origin or "",
    )
    session.add(p)
    await session.commit()
    await session.refresh(p)
    return _serialize_product(p)


@router.put("/products/{product_id}", response_model=ProductOut)
async def update_product(
    product_id: int,
    payload: ProductUpdate,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
):
    result = await session.execute(select(ProductModel).where(ProductModel.id == product_id))
    p = result.scalars().first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    if payload.name is not None:
        p.name = payload.name
    if payload.price is not None:
        p.price = payload.price
    if payload.stock is not None:
        p.stock = payload.stock
    if payload.unit is not None:
        p.unit = payload.unit
    if payload.is_weight_based is not None:
        p.is_weight_based = bool(payload.is_weight_based)
    if getattr(payload, "image_url", None) is not None:
        p.image_url = payload.image_url or ""
    if getattr(payload, "description", None) is not None:
        p.description = payload.description or ""
    if getattr(payload, "weight", None) is not None:
        p.weight = payload.weight or 0.0
    if getattr(payload, "cut_type", None) is not None:
        p.cut_type = payload.cut_type or ""
    if getattr(payload, "price_per_unit", None) is not None:
        p.price_per_unit = payload.price_per_unit or 0.0
    if getattr(payload, "origin", None) is not None:
        p.origin = payload.origin or ""
    await session.commit()
    await session.refresh(p)

    return _serialize_product(p)


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: int,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
):
    result = await session.execute(select(ProductModel).where(ProductModel.id == product_id))
    p = result.scalars().first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    await session.delete(p)
    await session.commit()
    return None
