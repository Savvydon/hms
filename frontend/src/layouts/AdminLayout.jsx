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
  FaChartLine,
  FaUserShield,
} from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";

const navItems = [
  { path: "/admin/dashboard", label: "Dashboard", icon: <FaChartBar /> },
  { path: "/admin/users", label: "Administration", icon: <FaUserShield /> },
  { path: "/admin/patients", label: "Patients", icon: <FaUsers /> },
  { path: "/admin/appointments", label: "Appointments", icon: <FaCalendarCheck /> },
  { path: "/admin/doctors", label: "Doctors", icon: <FaUserMd /> },
  { path: "/admin/billing", label: "Billing", icon: <FaMoneyBill /> },
  { path: "/admin/pharmacy", label: "Pharmacy", icon: <FaPills /> },
  { path: "/admin/laboratory", label: "Laboratory", icon: <FaFlask /> },
  { path: "/admin/reports", label: "Reports", icon: <FaChartLine /> },
  { path: "/admin/audit", label: "Audit Logs", icon: <FaChartLine /> },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const signOut = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm">
        <Container fluid>
          <Navbar.Brand as={Link} to="/admin/dashboard" className="fw-semibold">
            <FaUserMd className="me-2" />
            HMS Administration
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="admin-navigation" />
          <Navbar.Collapse id="admin-navigation">
            <Nav className="me-auto">
              {navItems.map((item) => (
                <Nav.Link
                  key={item.path}
                  as={Link}
                  to={item.path}
                  active={location.pathname === item.path}
                  className="d-flex align-items-center gap-1"
                >
                  {item.icon} {item.label}
                </Nav.Link>
              ))}
            </Nav>
            <Nav>
              <NavDropdown
                align="end"
                title={
                  <>
                    <Badge bg="info" className="me-2">
                      ADMIN
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
