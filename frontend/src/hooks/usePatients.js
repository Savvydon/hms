import { useCallback } from "react";
import { getPatients } from "../api/patientApi";
import useCollection from "./useCollection";
export default function usePatients(){const loader=useCallback(()=>getPatients(),[]);return useCollection(loader);}
