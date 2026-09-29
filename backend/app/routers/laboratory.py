from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.laboratory import LabTest
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.models.user import User
from app.models.notification import Notification
from app.models.audit import AuditLog

router=APIRouter(prefix="/laboratory",tags=["Laboratory"])
LAB_STATUSES={"requested","specimen_received","processing","result_entered","validated","released","cancelled"}

@router.post("/tests")
def create_test(patient_id:int,test_name:str,test_type:str=None,doctor_id:int=None,db:Session=Depends(get_db),current_user:User=Depends(require_role("doctor"))):
    patient=db.query(Patient).filter(Patient.id==patient_id).first()
    if not patient: raise HTTPException(404,"Patient not found")
    doctor=db.query(Doctor).filter(Doctor.user_id==current_user.id).first()
    if not doctor: raise HTTPException(400,"Doctor profile not found")
    test=LabTest(patient_id=patient_id,doctor_id=doctor.id,test_name=test_name,test_type=test_type,status="requested"); db.add(test); db.flush()
    db.add(AuditLog(user_id=current_user.id,action="ORDER_LAB_TEST",entity_type="lab_test",entity_id=str(test.id)))
    db.add(Notification(user_id=patient.user_id,title="Laboratory test ordered",message=f"A laboratory test ({test_name}) has been ordered.",notification_type="laboratory"))
    db.commit(); db.refresh(test); return test

@router.get("/tests")
def get_tests(db:Session=Depends(get_db),current_user:User=Depends(get_current_user)):
    q=db.query(LabTest).order_by(LabTest.ordered_date.desc())
    if current_user.role=="patient":
        p=db.query(Patient).filter(Patient.user_id==current_user.id).first(); q=q.filter(LabTest.patient_id==p.id, LabTest.status=="released") if p else q.filter(False)
    elif current_user.role=="doctor":
        d=db.query(Doctor).filter(Doctor.user_id==current_user.id).first(); q=q.filter(LabTest.doctor_id==d.id) if d else q.filter(False)
    elif current_user.role not in {"admin","laboratory"}: raise HTTPException(403,"You do not have permission to view laboratory records")
    result=[]
    for t in q.all():
        patient=db.query(Patient).filter(Patient.id==t.patient_id).first(); u=db.query(User).filter(User.id==patient.user_id).first() if patient else None
        result.append({"id":t.id,"patient_id":t.patient_id,"patient_name":f"{u.first_name} {u.last_name}" if u else "Unknown","test_name":t.test_name,"test_type":t.test_type,"status":t.status,"result":t.result,"reference_range":t.reference_range,"result_units":t.result_units,"ordered_date":t.ordered_date,"specimen_received_at":t.specimen_received_at,"validated_at":t.validated_at,"released_at":t.released_at,"notes":t.notes})
    return result

@router.patch("/tests/{test_id}/status")
def update_status(test_id:int,status:str,result:str=None,reference_range:str=None,result_units:str=None,notes:str=None,db:Session=Depends(get_db),current_user:User=Depends(require_role("laboratory"))):
    if status not in LAB_STATUSES: raise HTTPException(422,"Invalid laboratory status")
    t=db.query(LabTest).filter(LabTest.id==test_id).first()
    if not t: raise HTTPException(404,"Test not found")
    now=datetime.now(timezone.utc); t.status=status
    if status=="specimen_received": t.specimen_received_at=now
    if status in {"processing","result_entered"}: t.performed_by_id=current_user.id
    if result is not None: t.result=result
    if reference_range is not None: t.reference_range=reference_range
    if result_units is not None: t.result_units=result_units
    if notes is not None: t.notes=notes
    if status=="validated": t.validated_at=now; t.validated_by_id=current_user.id
    if status=="released":
        if not t.result: raise HTTPException(422,"A result is required before release")
        if not t.validated_at: raise HTTPException(422,"The result must be validated before release")
        t.released_at=now
        p=db.query(Patient).filter(Patient.id==t.patient_id).first()
        if p: db.add(Notification(user_id=p.user_id,title="Laboratory result released",message=f"Your {t.test_name} result is now available.",notification_type="laboratory"))
    db.add(AuditLog(user_id=current_user.id,action="UPDATE_LAB_STATUS",entity_type="lab_test",entity_id=str(t.id),details=status))
    db.commit(); db.refresh(t); return t


@router.patch("/tests/{test_id}/result")
def legacy_update_test_result(test_id: int, result: str, db: Session = Depends(get_db), current_user: User = Depends(require_role("laboratory"))):
    return update_status(test_id, "result_entered", result, None, None, None, db, current_user)
