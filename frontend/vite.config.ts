import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('@tiptap') || id.includes('prosemirror')) {
              return 'tiptap';
            }
            if (id.includes('@radix-ui')) {
              return 'radix-ui';
            }
            if (id.includes('@tanstack')) {
              return 'tanstack';
            }
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('zod')) {
              return 'zod';
            }
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            if (id.includes('recharts')) {
              return 'charts';
            }
            if (id.includes('thumbhash')) {
              return 'thumbhash';
            }
            return 'vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
});
