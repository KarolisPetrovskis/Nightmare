
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';

// https://vite.dev/config/
export default defineConfig(() => {
  // Allow switching between HTTP and HTTPS with an env variable
  const useHttps = process.env.VITE_HTTPS === '1';
  const backendHttps = process.env.VITE_BACKEND_HTTPS === '1';
  const backendPort = backendHttps ? 7049 : 5087;
  const backendProtocol = backendHttps ? 'https' : 'http';
  const serverConfig: any = {
    port: 3000,
    proxy: {
      "/api": {
        target: `${backendProtocol}://localhost:${backendPort}`,
        changeOrigin: true,
        secure: false
      }
    }
  };
  if (useHttps) {
    serverConfig.https = {
      key: fs.readFileSync('localhost-key.pem'),
      cert: fs.readFileSync('localhost.pem'),
    };
  }
  return {
    plugins: [react()],
    server: serverConfig,
  };
});
