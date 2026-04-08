const express = require('express');
const StockData = require('../models/StockData');
const router = express.Router();

// 获取股票实时数据
router.get('/realtime/:stockCode', async (req, res) => {
  try {
    const { stockCode } = req.params;
    const stockData = await StockData.findOne({ stockCode })
      .sort({ timestamp: -1 })
      .limit(1);
    
    if (!stockData) {
      return res.status(404).json({ error: '股票数据未找到' });
    }
    
    res.json(stockData);
  } catch (error) {
    console.error('获取股票数据失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 获取股票历史数据
router.get('/history/:stockCode', async (req, res) => {
  try {
    const { stockCode } = req.params;
    const { limit = 100, days = 7 } = req.query;
    
    const startTime = new Date();
    startTime.setDate(startTime.getDate() - parseInt(days));
    
    const historyData = await StockData.find({
      stockCode,
      timestamp: { $gte: startTime }
    })
    .sort({ timestamp: 1 })
    .limit(parseInt(limit));
    
    res.json(historyData);
  } catch (error) {
    console.error('获取股票历史数据失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 获取多个股票数据
router.post('/batch', async (req, res) => {
  try {
    const { stockCodes } = req.body;
    
    if (!Array.isArray(stockCodes)) {
      return res.status(400).json({ error: 'stockCodes必须是数组' });
    }
    
    const stockData = await StockData.find({
      stockCode: { $in: stockCodes }
    })
    .sort({ stockCode: 1, timestamp: -1 })
    .limit(stockCodes.length);
    
    // 按股票代码分组
    const result = {};
    stockData.forEach(data => {
      if (!result[data.stockCode]) {
        result[data.stockCode] = data;
      }
    });
    
    res.json(result);
  } catch (error) {
    console.error('批量获取股票数据失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 获取股票列表
router.get('/list', async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;
    
    // 获取最新的股票数据，避免重复
    const latestStockData = await StockData.aggregate([
      {
        $sort: { stockCode: 1, timestamp: -1 }
      },
      {
        $group: {
          _id: '$stockCode',
          latestData: { $first: '$$ROOT' }
        }
      },
      {
        $replaceRoot: { newRoot: '$latestData' }
      },
      {
        $skip: parseInt(offset)
      },
      {
        $limit: parseInt(limit)
      }
    ]);
    
    res.json(latestStockData);
  } catch (error) {
    console.error('获取股票列表失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

module.exports = router;