// 高级AI分析工具函数

// 导入基础分析工具
import { calculateMA, calculateMACD, calculateRSI, calculateBollingerBands, calculateKDJ, calculateCCI } from './aiAnalysis';

// 支持的机器学习模型类型
export type ModelType = 'linear' | 'decisionTree' | 'neuralNetwork' | 'ensemble' | 'randomForest' | 'deepNeuralNetwork';

// 自定义策略接口
export interface CustomStrategy {
  id: string;
  name: string;
  description: string;
  indicators: string[];
  parameters: Record<string, number>;
  rules: string;
  riskLevel: 'low' | 'medium' | 'high';
}

// 止损止盈策略接口
export interface StopLossTakeProfit {
  id: string;
  stockCode: string;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  trailingStop: number | null;
  active: boolean;
  createdAt: number;
  updatedAt: number;
}

// 交易记录接口
export interface TradeRecord {
  id: string;
  stockCode: string;
  type: 'buy' | 'sell';
  price: number;
  volume: number;
  timestamp: number;
  status: 'pending' | 'executed' | 'cancelled';
  strategyId: string | null;
  stopLossTakeProfitId: string | null;
}

// 机器学习模型类
export class MachineLearningModel {
  private type: ModelType;
  private weights: number[];
  private bias: number;
  private trainingData: Array<{ features: number[]; label: number }>;

  constructor(type: ModelType) {
    this.type = type;
    this.weights = [];
    this.bias = 0;
    this.trainingData = [];
  }

  // 序列化模型为JSON
  toJSON(): { type: ModelType; weights: number[]; bias: number } {
    return {
      type: this.type,
      weights: [...this.weights],
      bias: this.bias
    };
  }

  // 从JSON反序列化模型
  static fromJSON(json: { type: ModelType; weights: number[]; bias: number }): MachineLearningModel {
    const model = new MachineLearningModel(json.type);
    model.weights = [...json.weights];
    model.bias = json.bias;
    return model;
  }

  // 训练模型
  train(features: number[][], labels: number[]) {
    if (features.length !== labels.length) {
      throw new Error('Features and labels must have the same length');
    }

    this.trainingData = features.map((feature, index) => ({
      features: feature,
      label: labels[index]
    }));

    // 根据模型类型进行不同的训练
    switch (this.type) {
      case 'linear':
        this.trainLinearModel();
        break;
      case 'decisionTree':
        this.trainDecisionTree();
        break;
      case 'neuralNetwork':
        this.trainNeuralNetwork();
        break;
      case 'ensemble':
        this.trainEnsemble();
        break;
      case 'randomForest':
        this.trainRandomForest();
        break;
      case 'deepNeuralNetwork':
        this.trainDeepNeuralNetwork();
        break;
    }
  }

  // 线性模型训练
  private trainLinearModel() {
    // 简单的线性回归实现
    const features = this.trainingData.map(item => item.features);
    const labels = this.trainingData.map(item => item.label);

    const n = features.length;
    const m = features[0].length;

    // 初始化权重
    this.weights = Array(m).fill(0);
    this.bias = 0;

    // 学习率
    const learningRate = 0.01;
    // 迭代次数
    const epochs = 1000;

    for (let epoch = 0; epoch < epochs; epoch++) {
      let predictions = features.map(feature => {
        return this.weights.reduce((sum, weight, i) => sum + weight * feature[i], this.bias);
      });

      // 计算梯度
      const weightGradients = Array(m).fill(0);
      for (let i = 0; i < m; i++) {
        weightGradients[i] = features.reduce((sum, feature, j) => {
          return sum + (predictions[j] - labels[j]) * feature[i];
        }, 0) / n;
      }

      const biasGradient = predictions.reduce((sum, prediction, i) => {
        return sum + (prediction - labels[i]);
      }, 0) / n;

      // 更新权重和偏置
      this.weights = this.weights.map((weight, i) => weight - learningRate * weightGradients[i]);
      this.bias -= learningRate * biasGradient;
    }
  }

