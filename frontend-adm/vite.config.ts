import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// 🛡️ Configuração principal do Vite para o VidaShield
export default defineConfig(({ mode }) => {
  // Carrega variáveis de ambiente
  const env = loadEnv(mode, process.cwd(), '');
  const apiUrl = env.VITE_API_URL || 'https://vidashield.onrender.com';

  return {
    base: './', // Garante paths relativos, bom para Vercel

    plugins: [react()],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    server: {
      port: 3000,
      strictPort: true,
      host: true,

      // ✅ Domínios permitidos no desenvolvimento
      allowedHosts: [
        'localhost',
        'vidashield.vercel.app',
        'a315-2804-15fc-300d-1301-ad9c-3bfd-9809-96d1.ngrok-free.app',
        'stirred-broadly-hedgehog.ngrok-free.app',
        'vidashield.loca.lt'
      ],

      hmr: {
        overlay: true,
      },

      proxy: {
        '/api': {
          target: apiUrl,
          changeOrigin: true,
          secure: false,
          rewrite: path => path,
          ws: false,
          timeout: 60000,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.error('[Proxy Error]', err);
            });

            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('[Proxy Request]', req.method, req.url);
            });

            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('[Proxy Response]', proxyRes.statusCode, req.url);
            });
          }
        }
      }
    },

    css: {
      devSourcemap: true,
    },
  };
});
