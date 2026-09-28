# Hospital Management System

## What is included

- FastAPI + SQLAlchemy backend
- React + Vite + React Bootstrap frontend
- Patient self-registration
- Email/password login
- JWT authentication
- Role-based access control
- Administrator dashboard
- Administrator user creation and activation/deactivation
- Patients, doctors, appointments, billing, pharmacy and laboratory modules
- Automatic first-admin provisioning from environment variables
- Patient record isolation for authenticated patient accounts

## Backend

1. Create a virtual environment.
2. Install `backend/requirements.txt`.
3. Copy `backend/.env.example` to `backend/.env`.
4. Set `DATABASE_URL`, `SECRET_KEY`, `FRONTEND_URL`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`.
5. Run:

```bash
uvicorn app.main:app --reload
```

from the `backend` directory.

## Frontend

1. Copy `frontend/.env.example` to `frontend/.env`.
2. Set `VITE_API_URL` to the backend URL.
3. Run:

```bash
npm install
npm run dev
```

## Account workflow

- Public users can register as patients from `/register`.
- Staff accounts are created by an administrator from `/dashboard/admin`.
- Login is always by email and password.
- The initial administrator is created at backend startup when `ADMIN_EMAIL` and `ADMIN_PASSWORD` are configured.

## Production note

The project currently uses SQLAlchemy `create_all()` for convenient development setup. For an existing production database, introduce and run Alembic migrations before deploying schema changes. Also use a strong random `SECRET_KEY` and a specific production `FRONTEND_URL`.
