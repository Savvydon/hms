from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class BillCreate(BaseModel):
    patient_id: int
    appointment_id: Optional[int] = None
    total_amount: float
    payment_method: Optional[str] = None

class BillResponse(BaseModel):
    id: int
    patient_id: int
    patient_name: str
    total_amount: float
    paid_amount: float
    status: str
    payment_method: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True