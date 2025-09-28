import { Navbar, Nav, Button, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, username } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <Navbar bg="white" expand="lg" className="shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold">
          Hexlet Chat
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {isAuthenticated ? (
              <div className="d-flex align-items-center">
                <span className="navbar-text me-3">Привет, {username}!</span>
                <Button
                  variant="outline-primary"
                  onClick={handleLogout}
                  size="sm"
                >
                  Выйти
                </Button>
              </div>
            ) : (
              <div className="d-flex align-items-center">
                <Nav.Link as={Link} to="/login" className="me-2">
                  Войти
                </Nav.Link>
                <Nav.Link as={Link} to="/signup">
                  Регистрация
                </Nav.Link>
              </div>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;