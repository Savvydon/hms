import { Button, Modal } from "react-bootstrap";
export default function FormModal({ show, onHide, title, children, onSubmit, submitLabel="Save", size="lg", busy=false }) {
 return <Modal show={show} onHide={busy?undefined:onHide} size={size} centered><Modal.Header closeButton={!busy}><Modal.Title>{title}</Modal.Title></Modal.Header><form onSubmit={onSubmit}><Modal.Body>{children}</Modal.Body><Modal.Footer><Button variant="secondary" onClick={onHide} disabled={busy}>Cancel</Button><Button type="submit" variant="primary" disabled={busy}>{busy?"Saving...":submitLabel}</Button></Modal.Footer></form></Modal>;
}
