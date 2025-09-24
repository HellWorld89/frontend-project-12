import { Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="h-100 bg-light">
      <nav className="shadow-sm navbar navbar-expand-lg navbar-light bg-white">
        <div className="container">
          <a className="navbar-brand" href="/">Hexlet Chat</a>
        </div>
      </nav>

      <div className="h-100">
        <Container fluid className="h-100">
          <div className="d-flex flex-column h-100 justify-content-center">
            <div className="text-center">
              <div className="mb-4">
                <img
                  alt="Страница не найдена"
                  className="img-fluid"
                  style={{
                    maxWidth: 'min(300px, 70vw)',
                    height: 'auto',
                    maxHeight: '200px'
                  }}
                  src="/assets/404-D_FLHmTM.svg"
                />
              </div>
              <h1 className="h4 text-muted">Страница не найдена</h1>
              <p className="text-muted">
                Но вы можете перейти <a href="/" onClick={(e) => {
                  e.preventDefault();
                  navigate('/');
                }}>на главную страницу</a>
              </p>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default NotFoundPage;