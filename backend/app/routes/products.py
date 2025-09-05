from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List


class Product(BaseModel):
    id: int
    name: str
    price: float


router = APIRouter()

_PRODUCTS = [
    Product(id=1, name="Chicken (whole)", price=12.99),
    Product(id=2, name="Lamb (per lb)", price=9.99),
    Product(id=3, name="Eggs (dozen)", price=4.50),
]


@router.get("/products", response_model=List[Product])
def list_products():
    return _PRODUCTS


@router.get("/products/{product_id}", response_model=Product)
def get_product(product_id: int):
    for p in _PRODUCTS:
        if p.id == product_id:
            return p
    raise HTTPException(status_code=404, detail="Product not found")

