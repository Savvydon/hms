from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.database import Base, engine
from app.models.user import User
from app.core.security import hash_password
from app.routers import auth, appointments, billing, doctors, patients, pharmacy, laboratory, admin, clinical, notifications, reports
from app import models  # noqa: F401 - registers all SQLAlchemy models

settings = get_settings()

# For a small academic/development system this creates missing tables automatically.
# For production, use Alembic migrations instead of relying on create_all.
Base.metadata.create_all(bind=engine)


def ensure_initial_admin():
    """Create the first administrator when ADMIN_EMAIL/ADMIN_PASSWORD are supplied."""
    if not settings.ADMIN_EMAIL or not settings.ADMIN_PASSWORD:
        return

    from app.core.database import SessionLocal

    db = SessionLocal()
    try:
        email = settings.ADMIN_EMAIL.lower()
        user = db.query(User).filter(User.email == email).first()
        if not user:
            base_username = email.split("@")[0][:45] or "admin"
            username = base_username
            suffix = 1
            while db.query(User).filter(User.username == username).first():
                username = f"{base_username[:40]}_{suffix}"
                suffix += 1
            user = User(
                first_name=settings.ADMIN_FIRST_NAME,
                last_name=settings.ADMIN_LAST_NAME,
                email=email,
                username=username,
                password=hash_password(settings.ADMIN_PASSWORD),
                role="admin",
                is_active=True,
            )
            db.add(user)
            db.commit()
    finally:
        db.close()


ensure_initial_admin()

app = FastAPI(
    title="Hospital Management System API",
    version="2.0.0",
    description="Hospital management system backend with authentication and role-based administration.",
)

raw_origins = settings.FRONTEND_URL or ""
allowed_origins = [url.strip().rstrip("/") for url in raw_origins.split(",") if url]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,  # Passed the newly cleaned list here
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response

app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(appointments.router)
app.include_router(billing.router)
app.include_router(doctors.router)
app.include_router(patients.router)
app.include_router(pharmacy.router)
app.include_router(laboratory.router)
app.include_router(clinical.router)
app.include_router(notifications.router)
app.include_router(reports.router)


@app.get("/")
def root():
    return {"message": "Hospital Management System API is running", "version": "2.0.0"}