import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LoginPage from "../pages/LoginPage";
export const staffRoles=["doctor","nurse","receptionist","pharmacist","laboratory","accountant"];
export function RoleHome(){const {user,loading}=useAuth();if(loading)return <div className="text-center mt-5">Loading...</div>;if(!user)return <LoginPage/>;if(user.role==="admin")return <Navigate to="/admin/dashboard" replace/>;if(user.role==="patient")return <Navigate to="/patient/dashboard" replace/>;return <Navigate to="/staff/dashboard" replace/>;}
export function ProtectedRoute({children,allowedRoles}){const {user,loading}=useAuth();if(loading)return <div className="text-center mt-5">Loading...</div>;if(!user)return <Navigate to="/" replace/>;if(allowedRoles&&!allowedRoles.includes(user.role)){if(user.role==="admin")return <Navigate to="/admin/dashboard" replace/>;if(user.role==="patient")return <Navigate to="/patient/dashboard" replace/>;return <Navigate to="/staff/dashboard" replace/>;}return children;}
export function LegacyDashboardRedirect(){const {user}=useAuth();if(user?.role==="admin")return <Navigate to="/admin/dashboard" replace/>;if(user?.role==="patient")return <Navigate to="/patient/dashboard" replace/>;return <Navigate to="/staff/dashboard" replace/>;}
