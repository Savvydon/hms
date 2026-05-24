import { Container, Nav, Navbar, NavDropdown, Badge } from "react-bootstrap";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  FaUserMd,
  FaCalendarCheck,
  FaUsers,
  FaPills,
  FaFlask,
  FaMoneyBill,
  FaSignOutAlt,
  FaChartBar,
} from "react-icons/fa";

function MainLayout() {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navLink = (to, icon, label, roles) => {
    if (roles && !hasRole(roles)) return null;
    const isActive = location.pathname === `/dashboard${to}`;
    return (
      <Nav.Link
        as={Link}
        to={`/dashboard${to}`}
        className={isActive ? "active fw-bold" : ""}
      >
        {icon} {label}
      </Nav.Link>
    );
  };

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg" className="shadow">
        <Container fluid>
          <Navbar.Brand as={Link} to="/dashboard">
            <FaUserMd className="me-2" />
            Hospital Management System
          </Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse>
            <Nav className="me-auto">
              {navLink("", <FaChartBar className="me-1" />, "Dashboard")}
              {navLink("/patients", <FaUsers className="me-1" />, "Patients", [
                "receptionist",
                "doctor",
                "nurse",
              ])}
              {navLink(
                "/appointments",
                <FaCalendarCheck className="me-1" />,
                "Appointments",
                ["receptionist", "doctor", "nurse"],
              )}
              {navLink("/doctors", <FaUserMd className="me-1" />, "Doctors", [
                "admin",
              ])}
              {navLink(
                "/billing",
                <FaMoneyBill className="me-1" />,
                "Billing",
                ["accountant", "admin"],
              )}
              {navLink("/pharmacy", <FaPills className="me-1" />, "Pharmacy", [
                "pharmacist",
                "doctor",
              ])}
              {navLink(
                "/laboratory",
                <FaFlask className="me-1" />,
                "Laboratory",
                ["laboratory", "doctor"],
              )}
            </Nav>
            <Nav>
              <NavDropdown
                title={
                  <span>
                    <Badge bg="info" className="me-2">
                      {user?.role}
                    </Badge>
                    {user?.first_name} {user?.last_name}
                  </span>
                }
                align="end"
              >
                <NavDropdown.Item disabled>
                  Email: {user?.email}
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item
                  onClick={handleLogout}
                  className="text-danger"
                >
                  <FaSignOutAlt className="me-2" /> Logout
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container fluid className="mt-4 px-4">
        <Outlet />
      </Container>
    </>
  );
}

export default MainLayout;
