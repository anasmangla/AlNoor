from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional


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
_NEXT_ID = 4


class ProductCreate(BaseModel):
    name: str
    price: float


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None


@router.get("/products", response_model=List[Product])
def list_products():
    return _PRODUCTS


@router.get("/products/{product_id}", response_model=Product)
def get_product(product_id: int):
    for p in _PRODUCTS:
        if p.id == product_id:
            return p
    raise HTTPException(status_code=404, detail="Product not found")


@router.post("/products", response_model=Product, status_code=status.HTTP_201_CREATED)
def create_product(payload: ProductCreate):
    global _NEXT_ID
    product = Product(id=_NEXT_ID, name=payload.name, price=payload.price)
    _PRODUCTS.append(product)
    _NEXT_ID += 1
    return product


@router.put("/products/{product_id}", response_model=Product)
def update_product(product_id: int, payload: ProductUpdate):
    for idx, p in enumerate(_PRODUCTS):
        if p.id == product_id:
            new = p.model_copy(update={
                "name": payload.name if payload.name is not None else p.name,
                "price": payload.price if payload.price is not None else p.price,
            })
            _PRODUCTS[idx] = new
            return new
    raise HTTPException(status_code=404, detail="Product not found")


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int):
    for idx, p in enumerate(_PRODUCTS):
        if p.id == product_id:
            _PRODUCTS.pop(idx)
            return
    raise HTTPException(status_code=404, detail="Product not found")
