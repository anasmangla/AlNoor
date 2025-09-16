from datetime import datetime, timedelta
from typing import Dict, List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.deps import get_current_user
from app.models import VisitorFeedback
from app.schemas import (
    FeedbackCreate,
    FeedbackInterestCount,
    FeedbackOut,
    FeedbackSummary,
)


router = APIRouter()


@router.post("/feedback", response_model=FeedbackOut, status_code=status.HTTP_201_CREATED)
async def create_feedback(
    payload: FeedbackCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
) -> FeedbackOut:
    client_ip = request.client.host if request.client else ""
    window_start = datetime.utcnow() - timedelta(minutes=10)
    result = await session.execute(
        select(VisitorFeedback).where(VisitorFeedback.created_at >= window_start)
    )
    recent = [
        item
        for item in result.scalars().all()
        if (
            item.ip == client_ip
            or (payload.email and item.email == str(payload.email))
        )
    ]
    if len(recent) >= 3:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many submissions, please try later",
        )

    entry = VisitorFeedback(
        name=payload.name or "",
        email=str(payload.email or ""),
        rating=int(payload.rating),
        interest=payload.interest or "",
        comments=payload.comments or "",
        ip=client_ip,
    )
    session.add(entry)
    await session.commit()
    await session.refresh(entry)

    return FeedbackOut(
        id=int(entry.id),
        name=entry.name,
        email=entry.email or None,
        rating=int(entry.rating),
        interest=entry.interest or None,
        comments=entry.comments or None,
        created_at=entry.created_at,
    )


@router.get("/admin/feedback", response_model=List[FeedbackOut])
async def list_feedback(
    user: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> List[FeedbackOut]:
    result = await session.execute(
        select(VisitorFeedback).order_by(VisitorFeedback.created_at.desc())
    )
    entries = result.scalars().all()
    return [
        FeedbackOut(
            id=int(item.id),
            name=item.name,
            email=item.email or None,
            rating=int(item.rating),
            interest=item.interest or None,
            comments=item.comments or None,
            created_at=item.created_at,
        )
        for item in entries
    ]


@router.delete("/admin/feedback/{feedback_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_feedback(
    feedback_id: int,
    user: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> None:
    result = await session.execute(
        select(VisitorFeedback).where(VisitorFeedback.id == feedback_id)
    )
    entry = result.scalars().first()
    if not entry:
        raise HTTPException(status_code=404, detail="Feedback not found")
    await session.delete(entry)
    await session.commit()
    return None


def _next_quarter_start(dt: datetime) -> datetime:
    quarter_index = (dt.month - 1) // 3
    next_quarter_index = (quarter_index + 1) % 4
    year = dt.year + (1 if quarter_index >= 3 else 0)
    month = (next_quarter_index * 3) + 1
    return datetime(year=year, month=month, day=1)


@router.get("/admin/feedback/summary", response_model=FeedbackSummary)
async def feedback_summary(
    user: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> FeedbackSummary:
    result = await session.execute(select(VisitorFeedback))
    entries = result.scalars().all()
    total = len(entries)

    ratings = [int(item.rating) for item in entries if int(item.rating) > 0]
    average_rating = round(sum(ratings) / len(ratings), 2) if ratings else None

    interest_counts: Dict[str, int] = {}
    for item in entries:
        interest_label = (item.interest or "").strip() or "Unspecified"
        interest_counts[interest_label] = interest_counts.get(interest_label, 0) + 1

    breakdown = [
        FeedbackInterestCount(interest=label, count=count)
        for label, count in sorted(
            interest_counts.items(), key=lambda entry: (-entry[1], entry[0].lower())
        )
    ]

    last_submission = max((item.created_at for item in entries), default=None)
    next_review = _next_quarter_start(datetime.utcnow())

    return FeedbackSummary(
        total_submissions=total,
        average_rating=average_rating,
        interest_breakdown=breakdown,
        last_submission=last_submission,
        next_quarterly_review=next_review,
    )
