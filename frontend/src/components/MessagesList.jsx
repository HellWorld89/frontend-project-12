import { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { filterProfanity } from '../utils/profanityFilter'

const MessagesList = () => {
  const { t } = useTranslation()
  const { items: messages } = useSelector(state => state.messages)
  const { currentChannelId } = useSelector(state => state.channels)
  const messagesEndRef = useRef(null)

  const filteredMessages = messages.filter(
    message => message.channelId === currentChannelId,
  )

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [filteredMessages])

  if (!currentChannelId) {
    return <div className="p-3">{t('messages.selectChannel')}</div>
  }

  return (
    <>
      {filteredMessages.map(message => (
        <div
          key={message.id || message.tempId}
          className="py-2"
        >
          <div className="message">
            <strong>
              {message.username}
              :
            </strong>
            <span className="ms-2 text-break">
              {filterProfanity(message.body)}
            </span>
            {message.tempId && (
              <small className="text-muted ms-2">
                (
                {t('messages.sending')}
                )
              </small>
            )}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </>
  )
}

export default MessagesList
