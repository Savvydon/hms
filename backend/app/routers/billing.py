from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.billing import Bill
from app.models.patient import Patient
from app.models.user import User
from app.schemas.billing import BillCreate, BillResponse

router = APIRouter(prefix="/billing", tags=["Billing"])

@router.post("/", response_model=BillResponse)
def create_bill(
    payload: BillCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("accountant"))
):
    patient = db.query(Patient).filter(Patient.id == payload.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    bill = Bill(**payload.model_dump())
    db.add(bill)
    db.commit()
    db.refresh(bill)
    
    user = db.query(User).filter(User.id == patient.user_id).first()
    
    return {
        "id": bill.id,
        "patient_id": bill.patient_id,
        "patient_name": f"{user.first_name} {user.last_name}" if user else "Unknown",
        "total_amount": bill.total_amount,
        "paid_amount": bill.paid_amount,
        "status": bill.status,
        "payment_method": bill.payment_method,
        "created_at": bill.created_at
    }


@router.get("/", response_model=list[BillResponse])
def get_bills(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    bills = db.query(Bill).all()
    result = []
    for b in bills:
        patient = db.query(Patient).filter(Patient.id == b.patient_id).first()
        user = db.query(User).filter(User.id == patient.user_id).first() if patient else None
        result.append({
            "id": b.id,
            "patient_id": b.patient_id,
            "patient_name": f"{user.first_name} {user.last_name}" if user else "Unknown",
            "total_amount": b.total_amount,
            "paid_amount": b.paid_amount,
            "status": b.status,
            "payment_method": b.payment_method,
            "created_at": b.created_at
        })
    return result


@router.get("/stats")
def get_billing_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    total_revenue = db.query(func.sum(Bill.paid_amount)).scalar() or 0
    pending = db.query(func.sum(Bill.total_amount - Bill.paid_amount)).filter(Bill.status == "pending").scalar() or 0
    total_bills = db.query(Bill).count()
    
    return {
        "total_revenue": total_revenue,
        "pending_amount": pending,
        "total_bills": total_bills
    }


@router.patch("/{bill_id}/pay")
def process_payment(
    bill_id: int,
    amount: float,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("accountant"))
):
    bill = db.query(Bill).filter(Bill.id == bill_id).first()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    
    bill.paid_amount += amount
    if bill.paid_amount >= bill.total_amount:
        bill.status = "paid"
    else:
        bill.status = "partially_paid"
    
    db.commit()
    db.refresh(bill)
    return {"message": "Payment processed", "paid_amount": bill.paid_amount, "status": bill.status}