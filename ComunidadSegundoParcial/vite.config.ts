import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: './', // Usar rutas relativas
    server: {
      port: 5175,
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    },
    build: {
      lib: {
        entry: 'src/main.ts',
        name: 'ComunidadSegundoParcial',
        fileName: (format) => `comunidad-segundo-parcial.${format}.js`,
        formats: ['es', 'umd']
      },
      rollupOptions: {
        external: ['vue', 'vue-router', 'pinia', 'single-spa'],
        output: {
          globals: {
            vue: 'Vue',
            'vue-router': 'VueRouter',
            pinia: 'Pinia',
            'single-spa': 'singleSpa'
          },
          assetFileNames: 'assets/[name]-[hash][extname]' // Mantener estructura de assets
        }
      },
      assetsDir: 'assets', // Directorio para assets
      assetsInlineLimit: 0 // No hacer inline de assets pequeños
    },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  }
})
