import { useEffect, useState } from 'react';
import { Container, Row, Col, Button, Alert, Spinner } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/authSlice';
import { fetchChannels, setCurrentChannel } from '../store/channelsSlice';
import { fetchMessages } from '../store/messagesSlice';
import { useWebSocket } from '../hooks/useWebSocket';
import { useMessageQueue } from '../hooks/useMessageQueue';
import ChannelsList from './ChannelsList';
import MessagesList from './MessagesList';
import MessageForm from './MessageForm';
import ConnectionStatus from './ConnectionStatus';

const MainPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, username } = useSelector((state) => state.auth);
  const { items: channels, currentChannelId, loading: channelsLoading, error: channelsError } = useSelector((state) => state.channels);
  const { loading: messagesLoading, error: messagesError } = useSelector((state) => state.messages);

  const [dataLoaded, setDataLoaded] = useState(false);

  // Используем WebSocket и очередь сообщений
  useWebSocket();
  useMessageQueue();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Загружаем данные при монтировании компонента
    const loadData = async () => {
      try {
        console.log('Loading channels and messages...');

        // Загружаем каналы
        await dispatch(fetchChannels()).unwrap();

        // Загружаем сообщения
        await dispatch(fetchMessages()).unwrap();

        setDataLoaded(true);
        console.log('Data loaded successfully');

      } catch (error) {
        console.error('Error loading data:', error);
        setDataLoaded(true); // Все равно помечаем как загруженное, чтобы показать интерфейс
      }
    };

    // Небольшая задержка для гарантии, что WebSocket успел подключиться
    setTimeout(() => {
      loadData();
    }, 100);

  }, [dispatch, isAuthenticated, navigate]);

  // Автоматически выбираем первый канал после загрузки данных
  useEffect(() => {
    if (dataLoaded && channels.length > 0 && !currentChannelId) {
      const generalChannel = channels.find(channel => channel.name === 'general') || channels[0];
      if (generalChannel) {
        dispatch(setCurrentChannel(generalChannel.id));
      }
    }
  }, [dataLoaded, channels, currentChannelId, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  if (!isAuthenticated) {
    return (
      <div className="h-100 bg-light d-flex justify-content-center align-items-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Перенаправление...</span>
        </Spinner>
      </div>
    );
  }

  // Показываем индикатор загрузки, пока данные не загружены
  if (!dataLoaded || channelsLoading || messagesLoading) {
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
        <div className="d-flex justify-content-center align-items-center h-100">
          <div className="text-center">
            <Spinner animation="border" role="status" className="mb-3">
              <span className="visually-hidden">Загрузка чата...</span>
            </Spinner>
            <p>Загрузка чата...</p>
          </div>
        </div>
      </div>
    );
  }

  if (channelsError || messagesError) {
    return (
      <div className="h-100 bg-light d-flex justify-content-center align-items-center">
        <Alert variant="danger" className="text-center">
          <h5>Ошибка загрузки данных</h5>
          <p>{channelsError || messagesError}</p>
          <Button variant="outline-danger" onClick={() => window.location.reload()}>
            Перезагрузить
          </Button>
        </Alert>
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

      <ConnectionStatus />

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