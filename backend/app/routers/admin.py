from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_role
from app.core.security import hash_password
from app.models.appointment import Appointment
from app.models.billing import Bill
from app.models.doctor import Doctor
from app.models.patient import Patient
from app.models.user import User
from app.models.pharmacy import Medicine, Prescription
from app.models.laboratory import LabTest
from app.models.audit import AuditLog
from app.models.clinical import ClinicalEncounter
from app.schemas.user import AdminUserCreate, UserResponse, UserUpdate

router = APIRouter(prefix="/admin", tags=["Administration"])


@router.get("/stats")
def get_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    return {
        "users": db.query(User).count(),
        "patients": db.query(Patient).count(),
        "doctors": db.query(Doctor).count(),
        "appointments": db.query(Appointment).count(),
        "medicines": db.query(Medicine).count(),
        "prescriptions": db.query(Prescription).count(),
        "laboratory_tests": db.query(LabTest).count(),
        "clinical_encounters": db.query(ClinicalEncounter).count(),
        "bills": db.query(Bill).count(),
        "revenue": float(db.query(func.coalesce(func.sum(Bill.paid_amount), 0)).scalar() or 0),
    }


@router.get("/users", response_model=list[UserResponse])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    return db.query(User).order_by(User.created_at.desc()).all()


@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    data: AdminUserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    if db.query(User).filter(User.email == data.email.lower()).first():
        raise HTTPException(status_code=400, detail="Email already exists")
    if db.query(User).filter(User.username == data.username).first():
        raise HTTPException(status_code=400, detail="Username already exists")

    user = User(
        first_name=data.first_name.strip(),
        last_name=data.last_name.strip(),
        email=data.email.lower(),
        username=data.username.strip(),
        password=hash_password(data.password),
        role=data.role,
        phone=data.phone,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    if data.role == "doctor":
        # Doctor profile can be completed later from the Doctors module.
        pass
    if data.role == "patient":
        db.add(Patient(user_id=user.id))
        db.commit()

    return user


@router.patch("/users/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.id == current_user.id and data.is_active is False:
        raise HTTPException(status_code=400, detail="You cannot deactivate your own account")

    values = data.model_dump(exclude_unset=True)
    for field, value in values.items():
        setattr(user, field, value)

    db.commit()
    db.refresh(user)
    return user


@router.patch("/users/{user_id}/password")
def reset_password(
    user_id: int,
    password: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    if len(password) < 8:
        raise HTTPException(status_code=422, detail="Password must be at least 8 characters")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.password = hash_password(password)
    db.commit()
    return {"message": "Password updated successfully"}


@router.get("/audit-logs")
def get_audit_logs(limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(require_role("admin"))):
    limit = max(1, min(limit, 500))
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit).all()
    result = []
    for log in logs:
        actor = db.query(User).filter(User.id == log.user_id).first() if log.user_id else None
        result.append({
            "id": log.id, "user_id": log.user_id,
            "user_name": f"{actor.first_name} {actor.last_name}" if actor else "System",
            "action": log.action, "entity_type": log.entity_type, "entity_id": log.entity_id,
            "details": log.details, "created_at": log.created_at,
        })
    return result
