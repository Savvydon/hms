from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import Base, engine
from app.routers import auth, appointments

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Hospital Management System API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(appointments.router)


@app.get("/")
def root():
    return {
        "message": "Hospital Management System API Running"
    }
