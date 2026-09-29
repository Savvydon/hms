import { useEffect, useState } from "react";
import { Alert, Card, Col, Row, Spinner } from "react-bootstrap";
import {
  FaCalendarCheck,
  FaFlask,
  FaMoneyBillWave,
  FaPills,
  FaUserMd,
  FaUsers,
} from "react-icons/fa";
import api from "../api/axios";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/admin/stats")
      .then(({ data }) => setStats(data))
      .catch((err) => setError(err.response?.data?.detail || "Unable to load administration statistics."));
  }, []);

  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!stats) return <div className="text-center mt-5"><Spinner animation="border" /></div>;

  const cards = [
    ["Total Users", stats.users, <FaUsers />, "primary"],
    ["Patients", stats.patients, <FaUsers />, "success"],
    ["Doctors", stats.doctors, <FaUserMd />, "info"],
    ["Appointments", stats.appointments, <FaCalendarCheck />, "warning"],
    ["Medicines", stats.medicines, <FaPills />, "secondary"],
    ["Laboratory Tests", stats.laboratory_tests, <FaFlask />, "danger"],
    ["Clinical Encounters", stats.clinical_encounters, <FaUserMd />, "info"],
    ["Bills", stats.bills, <FaMoneyBillWave />, "dark"],
  ];

  return (
    <>
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Administrator Dashboard</h2>
        <p className="text-muted mb-0">Manage hospital operations, users, staff, and system records.</p>
      </div>
      <Row className="g-4">
        {cards.map(([title, value, icon, color]) => (
          <Col sm={6} lg={4} xl key={title}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body>
                <div className={`text-${color} fs-3 mb-2`}>{icon}</div>
                <small className="text-muted">{title}</small>
                <h3 className="fw-bold mb-0">{value ?? 0}</h3>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      <Card className="border-0 shadow-sm mt-4">
        <Card.Body>
          <h5 className="fw-semibold">Administration</h5>
          <p className="text-muted mb-0">
            Use the navigation above to manage users, patients, doctors, appointments, billing, pharmacy, and laboratory operations.
          </p>
        </Card.Body>
      </Card>
    </>
  );
}
