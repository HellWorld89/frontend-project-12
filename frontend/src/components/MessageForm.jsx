import { useState } from 'react';
import { Form, Button, InputGroup } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { addMessage } from '../store/messagesSlice';
import axios from 'axios';

const MessageForm = () => {
  const [messageText, setMessageText] = useState('');
  const dispatch = useDispatch();
  const { currentChannelId } = useSelector((state) => state.channels);
  const username = useSelector((state) => state.auth.username);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!messageText.trim() || !currentChannelId) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/v1/messages', {
        body: messageText.trim(),
        channelId: currentChannelId,
        username: username,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      dispatch(addMessage(response.data));
      setMessageText('');
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
    }
  };

  if (!currentChannelId) {
    return null;
  }

  return (
    <div className="message-form border-top p-3">
      <Form onSubmit={handleSubmit}>
        <InputGroup>
          <Form.Control
            type="text"
            placeholder="Введите сообщение..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            disabled={!currentChannelId}
          />
          <Button
            type="submit"
            variant="primary"
            disabled={!messageText.trim() || !currentChannelId}
          >
            Отправить
          </Button>
        </InputGroup>
      </Form>
    </div>
  );
};

export default MessageForm;