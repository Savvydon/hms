import { Card, Col, Row } from "react-bootstrap";
import { FaUser } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { useEffect, useState } from "react";
import api from "../api/axios";

export default function PatientProfilePage() {
  const { user } = useAuth();
  const [patient, setPatient] = useState(null);
  useEffect(() => { api.get("/patients/").then(({ data }) => setPatient(data[0] || null)); }, []);

  return <Card className="border-0 shadow-sm"><Card.Body className="p-4">
    <h3 className="fw-bold mb-4"><FaUser className="me-2" />My Profile</h3>
    <Row className="g-3">
      <Col md={6}><strong>First Name</strong><div>{patient?.first_name || user?.first_name}</div></Col>
      <Col md={6}><strong>Last Name</strong><div>{patient?.last_name || user?.last_name}</div></Col>
      <Col md={6}><strong>Email</strong><div>{patient?.email || user?.email}</div></Col>
      <Col md={6}><strong>Username</strong><div>{user?.username}</div></Col>
      <Col md={6}><strong>Phone</strong><div>{user?.phone || "Not provided"}</div></Col>
      <Col md={6}><strong>Gender</strong><div>{patient?.gender || "Not provided"}</div></Col>
      <Col md={6}><strong>Blood Group</strong><div>{patient?.blood_group || "Not provided"}</div></Col>
      <Col md={6}><strong>Date of Birth</strong><div>{patient?.date_of_birth || "Not provided"}</div></Col>
      <Col md={6}><strong>Emergency Contact</strong><div>{patient?.emergency_contact || "Not provided"}</div></Col>
      <Col md={6}><strong>Address</strong><div>{patient?.address || "Not provided"}</div></Col>
    </Row>
  </Card.Body></Card>;
}
