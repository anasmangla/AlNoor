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
from app.models import (
    BackorderRequest as BackorderRequestModel,
    Product as ProductModel,
)
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
        id=product.id,
        name=product.name,
        price=product.price,
        stock=product.stock,
        unit=product.unit,
        is_weight_based=product.is_weight_based,
        image_url=getattr(product, "image_url", ""),
        description=getattr(product, "description", ""),
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
    user: str = Depends(get_current_user),
):
    p = ProductModel(
        name=payload.name,
        price=payload.price,
        stock=payload.stock or 0,
        unit=payload.unit or "",
        is_weight_based=bool(payload.is_weight_based),
        image_url=payload.image_url or "",
        description=payload.description or "",
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
    user: str = Depends(get_current_user),
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
    await session.commit()
    await session.refresh(p)
    return _serialize_product(p)


def _send_backorder_email(product: ProductModel, request_obj: BackorderRequestModel) -> None:
    host = os.getenv("SMTP_HOST")
    to_addr = os.getenv("BACKORDER_ALERT_TO") or os.getenv("CONTACT_TO")
    if not host or not to_addr:
        return
    try:
        smtp_port = int(os.getenv("SMTP_PORT", "587"))
    except (TypeError, ValueError):
        smtp_port = 587
    smtp_user = os.getenv("SMTP_USER")
    smtp_pass = os.getenv("SMTP_PASS")
    use_tls = os.getenv("SMTP_TLS", "true").lower() != "false"

    try:
        email_msg = EmailMessage()
        email_msg["Subject"] = f"Backorder request for {product.name}"
        email_msg["From"] = smtp_user or to_addr
        email_msg["To"] = to_addr
        details = [
            f"Product: {product.name} (ID: {product.id})",
            f"Email: {request_obj.email}",
        ]
        if request_obj.name:
            details.append(f"Name: {request_obj.name}")
        if request_obj.quantity is not None:
            details.append(f"Requested quantity: {request_obj.quantity}")
        if request_obj.note:
            details.append(f"Note: {request_obj.note}")
        if request_obj.ip:
            details.append(f"IP: {request_obj.ip}")
        details.append(f"Created: {request_obj.created_at.isoformat()}")

        email_msg.set_content("\n".join(details))

        with smtplib.SMTP(host, smtp_port, timeout=10) as server:
            if use_tls:
                server.starttls()
            if smtp_user and smtp_pass:
                server.login(smtp_user, smtp_pass)
            server.send_message(email_msg)
    except Exception:
        # Email delivery is best-effort; ignore failures
        pass


@router.post(
    "/products/{product_id}/backorder",
    response_model=BackorderRequestOut,
    status_code=status.HTTP_201_CREATED,
)
async def create_backorder_request(
    product_id: int,
    payload: BackorderRequestCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(select(ProductModel).where(ProductModel.id == product_id))
    product = result.scalars().first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    _, _, backorder_available = _compute_stock_meta(product.stock)
    if not backorder_available:
        raise HTTPException(status_code=400, detail="Product is currently in stock")

    email = payload.email.lower()
    name = (payload.name or "").strip()
    note = (payload.note or "").strip()
    quantity = payload.quantity if payload.quantity is None else float(payload.quantity)
    client_ip = request.client.host if request.client else ""

    window = datetime.utcnow() - timedelta(hours=12)
    existing_q = await session.execute(
        select(BackorderRequestModel)
        .where(
            BackorderRequestModel.product_id == product_id,
            BackorderRequestModel.email == email,
            BackorderRequestModel.status == "pending",
            BackorderRequestModel.created_at >= window,
        )
        .order_by(BackorderRequestModel.created_at.desc())
    )
    existing = existing_q.scalars().first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="A pending request already exists for this product. We'll be in touch soon.",
        )

    req = BackorderRequestModel(
        product_id=product_id,
        email=email,
        name=name,
        quantity=quantity,
        note=note,
        ip=client_ip,
    )
    session.add(req)
    await session.commit()
    await session.refresh(req)

    _send_backorder_email(product, req)

    return BackorderRequestOut(
        id=req.id,
        product_id=req.product_id,
        email=req.email,
        name=req.name or None,
        quantity=req.quantity,
        note=req.note or None,
        status=req.status,
        created_at=req.created_at,
    )


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: int,
    session: AsyncSession = Depends(get_session),
    user: str = Depends(get_current_user),
):
    result = await session.execute(select(ProductModel).where(ProductModel.id == product_id))
    p = result.scalars().first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    await session.delete(p)
    await session.commit()
    return None
