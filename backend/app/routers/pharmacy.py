from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.pharmacy import Medicine, Prescription
from app.models.inventory import InventoryTransaction
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.models.user import User
from app.models.notification import Notification
from app.models.audit import AuditLog

router=APIRouter(prefix="/pharmacy",tags=["Pharmacy"])

@router.post("/medicines")
def create_medicine(name:str,generic_name:str=None,category:str=None,unit_price:float=0.0,stock_quantity:int=0,manufacturer:str=None,db:Session=Depends(get_db),current_user:User=Depends(require_role("pharmacist"))):
    if unit_price<0 or stock_quantity<0: raise HTTPException(422,"Price and stock cannot be negative")
    m=Medicine(name=name.strip(),generic_name=generic_name,category=category,unit_price=unit_price,stock_quantity=stock_quantity,manufacturer=manufacturer); db.add(m); db.flush()
    if stock_quantity: db.add(InventoryTransaction(medicine_id=m.id,quantity=stock_quantity,transaction_type="receipt",performed_by_id=current_user.id))
    db.add(AuditLog(user_id=current_user.id,action="CREATE_MEDICINE",entity_type="medicine",entity_id=str(m.id))); db.commit(); db.refresh(m); return m

@router.get("/medicines")
def get_medicines(db:Session=Depends(get_db),current_user:User=Depends(get_current_user)): return db.query(Medicine).order_by(Medicine.name).all()

@router.post("/medicines/{medicine_id}/stock")
def adjust_stock(medicine_id:int,quantity:int,transaction_type:str="receipt",reference:str=None,db:Session=Depends(get_db),current_user:User=Depends(require_role("pharmacist"))):
    m=db.query(Medicine).filter(Medicine.id==medicine_id).first()
    if not m: raise HTTPException(404,"Medicine not found")
    if transaction_type not in {"receipt","adjustment","return"}: raise HTTPException(422,"Invalid stock transaction type")
    if quantity<=0: raise HTTPException(422,"Quantity must be greater than zero")
    m.stock_quantity+=quantity; db.add(InventoryTransaction(medicine_id=m.id,quantity=quantity,transaction_type=transaction_type,reference=reference,performed_by_id=current_user.id)); db.commit(); db.refresh(m); return m

@router.post("/prescriptions")
def create_prescription(patient_id:int,medicine_id:int,dosage:str,frequency:str=None,duration:str=None,quantity:int=1,instructions:str=None,doctor_id:int=None,db:Session=Depends(get_db),current_user:User=Depends(require_role("doctor"))):
    patient=db.query(Patient).filter(Patient.id==patient_id).first(); medicine=db.query(Medicine).filter(Medicine.id==medicine_id).first()
    if not patient: raise HTTPException(404,"Patient not found")
    if not medicine: raise HTTPException(404,"Medicine not found")
    doctor=db.query(Doctor).filter(Doctor.user_id==current_user.id).first()
    p=Prescription(patient_id=patient_id,doctor_id=doctor.id if doctor else doctor_id,medicine_id=medicine_id,dosage=dosage,frequency=frequency,duration=duration,quantity=quantity,instructions=instructions); db.add(p); db.flush()
    db.add(Notification(user_id=patient.user_id,title="New prescription",message=f"A prescription for {medicine.name} has been issued.",notification_type="pharmacy")); db.add(AuditLog(user_id=current_user.id,action="CREATE_PRESCRIPTION",entity_type="prescription",entity_id=str(p.id))); db.commit(); db.refresh(p); return p

@router.get("/prescriptions")
def get_prescriptions(db:Session=Depends(get_db),current_user:User=Depends(get_current_user)):
    q=db.query(Prescription).order_by(Prescription.created_at.desc())
    if current_user.role=="patient":
        p=db.query(Patient).filter(Patient.user_id==current_user.id).first(); q=q.filter(Prescription.patient_id==p.id) if p else q.filter(False)
    elif current_user.role not in {"admin","doctor","pharmacist"}: raise HTTPException(403,"You do not have permission to view prescriptions")
    result=[]
    for p in q.all():
        patient=db.query(Patient).filter(Patient.id==p.patient_id).first(); u=db.query(User).filter(User.id==patient.user_id).first() if patient else None; m=db.query(Medicine).filter(Medicine.id==p.medicine_id).first()
        result.append({"id":p.id,"patient_id":p.patient_id,"patient_name":f"{u.first_name} {u.last_name}" if u else "Unknown","medicine_id":p.medicine_id,"medicine_name":m.name if m else "Unknown","dosage":p.dosage,"frequency":p.frequency,"duration":p.duration,"quantity":p.quantity,"instructions":p.instructions,"status":p.status,"created_at":p.created_at,"dispensed_at":p.dispensed_at})
    return result

@router.patch("/prescriptions/{prescription_id}/dispense")
def dispense(prescription_id:int,db:Session=Depends(get_db),current_user:User=Depends(require_role("pharmacist"))):
    p=db.query(Prescription).filter(Prescription.id==prescription_id).first()
    if not p: raise HTTPException(404,"Prescription not found")
    if p.status=="dispensed": raise HTTPException(409,"Prescription has already been dispensed")
    m=db.query(Medicine).filter(Medicine.id==p.medicine_id).first()
    if not m or m.stock_quantity<p.quantity: raise HTTPException(409,"Insufficient medicine stock")
    m.stock_quantity-=p.quantity; p.status="dispensed"; p.dispensed_at=datetime.now(timezone.utc); p.dispensed_by_id=current_user.id
    db.add(InventoryTransaction(medicine_id=m.id,quantity=-p.quantity,transaction_type="dispense",reference=f"prescription:{p.id}",performed_by_id=current_user.id)); db.add(AuditLog(user_id=current_user.id,action="DISPENSE_MEDICINE",entity_type="prescription",entity_id=str(p.id)))
    db.commit(); return {"message":"Medicine dispensed","prescription_id":p.id,"remaining_stock":m.stock_quantity}
