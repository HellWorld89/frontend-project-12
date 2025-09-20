import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5001', // Адрес твоего сервера
        changeOrigin: true,
        // Если сервер ожидает путь без /api, можно убрать префикс
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
