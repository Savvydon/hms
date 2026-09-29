import { Form } from "react-bootstrap";
export default function SelectField({ label, name, value, onChange, options, required=false }) {
 return <Form.Group className="mb-3"><Form.Label>{label}</Form.Label><Form.Select name={name} value={value} onChange={onChange} required={required}><option value="">Select {label}</option>{options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</Form.Select></Form.Group>;
}
