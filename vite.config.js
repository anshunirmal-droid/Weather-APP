import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // Put the charting library in its own file so the main bundle stays small.
    rollupOptions: {
      output: {
        manualChunks: { recharts: ['recharts'] },
      },
    },
    chunkSizeWarningLimit: 700,
  },
});
