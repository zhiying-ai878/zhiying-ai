const mongoose = require('mongoose');

const marketStateSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true
  },
  isTradingDay: {
    type: Boolean,
    required: true
  },
  marketStatus: {
    type: String,
    enum: ['open', 'closed', 'pre-market', 'after-hours'],
    required: true
  },
  startTime: {
    type: Date
  },
  endTime: {
    type: Date
  },
  totalVolume: {
    type: Number
  },
  totalAmount: {
    type: Number
  },
  advanceCount: {
    type: Number
  },
  declineCount: {
    type: Number
  },
  flatCount: {
    type: Number
  },
  indexData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('MarketState', marketStateSchema);