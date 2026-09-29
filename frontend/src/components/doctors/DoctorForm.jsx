import { Form, Row, Col } from "react-bootstrap";

const fields = [
  ["first_name", "First name", "text"],
  ["last_name", "Last name", "text"],
  ["email", "Email", "email"],
  ["username", "Username", "text"],
  ["password", "Password", "password"],
  ["phone", "Phone", "text"],
  ["specialization", "Specialization", "text"],
  ["department", "Department", "text"],
  ["consultation_fee", "Consultation fee", "number"],
  ["license_number", "License number", "text"],
];

export default function DoctorForm({ value, onChange }) {
  return (
    <Row className="g-3">
      {fields.map(([name, label, type]) => (
        <Col md={6} key={name}>
          <Form.Group>
            <Form.Label>{label}</Form.Label>
            <Form.Control
              name={name}
              type={type}
              value={value[name]}
              onChange={onChange}
              minLength={name === "password" ? 8 : undefined}
              min={name === "consultation_fee" ? 0 : undefined}
              step={name === "consultation_fee" ? "0.01" : undefined}
              required={!['phone', 'license_number'].includes(name)}
            />
          </Form.Group>
        </Col>
      ))}
    </Row>
  );
}