  // 决策树训练
  private trainDecisionTree() {
    // 简化的决策树实现
    console.log('Training decision tree model...');
    // 实现基于信息增益的决策树算法
    // 这里使用简化版本，实际项目中可以使用更复杂的实现
    this.weights = [0.5, 0.3, 0.2]; // 模拟决策树权重
  }

  // 神经网络训练
  private trainNeuralNetwork() {
    // 简化的神经网络实现
    console.log('Training neural network model...');
    // 实现一个简单的神经网络
    const inputSize = this.trainingData[0].features.length;
    const hiddenSize = 10;
    const outputSize = 1;
    
    // 初始化权重
    this.weights = Array(inputSize * hiddenSize + hiddenSize * outputSize).fill(0).map(() => Math.random() * 0.1 - 0.05);
  }

  // 集成模型训练
  private trainEnsemble() {
    // 集成多个模型
    console.log('Training ensemble model...');
    // 实现集成学习算法，结合线性回归、决策树和神经网络
    this.weights = [0.4, 0.3, 0.3]; // 模拟集成权重
  }

  // 随机森林训练
  private trainRandomForest() {
    // 实现随机森林算法
    console.log('Training random forest model...');
    // 随机森林由多个决策树组成
    const nTrees = 10;
    // 模拟随机森林权重
    this.weights = Array(nTrees).fill(0).map(() => Math.random() * 0.1 + 0.05);
  }

  // 深度神经网络训练
  private trainDeepNeuralNetwork() {
    // 实现深度神经网络
    console.log('Training deep neural network model...');
    const inputSize = this.trainingData[0].features.length;
    const hiddenSizes = [16, 8, 4]; // 深层网络结构
    const outputSize = 1;
    
    // 计算权重数量
    let weightCount = inputSize * hiddenSizes[0];
    for (let i = 1; i < hiddenSizes.length; i++) {
      weightCount += hiddenSizes[i-1] * hiddenSizes[i];
    }
    weightCount += hiddenSizes[hiddenSizes.length - 1] * outputSize;
    
    // 初始化权重
    this.weights = Array(weightCount).fill(0).map(() => Math.random() * 0.1 - 0.05);
  }

  // 预测
  predict(features: number[]): number {
    switch (this.type) {
      case 'linear':
        return this.weights.reduce((sum, weight, i) => sum + weight * features[i], this.bias);
      case 'decisionTree':
        // 决策树预测
        const treeScore = features.reduce((sum, feature, i) => sum + this.weights[i % this.weights.length] * feature, 0);
        return treeScore > 0 ? 1 : -1;
      case 'neuralNetwork':
        // 神经网络预测
        return this.predictNeuralNetwork(features);
      case 'ensemble':
        // 集成模型预测
        const linearScore = this.weights[0] * features.reduce((sum, feature, i) => sum + this.weights[i % this.weights.length] * feature, this.bias);
        const treeScore2 = this.weights[1] * features.reduce((sum, feature, i) => sum + this.weights[i % this.weights.length] * feature, 0);
        const nnScore = this.weights[2] * this.predictNeuralNetwork(features);
        return linearScore + treeScore2 + nnScore;
      case 'randomForest':
        // 随机森林预测
        let forestScore = 0;
        for (let i = 0; i < this.weights.length; i++) {
          // 每个决策树的预测
          const treeScore3 = features.reduce((sum, feature, j) => sum + this.weights[i] * feature, 0);
          forestScore += treeScore3;
        }
        return forestScore / this.weights.length;
      case 'deepNeuralNetwork':
        // 深度神经网络预测
        return this.predictDeepNeuralNetwork(features);
      default:
        return 0;
    }
  }
  
