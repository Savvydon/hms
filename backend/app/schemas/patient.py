from pydantic import BaseModel
from datetime import date
from typing import Optional

class PatientCreate(BaseModel):
    user_id: int
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    date_of_birth: Optional[date] = None

class PatientResponse(BaseModel):
    id: int
    user_id: int
    first_name: str
    last_name: str
    email: str
    gender: Optional[str]
    blood_group: Optional[str]
    address: Optional[str]
    emergency_contact: Optional[str]
    date_of_birth: Optional[date]
    
    class Config:
        from_attributes = True