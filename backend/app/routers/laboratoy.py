from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.laboratory import LabTest
from app.models.patient import Patient
from app.models.user import User

router = APIRouter(prefix="/laboratory", tags=["Laboratory"])

@router.post("/tests")
def create_test(
    patient_id: int,
    test_name: str,
    test_type: str = None,
    doctor_id: int = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("doctor"))
):
    test = LabTest(
        patient_id=patient_id,
        doctor_id=doctor_id,
        test_name=test_name,
        test_type=test_type
    )
    db.add(test)
    db.commit()
    db.refresh(test)
    return test


@router.get("/tests")
def get_tests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tests = db.query(LabTest).all()
    result = []
    for t in tests:
        patient = db.query(Patient).filter(Patient.id == t.patient_id).first()
        user = db.query(User).filter(User.id == patient.user_id).first() if patient else None
        result.append({
            "id": t.id,
            "patient_name": f"{user.first_name} {user.last_name}" if user else "Unknown",
            "test_name": t.test_name,
            "test_type": t.test_type,
            "status": t.status,
            "result": t.result,
            "ordered_date": t.ordered_date
        })
    return result


@router.patch("/tests/{test_id}/result")
def update_test_result(
    test_id: int,
    result: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("laboratory"))
):
    test = db.query(LabTest).filter(LabTest.id == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    
    from datetime import datetime, timezone
    test.result = result
    test.status = "completed"
    test.completed_date = datetime.now(timezone.utc)
    db.commit()
    db.refresh(test)
    return {"message": "Result updated", "test": test}