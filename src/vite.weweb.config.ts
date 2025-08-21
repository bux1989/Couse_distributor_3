import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: 'src/weweb-mount.tsx',
      formats: ['iife'],              // single self-executing file
      name: 'CourseEnrollmentBundle', // global name (not strictly used here)
      fileName: () => 'course-enrollment.js',
    },
    rollupOptions: {
      // Bundle everything (no externals) so WeWeb gets a single file
      external: [],
    },
  },
});
