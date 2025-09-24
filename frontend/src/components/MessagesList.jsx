import { useEffect, useRef } from 'react';
import { ListGroup } from 'react-bootstrap';
import { useSelector } from 'react-redux';

const MessagesList = () => {
  const { items: messages } = useSelector((state) => state.messages);
  const { currentChannelId } = useSelector((state) => state.channels);
  const messagesEndRef = useRef(null);

  const filteredMessages = messages.filter(
    (message) => message.channelId === currentChannelId
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [filteredMessages]);

  if (!currentChannelId) {
    return <div className="p-3">Выберите канал для просмотра сообщений</div>;
  }

  return (
    <div className="messages-list d-flex flex-column h-100">
      <div className="messages-header border-bottom p-3">
        <h5 className="mb-0">
          # {useSelector((state) =>
            state.channels.items.find(ch => ch.id === currentChannelId)?.name || ''
          )}
        </h5>
        <small className="text-muted">{filteredMessages.length} сообщений</small>
      </div>

      <div className="messages-content flex-grow-1 p-3" style={{ overflowY: 'auto' }}>
        <ListGroup variant="flush">
          {filteredMessages.map((message) => (
            <ListGroup.Item key={message.id} className="border-0 px-0 py-2">
              <div className="message">
                <strong>{message.username}:</strong>
                <span className="ms-2">{message.body}</span>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessagesList;