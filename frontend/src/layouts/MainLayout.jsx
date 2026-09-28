import { Badge, Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { FaCalendarCheck, FaChartBar, FaFlask, FaMoneyBill, FaPills, FaSignOutAlt, FaUserMd, FaUsers, FaUserShield } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";

function MainLayout() {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const link = (path, label, icon, roles) => {
    if (roles && !hasRole(roles)) return null;
    const to = `/dashboard${path}`;
    return <Nav.Link as={Link} to={to} active={location.pathname === to}>{icon} {label}</Nav.Link>;
  };

  const signOut = () => { logout(); navigate("/", { replace: true }); };

  return <>
    <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm">
      <Container fluid>
        <Navbar.Brand as={Link} to="/dashboard"><FaUserMd className="me-2" />Hospital Management System</Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse>
          <Nav className="me-auto">
            {link("", "Dashboard", <FaChartBar className="me-1" />)}
            {link("/admin", "Administration", <FaUserShield className="me-1" />, ["admin"])}
            {link("/patients", "Patients", <FaUsers className="me-1" />, ["receptionist","doctor","nurse"])}
            {link("/appointments", "Appointments", <FaCalendarCheck className="me-1" />, ["receptionist","doctor","nurse"])}
            {link("/doctors", "Doctors", <FaUserMd className="me-1" />, ["admin","doctor","nurse"])}
            {link("/billing", "Billing", <FaMoneyBill className="me-1" />, ["accountant","admin"])}
            {link("/pharmacy", "Pharmacy", <FaPills className="me-1" />, ["pharmacist","doctor"])}
            {link("/laboratory", "Laboratory", <FaFlask className="me-1" />, ["laboratory","doctor"])}
          </Nav>
          <Nav><NavDropdown title={<><Badge bg="info" className="me-2">{user?.role}</Badge>{user?.first_name} {user?.last_name}</>} align="end">
            <NavDropdown.Item disabled>{user?.email}</NavDropdown.Item>
            <NavDropdown.Divider />
            <NavDropdown.Item onClick={signOut} className="text-danger"><FaSignOutAlt className="me-2" />Logout</NavDropdown.Item>
          </NavDropdown></Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
    <Container fluid className="mt-4 px-4"><Outlet /></Container>
  </>;
}
export default MainLayout;
