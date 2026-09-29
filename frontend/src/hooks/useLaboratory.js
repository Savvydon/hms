import { useCallback } from "react";
import { getLabTests,createLabTest,updateLabStatus } from "../api/laboratoryApi";
import { getPatients } from "../api/patientApi";
import { getDoctors } from "../api/doctorApi";
import useCollection from "./useCollection";
export default function useLaboratory(){const labs=useCollection(useCallback(()=>getLabTests(),[]));const patients=useCollection(useCallback(()=>getPatients(),[]));const doctors=useCollection(useCallback(()=>getDoctors(),[]));const refresh=labs.refresh;const create=async p=>{await createLabTest(p);await refresh();};const update=async(id,p)=>{await updateLabStatus(id,p);await refresh();};return {tests:labs.items,patients:patients.items,doctors:doctors.items,loading:labs.loading||patients.loading||doctors.loading,error:labs.error||patients.error||doctors.error,setError:labs.setError,refresh,create,update};}
