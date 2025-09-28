// components/ConnectionStatus.jsx
import { Alert } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import socketService from '../services/socket';

const ConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Проверяем состояние WebSocket каждые 5 секунд
    const interval = setInterval(() => {
      const socket = socketService.getSocket();
      const connected = socket?.connected || false;
      setIsSocketConnected(connected);

      // Показываем предупреждение если проблемы с соединением
      setShowAlert(!isOnline || !connected);
    }, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [isOnline]);

  if (!showAlert) return null;

  return (
    <Alert
      variant={isOnline && isSocketConnected ? 'success' : 'warning'}
      className="m-0 py-2 text-center"
    >
      {!isOnline ? (
        '⚠️ Отсутствует интернет-соединение'
      ) : !isSocketConnected ? (
        '⚠️ Проблемы с подключением к чату'
      ) : (
        '✅ Подключение восстановлено'
      )}
    </Alert>
  );
};

export default ConnectionStatus;