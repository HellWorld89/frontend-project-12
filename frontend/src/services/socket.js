import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.connectionPromise = null;
  }

  connect() {
    if (this.isConnected && this.socket) {
      return this.socket;
    }

    // Создаем promise для управления подключением
    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          reject(new Error('No token available'));
          return;
        }

        this.socket = io('http://localhost:5001', {
          auth: {
            token: token
          },
          transports: ['websocket', 'polling'] // Добавляем оба транспорта для надежности
        });

        this.socket.on('connect', () => {
          console.log('Connected to server');
          this.isConnected = true;
          resolve(this.socket);
        });

        this.socket.on('disconnect', (reason) => {
          console.log('Disconnected from server:', reason);
          this.isConnected = false;
        });

        this.socket.on('connect_error', (error) => {
          console.error('Connection error:', error);
          this.isConnected = false;
          reject(error);
        });

        // Таймаут подключения
        setTimeout(() => {
          if (!this.isConnected) {
            reject(new Error('Connection timeout'));
          }
        }, 5000);

      } catch (error) {
        reject(error);
      }
    });

    return this.socket; // Возвращаем socket, но работаем через promise
  }

  async waitForConnection() {
    if (this.isConnected && this.socket) {
      return this.socket;
    }

    if (this.connectionPromise) {
      return await this.connectionPromise;
    }

    return this.connect();
  }

  getSocket() {
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.connectionPromise = null;
    }
  }
}

export default new SocketService();