import { Badge, Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  FaCalendarCheck,
  FaNotesMedical,
  FaBell,
  FaFileInvoiceDollar,
  FaFlask,
  FaHome,
  FaPills,
  FaSignOutAlt,
  FaUser,
  FaUserMd,
} from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";

const navItems = [
  ["/patient/dashboard", "My Dashboard", FaHome],
  ["/patient/profile", "My Profile", FaUser],
  ["/patient/appointments", "My Appointments", FaCalendarCheck],
  ["/patient/clinical", "My Clinical Record", FaNotesMedical],
  ["/patient/notifications", "Notifications", FaBell],
  ["/patient/prescriptions", "My Prescriptions", FaPills],
  ["/patient/laboratory", "My Laboratory Results", FaFlask],
  ["/patient/billing", "My Bills", FaFileInvoiceDollar],
];

export default function PatientLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const signOut = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <>
      <Navbar bg="success" variant="dark" expand="lg" className="shadow-sm">
        <Container fluid>
          <Navbar.Brand as={Link} to="/patient/dashboard" className="fw-semibold">
            <FaUserMd className="me-2" />
            HMS Patient Portal
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="patient-navigation" />
          <Navbar.Collapse id="patient-navigation">
            <Nav className="me-auto">
              {navItems.map(([path, label, Icon]) => (
                <Nav.Link
                  key={path}
                  as={Link}
                  to={path}
                  active={location.pathname === path}
                  className="d-flex align-items-center gap-1"
                >
                  <Icon /> {label}
                </Nav.Link>
              ))}
            </Nav>
            <Nav>
              <NavDropdown
                align="end"
                title={
                  <>
                    <Badge bg="light" text="dark" className="me-2">
                      PATIENT
                    </Badge>
                    {user?.first_name} {user?.last_name}
                  </>
                }
              >
                <NavDropdown.Item disabled>{user?.email}</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={signOut} className="text-danger">
                  <FaSignOutAlt className="me-2" />
                  Logout
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container fluid className="mt-4 px-4 pb-4">
        <Outlet />
      </Container>
    </>
  );
}
