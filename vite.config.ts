import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'terser',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true,
    target: 'es2015',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'antd-vendor': ['antd', '@ant-design/icons'],
          'ai-models': ['@tensorflow/tfjs', 'openai'],
          'charting': ['echarts', 'echarts-for-react'],
          'utilities': ['axios', 'crypto-js', 'dayjs', 'i18next', 'react-i18next']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'antd', '@ant-design/icons', 'echarts'],
    exclude: ['@/utils/localAI', '@/utils/machineLearningModel'],
  },
  server: {
    port: 3000,
    open: true,
    host: true,
  },
});