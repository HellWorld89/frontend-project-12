import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/v1/login', {
        username,
        password,
      })

      const { token, username: userUsername } = response.data

      localStorage.setItem('token', token)
      localStorage.setItem('username', userUsername)

      return { token, username: userUsername }
    }
    catch (error) {
      console.log('Login error details:', error.response)
      if (error.response?.status === 401) {
        return rejectWithValue('Неверные имя пользователя или пароль')
      }
      return rejectWithValue('Ошибка авторизации')
    }
  },
)

export const registerUser = createAsyncThunk(
  'auth/register',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/v1/signup', {
        username,
        password,
      })

      const { token, username: userUsername } = response.data

      localStorage.setItem('token', token)
      localStorage.setItem('username', userUsername)

      return { token, username: userUsername }
    }
    catch (error) {
      if (error.response?.status === 409) {
        return rejectWithValue('Такой пользователь уже существует')
      }

      return rejectWithValue('Ошибка регистрации')
    }
  },
)

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
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      state.token = null
      state.username = null
      state.isAuthenticated = false
      state.error = null
    },
    clearError: (state) => {
      state.error = null
    },
    setError: (state, action) => {
      state.error = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.token = action.payload.token
        state.username = action.payload.username
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.isAuthenticated = false
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false
        state.token = action.payload.token
        state.username = action.payload.username
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.isAuthenticated = false
      })
  },
})

export const { logout, clearError, setError } = authSlice.actions
export default authSlice.reducer
