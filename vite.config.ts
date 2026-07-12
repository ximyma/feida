import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  root: path.resolve(__dirname, 'client'),
  base: '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'client/src'),
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
  },
  server: {
    port: 8080,
    host: 'localhost',
    strictPort: false,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            // 为 SSE 端点设置长连接头
            if (proxyReq.path?.includes('stream')) {
              proxyReq.setHeader('Connection', 'keep-alive');
              proxyReq.setHeader('Cache-Control', 'no-cache');
            }
          });
        },
      },
    },
  },
  build: {
    outDir: path.resolve(__dirname, 'dist/client'),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          antd: ['antd', '@ant-design/icons'],
          tiptap: ['@tiptap/core', '@tiptap/react', '@tiptap/starter-kit', '@tiptap/extension-table', '@tiptap/extension-youtube', '@tiptap/extension-link', '@tiptap/extension-image'],
          lucide: ['lucide-react'],
          react: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
});
