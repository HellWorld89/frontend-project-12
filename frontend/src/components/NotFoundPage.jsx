import { Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Header from './Header';

const NotFoundPage = () => {
  return (
    <div className="h-100 bg-light">
      <Header />
      <Container className="h-100 d-flex justify-content-center align-items-center">
        <div className="text-center">
          <h1 className="display-1 text-muted">404</h1>
          <h2 className="mb-4">Страница не найдена</h2>
          <p className="text-muted mb-4">
            Извините, запрашиваемая страница не существует.
          </p>
          <Button as={Link} to="/" variant="primary">
            Вернуться на главную
          </Button>
        </div>
      </Container>
    </div>
  );
};

export default NotFoundPage;