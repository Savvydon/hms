import { useCallback } from "react";
import { createAppointment,getAppointments } from "../api/appointmentApi";
import useCollection from "./useCollection";
export default function useAppointments(){const loader=useCallback(()=>getAppointments(),[]);const c=useCollection(loader);const create=useCallback(async(payload)=>{const item=await createAppointment(payload);await c.refresh();return item;},[c.refresh]);return {...c,create};}
