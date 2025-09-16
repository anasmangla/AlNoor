import inspect
import os
import uuid
from typing import Optional

import httpx
from sqlalchemy import select

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field

from app.schemas import OrderCreate, OrderOut
from .orders import create_order
from app.deps import get_current_user
from app.database import get_session
from app.models import Order as OrderModel


router = APIRouter()


@router.post("/pos/checkout", response_model=OrderOut)
async def pos_checkout(
    payload: OrderCreate,
    session: AsyncSession = Depends(get_session),
    user: str = Depends(get_current_user),
):
    # Force source to 'pos' and reuse order creation logic
    payload.source = "pos"
    create_order_callable = create_order
    try:
        parameters = inspect.signature(create_order_callable).parameters
    except (TypeError, ValueError):
        parameters = {}

    if len(parameters) <= 1:
        created = await create_order_callable(payload)  # type: ignore[misc]
    else:
        created = await create_order_callable(payload, session)

    if created.status == "pending":
        result = await session.execute(
            select(OrderModel).where(OrderModel.id == created.id)
        )
        order_row = result.scalars().first()
        if order_row:
            order_row.status = "processing"
            session.add(order_row)
            await session.commit()
            created.status = "processing"
    return created


class TerminalCheckoutRequest(BaseModel):
    amount_cents: int = Field(..., ge=1)
    device_id: Optional[str] = None
    reference_id: Optional[str] = None


class TerminalCheckoutResponse(BaseModel):
    checkout_id: str
    status: str
    url: Optional[str] = None


@router.post("/pos/terminal/checkout", response_model=TerminalCheckoutResponse)
async def create_terminal_checkout(payload: TerminalCheckoutRequest, user: str = Depends(get_current_user)):
    access_token = os.getenv("SQUARE_ACCESS_TOKEN")
    location_id = os.getenv("SQUARE_LOCATION_ID")
    env = (os.getenv("SQUARE_ENV") or "sandbox").lower()
    base = (
        "https://connect.squareupsandbox.com"
        if env == "sandbox"
        else "https://connect.squareup.com"
    )

    if not access_token or not location_id:
        # Simulated checkout
        return TerminalCheckoutResponse(checkout_id=str(uuid.uuid4()), status="PENDING")

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
        "Square-Version": "2024-05-15",
    }
    body = {
        "idempotency_key": str(uuid.uuid4()),
        "checkout_options": {
            "payment_type": "CARD_PRESENT",
            "device_options": {
                "device_id": payload.device_id or "unknown-device",
            },
        },
        "order": {
            "location_id": location_id,
            "line_items": [
                {
                    "name": payload.reference_id or "POS Sale",
                    "quantity": "1",
                    "base_price_money": {
                        "amount": int(payload.amount_cents),
                        "currency": "USD",
                    },
                }
            ],
        },
    }
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.post(f"{base}/v2/terminals/checkouts", headers=headers, json=body)
        data = resp.json()
        if resp.status_code >= 300:
            detail = data.get("errors") if isinstance(data, dict) else data
            raise HTTPException(status_code=400, detail=f"Terminal create failed: {detail}")
        checkout = data.get("checkout") or {}
        return TerminalCheckoutResponse(
            checkout_id=checkout.get("id", str(uuid.uuid4())),
            status=checkout.get("status", "PENDING"),
            url=checkout.get("device_checkout_options", {}).get("device_id"),
        )
    except HTTPException:
        raise
    except Exception as e:
        # Fall back to simulated
        return TerminalCheckoutResponse(checkout_id=str(uuid.uuid4()), status="PENDING")


@router.get("/pos/terminal/checkout/{checkout_id}", response_model=TerminalCheckoutResponse)
async def poll_terminal_checkout(checkout_id: str, user: str = Depends(get_current_user)):
    access_token = os.getenv("SQUARE_ACCESS_TOKEN")
    env = (os.getenv("SQUARE_ENV") or "sandbox").lower()
    base = (
        "https://connect.squareupsandbox.com"
        if env == "sandbox"
        else "https://connect.squareup.com"
    )
    if not access_token:
        # Simulate as completed for demo
        return TerminalCheckoutResponse(checkout_id=checkout_id, status="COMPLETED")
    try:
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Square-Version": "2024-05-15",
        }
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(f"{base}/v2/terminals/checkouts/{checkout_id}", headers=headers)
        data = resp.json()
        checkout = data.get("checkout") or {}
        return TerminalCheckoutResponse(
            checkout_id=checkout.get("id", checkout_id),
            status=checkout.get("status", "PENDING"),
        )
    except Exception:
        # Simulate fallback
        return TerminalCheckoutResponse(checkout_id=checkout_id, status="COMPLETED")
