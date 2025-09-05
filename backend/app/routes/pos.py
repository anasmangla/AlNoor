from fastapi import APIRouter, Depends
from app.schemas import OrderCreate, OrderOut
from .orders import create_order
from app.deps import get_current_user


router = APIRouter()


@router.post("/pos/checkout", response_model=OrderOut)
async def pos_checkout(payload: OrderCreate, user: str = Depends(get_current_user)):
    # Force source to 'pos' and reuse order creation logic
    payload.source = "pos"
    return await create_order(payload)  # type: ignore[arg-type]
