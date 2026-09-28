from typing import Optional
from datetime import date, datetime

from pydantic import BaseModel, EmailStr, Field


ROLE_PATTERN = "^(admin|doctor|nurse|receptionist|pharmacist|laboratory|accountant|patient)$"


class UserBase(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    phone: Optional[str] = Field(default=None, max_length=20)


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)


class PublicRegistration(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8)
    phone: Optional[str] = Field(default=None, max_length=20)
    gender: Optional[str] = Field(default=None, max_length=20)
    blood_group: Optional[str] = Field(default=None, max_length=5)
    address: Optional[str] = Field(default=None, max_length=255)
    emergency_contact: Optional[str] = Field(default=None, max_length=100)
    date_of_birth: Optional[date] = None


class AdminUserCreate(UserCreate):
    role: str = Field(..., pattern=ROLE_PATTERN)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(UserBase):
    id: int
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    first_name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    phone: Optional[str] = Field(default=None, max_length=20)
    role: Optional[str] = Field(default=None, pattern=ROLE_PATTERN)
    is_active: Optional[bool] = None
