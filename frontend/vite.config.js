import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
 // ✅ Add this line (Replace with your GitHub repo name)
  server: {
    proxy: {
      '/api': 'http://localhost:3000',  // This is fine for local development
    },
  },
});
