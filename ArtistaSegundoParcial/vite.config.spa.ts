import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuración específica para modo SPA (Single Page Application)
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 5177,
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  },
  build: {
    lib: {
      entry: 'src/main.tsx',
      name: 'ArtistaSegundoParcial',
      fileName: (format) => `artista-segundo-parcial.${format}.js`,
      formats: ['es', 'umd']
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react-router-dom', 'single-spa'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react-router-dom': 'ReactRouterDOM',
          'single-spa': 'singleSpa'
        },
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    },
    assetsDir: 'assets',
    assetsInlineLimit: 0
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  }
})
