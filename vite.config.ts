import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
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
    chunkSizeWarningLimit: 500,
    cssCodeSplit: true,
    target: 'es2015',
    rollupOptions: {
      output: {
        manualChunks: {
          // 核心依赖
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'antd-vendor': ['antd', '@ant-design/icons'],
          'ai-models': ['@tensorflow/tfjs', 'openai'],
          'charting': ['echarts', 'echarts-for-react'],
          'utilities': ['axios', 'crypto-js', 'dayjs', 'i18next', 'react-i18next'],
          
          // 功能模块
          'stock-data': ['src/utils/stockData.ts', 'src/utils/mainForceTracker.ts'],
          'ai-modules': ['src/utils/machineLearningModel.ts', 'src/utils/localAI.ts'],
          'data-sources': ['src/utils/dataSources.ts', 'src/utils/realtimeData.ts'],
          
          // 页面组件
          'dashboard-components': ['src/pages/Dashboard/Dashboard.tsx'],
          'stock-components': ['src/pages/StockDetail/StockDetail.tsx'],
          'trade-components': ['src/pages/Trade/Trade.tsx'],
          'ai-components': ['src/pages/AIAssistant/AIAssistant.tsx', 'src/pages/AIStrategy/AIStrategy.tsx']
        },
        // 自动代码分割配置
        chunkFileNames: 'assets/chunks/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
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
    proxy: {
      '/api/sina': {
        target: 'https://hq.sinajs.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/sina/, ''),
        headers: {
          'Referer': 'https://finance.sina.com.cn/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      },
      '/api/eastmoney': {
        target: 'https://push2.eastmoney.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/eastmoney/, ''),
        headers: {
          'Referer': 'https://quote.eastmoney.com/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      },
      '/api/tencent': {
        target: 'https://qt.gtimg.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/tencent/, ''),
        headers: {
          'Referer': 'https://finance.qq.com/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      },
      '/api/xueqiu': {
        target: 'https://xueqiu.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/xueqiu/, ''),
        headers: {
          'Referer': 'https://xueqiu.com/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      },
      '/api/ths': {
        target: 'https://q.10jqka.com.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ths/, ''),
        headers: {
          'Referer': 'https://www.10jqka.com.cn/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      },
      '/api/tdx': {
        target: 'https://www.tdx.com.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/tdx/, ''),
        headers: {
          'Referer': 'https://www.tdx.com.cn/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      },
      '/api/dzh': {
        target: 'https://www.gw.com.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/dzh/, ''),
        headers: {
          'Referer': 'https://www.gw.com.cn/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      },
      '/api/wind': {
        target: 'https://www.wind.com.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/wind/, ''),
        headers: {
          'Referer': 'https://www.wind.com.cn/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      },
      '/api/choice': {
        target: 'https://choice.eastmoney.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/choice/, ''),
        headers: {
          'Referer': 'https://choice.eastmoney.com/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      },
      '/api/jrj': {
        target: 'https://www.jrj.com.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/jrj/, ''),
        headers: {
          'Referer': 'https://www.jrj.com.cn/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      },
      '/api/p5w': {
        target: 'https://www.p5w.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/p5w/, ''),
        headers: {
          'Referer': 'https://www.p5w.net/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      },
    },
  },
});