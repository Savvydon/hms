import { useEffect, useState } from "react";
import { Alert, Badge, Button, Card, Col, Form, Modal, Row, Spinner, Table } from "react-bootstrap";
import { FaUserShield, FaPlus, FaToggleOn, FaToggleOff } from "react-icons/fa";
import api from "../api/axios";

const roles = ["admin", "doctor", "nurse", "receptionist", "pharmacist", "laboratory", "accountant", "patient"];

function AdminPage() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", username: "", password: "", phone: "", role: "nurse" });

  const load = async () => {
    try {
      const [u, s] = await Promise.all([api.get("/admin/users"), api.get("/admin/stats")]);
      setUsers(u.data); setStats(s.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load administration data.");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/users", form);
      setShow(false);
      setForm({ first_name: "", last_name: "", email: "", username: "", password: "", phone: "", role: "nurse" });
      load();
    } catch (err) { setError(err.response?.data?.detail || "Failed to create user."); }
  };

  const toggle = async (user) => {
    try {
      await api.patch(`/admin/users/${user.id}`, { is_active: !user.is_active });
      load();
    } catch (err) { setError(err.response?.data?.detail || "Failed to update user."); }
  };

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div><h2 className="fw-bold mb-1"><FaUserShield className="me-2" />Administration</h2><p className="text-muted mb-0">Manage users and system access.</p></div>
        <Button onClick={() => setShow(true)}><FaPlus className="me-2" />Create User</Button>
      </div>
      {error && <Alert variant="danger" dismissible onClose={() => setError("")}>{error}</Alert>}

      <Row className="g-3 mb-4">
        {[
          ["Users", stats?.users], ["Patients", stats?.patients], ["Doctors", stats?.doctors],
          ["Appointments", stats?.appointments], ["Bills", stats?.bills], ["Revenue", `₦${Number(stats?.revenue || 0).toLocaleString()}`],
        ].map(([label, value]) => <Col sm={6} lg={2} key={label}><Card className="border-0 shadow-sm h-100"><Card.Body><small className="text-muted">{label}</small><h4 className="fw-bold mb-0">{value}</h4></Card.Body></Card></Col>)}
      </Row>

      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white fw-semibold">System Users</Card.Header>
        <Card.Body>
          <Table responsive hover>
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Created</th><th>Action</th></tr></thead>
            <tbody>
              {users.map((u) => <tr key={u.id}>
                <td>{u.first_name} {u.last_name}</td><td>{u.email}</td>
                <td><Badge bg="secondary">{u.role}</Badge></td>
                <td><Badge bg={u.is_active ? "success" : "danger"}>{u.is_active ? "Active" : "Inactive"}</Badge></td>
                <td>{u.created_at ? new Date(u.created_at).toLocaleDateString() : "-"}</td>
                <td><Button size="sm" variant={u.is_active ? "outline-danger" : "outline-success"} onClick={() => toggle(u)}>{u.is_active ? <FaToggleOff /> : <FaToggleOn />}</Button></td>
              </tr>)}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Modal show={show} onHide={() => setShow(false)} size="lg">
        <Modal.Header closeButton><Modal.Title>Create System User</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form onSubmit={create}><Row>
            {["first_name","last_name","email","username","password","phone"].map((name) => <Col md={6} key={name}><Form.Group className="mb-3"><Form.Label>{name.replace("_"," ").replace(/\b\w/g, c => c.toUpperCase())}</Form.Label><Form.Control name={name} type={name === "email" ? "email" : name === "password" ? "password" : "text"} value={form[name]} onChange={(e) => setForm({ ...form, [name]: e.target.value })} required={!["phone"].includes(name)} minLength={name === "password" ? 8 : undefined} /></Form.Group></Col>)}
            <Col md={6}><Form.Group className="mb-3"><Form.Label>Role</Form.Label><Form.Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>{roles.map((r) => <option key={r} value={r}>{r}</option>)}</Form.Select></Form.Group></Col>
          </Row><Button type="submit">Create User</Button></Form>
        </Modal.Body>
      </Modal>
    </>
  );
}
export default AdminPage;
