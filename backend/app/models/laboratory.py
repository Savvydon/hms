from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.sql import func
from app.core.database import Base

class LabTest(Base):
    __tablename__ = "lab_tests"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id", ondelete="SET NULL"), nullable=True)
    test_name = Column(String(200), nullable=False)
    test_type = Column(String(100))
    result = Column(Text)
    reference_range = Column(String(200))
    result_units = Column(String(100))
    specimen_received_at = Column(DateTime(timezone=True))
    validated_at = Column(DateTime(timezone=True))
    released_at = Column(DateTime(timezone=True))
    performed_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    validated_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    status = Column(String(20), default="pending")  # pending, in_progress, completed
    ordered_date = Column(DateTime(timezone=True), server_default=func.now())
    completed_date = Column(DateTime(timezone=True))
    notes = Column(Text)