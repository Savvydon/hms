from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.user import User
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.models.appointment import Appointment
from app.models.clinical import ClinicalEncounter, VitalSign, Diagnosis, Allergy, MedicalCondition
from app.models.audit import AuditLog
from app.models.notification import Notification
from app.schemas.clinical import EncounterCreate, EncounterUpdate, VitalCreate, DiagnosisCreate, AllergyCreate, ConditionCreate

router = APIRouter(prefix="/clinical", tags=["Clinical Care"])


def audit(db, user, action, entity_type=None, entity_id=None, details=None):
    db.add(AuditLog(user_id=user.id if user else None, action=action, entity_type=entity_type,
                    entity_id=str(entity_id) if entity_id is not None else None, details=details))


def patient_for_user(db, user):
    return db.query(Patient).filter(Patient.user_id == user.id).first()


def can_access_patient(db, user, patient_id):
    if user.role != "patient":
        return True
    p = patient_for_user(db, user)
    return bool(p and p.id == patient_id)


@router.get("/records")
def list_encounters(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    q = db.query(ClinicalEncounter).order_by(desc(ClinicalEncounter.created_at))
    if current_user.role == "patient":
        p = patient_for_user(db, current_user)
        q = q.filter(ClinicalEncounter.patient_id == p.id) if p else q.filter(False)
    elif current_user.role == "doctor":
        doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
        if doctor:
            q = q.filter(ClinicalEncounter.doctor_id == doctor.id)
    records = q.all()
    result = []
    for e in records:
        patient = db.query(Patient).filter(Patient.id == e.patient_id).first()
        pu = db.query(User).filter(User.id == patient.user_id).first() if patient else None
        du = db.query(User).filter(User.id == db.query(Doctor).filter(Doctor.id == e.doctor_id).first().user_id).first() if e.doctor_id and db.query(Doctor).filter(Doctor.id == e.doctor_id).first() else None
        result.append({
            "id": e.id, "patient_id": e.patient_id, "patient_name": f"{pu.first_name} {pu.last_name}" if pu else "Unknown",
            "doctor_id": e.doctor_id, "doctor_name": f"{du.first_name} {du.last_name}" if du else None,
            "appointment_id": e.appointment_id, "chief_complaint": e.chief_complaint, "history": e.history,
            "examination": e.examination, "assessment": e.assessment, "treatment_plan": e.treatment_plan,
            "notes": e.notes, "follow_up_date": e.follow_up_date, "status": e.status, "created_at": e.created_at,
        })
    return result


@router.post("/records")
def create_encounter(payload: EncounterCreate, db: Session = Depends(get_db), current_user: User = Depends(require_role("doctor"))):
    patient = db.query(Patient).filter(Patient.id == payload.patient_id).first()
    if not patient:
        raise HTTPException(404, "Patient not found")
    doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
    if not doctor:
        raise HTTPException(400, "Your user account does not have a doctor profile")
    if payload.doctor_id and payload.doctor_id != doctor.id:
        raise HTTPException(403, "You can only create encounters under your own doctor profile")
    if payload.appointment_id:
        appt = db.query(Appointment).filter(Appointment.id == payload.appointment_id).first()
        if not appt or appt.patient_id != patient.id:
            raise HTTPException(400, "Appointment does not belong to this patient")
    data = payload.model_dump(exclude_unset=True)
    data["doctor_id"] = doctor.id
    encounter = ClinicalEncounter(**data)
    db.add(encounter)
    if payload.appointment_id:
        appt.status = "in_consultation"
    db.flush()
    audit(db, current_user, "CREATE_ENCOUNTER", "clinical_encounter", encounter.id)
    db.commit(); db.refresh(encounter)
    return encounter


@router.patch("/records/{encounter_id}")
def update_encounter(encounter_id: int, payload: EncounterUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_role("doctor"))):
    encounter = db.query(ClinicalEncounter).filter(ClinicalEncounter.id == encounter_id).first()
    if not encounter: raise HTTPException(404, "Clinical encounter not found")
    doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
    if not doctor or encounter.doctor_id != doctor.id: raise HTTPException(403, "You can only update your own encounters")
    for k,v in payload.model_dump(exclude_unset=True).items(): setattr(encounter,k,v)
    if encounter.status == "completed" and encounter.appointment_id:
        appt=db.query(Appointment).filter(Appointment.id==encounter.appointment_id).first()
        if appt: appt.status="completed"
    audit(db,current_user,"UPDATE_ENCOUNTER","clinical_encounter",encounter.id)
    db.commit(); db.refresh(encounter); return encounter


