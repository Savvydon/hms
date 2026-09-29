import { Alert } from "react-bootstrap";
export default function ErrorAlert({ error, onClose }) {
  if (!error) return null;
  return <Alert variant="danger" dismissible={Boolean(onClose)} onClose={onClose}>{error}</Alert>;
}
