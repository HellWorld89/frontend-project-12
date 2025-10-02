import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchChannels = createAsyncThunk(
  'channels/fetchChannels',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/v1/channels', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка загрузки каналов');
    }
  }
);

// АСИНХРОННЫЕ THUNKS (переименовываем для ясности)
export const createChannel = createAsyncThunk(
  'channels/createChannel',
  async (channelData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/v1/channels', channelData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка добавления канала');
    }
  }
);

export const renameChannel = createAsyncThunk(
  'channels/renameChannel',
  async ({ id, name }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(`/api/v1/channels/${id}`, { name }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка переименования канала');
    }
  }
);

export const deleteChannel = createAsyncThunk(
  'channels/deleteChannel',
  async (channelId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/v1/channels/${channelId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return channelId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка удаления канала');
    }
  }
);

// store/channelsSlice.js
const channelsSlice = createSlice({
  name: 'channels',
  initialState: {
    items: [],
    currentChannelId: null,
    loading: false,
    error: null,
    operationStatus: {
      type: null,
      loading: false,
      error: null,
    },
    recentlyCreatedChannelId: null,
  },
  reducers: {
    setCurrentChannel: (state, action) => {
      state.currentChannelId = action.payload;
    },
    clearRecentlyCreatedChannel: (state) => {
      state.recentlyCreatedChannelId = null;
    },
    // Добавляем проверку на дубликаты
    addChannelFromServer: (state, action) => {
      const existingChannel = state.items.find((channel) => channel.id === action.payload.id);
      if (!existingChannel) {
        state.items.push(action.payload);

        // ✅ АВТОМАТИЧЕСКОЕ ПЕРЕКЛЮЧЕНИЕ: если это недавно созданный канал
        if (state.recentlyCreatedChannelId === action.payload.id) {
          state.currentChannelId = action.payload.id;
          state.recentlyCreatedChannelId = null; // очищаем после переключения
        }
      }
    },
    updateChannelFromServer: (state, action) => {
      const index = state.items.findIndex((channel) => channel.id === action.payload.id);
      if (index !== -1) {
        // Обновляем только если данные действительно изменились
        if (JSON.stringify(state.items[index]) !== JSON.stringify(action.payload)) {
          state.items[index] = action.payload;
        }
      }
    },
    removeChannelFromServer: (state, action) => {
      state.items = state.items.filter((channel) => channel.id !== action.payload.id);
      if (state.currentChannelId === action.payload.id) {
        state.currentChannelId = state.items[0]?.id || null;
      }
    },
    resetOperationStatus: (state) => {
      state.operationStatus = {
        type: null,
        loading: false,
        error: null,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChannels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChannels.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.currentChannelId = action.payload[0]?.id || null;
      })
      .addCase(fetchChannels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createChannel.pending, (state) => {
        state.operationStatus = {
          type: 'create',
          loading: true,
          error: null,
        };
      })
      .addCase(createChannel.fulfilled, (state) => {
        state.operationStatus.loading = false;
        // Просто сбрасываем статус загрузки, вся логика в модальном окне
        console.log('✅ Channel creation HTTP request completed');
      })
      .addCase(createChannel.rejected, (state, action) => {
        state.operationStatus = {
          type: 'create',
          loading: false,
          error: action.payload,
        };
        state.recentlyCreatedChannelId = null;
      })
      // Аналогично для renameChannel и deleteChannel
      .addCase(renameChannel.fulfilled, (state) => {
        state.operationStatus.loading = false;
        // Обновление придет через WebSocket
      })
      .addCase(deleteChannel.fulfilled, (state) => {
        state.operationStatus.loading = false;
        // Удаление придет через WebSocket
      });
  },
});

export const {
  setCurrentChannel,
  clearRecentlyCreatedChannel,
  addChannelFromServer,
  updateChannelFromServer,
  removeChannelFromServer,
  resetOperationStatus
} = channelsSlice.actions;
export default channelsSlice.reducer;
