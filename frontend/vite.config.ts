import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss' // <--- New Import
import autoprefixer from 'autoprefixer' // <--- New Import

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer], // <-- FIX: Tailwind plugins add kiye
    },
  },
})