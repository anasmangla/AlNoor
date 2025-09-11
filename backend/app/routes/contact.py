import os
import smtplib
from email.message import EmailMessage
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.deps import get_current_user
from app.models import ContactMessage
from app.schemas import ContactCreate, ContactOut


router = APIRouter()


@router.post("/contact", response_model=ContactOut, status_code=status.HTTP_201_CREATED)
async def create_contact(
    payload: ContactCreate, session: AsyncSession = Depends(get_session)
):
    msg = ContactMessage(
        name=payload.name or "",
        email=str(payload.email or ""),
        message=payload.message,
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
            body = f"Name: {msg.name}\nEmail: {msg.email}\n\n{msg.message}"
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
        message=msg.message,
        created_at=msg.created_at,
    )


@router.get("/admin/messages", response_model=List[ContactOut])
async def list_messages(
    user: str = Depends(get_current_user), session: AsyncSession = Depends(get_session)
):
    result = await session.execute(select(ContactMessage))
    msgs = result.scalars().all()
    return [
        ContactOut(
            id=int(m.id),
            name=m.name,
            email=m.email or None,
            message=m.message,
            created_at=m.created_at,
        )
        for m in msgs
    ]


@router.delete("/admin/messages/{message_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_message(
    message_id: int,
    user: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(select(ContactMessage).where(ContactMessage.id == message_id))
    msg = result.scalars().first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    await session.delete(msg)
    await session.commit()
    return None