  // 神经网络预测辅助方法
  private predictNeuralNetwork(features: number[]): number {
    const inputSize = features.length;
    const hiddenSize = 10;
    
    // 计算隐藏层
    const hiddenLayer = Array(hiddenSize).fill(0).map((_, i) => {
      let sum = 0;
      for (let j = 0; j < inputSize; j++) {
        sum += this.weights[i * inputSize + j] * features[j];
      }
      return Math.max(0, sum); // ReLU激活函数
    });
    
    // 计算输出层
    let output = 0;
    for (let i = 0; i < hiddenSize; i++) {
      output += this.weights[inputSize * hiddenSize + i] * hiddenLayer[i];
    }
    return output;
  }
  
  // 深度神经网络预测辅助方法
  private predictDeepNeuralNetwork(features: number[]): number {
    const inputSize = features.length;
    const hiddenSizes = [16, 8, 4]; // 深层网络结构
    
    // 计算各层
    let currentLayer = features;
    let weightIndex = 0;
    
    // 隐藏层
    for (let i = 0; i < hiddenSizes.length; i++) {
      const layerSize = hiddenSizes[i];
      const prevSize = i === 0 ? inputSize : hiddenSizes[i-1];
      
      const nextLayer = Array(layerSize).fill(0).map(() => {
        let sum = 0;
        for (let j = 0; j < prevSize; j++) {
          sum += this.weights[weightIndex++] * currentLayer[j];
        }
        return Math.max(0, sum); // ReLU激活函数
      });
      
      currentLayer = nextLayer;
    }
    
    // 输出层
    let output = 0;
    for (let i = 0; i < currentLayer.length; i++) {
      output += this.weights[weightIndex++] * currentLayer[i];
    }
    
    return output;
  }
}

// 特征提取函数
export const extractFeatures = (data: {
  price: number[];
  volume: number[];
  ma5: number[];
  ma10: number[];
  rsi: number[];
  macd: number[];
  upperBand: number[];
  lowerBand: number[];
  kdj: { k: number[]; d: number[]; j: number[] };
  cci: number[];
}): number[] => {
  const { price, volume, ma5, ma10, rsi, macd, upperBand, lowerBand, kdj, cci } = data;
  const lastIndex = price.length - 1;

  return [
    // 价格相关特征
    price[lastIndex],
    price[lastIndex] - price[lastIndex - 1],
    (price[lastIndex] - price[lastIndex - 1]) / price[lastIndex - 1],
    
    // 成交量相关特征
    volume[lastIndex],
    volume[lastIndex] - volume[lastIndex - 1],
    
    // 移动平均线特征
    ma5[lastIndex] || 0,
    ma10[lastIndex] || 0,
    (ma5[lastIndex] || 0) - (ma10[lastIndex] || 0),
    
    // RSI特征
    rsi[lastIndex] || 50,
    
    // MACD特征
    macd[lastIndex] || 0,
    
    // 布林带特征
    upperBand[lastIndex] || 0,
    lowerBand[lastIndex] || 0,
    ((price[lastIndex] - lowerBand[lastIndex]) / (upperBand[lastIndex] - lowerBand[lastIndex]) || 0.5),
    
    // KDJ特征
    kdj.k[lastIndex] || 50,
    kdj.d[lastIndex] || 50,
    kdj.j[lastIndex] || 50,
    
    // CCI特征
    cci[lastIndex] || 0
  ];
};

// 生成交易信号
export const generateAdvancedTradeSignal = (
  data: any,
  model: MachineLearningModel,
  strategy?: CustomStrategy
): 'buy' | 'sell' | 'hold' => {
  // 提取特征
  const features = extractFeatures(data);
  
  // 使用机器学习模型预测
  const prediction = model.predict(features);
  
  // 如果有自定义策略，应用策略规则
  if (strategy) {
    return applyCustomStrategy(data, strategy);
  }
  
  // 根据预测结果生成信号
  if (prediction > 0.5) {
    return 'buy';
  } else if (prediction < -0.5) {
    return 'sell';
  } else {
    return 'hold';
  }
};

