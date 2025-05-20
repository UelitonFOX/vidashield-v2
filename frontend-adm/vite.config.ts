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
    
    // Evitar CORS e erros de conexão
    strictPort: true, 
    host: true,

    hmr: {
      overlay: true, // Overlay de erro no navegador (dev)
    },

    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Proxy para backend Flask
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path, // Não reescrever caminhos
        ws: false, // Desativar websockets
        timeout: 60000, // Aumentar timeout para 60s
        configure: (proxy, _options) => {
          // Logs de proxy só em desenvolvimento
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
    devSourcemap: true, // Mapas de source CSS (dev friendly)
  },
})
