import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Cambia 'pharma-jobs' por el nombre exacto de tu repositorio en GitHub
export default defineConfig({
  plugins: [react()],
  base: '/pharma-jobs/',
})
