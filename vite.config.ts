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
  base: '/zhiying-ai/',
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
    port: 4104,
    open: true,
    host: true,
    proxy: {
      // 代理腾讯财经API
      '/api/tencent': {
        target: 'https://qt.gtimg.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/tencent/, '')
      },
      // 代理新浪财经API
      '/api/sina': {
        target: 'https://hq.sinajs.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/sina/, '')
      },
      // 代理东方财富API
      '/api/eastmoney': {
        target: 'https://push2.eastmoney.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/eastmoney/, '')
      },
      // 代理雪球API
      '/api/xueqiu': {
        target: 'https://xueqiu.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/xueqiu/, '')
      },
      // 代理同花顺API
      '/api/ths': {
        target: 'https://api.10jqka.com.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ths/, '')
      },
      // 代理网易财经API
      '/api/netease': {
        target: 'https://api.money.126.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/netease/, '')
      },
      // 代理其他API
      '/api/other': {
        target: 'https://api.mairui.club',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/other/, '')
      }
    }
  },
});