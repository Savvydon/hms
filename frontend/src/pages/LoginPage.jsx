import { useEffect, useState } from "react";
import { Alert, Button, Card, Container, Form, Spinner } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaHospital, FaEnvelope, FaLock } from "react-icons/fa";
import api from "../api/axios";
import { useAuth } from "../contexts/AuthContext";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState(location.state?.registered ? "Registration successful. You can now sign in." : "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/login", form);
      login(data.access_token, data.user);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="vh-100 d-flex align-items-center justify-content-center bg-light">
      <Card className="shadow border-0" style={{ width: 420, maxWidth: "94vw" }}>
        <Card.Body className="p-5">
          <div className="text-center mb-4">
            <FaHospital size={50} className="text-primary mb-3" />
            <h2 className="fw-bold">Hospital Management System</h2>
            <p className="text-muted">Sign in to continue</p>
          </div>
          {message && <Alert variant="success">{message}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={submit}>
            <Form.Group className="mb-3">
              <Form.Label><FaEnvelope className="me-2" />Email Address</Form.Label>
              <Form.Control type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label><FaLock className="me-2" />Password</Form.Label>
              <Form.Control type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </Form.Group>
            <Button className="w-100 py-2" type="submit" disabled={loading}>
              {loading ? <><Spinner size="sm" className="me-2" />Signing in...</> : "Sign In"}
            </Button>
          </Form>
          <div className="text-center mt-3">
            New patient? <Link to="/register">Create an account</Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default LoginPage;
