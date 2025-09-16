from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field, EmailStr


class ProductBase(BaseModel):
    name: str = Field(..., max_length=100)
    price: float = Field(..., ge=0)
    stock: float = Field(0, ge=0)
    unit: str = Field("", max_length=50)
    is_weight_based: bool = False
    image_url: Optional[str] = Field(default="", max_length=500)
    description: Optional[str] = Field(default="", max_length=2000)
    weight: float = Field(0, ge=0)
    cut_type: Optional[str] = Field(default="", max_length=100)
    price_per_unit: float = Field(0, ge=0)
    origin: Optional[str] = Field(default="", max_length=100)


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(default=None, max_length=100)
    price: Optional[float] = Field(default=None, ge=0)
    stock: Optional[float] = Field(default=None, ge=0)
    unit: Optional[str] = Field(default=None, max_length=50)
    is_weight_based: Optional[bool] = None
    image_url: Optional[str] = Field(default=None, max_length=500)
    description: Optional[str] = Field(default=None, max_length=2000)
    weight: Optional[float] = Field(default=None, ge=0)
    cut_type: Optional[str] = Field(default=None, max_length=100)
    price_per_unit: Optional[float] = Field(default=None, ge=0)
    origin: Optional[str] = Field(default=None, max_length=100)


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
    payment_token: Optional[str] = Field(
        default=None, description="Square payment token (nonce) if using sandbox"
    )


class OrderItemOut(BaseModel):
    product_id: int
    name: str
    unit: str
    quantity: float
    price_each: float
    subtotal: float


class OrderOut(BaseModel):
    id: int
    items: List[OrderItemOut]
    total_amount: float
    status: str
    source: str
    customer_name: Optional[str] = None
    customer_email: Optional[EmailStr] = None
    created_at: Optional[datetime] = None


class ContactCreate(BaseModel):
    name: Optional[str] = Field(default="", max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(default=None, max_length=30)
    message: str = Field(..., max_length=4000)


class ContactOut(BaseModel):
    id: int
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    message: str
    created_at: datetime


class OrderUpdate(BaseModel):
    status: str = Field(..., description="Order status, e.g., pending|paid|processing|completed|cancelled")
