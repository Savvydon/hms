from pydantic import BaseModel
from datetime import date, time
from typing import Optional

class AppointmentCreate(BaseModel):
    patient_id: int
    doctor_id: int
    appointment_date: date
    appointment_time: time
    reason: Optional[str] = None

class AppointmentResponse(BaseModel):
    id: int
    patient_id: int
    doctor_id: int
    patient_name: str
    doctor_name: str
    appointment_date: date
    appointment_time: time
    reason: Optional[str]
    status: str
    notes: Optional[str]
    
    class Config:
        from_attributes = True