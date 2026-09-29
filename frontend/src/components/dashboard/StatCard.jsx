import { Card } from "react-bootstrap";
export default function StatCard({ icon, title, value }) {
  return <Card className="border-0 shadow-sm h-100"><Card.Body>{icon}<small className="d-block text-muted">{title}</small><h3>{value}</h3></Card.Body></Card>;
}
