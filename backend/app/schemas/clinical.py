from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, Field


class EncounterCreate(BaseModel):
    patient_id: int
    appointment_id: Optional[int] = None
    doctor_id: Optional[int] = None
    chief_complaint: Optional[str] = None
    history: Optional[str] = None
    examination: Optional[str] = None
    assessment: Optional[str] = None
    treatment_plan: Optional[str] = None
    notes: Optional[str] = None
    follow_up_date: Optional[date] = None


class EncounterUpdate(BaseModel):
    chief_complaint: Optional[str] = None
    history: Optional[str] = None
    examination: Optional[str] = None
    assessment: Optional[str] = None
    treatment_plan: Optional[str] = None
    notes: Optional[str] = None
    follow_up_date: Optional[date] = None
    status: Optional[str] = Field(default=None, pattern="^(open|completed|cancelled)$")


class VitalCreate(BaseModel):
    patient_id: int
    encounter_id: Optional[int] = None
    temperature: Optional[float] = None
    pulse_rate: Optional[int] = Field(default=None, ge=0, le=300)
    respiratory_rate: Optional[int] = Field(default=None, ge=0, le=100)
    systolic_bp: Optional[int] = Field(default=None, ge=0, le=300)
    diastolic_bp: Optional[int] = Field(default=None, ge=0, le=200)
    oxygen_saturation: Optional[float] = Field(default=None, ge=0, le=100)
    weight_kg: Optional[float] = Field(default=None, ge=0, le=500)
    height_cm: Optional[float] = Field(default=None, ge=0, le=300)
    notes: Optional[str] = None


class DiagnosisCreate(BaseModel):
    encounter_id: int
    diagnosis: str = Field(..., min_length=2, max_length=255)
    diagnosis_type: str = "clinical"
    notes: Optional[str] = None


class AllergyCreate(BaseModel):
    patient_id: int
    allergen: str = Field(..., min_length=2, max_length=200)
    reaction: Optional[str] = None
    severity: Optional[str] = None


class ConditionCreate(BaseModel):
    patient_id: int
    condition: str = Field(..., min_length=2, max_length=255)
    diagnosed_date: Optional[date] = None
    status: str = "active"
    notes: Optional[str] = None
