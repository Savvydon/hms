import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminPage from "./pages/AdminPage";
import PatientPage from "./pages/PatientPage";
import DoctorPage from "./pages/DoctorPage";
import AppointmentPage from "./pages/AppointmentPage";
import BillingPage from "./pages/BillingPage";
import PharmacyPage from "./pages/PharmacyPage";
import LaboratoryPage from "./pages/LaboratoryPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import StaffDashboardPage from "./pages/StaffDashboardPage";
import PatientDashboardPage from "./pages/PatientDashboardPage";
import PatientProfilePage from "./pages/PatientProfilePage";
import PatientDataPage from "./pages/PatientDataPage";
import AdminLayout from "./layouts/AdminLayout";
import StaffLayout from "./layouts/StaffLayout";
import PatientLayout from "./layouts/PatientLayout";

const staffRoles = ["doctor", "nurse", "receptionist", "pharmacist", "laboratory", "accountant"];

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (!user) return <LoginPage />;
  if (user.role === "admin") return <Navigate to="/admin/dashboard" replace />;
  if (user.role === "patient") return <Navigate to="/patient/dashboard" replace />;
  if (staffRoles.includes(user.role)) return <Navigate to="/staff/dashboard" replace />;
  return <Navigate to="/" replace />;
}

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (!user) return <Navigate to="/" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === "admin") return <Navigate to="/admin/dashboard" replace />;
    if (user.role === "patient") return <Navigate to="/patient/dashboard" replace />;
    return <Navigate to="/staff/dashboard" replace />;
  }
  return children;
}

function LegacyDashboardRedirect() {
  const { user } = useAuth();
  if (user?.role === "admin") return <Navigate to="/admin/dashboard" replace />;
  if (user?.role === "patient") return <Navigate to="/patient/dashboard" replace />;
  return <Navigate to="/staff/dashboard" replace />;
}

function AppRoutes() {
  return <Routes>
    <Route path="/" element={<HomeRedirect />} />
    <Route path="/register" element={<RegisterPage />} />

    <Route path="/dashboard" element={<ProtectedRoute><LegacyDashboardRedirect /></ProtectedRoute>} />

    <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminLayout /></ProtectedRoute>}>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<AdminDashboardPage />} />
      <Route path="users" element={<AdminPage />} />
      <Route path="patients" element={<PatientPage />} />
      <Route path="appointments" element={<AppointmentPage />} />
      <Route path="doctors" element={<DoctorPage />} />
      <Route path="billing" element={<BillingPage />} />
      <Route path="pharmacy" element={<PharmacyPage />} />
      <Route path="laboratory" element={<LaboratoryPage />} />
    </Route>

    <Route path="/staff" element={<ProtectedRoute allowedRoles={staffRoles}><StaffLayout /></ProtectedRoute>}>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<StaffDashboardPage />} />
      <Route path="patients" element={<ProtectedRoute allowedRoles={["doctor", "nurse", "receptionist"]}><PatientPage /></ProtectedRoute>} />
      <Route path="appointments" element={<ProtectedRoute allowedRoles={["doctor", "nurse", "receptionist"]}><AppointmentPage /></ProtectedRoute>} />
      <Route path="doctors" element={<ProtectedRoute allowedRoles={["doctor", "nurse"]}><DoctorPage /></ProtectedRoute>} />
      <Route path="billing" element={<ProtectedRoute allowedRoles={["accountant"]}><BillingPage /></ProtectedRoute>} />
      <Route path="pharmacy" element={<ProtectedRoute allowedRoles={["pharmacist", "doctor"]}><PharmacyPage /></ProtectedRoute>} />
      <Route path="laboratory" element={<ProtectedRoute allowedRoles={["laboratory", "doctor"]}><LaboratoryPage /></ProtectedRoute>} />
    </Route>

    <Route path="/patient" element={<ProtectedRoute allowedRoles={["patient"]}><PatientLayout /></ProtectedRoute>}>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<PatientDashboardPage />} />
      <Route path="profile" element={<PatientProfilePage />} />
      <Route path="appointments" element={<PatientDataPage type="appointments" />} />
      <Route path="prescriptions" element={<PatientDataPage type="prescriptions" />} />
      <Route path="laboratory" element={<PatientDataPage type="laboratory" />} />
      <Route path="billing" element={<PatientDataPage type="billing" />} />
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}

export default function App() {
  return <AuthProvider><BrowserRouter><AppRoutes /></BrowserRouter></AuthProvider>;
}
