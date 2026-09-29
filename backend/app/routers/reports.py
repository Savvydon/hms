from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.core.dependencies import require_role
from app.models.user import User
from app.models.patient import Patient
from app.models.appointment import Appointment
from app.models.billing import Bill
from app.models.laboratory import LabTest
from app.models.pharmacy import Prescription, Medicine
from app.models.clinical import ClinicalEncounter

router=APIRouter(prefix="/reports",tags=["Reports"])

@router.get("/summary")
def summary(db:Session=Depends(get_db), current_user:User=Depends(require_role("admin","accountant"))):
    return {
        "patients":db.query(Patient).count(), "appointments":db.query(Appointment).count(),
        "completed_appointments":db.query(Appointment).filter(Appointment.status=="completed").count(),
        "encounters":db.query(ClinicalEncounter).count(), "lab_tests":db.query(LabTest).count(),
        "prescriptions":db.query(Prescription).count(), "medicines":db.query(Medicine).count(),
        "revenue":float(db.query(func.coalesce(func.sum(Bill.paid_amount),0)).scalar() or 0),
        "outstanding":float(db.query(func.coalesce(func.sum(Bill.total_amount-Bill.paid_amount),0)).scalar() or 0),
    }
