const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cronService = require('./services/cronService');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件配置
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 数据库连接
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB连接成功'))
.catch(err => console.error('MongoDB连接失败:', err));

// 导入路由
const stockRoutes = require('./routes/stockRoutes');
const signalRoutes = require('./routes/signalRoutes');
const modelRoutes = require('./routes/modelRoutes');
const healthRoutes = require('./routes/healthRoutes');

// 使用路由
app.use('/api/stocks', stockRoutes);
app.use('/api/signals', signalRoutes);
app.use('/api/models', modelRoutes);
app.use('/api/health', healthRoutes);

// 健康检查
app.get('/', (req, res) => {
  res.json({ 
    message: '智盈AI后台服务运行正常',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: '服务器内部错误',
    message: err.message
  });
});

// 启动定时任务
cronService.start();

// 启动服务器
app.listen(PORT, () => {
  console.log(`智盈AI后台服务运行在 http://localhost:${PORT}`);
});

// 导出应用
module.exports = app;