import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  
  // 🚀 Bundle Optimization
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'ui-vendor': ['primevue', 'primeicons'],
          'utils-vendor': ['axios', 'dayjs', 'laravel-echo', 'pusher-js'],
          'auth': ['./src/stores/auth.ts', './src/api/auth.ts'],
          'events': ['./src/stores/events.ts', './src/api/events.ts'],
          'chat': ['./src/stores/chat.ts', './src/stores/chatAgent.ts', './src/api/helpdesk.ts'],
        },
      },
    },
    minify: 'esbuild',
    cssMinify: true,
    sourcemap: false,
    chunkSizeWarningLimit: 600,
    reportCompressedSize: true,
  },
  
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', 'axios'],
  },
  
  server: {
    headers: {
      // Development CSP (allows localhost connections)
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: http://localhost:8000; connect-src 'self' ws: wss: https: http://localhost:8000; frame-src 'none'; object-src 'none';"
    }
  }
})