from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.appointment import Appointment
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.models.user import User
from app.schemas.appointment import AppointmentCreate, AppointmentResponse

router = APIRouter(prefix="/appointments", tags=["Appointments"])

@router.post("/", response_model=AppointmentResponse)
def create_appointment(
    payload: AppointmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("receptionist"))
):
    # Verify patient exists
    patient = db.query(Patient).filter(Patient.id == payload.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Verify doctor exists
    doctor = db.query(Doctor).filter(Doctor.id == payload.doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    appointment = Appointment(**payload.model_dump())
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    
    patient_user = db.query(User).filter(User.id == patient.user_id).first()
    doctor_user = db.query(User).filter(User.id == doctor.user_id).first()
    
    return {
        "id": appointment.id,
        "patient_id": appointment.patient_id,
        "doctor_id": appointment.doctor_id,
        "patient_name": f"{patient_user.first_name} {patient_user.last_name}" if patient_user else "Unknown",
        "doctor_name": f"{doctor_user.first_name} {doctor_user.last_name}" if doctor_user else "Unknown",
        "appointment_date": appointment.appointment_date,
        "appointment_time": appointment.appointment_time,
        "reason": appointment.reason,
        "status": appointment.status,
        "notes": appointment.notes
    }


@router.get("/", response_model=list[AppointmentResponse])
def get_appointments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    appointments = db.query(Appointment).all()
    result = []
    for a in appointments:
        patient = db.query(Patient).filter(Patient.id == a.patient_id).first()
        doctor = db.query(Doctor).filter(Doctor.id == a.doctor_id).first()
        patient_user = db.query(User).filter(User.id == patient.user_id).first() if patient else None
        doctor_user = db.query(User).filter(User.id == doctor.user_id).first() if doctor else None
        
        result.append({
            "id": a.id,
            "patient_id": a.patient_id,
            "doctor_id": a.doctor_id,
            "patient_name": f"{patient_user.first_name} {patient_user.last_name}" if patient_user else "Unknown",
            "doctor_name": f"{doctor_user.first_name} {doctor_user.last_name}" if doctor_user else "Unknown",
            "appointment_date": a.appointment_date,
            "appointment_time": a.appointment_time,
            "reason": a.reason,
            "status": a.status,
            "notes": a.notes
        })
    return result


@router.patch("/{appointment_id}/status")
def update_status(
    appointment_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("doctor"))
):
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    appointment.status = status
    db.commit()
    db.refresh(appointment)
    return {"message": "Status updated", "status": appointment.status}