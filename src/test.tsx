import React from 'react'
import ReactDOM from 'react-dom/client'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div style={{ padding: '20px' }}>
      <h1>测试页面</h1>
      <p>如果看到此内容，说明Vite正常工作</p>
      <p>当前时间：{new Date().toLocaleString()}</p>
    </div>
  </React.StrictMode>,
)