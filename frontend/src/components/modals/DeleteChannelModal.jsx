import { Modal, Button, Alert } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { deleteChannel, resetOperationStatus } from '../../store/channelsSlice'
import Portal from '../Portal'

const DeleteChannelModal = ({ show, onHide, channel }) => {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const { operationStatus } = useSelector(state => state.channels)
  const { currentChannelId } = useSelector(state => state.channels)

  const handleDelete = async () => {
    if (!channel) return

    try {
      console.log(
        '🗑️ Starting channel deletion for:',
        channel.id,
        channel.name,
      )
      await dispatch(deleteChannel(channel.id)).unwrap()
      console.log('✅ Channel deleted successfully, showing toast...')
      // Показываем toast-уведомление об успешном удалении
      toast.success(t('toast.channelDeleted'), {
        autoClose: 3000, // Увеличиваем время показа
      })

      onHide()
    }
    catch (error) {
      console.error('Error deleting channel:', error)
      // Показываем toast-уведомление об ошибке
      toast.error(t('toast.error'))
    }
  }

  const handleHide = () => {
    dispatch(resetOperationStatus())
    onHide()
  }

  if (!channel) return null

  const isCurrentChannel = channel.id === currentChannelId
  const isRemovable = true
  console.log('Channel removable status:', isRemovable, channel)

  return (
    <Portal>
      <Modal show={show} onHide={handleHide} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t('channels.deleteChannel')}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {operationStatus.error && (
            <Alert variant="danger" className="mb-3">
              {operationStatus.error}
            </Alert>
          )}

          {!isRemovable
            ? (
                <Alert variant="warning">{t('channels.cannotDelete')}</Alert>
              )
            : (
                <>
                  <p>{t('channels.confirmDelete', { channelName: channel.name })}</p>
                  {isCurrentChannel && (
                    <Alert variant="info" className="mb-0">
                      {t('channels.currentChannelWarning')}
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
            {t('common.cancel')}
          </Button>

          {isRemovable && (
            <Button
              variant="danger"
              className="btn btn-danger"
              onClick={handleDelete}
              disabled={operationStatus.loading}
            >
              {operationStatus.loading
                ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      {t('channels.deleting')}
                    </>
                  )
                : (
                    t('channels.delete')
                  )}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Portal>

  )
}

export default DeleteChannelModal
