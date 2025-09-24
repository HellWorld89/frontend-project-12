import { ListGroup } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentChannel } from '../store/channelsSlice';

const ChannelsList = () => {
  const dispatch = useDispatch();
  const { items, currentChannelId } = useSelector((state) => state.channels);

  return (
    <div className="channels-list">
      <div className="d-flex justify-content-between align-items-center mb-2 ps-3 pe-2">
        <span className="fw-bold">Каналы</span>
        <button type="button" className="btn btn-sm btn-outline-primary">
          +
        </button>
      </div>
      <ListGroup variant="flush">
        {items.map((channel) => (
          <ListGroup.Item
            key={channel.id}
            action
            active={channel.id === currentChannelId}
            onClick={() => dispatch(setCurrentChannel(channel.id))}
            className="border-0 rounded-0"
          >
            <span className="me-1">#</span>
            {channel.name}
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
};

export default ChannelsList;