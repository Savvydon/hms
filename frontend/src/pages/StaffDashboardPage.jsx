import { useEffect, useState } from "react";
import { Alert, Card, Col, Row, Spinner } from "react-bootstrap";
import { FaCalendarCheck, FaUserMd, FaUsers } from "react-icons/fa";
import api from "../api/axios";
import { useAuth } from "../contexts/AuthContext";

const labels = {
  doctor: "Doctor",
  nurse: "Nurse",
  receptionist: "Receptionist",
  pharmacist: "Pharmacist",
  laboratory: "Laboratory Staff",
  accountant: "Accountant",
};

export default function StaffDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const requests = [api.get("/appointments/"), api.get("/patients/"), api.get("/doctors/")];
        const [appointments, patients, doctors] = await Promise.all(
          requests.map((request) => request.catch(() => ({ data: [] }))),
        );
        setStats({
          appointments: appointments.data.length,
          patients: patients.data.length,
          doctors: doctors.data.length,
        });
      } catch (err) {
        setError(err.response?.data?.detail || "Unable to load staff dashboard.");
      }
    };
    load();
  }, []);

  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!stats) return <div className="text-center mt-5"><Spinner animation="border" /></div>;

  return (
    <>
      <div className="mb-4">
        <h2 className="fw-bold mb-1">{labels[user?.role] || "Staff"} Dashboard</h2>
        <p className="text-muted mb-0">Welcome, {user?.first_name}. Access the hospital modules assigned to your role.</p>
      </div>
      <Row className="g-4">
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100"><Card.Body>
            <FaUsers className="text-primary fs-3 mb-2" />
            <small className="text-muted d-block">Patients</small>
            <h3 className="fw-bold">{stats.patients}</h3>
          </Card.Body></Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100"><Card.Body>
            <FaCalendarCheck className="text-warning fs-3 mb-2" />
            <small className="text-muted d-block">Appointments</small>
            <h3 className="fw-bold">{stats.appointments}</h3>
          </Card.Body></Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100"><Card.Body>
            <FaUserMd className="text-success fs-3 mb-2" />
            <small className="text-muted d-block">Doctors</small>
            <h3 className="fw-bold">{stats.doctors}</h3>
          </Card.Body></Card>
        </Col>
      </Row>
    </>
  );
}