@router.post("/vitals")
def create_vital(payload: VitalCreate, db: Session = Depends(get_db), current_user: User = Depends(require_role("nurse", "doctor"))):
    patient = db.query(Patient).filter(Patient.id == payload.patient_id).first()
    if not patient: raise HTTPException(404,"Patient not found")
    if payload.encounter_id and not db.query(ClinicalEncounter).filter(ClinicalEncounter.id==payload.encounter_id, ClinicalEncounter.patient_id==payload.patient_id).first():
        raise HTTPException(400,"Encounter does not belong to this patient")
    vital=VitalSign(**payload.model_dump(), recorded_by_id=current_user.id)
    db.add(vital); db.flush(); audit(db,current_user,"RECORD_VITALS","vital_sign",vital.id)
    db.commit(); db.refresh(vital); return vital


@router.get("/vitals/{patient_id}")
def get_vitals(patient_id:int, db:Session=Depends(get_db), current_user:User=Depends(get_current_user)):
    if not can_access_patient(db,current_user,patient_id): raise HTTPException(403,"You can only view your own clinical data")
    return db.query(VitalSign).filter(VitalSign.patient_id==patient_id).order_by(desc(VitalSign.recorded_at)).all()


@router.post("/diagnoses")
def create_diagnosis(payload:DiagnosisCreate, db:Session=Depends(get_db), current_user:User=Depends(require_role("doctor"))):
    e=db.query(ClinicalEncounter).filter(ClinicalEncounter.id==payload.encounter_id).first()
    if not e: raise HTTPException(404,"Clinical encounter not found")
    doctor=db.query(Doctor).filter(Doctor.user_id==current_user.id).first()
    if not doctor or e.doctor_id!=doctor.id: raise HTTPException(403,"You can only diagnose your own encounters")
    d=Diagnosis(patient_id=e.patient_id, doctor_id=doctor.id, **payload.model_dump())
    db.add(d); db.flush(); audit(db,current_user,"CREATE_DIAGNOSIS","diagnosis",d.id)
    db.commit(); db.refresh(d); return d


@router.get("/diagnoses/{patient_id}")
def get_diagnoses(patient_id:int, db:Session=Depends(get_db), current_user:User=Depends(get_current_user)):
    if not can_access_patient(db,current_user,patient_id): raise HTTPException(403,"You can only view your own clinical data")
    return db.query(Diagnosis).filter(Diagnosis.patient_id==patient_id).order_by(desc(Diagnosis.diagnosed_at)).all()


@router.post("/allergies")
def create_allergy(payload:AllergyCreate, db:Session=Depends(get_db), current_user:User=Depends(require_role("doctor","nurse"))):
    if not db.query(Patient).filter(Patient.id==payload.patient_id).first(): raise HTTPException(404,"Patient not found")
    a=Allergy(**payload.model_dump()); db.add(a); db.flush(); audit(db,current_user,"CREATE_ALLERGY","allergy",a.id)
    db.commit(); db.refresh(a); return a


@router.get("/allergies/{patient_id}")
def get_allergies(patient_id:int, db:Session=Depends(get_db), current_user:User=Depends(get_current_user)):
    if not can_access_patient(db,current_user,patient_id): raise HTTPException(403,"You can only view your own clinical data")
    return db.query(Allergy).filter(Allergy.patient_id==patient_id).all()


@router.post("/conditions")
def create_condition(payload:ConditionCreate, db:Session=Depends(get_db), current_user:User=Depends(require_role("doctor","nurse"))):
    if not db.query(Patient).filter(Patient.id==payload.patient_id).first(): raise HTTPException(404,"Patient not found")
    c=MedicalCondition(**payload.model_dump()); db.add(c); db.flush(); audit(db,current_user,"CREATE_CONDITION","medical_condition",c.id)
    db.commit(); db.refresh(c); return c


@router.get("/conditions/{patient_id}")
def get_conditions(patient_id:int, db:Session=Depends(get_db), current_user:User=Depends(get_current_user)):
    if not can_access_patient(db,current_user,patient_id): raise HTTPException(403,"You can only view your own clinical data")
    return db.query(MedicalCondition).filter(MedicalCondition.patient_id==patient_id).all()
