import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Асинхронное действие для авторизации
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/v1/login', {
        username,
        password,
      });

      // Согласно документации, сервер возвращает { token: ..., username: ... }
      const { token, username: userUsername } = response.data;

      // Сохраняем токен в localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('username', userUsername);

      return { token, username: userUsername };
    } catch (error) {
      if (error.response?.status === 401) {
        return rejectWithValue('Неверные имя пользователя или пароль');
      }
      // Более детальная обработка ошибок
      const errorMessage =
        error.response?.data?.message ||
        error.response?.statusText ||
        'Ошибка авторизации';
      return rejectWithValue(errorMessage);
    }
  },
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/v1/signup', {
        username,
        password,
      });

      // Согласно документации, сервер возвращает { token: ..., username: ... }
      const { token, username: userUsername } = response.data;

      // Сохраняем токен в localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('username', userUsername);

      return { token, username: userUsername };
    } catch (error) {
      // Обработка ошибок регистрации
      if (error.response?.status === 409) {
        return rejectWithValue('Такой пользователь уже существует');
      }

      const errorMessage =
        error.response?.data?.message ||
        error.response?.statusText ||
        'Ошибка регистрации';
      return rejectWithValue(errorMessage);
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: localStorage.getItem('token'),
    username: localStorage.getItem('username'),
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      state.token = null;
      state.username = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.username = action.payload.username;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.token = null;
        state.username = null;
        state.isAuthenticated = false;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.username = action.payload.username;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Не сбрасываем токен при ошибке регистрации, так как пользователь мог быть уже авторизован
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
