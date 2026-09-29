import { useCallback, useState } from "react";
export default function useAsync(asyncFunction) {
 const [loading,setLoading]=useState(false); const [error,setError]=useState("");
 const execute=useCallback(async(...args)=>{setLoading(true);setError("");try{return await asyncFunction(...args);}catch(e){const message=e.response?.data?.detail||e.message||"Request failed";setError(message);throw e;}finally{setLoading(false);}},[asyncFunction]);
 return {execute,loading,error,setError};
}
