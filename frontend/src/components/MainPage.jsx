// components/MainPage.jsx
import { useEffect, useState } from 'react';
import { Container, Row, Col, Button, Alert, Spinner } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/authSlice';
import { fetchChannels, setCurrentChannel } from '../store/channelsSlice';
import { fetchMessages } from '../store/messagesSlice';
import { useWebSocket } from '../hooks/useWebSocket';
import { useMessageQueue } from '../hooks/useMessageQueue';
import TestMessageForm from './TestMessageForm';
import ChannelsList from './ChannelsList';
import MessagesList from './MessagesList';
import MessageForm from './MessageForm';
import ConnectionStatus from './ConnectionStatus';

const MainPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, username } = useSelector((state) => state.auth);
  const { items: channels, currentChannelId, loading: channelsLoading, error: channelsError } = useSelector((state) => state.channels);
  const { items: messages, loading: messagesLoading, error: messagesError } = useSelector((state) => state.messages);

  const [dataLoaded, setDataLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);

  useWebSocket();
  useMessageQueue();

 useEffect(() => {
  if (!isAuthenticated) {
    navigate('/login');
    return;
  }

  const loadData = async () => {
    try {
      console.log('🔄 MainPage: Loading channels and messages...');
      setLoadError(null);

      const [channelsResult, messagesResult] = await Promise.allSettled([
        dispatch(fetchChannels()).unwrap(),
        dispatch(fetchMessages()).unwrap()
      ]);

      console.log('📊 MainPage: Load results', {
        channels: channelsResult.status,
        messages: messagesResult.status
      });

      if (channelsResult.status === 'rejected') {
        throw new Error(channelsResult.reason || 'Ошибка загрузки каналов');
      }

      if (messagesResult.status === 'rejected') {
        console.warn('⚠️ MainPage: Messages load failed:', messagesResult.reason);
      } else {
        console.log('✅ MainPage: Messages loaded:', messagesResult.value.length, 'items');
      }

      setDataLoaded(true);
      console.log('🎉 MainPage: Data loading completed');

    } catch (error) {
      console.error('💥 MainPage: Error loading data:', error);
      setLoadError(error.message);
      setDataLoaded(true);
    }
  };

  const timer = setTimeout(() => {
    loadData();
  }, 500);

  return () => clearTimeout(timer);
}, [dispatch, isAuthenticated, navigate]);

  // Автоматически выбираем канал после загрузки
  useEffect(() => {
    if (dataLoaded && channels.length > 0 && !currentChannelId) {
      const generalChannel = channels.find(channel => channel.name === 'general') || channels[0];
      if (generalChannel) {
        dispatch(setCurrentChannel(generalChannel.id));
      }
    }
  }, [dataLoaded, channels, currentChannelId, dispatch]);

  const handleReload = () => {
    setDataLoaded(false);
    setLoadError(null);
    // Перезагружаем данные
    setTimeout(() => {
      dispatch(fetchChannels());
      dispatch(fetchMessages());
      setDataLoaded(true);
    }, 1000);
  };

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

  // Показываем ошибку загрузки
  if (loadError) {
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
          <Alert variant="danger" className="text-center">
            <h5>Ошибка загрузки данных</h5>
            <p>{loadError}</p>
            <div className="mt-3">
              <Button variant="outline-danger" onClick={handleReload} className="me-2">
                Попробовать снова
              </Button>
              <Button variant="outline-primary" onClick={handleLogout}>
                Выйти
              </Button>
            </div>
          </Alert>
        </div>
      </div>
    );
  }

  // Показываем индикатор загрузки только при первоначальной загрузке
  if (!dataLoaded) {
    return (
      <div className="h-100 bg-light">
        <nav className="shadow-sm navbar navbar-expand-lg navbar-light bg-white">
          <div className="container-fluid">
            <a className="navbar-brand" href="/">Hexlet Chat</a>
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
<TestMessageForm />
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