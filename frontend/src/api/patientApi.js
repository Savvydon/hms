import api from "./axios";
export const getPatients=()=>api.get("/patients/").then(r=>r.data);
export const getPatient=(id)=>api.get(`/patients/${id}`).then(r=>r.data);
export const registerPatientAccount=(payload)=>api.post("/auth/register",payload).then(r=>r.data);
export const createPatientProfile=(payload)=>api.post("/patients/",payload).then(r=>r.data);
