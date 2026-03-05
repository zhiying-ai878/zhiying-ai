import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production'
  
  return {
    base: './',
    plugins: [react()],
    server: {
      port: 3000,
      open: true
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'antd-vendor': ['antd', '@ant-design/icons'],
            'echarts-vendor': ['echarts', 'echarts-for-react'],
            'tfjs-vendor': ['@tensorflow/tfjs'],
            'utils-vendor': ['axios', 'dayjs', 'crypto-js']
          }
        }
      }
    }
  }
})
