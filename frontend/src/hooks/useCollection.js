import { useCallback, useEffect, useState } from "react";
export default function useCollection(loader,{enabled=true}={}) {
 const [items,setItems]=useState([]); const [loading,setLoading]=useState(enabled); const [error,setError]=useState("");
 const refresh=useCallback(async()=>{setLoading(true);setError("");try{const data=await loader();setItems(Array.isArray(data)?data:[]);return data;}catch(e){setError(e.response?.data?.detail||e.message||"Failed to load records");throw e;}finally{setLoading(false);}},[loader]);
 useEffect(()=>{if(enabled) refresh();},[enabled,refresh]);
 return {items,setItems,loading,error,setError,refresh};
}
