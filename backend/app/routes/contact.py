import os
import smtplib
from email.message import EmailMessage
from typing import List

from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.deps import get_current_user
from app.models import ContactMessage, User
from app.schemas import ContactCreate, ContactOut


router = APIRouter()


@router.post("/contact", response_model=ContactOut, status_code=status.HTTP_201_CREATED)
async def create_contact(
    payload: ContactCreate, request: Request, session: AsyncSession = Depends(get_session)
):
    # Basic rate limiting by IP, email, and phone within a rolling 10 minute window
    client_ip = request.client.host if request.client else ""
    window = datetime.utcnow() - timedelta(minutes=10)
    email = str(payload.email) if payload.email else None
    phone = str(payload.phone) if payload.phone else None

    match_clauses = [ContactMessage.ip == client_ip]
    if email:
        match_clauses.append(ContactMessage.email == email)
    if phone:
        match_clauses.append(ContactMessage.phone == phone)

    rate_limit_query = (
        select(ContactMessage)
        .where(ContactMessage.created_at >= window)
        .where(or_(*match_clauses))
    )
    recent = (await session.execute(rate_limit_query)).scalars().all()
    if len(recent) >= 3:
        raise HTTPException(status_code=429, detail="Too many messages, please try later")
    msg = ContactMessage(
        name=payload.name or "",
        email=str(payload.email or ""),
        phone=str(payload.phone or ""),
        message=payload.message,
        ip=client_ip,
    )
    session.add(msg)
    await session.commit()
    await session.refresh(msg)

    # Optional email relay via SMTP
    host = os.getenv("SMTP_HOST")
    to_addr = os.getenv("CONTACT_TO")
    if host and to_addr:
        try:
            smtp_port = int(os.getenv("SMTP_PORT", "587"))
            smtp_user = os.getenv("SMTP_USER")
            smtp_pass = os.getenv("SMTP_PASS")
            use_tls = os.getenv("SMTP_TLS", "true").lower() != "false"

            email_msg = EmailMessage()
            email_msg["Subject"] = f"New Contact Message from {msg.name or 'Website'}"
            email_msg["From"] = smtp_user or to_addr
            email_msg["To"] = to_addr
            body = f"Name: {msg.name}\nEmail: {msg.email}\nPhone: {msg.phone}\n\n{msg.message}"
            email_msg.set_content(body)

            with smtplib.SMTP(host, smtp_port, timeout=10) as server:
                if use_tls:
                    server.starttls()
                if smtp_user and smtp_pass:
                    server.login(smtp_user, smtp_pass)
                server.send_message(email_msg)
        except Exception:
            # Ignore email failures; message is stored regardless
            pass

    return ContactOut(
        id=int(msg.id),
        name=msg.name,
        email=msg.email or None,
        phone=msg.phone or None,
        message=msg.message,
        created_at=msg.created_at,
    )


@router.get("/admin/messages", response_model=List[ContactOut])
async def list_messages(
    user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)
):
    result = await session.execute(select(ContactMessage))
    msgs = result.scalars().all()
    return [
        ContactOut(
            id=int(m.id),
            name=m.name,
            email=m.email or None,
            phone=m.phone or None,
            message=m.message,
            created_at=m.created_at,
        )
        for m in msgs
    ]


@router.delete("/admin/messages/{message_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_message(
    message_id: int,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(select(ContactMessage).where(ContactMessage.id == message_id))
    msg = result.scalars().first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    await session.delete(msg)
    await session.commit()
    return None
