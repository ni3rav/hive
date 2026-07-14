import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
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
        manualChunks: {
          'tiptap-core': ['@tiptap/react', '@tiptap/core'],
          'tiptap-extensions': [
            '@tiptap/starter-kit',
            '@tiptap/extension-placeholder',
            '@tiptap/extension-link',
            '@tiptap/extension-underline',
            '@tiptap/extension-text-align',
            '@tiptap/extension-highlight',
            '@tiptap/extension-text-style',
            '@tiptap/extension-color',
            '@tiptap/extension-table',
            '@tiptap/extension-task-list',
            '@tiptap/extension-task-item',
            '@tiptap/extension-youtube',
            '@tiptap/extension-image',
          ],
          'react-query': ['@tanstack/react-query'],
          'react-table': ['@tanstack/react-table'],
          'vendor-ui': ['sonner', 'thumbhash'],
        },
      },
    },
  },
});
