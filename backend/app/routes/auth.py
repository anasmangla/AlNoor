import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.utils.security import create_access_token


router = APIRouter()


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


@router.post("/auth/login", response_model=LoginResponse)
def login(payload: LoginRequest):
    expected_user = os.getenv("ADMIN_USERNAME", "admin")
    expected_pass = os.getenv("ADMIN_PASSWORD", "admin123")

    if payload.username != expected_user or payload.password != expected_pass:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(subject=payload.username)
    return LoginResponse(access_token=token)
