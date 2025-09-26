import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { addMessage } from '../store/messagesSlice';
import { addChannel, removeChannel, updateChannel } from '../store/channelsSlice';
import socketService from '../services/socket';

export const useWebSocket = () => {
  const dispatch = useDispatch();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    let mounted = true;

    const initializeSocket = async () => {
      try {
        const socketInstance = await socketService.waitForConnection();

        if (!mounted) return;

        setSocket(socketInstance);

        // Подписываемся на новые сообщения
        socketInstance.on('newMessage', (message) => {
          console.log('New message received:', message);
          dispatch(addMessage(message));
        });

        // Подписываемся на новые каналы
        socketInstance.on('newChannel', (channel) => {
          console.log('New channel created:', channel);
          dispatch(addChannel(channel));
        });

        // Подписываемся на удаление каналов
        socketInstance.on('removeChannel', ({ id }) => {
          console.log('Channel removed:', id);
          dispatch(removeChannel({ id }));
        });

        // Подписываемся на переименование каналов
        socketInstance.on('renameChannel', (channel) => {
          console.log('Channel renamed:', channel);
          dispatch(updateChannel(channel));
        });

      } catch (error) {
        console.error('Failed to initialize WebSocket:', error);
      }
    };

    initializeSocket();

    return () => {
      mounted = false;
      if (socket) {
        socket.off('newMessage');
        socket.off('newChannel');
        socket.off('removeChannel');
        socket.off('renameChannel');
      }
    };
  }, [dispatch]);
};