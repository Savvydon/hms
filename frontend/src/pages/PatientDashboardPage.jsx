import { useEffect, useState } from "react";
import { Alert, Card, Col, Row, Spinner, Table } from "react-bootstrap";
import { FaCalendarCheck, FaFileInvoiceDollar, FaFlask, FaPills, FaUser } from "react-icons/fa";
import api from "../api/axios";
import { useAuth } from "../contexts/AuthContext";

export default function PatientDashboardPage() {
  const { user } = useAuth();
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [tests, setTests] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [patients, appointmentData, prescriptionData, testData, billData] = await Promise.all([
          api.get("/patients/"),
          api.get("/appointments/"),
          api.get("/pharmacy/prescriptions"),
          api.get("/laboratory/tests"),
          api.get("/billing/"),
        ]);
        setPatient(patients.data[0] || null);
        setAppointments(appointmentData.data || []);
        setPrescriptions(prescriptionData.data || []);
        setTests(testData.data || []);
        setBills(billData.data || []);
      } catch (err) {
        setError(err.response?.data?.detail || "Unable to load your patient portal.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  const upcoming = appointments.slice(0, 5);
  const recentPrescriptions = prescriptions.slice(0, 5);
  const recentTests = tests.slice(0, 5);
  const recentBills = bills.slice(0, 5);

  return (
    <>
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Welcome, {user?.first_name}</h2>
        <p className="text-muted mb-0">Your personal hospital portal and health information.</p>
      </div>

      <Row className="g-4 mb-4">
        <Col md={6} xl={3}><Card className="border-0 shadow-sm h-100"><Card.Body>
          <FaCalendarCheck className="text-primary fs-3 mb-2" /><small className="d-block text-muted">Appointments</small><h3>{appointments.length}</h3>
        </Card.Body></Card></Col>
        <Col md={6} xl={3}><Card className="border-0 shadow-sm h-100"><Card.Body>
          <FaPills className="text-success fs-3 mb-2" /><small className="d-block text-muted">Prescriptions</small><h3>{prescriptions.length}</h3>
        </Card.Body></Card></Col>
        <Col md={6} xl={3}><Card className="border-0 shadow-sm h-100"><Card.Body>
          <FaFlask className="text-info fs-3 mb-2" /><small className="d-block text-muted">Laboratory Results</small><h3>{tests.length}</h3>
        </Card.Body></Card></Col>
        <Col md={6} xl={3}><Card className="border-0 shadow-sm h-100"><Card.Body>
          <FaFileInvoiceDollar className="text-warning fs-3 mb-2" /><small className="d-block text-muted">Bills</small><h3>{bills.length}</h3>
        </Card.Body></Card></Col>
      </Row>

      <Row className="g-4">
        <Col lg={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <h5 className="fw-semibold"><FaUser className="me-2" />My Profile</h5>
              {patient ? (
                <div className="small">
                  <p className="mb-1"><strong>Name:</strong> {patient.first_name} {patient.last_name}</p>
                  <p className="mb-1"><strong>Email:</strong> {patient.email}</p>
                  <p className="mb-1"><strong>Gender:</strong> {patient.gender || "Not provided"}</p>
                  <p className="mb-1"><strong>Blood Group:</strong> {patient.blood_group || "Not provided"}</p>
                  <p className="mb-0"><strong>Address:</strong> {patient.address || "Not provided"}</p>
                </div>
              ) : <p className="text-muted mb-0">Your patient profile has not been completed.</p>}
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <h5 className="fw-semibold"><FaCalendarCheck className="me-2" />Recent Appointments</h5>
              {upcoming.length ? <Table responsive size="sm" className="mb-0"><thead><tr><th>Doctor</th><th>Date</th><th>Status</th></tr></thead><tbody>{upcoming.map((item) => <tr key={item.id}><td>{item.doctor_name}</td><td>{item.appointment_date}</td><td>{item.status}</td></tr>)}</tbody></Table> : <p className="text-muted mb-0">No appointments found.</p>}
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="border-0 shadow-sm h-100"><Card.Body>
            <h5 className="fw-semibold"><FaPills className="me-2" />Prescriptions</h5>
            {recentPrescriptions.length ? recentPrescriptions.map((item) => <div key={item.id} className="border-bottom py-2"><strong>{item.medicine_name}</strong><div className="small text-muted">{item.dosage} {item.frequency || ""}</div></div>) : <p className="text-muted mb-0">No prescriptions found.</p>}
          </Card.Body></Card>
        </Col>
        <Col lg={4}>
          <Card className="border-0 shadow-sm h-100"><Card.Body>
            <h5 className="fw-semibold"><FaFlask className="me-2" />Laboratory</h5>
            {recentTests.length ? recentTests.map((item) => <div key={item.id} className="border-bottom py-2"><strong>{item.test_name}</strong><div className="small text-muted">{item.status}{item.result ? ` — ${item.result}` : ""}</div></div>) : <p className="text-muted mb-0">No laboratory tests found.</p>}
          </Card.Body></Card>
        </Col>
        <Col lg={4}>
          <Card className="border-0 shadow-sm h-100"><Card.Body>
            <h5 className="fw-semibold"><FaFileInvoiceDollar className="me-2" />Bills</h5>
            {recentBills.length ? recentBills.map((item) => <div key={item.id} className="border-bottom py-2"><strong>{Number(item.total_amount || 0).toLocaleString()}</strong><div className="small text-muted">Paid: {Number(item.paid_amount || 0).toLocaleString()} — {item.status}</div></div>) : <p className="text-muted mb-0">No bills found.</p>}
          </Card.Body></Card>
        </Col>
      </Row>
    </>
  );
}
