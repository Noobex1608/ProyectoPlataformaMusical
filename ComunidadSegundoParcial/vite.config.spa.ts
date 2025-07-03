import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  mode: 'spa',
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
        }
      }
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production')
  }
})
