import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Button } from 'react-bootstrap';

const MainPage = () => {
  const navigate = useNavigate();

  // Проверка авторизации (заглушка)
  const isAuthenticated = false;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

return (
    <div className="h-100 bg-light">
      <nav className="shadow-sm navbar navbar-expand-lg navbar-light bg-white">
        <div className="container">
          <a className="navbar-brand" href="/">Hexlet Chat</a>
        </div>
      </nav>

      <Container className="mt-4">
        <Card>
          <Card.Header as="h2">Hexlet Chat</Card.Header>
          <Card.Body>
            <Card.Text>
              Welcome to Hexlet Chat! This is a real-time messaging application.
            </Card.Text>
            <Button variant="primary">Start Chatting</Button>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default MainPage;