import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: 'src/weweb-mount.tsx',
      formats: ['iife'],
      name: 'CourseEnrollmentBundle',
      fileName: () => 'course-enrollment.js',
    },
    rollupOptions: {
      external: [],
    },
  },
});
