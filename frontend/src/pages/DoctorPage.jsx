import { useEffect, useState } from "react";
import {
  Card,
  Table,
  Spinner,
  Alert,
  Badge,
  Button,
  Modal,
  Form,
  Row,
  Col,
} from "react-bootstrap";
import api from "../api/axios";
import { FaUserMd, FaPlus } from "react-icons/fa";

function DoctorPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    username: "",
    password: "",
    phone: "",
    specialization: "",
    department: "",
    consultation_fee: "",
    license_number: "",
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await api.get("/doctors/");
      setDoctors(response.data);
    } catch (err) {
      setError("Failed to load doctors");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userRes = await api.post("/auth/register", {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        username: formData.username,
        password: formData.password,
        role: "doctor",
        phone: formData.phone,
      });

      await api.post("/doctors/", {
        user_id: userRes.data.id,
        specialization: formData.specialization,
        department: formData.department,
        consultation_fee: parseFloat(formData.consultation_fee) || 0,
        license_number: formData.license_number,
      });

      setShowModal(false);
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        username: "",
        password: "",
        phone: "",
        specialization: "",
        department: "",
        consultation_fee: "",
        license_number: "",
      });
      fetchDoctors();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create doctor");
    }
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
        <h2 className="fw-bold">
          <FaUserMd className="me-2" />
          Doctors
        </h2>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <FaPlus className="me-2" /> Add Doctor
        </Button>
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
                <th>Name</th>
                <th>Email</th>
                <th>Specialization</th>
                <th>Department</th>
                <th>Consultation Fee</th>
                <th>License</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doctor) => (
                <tr key={doctor.id}>
                  <td>{doctor.id}</td>
                  <td className="fw-semibold">
                    Dr. {doctor.first_name} {doctor.last_name}
                  </td>
                  <td>{doctor.email}</td>
                  <td>
                    <Badge bg="info">{doctor.specialization}</Badge>
                  </td>
                  <td>{doctor.department}</td>
                  <td>${doctor.consultation_fee}</td>
                  <td>
                    <small className="text-muted">
                      {doctor.license_number || "-"}
                    </small>
                  </td>
                </tr>
              ))}
              {doctors.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center text-muted py-4">
                    No doctors found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaPlus className="me-2" />
            Add New Doctor
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Specialization</Form.Label>
                  <Form.Control
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Department</Form.Label>
                  <Form.Control
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Consultation Fee ($)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="consultation_fee"
                    value={formData.consultation_fee}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>License Number</Form.Label>
                  <Form.Control
                    name="license_number"
                    value={formData.license_number}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Add Doctor
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default DoctorPage;
