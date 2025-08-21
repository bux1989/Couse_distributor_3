import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: '../src/wwElement.vue',
      formats: ['es'],
      name: 'WeWebCheck',
      fileName: () => 'weweb-check.js'
    },
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      external: []
    }
  }
});
