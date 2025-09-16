from datetime import datetime, timedelta
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.models import Review
from app.schemas import ReviewCreate, ReviewOut


router = APIRouter()


def _serialize_review(review: Review) -> ReviewOut:
    return ReviewOut(
        id=int(review.id),
        name=review.name or "Anonymous",
        location=review.location or None,
        rating=review.rating,
        message=review.message,
        photo_url=review.photo_url or None,
        created_at=review.created_at,
    )


@router.post("/reviews", response_model=ReviewOut, status_code=status.HTTP_201_CREATED)
async def create_review(
    payload: ReviewCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
) -> ReviewOut:
    client_ip = request.client.host if request.client else ""
    window_start = datetime.utcnow() - timedelta(minutes=10)
    result = await session.execute(
        select(Review).where(Review.created_at >= window_start)
    )
    recent = [review for review in result.scalars().all() if review.ip == client_ip]
    if len(recent) >= 5:
        raise HTTPException(
            status_code=429,
            detail="Too many reviews submitted recently. Please try again later.",
        )

    name = (payload.name or "").strip()
    location = (payload.location or "").strip()
    message = payload.message.strip()
    photo_url = (payload.photo_url or "").strip()

    if not message:
        raise HTTPException(status_code=400, detail="Review message cannot be empty.")

    review = Review(
        name=name,
        location=location,
        rating=payload.rating,
        message=message,
        photo_url=photo_url,
        ip=client_ip,
    )
    session.add(review)
    await session.commit()
    await session.refresh(review)

    return _serialize_review(review)


@router.get("/reviews", response_model=List[ReviewOut])
async def list_reviews(session: AsyncSession = Depends(get_session)) -> List[ReviewOut]:
    result = await session.execute(
        select(Review).order_by(Review.created_at.desc())
    )
    reviews = result.scalars().all()
    return [_serialize_review(review) for review in reviews]
