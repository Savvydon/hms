import { Spinner } from "react-bootstrap";
export default function LoadingState({ label="Loading..." }) {
  return <div className="text-center py-5"><Spinner animation="border" role="status" /><div className="small text-muted mt-2">{label}</div></div>;
}
