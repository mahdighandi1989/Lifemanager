import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': 'http://localhost:8000',
      '/tasks': 'http://localhost:8000',
      '/projects': 'http://localhost:8000',
      '/notifications': 'http://localhost:8000',
      '/users': 'http://localhost:8000',
      '/ai': 'http://localhost:8000',
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
});