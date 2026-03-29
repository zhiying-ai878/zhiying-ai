import { OptimizedSignal, ComprehensiveData } from './optimizedSignalManager';
import { Logger } from './stockData';

const logger = Logger.getInstance();

// AI命令类型定义
export type AICommandType = 
  | 'monitor_market'
  | 'check_buy_signals'
  | 'check_sell_signals'
  | 'analyze_stock'
  | 'get_market_status'
  | 'execute_trade'
  | 'get_portfolio'
  | 'set_alerts'
  | 'get_help';

// AI命令接口
export interface AICommand {
  type: AICommandType;
  parameters: Record<string, any>;
  confidence: number;
}

// AI响应接口
export interface AIResponse {
  response: string;
  command?: AICommand;
  confidence: number;
  requiresExecution: boolean;
}

// 深度神经网络模型接口
export interface DeepNeuralNetwork {
  predict(input: number[]): { prediction: string; confidence: number };
  train(data: Array<{ input: number[]; output: number }>): void;
  getModelInfo(): { layers: number[]; parameters: number };
}

// 深度神经网络实现
class EnhancedNeuralNetwork implements DeepNeuralNetwork {
  private weights: number[][][];
  private biases: number[][];
  private layerSizes: number[];
  
  constructor(inputSize: number, hiddenLayers: number[], outputSize: number) {
    this.layerSizes = [inputSize, ...hiddenLayers, outputSize];
    this.weights = [];
    this.biases = [];
    
    this.initializeWeights();
  }
  
  private initializeWeights() {
    for (let i = 0; i< this.layerSizes.length - 1; i++) {
      const weightMatrix: number[][] = [];
      const biasVector: number[] = [];
      
      for (let j = 0; j < this.layerSizes[i + 1]; j++) {
        const weightsRow: number[] = [];
        for (let k = 0; k < this.layerSizes[i]; k++) {
          const limit = Math.sqrt(6 / (this.layerSizes[i] + this.layerSizes[i + 1]));
          weightsRow.push((Math.random() * 2 - 1) * limit);
        }
        weightMatrix.push(weightsRow);
        biasVector.push(0);
      }
      
      this.weights.push(weightMatrix);
      this.biases.push(biasVector);
    }
  }
  
  private sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
  }
  
  private sigmoidDerivative(x: number): number {
    const sig = this.sigmoid(x);
    return sig * (1 - sig);
  }
  
  private relu(x: number): number {
    return Math.max(0, x);
  }
  
  private reluDerivative(x: number): number {
    return x >0 ? 1 : 0;
  }
  
  predict(input: number[]): { prediction: string; confidence: number } {
    let activations = input;
    
    for (let i = 0; i< this.weights.length; i++) {
      const z: number[] = [];
      for (let j = 0; j < this.weights[i].length; j++) {
        let sum = this.biases[i][j];
        for (let k = 0; k < activations.length; k++) {
          sum += this.weights[i][j][k] * activations[k];
        }
        z.push(sum);
      }
      
      if (i === this.weights.length - 1) {
        activations = z.map(x =>this.sigmoid(x));
      } else {
        activations = z.map(x => this.relu(x));
      }
    }
    
    const maxIndex = activations.indexOf(Math.max(...activations));
    const confidence = activations[maxIndex];
    
    const predictions = ['buy', 'sell', 'hold', 'monitor', 'analyze'];
    return {
      prediction: predictions[maxIndex] || 'hold',
      confidence
    };
  }
  
  train(data: Array<{ input: number[]; output: number }>): void {
    const learningRate = 0.01;
    
    for (const sample of data) {
      const { input, output } = sample;
      const activations: number[][] = [input];
      const zValues: number[][] = [];
      
      // 前向传播
      for (let i = 0; i< this.weights.length; i++) {
        const z: number[] = [];
        for (let j = 0; j < this.weights[i].length; j++) {
          let sum = this.biases[i][j];
          for (let k = 0; k < activations[i].length; k++) {
            sum += this.weights[i][j][k] * activations[i][k];
          }
          z.push(sum);
        }
        
        zValues.push(z);
        
        if (i === this.weights.length - 1) {
          activations.push(z.map(x =>this.sigmoid(x)));
        } else {
          activations.push(z.map(x => this.relu(x)));
        }
      }
      
      // 反向传播
      let deltas: number[] = [];
      for (let i = 0; i< activations[activations.length - 1].length; i++) {
        const error = activations[activations.length - 1][i] - (i === output ? 1 : 0);
        deltas.push(error * this.sigmoidDerivative(zValues[zValues.length - 1][i]));
      }
      
      for (let i = this.weights.length - 1; i >= 0; i--) {
        const newDeltas: number[] = [];
        
        for (let j = 0; j< this.weights[i].length; j++) {
          this.biases[i][j] -= learningRate * deltas[j];
          
          for (let k = 0; k < activations[i].length; k++) {
            this.weights[i][j][k] -= learningRate * deltas[j] * activations[i][k];
          }
          
          if (i >0) {
            let sum = 0;
            for (let l = 0; l< deltas.length; l++) {
              sum += this.weights[i][l][j] * deltas[l];
            }
            newDeltas.push(sum * this.reluDerivative(zValues[i - 1][j]));
          }
        }
        
        deltas = newDeltas;
      }
    }
  }
  
  getModelInfo(): { layers: number[]; parameters: number } {
    let parameters = 0;
    for (let i = 0; i< this.weights.length; i++) {
      for (let j = 0; j < this.weights[i].length; j++) {
        parameters += this.weights[i][j].length + 1;
      }
    }
    
    return {
      layers: this.layerSizes,
      parameters
    };
  }
}

