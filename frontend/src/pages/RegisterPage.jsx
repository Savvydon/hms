import { useState } from "react";
import { Alert, Button, Card, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { FaHospital } from "react-icons/fa";
import api from "../api/axios";

const initialForm = {
  first_name: "", last_name: "", email: "", username: "", password: "",
  phone: "", gender: "", blood_group: "", address: "", emergency_contact: "", date_of_birth: "",
};

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/register", form);
      navigate("/", { state: { registered: true } });
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-4">
      <Card className="shadow border-0" style={{ maxWidth: 760, width: "100%" }}>
        <Card.Body className="p-4 p-md-5">
          <div className="text-center mb-4">
            <FaHospital size={46} className="text-primary mb-2" />
            <h2 className="fw-bold">Create Patient Account</h2>
            <p className="text-muted mb-0">Register first, then sign in to the hospital system.</p>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={submit}>
            <Row>
              {[
                ["first_name", "First Name"],
                ["last_name", "Last Name"],
                ["email", "Email Address"],
                ["username", "Username"],
                ["password", "Password"],
                ["phone", "Phone"],
              ].map(([name, label]) => (
                <Col md={6} key={name}>
                  <Form.Group className="mb-3">
                    <Form.Label>{label}</Form.Label>
                    <Form.Control
                      name={name}
                      type={name === "email" ? "email" : name === "password" ? "password" : "text"}
                      value={form[name]}
                      onChange={change}
                      minLength={name === "password" ? 8 : undefined}
                      required={!["phone"].includes(name)}
                    />
                  </Form.Group>
                </Col>
              ))}
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Gender</Form.Label>
                  <Form.Select name="gender" value={form.gender} onChange={change}>
                    <option value="">Select</option><option>Male</option><option>Female</option><option>Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Blood Group</Form.Label>
                  <Form.Select name="blood_group" value={form.blood_group} onChange={change}>
                    <option value="">Select</option>
                    {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map((v) => <option key={v}>{v}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Emergency Contact</Form.Label>
                  <Form.Control name="emergency_contact" value={form.emergency_contact} onChange={change} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date of Birth</Form.Label>
                  <Form.Control type="date" name="date_of_birth" value={form.date_of_birth} onChange={change} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control name="address" value={form.address} onChange={change} />
                </Form.Group>
              </Col>
            </Row>

            <Button type="submit" className="w-100 py-2" disabled={loading}>
              {loading ? <><Spinner size="sm" className="me-2" />Creating account...</> : "Register"}
            </Button>
          </Form>

          <div className="text-center mt-3">
            Already registered? <Link to="/">Sign in</Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default RegisterPage;
