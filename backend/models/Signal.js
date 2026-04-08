const mongoose = require('mongoose');

const signalSchema = new mongoose.Schema({
  stockCode: {
    type: String,
    required: true,
    index: true
  },
  stockName: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['buy', 'sell'],
    required: true,
    index: true
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  reason: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  targetPrice: {
    type: Number
  },
  stopLossPrice: {
    type: Number
  },
  isAuctionPeriod: {
    type: Boolean,
    default: false
  },
  mainForceFlow: {
    type: Number
  },
  mainForceRatio: {
    type: Number
  },
  volumeAmplification: {
    type: Number
  },
  turnoverRate: {
    type: Number
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  timestamp: {
    type: Date,
    required: true,
    index: true
  },
  modelVersion: {
    type: String,
    default: '1.0.0'
  }
}, {
  timestamps: true
});

// 创建索引
signalSchema.index({ type: 1, timestamp: -1 });
signalSchema.index({ stockCode: 1, type: 1, timestamp: -1 });

module.exports = mongoose.model('Signal', signalSchema);