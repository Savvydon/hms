import api from "./axios";
export const getBills=()=>api.get("/billing/").then(r=>r.data);
export const getBillingStats=()=>api.get("/billing/stats").then(r=>r.data);
export const createBill=(payload)=>api.post("/billing/",payload).then(r=>r.data);
export const recordPayment=(billId,payload)=>api.post(`/billing/${billId}/payments`,null,{params:payload}).then(r=>r.data);
export const getPayments=(billId)=>api.get(`/billing/${billId}/payments`).then(r=>r.data);
