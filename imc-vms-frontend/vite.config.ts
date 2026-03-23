import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
  ],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    allowedHosts: [
      // Allow any ngrok subdomain (ngrok URL changes frequently)
      '.ngrok-free.dev',
      '.ngrok.io',
      'localhost',
      '127.0.0.1'
    ],
    // HMR websockets through HTTPS tunnels (ngrok)
    hmr: {
      clientPort: 443
    }
  },

  preview: {
    host: true,
    port: 4173,
    strictPort: true,
    allowedHosts: [
      '.ngrok-free.dev',
      '.ngrok.io',
      'localhost',
      '127.0.0.1'
    ]
  }
});
