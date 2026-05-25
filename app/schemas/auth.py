"""Authentication-related Pydantic schemas.

UserCreate enforces:
    email     EmailStr (RFC-style validation)
    password  min_length=8 (AC)
    username  min_length=1
"""
from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    username: str = Field(..., min_length=1, max_length=64)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
