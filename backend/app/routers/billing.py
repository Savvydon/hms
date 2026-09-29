from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.billing import Bill
from app.models.payment import Payment
from app.models.patient import Patient
from app.models.user import User
from app.models.audit import AuditLog
from app.models.notification import Notification
from app.schemas.billing import BillCreate, BillResponse

router=APIRouter(prefix="/billing",tags=["Billing"])

def serialize(b,db):
    p=db.query(Patient).filter(Patient.id==b.patient_id).first(); u=db.query(User).filter(User.id==p.user_id).first() if p else None
    return {"id":b.id,"patient_id":b.patient_id,"patient_name":f"{u.first_name} {u.last_name}" if u else "Unknown","total_amount":b.total_amount,"paid_amount":b.paid_amount,"status":b.status,"payment_method":b.payment_method,"created_at":b.created_at}

@router.post("/",response_model=BillResponse)
def create_bill(payload:BillCreate,db:Session=Depends(get_db),current_user:User=Depends(require_role("accountant"))):
    if not db.query(Patient).filter(Patient.id==payload.patient_id).first(): raise HTTPException(404,"Patient not found")
    if payload.total_amount<=0: raise HTTPException(422,"Total amount must be greater than zero")
    b=Bill(**payload.model_dump()); db.add(b); db.flush(); db.add(AuditLog(user_id=current_user.id,action="CREATE_BILL",entity_type="bill",entity_id=str(b.id))); db.commit(); db.refresh(b); return serialize(b,db)

@router.get("/",response_model=list[BillResponse])
def get_bills(db:Session=Depends(get_db),current_user:User=Depends(get_current_user)):
    q=db.query(Bill).order_by(Bill.created_at.desc())
    if current_user.role=="patient":
        p=db.query(Patient).filter(Patient.user_id==current_user.id).first(); q=q.filter(Bill.patient_id==p.id) if p else q.filter(False)
    elif current_user.role not in {"admin","accountant"}: raise HTTPException(403,"You do not have permission to view billing records")
    return [serialize(b,db) for b in q.all()]

@router.get("/{bill_id}/payments")
def get_payments(bill_id:int,db:Session=Depends(get_db),current_user:User=Depends(get_current_user)):
    b=db.query(Bill).filter(Bill.id==bill_id).first()
    if not b: raise HTTPException(404,"Bill not found")
    if current_user.role=="patient":
        p=db.query(Patient).filter(Patient.user_id==current_user.id).first()
        if not p or b.patient_id!=p.id: raise HTTPException(403,"You can only view your own payments")
    elif current_user.role not in {"admin","accountant"}: raise HTTPException(403,"Not authorized")
    return db.query(Payment).filter(Payment.bill_id==bill_id).order_by(Payment.created_at.desc()).all()

@router.get("/stats")
def get_billing_stats(db:Session=Depends(get_db),current_user:User=Depends(require_role("admin"))):
    return {"total_revenue":float(db.query(func.coalesce(func.sum(Bill.paid_amount),0)).scalar() or 0),"pending_amount":float(db.query(func.coalesce(func.sum(Bill.total_amount-Bill.paid_amount),0)).scalar() or 0),"total_bills":db.query(Bill).count()}

@router.post("/{bill_id}/payments")
def process_payment(bill_id:int,amount:float,payment_method:str="cash",reference:str=None,db:Session=Depends(get_db),current_user:User=Depends(require_role("accountant"))):
    b=db.query(Bill).filter(Bill.id==bill_id).first()
    if not b: raise HTTPException(404,"Bill not found")
    if amount<=0: raise HTTPException(422,"Payment amount must be greater than zero")
    if b.paid_amount+amount>b.total_amount: raise HTTPException(422,"Payment exceeds outstanding balance")
    payment=Payment(bill_id=b.id,amount=amount,payment_method=payment_method,reference=reference,received_by_id=current_user.id); db.add(payment)
    b.paid_amount+=amount; b.payment_method=payment_method; b.status="paid" if b.paid_amount>=b.total_amount else "partially_paid"
    db.add(AuditLog(user_id=current_user.id,action="RECORD_PAYMENT",entity_type="bill",entity_id=str(b.id)))
    p=db.query(Patient).filter(Patient.id==b.patient_id).first()
    if p: db.add(Notification(user_id=p.user_id,title="Payment received",message=f"A payment of {amount:.2f} has been recorded on bill #{b.id}.",notification_type="billing"))
    db.commit(); return {"message":"Payment processed","payment_id":payment.id,"paid_amount":b.paid_amount,"balance":b.total_amount-b.paid_amount,"status":b.status}


@router.patch("/{bill_id}/pay")
def legacy_process_payment(bill_id: int, amount: float, db: Session = Depends(get_db), current_user: User = Depends(require_role("accountant"))):
    return process_payment(bill_id, amount, "cash", None, db, current_user)
