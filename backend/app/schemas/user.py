from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class UserBase(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    role: str = Field(..., pattern="^(admin|doctor|nurse|receptionist|pharmacist|laboratory|accountant|patient)$")
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserResponse(UserBase):
    id: int
    is_active: bool
    
    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str