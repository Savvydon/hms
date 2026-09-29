from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.appointment import Appointment
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.models.user import User
from app.models.notification import Notification
from app.models.audit import AuditLog
from app.schemas.appointment import AppointmentCreate, AppointmentResponse

router = APIRouter(prefix="/appointments", tags=["Appointments"])
ALLOWED_STATUSES = {"pending", "confirmed", "checked_in", "waiting", "in_consultation", "completed", "cancelled", "no_show"}

def serialize(a, db):
    patient=db.query(Patient).filter(Patient.id==a.patient_id).first(); doctor=db.query(Doctor).filter(Doctor.id==a.doctor_id).first()
    pu=db.query(User).filter(User.id==patient.user_id).first() if patient else None; du=db.query(User).filter(User.id==doctor.user_id).first() if doctor else None
    return {"id":a.id,"patient_id":a.patient_id,"doctor_id":a.doctor_id,"patient_name":f"{pu.first_name} {pu.last_name}" if pu else "Unknown","doctor_name":f"{du.first_name} {du.last_name}" if du else "Unknown","appointment_date":a.appointment_date,"appointment_time":a.appointment_time,"reason":a.reason,"status":a.status,"notes":a.notes}

def audit(db,user,action,entity_id): db.add(AuditLog(user_id=user.id,action=action,entity_type="appointment",entity_id=str(entity_id)))

def notify(db,user_id,title,message,typ="info"): db.add(Notification(user_id=user_id,title=title,message=message,notification_type=typ))

@router.post("/", response_model=AppointmentResponse)
def create_appointment(payload:AppointmentCreate, db:Session=Depends(get_db), current_user:User=Depends(get_current_user)):
    patient=db.query(Patient).filter(Patient.id==payload.patient_id).first(); doctor=db.query(Doctor).filter(Doctor.id==payload.doctor_id).first()
    if not patient: raise HTTPException(404,"Patient not found")
    if not doctor: raise HTTPException(404,"Doctor not found")
    if current_user.role=="patient" and patient.user_id!=current_user.id: raise HTTPException(403,"You can only book appointments for yourself")
    if current_user.role not in {"patient","admin","receptionist"}: raise HTTPException(403,"You do not have permission to book appointments")
    conflict=db.query(Appointment).filter(Appointment.doctor_id==payload.doctor_id,Appointment.appointment_date==payload.appointment_date,Appointment.appointment_time==payload.appointment_time,Appointment.status.notin_(["cancelled","no_show"])).first()
    if conflict: raise HTTPException(409,"The doctor already has an appointment at this time")
    a=Appointment(**payload.model_dump(),status="pending"); db.add(a); db.flush(); audit(db,current_user,"CREATE_APPOINTMENT",a.id)
    du=db.query(User).filter(User.id==doctor.user_id).first(); notify(db,doctor.user_id,"New appointment",f"A new appointment has been booked for {payload.appointment_date} at {payload.appointment_time}.","appointment")
    db.commit(); db.refresh(a); return serialize(a,db)

@router.get("/", response_model=list[AppointmentResponse])
def get_appointments(db:Session=Depends(get_db), current_user:User=Depends(get_current_user)):
    q=db.query(Appointment).order_by(Appointment.appointment_date.desc(),Appointment.appointment_time.desc())
    if current_user.role=="patient":
        p=db.query(Patient).filter(Patient.user_id==current_user.id).first(); q=q.filter(Appointment.patient_id==p.id) if p else q.filter(False)
    elif current_user.role=="doctor":
        d=db.query(Doctor).filter(Doctor.user_id==current_user.id).first(); q=q.filter(Appointment.doctor_id==d.id) if d else q.filter(False)
    return [serialize(a,db) for a in q.all()]

@router.patch("/{appointment_id}/status")
def update_status(appointment_id:int, status:str, db:Session=Depends(get_db), current_user:User=Depends(get_current_user)):
    if status not in ALLOWED_STATUSES: raise HTTPException(422,f"Invalid appointment status. Allowed: {', '.join(sorted(ALLOWED_STATUSES))}")
    a=db.query(Appointment).filter(Appointment.id==appointment_id).first()
    if not a: raise HTTPException(404,"Appointment not found")
    if current_user.role=="patient":
        p=db.query(Patient).filter(Patient.user_id==current_user.id).first()
        if not p or a.patient_id!=p.id or status not in {"cancelled"}: raise HTTPException(403,"Patients may only cancel their own appointments")
    elif current_user.role=="doctor":
        d=db.query(Doctor).filter(Doctor.user_id==current_user.id).first()
        if not d or a.doctor_id!=d.id: raise HTTPException(403,"You can only update your own appointments")
    elif current_user.role not in {"admin","receptionist","nurse"}: raise HTTPException(403,"You do not have permission to update this appointment")
    a.status=status; audit(db,current_user,"UPDATE_APPOINTMENT_STATUS",a.id)
    patient=db.query(Patient).filter(Patient.id==a.patient_id).first()
    if patient: notify(db,patient.user_id,"Appointment update",f"Your appointment status is now {status.replace('_',' ')}.","appointment")
    db.commit(); return {"message":"Status updated","status":a.status}
