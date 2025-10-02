// api/axiosConfig.js
import axios from 'axios';

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  console.log('🔐 Axios Request:', {
    url: config.url,
    headers: config.headers
  });

  return config;
});

axios.interceptors.response.use(
  (response) => {
    console.log('✅ Axios Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('❌ Axios Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message
    });

    if (error.response?.status === 401) {
      console.warn('⚠️ Authentication failed, clearing token');
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axios;
