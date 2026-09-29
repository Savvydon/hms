import { useEffect, useState } from "react";
import { Alert, Card, Spinner, Table } from "react-bootstrap";
import api from "../api/axios";

export default function AdminAuditPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => { api.get("/admin/audit-logs?limit=200").then(r => setLogs(r.data || [])).catch(e => setError(e.response?.data?.detail || "Unable to load audit logs.")).finally(() => setLoading(false)); }, []);
  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  return <><h2 className="fw-bold mb-1">Audit Logs</h2><p className="text-muted mb-4">Track important administrative and clinical actions performed in the system.</p>{error && <Alert variant="danger">{error}</Alert>}<Card className="border-0 shadow-sm"><Card.Body><Table responsive hover size="sm"><thead><tr><th>Date</th><th>User</th><th>Action</th><th>Entity</th><th>ID</th><th>Details</th></tr></thead><tbody>{logs.map(log => <tr key={log.id}><td>{log.created_at ? new Date(log.created_at).toLocaleString() : "-"}</td><td>{log.user_name}</td><td>{log.action}</td><td>{log.entity_type || "-"}</td><td>{log.entity_id || "-"}</td><td>{log.details || "-"}</td></tr>)}{!logs.length && <tr><td colSpan="6" className="text-center text-muted py-4">No audit records found.</td></tr>}</tbody></Table></Card.Body></Card></>;
}
