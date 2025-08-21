import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@radix-ui/react-select@2.1.6": "@radix-ui/react-select"
    }
  },
  build: {
    lib: {
      entry: 'src/weweb-mount.tsx',
      formats: ['iife'],
      name: 'CourseEnrollmentBundle',
      fileName: () => 'course-enrollment.js'
    },
    rollupOptions: {
      external: []
    }
  }
});
