import { useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import {
  sendMessage,
  addPendingMessage,
  removePendingMessage,
  updatePendingMessage,
} from '../store/messagesSlice'
import { filterProfanity, hasProfanity } from '../utils/profanityFilter'
import { trackError, trackUserAction } from '../utils/rollbar'

const MessageForm = () => {
  const [messageText, setMessageText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const inputRef = useRef(null)

  const dispatch = useDispatch()
  const { t } = useTranslation()
  const { currentChannelId } = useSelector(state => state.channels)
  const { pendingMessages } = useSelector(state => state.messages)
  const username = useSelector(state => state.auth.username)

  useEffect(() => {
    inputRef.current?.focus()
  }, [currentChannelId])

  const generateTempId = () => {
    return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  const canSendMessage = () => {
    return messageText.trim() && currentChannelId && !isSending
  }

  const focusInput = () => {
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
        console.log('✅ MessageForm: Focus returned to input')
      }
    }, 100)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    trackUserAction('send_message', {
      channelId: currentChannelId,
      messageLength: messageText.length,
    })

    if (!canSendMessage()) return

    setIsSending(true)

    try {
      const filteredMessage = filterProfanity(messageText.trim())

      if (
        hasProfanity(messageText.trim())
        && filteredMessage !== messageText.trim()
      ) {
        toast.warn(t('profanity.filtered'))
      }

      await dispatch(
        sendMessage({
          body: filteredMessage,
          channelId: currentChannelId,
        }),
      ).unwrap()

      setMessageText('')
      console.log('✅ MessageForm: Message sent via HTTP')

      focusInput()
    }
    catch (error) {
      console.error('Send message error:', error)

      trackError(error, {
        context: 'MessageForm.handleSubmit',
        channelId: currentChannelId,
        messageLength: messageText.length,
      })

      const tempId = generateTempId()
      dispatch(
        addPendingMessage({
          body: messageText.trim(),
          channelId: currentChannelId,
          username,
          tempId: tempId,
          timestamp: Date.now(),
          attempts: 0,
          lastAttempt: 0,
          isSending: false,
        }),
      )

      setMessageText('')
      toast.warn(t('messages.errorSending'))
      focusInput()
    }
    finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleRemovePendingMessage = (tempId) => {
    dispatch(removePendingMessage({ tempId }))
    toast.info(t('messages.removeFromQueue'))
    focusInput()
  }

  const handleRetryMessage = async (message) => {
    if (message.isSending) return

    try {
      dispatch(
        updatePendingMessage({
          tempId: message.tempId,
          isSending: true,
        }),
      )

      await dispatch(
        sendMessage({
          body: message.body,
          channelId: message.channelId || currentChannelId,
        }),
      ).unwrap()

      dispatch(removePendingMessage({ tempId: message.tempId }))
      toast.success(t('messages.sent'))
      focusInput()
    }
    catch (error) {
      console.error('Retry failed:', error)
      dispatch(
        updatePendingMessage({
          tempId: message.tempId,
          isSending: false,
          attempts: message.attempts + 1,
          lastAttempt: Date.now(),
        }),
      )
      toast.error(t('messages.errorSending'))
      focusInput()
    }
  }

  if (!currentChannelId) {
    return null
  }

  return (
    <>
      {pendingMessages.length > 0 && (
        <div className="mb-2">
          <div className="badge bg-warning text-dark mb-2">
            📋
            {t('messages.pending', { count: pendingMessages.length })}
          </div>
          {pendingMessages.slice(0, 3).map(message => (
            <div
              key={message.tempId}
              className="pending-message-item small text-muted mb-1"
            >
              <div className="d-flex justify-content-between align-items-center">
                <span>
                  {message.isSending ? '🔄' : '⏳'}
                  {message.body.length > 30
                    ? message.body.substring(0, 30) + '...'
                    : message.body}
                  {message.attempts > 0
                    && ` (${t('messages.attempt', { attempt: message.attempts })})`}
                </span>
                <div>
                  <button
                    type="button"
                    className="btn btn-outline-success btn-sm me-1"
                    onClick={() => handleRetryMessage(message)}
                    disabled={message.isSending}
                    title={t('messages.retry')}
                  >
                    🔄
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleRemovePendingMessage(message.tempId)}
                    title={t('messages.removeFromQueue')}
                  >
                    ❌
                  </button>
                </div>
              </div>
            </div>
          ))}
          {pendingMessages.length > 3 && (
            <div className="small text-muted">
              {t('messages.moreMessages', {
                count: pendingMessages.length - 3,
              })}
            </div>
          )}
        </div>
      )}
      <form onSubmit={handleSubmit} className="py-1 border rounded-2" noValidate>
        <div className="input-group has-validation">
          <input
            ref={inputRef}
            type="text"
            autoComplete="off"
            name="body"
            placeholder={t('messages.enterMessage')}
            aria-label={t('messages.enterMessage')}
            value={messageText}
            onChange={e => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isSending}
            className="border-0 p-0 ps-2 form-control"
          />
          <button
            type="submit"
            disabled={!canSendMessage()}
            className="btn btn-group-vertical"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="20" height="20" fill="currentColor" className="bi bi-arrow-right-square">
              <path fillRule="evenodd" d="M15 2a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1zM0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm4.5 5.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5z"></path>
            </svg>
            <span className="visually-hidden">{t('common.send')}</span>
          </button>
        </div>
      </form>
    </>
  )
}

export default MessageForm
