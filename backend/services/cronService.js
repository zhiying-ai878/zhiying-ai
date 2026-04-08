const { CronJob } = require('cron');
const stockDataService = require('./stockDataService');
const StockData = require('../models/StockData');
const Signal = require('../models/Signal');
const AIModel = require('../models/AIModel');

class CronService {
  constructor() {
    this.jobs = [];
    this.monitoredStocks = [
      '600000', '600519', '601318', '600276', '601888',
      '000001', '000002', '000858', '002594', '300750'
    ];
  }

  start() {
    this.startStockDataFetchJob();
    this.startSignalGenerationJob();
    this.startModelTrainingJob();
    this.startDataCleanupJob();
    
    console.log('定时任务已启动');
  }

  startStockDataFetchJob() {
    // 每个交易日的交易时间内，每5分钟获取一次数据
    const job = new CronJob('*/5 9-11,13-15 * * 1-5', async () => {
      console.log('开始获取股票数据...');
      try {
        const results = await stockDataService.fetchBatchStockData(this.monitoredStocks);
        
        // 保存数据
        for (const data of results) {
          await stockDataService.saveStockData(data);
        }
        
        console.log(`成功获取并保存 ${results.length} 只股票的数据`);
      } catch (error) {
        console.error('获取股票数据失败:', error);
      }
    });
    
    job.start();
    this.jobs.push(job);
  }

  startSignalGenerationJob() {
    // 每个交易日的交易时间内，每10分钟生成一次信号
    const job = new CronJob('*/10 9-11,13-15 * * 1-5', async () => {
      console.log('开始生成交易信号...');
      try {
        await this.generateSignals();
      } catch (error) {
        console.error('生成信号失败:', error);
      }
    });
    
    job.start();
    this.jobs.push(job);
  }

  startModelTrainingJob() {
    // 每个交易日收盘后训练模型
    const job = new CronJob('30 15 * * 1-5', async () => {
      console.log('开始训练AI模型...');
      try {
        await this.trainModel();
      } catch (error) {
        console.error('训练模型失败:', error);
      }
    });
    
    job.start();
    this.jobs.push(job);
  }

  startDataCleanupJob() {
    // 每天凌晨2点清理旧数据
    const job = new CronJob('0 2 * * *', async () => {
      console.log('开始清理旧数据...');
      try {
        await this.cleanupOldData();
      } catch (error) {
        console.error('清理旧数据失败:', error);
      }
    });
    
    job.start();
    this.jobs.push(job);
  }

  async generateSignals() {
    try {
      // 获取最新的股票数据
      const latestData = await StockData.aggregate([
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
        }
      ]);

      // 获取当前活跃模型
      const currentModel = await AIModel.findOne({ status: 'active' });
      
      for (const stockData of latestData) {
        // 使用AI模型生成信号
        const signal = this.generateSignal(stockData, currentModel);
        
        if (signal) {
          await signal.save();
          console.log(`生成信号: ${signal.type} - ${stockData.stockName}(${stockData.stockCode})`);
        }
      }
    } catch (error) {
      console.error('生成信号失败:', error);
      throw error;
    }
  }

  generateSignal(stockData, model) {
    // 这里使用简化的信号生成逻辑
    // 实际应用中应该使用AI模型进行预测
    const changePercent = stockData.changePercent;
    
    if (changePercent > 5) {
      // 买入信号
      return new Signal({
        stockCode: stockData.stockCode,
        stockName: stockData.stockName,
        type: 'buy',
        score: Math.min(95, 80 + changePercent),
        confidence: Math.min(0.95, 0.7 + changePercent / 20),
        reason: `股价大幅上涨 ${changePercent.toFixed(2)}%，主力资金流入`,
        price: stockData.currentPrice,
        targetPrice: stockData.currentPrice * 1.1,
        stopLossPrice: stockData.currentPrice * 0.95,
        timestamp: new Date(),
        modelVersion: model ? model.modelId : 'v1.0.0'
      });
    } else if (changePercent < -3) {
      // 卖出信号
      return new Signal({
        stockCode: stockData.stockCode,
        stockName: stockData.stockName,
        type: 'sell',
        score: Math.min(90, 70 - changePercent),
        confidence: Math.min(0.9, 0.6 - changePercent / 30),
        reason: `股价下跌 ${Math.abs(changePercent).toFixed(2)}%，建议止损`,
        price: stockData.currentPrice,
        timestamp: new Date(),
        modelVersion: model ? model.modelId : 'v1.0.0'
      });
    }
    
    return null;
  }

  async trainModel() {
    try {
      // 获取历史数据用于训练
      const startTime = new Date();
      startTime.setDate(startTime.getDate() - 30);
      
      const trainingData = await StockData.find({
        timestamp: { $gte: startTime }
      });
      
      // 获取当前模型
      const currentModel = await AIModel.findOne({ status: 'active' });
      
      // 模拟模型训练
      const newModelData = this.trainNeuralNetwork(trainingData, currentModel);
      
      // 创建新模型版本
      const newVersion = currentModel ? currentModel.version + 1 : 1;
      const newModel = new AIModel({
        modelId: `model_v${newVersion}`,
        modelType: 'deep_neural_network',
        modelData: newModelData,
        trainingData: trainingData.slice(-100), // 保存最近100条训练数据
        performance: {
          accuracy: Math.random() * 0.1 + 0.85, // 模拟准确率 85-95%
          f1Score: Math.random() * 0.1 + 0.8,   // 模拟F1分数 80-90%
          trainingTime: new Date() - startTime
        },
        version: newVersion,
        description: `基于30天历史数据训练的模型版本 ${newVersion}`,
        status: 'active'
      });
      
      // 将旧模型设置为非活跃
      if (currentModel) {
        await AIModel.findByIdAndUpdate(currentModel._id, { status: 'inactive' });
      }
      
      await newModel.save();
      console.log(`新模型训练完成，版本: ${newVersion}`);
    } catch (error) {
      console.error('训练模型失败:', error);
      throw error;
    }
  }

  trainNeuralNetwork(trainingData, currentModel) {
    // 简化的神经网络训练模拟
    return {
      weights: currentModel 
        ? currentModel.modelData.weights.map(w => w + (Math.random() - 0.5) * 0.1)
        : Array(10).fill().map(() => Math.random() * 2 - 1),
      biases: currentModel
        ? currentModel.modelData.biases.map(b => b + (Math.random() - 0.5) * 0.1)
        : Array(5).fill().map(() => Math.random() * 2 - 1),
      trainingParams: {
        learningRate: 0.01,
        epochs: 100,
        loss: Math.random() * 0.1 + 0.05
      }
    };
  }

  async cleanupOldData() {
    try {
      // 删除30天前的股票数据
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const stockDataResult = await StockData.deleteMany({
        timestamp: { $lt: thirtyDaysAgo }
      });
      
      // 删除60天前的信号数据
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
      
      const signalResult = await Signal.deleteMany({
        timestamp: { $lt: sixtyDaysAgo }
      });
      
      console.log(`清理完成: 删除了 ${stockDataResult.deletedCount} 条股票数据, ${signalResult.deletedCount} 条信号数据`);
    } catch (error) {
      console.error('清理旧数据失败:', error);
      throw error;
    }
  }

  stop() {
    this.jobs.forEach(job => job.stop());
    this.jobs = [];
    console.log('定时任务已停止');
  }
}

module.exports = new CronService();