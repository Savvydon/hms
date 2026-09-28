import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import AppointmentPage from "./pages/AppointmentPage";
import PatientPage from "./pages/PatientPage";
import DoctorPage from "./pages/DoctorPage";
import BillingPage from "./pages/BillingPage";
import PharmacyPage from "./pages/PharmacyPage";
import LaboratoryPage from "./pages/LaboratoryPage";
import AdminPage from "./pages/AdminPage";
import MainLayout from "./layouts/MainLayout";

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (!user) return <Navigate to="/" replace />;
  if (allowedRoles && user.role !== "admin" && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminPage /></ProtectedRoute>} />
        <Route path="patients" element={<ProtectedRoute allowedRoles={["receptionist","doctor","nurse"]}><PatientPage /></ProtectedRoute>} />
        <Route path="appointments" element={<ProtectedRoute allowedRoles={["receptionist","doctor","nurse"]}><AppointmentPage /></ProtectedRoute>} />
        <Route path="doctors" element={<ProtectedRoute allowedRoles={["admin","doctor","nurse"]}><DoctorPage /></ProtectedRoute>} />
        <Route path="billing" element={<ProtectedRoute allowedRoles={["accountant","admin"]}><BillingPage /></ProtectedRoute>} />
        <Route path="pharmacy" element={<ProtectedRoute allowedRoles={["pharmacist","doctor"]}><PharmacyPage /></ProtectedRoute>} />
        <Route path="laboratory" element={<ProtectedRoute allowedRoles={["laboratory","doctor"]}><LaboratoryPage /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return <AuthProvider><BrowserRouter><AppRoutes /></BrowserRouter></AuthProvider>;
}
