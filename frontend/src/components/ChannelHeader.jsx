import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { filterProfanity } from '../utils/profanityFilter'

const ChannelHeader = () => {
  const { t } = useTranslation()
  const { currentChannelId, items: channels } = useSelector(state => state.channels)
  const { items: messages } = useSelector(state => state.messages)

  const currentChannel = channels.find(ch => ch.id === currentChannelId)

  const filteredMessages = messages.filter(
    message => message.channelId === currentChannelId,
  )

  if (!currentChannelId) {
    return null
  }

  return (
    <div className="bg-light mb-4 p-3 shadow-sm small">
      <p className="m-0">
        <b>
          #
          {filterProfanity(currentChannel?.name || '')}
        </b>
      </p>
      <span className="text-muted">
        {t('messages.messageCount', { count: filteredMessages.length })}
      </span>
    </div>
  )
}

export default ChannelHeader
