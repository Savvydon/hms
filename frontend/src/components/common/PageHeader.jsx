import { Button } from "react-bootstrap";

export default function PageHeader({ title, description, actionLabel, onAction, actionVariant="primary" }) {
  return (
    <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
      <div>
        <h2 className="fw-bold mb-1">{title}</h2>
        {description && <p className="text-muted mb-0">{description}</p>}
      </div>
      {actionLabel && onAction && <Button variant={actionVariant} onClick={onAction}>{actionLabel}</Button>}
    </div>
  );
}
