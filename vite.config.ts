import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: false,
      devOptions: {
        enabled: true,
        type: 'module',
      }
    })
  ],
  server: {
    host: true, // ou host: '0.0.0.0'
    port: 5173, // porta padrão, pode mudar
  },
})
