import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Configuração principal do Vite para o VidaShield 🛡️
// Inclui proxy para backend Flask, ajustes de DX e pronto pra build 💪

export default defineConfig({
  base: './', // Garante que builds funcionem em subpastas (produção/Vercel/etc)

  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Importações com '@' do src/
    },
  },

  server: {
    port: 3000, // Porta do frontend
    strictPort: true,
    host: true,

    // ✅ Permitir conexões do domínio ngrok
    allowedHosts: [
      'a315-2804-15fc-300d-1301-ad9c-3bfd-9809-96d1.ngrok-free.app'
    ],

    hmr: {
      overlay: true,
    },

    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        ws: false,
        timeout: 60000,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.error('[Proxy Error]', err)
          })

          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('[Proxy Request]', req.method, req.url)
          })

          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('[Proxy Response]', proxyRes.statusCode, req.url)
          })
        }
      }
    }
  },

  css: {
    devSourcemap: true,
  },
})
