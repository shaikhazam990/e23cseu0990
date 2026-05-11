import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://4.224.186.213',
        changeOrigin: true,
        // Preserve Authorization header — do NOT strip it
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            // Ensure host header matches target to avoid rejections
            proxyReq.setHeader('host', '4.224.186.213')
          })
        },
        rewrite: (path) => path.replace(/^\/api/, '/evaluation-service'),
      },
    },
  },
})
