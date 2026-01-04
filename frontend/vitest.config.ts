import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./tests/setup/vitest.setup.ts'],
    include: ['tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: [
          'node_modules/',
          'tests/',
          '**/*.d.ts',
          '**/*.config.*',
          '**/dist/**',
          '**/coverage/**',
          // Exclude pages, layouts, and router (typically integration tested)
          'src/pages/**',
          'src/layouts/**',
          'src/router/**',
          'src/App.vue',
          'src/main.ts',
          // Exclude index files (just exports)
          'src/**/index.ts',
          // Exclude composables that are integration-tested
          'src/composables/useChatChannel.ts',
          'src/composables/useConfirm.ts',
          'src/composables/useNotification.ts',
          // Exclude WebSocket/Echo utilities
          'src/utils/echo.ts',
        ],
        thresholds: {
          lines: 80,
          functions: 80,
          branches: 75,
          statements: 80,
        },
      },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})

