from sqlalchemy import Column, Integer, String, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.core.database import Base

class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    specialization = Column(String(100), nullable=False)
    department = Column(String(100), nullable=False)
    consultation_fee = Column(Float, default=0.0)
    license_number = Column(String(50), unique=True)
    
    user = relationship("User", back_populates="doctor")
    appointments = relationship("Appointment", back_populates="doctor")