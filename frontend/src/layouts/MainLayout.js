import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { displayRole } from '../utils/displayLabels';

export default function MainLayout() {
  const { user, logout } = useAuth();
  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand as={Link} to="/">WAMIS Ticketing</Navbar.Brand>
          <Nav className="ms-auto">
            {user && <Navbar.Text className="text-white me-3">{user.username} ({displayRole(user.role)})</Navbar.Text>}
            {user && <Nav.Link onClick={logout}>Logout</Nav.Link>}
          </Nav>
        </Container>
      </Navbar>
      <Container className="py-4">
        <Outlet />
      </Container>
    </>
  );
}
