import { useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/authSlice';
import { fetchChannels } from '../store/channelsSlice';
import { fetchMessages } from '../store/messagesSlice';
import ChannelsList from './ChannelsList';
import MessagesList from './MessagesList';
import MessageForm from './MessageForm';

const MainPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, username } = useSelector((state) => state.auth);
  const { loading: channelsLoading, error: channelsError } = useSelector((state) => state.channels);
  const { loading: messagesLoading, error: messagesError } = useSelector((state) => state.messages);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Загружаем данные при монтировании компонента
    dispatch(fetchChannels());
    dispatch(fetchMessages());
  }, [dispatch, isAuthenticated, navigate]);

  const handleLogout = () => {
    dispatch(logout());
  };

  if (!isAuthenticated) {
    return null;
  }

  if (channelsLoading || messagesLoading) {
    return (
      <div className="h-100 bg-light d-flex justify-content-center align-items-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </div>
      </div>
    );
  }

  if (channelsError || messagesError) {
    return (
      <div className="h-100 bg-light d-flex justify-content-center align-items-center">
        <div className="alert alert-danger">
          Ошибка загрузки данных: {channelsError || messagesError}
        </div>
      </div>
    );
  }

  return (
    <div className="h-100 bg-light">
      <nav className="shadow-sm navbar navbar-expand-lg navbar-light bg-white">
        <div className="container-fluid">
          <a className="navbar-brand" href="/">Hexlet Chat</a>
          <div className="navbar-nav ms-auto">
            <span className="navbar-text me-3">Привет, {username}!</span>
            <Button variant="outline-primary" onClick={handleLogout}>
              Выйти
            </Button>
          </div>
        </div>
      </nav>

      <Container fluid className="h-100">
        <Row className="h-100">
          <Col md={3} className="border-end bg-white">
            <ChannelsList />
          </Col>
          <Col md={9} className="d-flex flex-column">
            <MessagesList />
            <MessageForm />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default MainPage;