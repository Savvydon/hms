from pydantic import BaseModel
from typing import Optional

class DoctorCreate(BaseModel):
    user_id: int
    specialization: str
    department: str
    consultation_fee: float = 0.0
    license_number: Optional[str] = None

class DoctorResponse(BaseModel):
    id: int
    user_id: int
    first_name: str
    last_name: str
    email: str
    specialization: str
    department: str
    consultation_fee: float
    license_number: Optional[str]
    
    class Config:
        from_attributes = True