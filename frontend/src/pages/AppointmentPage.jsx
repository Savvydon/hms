import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Form,
  Table,
  Spinner,
  Alert,
  Badge,
  Modal,
} from "react-bootstrap";
import api from "../api/axios";
import { useAuth } from "../contexts/AuthContext";
import { FaPlus, FaCalendarPlus } from "react-icons/fa";

function AppointmentPage() {
  const { hasRole } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    patient_id: "",
    doctor_id: "",
    appointment_date: "",
    appointment_time: "",
    reason: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [apptRes, patRes, docRes] = await Promise.all([
        api.get("/appointments/"),
        api.get("/patients/"),
        api.get("/doctors/"),
      ]);
      setAppointments(apptRes.data);
      setPatients(patRes.data);
      setDoctors(docRes.data);
    } catch (err) {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // FIXED: Send correct field names matching backend schema
      await api.post("/appointments/", {
        patient_id: parseInt(formData.patient_id),
        doctor_id: parseInt(formData.doctor_id),
        appointment_date: formData.appointment_date,
        appointment_time: formData.appointment_time + ":00", // Add seconds
        reason: formData.reason,
      });
      setShowModal(false);
      setFormData({
        patient_id: "",
        doctor_id: "",
        appointment_date: "",
        appointment_time: "",
        reason: "",
      });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create appointment");
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: "warning",
      confirmed: "primary",
      completed: "success",
      cancelled: "danger",
    };
    return <Badge bg={variants[status] || "secondary"}>{status}</Badge>;
  };

  if (loading)
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
      </div>
    );

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Appointments</h2>
        {hasRole("receptionist") && (
          <Button variant="primary" onClick={() => setShowModal(true)}>
            <FaCalendarPlus className="me-2" /> New Appointment
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Card className="shadow-sm border-0">
        <Card.Body>
          <Table striped hover responsive>
            <thead className="bg-light">
              <tr>
                <th>ID</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Time</th>
                <th>Reason</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td>{appointment.id}</td>
                  <td>{appointment.patient_name}</td>
                  <td>{appointment.doctor_name}</td>
                  <td>{appointment.appointment_date}</td>
                  <td>{appointment.appointment_time?.substring(0, 5)}</td>
                  <td>{appointment.reason || "-"}</td>
                  <td>{getStatusBadge(appointment.status)}</td>
                </tr>
              ))}
              {appointments.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center text-muted py-4">
                    No appointments found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Create Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaPlus className="me-2" />
            Create Appointment
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Patient</Form.Label>
              <Form.Select
                name="patient_id"
                value={formData.patient_id}
                onChange={handleChange}
                required
              >
                <option value="">Select Patient</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.first_name} {p.last_name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Doctor</Form.Label>
              <Form.Select
                name="doctor_id"
                value={formData.doctor_id}
                onChange={handleChange}
                required
              >
                <option value="">Select Doctor</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    Dr. {d.first_name} {d.last_name} - {d.specialization}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="appointment_date"
                    value={formData.appointment_date}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Time</Form.Label>
                  <Form.Control
                    type="time"
                    name="appointment_time"
                    value={formData.appointment_time}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Reason</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="Reason for visit..."
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Book Appointment
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default AppointmentPage;
