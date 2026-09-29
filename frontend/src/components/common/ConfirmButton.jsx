import { Button } from "react-bootstrap";
export default function ConfirmButton({ children, confirmMessage="Are you sure?", onConfirm, ...props }) {
  const handle=()=>{ if(window.confirm(confirmMessage)) onConfirm(); };
  return <Button {...props} onClick={handle}>{children}</Button>;
}
