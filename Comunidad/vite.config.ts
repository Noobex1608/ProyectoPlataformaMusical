import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'node:path'; 


export default defineConfig({
  plugins: [vue()], 
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@comunidad': resolve(__dirname, './src/modules/comunidad'),
      '@types': resolve(__dirname, './src/types'),
      '@/lib': resolve(__dirname, './src/lib'),
      '@components': resolve(__dirname, './src/components')
    }
  }
});