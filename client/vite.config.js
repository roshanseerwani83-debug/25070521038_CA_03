import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5000',
      '/getall': 'http://localhost:5000',
      '/get': 'http://localhost:5000',
      '/create': 'http://localhost:5000',
      '/update': 'http://localhost:5000',
      '/delete': 'http://localhost:5000',
      '/messages': 'http://localhost:5000',
      '/contact': 'http://localhost:5000'
    }
  }
});
