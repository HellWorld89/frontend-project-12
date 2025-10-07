import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import socketService from '../services/socket'

const ConnectionStatus = () => {
  const { t } = useTranslation()
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isSocketConnected, setIsSocketConnected] = useState(false)

  const prevOnlineStatus = useRef(isOnline)
  const prevSocketStatus = useRef(isSocketConnected)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      toast.success(t('toast.connected'), {
        toastId: 'connection-restored',
      })
    }

    const handleOffline = () => {
      setIsOnline(false)
      toast.warn(t('toast.connectionLost'), {
        toastId: 'connection-lost',
        autoClose: false,
      })
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    const interval = setInterval(() => {
      const socket = socketService.getSocket()
      const connected = socket?.connected || false

      if (connected !== prevSocketStatus.current) {
        if (connected) {
          toast.success(t('toast.connected'), {
            toastId: 'socket-connected',
          })
        }
        else {
          toast.warn(t('toast.reconnecting'), {
            toastId: 'socket-reconnecting',
          })
        }
        prevSocketStatus.current = connected
      }

      setIsSocketConnected(connected)
    }, 5000)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(interval)
    }
  }, [t])

  useEffect(() => {
    if (isOnline !== prevOnlineStatus.current) {
      prevOnlineStatus.current = isOnline
    }
  }, [isOnline])

  return null
}

export default ConnectionStatus
