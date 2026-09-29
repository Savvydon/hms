import { Badge, Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  FaCalendarCheck,
  FaChartBar,
  FaFlask,
  FaMoneyBill,
  FaPills,
  FaSignOutAlt,
  FaUserMd,
  FaUsers,
  FaNotesMedical,
} from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";

const roleLabels = {
  doctor: "Doctor",
  nurse: "Nurse",
  receptionist: "Receptionist",
  pharmacist: "Pharmacist",
  laboratory: "Laboratory",
  accountant: "Accountant",
};

const roleNavigation = {
  doctor: [
    ["/staff/dashboard", "Dashboard", FaChartBar],
    ["/staff/patients", "Patients", FaUsers],
    ["/staff/appointments", "Appointments", FaCalendarCheck],
    ["/staff/doctors", "Doctors", FaUserMd],
    ["/staff/pharmacy", "Pharmacy", FaPills],
    ["/staff/laboratory", "Laboratory", FaFlask],
    ["/staff/clinical", "Clinical Care", FaNotesMedical],
  ],
  nurse: [
    ["/staff/dashboard", "Dashboard", FaChartBar],
    ["/staff/patients", "Patients", FaUsers],
    ["/staff/appointments", "Appointments", FaCalendarCheck],
    ["/staff/doctors", "Doctors", FaUserMd],
    ["/staff/clinical", "Clinical Care", FaNotesMedical],
  ],
  receptionist: [
    ["/staff/dashboard", "Dashboard", FaChartBar],
    ["/staff/patients", "Patients", FaUsers],
    ["/staff/appointments", "Appointments", FaCalendarCheck],
  ],
  pharmacist: [
    ["/staff/dashboard", "Dashboard", FaChartBar],
    ["/staff/pharmacy", "Pharmacy", FaPills],
  ],
  laboratory: [
    ["/staff/dashboard", "Dashboard", FaChartBar],
    ["/staff/laboratory", "Laboratory", FaFlask],
  ],
  accountant: [
    ["/staff/dashboard", "Dashboard", FaChartBar],
    ["/staff/billing", "Billing", FaMoneyBill],
  ],
};

export default function StaffLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const items = roleNavigation[user?.role] || roleNavigation.receptionist;

  const signOut = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <>
      <Navbar bg="primary" variant="dark" expand="lg" className="shadow-sm">
        <Container fluid>
          <Navbar.Brand as={Link} to="/staff/dashboard" className="fw-semibold">
            <FaUserMd className="me-2" />
            HMS Staff Portal
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="staff-navigation" />
          <Navbar.Collapse id="staff-navigation">
            <Nav className="me-auto">
              {items.map(([path, label, Icon]) => (
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
                      {roleLabels[user?.role] || user?.role}
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
