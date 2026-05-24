from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.pharmacy import Medicine, Prescription
from app.models.patient import Patient
from app.models.user import User

router = APIRouter(prefix="/pharmacy", tags=["Pharmacy"])

@router.post("/medicines")
def create_medicine(
    name: str,
    generic_name: str = None,
    category: str = None,
    unit_price: float = 0.0,
    stock_quantity: int = 0,
    manufacturer: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("pharmacist"))
):
    medicine = Medicine(
        name=name,
        generic_name=generic_name,
        category=category,
        unit_price=unit_price,
        stock_quantity=stock_quantity,
        manufacturer=manufacturer
    )
    db.add(medicine)
    db.commit()
    db.refresh(medicine)
    return medicine


@router.get("/medicines")
def get_medicines(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Medicine).all()


@router.post("/prescriptions")
def create_prescription(
    patient_id: int,
    medicine_id: int,
    dosage: str,
    frequency: str = None,
    duration: str = None,
    doctor_id: int = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("doctor"))
):
    prescription = Prescription(
        patient_id=patient_id,
        doctor_id=doctor_id,
        medicine_id=medicine_id,
        dosage=dosage,
        frequency=frequency,
        duration=duration
    )
    db.add(prescription)
    db.commit()
    db.refresh(prescription)
    return prescription


@router.get("/prescriptions")
def get_prescriptions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    prescriptions = db.query(Prescription).all()
    result = []
    for p in prescriptions:
        patient = db.query(Patient).filter(Patient.id == p.patient_id).first()
        user = db.query(User).filter(User.id == patient.user_id).first() if patient else None
        medicine = db.query(Medicine).filter(Medicine.id == p.medicine_id).first()
        result.append({
            "id": p.id,
            "patient_name": f"{user.first_name} {user.last_name}" if user else "Unknown",
            "medicine_name": medicine.name if medicine else "Unknown",
            "dosage": p.dosage,
            "frequency": p.frequency,
            "status": p.status
        })
    return result