import { useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { addMessage } from '../store/messagesSlice'
import {
  addChannelFromServer,
  removeChannelFromServer,
  updateChannelFromServer,
} from '../store/channelsSlice'
import socketService from '../services/socket'

export const useWebSocket = () => {
  const dispatch = useDispatch()
  const eventHandlers = useRef(new Set())

  useEffect(() => {
    let mounted = true
    let socketInstance = null

    console.log('🔌 useWebSocket: Initializing WebSocket connection')

    const initializeSocket = async () => {
      try {
        console.log('🔄 useWebSocket: Waiting for connection...')
        socketInstance = await socketService.waitForConnection()

        if (!mounted) {
          console.log('🚫 useWebSocket: Component unmounted during connection')
          return
        }

        console.log('✅ useWebSocket: Connection established', {
          socketId: socketInstance.id,
          connected: socketInstance.connected,
        })

        const handleNewMessage = (message) => {
          if (!mounted) {
            console.log(
              '🚫 useWebSocket: Component unmounted, ignoring message',
            )
            return
          }

          console.log('📨 useWebSocket: Received newMessage event:', message)
          dispatch(addMessage(message))
        }

        const handleNewChannel = (channel) => {
          if (!mounted) return
          console.log('📨 useWebSocket: Received newChannel event:', channel)
          dispatch(addChannelFromServer(channel))
        }

        const handleRemoveChannel = ({ id }) => {
          if (!mounted) return
          console.log('📨 useWebSocket: Received removeChannel event:', id)
          dispatch(removeChannelFromServer({ id }))
        }

        const handleRenameChannel = (channel) => {
          if (!mounted) return
          console.log(
            '📨 useWebSocket: Received renameChannel event:',
            channel,
          )
          dispatch(updateChannelFromServer(channel))
        }

        socketInstance.on('newMessage', handleNewMessage)
        socketInstance.on('newChannel', handleNewChannel)
        socketInstance.on('removeChannel', handleRemoveChannel)
        socketInstance.on('renameChannel', handleRenameChannel)

        eventHandlers.current.add(handleNewMessage)
        eventHandlers.current.add(handleNewChannel)
        eventHandlers.current.add(handleRemoveChannel)
        eventHandlers.current.add(handleRenameChannel)

        console.log('👂 useWebSocket: Subscribed to all events')
      }
      catch (error) {
        console.error(
          '💥 useWebSocket: Failed to initialize WebSocket:',
          error,
        )
      }
    }

    initializeSocket()

    return () => {
      console.log('🧹 useWebSocket: Cleaning up')
      mounted = false

      if (socketInstance) {
        eventHandlers.current.forEach((handler) => {
          socketInstance.off('newMessage', handler)
          socketInstance.off('newChannel', handler)
          socketInstance.off('removeChannel', handler)
          socketInstance.off('renameChannel', handler)
        })
        eventHandlers.current.clear()
        console.log('🔌 useWebSocket: Unsubscribed from all events')
      }
    }
  }, [dispatch])
}
