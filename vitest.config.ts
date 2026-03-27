import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@db': path.resolve(__dirname, 'db'),
    },
  },
  test: {
    include: [
      'src/domain/**/*.test.ts',
      'src/services/**/__tests__/**/*.test.ts',
    ],
  },
})
