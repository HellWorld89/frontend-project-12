import { useState, useEffect } from 'react';
import { Form, Button, InputGroup, Alert, Badge } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import {
  sendMessage,
  addPendingMessage,
  removePendingMessage,
  updatePendingMessage
} from '../store/messagesSlice';
import socketService from '../services/socket';

const MessageForm = () => {
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const [infoMessage, setInfoMessage] = useState(null);

  const dispatch = useDispatch();
  const { currentChannelId } = useSelector((state) => state.channels);
  const { pendingMessages } = useSelector((state) => state.messages);
  const username = useSelector((state) => state.auth.username);

  // Автоматически скрываем сообщения
  useEffect(() => {
    if (infoMessage || error) {
      const timer = setTimeout(() => {
        setInfoMessage(null);
        setError(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [infoMessage, error]);

  const generateTempId = () => {
    return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const canSendMessage = () => {
    return messageText.trim() && currentChannelId && !isSending;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!canSendMessage()) return;

  setIsSending(true);
  setError(null);
  setInfoMessage(null);

  try {
    // ✅ Отправляем через Redux action (HTTP)
    await dispatch(sendMessage({
      body: messageText.trim(),
      channelId: currentChannelId,
    })).unwrap();

    setMessageText('');
    console.log('✅ MessageForm: Message sent via HTTP');

  } catch (error) {
    console.error('Send message error:', error);

    // Если ошибка при отправке, добавляем в очередь
    const tempId = generateTempId();
    dispatch(addPendingMessage({
      body: messageText.trim(),
      channelId: currentChannelId,
      username,
      tempId: tempId,
      timestamp: Date.now(),
      attempts: 0,
      lastAttempt: 0,
      isSending: false,
    }));

    setMessageText('');
    setInfoMessage('⚠️ Сообщение добавлено в очередь из-за ошибки отправки');
  } finally {
    setIsSending(false);
  }
};

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleRemovePendingMessage = (tempId) => {
    dispatch(removePendingMessage({ tempId }));
  };

  const handleRetryMessage = async (message) => {
    if (message.isSending) return;

    try {
      dispatch(updatePendingMessage({
        tempId: message.tempId,
        isSending: true
      }));

      // ✅ ПРАВИЛЬНЫЙ ПОДХОД: используем Redux action
      await dispatch(sendMessage({
        body: message.body,
        channelId: message.channelId || currentChannelId,
      })).unwrap();

      dispatch(removePendingMessage({ tempId: message.tempId }));
    } catch (error) {
      console.error('Retry failed:', error);
      dispatch(updatePendingMessage({
        tempId: message.tempId,
        isSending: false,
        attempts: message.attempts + 1,
        lastAttempt: Date.now()
      }));
    }
  };

  if (!currentChannelId) {
    return null;
  }

  return (
    <div className="message-form border-top p-3">
      {/* Сообщения об ошибках */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Информационные сообщения */}
      {infoMessage && (
        <Alert variant="info" dismissible onClose={() => setInfoMessage(null)}>
          {infoMessage}
        </Alert>
      )}

      {/* Статус очереди сообщений */}
      {pendingMessages.length > 0 && (
        <div className="mb-2">
          <Badge bg="warning" text="dark" className="mb-2">
            📋 В очереди: {pendingMessages.length} сообщений
          </Badge>

          {/* Детализация сообщений в очереди */}
          {pendingMessages.slice(0, 3).map((message) => (
            <div key={message.tempId} className="pending-message-item small text-muted mb-1">
              <div className="d-flex justify-content-between align-items-center">
                <span>
                  {message.isSending ? '🔄' : '⏳'}
                  {message.body.length > 30 ? message.body.substring(0, 30) + '...' : message.body}
                  {message.attempts > 0 && ` (попытка ${message.attempts}/3)`}
                </span>
                <div>
                  <Button
                    variant="outline-success"
                    size="sm"
                    className="me-1"
                    onClick={() => handleRetryMessage(message)}
                    disabled={message.isSending}
                    title="Повторить попытку"
                  >
                    🔄
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleRemovePendingMessage(message.tempId)}
                    title="Удалить из очереди"
                  >
                    ❌
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {pendingMessages.length > 3 && (
            <div className="small text-muted">
              ... и еще {pendingMessages.length - 3} сообщений
            </div>
          )}
        </div>
      )}

      {/* Форма отправки сообщения */}
      <Form onSubmit={handleSubmit}>
        <InputGroup>
          <Form.Control
            type="text"
            placeholder="Введите сообщение..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isSending}
          />
          <Button
            type="submit"
            variant="primary"
            disabled={!canSendMessage()}
          >
            {isSending ? '📤 Отправка...' : '📤 Отправить'}
          </Button>
        </InputGroup>
      </Form>
    </div>
  );
};

export default MessageForm;