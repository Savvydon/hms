import api from "./axios";
export const getMedicines=()=>api.get("/pharmacy/medicines").then(r=>r.data);
export const getPrescriptions=()=>api.get("/pharmacy/prescriptions").then(r=>r.data);
export const createMedicine=(payload)=>api.post("/pharmacy/medicines",null,{params:payload}).then(r=>r.data);
export const adjustStock=(id,payload)=>api.post(`/pharmacy/medicines/${id}/stock`,null,{params:payload}).then(r=>r.data);
export const createPrescription=(payload)=>api.post("/pharmacy/prescriptions",null,{params:payload}).then(r=>r.data);
export const dispensePrescription=(id)=>api.patch(`/pharmacy/prescriptions/${id}/dispense`).then(r=>r.data);
