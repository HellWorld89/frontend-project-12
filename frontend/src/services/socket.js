// services/socket.js
import { io } from 'socket.io-client'

class SocketService {
  constructor() {
    this.socket = null
    this.isConnected = false
  }

  async connect() {
    return new Promise((resolve, reject) => {
      try {
        const token = localStorage.getItem('token')

        if (!token) {
          reject(new Error('No token available'))
          return
        }

        console.log('🔌 SocketService: Connecting with token:', token.substring(0, 10) + '...')

        const socketUrl = window.location.origin

        this.socket = io(socketUrl, {
          auth: {
            token: token,
          },
          transports: ['websocket', 'polling'],
          timeout: 10000,
        })

        this.socket.on('connect', () => {
          console.log('✅ SocketService: WebSocket connected', {
            id: this.socket.id,
            connected: this.socket.connected,
          })
          this.isConnected = true
          resolve(this.socket)
        })

        this.socket.on('disconnect', reason => {
          console.log('❌ SocketService: WebSocket disconnected:', reason)
          this.isConnected = false
        })

        this.socket.on('connect_error', error => {
          console.error('💥 SocketService: Connection error:', error)
          this.isConnected = false

          // Проверяем, является ли ошибка аутентификационной
          if (error.message.includes('auth') || error.message.includes('401')) {
            console.warn('⚠️ WebSocket authentication error')
            localStorage.removeItem('token')
            localStorage.removeItem('username')
            window.location.href = '/login'
          }

          reject(error)
        })

        // Логируем все исходящие события
        const originalEmit = this.socket.emit.bind(this.socket)
        this.socket.emit = (event, data, callback) => {
          console.log('📤 SocketService: Emitting event:', { event, data })
          return originalEmit(event, data, response => {
            console.log('📨 SocketService: Event response:', { event, response })
            if (callback) callback(response)
          })
        }

        // Логируем все входящие события
        this.socket.onAny((event, ...args) => {
          console.log('📩 SocketService: Received event:', { event, args })
        })

        setTimeout(() => {
          if (!this.isConnected) {
            reject(new Error('Connection timeout'))
          }
        }, 10000)
      }
      catch (error) {
        reject(error)
      }
    })
  }

  async waitForConnection() {
    if (this.isConnected && this.socket?.connected) {
      return this.socket
    }
    return this.connect()
  }

  getSocket() {
    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
    }
  }
}

// Экспортируем экземпляр для глобального доступа (для отладки)
const socketService = new SocketService()

// Для отладки - добавляем в window
if (typeof window !== 'undefined') {
  window.socketService = socketService
}

export default socketService
