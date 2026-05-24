import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import AppointmentPage from "./pages/AppointmentPage";
import PatientPage from "./pages/PatientPage";
import DoctorPage from "./pages/DoctorPage";
import BillingPage from "./pages/BillingPage";
import PharmacyPage from "./pages/PharmacyPage";
import LaboratoryPage from "./pages/LaboratoryPage";
import MainLayout from "./layouts/MainLayout";

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (!user) return <Navigate to="/" replace />;
  if (
    allowedRoles &&
    !allowedRoles.includes(user.role) &&
    user.role !== "admin"
  ) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route
              path="appointments"
              element={
                <ProtectedRoute
                  allowedRoles={["receptionist", "doctor", "nurse"]}
                >
                  <AppointmentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="patients"
              element={
                <ProtectedRoute
                  allowedRoles={["receptionist", "doctor", "nurse"]}
                >
                  <PatientPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="doctors"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <DoctorPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="billing"
              element={
                <ProtectedRoute allowedRoles={["accountant", "admin"]}>
                  <BillingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="pharmacy"
              element={
                <ProtectedRoute allowedRoles={["pharmacist", "doctor"]}>
                  <PharmacyPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="laboratory"
              element={
                <ProtectedRoute allowedRoles={["laboratory", "doctor"]}>
                  <LaboratoryPage />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
