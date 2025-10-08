// store/messagesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

export const fetchMessages = createAsyncThunk(
  'messages/fetchMessages',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/v1/messages', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response.data
    }
    catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка загрузки сообщений',
      )
    }
  },
)

export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async ({ body, channelId }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const username = localStorage.getItem('username')

      const response = await axios.post(
        '/api/v1/messages',
        {
          body,
          channelId,
          username,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      return response.data
    }
    catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка отправки сообщения',
      )
    }
  },
)

const messagesSlice = createSlice({
  name: 'messages',
  initialState: {
    items: [],
    loading: false,
    error: null,
    pendingMessages: [],
    isSending: false,
  },
  reducers: {
    addMessage: (state, action) => {
      console.log('📥 messagesSlice: Adding message to store', {
        messageId: action.payload.id,
        tempId: action.payload.tempId,
        body: action.payload.body,
        channelId: action.payload.channelId,
        currentItemsCount: state.items.length,
      })

      const existingById = action.payload.id
        ? state.items.find(msg => msg.id === action.payload.id)
        : null

      const existingByTempId = action.payload.tempId
        ? state.items.find(msg => msg.tempId === action.payload.tempId)
        : null

      if (!existingById && !existingByTempId) {
        state.items.push(action.payload)
        console.log('✅ messagesSlice: Message added successfully')

        if (action.payload.tempId) {
          state.pendingMessages = state.pendingMessages.filter(
            msg => msg.tempId !== action.payload.tempId,
          )
          console.log('🗑️ messagesSlice: Removed from pending queue')
        }
      }
      else if (existingByTempId && action.payload.id) {
        const index = state.items.findIndex(
          msg => msg.tempId === action.payload.tempId,
        )
        if (index !== -1) {
          state.items[index] = action.payload
          console.log(
            '🔄 messagesSlice: Temporary message replaced with server message',
          )

          state.pendingMessages = state.pendingMessages.filter(
            msg => msg.tempId !== action.payload.tempId,
          )
        }
      }
      else {
        console.log('♻️ messagesSlice: Message already exists, skipping')
      }
    },
    addPendingMessage: (state, action) => {
      console.log('📦 messagesSlice: Adding to pending queue', {
        tempId: action.payload.tempId,
        body: action.payload.body,
        currentQueueSize: state.pendingMessages.length,
      })

      const messageWithMeta = {
        ...action.payload,
        tempId:
          action.payload.tempId
          || `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        attempts: 0,
        lastAttempt: 0,
        isSending: false,
      }
      state.pendingMessages.push(messageWithMeta)
      state.pendingMessages.sort((a, b) => a.timestamp - b.timestamp)

      console.log('✅ messagesSlice: Pending message added', {
        newQueueSize: state.pendingMessages.length,
      })
    },
    removePendingMessage: (state, action) => {
      console.log('🗑️ messagesSlice: Removing from pending queue', {
        tempId: action.payload.tempId,
        queueSizeBefore: state.pendingMessages.length,
      })

      state.pendingMessages = state.pendingMessages.filter(
        msg => msg.tempId !== action.payload.tempId,
      )

      console.log('✅ messagesSlice: Pending message removed', {
        queueSizeAfter: state.pendingMessages.length,
      })
    },

    updatePendingMessage: (state, action) => {
      const { tempId, ...updates } = action.payload
      const messageIndex = state.pendingMessages.findIndex(
        msg => msg.tempId === tempId,
      )
      if (messageIndex !== -1) {
        state.pendingMessages[messageIndex] = {
          ...state.pendingMessages[messageIndex],
          ...updates,
        }
        console.log('🔄 messagesSlice: Pending message updated', {
          tempId,
          updates,
        })
      }
    },
    incrementMessageAttempts: (state, action) => {
      const message = state.pendingMessages.find(
        msg => msg.tempId === action.payload.tempId,
      )
      if (message) {
        message.attempts += 1
        message.lastAttempt = Date.now()
      }
    },
    updateMessage: (state, action) => {
      const index = state.items.findIndex(
        message => message.id === action.payload.id,
      )
      if (index !== -1) {
        state.items[index] = action.payload
      }
    },
    removeMessage: (state, action) => {
      state.items = state.items.filter(
        message => message.id !== action.payload.id,
      )
    },
    clearMessages: (state) => {
      state.items = []
    },
    removeMessagesByChannelId: (state, action) => {
      state.items = state.items.filter(
        message => message.channelId !== action.payload,
      )
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state) => {
        console.log('⏳ messagesSlice: Fetching messages...')
        state.loading = true
        state.error = null
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        console.log('✅ messagesSlice: Messages fetched successfully', {
          count: action.payload.length,
        })
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        console.error(
          '❌ messagesSlice: Failed to fetch messages:',
          action.payload,
        )
        state.loading = false
        state.error = action.payload
      })
  },
})

export const {
  addMessage,
  updateMessage,
  removeMessage,
  removeMessagesByChannelId,
  clearMessages,
  addPendingMessage,
  removePendingMessage,
  updatePendingMessage,
  incrementMessageAttempts,
} = messagesSlice.actions
export default messagesSlice.reducer
