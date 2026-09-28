from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.doctor import Doctor
from app.models.user import User
from app.schemas.doctor import DoctorCreate, DoctorResponse

router = APIRouter(prefix="/doctors", tags=["Doctors"])

@router.post("/", response_model=DoctorResponse)
def create_doctor(
    payload: DoctorCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    user = db.query(User).filter(User.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    existing = db.query(Doctor).filter(Doctor.user_id == payload.user_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Doctor profile already exists")

    doctor = Doctor(**payload.model_dump())
    db.add(doctor)
    db.commit()
    db.refresh(doctor)
    
    return {
        "id": doctor.id,
        "user_id": doctor.user_id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "specialization": doctor.specialization,
        "department": doctor.department,
        "consultation_fee": doctor.consultation_fee,
        "license_number": doctor.license_number
    }


@router.get("/", response_model=list[DoctorResponse])
def get_doctors(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doctors = db.query(Doctor).all()
    result = []
    for d in doctors:
        user = db.query(User).filter(User.id == d.user_id).first()
        result.append({
            "id": d.id,
            "user_id": d.user_id,
            "first_name": user.first_name if user else "",
            "last_name": user.last_name if user else "",
            "email": user.email if user else "",
            "specialization": d.specialization,
            "department": d.department,
            "consultation_fee": d.consultation_fee,
            "license_number": d.license_number
        })
    return result


@router.get("/{doctor_id}", response_model=DoctorResponse)
def get_doctor(
    doctor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    user = db.query(User).filter(User.id == doctor.user_id).first()
    return {
        "id": doctor.id,
        "user_id": doctor.user_id,
        "first_name": user.first_name if user else "",
        "last_name": user.last_name if user else "",
        "email": user.email if user else "",
        "specialization": doctor.specialization,
        "department": doctor.department,
        "consultation_fee": doctor.consultation_fee,
        "license_number": doctor.license_number
    }