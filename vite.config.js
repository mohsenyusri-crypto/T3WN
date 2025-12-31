import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { copyFileSync } from 'fs'
import { join } from 'path'

export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    {
      name: 'copy-404',
      closeBundle() {
        // Copy index.html to 404.html for GitHub Pages SPA routing
        const distPath = join(process.cwd(), 'dist')
        copyFileSync(join(distPath, 'index.html'), join(distPath, '404.html'))
      }
    }
  ],
  base: '/',
  build: {
    assetsDir: 'assets',
    outDir: 'dist',
  },
})
