import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: 'src/weweb-mount.tsx',
      formats: ['iife'],               // single self-executing file
      name: 'CourseEnrollmentBundle',
      fileName: () => 'course-enrollment.js',
    },
    rollupOptions: {
      external: [], // bundle everything
    },
  },
});
