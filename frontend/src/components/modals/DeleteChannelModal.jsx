// components/modals/DeleteChannelModal.jsx
import { Modal, Button, Alert } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { deleteChannel, resetOperationStatus } from '../../store/channelsSlice';

const DeleteChannelModal = ({ show, onHide, channel }) => {
  const dispatch = useDispatch();
  const { operationStatus } = useSelector((state) => state.channels);
  const { currentChannelId } = useSelector((state) => state.channels);

  const handleDelete = async () => {
    if (!channel) return;

    try {
      await dispatch(deleteChannel(channel.id)).unwrap();
      onHide();
    } catch (error) {
      console.error('Error deleting channel:', error);
    }
  };

  const handleHide = () => {
    dispatch(resetOperationStatus());
    onHide();
  };

  if (!channel) return null;

  const isCurrentChannel = channel.id === currentChannelId;
  const isRemovable = channel.removable !== false; // Предполагаем, что сервер указывает, можно ли удалять канал

  return (
    <Modal show={show} onHide={handleHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Удалить канал</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {operationStatus.error && (
          <Alert variant="danger" className="mb-3">
            {operationStatus.error}
          </Alert>
        )}

        {!isRemovable ? (
          <Alert variant="warning">
            Этот канал нельзя удалить.
          </Alert>
        ) : (
          <>
            <p>Уверены, что хотите удалить канал <strong>#{channel.name}</strong>?</p>
            {isCurrentChannel && (
              <Alert variant="info" className="mb-0">
                Вы находитесь в этом канале. После удаления вы будете перемещены в общий канал.
              </Alert>
            )}
          </>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={handleHide}
          disabled={operationStatus.loading}
        >
          Отменить
        </Button>

        {isRemovable && (
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={operationStatus.loading}
          >
            {operationStatus.loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Удаляем...
              </>
            ) : (
              'Удалить'
            )}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteChannelModal;