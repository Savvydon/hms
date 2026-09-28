from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.security import create_access_token, hash_password, verify_password
from app.models.patient import Patient
from app.models.user import User
from app.schemas.user import (
    PublicRegistration,
    UserCreate,
    UserLogin,
    UserResponse,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


def _check_unique(db: Session, email: str, username: str) -> None:
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=400, detail="Email already exists")
    if db.query(User).filter(User.username == username).first():
        raise HTTPException(status_code=400, detail="Username already exists")


def _create_user(db: Session, data, role: str) -> User:
    _check_unique(db, data.email, data.username)
    user = User(
        first_name=data.first_name.strip(),
        last_name=data.last_name.strip(),
        email=data.email.lower(),
        username=data.username.strip(),
        password=hash_password(data.password),
        role=role,
        phone=data.phone,
    )
    db.add(user)
    db.flush()
    return user


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_public(data: PublicRegistration, db: Session = Depends(get_db)):
    """Public registration creates a patient account only."""
    user = _create_user(db, data, "patient")
    db.add(
        Patient(
            user_id=user.id,
            gender=data.gender,
            blood_group=data.blood_group,
            address=data.address,
            emergency_contact=data.emergency_contact,
            date_of_birth=data.date_of_birth,
        )
    )
    db.commit()
    db.refresh(user)
    return user


@router.post("/login")
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email.lower()).first()
    if not user or not verify_password(data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Your account is deactivated")

    token = create_access_token(
        {"sub": user.email, "role": user.role, "user_id": user.id}
    )
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": user.role,
            "phone": user.phone,
            "is_active": user.is_active,
        },
    }


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
