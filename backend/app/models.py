from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field


class Product(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    price: float
    stock: float = 0.0
    unit: str = ""
    is_weight_based: bool = False
    image_url: str = ""


class Order(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    total_amount: float
    status: str
    source: str
    customer_name: Optional[str] = ""
    customer_email: Optional[str] = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)


class OrderItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    order_id: int = Field(foreign_key="order.id")
    product_id: int = Field(foreign_key="product.id")
    name: str
    unit: str = ""
    quantity: float
    price_each: float


class ContactMessage(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = ""
    email: str = ""
    message: str = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)
    ip: str = ""
