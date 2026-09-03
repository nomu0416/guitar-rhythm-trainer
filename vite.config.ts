/// <reference types="vitest/config" />
import { alphaTab } from '@coderline/alphatab-vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), alphaTab()],
  test: {
    environment: 'node',
  },
})
