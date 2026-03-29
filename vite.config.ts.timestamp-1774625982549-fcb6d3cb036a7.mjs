// vite.config.ts
import { defineConfig } from "file:///D:/%E6%88%91%E7%9A%84%E8%B5%84%E6%96%99/APP%E8%B5%84%E6%96%99/%E6%99%BA%E7%9B%88AI/node_modules/vite/dist/node/index.js";
import react from "file:///D:/%E6%88%91%E7%9A%84%E8%B5%84%E6%96%99/APP%E8%B5%84%E6%96%99/%E6%99%BA%E7%9B%88AI/node_modules/@vitejs/plugin-react/dist/index.js";
import { resolve } from "path";
var __vite_injected_original_dirname = "D:\\\u6211\u7684\u8D44\u6599\\APP\u8D44\u6599\\\u667A\u76C8AI";
var vite_config_default = defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__vite_injected_original_dirname, "src")
    }
  },
  base: "/zhiying-ai/",
  build: {
    outDir: "dist",
    assetsDir: "assets",
    minify: "terser",
    sourcemap: false,
    chunkSizeWarningLimit: 1e3,
    cssCodeSplit: true,
    target: "es2015",
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "antd-vendor": ["antd", "@ant-design/icons"],
          "ai-models": ["@tensorflow/tfjs", "openai"],
          "charting": ["echarts", "echarts-for-react"],
          "utilities": ["axios", "crypto-js", "dayjs", "i18next", "react-i18next"]
        }
      }
    }
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom", "antd", "@ant-design/icons", "echarts"],
    exclude: ["@/utils/localAI", "@/utils/machineLearningModel"]
  },
  server: {
    port: 4104,
    open: true,
    host: true
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxcdTYyMTFcdTc2ODRcdThENDRcdTY1OTlcXFxcQVBQXHU4RDQ0XHU2NTk5XFxcXFx1NjY3QVx1NzZDOEFJXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxcdTYyMTFcdTc2ODRcdThENDRcdTY1OTlcXFxcQVBQXHU4RDQ0XHU2NTk5XFxcXFx1NjY3QVx1NzZDOEFJXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi8lRTYlODglOTElRTclOUElODQlRTglQjUlODQlRTYlOTYlOTkvQVBQJUU4JUI1JTg0JUU2JTk2JTk5LyVFNiU5OSVCQSVFNyU5QiU4OEFJL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnO1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW3JlYWN0KCldLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgICdAJzogcmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMnKSxcbiAgICB9LFxuICB9LFxuICBiYXNlOiAnL3poaXlpbmctYWkvJyxcbiAgYnVpbGQ6IHtcbiAgICBvdXREaXI6ICdkaXN0JyxcbiAgICBhc3NldHNEaXI6ICdhc3NldHMnLFxuICAgIG1pbmlmeTogJ3RlcnNlcicsXG4gICAgc291cmNlbWFwOiBmYWxzZSxcbiAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDEwMDAsXG4gICAgY3NzQ29kZVNwbGl0OiB0cnVlLFxuICAgIHRhcmdldDogJ2VzMjAxNScsXG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIG1hbnVhbENodW5rczoge1xuICAgICAgICAgICdyZWFjdC12ZW5kb3InOiBbJ3JlYWN0JywgJ3JlYWN0LWRvbScsICdyZWFjdC1yb3V0ZXItZG9tJ10sXG4gICAgICAgICAgJ2FudGQtdmVuZG9yJzogWydhbnRkJywgJ0BhbnQtZGVzaWduL2ljb25zJ10sXG4gICAgICAgICAgJ2FpLW1vZGVscyc6IFsnQHRlbnNvcmZsb3cvdGZqcycsICdvcGVuYWknXSxcbiAgICAgICAgICAnY2hhcnRpbmcnOiBbJ2VjaGFydHMnLCAnZWNoYXJ0cy1mb3ItcmVhY3QnXSxcbiAgICAgICAgICAndXRpbGl0aWVzJzogWydheGlvcycsICdjcnlwdG8tanMnLCAnZGF5anMnLCAnaTE4bmV4dCcsICdyZWFjdC1pMThuZXh0J11cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgb3B0aW1pemVEZXBzOiB7XG4gICAgaW5jbHVkZTogWydyZWFjdCcsICdyZWFjdC1kb20nLCAncmVhY3Qtcm91dGVyLWRvbScsICdhbnRkJywgJ0BhbnQtZGVzaWduL2ljb25zJywgJ2VjaGFydHMnXSxcbiAgICBleGNsdWRlOiBbJ0AvdXRpbHMvbG9jYWxBSScsICdAL3V0aWxzL21hY2hpbmVMZWFybmluZ01vZGVsJ10sXG4gIH0sXG4gIHNlcnZlcjoge1xuICAgIHBvcnQ6IDQxMDQsXG4gICAgb3BlbjogdHJ1ZSxcbiAgICBob3N0OiB0cnVlLFxuICB9LFxufSk7Il0sCiAgIm1hcHBpbmdzIjogIjtBQUFnVCxTQUFTLG9CQUFvQjtBQUM3VSxPQUFPLFdBQVc7QUFDbEIsU0FBUyxlQUFlO0FBRnhCLElBQU0sbUNBQW1DO0FBS3pDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFBQSxFQUNqQixTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLFFBQVEsa0NBQVcsS0FBSztBQUFBLElBQy9CO0FBQUEsRUFDRjtBQUFBLEVBQ0EsTUFBTTtBQUFBLEVBQ04sT0FBTztBQUFBLElBQ0wsUUFBUTtBQUFBLElBQ1IsV0FBVztBQUFBLElBQ1gsUUFBUTtBQUFBLElBQ1IsV0FBVztBQUFBLElBQ1gsdUJBQXVCO0FBQUEsSUFDdkIsY0FBYztBQUFBLElBQ2QsUUFBUTtBQUFBLElBQ1IsZUFBZTtBQUFBLE1BQ2IsUUFBUTtBQUFBLFFBQ04sY0FBYztBQUFBLFVBQ1osZ0JBQWdCLENBQUMsU0FBUyxhQUFhLGtCQUFrQjtBQUFBLFVBQ3pELGVBQWUsQ0FBQyxRQUFRLG1CQUFtQjtBQUFBLFVBQzNDLGFBQWEsQ0FBQyxvQkFBb0IsUUFBUTtBQUFBLFVBQzFDLFlBQVksQ0FBQyxXQUFXLG1CQUFtQjtBQUFBLFVBQzNDLGFBQWEsQ0FBQyxTQUFTLGFBQWEsU0FBUyxXQUFXLGVBQWU7QUFBQSxRQUN6RTtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsY0FBYztBQUFBLElBQ1osU0FBUyxDQUFDLFNBQVMsYUFBYSxvQkFBb0IsUUFBUSxxQkFBcUIsU0FBUztBQUFBLElBQzFGLFNBQVMsQ0FBQyxtQkFBbUIsOEJBQThCO0FBQUEsRUFDN0Q7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxFQUNSO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
