export const money=(value)=>Number(value||0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
export const dateTime=(value)=>value?new Date(value).toLocaleString():"-";
export const dateOnly=(value)=>value?new Date(value).toLocaleDateString():"-";
export const fullName=(item)=>item?`${item.first_name||""} ${item.last_name||""}`.trim():"-";
