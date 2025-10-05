import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import channelsReducer from './channelsSlice'
import messagesReducer from './messagesSlice'

export default configureStore({
  reducer: {
    auth: authReducer,
    channels: channelsReducer,
    messages: messagesReducer,
  },
})
