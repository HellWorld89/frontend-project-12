import { useEffect, useCallback, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { sendMessage, removePendingMessage, updatePendingMessage } from '../store/messagesSlice'
import socketService from '../services/socket'

export const useMessageQueue = () => {
  const dispatch = useDispatch()
  const { pendingMessages } = useSelector((state) => state.messages)
  const { currentChannelId } = useSelector((state) => state.channels)
  const isProcessingRef = useRef(false)

  const retryPendingMessages = useCallback(async () => {
    // Защита от параллельного выполнения
    if (isProcessingRef.current) {
      console.log('Already processing queue, skipping...')
      return
    }

    if (!pendingMessages.length || !currentChannelId) {
      console.log('No messages to process or no channel selected')
      return
    }

    isProcessingRef.current = true
    console.log('Starting to process message queue:', pendingMessages.length)

    try {
      // Создаем копию для безопасной итерации
      const messagesToProcess = [...pendingMessages]
        .filter((msg) => msg.attempts < 3)
        .sort((a, b) => a.timestamp - b.timestamp)

      for (const message of messagesToProcess) {
        try {
          console.log('Processing message:', message.tempId, message.body)

          dispatch(updatePendingMessage({
            tempId: message.tempId,
            isSending: true,
            attempts: message.attempts + 1,
            lastAttempt: Date.now(),
          }))

          // ✅ ПРАВИЛЬНЫЙ ПОДХОД: используем Redux action
          await dispatch(sendMessage({
            body: message.body,
            channelId: message.channelId || currentChannelId,
          })).unwrap()

          // Успешно отправлено - удаляем из очереди
          dispatch(removePendingMessage({ tempId: message.tempId }))
          console.log('Message sent successfully:', message.tempId)

          // Небольшая задержка между сообщениями
          await new Promise((resolve) => setTimeout(resolve, 100))
        }
        catch (error) {
          console.error('Failed to send message:', message.tempId, error)
          dispatch(updatePendingMessage({
            tempId: message.tempId,
            isSending: false,
          }))
          break
        }
      }
    }
    catch (error) {
      console.error('Error processing message queue:', error)
    }
    finally {
      isProcessingRef.current = false
    }
  }, [dispatch, pendingMessages, currentChannelId])

  useEffect(() => {
    const socket = socketService.getSocket()

    const handleConnect = () => {
      console.log('WebSocket connected, retrying messages')
      setTimeout(() => {
        retryPendingMessages()
      }, 500)
    }

    const handleOnline = () => {
      console.log('Browser online, checking connection')
      setTimeout(() => {
        if (socket && socket.connected) {
          retryPendingMessages()
        }
        else {
          socketService.connect().then(() => {
            setTimeout(() => retryPendingMessages(), 500)
          })
        }
      }, 1000)
    }

    // Подписываемся на события
    if (socket) {
      socket.on('connect', handleConnect)
    }

    window.addEventListener('online', handleOnline)

    // Периодическая проверка очереди (каждые 10 секунд)
    const interval = setInterval(() => {
      if (pendingMessages.length > 0 && navigator.onLine) {
        const socket = socketService.getSocket()
        if (socket && socket.connected) {
          retryPendingMessages()
        }
      }
    }, 10000)

    return () => {
      if (socket) {
        socket.off('connect', handleConnect)
      }
      window.removeEventListener('online', handleOnline)
      clearInterval(interval)
    }
  }, [retryPendingMessages, pendingMessages])
}
