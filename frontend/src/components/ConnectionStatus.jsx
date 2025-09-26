import { useEffect, useState } from 'react';
import { Alert } from 'react-bootstrap';
import socketService from '../services/socket';

const ConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertVariant, setAlertVariant] = useState('warning');

  useEffect(() => {
    let socket;
    let reconnectTimer;

    const updateAlert = (message, variant, show = true) => {
      setAlertMessage(message);
      setAlertVariant(variant);
      setShowAlert(show);
    };

    const handleOnline = () => {
      console.log('Browser is online');
      setIsOnline(true);
      updateAlert('✅ Соединение восстановлено', 'success', true);

      // Автоматически скрываем через 3 секунды
      setTimeout(() => {
        setShowAlert(false);
      }, 3000);
    };

    const handleOffline = () => {
      console.log('Browser is offline');
      setIsOnline(false);
      updateAlert('❌ Отсутствует интернет-соединение', 'danger', true);
    };

    const initializeSocket = () => {
      try {
        socket = socketService.getSocket();

        if (!socket) {
          socket = socketService.connect();
        }

        const handleConnect = () => {
          console.log('Socket connected');
          setIsSocketConnected(true);
          updateAlert('✅ Соединение с сервером установлено', 'success', true);

          setTimeout(() => {
            setShowAlert(false);
          }, 3000);
        };

        const handleDisconnect = (reason) => {
          console.log('Socket disconnected:', reason);
          setIsSocketConnected(false);

          if (reason === 'io server disconnect') {
            // Сервер принудительно отключил, нужно переподключиться
            reconnectTimer = setTimeout(() => {
              socketService.connect();
            }, 2000);
          }

          updateAlert('⚠️ Соединение с сервером нарушено', 'warning', true);
        };

        const handleConnectError = (error) => {
          console.error('Socket connection error:', error);
          setIsSocketConnected(false);
          updateAlert('❌ Ошибка подключения к серверу', 'danger', true);
        };

        // Устанавливаем начальное состояние
        setIsSocketConnected(socket.connected);

        if (socket.connected) {
          updateAlert('', 'success', false);
        } else {
          updateAlert('🔌 Подключаемся к серверу...', 'info', true);
        }

        // Слушаем события WebSocket
        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);
        socket.on('connect_error', handleConnectError);

        return () => {
          if (socket) {
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);
            socket.off('connect_error', handleConnectError);
          }
          if (reconnectTimer) {
            clearTimeout(reconnectTimer);
          }
        };
      } catch (error) {
        console.error('Error initializing socket:', error);
      }
    };

    // Инициализируем сокет
    const cleanupSocket = initializeSocket();

    // Слушаем события браузера
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      if (cleanupSocket) cleanupSocket();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
    };
  }, []);

  // Не показывать уведомление, если все в порядке
  if (!showAlert || (isOnline && isSocketConnected && !alertMessage.includes('восстановлено'))) {
    return null;
  }

  return (
    <Alert
      variant={alertVariant}
      className="m-0 rounded-0 text-center py-2"
    >
      {alertMessage}
    </Alert>
  );
};

export default ConnectionStatus;