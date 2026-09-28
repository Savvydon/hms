from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.patient import Patient
from app.models.user import User
from app.schemas.patient import PatientCreate, PatientResponse

router = APIRouter(prefix="/patients", tags=["Patients"])

@router.post("/", response_model=PatientResponse)
def create_patient(
    payload: PatientCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("receptionist"))
):
    # Verify user exists
    user = db.query(User).filter(User.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if patient already exists for this user
    existing = db.query(Patient).filter(Patient.user_id == payload.user_id).first()
    if existing:
        for field, value in payload.model_dump(exclude={"user_id"}).items():
            if value is not None:
                setattr(existing, field, value)
        patient = existing
    else:
        patient = Patient(**payload.model_dump())
        db.add(patient)

    db.commit()
    db.refresh(patient)
    
    return {
        "id": patient.id,
        "user_id": patient.user_id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "gender": patient.gender,
        "blood_group": patient.blood_group,
        "address": patient.address,
        "emergency_contact": patient.emergency_contact,
        "date_of_birth": patient.date_of_birth
    }


@router.get("/", response_model=list[PatientResponse])
def get_patients(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == "patient":
        patients = db.query(Patient).filter(Patient.user_id == current_user.id).all()
    else:
        patients = db.query(Patient).all()
    result = []
    for p in patients:
        user = db.query(User).filter(User.id == p.user_id).first()
        result.append({
            "id": p.id,
            "user_id": p.user_id,
            "first_name": user.first_name if user else "",
            "last_name": user.last_name if user else "",
            "email": user.email if user else "",
            "gender": p.gender,
            "blood_group": p.blood_group,
            "address": p.address,
            "emergency_contact": p.emergency_contact,
            "date_of_birth": p.date_of_birth
        })
    return result


@router.get("/{patient_id}", response_model=PatientResponse)
def get_patient(
    patient_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    if current_user.role == "patient" and patient.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only view your own patient record")
    
    user = db.query(User).filter(User.id == patient.user_id).first()
    return {
        "id": patient.id,
        "user_id": patient.user_id,
        "first_name": user.first_name if user else "",
        "last_name": user.last_name if user else "",
        "email": user.email if user else "",
        "gender": patient.gender,
        "blood_group": patient.blood_group,
        "address": patient.address,
        "emergency_contact": patient.emergency_contact,
        "date_of_birth": patient.date_of_birth
    }