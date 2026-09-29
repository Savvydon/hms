import api from "./axios";
export const getLabTests=()=>api.get("/laboratory/tests").then(r=>r.data);
export const createLabTest=(payload)=>api.post("/laboratory/tests",null,{params:payload}).then(r=>r.data);
export const updateLabStatus=(id,payload)=>api.patch(`/laboratory/tests/${id}/status`,null,{params:payload}).then(r=>r.data);
