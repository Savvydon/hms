import { useEffect, useState } from "react";
import { Alert, Card, Col, Row, Spinner } from "react-bootstrap";
import { FaCalendarCheck, FaFlask, FaMoneyBillWave, FaUserMd, FaUsers, FaUserShield } from "react-icons/fa";
import api from "../api/axios";
import { useAuth } from "../contexts/AuthContext";

function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        if (user.role === "admin") {
          const { data } = await api.get("/admin/stats");
          setStats(data);
        } else {
          const requests = [
            api.get("/appointments/").catch(() => ({ data: [] })),
            api.get("/patients/").catch(() => ({ data: [] })),
            api.get("/doctors/").catch(() => ({ data: [] })),
          ];
          const [appointments, patients, doctors] = await Promise.all(requests);
          setStats({ appointments: appointments.data.length, patients: patients.data.length, doctors: doctors.data.length });
        }
      } catch (err) {
        setError(err.response?.data?.detail || "Unable to load dashboard.");
      }
    };
    load();
  }, [user.role]);

  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!stats) return <div className="text-center mt-5"><Spinner animation="border" /></div>;

  const cards = [
    ["Patients", stats.patients ?? 0, <FaUsers />, "primary"],
    ["Doctors", stats.doctors ?? 0, <FaUserMd />, "success"],
    ["Appointments", stats.appointments ?? 0, <FaCalendarCheck />, "warning"],
    ["Laboratory Tests", stats.laboratory_tests ?? 0, <FaFlask />, "info"],
    ["Bills", stats.bills ?? 0, <FaMoneyBillWave />, "secondary"],
    ["Users", stats.users ?? 0, <FaUserShield />, "dark"],
  ];

  return <>
    <h2 className="fw-bold mb-4">Dashboard Overview</h2>
    <Row className="g-4">
      {cards.map(([title, value, icon, color]) => <Col sm={6} lg={4} xl={2} key={title}><Card className="border-0 shadow-sm h-100"><Card.Body><div className={`text-${color} fs-3 mb-2`}>{icon}</div><small className="text-muted">{title}</small><h3 className="fw-bold mb-0">{value}</h3></Card.Body></Card></Col>)}
    </Row>
    {user.role === "admin" && <Card className="border-0 shadow-sm mt-4"><Card.Body><h5>Administration</h5><p className="text-muted mb-0">Use Administration to create staff accounts, manage access, activate or deactivate users, and review system statistics.</p></Card.Body></Card>}
  </>;
}
export default DashboardPage;
