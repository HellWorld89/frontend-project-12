import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { setCurrentChannel } from '../store/channelsSlice'
import AddChannelModal from './modals/AddChannelModal'
import RenameChannelModal from './modals/RenameChannelModal'
import DeleteChannelModal from './modals/DeleteChannelModal'
import { filterProfanity } from '../utils/profanityFilter'

const ChannelsList = () => {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const { items: channels, currentChannelId } = useSelector(
    state => state.channels,
  )
  const { username } = useSelector(state => state.auth)

  const [showAddModal, setShowAddModal] = useState(false)
  const [showRenameModal, setShowRenameModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedChannel, setSelectedChannel] = useState(null)
  const [showDropdown, setShowDropdown] = useState(null)

  const handleRenameClick = (channel, e) => {
    e.stopPropagation()
    setSelectedChannel(channel)
    setShowRenameModal(true)
    setShowDropdown(null)
  }

  const handleDeleteClick = (channel, e) => {
    e.stopPropagation()
    setSelectedChannel(channel)
    setShowDeleteModal(true)
    setShowDropdown(null)
  }

  const canManageChannel = (channel) => {
    return (
      !channel.creator
      || channel.creator === username
      || channel.username === username
    )
  }

  const toggleDropdown = (channelId, e) => {
    e.stopPropagation()
    setShowDropdown(showDropdown === channelId ? null : channelId)
  }

  React.useEffect(() => {
    const handleClickOutside = () => {
      setShowDropdown(null)
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  return (
    <div className="d-flex flex-column h-100 min-vw-25">
      {/* Заголовок с кнопкой добавления */}
      <div className="d-flex mt-1 justify-content-between mb-2 ps-4 pe-2 p-4">
        <b>{t('channels.channels')}</b>
        <button
          type="button"
          className="p-0 text-primary btn btn-group-vertical"
          onClick={() => setShowAddModal(true)}
          title={t('channels.addChannel')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="20" height="20" fill="currentColor">
            <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"></path>
            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"></path>
          </svg>
          <span className="visually-hidden">+</span>
        </button>
      </div>

      {/* Список каналов */}
      <ul className="nav flex-column nav-pills nav-fill px-2 mb-3 overflow-auto h-100 d-block flex-grow-1">
        {channels.map(channel => (
          <li key={channel.id} className="nav-item w-100">
            <div role="group" className="d-flex dropdown btn-group">
              {/* Кнопка канала */}
              <button
                type="button"
                className={`w-100 rounded-0 text-start text-truncate btn ${
                  channel.id === currentChannelId ? 'btn-secondary' : ''
                }`}
                onClick={() => dispatch(setCurrentChannel(channel.id))}
              >
                <span className="me-1">#</span>
                {filterProfanity(channel.name)}
              </button>

              {/* Кнопка управления каналом */}
              {canManageChannel(channel) && (
                <>
                  <button
                    type="button"
                    className={`flex-grow-0 dropdown-toggle dropdown-toggle-split btn ${
                      channel.id === currentChannelId ? 'btn-secondary' : ''
                    }`}
                    onClick={e => toggleDropdown(channel.id, e)}
                    aria-expanded={showDropdown === channel.id}
                  >
                    <span className="visually-hidden">{t('channels.manageChannel')}</span>
                  </button>

                  {/* Dropdown меню */}
                  {showDropdown === channel.id && (
                    <div className="dropdown-menu show">
                      <button
                        type="button"
                        className="dropdown-item"
                        onClick={e => handleRenameClick(channel, e)}
                      >
                        {t('channels.rename')}
                      </button>
                      <button
                        type="button"
                        className="dropdown-item text-danger"
                        onClick={e => handleDeleteClick(channel, e)}
                      >
                        {t('channels.delete')}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </li>
        ))}
      </ul>

      {/* Модальные окна */}
      <AddChannelModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
      />

      <RenameChannelModal
        show={showRenameModal}
        onHide={() => setShowRenameModal(false)}
        channel={selectedChannel}
      />

      <DeleteChannelModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        channel={selectedChannel}
      />
    </div>
  )
}

export default ChannelsList
