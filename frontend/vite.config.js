import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'import.meta.env.API_URL': JSON.stringify(env.API_URL || 'http://localhost:5000')
    },
    build: {
      outDir: 'dist',
      sourcemap: false
    },
    server: {
      port: 5173
    }
  }
})
