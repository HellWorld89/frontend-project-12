import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';


export const fetchMessages = createAsyncThunk(
    'messages/fetchMessages',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/v1/messages', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Ошибка загрузки сообщений');
        }
    }
);

export const sendMessage = createAsyncThunk(
    'messages/sendMessage',
    async ({ body, channelId }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const username = localStorage.getItem('username');

            const response = await axios.post('/api/v1/messages', {
                body,
                channelId,
                username,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Ошибка отправки сообщения');
        }
    }
);

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
            // Проверяем, нет ли уже такого сообщения (для избежания дубликатов)
            const existingMessage = state.items.find(msg => msg.id === action.payload.id);
            if (!existingMessage) {
                state.items.push(action.payload);
            }
        },
        setSending: (state, action) => {
            state.isSending = action.payload;
        },
        addPendingMessage: (state, action) => {
            // Генерируем уникальный ID и временную метку
            const messageWithMeta = {
                ...action.payload,
                tempId: action.payload.tempId || `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                timestamp: Date.now(),
                attempts: 0,
                lastAttempt: 0,
                isSending: false,
            };
            state.pendingMessages.push(messageWithMeta);
            // Сортируем по временной метке для сохранения порядка
            state.pendingMessages.sort((a, b) => a.timestamp - b.timestamp);
        },
        updatePendingMessage: (state, action) => {
            const index = state.pendingMessages.findIndex(msg => msg.tempId === action.payload.tempId);
            if (index !== -1) {
                state.pendingMessages[index] = { ...state.pendingMessages[index], ...action.payload };
            }
        },
        // Удаляем сообщение из очереди после успешной отправки
        removePendingMessage: (state, action) => {
            state.pendingMessages = state.pendingMessages.filter(
                msg => msg.tempId !== action.payload.tempId
            );
        },
        // Увеличиваем счетчик попыток
        incrementMessageAttempts: (state, action) => {
            const message = state.pendingMessages.find(
                msg => msg.tempId === action.payload.tempId
            );
            if (message) {
                message.attempts += 1;
                message.lastAttempt = Date.now();
            }
        },
        updateMessage: (state, action) => {
            const index = state.items.findIndex(message => message.id === action.payload.id);
            if (index !== -1) {
                state.items[index] = action.payload;
            }
        },
        removeMessage: (state, action) => {
            state.items = state.items.filter(message => message.id !== action.payload.id);
        },
        clearMessages: (state) => {
            state.items = [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMessages.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMessages.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchMessages.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(sendMessage.fulfilled, (state, action) => {
                // Сообщение уже добавлено через WebSocket, поэтому здесь ничего не делаем
            });
    },
});

export const {
    addMessage,
    updateMessage,
    removeMessage,
    clearMessages,
    addPendingMessage,
    removePendingMessage,
    updatePendingMessage,
    incrementMessageAttempts,
} = messagesSlice.actions;
export default messagesSlice.reducer;