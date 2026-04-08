const express = require('express');
const Signal = require('../models/Signal');
const router = express.Router();

// 获取最新信号
router.get('/latest', async (req, res) => {
  try {
    const { type, limit = 20 } = req.query;
    
    let query = {};
    if (type) {
      query.type = type;
    }
    
    const signals = await Signal.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));
    
    res.json(signals);
  } catch (error) {
    console.error('获取最新信号失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 获取未读信号
router.get('/unread', async (req, res) => {
  try {
    const unreadSignals = await Signal.find({ isRead: false })
      .sort({ timestamp: -1 });
    
    res.json(unreadSignals);
  } catch (error) {
    console.error('获取未读信号失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 标记信号为已读
router.put('/:signalId/read', async (req, res) => {
  try {
    const { signalId } = req.params;
    
    const updatedSignal = await Signal.findByIdAndUpdate(
      signalId,
      { isRead: true },
      { new: true }
    );
    
    if (!updatedSignal) {
      return res.status(404).json({ error: '信号未找到' });
    }
    
    res.json(updatedSignal);
  } catch (error) {
    console.error('标记信号为已读失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 获取股票信号历史
router.get('/stock/:stockCode', async (req, res) => {
  try {
    const { stockCode } = req.params;
    const { limit = 50 } = req.query;
    
    const signals = await Signal.find({ stockCode })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));
    
    res.json(signals);
  } catch (error) {
    console.error('获取股票信号历史失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 获取信号统计
router.get('/stats', async (req, res) => {
  try {
    const stats = await Signal.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          avgScore: { $avg: '$score' },
          avgConfidence: { $avg: '$confidence' }
        }
      }
    ]);
    
    const unreadCount = await Signal.countDocuments({ isRead: false });
    
    res.json({
      stats,
      unreadCount
    });
  } catch (error) {
    console.error('获取信号统计失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

module.exports = router;