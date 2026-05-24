import { useEffect, useState } from "react";
import { Card, Col, Row, Spinner, Alert } from "react-bootstrap";
import {
  FaUsers,
  FaUserMd,
  FaCalendarCheck,
  FaMoneyBillWave,
} from "react-icons/fa";
import api from "../api/axios";
import { useAuth } from "../contexts/AuthContext";

function DashboardPage() {
  const { hasRole } = useAuth();
  const [stats, setStats] = useState({
    patients: 0,
    doctors: 0,
    appointments: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [patientsRes, doctorsRes, appointmentsRes, billingRes] =
        await Promise.all([
          api.get("/patients/").catch(() => ({ data: [] })),
          api.get("/doctors/").catch(() => ({ data: [] })),
          api.get("/appointments/").catch(() => ({ data: [] })),
          api
            .get("/billing/stats")
            .catch(() => ({ data: { total_revenue: 0 } })),
        ]);

      setStats({
        patients: patientsRes.data.length,
        doctors: doctorsRes.data.length,
        appointments: appointmentsRes.data.length,
        revenue: billingRes.data.total_revenue || 0,
      });
    } catch (err) {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Patients",
      value: stats.patients,
      icon: <FaUsers size={30} />,
      color: "primary",
    },
    {
      title: "Doctors",
      value: stats.doctors,
      icon: <FaUserMd size={30} />,
      color: "success",
    },
    {
      title: "Appointments",
      value: stats.appointments,
      icon: <FaCalendarCheck size={30} />,
      color: "warning",
    },
    {
      title: "Revenue",
      value: `$${stats.revenue.toLocaleString()}`,
      icon: <FaMoneyBillWave size={30} />,
      color: "info",
    },
  ];

  if (loading)
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
      </div>
    );
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <>
      <h2 className="mb-4 fw-bold">Dashboard Overview</h2>

      <Row>
        {statCards.map((item, index) => (
          <Col md={3} key={index} className="mb-4">
            <Card
              className={`shadow-sm border-0 h-100 bg-${item.color} bg-opacity-10`}
            >
              <Card.Body className="d-flex align-items-center">
                <div className={`text-${item.color} me-3`}>{item.icon}</div>
                <div>
                  <h6 className="text-muted mb-1">{item.title}</h6>
                  <h3 className="mb-0 fw-bold">{item.value}</h3>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {hasRole("admin") && (
        <Row className="mt-4">
          <Col>
            <Card className="shadow-sm border-0">
              <Card.Body>
                <h5 className="mb-3">Quick Actions</h5>
                <p className="text-muted">
                  Manage users, view reports, and configure system settings from
                  the navigation menu above.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </>
  );
}

export default DashboardPage;
