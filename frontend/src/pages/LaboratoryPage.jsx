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
import { FaFlask, FaPlus, FaClipboardCheck } from "react-icons/fa";

function LaboratoryPage() {
  const [tests, setTests] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [resultModal, setResultModal] = useState({
    show: false,
    testId: null,
    result: "",
  });

  const [formData, setFormData] = useState({
    patient_id: "",
    doctor_id: "",
    test_name: "",
    test_type: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [testsRes, patientsRes, doctorsRes] = await Promise.all([
        api.get("/laboratory/tests"),
        api.get("/patients/"),
        api.get("/doctors/"),
      ]);
      setTests(testsRes.data);
      setPatients(patientsRes.data);
      setDoctors(doctorsRes.data);
    } catch (err) {
      setError("Failed to load laboratory data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/laboratory/tests", null, {
        params: {
          patient_id: parseInt(formData.patient_id),
          doctor_id: formData.doctor_id ? parseInt(formData.doctor_id) : null,
          test_name: formData.test_name,
          test_type: formData.test_type || null,
        },
      });
      setShowModal(false);
      setFormData({
        patient_id: "",
        doctor_id: "",
        test_name: "",
        test_type: "",
      });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create test");
    }
  };

  const handleResultSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.patch(
        `/laboratory/tests/${resultModal.testId}/result?result=${encodeURIComponent(resultModal.result)}`,
      );
      setResultModal({ show: false, testId: null, result: "" });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update result");
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: "warning",
      in_progress: "info",
      completed: "success",
    };
    return (
      <Badge bg={variants[status] || "secondary"}>
        {status.replace("_", " ")}
      </Badge>
    );
  };

  if (loading)
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
      </div>
    );

  return (
    <>
      <h2 className="fw-bold mb-4">
        <FaFlask className="me-2" />
        Laboratory
      </h2>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <div className="d-flex justify-content-end mb-3">
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <FaPlus className="me-2" /> Order Test
        </Button>
      </div>

      <Card className="shadow-sm border-0">
        <Card.Body>
          <Table striped hover responsive>
            <thead className="bg-light">
              <tr>
                <th>ID</th>
                <th>Patient</th>
                <th>Test Name</th>
                <th>Type</th>
                <th>Status</th>
                <th>Result</th>
                <th>Ordered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tests.map((test) => (
                <tr key={test.id}>
                  <td>{test.id}</td>
                  <td className="fw-semibold">{test.patient_name}</td>
                  <td>{test.test_name}</td>
                  <td>
                    <small className="text-muted">
                      {test.test_type || "-"}
                    </small>
                  </td>
                  <td>{getStatusBadge(test.status)}</td>
                  <td>
                    {test.result ? (
                      <small className="text-success">
                        {test.result.substring(0, 50)}
                        {test.result.length > 50 ? "..." : ""}
                      </small>
                    ) : (
                      <small className="text-muted">Pending</small>
                    )}
                  </td>
                  <td>
                    <small>
                      {new Date(test.ordered_date).toLocaleDateString()}
                    </small>
                  </td>
                  <td>
                    {test.status !== "completed" && (
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() =>
                          setResultModal({
                            show: true,
                            testId: test.id,
                            result: test.result || "",
                          })
                        }
                      >
                        <FaClipboardCheck className="me-1" /> Result
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {tests.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center text-muted py-4">
                    No tests found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Order Test Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaPlus className="me-2" />
            Order Laboratory Test
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Patient *</Form.Label>
              <Form.Select
                name="patient_id"
                value={formData.patient_id}
                onChange={(e) =>
                  setFormData({ ...formData, patient_id: e.target.value })
                }
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
              <Form.Label>Referring Doctor</Form.Label>
              <Form.Select
                name="doctor_id"
                value={formData.doctor_id}
                onChange={(e) =>
                  setFormData({ ...formData, doctor_id: e.target.value })
                }
              >
                <option value="">Select Doctor (Optional)</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    Dr. {d.first_name} {d.last_name} - {d.specialization}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Test Name *</Form.Label>
              <Form.Control
                name="test_name"
                value={formData.test_name}
                onChange={(e) =>
                  setFormData({ ...formData, test_name: e.target.value })
                }
                placeholder="e.g., Complete Blood Count"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Test Type</Form.Label>
              <Form.Control
                name="test_type"
                value={formData.test_type}
                onChange={(e) =>
                  setFormData({ ...formData, test_type: e.target.value })
                }
                placeholder="e.g., Blood Test, Urinalysis"
              />
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Order Test
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Enter Result Modal */}
      <Modal
        show={resultModal.show}
        onHide={() => setResultModal({ show: false, testId: null, result: "" })}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FaClipboardCheck className="me-2" />
            Enter Test Result
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleResultSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Result *</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={resultModal.result}
                onChange={(e) =>
                  setResultModal({ ...resultModal, result: e.target.value })
                }
                placeholder="Enter test results and observations..."
                required
              />
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
              <Button
                variant="secondary"
                onClick={() =>
                  setResultModal({ show: false, testId: null, result: "" })
                }
              >
                Cancel
              </Button>
              <Button variant="success" type="submit">
                Save Result
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default LaboratoryPage;
