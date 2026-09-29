-- HMS production schema additions for the integrated clinical workflow.
-- Run this against the existing PostgreSQL/Supabase database before deploying
-- a version of the application that uses the new fields/tables.

ALTER TABLE appointments ADD COLUMN IF NOT EXISTS notes VARCHAR(1000);

ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS instructions VARCHAR(500);
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS dispensed_at TIMESTAMPTZ;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS dispensed_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE lab_tests ADD COLUMN IF NOT EXISTS reference_range VARCHAR(200);
ALTER TABLE lab_tests ADD COLUMN IF NOT EXISTS result_units VARCHAR(100);
ALTER TABLE lab_tests ADD COLUMN IF NOT EXISTS specimen_received_at TIMESTAMPTZ;
ALTER TABLE lab_tests ADD COLUMN IF NOT EXISTS validated_at TIMESTAMPTZ;
ALTER TABLE lab_tests ADD COLUMN IF NOT EXISTS released_at TIMESTAMPTZ;
ALTER TABLE lab_tests ADD COLUMN IF NOT EXISTS performed_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE lab_tests ADD COLUMN IF NOT EXISTS validated_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS clinical_encounters (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER REFERENCES appointments(id) ON DELETE SET NULL,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id INTEGER REFERENCES doctors(id) ON DELETE SET NULL,
    chief_complaint TEXT,
    history TEXT,
    examination TEXT,
    assessment TEXT,
    treatment_plan TEXT,
    notes TEXT,
    follow_up_date DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_clinical_encounters_patient_id ON clinical_encounters(patient_id);
CREATE INDEX IF NOT EXISTS ix_clinical_encounters_doctor_id ON clinical_encounters(doctor_id);

CREATE TABLE IF NOT EXISTS vital_signs (
    id SERIAL PRIMARY KEY,
    encounter_id INTEGER REFERENCES clinical_encounters(id) ON DELETE CASCADE,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    recorded_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    temperature DOUBLE PRECISION,
    pulse_rate INTEGER,
    respiratory_rate INTEGER,
    systolic_bp INTEGER,
    diastolic_bp INTEGER,
    oxygen_saturation DOUBLE PRECISION,
    weight_kg DOUBLE PRECISION,
    height_cm DOUBLE PRECISION,
    notes TEXT,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_vital_signs_patient_id ON vital_signs(patient_id);

CREATE TABLE IF NOT EXISTS diagnoses (
    id SERIAL PRIMARY KEY,
    encounter_id INTEGER NOT NULL REFERENCES clinical_encounters(id) ON DELETE CASCADE,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id INTEGER REFERENCES doctors(id) ON DELETE SET NULL,
    diagnosis VARCHAR(255) NOT NULL,
    diagnosis_type VARCHAR(50) DEFAULT 'clinical',
    notes TEXT,
    diagnosed_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_diagnoses_patient_id ON diagnoses(patient_id);

CREATE TABLE IF NOT EXISTS allergies (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    allergen VARCHAR(200) NOT NULL,
    reaction VARCHAR(255),
    severity VARCHAR(30),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_allergies_patient_id ON allergies(patient_id);

CREATE TABLE IF NOT EXISTS medical_conditions (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    condition VARCHAR(255) NOT NULL,
    diagnosed_date DATE,
    status VARCHAR(30) DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_medical_conditions_patient_id ON medical_conditions(patient_id);

CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id VARCHAR(100),
    details TEXT,
    ip_address VARCHAR(64),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS ix_audit_logs_created_at ON audit_logs(created_at);

CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_notifications_user_id ON notifications(user_id);

CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    bill_id INTEGER NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
    amount DOUBLE PRECISION NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    reference VARCHAR(100),
    received_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_payments_bill_id ON payments(bill_id);

CREATE TABLE IF NOT EXISTS inventory_transactions (
    id SERIAL PRIMARY KEY,
    medicine_id INTEGER NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    transaction_type VARCHAR(30) NOT NULL,
    reference VARCHAR(100),
    performed_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_inventory_transactions_medicine_id ON inventory_transactions(medicine_id);
