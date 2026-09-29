import api from "./axios";
export const getAdminUsers=()=>api.get("/admin/users").then(r=>r.data);
export const getAdminStats=()=>api.get("/admin/stats").then(r=>r.data);
export const createAdminUser=(payload)=>api.post("/admin/users",payload).then(r=>r.data);
export const updateAdminUser=(id,payload)=>api.patch(`/admin/users/${id}`,payload).then(r=>r.data);
export const getAuditLogs=()=>api.get("/admin/audit-logs?limit=200").then(r=>r.data);
export const getReportsSummary=()=>api.get("/reports/summary").then(r=>r.data);
