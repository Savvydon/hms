from sqlalchemy import Column, Integer, String, ForeignKey, Date
from sqlalchemy.orm import relationship
from app.core.database import Base

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    gender = Column(String(10))
    blood_group = Column(String(5))
    address = Column(String(255))
    emergency_contact = Column(String(100))
    date_of_birth = Column(Date)
    
    user = relationship("User", back_populates="patient")
    appointments = relationship("Appointment", back_populates="patient")