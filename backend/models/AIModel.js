const mongoose = require('mongoose');

const aiModelSchema = new mongoose.Schema({
  modelId: {
    type: String,
    required: true,
    unique: true
  },
  modelType: {
    type: String,
    enum: ['deep_neural_network', 'machine_learning', 'ensemble'],
    default: 'deep_neural_network'
  },
  modelData: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  trainingData: {
    type: [mongoose.Schema.Types.Mixed],
    default: []
  },
  performance: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  version: {
    type: Number,
    required: true,
    default: 1
  },
  lastUpdated: {
    type: Date,
    required: true,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'training'],
    default: 'active'
  },
  description: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AIModel', aiModelSchema);