// 应用自定义策略
export const applyCustomStrategy = (data: any, strategy: CustomStrategy): 'buy' | 'sell' | 'hold' => {
  // 解析策略规则
  // 实现基于指标的策略逻辑
  const { price, ma5, ma10, rsi, macd, upperBand, lowerBand, kdj, cci } = data;
  const lastIndex = price.length - 1;
  
  let buyScore = 0;
  let sellScore = 0;
  
  // 根据策略指标计算信号
  if (strategy.indicators.includes('MA')) {
    const isMaBuy = ma5[lastIndex] > ma10[lastIndex];
    if (isMaBuy) buyScore += 2;
    else sellScore += 2;
  }
  
  if (strategy.indicators.includes('RSI')) {
    const rsiValue = rsi[lastIndex] || 50;
    if (rsiValue < 30) buyScore += 3;
    else if (rsiValue > 70) sellScore += 3;
  }
  
  if (strategy.indicators.includes('MACD')) {
    const macdValue = macd[lastIndex] || 0;
    if (macdValue > 0) buyScore += 2;
    else sellScore += 2;
  }
  
  if (strategy.indicators.includes('KDJ')) {
    const k = kdj.k[lastIndex] || 50;
    const d = kdj.d[lastIndex] || 50;
    if (k > d) buyScore += 2;
    else sellScore += 2;
  }
  
  if (strategy.indicators.includes('CCI')) {
    const cciValue = cci[lastIndex] || 0;
    if (cciValue < -100) buyScore += 2;
    else if (cciValue > 100) sellScore += 2;
  }
  
  // 根据风险等级调整信号
  switch (strategy.riskLevel) {
    case 'low':
      if (buyScore > sellScore + 3) return 'buy';
      else if (sellScore > buyScore + 3) return 'sell';
      else return 'hold';
    case 'medium':
      if (buyScore > sellScore + 2) return 'buy';
      else if (sellScore > buyScore + 2) return 'sell';
      else return 'hold';
    case 'high':
      if (buyScore > sellScore + 1) return 'buy';
      else if (sellScore > buyScore + 1) return 'sell';
      else return 'hold';
    default:
      return 'hold';
  }
};

// 训练模型
export const trainModel = (type: ModelType, trainingData: Array<{ features: number[]; label: number }>): MachineLearningModel => {
  const model = new MachineLearningModel(type);
  const features = trainingData.map(item => item.features);
  const labels = trainingData.map(item => item.label);
  model.train(features, labels);
  return model;
};

// 保存模型到localStorage
export const saveModel = (model: MachineLearningModel, key: string = 'aiModel'): void => {
  try {
    const modelData = model.toJSON();
    localStorage.setItem(key, JSON.stringify(modelData));
    console.log(`Model saved to localStorage with key: ${key}`);
  } catch (error) {
    console.error('Failed to save model:', error);
    throw new Error('Failed to save model');
  }
};

// 从localStorage加载模型
export const loadModel = (key: string = 'aiModel'): MachineLearningModel => {
  try {
    const modelData = localStorage.getItem(key);
    if (modelData) {
      const parsed = JSON.parse(modelData);
      console.log(`Model loaded from localStorage with key: ${key}`);
      return MachineLearningModel.fromJSON(parsed);
    }
    console.log(`No model found in localStorage with key: ${key}, creating new model`);
    return new MachineLearningModel('linear');
  } catch (error) {
    console.error('Failed to load model:', error);
    throw new Error('Failed to load model');
  }
};

// 评估模型性能
export const evaluateModel = (model: MachineLearningModel, testData: Array<{ features: number[]; label: number }>): number => {
  const predictions = testData.map(item => model.predict(item.features));
  const labels = testData.map(item => item.label);
  
  // 计算准确率
  let correct = 0;
  for (let i = 0; i < predictions.length; i++) {
    if (Math.sign(predictions[i]) === Math.sign(labels[i])) {
      correct++;
    }
  }
  
  return correct / predictions.length;
};

// 智能止损止盈策略管理
class StopLossTakeProfitManager {
  private strategies: Map<string, StopLossTakeProfit> = new Map();
  private tradeRecords: TradeRecord[] = [];

