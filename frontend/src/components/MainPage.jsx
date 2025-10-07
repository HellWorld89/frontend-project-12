import { useEffect, useState } from 'react'
import { Button, Alert, Spinner } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { logout } from '../store/authSlice'
import { fetchChannels, setCurrentChannel } from '../store/channelsSlice'
import { fetchMessages } from '../store/messagesSlice'
import { useWebSocket } from '../hooks/useWebSocket'
import { useMessageQueue } from '../hooks/useMessageQueue'
import ChannelsList from './ChannelsList'
import MessagesList from './MessagesList'
import MessageForm from './MessageForm'
import ConnectionStatus from './ConnectionStatus'
import Header from './Header'
import ChannelHeader from './ChannelHeader'

const MainPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { isAuthenticated } = useSelector(state => state.auth)
  const { items: channels, currentChannelId } = useSelector(
    state => state.channels,
  )

  const [dataLoaded, setDataLoaded] = useState(false)
  const [loadError, setLoadError] = useState(null)
  const [errorShown, setErrorShown] = useState(false)

  useWebSocket()
  useMessageQueue()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    const loadData = async () => {
      try {
        console.log('🔄 MainPage: Loading channels and messages...')
        setLoadError(null)
        setErrorShown(false)

        const [channelsResult, messagesResult] = await Promise.allSettled([
          dispatch(fetchChannels()).unwrap(),
          dispatch(fetchMessages()).unwrap(),
        ])

        console.log('📊 MainPage: Load results', {
          channels: channelsResult.status,
          messages: messagesResult.status,
        })

        if (channelsResult.status === 'rejected') {
          throw new Error(channelsResult.reason || t('errors.loadError'))
        }

        if (messagesResult.status === 'rejected') {
          console.warn(
            '⚠️ MainPage: Messages load failed:',
            messagesResult.reason,
          )
          toast.warn(t('toast.dataLoadError'))
        }
        else {
          console.log(
            '✅ MainPage: Messages loaded:',
            messagesResult.value.length,
            'items',
          )
        }

        setDataLoaded(true)
        console.log('🎉 MainPage: Data loading completed')
      }
      catch (error) {
        console.error('💥 MainPage: Error loading data:', error)
        setLoadError(error.message)
        setDataLoaded(true)

        if (!errorShown) {
          toast.error(t('toast.dataLoadError'))
          setErrorShown(true)
        }
      }
    }

    const timer = setTimeout(() => {
      loadData()
    }, 500)

    return () => clearTimeout(timer)
  }, [dispatch, isAuthenticated, navigate, t, errorShown])

  // Автоматически выбираем канал после загрузки
  useEffect(() => {
    if (dataLoaded && channels.length > 0 && !currentChannelId) {
      const generalChannel
        = channels.find(channel => channel.name === 'general') || channels[0]
      if (generalChannel) {
        dispatch(setCurrentChannel(generalChannel.id))
      }
    }
  }, [dataLoaded, channels, currentChannelId, dispatch])

  const handleReload = () => {
    setDataLoaded(false)
    setLoadError(null)
    setErrorShown(false)
    setTimeout(() => {
      dispatch(fetchChannels())
      dispatch(fetchMessages())
      setDataLoaded(true)
    }, 1000)
  }

  if (!isAuthenticated) {
    return (
      <div className="h-100 bg-light d-flex justify-content-center align-items-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">{t('common.loading')}</span>
        </Spinner>
      </div>
    )
  }

  // Показываем ошибку загрузки
  if (loadError) {
    return (
      <div className="h-100 bg-light">
        <Header />
        <div className="d-flex justify-content-center align-items-center h-100">
          <Alert variant="danger" className="text-center">
            <h5>{t('errors.loadError')}</h5>
            <p>{loadError}</p>
            <div className="mt-3">
              <Button
                variant="outline-danger"
                onClick={handleReload}
                className="me-2"
              >
                {t('errors.tryAgain')}
              </Button>
              <Button
                variant="outline-primary"
                onClick={() => dispatch(logout())}
              >
                {t('auth.logout')}
              </Button>
            </div>
          </Alert>
        </div>
      </div>
    )
  }

  // Показываем индикатор загрузки только при первоначальной загрузке
  if (!dataLoaded) {
    return (
      <div className="h-100 bg-light">
        <Header />
        <div className="d-flex justify-content-center align-items-center h-100">
          <div className="text-center">
            <Spinner animation="border" role="status" className="mb-3">
              <span className="visually-hidden">{t('common.loading')}</span>
            </Spinner>
            <p>{t('common.loading')}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="d-flex flex-column h-100">
      <Header />
      <ConnectionStatus />
      <div className="container-fluid h-100 my-0 overflow-hidden">
        <div className="row h-100 bg-white flex-nowrap">
          {' '}
          {/* Добавлен flex-nowrap */}
          {/* Боковая панель каналов - фиксированная минимальная ширина */}
          <div className="col-4 col-md-3 col-lg-2 border-end px-0 bg-light d-flex flex-column flex-shrink-0 min-vw-25">
            {' '}
            {/* Ключевые изменения здесь */}
            <ChannelsList />
          </div>

          {/* Основная область сообщений */}
          <div className="col p-0 h-100 d-flex flex-column flex-grow-1">
            {' '}
            {/* Добавлен flex-grow-1 */}
            <div className="d-flex flex-column h-100">
              <ChannelHeader />
              <div id="messages-box" className="chat-messages overflow-auto px-5 flex-grow-1">
                <MessagesList />
              </div>
              <div className="mt-auto px-5 py-3">
                <MessageForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MainPage
