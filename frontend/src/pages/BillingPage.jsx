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
import { FaFileInvoiceDollar, FaPlus, FaCheckCircle } from "react-icons/fa";

function BillingPage() {
  const [bills, setBills] = useState([]);
  const [patients, setPatients] = useState([]);
  const [stats, setStats] = useState({
    total_revenue: 0,
    pending_amount: 0,
    total_bills: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [payModal, setPayModal] = useState({
    show: false,
    billId: null,
    amount: "",
  });

  const [formData, setFormData] = useState({
    patient_id: "",
    total_amount: "",
    payment_method: "cash",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [billsRes, patientsRes, statsRes] = await Promise.all([
        api.get("/billing/"),
        api.get("/patients/"),
        api.get("/billing/stats"),
      ]);
      setBills(billsRes.data);
      setPatients(patientsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      setError("Failed to load billing data");
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
      await api.post("/billing/", {
        patient_id: parseInt(formData.patient_id),
        total_amount: parseFloat(formData.total_amount),
        payment_method: formData.payment_method,
      });
      setShowModal(false);
      setFormData({ patient_id: "", total_amount: "", payment_method: "cash" });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create bill");
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    try {
      await api.patch(
        `/billing/${payModal.billId}/pay?amount=${parseFloat(payModal.amount)}`,
      );
      setPayModal({ show: false, billId: null, amount: "" });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || "Payment failed");
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      paid: "success",
      pending: "warning",
      partially_paid: "info",
      cancelled: "danger",
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
        <FaFileInvoiceDollar className="me-2" />
        Billing
      </h2>

      <Row className="mb-4">
        <Col md={4}>
          <Card className="shadow-sm border-0 bg-success bg-opacity-10">
            <Card.Body>
              <h6 className="text-muted">Total Revenue</h6>
              <h3 className="fw-bold text-success">
                ${stats.total_revenue.toLocaleString()}
              </h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm border-0 bg-warning bg-opacity-10">
            <Card.Body>
              <h6 className="text-muted">Pending Amount</h6>
              <h3 className="fw-bold text-warning">
                ${stats.pending_amount.toLocaleString()}
              </h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm border-0 bg-primary bg-opacity-10">
            <Card.Body>
              <h6 className="text-muted">Total Bills</h6>
              <h3 className="fw-bold text-primary">{stats.total_bills}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <div className="d-flex justify-content-end mb-3">
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <FaPlus className="me-2" /> Create Bill
        </Button>
      </div>

      <Card className="shadow-sm border-0">
        <Card.Body>
          <Table striped hover responsive>
            <thead className="bg-light">
              <tr>
                <th>ID</th>
                <th>Patient</th>
                <th>Total</th>
                <th>Paid</th>
                <th>Balance</th>
                <th>Status</th>
                <th>Method</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((bill) => (
                <tr key={bill.id}>
                  <td>{bill.id}</td>
                  <td className="fw-semibold">{bill.patient_name}</td>
                  <td>${bill.total_amount.toFixed(2)}</td>
                  <td>${bill.paid_amount.toFixed(2)}</td>
                  <td
                    className={
                      bill.total_amount - bill.paid_amount > 0
                        ? "text-danger fw-bold"
                        : ""
                    }
                  >
                    ${(bill.total_amount - bill.paid_amount).toFixed(2)}
                  </td>
                  <td>{getStatusBadge(bill.status)}</td>
                  <td>
                    <small className="text-muted">
                      {bill.payment_method || "-"}
                    </small>
                  </td>
                  <td>
                    {(bill.status === "pending" ||
                      bill.status === "partially_paid") && (
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() =>
                          setPayModal({
                            show: true,
                            billId: bill.id,
                            amount: (
                              bill.total_amount - bill.paid_amount
                            ).toFixed(2),
                          })
                        }
                      >
                        <FaCheckCircle className="me-1" /> Pay
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {bills.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center text-muted py-4">
                    No bills found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Create Bill Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaPlus className="me-2" />
            Create New Bill
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
              <Form.Label>Total Amount ($)</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                name="total_amount"
                value={formData.total_amount}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Payment Method</Form.Label>
              <Form.Select
                name="payment_method"
                value={formData.payment_method}
                onChange={handleChange}
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="insurance">Insurance</option>
                <option value="bank_transfer">Bank Transfer</option>
              </Form.Select>
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Create Bill
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Payment Modal */}
      <Modal
        show={payModal.show}
        onHide={() => setPayModal({ show: false, billId: null, amount: "" })}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FaCheckCircle className="me-2" />
            Process Payment
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handlePayment}>
            <Form.Group className="mb-3">
              <Form.Label>Payment Amount ($)</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={payModal.amount}
                onChange={(e) =>
                  setPayModal({ ...payModal, amount: e.target.value })
                }
                required
              />
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
              <Button
                variant="secondary"
                onClick={() =>
                  setPayModal({ show: false, billId: null, amount: "" })
                }
              >
                Cancel
              </Button>
              <Button variant="success" type="submit">
                Confirm Payment
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default BillingPage;
