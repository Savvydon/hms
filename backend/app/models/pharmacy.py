from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base

class Medicine(Base):
    __tablename__ = "medicines"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    generic_name = Column(String(200))
    category = Column(String(100))
    unit_price = Column(Float, nullable=False)
    stock_quantity = Column(Integer, default=0)
    manufacturer = Column(String(200))
    expiry_date = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id", ondelete="SET NULL"), nullable=True)
    medicine_id = Column(Integer, ForeignKey("medicines.id", ondelete="CASCADE"), nullable=False)
    dosage = Column(String(100), nullable=False)
    frequency = Column(String(100))
    duration = Column(String(100))
    status = Column(String(20), default="active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())