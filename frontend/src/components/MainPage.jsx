import { Container, Card, Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';

const MainPage = () => {
  const dispatch = useDispatch();
  const { token, username } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="h-100 bg-light">
      <nav className="shadow-sm navbar navbar-expand-lg navbar-light bg-white">
        <div className="container">
          <a className="navbar-brand" href="/">Hexlet Chat</a>
          <div className="navbar-nav ms-auto">
            <span className="navbar-text me-3">Привет, {username}!</span>
            <Button variant="outline-primary" onClick={handleLogout}>
              Выйти
            </Button>
          </div>
        </div>
      </nav>

      <Container className="mt-4">
        <Card>
          <Card.Header as="h2">Hexlet Chat</Card.Header>
          <Card.Body>
            <Card.Text>
              Добро пожаловать в Hexlet Chat! Вы успешно авторизованы.
            </Card.Text>
            <Button variant="primary">Начать общение</Button>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default MainPage;