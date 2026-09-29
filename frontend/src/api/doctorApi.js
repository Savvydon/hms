import api from "./axios";
export const getDoctors=()=>api.get("/doctors/").then(r=>r.data);
export const createDoctor=(payload)=>api.post("/doctors/",payload).then(r=>r.data);
