import { useEffect, useState } from "react";
import { Alert, Card, Spinner, Table } from "react-bootstrap";
import api from "../api/axios";

const configs = {
  appointments: { endpoint: "/appointments/", title: "My Appointments" },
  prescriptions: { endpoint: "/pharmacy/prescriptions", title: "My Prescriptions" },
  laboratory: { endpoint: "/laboratory/tests", title: "My Laboratory Results" },
  billing: { endpoint: "/billing/", title: "My Bills" },
};

export default function PatientDataPage({ type }) {
  const config = configs[type];
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(config.endpoint)
      .then(({ data: result }) => setData(result || []))
      .catch((err) => setError(err.response?.data?.detail || `Unable to load ${config.title.toLowerCase()}.`))
      .finally(() => setLoading(false));
  }, [config.endpoint, config.title]);

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return <Card className="border-0 shadow-sm"><Card.Body>
    <h3 className="fw-bold mb-4">{config.title}</h3>
    {!data.length ? <p className="text-muted mb-0">No records found.</p> : <Table responsive hover>
      <thead><tr>{type === "appointments" && <><th>Doctor</th><th>Date</th><th>Time</th><th>Status</th></>}{type === "prescriptions" && <><th>Medicine</th><th>Dosage</th><th>Frequency</th><th>Status</th></>}{type === "laboratory" && <><th>Test</th><th>Type</th><th>Status</th><th>Result</th></>}{type === "billing" && <><th>Total</th><th>Paid</th><th>Status</th><th>Payment Method</th></>}</tr></thead>
      <tbody>{data.map((item) => <tr key={item.id}>
        {type === "appointments" && <><td>{item.doctor_name}</td><td>{item.appointment_date}</td><td>{item.appointment_time}</td><td>{item.status}</td></>}
        {type === "prescriptions" && <><td>{item.medicine_name}</td><td>{item.dosage}</td><td>{item.frequency || "-"}</td><td>{item.status}</td></>}
        {type === "laboratory" && <><td>{item.test_name}</td><td>{item.test_type || "-"}</td><td>{item.status}</td><td>{item.result || "Pending"}</td></>}
        {type === "billing" && <><td>{Number(item.total_amount || 0).toLocaleString()}</td><td>{Number(item.paid_amount || 0).toLocaleString()}</td><td>{item.status}</td><td>{item.payment_method || "-"}</td></>}
      </tr>)}</tbody>
    </Table>}
  </Card.Body></Card>;
}