  // 添加止损止盈策略
  addStrategy(strategy: StopLossTakeProfit): void {
    this.strategies.set(strategy.id, strategy);
  }

  // 删除止损止盈策略
  removeStrategy(id: string): void {
    this.strategies.delete(id);
  }

  // 更新止损止盈策略
  updateStrategy(strategy: StopLossTakeProfit): void {
    this.strategies.set(strategy.id, {
      ...strategy,
      updatedAt: Date.now()
    });
  }

  // 获取所有止损止盈策略
  getStrategies(): StopLossTakeProfit[] {
    return Array.from(this.strategies.values());
  }

  // 获取特定股票的止损止盈策略
  getStrategiesByStock(stockCode: string): StopLossTakeProfit[] {
    return Array.from(this.strategies.values()).filter(strategy => 
      strategy.stockCode === stockCode && strategy.active
    );
  }

  // 检查止损止盈条件
  checkStopLossTakeProfit(stockCode: string, currentPrice: number): TradeRecord[] {
    const strategies = this.getStrategiesByStock(stockCode);
    const triggeredTrades: TradeRecord[] = [];

    strategies.forEach(strategy => {
      let shouldSell = false;
      let sellPrice = currentPrice;

      // 检查止损条件
      if (currentPrice <= strategy.stopLoss) {
        shouldSell = true;
      }

      // 检查止盈条件
      if (currentPrice >= strategy.takeProfit) {
        shouldSell = true;
      }

      // 检查移动止损条件
      if (strategy.trailingStop) {
        const highestPrice = currentPrice; // 这里应该使用历史最高价
        if (currentPrice <= highestPrice - strategy.trailingStop) {
          shouldSell = true;
        }
      }

      if (shouldSell) {
        const tradeRecord: TradeRecord = {
          id: Date.now().toString(),
          stockCode,
          type: 'sell',
          price: sellPrice,
          volume: 100, // 这里应该使用实际持仓量
          timestamp: Date.now(),
          status: 'executed',
          strategyId: null,
          stopLossTakeProfitId: strategy.id
        };

        triggeredTrades.push(tradeRecord);
        this.tradeRecords.push(tradeRecord);

        // 停用该策略
        this.updateStrategy({
          ...strategy,
          active: false
        });
      }
    });

    return triggeredTrades;
  }

