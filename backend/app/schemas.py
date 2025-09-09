from typing import List, Optional
from pydantic import BaseModel, Field, EmailStr


class ProductBase(BaseModel):
    name: str = Field(..., max_length=100)
    price: float = Field(..., ge=0)
    stock: float = Field(0, ge=0)
    unit: str = Field("", max_length=50)
    is_weight_based: bool = False


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(default=None, max_length=100)
    price: Optional[float] = Field(default=None, ge=0)
    stock: Optional[float] = Field(default=None, ge=0)
    unit: Optional[str] = Field(default=None, max_length=50)
    is_weight_based: Optional[bool] = None


class ProductOut(ProductBase):
    id: int


class OrderItemIn(BaseModel):
    product_id: int
    quantity: float = Field(..., gt=0)


class OrderCreate(BaseModel):
    customer_name: Optional[str] = None
    customer_email: Optional[EmailStr] = None
    items: List[OrderItemIn]
    source: Optional[str] = Field(default="web", description="web|pos")


class OrderItemOut(BaseModel):
    product_id: int
    name: str
    quantity: float
    price_each: float
    subtotal: float


class OrderOut(BaseModel):
    id: int
    items: List[OrderItemOut]
    total_amount: float
    status: str
    source: str
