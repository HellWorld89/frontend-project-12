import React, { useState } from 'react';
import { ListGroup, Dropdown } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { setCurrentChannel } from '../store/channelsSlice';
import AddChannelModal from './modals/AddChannelModal';
import RenameChannelModal from './modals/RenameChannelModal';
import DeleteChannelModal from './modals/DeleteChannelModal';
import { filterProfanity } from '../utils/profanityFilter';

const ChannelsList = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { items: channels, currentChannelId } = useSelector((state) => state.channels);
  const { username } = useSelector((state) => state.auth);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState(null);

  const handleRenameClick = (channel, e) => {
    e.stopPropagation();
    setSelectedChannel(channel);
    setShowRenameModal(true);
  };

  const handleDeleteClick = (channel, e) => {
    e.stopPropagation();
    setSelectedChannel(channel);
    setShowDeleteModal(true);
  };

  const canManageChannel = (channel) => {
    return !channel.creator || channel.creator === username || channel.username === username;
  };

  // Кастомный Toggle для Dropdown - используем span вместо Button
  const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
    <span
      ref={ref}
      className="channel-dropdown-toggle"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick(e);
      }}
      style={{
        color: '#6c757d',
        fontSize: '0.8rem',
        cursor: 'pointer',
        padding: '0.25rem',
        borderRadius: '3px',
        display: 'inline-flex',
        alignItems: 'center'
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {children}
    </span>
  ));

  return (
    <div className="channels-list">
      <div className="d-flex justify-content-between align-items-center mb-2 ps-3 pe-2">
        <span className="fw-bold">{t('channels.channels')}</span>
        <button
          type="button"
          className="btn btn-sm btn-outline-primary"
          onClick={() => setShowAddModal(true)}
          title={t('channels.addChannel')}
        >
          +
        </button>
      </div>

      <ListGroup variant="flush" className="channels-container">
        {channels.map((channel) => (
          <ListGroup.Item
            key={channel.id}
            as="button" 
            type="button"
            tabIndex={0}
            aria-label={`Канал ${filterProfanity(channel.name)}`}
            active={channel.id === currentChannelId}
            onClick={() => dispatch(setCurrentChannel(channel.id))}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                dispatch(setCurrentChannel(channel.id));
              }
            }}
            className="border-0 rounded-0 channel-item d-flex justify-content-between align-items-center"
            style={{
              cursor: 'pointer',
              padding: '0.5rem 1rem'
            }}
          >
            <div className="channel-name flex-grow-1 text-truncate">
              <span className="me-1">#</span>
               <span>{filterProfanity(channel.name)}</span>
            </div>

            {canManageChannel(channel) && (
              <Dropdown onClick={(e) => e.stopPropagation()}>
                <Dropdown.Toggle as={CustomToggle}>
                  <i className="bi bi-three-dots-vertical"></i>
                </Dropdown.Toggle>

                <Dropdown.Menu align="end">
                  <Dropdown.Item
                    as="button"
                    onClick={(e) => handleRenameClick(channel, e)}
                    className="d-flex align-items-center border-0 bg-transparent"
                  >
                    <i className="bi bi-pencil me-2"></i>
                    {t('channels.rename')}
                  </Dropdown.Item>
                  <Dropdown.Item
                    as="button"
                    onClick={(e) => handleDeleteClick(channel, e)}
                    className="d-flex align-items-center text-danger border-0 bg-transparent"
                  >
                    <i className="bi bi-trash me-2"></i>
                    {t('channels.delete')}
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}
          </ListGroup.Item>
        ))}
      </ListGroup>

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
  );
};

export default ChannelsList;