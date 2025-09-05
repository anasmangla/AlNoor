from typing import List
from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy import select
from sqlalchemy.exc import NoResultFound
from sqlalchemy.ext.asyncio import AsyncSession
from app.deps import get_current_user
from app.database import get_session
from app.models import Product as ProductModel
from app.schemas import ProductCreate, ProductUpdate, ProductOut


router = APIRouter()


@router.get("/products", response_model=List[ProductOut])
async def list_products(session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(ProductModel))
    rows = result.scalars().all()
    return [ProductOut(id=p.id, name=p.name, price=p.price, stock=p.stock) for p in rows]


@router.get("/products/{product_id}", response_model=ProductOut)
async def get_product(product_id: int, session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(ProductModel).where(ProductModel.id == product_id))
    p = result.scalars().first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    return ProductOut(id=p.id, name=p.name, price=p.price, stock=p.stock)


@router.post("/products", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
async def create_product(
    payload: ProductCreate,
    session: AsyncSession = Depends(get_session),
    user: str = Depends(get_current_user),
):
    p = ProductModel(name=payload.name, price=payload.price, stock=payload.stock or 0)
    session.add(p)
    await session.commit()
    await session.refresh(p)
    return ProductOut(id=p.id, name=p.name, price=p.price, stock=p.stock)


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
    await session.commit()
    await session.refresh(p)
    return ProductOut(id=p.id, name=p.name, price=p.price, stock=p.stock)


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
