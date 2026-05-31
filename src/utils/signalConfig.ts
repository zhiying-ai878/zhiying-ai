// 信号生成配置
export interface SignalConfig {
  // 价格变化阈值
  priceChangeThreshold: {
    strongBuy: number;  // 强烈买入阈值
    buy: number;        // 买入阈值
    sell: number;       // 卖出阈值
    strongSell: number; // 强烈卖出阈值
  };
  
  // 成交量阈值
  volumeThreshold: {
    minVolume: number;  // 最小成交量
    volumeAmplification: number; // 成交量放大倍数
  };
  
  // 技术指标阈值
  technicalIndicators: {
    rsi: {
      overbought: number;  // 超买阈值
      oversold: number;    // 超卖阈值
    };
    macd: {
      bullishThreshold: number;  // MACD金叉阈值
      bearishThreshold: number;  // MACD死叉阈值
    };
    kdj: {
      bullishThreshold: number;  // KDJ金叉阈值
      bearishThreshold: number;  // KDJ死叉阈值
    };
  };
  
  // 筹码峰分析阈值
  chipPeak: {
    concentrationThreshold: number;  // 筹码集中度阈值
    supportResistanceRatio: number;  // 支撑阻力比阈值
  };
  
  // 信号置信度阈值
  confidenceThresholds: {
    buy: number;         // 买入信号置信度阈值
    sell: number;        // 卖出信号置信度阈值
    highConfidence: number; // 高置信度阈值
  };
  
  // 市场环境参数
  marketEnvironment: {
    bullMarketMultiplier: number;  // 牛市乘数
    bearMarketMultiplier: number;  // 熊市乘数
  };
  
  // 行业因素权重
  industryWeights: {
    leadingIndustryWeight: number;  // 领涨行业权重
    emergingIndustryWeight: number; // 新兴行业权重
  };
  
  // 资金流向参数
  fundFlow: {
    mainForceBuyThreshold: number;  // 主力资金买入阈值
    largeOrderBuyThreshold: number; // 大单买入阈值
  };
  
  // 信号过滤参数
  signalFilter: {
    minSignalInterval: number;  // 最小信号间隔（毫秒）
    maxSignalsPerDay: number;   // 每日最大信号数
  };
  
  // 特殊情况处理
  specialCases: {
    limitUpPotential: boolean;  // 是否考虑涨停潜力
    gapUpPotential: boolean;    // 是否考虑跳空高开潜力
  };
}

// 默认信号配置
export const defaultSignalConfig: SignalConfig = {
  // 价格变化阈值
  priceChangeThreshold: {
    strongBuy: 3.0,     // 强烈买入阈值：涨幅3%以上
    buy: 1.5,           // 买入阈值：涨幅1.5%以上
    sell: -1.5,         // 卖出阈值：跌幅1.5%以上
    strongSell: -3.0     // 强烈卖出阈值：跌幅3%以上
  },
  
  // 成交量阈值
  volumeThreshold: {
    minVolume: 1000000,   // 最小成交量：100万股
    volumeAmplification: 1.5 // 成交量放大倍数：1.5倍
  },
  
  // 技术指标阈值
  technicalIndicators: {
    rsi: {
      overbought: 70,    // 超买阈值：70
      oversold: 30       // 超卖阈值：30
    },
    macd: {
      bullishThreshold: 0.01,  // MACD金叉阈值：0.01
      bearishThreshold: -0.01  // MACD死叉阈值：-0.01
    },
    kdj: {
      bullishThreshold: 20,    // KDJ金叉阈值：20
      bearishThreshold: 80     // KDJ死叉阈值：80
    }
  },
  
  // 筹码峰分析阈值
  chipPeak: {
    concentrationThreshold: 60,  // 筹码集中度阈值：60%
    supportResistanceRatio: 0.8  // 支撑阻力比阈值：0.8
  },
  
  // 信号置信度阈值
  confidenceThresholds: {
    buy: 60,         // 买入信号置信度阈值：60%
    sell: 60,        // 卖出信号置信度阈值：60%
    highConfidence: 80  // 高置信度阈值：80%
  },
  
  // 市场环境参数
  marketEnvironment: {
    bullMarketMultiplier: 1.2,  // 牛市乘数：1.2
    bearMarketMultiplier: 0.8   // 熊市乘数：0.8
  },
  
  // 行业因素权重
  industryWeights: {
    leadingIndustryWeight: 1.5,  // 领涨行业权重：1.5
    emergingIndustryWeight: 1.3  // 新兴行业权重：1.3
  },
  
  // 资金流向参数
  fundFlow: {
    mainForceBuyThreshold: 50000000,  // 主力资金买入阈值：5000万
    largeOrderBuyThreshold: 20000000   // 大单买入阈值：2000万
  },
  
  // 信号过滤参数
  signalFilter: {
    minSignalInterval: 300000,  // 最小信号间隔：5分钟
    maxSignalsPerDay: 50        // 每日最大信号数：50
  },
  
  // 特殊情况处理
  specialCases: {
    limitUpPotential: true,  // 考虑涨停潜力
    gapUpPotential: true     // 考虑跳空高开潜力
  }
};

// 优化的信号配置（针对潜在上涨股票）
export const optimizedSignalConfig: SignalConfig = {
  ...defaultSignalConfig,
  
  // 调整价格变化阈值，更容易捕捉潜在上涨
  priceChangeThreshold: {
    strongBuy: 2.5,     // 强烈买入阈值：涨幅2.5%以上
    buy: 1.0,           // 买入阈值：涨幅1.0%以上
    sell: -2.0,         // 卖出阈值：跌幅2.0以上
    strongSell: -3.5     // 强烈卖出阈值：跌幅3.5%以上
  },
  
  // 降低成交量阈值，捕捉更多潜在机会
  volumeThreshold: {
    minVolume: 500000,   // 最小成交量：50万股
    volumeAmplification: 1.2 // 成交量放大倍数：1.2倍
  },
  
  // 调整技术指标阈值
  technicalIndicators: {
    ...defaultSignalConfig.technicalIndicators,
    rsi: {
      overbought: 75,    // 超买阈值：75
      oversold: 25       // 超卖阈值：25
    }
  },
  
  // 调整筹码峰阈值
  chipPeak: {
    concentrationThreshold: 50,  // 筹码集中度阈值：50%
    supportResistanceRatio: 0.7  // 支撑阻力比阈值：0.7
  },
  
  // 降低信号置信度阈值，提高信号捕捉率
  confidenceThresholds: {
    buy: 55,         // 买入信号置信度阈值：55%
    sell: 65,        // 卖出信号置信度阈值：65%
    highConfidence: 75  // 高置信度阈值：75%
  },
  
  // 增加行业因素权重
  industryWeights: {
    leadingIndustryWeight: 1.8,  // 领涨行业权重：1.8
    emergingIndustryWeight: 1.5  // 新兴行业权重：1.5
  },
  
  // 降低资金流向阈值
  fundFlow: {
    mainForceBuyThreshold: 30000000,  // 主力资金买入阈值：3000万
    largeOrderBuyThreshold: 10000000   // 大单买入阈值：1000万
  },
  
  // 调整信号过滤参数
  signalFilter: {
    minSignalInterval: 180000,  // 最小信号间隔：3分钟
    maxSignalsPerDay: 80        // 每日最大信号数：80
  }
};

// 导出配置
export const getSignalConfig = (type: 'default' | 'optimized' = 'optimized') => {
  return type === 'optimized' ? optimizedSignalConfig : defaultSignalConfig;
};