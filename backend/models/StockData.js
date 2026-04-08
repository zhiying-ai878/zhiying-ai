const mongoose = require('mongoose');

const stockDataSchema = new mongoose.Schema({
  stockCode: {
    type: String,
    required: true,
    index: true
  },
  stockName: {
    type: String,
    required: true
  },
  currentPrice: {
    type: Number,
    required: true
  },
  change: {
    type: Number
  },
  changePercent: {
    type: Number
  },
  volume: {
    type: Number
  },
  amount: {
    type: Number
  },
  openPrice: {
    type: Number
  },
  highPrice: {
    type: Number
  },
  lowPrice: {
    type: Number
  },
  mainForceNetFlow: {
    type: Number
  },
  totalNetFlow: {
    type: Number
  },
  superLargeOrderFlow: {
    type: Number
  },
  largeOrderFlow: {
    type: Number
  },
  mediumOrderFlow: {
    type: Number
  },
  smallOrderFlow: {
    type: Number
  },
  volumeAmplification: {
    type: Number
  },
  turnoverRate: {
    type: Number
  },
  timestamp: {
    type: Date,
    required: true,
    index: true
  },
  source: {
    type: String,
    enum: ['tencent', 'eastmoney', 'sina', '同花顺'],
    default: 'tencent'
  }
}, {
  timestamps: true
});

// 创建索引
stockDataSchema.index({ stockCode: 1, timestamp: 1 });

module.exports = mongoose.model('StockData', stockDataSchema);