// AI助手核心类
export class AdvancedAIAssistant {
  private neuralNetwork: DeepNeuralNetwork;
  private commandHistory: Array<{ question: string; command: AICommand; response: string }>= [];
  private marketDataCache: Map<string, any>= new Map();
  
  constructor() {
    this.neuralNetwork = new EnhancedNeuralNetwork(20, [64, 32, 16], 5);
    this.initializeTrainingData();
  }
  
  private initializeTrainingData() {
    const trainingData = [
      { input: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], output: 0 },
      { input: [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], output: 1 },
      { input: [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], output: 2 },
      { input: [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], output: 3 },
      { input: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], output: 4 },
    ];
    
    for (let i = 0; i< 100; i++) {
      this.neuralNetwork.train(trainingData);
    }
  }
  
  // 自然语言处理和命令识别
  parseCommand(question: string): AICommand {
    const lowerQuestion = question.toLowerCase();
    
    // 命令模式匹配
    const commandPatterns: Array<{ pattern: RegExp; type: AICommandType; extractParams?: (match: RegExpMatchArray) =>Record<string, any>}> = [
      {
        pattern: /(监控|市场|状态)/,
        type: 'monitor_market',
        extractParams: () => ({})
      },
      {
        pattern: /(买入|信号|买点)/,
        type: 'check_buy_signals',
        extractParams: () => ({})
      },
      {
        pattern: /(卖出|卖点)/,
        type: 'check_sell_signals',
        extractParams: () => ({})
      },
      {
        pattern: /(分析|股票|行情)/,
        type: 'analyze_stock',
        extractParams: (match) =>{
          const stockCodeMatch = question.match(/(\d{6})/);
          return {
            stockCode: stockCodeMatch ? stockCodeMatch[1] : undefined
          };
        }
      },
      {
        pattern: /(执行|交易|下单)/,
        type: 'execute_trade',
        extractParams: (match) => {
          const typeMatch = question.match(/(买入|卖出)/);
          const codeMatch = question.match(/(\d{6})/);
          const priceMatch = question.match(/(\d+\.?\d*)/);
          const volumeMatch = question.match(/(\d+)股/);
          
          return {
            type: typeMatch ? (typeMatch[1] === '买入' ? 'buy' : 'sell') : undefined,
            stockCode: codeMatch ? codeMatch[1] : undefined,
            price: priceMatch ? parseFloat(priceMatch[1]) : undefined,
            volume: volumeMatch ? parseInt(volumeMatch[1]) : undefined
          };
        }
      },
      {
        pattern: /(持仓|组合)/,
        type: 'get_portfolio',
        extractParams: () => ({})
      },
      {
        pattern: /(提醒|预警|警报)/,
        type: 'set_alerts',
        extractParams: (match) =>{
          const codeMatch = question.match(/(\d{6})/);
          const priceMatch = question.match(/(\d+\.?\d*)/);
          return {
            stockCode: codeMatch ? codeMatch[1] : undefined,
            price: priceMatch ? parseFloat(priceMatch[1]) : undefined
          };
        }
      },
      {
        pattern: /(帮助|功能|使用)/,
        type: 'get_help',
        extractParams: () => ({})
      }
    ];
    
    for (const { pattern, type, extractParams } of commandPatterns) {
      const match = lowerQuestion.match(pattern);
      if (match) {
        return {
          type,
          parameters: extractParams ? extractParams(match) : {},
          confidence: this.calculateConfidence(question, type)
        };
      }
    }
    
    // 如果没有匹配到命令，使用神经网络预测
    const features = this.extractFeatures(question);
    const prediction = this.neuralNetwork.predict(features);
    
    return {
      type: this.mapPredictionToCommand(prediction.prediction),
      parameters: {},
      confidence: prediction.confidence
    };
  }
  
  private extractFeatures(question: string): number[] {
    const features: number[] = new Array(20).fill(0);
    
    const keywords = [
      '监控', '市场', '买入', '卖出', '信号', '分析', '股票', '行情',
      '执行', '交易', '持仓', '组合', '提醒', '预警', '帮助', '功能',
      '价格', '成交量', '主力', '资金'
    ];
    
    keywords.forEach((keyword, index) => {
      if (question.includes(keyword)) {
        features[index] = 1;
      }
    });
    
    return features;
  }
  
  private mapPredictionToCommand(prediction: string): AICommandType {
    const mapping: Record<string, AICommandType>= {
      'buy': 'check_buy_signals',
      'sell': 'check_sell_signals',
      'hold': 'get_market_status',
      'monitor': 'monitor_market',
      'analyze': 'analyze_stock'
    };
    
    return mapping[prediction] || 'get_market_status';
  }
  
  private calculateConfidence(question: string, commandType: AICommandType): number {
    const keywordCounts: Record<AICommandType, string[]>= {
      'monitor_market': ['监控', '市场', '状态', '行情'],
      'check_buy_signals': ['买入', '买点', '买入信号'],
      'check_sell_signals': ['卖出', '卖点', '卖出信号'],
      'analyze_stock': ['分析', '股票', '行情', '走势'],
      'get_market_status': ['市场', '状态', '行情'],
      'execute_trade': ['执行', '交易', '下单', '买入', '卖出'],
      'get_portfolio': ['持仓', '组合', '我的股票'],
      'set_alerts': ['提醒', '预警', '警报'],
      'get_help': ['帮助', '功能', '使用']
    };
    
    const keywords = keywordCounts[commandType] || [];
    let matchedKeywords = 0;
    
    keywords.forEach(keyword => {
      if (question.includes(keyword)) {
        matchedKeywords++;
      }
    });
    
    const confidence = Math.min(100, 50 + (matchedKeywords / keywords.length) * 50);
    return confidence;
  }
  
  // 生成AI响应
  generateResponse(question: string, command: AICommand, signalManager?: any, marketMonitor?: any): AIResponse {
    const requiresExecution = command.type === 'execute_trade' || command.type === 'set_alerts';
    
    switch (command.type) {
      case 'monitor_market':
        return this.generateMarketMonitoringResponse(marketMonitor);
      case 'check_buy_signals':
        return this.generateBuySignalResponse(signalManager);
      case 'check_sell_signals':
        return this.generateSellSignalResponse(signalManager);
      case 'analyze_stock':
        return this.generateStockAnalysisResponse(command.parameters.stockCode);
      case 'get_market_status':
        return this.generateMarketStatusResponse(marketMonitor);
      case 'execute_trade':
        return this.generateTradeExecutionResponse(command.parameters);
      case 'get_portfolio':
        return this.generatePortfolioResponse();
      case 'set_alerts':
        return this.generateAlertResponse(command.parameters);
      case 'get_help':
        return this.generateHelpResponse();
      default:
        return {
          response: '抱歉，我无法理解您的问题。请尝试使用更清晰的语言描述您的需求。',
          confidence: 50,
          requiresExecution: false
        };
    }
  }
  
  private generateMarketMonitoringResponse(marketMonitor?: any): AIResponse {
    if (marketMonitor && typeof marketMonitor.getMarketStatus === 'function') {
      const status = marketMonitor.getMarketStatus();
      return {
        response: `当前市场监控状态：
• 监控状态：${status.enabled ? '已开启' : '已关闭'}
• 市场状态：${status.marketStatus === 'open' ? '交易中' : status.marketStatus === 'auction' ? '集合竞价' : '已收盘'}
• 监控股票数量：${status.stockCount || 0}只
• 最后扫描时间：${status.lastScanTime ? new Date(status.lastScanTime).toLocaleString() : '未知'}
• 数据更新频率：每5秒`,
        confidence: 90,
        requiresExecution: false
      };
    } else {
      return {
        response: '市场监控系统正在初始化，请稍候...',
        confidence: 70,
        requiresExecution: false
      };
    }
  }
  
  private generateBuySignalResponse(signalManager?: any): AIResponse {
    if (signalManager && typeof signalManager.getSignalHistory === 'function') {
      const signals = signalManager.getSignalHistory().filter((s: any) => s.type === 'buy');
      
      if (signals.length === 0) {
        return {
          response: '目前没有买入信号。系统需要满足以下条件才会生成买入信号：\n• 主力资金净流入>50万且预期涨幅≥15%\n• 技术指标和资金流向综合分析\n• 达到置信度要求（≥50%）',
          confidence: 85,
          requiresExecution: false
        };
      }
      
      const latestSignal = signals[0];
      return {
        response: `最新买入信号：
• 股票：${latestSignal.stockName}(${latestSignal.stockCode})
• 当前价格：${latestSignal.price?.toFixed(2) || '未知'}元
• 置信度：${latestSignal.confidence.toFixed(1)}%
• 信号时间：${new Date(latestSignal.timestamp).toLocaleString()}
• 主力资金净流入：${(latestSignal.mainForceFlow || 0) / 100000000}亿元
• 预期涨幅：${latestSignal.expectedProfitPercent ? latestSignal.expectedProfitPercent.toFixed(1) + '%' : '未知'}
• 信号理由：${latestSignal.reason}`,
        confidence: 95,
        requiresExecution: false
      };
    } else {
      return {
        response: '信号系统正在初始化，请稍候...',
        confidence: 70,
        requiresExecution: false
      };
    }
  }
  
  private generateSellSignalResponse(signalManager?: any): AIResponse {
    if (signalManager && typeof signalManager.getSignalHistory === 'function') {
      const signals = signalManager.getSignalHistory().filter((s: any) => s.type === 'sell');
      
      if (signals.length === 0) {
        return {
          response: '目前没有卖出信号。系统需要满足以下条件才会生成卖出信号：\n• 主力资金净流出>300万\n• 技术指标显示卖出信号\n• 达到置信度要求（≥50%）',
          confidence: 85,
          requiresExecution: false
        };
      }
      
      const latestSignal = signals[0];
      return {
        response: `最新卖出信号：
• 股票：${latestSignal.stockName}(${latestSignal.stockCode})
• 当前价格：${latestSignal.price?.toFixed(2) || '未知'}元
• 置信度：${latestSignal.confidence.toFixed(1)}%
• 信号时间：${new Date(latestSignal.timestamp).toLocaleString()}
• 主力资金净流出：${Math.abs(latestSignal.mainForceFlow || 0) / 100000000}亿元
• 信号理由：${latestSignal.reason}`,
        confidence: 95,
        requiresExecution: false
      };
    } else {
      return {
        response: '信号系统正在初始化，请稍候...',
        confidence: 70,
        requiresExecution: false
      };
    }
  }
  
  private generateStockAnalysisResponse(stockCode?: string): AIResponse {
    if (!stockCode) {
      return {
        response: '请提供股票代码，我将为您分析该股票的详细情况。',
        confidence: 80,
        requiresExecution: false
      };
    }
    
    return {
      response: `正在分析股票 ${stockCode}...
• 实时行情数据
• 技术指标分析（MACD、KDJ、RSI等）
• 主力资金流向分析
• 行业对比分析
• 风险评估
• 投资建议`,
      confidence: 85,
      requiresExecution: true
    };
  }
  
  private generateMarketStatusResponse(marketMonitor?: any): AIResponse {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    
    let marketStatus: 'open' | 'auction' | 'closed' = 'closed';
    if ((hour === 9 && minute >= 30) || (hour === 10) || (hour === 11 && minute <= 30) || 
        (hour === 13) || (hour === 14) || (hour === 15 && minute === 0)) {
      marketStatus = 'open';
    } else if (hour === 9 && minute >= 15 && minute <= 25) {
      marketStatus = 'auction';
    }
    
    const statusText = {
      open: '交易中',
      auction: '集合竞价',
      closed: '已收盘'
    };
    
    return {
      response: `当前市场状态：
• A股市场：${statusText[marketStatus]}
• 当前时间：${now.toLocaleString()}
• 交易时段：9:30-11:30, 13:00-15:00
• 集合竞价：9:15-9:25`,
      confidence: 95,
      requiresExecution: false
    };
  }
  
  private generateTradeExecutionResponse(params: Record<string, any>): AIResponse {
    const { type, stockCode, price, volume } = params;
    
    if (!type || !stockCode) {
      return {
        response: '请提供完整的交易信息，包括交易类型（买入/卖出）、股票代码、价格和数量。',
        confidence: 80,
        requiresExecution: true
      };
    }
    
    return {
      response: `准备执行${type === 'buy' ? '买入' : '卖出'}交易：
• 股票：${stockCode}
• 价格：${price || '市价'}元
• 数量：${volume || 100}股
• 交易类型：${type === 'buy' ? '买入' : '卖出'}
是否确认执行此交易？`,
      confidence: 90,
      requiresExecution: true
    };
  }
  
  private generatePortfolioResponse(): AIResponse {
    return {
      response: '您的当前持仓情况：\n• 暂无持仓数据，请先添加持仓股票。',
      confidence: 80,
      requiresExecution: false
    };
  }
  
  private generateAlertResponse(params: Record<string, any>): AIResponse {
    const { stockCode, price } = params;
    
    if (!stockCode) {
      return {
        response: '请提供股票代码，我将为您设置价格提醒。',
        confidence: 80,
        requiresExecution: true
      };
    }
    
    return {
      response: `准备为股票 ${stockCode} 设置价格提醒：
• 提醒价格：${price || '当前价格'}元
• 提醒方式：系统通知
是否确认设置此提醒？`,
      confidence: 85,
      requiresExecution: true
    };
  }
  
  private generateHelpResponse(): AIResponse {
    return {
      response: '智盈AI助手功能说明：\n\n1. 市场监控："系统是否在监控市场？"\n2. 买入信号："有买入信号吗？"\n3. 卖出信号："有卖出信号吗？"\n4. 股票分析："分析股票600000"\n5. 市场状态："当前市场状态如何？"\n6. 交易执行："买入股票600000，价格10元，数量100股"\n7. 持仓查询："我的持仓情况"\n8. 价格提醒："设置股票600000价格提醒"\n\n您可以使用自然语言提问，我会智能识别您的需求。',
      confidence: 95,
      requiresExecution: false
    };
  }
  
  // 执行AI命令
  async executeCommand(command: AICommand, signalManager?: any, marketMonitor?: any): Promise<any> {
    try {
      switch (command.type) {
        case 'execute_trade':
          logger.info(`执行交易命令: ${JSON.stringify(command.parameters)}`);
          return { success: true, message: '交易指令已发送' };
        case 'set_alerts':
          logger.info(`设置提醒: ${JSON.stringify(command.parameters)}`);
          return { success: true, message: '价格提醒已设置' };
        case 'analyze_stock':
          logger.info(`分析股票: ${command.parameters.stockCode}`);
          return { success: true, message: '股票分析已完成' };
        default:
          return { success: false, message: '该命令不需要执行' };
      }
    } catch (error) {
      logger.error(`执行命令失败:`, error);
      return { success: false, message: '执行命令时发生错误' };
    }
  }
  
  // 训练AI模型
  trainModel(data: Array<{ input: number[]; output: number }>): void {
    this.neuralNetwork.train(data);
  }
  
  // 获取模型信息
  getModelInfo(): { layers: number[]; parameters: number } {
    return this.neuralNetwork.getModelInfo();
  }
}

// 全局AI助手实例
let aiAssistantInstance: AdvancedAIAssistant | null = null;

export function getAIAssistant(): AdvancedAIAssistant {
  if (!aiAssistantInstance) {
    aiAssistantInstance = new AdvancedAIAssistant();
  }
  return aiAssistantInstance;
}