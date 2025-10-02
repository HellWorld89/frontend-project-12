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
    console.log('Delete modal should open for channel:', channel.id, channel.name);
  };

  const canManageChannel = (channel) => {
    return !channel.creator || channel.creator === username || channel.username === username;
  };

  const CustomToggle = React.forwardRef(({ _children, onClick }, ref) => (
    <button
      ref={ref}
      type="button"
      className="channel-dropdown-toggle btn btn-sm btn-outline-secondary border-0"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick(e);
      }}
      style={{
        color: '#6c757d',
        cursor: 'pointer',
        padding: '0.25rem 0.5rem',
        borderRadius: '3px',
        display: 'inline-flex',
        alignItems: 'center',
        fontSize: '0.8rem',
        lineHeight: 1,
        minHeight: '24px'
      }}
      onMouseDown={(e) => e.stopPropagation()}
      aria-label={t('channels.manageChannel')}
    >
      <span
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0
        }}
      >
        {t('channels.manageChannel')}
      </span>
      <i className="bi bi-three-dots-vertical"></i>
    </button>
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
                <Dropdown.Toggle
                  as={CustomToggle}
                  aria-label="Управление каналом">
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
