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
  Tab,
  Tabs,
} from "react-bootstrap";
import api from "../api/axios";
import { FaPills, FaPlus, FaPrescriptionBottleAlt } from "react-icons/fa";

function PharmacyPage() {
  const [medicines, setMedicines] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("medicines");
  const [showMedModal, setShowMedModal] = useState(false);
  const [showPresModal, setShowPresModal] = useState(false);

  const [medForm, setMedForm] = useState({
    name: "",
    generic_name: "",
    category: "",
    unit_price: "",
    stock_quantity: "",
    manufacturer: "",
  });

  const [presForm, setPresForm] = useState({
    patient_id: "",
    medicine_id: "",
    dosage: "",
    frequency: "",
    duration: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [medRes, presRes, patRes] = await Promise.all([
        api.get("/pharmacy/medicines"),
        api.get("/pharmacy/prescriptions"),
        api.get("/patients/"),
      ]);
      setMedicines(medRes.data);
      setPrescriptions(presRes.data);
      setPatients(patRes.data);
    } catch (err) {
      setError("Failed to load pharmacy data");
    } finally {
      setLoading(false);
    }
  };

  const handleMedSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/pharmacy/medicines", null, {
        params: {
          name: medForm.name,
          generic_name: medForm.generic_name || null,
          category: medForm.category || null,
          unit_price: parseFloat(medForm.unit_price),
          stock_quantity: parseInt(medForm.stock_quantity),
          manufacturer: medForm.manufacturer || null,
        },
      });
      setShowMedModal(false);
      setMedForm({
        name: "",
        generic_name: "",
        category: "",
        unit_price: "",
        stock_quantity: "",
        manufacturer: "",
      });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to add medicine");
    }
  };

  const handlePresSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/pharmacy/prescriptions", null, {
        params: {
          patient_id: parseInt(presForm.patient_id),
          medicine_id: parseInt(presForm.medicine_id),
          dosage: presForm.dosage,
          frequency: presForm.frequency || null,
          duration: presForm.duration || null,
        },
      });
      setShowPresModal(false);
      setPresForm({
        patient_id: "",
        medicine_id: "",
        dosage: "",
        frequency: "",
        duration: "",
      });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create prescription");
    }
  };

  const getStockBadge = (qty) => {
    if (qty === 0) return <Badge bg="danger">Out of Stock</Badge>;
    if (qty < 10) return <Badge bg="warning">Low Stock ({qty})</Badge>;
    return <Badge bg="success">In Stock ({qty})</Badge>;
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
        <FaPills className="me-2" />
        Pharmacy
      </h2>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab
          eventKey="medicines"
          title={
            <>
              <FaPills className="me-1" /> Medicines
            </>
          }
        >
          <div className="d-flex justify-content-end mb-3">
            <Button variant="primary" onClick={() => setShowMedModal(true)}>
              <FaPlus className="me-2" /> Add Medicine
            </Button>
          </div>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <Table striped hover responsive>
                <thead className="bg-light">
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Generic Name</th>
                    <th>Category</th>
                    <th>Unit Price</th>
                    <th>Stock</th>
                    <th>Manufacturer</th>
                  </tr>
                </thead>
                <tbody>
                  {medicines.map((med) => (
                    <tr key={med.id}>
                      <td>{med.id}</td>
                      <td className="fw-semibold">{med.name}</td>
                      <td>
                        <small className="text-muted">
                          {med.generic_name || "-"}
                        </small>
                      </td>
                      <td>{med.category || "-"}</td>
                      <td>${med.unit_price.toFixed(2)}</td>
                      <td>{getStockBadge(med.stock_quantity)}</td>
                      <td>
                        <small>{med.manufacturer || "-"}</small>
                      </td>
                    </tr>
                  ))}
                  {medicines.length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center text-muted py-4">
                        No medicines found
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>

        <Tab
          eventKey="prescriptions"
          title={
            <>
              <FaPrescriptionBottleAlt className="me-1" /> Prescriptions
            </>
          }
        >
          <div className="d-flex justify-content-end mb-3">
            <Button variant="primary" onClick={() => setShowPresModal(true)}>
              <FaPlus className="me-2" /> New Prescription
            </Button>
          </div>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <Table striped hover responsive>
                <thead className="bg-light">
                  <tr>
                    <th>ID</th>
                    <th>Patient</th>
                    <th>Medicine</th>
                    <th>Dosage</th>
                    <th>Frequency</th>
                    <th>Duration</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {prescriptions.map((pres) => (
                    <tr key={pres.id}>
                      <td>{pres.id}</td>
                      <td className="fw-semibold">{pres.patient_name}</td>
                      <td>{pres.medicine_name}</td>
                      <td>
                        <Badge bg="primary">{pres.dosage}</Badge>
                      </td>
                      <td>{pres.frequency || "-"}</td>
                      <td>{pres.duration || "-"}</td>
                      <td>
                        <Badge
                          bg={
                            pres.status === "active" ? "success" : "secondary"
                          }
                        >
                          {pres.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {prescriptions.length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center text-muted py-4">
                        No prescriptions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      {/* Add Medicine Modal */}
      <Modal show={showMedModal} onHide={() => setShowMedModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaPlus className="me-2" />
            Add Medicine
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleMedSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Name *</Form.Label>
              <Form.Control
                name="name"
                value={medForm.name}
                onChange={(e) =>
                  setMedForm({ ...medForm, name: e.target.value })
                }
                required
              />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Generic Name</Form.Label>
                  <Form.Control
                    name="generic_name"
                    value={medForm.generic_name}
                    onChange={(e) =>
                      setMedForm({ ...medForm, generic_name: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Control
                    name="category"
                    value={medForm.category}
                    onChange={(e) =>
                      setMedForm({ ...medForm, category: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Unit Price ($) *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="unit_price"
                    value={medForm.unit_price}
                    onChange={(e) =>
                      setMedForm({ ...medForm, unit_price: e.target.value })
                    }
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Stock Quantity *</Form.Label>
                  <Form.Control
                    type="number"
                    name="stock_quantity"
                    value={medForm.stock_quantity}
                    onChange={(e) =>
                      setMedForm({ ...medForm, stock_quantity: e.target.value })
                    }
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Manufacturer</Form.Label>
              <Form.Control
                name="manufacturer"
                value={medForm.manufacturer}
                onChange={(e) =>
                  setMedForm({ ...medForm, manufacturer: e.target.value })
                }
              />
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setShowMedModal(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Add Medicine
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* New Prescription Modal */}
      <Modal show={showPresModal} onHide={() => setShowPresModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaPrescriptionBottleAlt className="me-2" />
            New Prescription
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handlePresSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Patient *</Form.Label>
              <Form.Select
                value={presForm.patient_id}
                onChange={(e) =>
                  setPresForm({ ...presForm, patient_id: e.target.value })
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
              <Form.Label>Medicine *</Form.Label>
              <Form.Select
                value={presForm.medicine_id}
                onChange={(e) =>
                  setPresForm({ ...presForm, medicine_id: e.target.value })
                }
                required
              >
                <option value="">Select Medicine</option>
                {medicines.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} (Stock: {m.stock_quantity})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Dosage *</Form.Label>
              <Form.Control
                placeholder="e.g., 1 tablet"
                value={presForm.dosage}
                onChange={(e) =>
                  setPresForm({ ...presForm, dosage: e.target.value })
                }
                required
              />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Frequency</Form.Label>
                  <Form.Control
                    placeholder="e.g., Twice daily"
                    value={presForm.frequency}
                    onChange={(e) =>
                      setPresForm({ ...presForm, frequency: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Duration</Form.Label>
                  <Form.Control
                    placeholder="e.g., 7 days"
                    value={presForm.duration}
                    onChange={(e) =>
                      setPresForm({ ...presForm, duration: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setShowPresModal(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Create Prescription
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default PharmacyPage;