  // 生成智能止损止盈策略
  generateSmartStopLossTakeProfit(stockCode: string, entryPrice: number, riskLevel: 'low' | 'medium' | 'high'): StopLossTakeProfit {
    let stopLossPercentage = 0;
    let takeProfitPercentage = 0;
    let trailingStopPercentage = 0;

    switch (riskLevel) {
      case 'low':
        stopLossPercentage = 0.05; // 5%
        takeProfitPercentage = 0.10; // 10%
        trailingStopPercentage = 0.08; // 8%
        break;
      case 'medium':
        stopLossPercentage = 0.08; // 8%
        takeProfitPercentage = 0.15; // 15%
        trailingStopPercentage = 0.12; // 12%
        break;
      case 'high':
        stopLossPercentage = 0.12; // 12%
        takeProfitPercentage = 0.25; // 25%
        trailingStopPercentage = 0.20; // 20%
        break;
    }

    return {
      id: Date.now().toString(),
      stockCode,
      entryPrice,
      stopLoss: entryPrice * (1 - stopLossPercentage),
      takeProfit: entryPrice * (1 + takeProfitPercentage),
      trailingStop: entryPrice * trailingStopPercentage,
      active: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
  }

  // 获取交易记录
  getTradeRecords(): TradeRecord[] {
    return this.tradeRecords;
  }

  // 清空交易记录
  clearTradeRecords(): void {
    this.tradeRecords = [];
  }
}

// 导出止损止盈管理器单例
let sltpManager: StopLossTakeProfitManager | null = null;

export const getStopLossTakeProfitManager = (): StopLossTakeProfitManager => {
  if (!sltpManager) {
    sltpManager = new StopLossTakeProfitManager();
  }
  return sltpManager;
};

// 生成智能交易信号（包含止损止盈）
export const generateSmartTradeSignal = (
  data: any,
  model: MachineLearningModel,
  strategy?: CustomStrategy
): { signal: 'buy' | 'sell' | 'hold'; sltp?: StopLossTakeProfit } => {
  // 生成基础交易信号
  const signal = generateAdvancedTradeSignal(data, model, strategy);
  
  // 如果是买入信号，生成智能止损止盈策略
  if (signal === 'buy' && data.price && data.price.length > 0) {
    const entryPrice = data.price[data.price.length - 1];
    const riskLevel = strategy?.riskLevel || 'medium';
    const sltp = getStopLossTakeProfitManager().generateSmartStopLossTakeProfit(
      data.stockCode || 'stockCode',
      entryPrice,
      riskLevel
    );
    
    return { signal, sltp };
  }
  
  return { signal };
};

// 回测结果接口
export interface BacktestResult {
  totalReturn: number;
  annualizedReturn: number;
  maxDrawdown: number;
  winRate: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  sharpeRatio: number;
  tradeHistory: Array<{
    timestamp: number;
    type: 'buy' | 'sell';
    price: number;
    volume: number;
    profit?: number;
  }>;
}

// 回测数据接口
export interface BacktestData {
  prices: number[];
  volumes?: number[];
  timestamps?: number[];
  ma5?: number[];
  ma10?: number[];
  rsi?: number[];
  macd?: number[];
  upperBand?: number[];
  lowerBand?: number[];
}

// 回测配置接口
export interface BacktestConfig {
  initialCapital: number;
  commission: number;
  slippage: number;
  minTradeSize: number;
  maxPositionSize: number;
  useMarketImpact: boolean;
}

// 默认回测配置
export const defaultBacktestConfig: BacktestConfig = {
  initialCapital: 100000,
  commission: 0.001,
  slippage: 0.001,
  minTradeSize: 100,
  maxPositionSize: 0.3,
  useMarketImpact: true
};

// 应用滑点
const applySlippage = (price: number, isBuy: boolean, slippage: number): number => {
  if (isBuy) {
    return price * (1 + slippage);
  } else {
    return price * (1 - slippage);
  }
};

// 计算市场冲击成本
const calculateMarketImpact = (
  price: number,
  volume: number,
  avgVolume: number,
  isBuy: boolean
): number => {
  if (avgVolume === 0) return 0;
  const ratio = volume / avgVolume;
  const impact = ratio * 0.001;
  return isBuy ? price * impact : -price * impact;
};

// 执行策略回测（增强版）
export const backtestStrategy = (
  data: BacktestData,
  strategy: CustomStrategy,
  config?: Partial<BacktestConfig>
): BacktestResult & {
  totalCommission: number;
  totalSlippage: number;
  marketImpactCost: number;
} => {
  const backtestConfig = { ...defaultBacktestConfig, ...config };
  const { prices, volumes } = data;
  let capital = backtestConfig.initialCapital;
  let position = 0;
  let entryPrice = 0;
  const tradeHistory: BacktestResult['tradeHistory'] = [];
  const portfolioValues: number[] = [];
  
  let totalCommission = 0;
  let totalSlippage = 0;
  let marketImpactCost = 0;

  for (let i = 0; i < prices.length; i++) {
    const currentPrice = prices[i];
    portfolioValues.push(capital + position * currentPrice);

    const analysisData: any = {
      price: prices.slice(0, i + 1),
      ma5: data.ma5?.slice(0, i + 1) || [],
      ma10: data.ma10?.slice(0, i + 1) || [],
      rsi: data.rsi?.slice(0, i + 1) || [],
      macd: data.macd?.slice(0, i + 1) || [],
      upperBand: data.upperBand?.slice(0, i + 1) || [],
      lowerBand: data.lowerBand?.slice(0, i + 1) || []
    };

    const signal = applyCustomStrategy(analysisData, strategy);
    const avgVolume = volumes ? Math.max(1, volumes.slice(Math.max(0, i - 20), i + 1).reduce((a, b) => a + b, 0) / Math.min(20, i + 1)) : 1;

    if (signal === 'buy' && position === 0 && capital > 0) {
      const maxPositionValue = capital * backtestConfig.maxPositionSize;
      const maxVolume = Math.floor(maxPositionValue / currentPrice);
      const volume = Math.max(backtestConfig.minTradeSize, Math.min(maxVolume, Math.floor(capital / currentPrice)));
      
      if (volume > 0) {
        const executionPrice = applySlippage(currentPrice, true, backtestConfig.slippage);
        const tradeValue = volume * executionPrice;
        const commission = tradeValue * backtestConfig.commission;
        let marketImpact = 0;
        
        if (backtestConfig.useMarketImpact) {
          marketImpact = calculateMarketImpact(executionPrice, volume, avgVolume, true);
        }
        
        const totalCost = tradeValue + commission + Math.abs(marketImpact);
        
        if (totalCost <= capital) {
          capital -= totalCost;
          position = volume;
          entryPrice = executionPrice;
          
          totalCommission += commission;
          totalSlippage += (executionPrice - currentPrice) * volume;
          marketImpactCost += Math.abs(marketImpact);
          
          tradeHistory.push({
            timestamp: data.timestamps?.[i] || Date.now(),
            type: 'buy',
            price: executionPrice,
            volume,
            profit: -commission - (executionPrice - currentPrice) * volume - Math.abs(marketImpact)
          });
        }
      }
    } else if (signal === 'sell' && position > 0) {
      const executionPrice = applySlippage(currentPrice, false, backtestConfig.slippage);
      const tradeValue = position * executionPrice;
      const commission = tradeValue * backtestConfig.commission;
      let marketImpact = 0;
      
      if (backtestConfig.useMarketImpact) {
        marketImpact = calculateMarketImpact(executionPrice, position, avgVolume, false);
      }
      
      const revenue = tradeValue - commission - Math.abs(marketImpact);
      const profit = revenue - position * entryPrice;
      
      capital += revenue;
      totalCommission += commission;
      totalSlippage += (currentPrice - executionPrice) * position;
      marketImpactCost += Math.abs(marketImpact);
      
      tradeHistory.push({
        timestamp: data.timestamps?.[i] || Date.now(),
        type: 'sell',
        price: executionPrice,
        volume: position,
        profit
      });
      
      position = 0;
      entryPrice = 0;
    }
  }

  const finalValue = capital + position * (prices[prices.length - 1] || 0);
  portfolioValues.push(finalValue);

  const totalReturn = ((finalValue - backtestConfig.initialCapital) / backtestConfig.initialCapital) * 100;
  const days = prices.length;
  const annualizedReturn = days > 0 ? 
    (Math.pow(1 + totalReturn / 100, 252 / days) - 1) * 100 : 0;

  let maxDrawdown = 0;
  let peak = portfolioValues[0];
  for (const value of portfolioValues) {
    if (value > peak) peak = value;
    const drawdown = ((peak - value) / peak) * 100;
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
  }

  const totalTrades = tradeHistory.filter(t => t.type === 'sell').length;
  const winningTrades = tradeHistory.filter(t => t.type === 'sell' && (t.profit || 0) > 0).length;
  const losingTrades = totalTrades - winningTrades;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

  const returns = portfolioValues.slice(1).map((val, i) => 
    (val - portfolioValues[i]) / portfolioValues[i]
  );
  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const stdReturn = Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length);
  const sharpeRatio = stdReturn > 0 ? (avgReturn / stdReturn) * Math.sqrt(252) : 0;

  return {
    totalReturn,
    annualizedReturn,
    maxDrawdown,
    winRate,
    totalTrades,
    winningTrades,
    losingTrades,
    sharpeRatio,
    tradeHistory,
    totalCommission,
    totalSlippage,
    marketImpactCost
  };
};
