const express = require('express');
const mongoose = require('mongoose');
const StockData = require('../models/StockData');
const Signal = require('../models/Signal');
const AIModel = require('../models/AIModel');
const router = express.Router();

// 健康检查
router.get('/', async (req, res) => {
  try {
    // 检查数据库连接
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    // 获取数据统计
    const stockDataCount = await StockData.countDocuments();
    const signalCount = await Signal.countDocuments();
    const modelCount = await AIModel.countDocuments();
    
    // 获取最新数据时间
    const latestStockData = await StockData.findOne().sort({ timestamp: -1 });
    const latestSignal = await Signal.findOne().sort({ timestamp: -1 });
    
    res.json({
      status: 'healthy',
      database: dbStatus,
      statistics: {
        stockData: stockDataCount,
        signals: signalCount,
        models: modelCount
      },
      lastUpdated: {
        stockData: latestStockData?.timestamp,
        signal: latestSignal?.timestamp
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('健康检查失败:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 获取系统信息
router.get('/info', (req, res) => {
  res.json({
    name: '智盈AI后台服务',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});

module.exports = router;