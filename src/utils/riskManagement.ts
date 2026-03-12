// 风险管理工具

// 风险等级
 export type RiskLevel = 'low' | 'medium' | 'high' | 'extreme';

// 风险评估结果
 export interface RiskAssessment {
  stockCode: string;
  stockName: string;
  riskLevel: RiskLevel;
  riskScore: number; // 0-100，越高风险越大
  volatility: number; // 波动率
  beta: number; // 贝塔系数
  sharpeRatio: number; // 夏普比率
  maxDrawdown: number; // 最大回撤
  liquidity: number; // 流动性评分
  sectorRisk: number; // 行业风险
  marketRisk: number; // 市场风险
  downsideDeviation: number; // 下行风险
  alpha: number; // 阿尔法系数
  informationRatio: number; // 信息比率
  kurtosis: number; //  kurtosis (峰度)
  skewness: number; // 偏度
  recommendations: string[]; // 风险建议
  timestamp: number; // 评估时间戳
}

// 止损/止盈设置
 export interface StopLossTakeProfit {
  stockCode: string;
  stockName: string;
  entryPrice: number;
  stopLossPrice: number;
  takeProfitPrice: number;
  riskRewardRatio: number;
  createdAt: number;
  updatedAt: number;
  active: boolean; // 是否激活
  trailingStop: boolean; // 是否为追踪止损
  trailingPercentage: number; // 追踪百分比
}

// 投资组合风险分析
 export interface PortfolioRisk {
  totalValue: number;
  totalRiskScore: number;
  riskLevel: RiskLevel;
  sectorDistribution: Record<string, number>;
  riskDistribution: Record<RiskLevel, number>;
  correlationMatrix: number[][];
  VaR: number; // 风险价值
  cVaR: number; // 条件风险价值
  maxDrawdown: number;
  sharpeRatio: number;
  sortinoRatio: number; // 索提诺比率
  portfolioBeta: number; // 投资组合贝塔
  diversificationScore: number; // 分散化评分
  recommendations: string[];
  timestamp: number;
}

// 风险预警
 export interface RiskAlert {
  id: string;
  stockCode: string;
  stockName: string;
  alertType: 'volatility' | 'drawdown' | 'sector' | 'market' | 'liquidity' | 'correlation' | 'concentration';
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp: number;
  isRead: boolean;
  actionRequired: boolean; // 是否需要操作
  relatedStocks: string[]; // 相关股票
}

class RiskManager {
  private riskAssessments: Map<string, RiskAssessment> = new Map();
  private stopLossTakeProfit: Map<string, StopLossTakeProfit> = new Map();
  private riskAlerts: RiskAlert[] = [];
  private portfolioRisk: PortfolioRisk | null = null;
  private historicalVolatility: Map<string, number[]> = new Map(); // 历史波动率数据
  private correlationData: Map<string, Map<string, number>> = new Map(); // 相关性数据

  // 计算历史波动率
  private calculateVolatility(prices: number[]): number {
    if (prices.length < 2) return 0.1;
    
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push(Math.log(prices[i] / prices[i - 1]));
    }
    
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / (returns.length - 1);
    return Math.sqrt(variance) * Math.sqrt(252); // 年化波动率
  }

  // 计算最大回撤
  private calculateMaxDrawdown(prices: number[]): number {
    if (prices.length < 2) return 0.1;
    
    let maxDrawdown = 0;
    let peak = prices[0];
    
    for (let i = 1; i < prices.length; i++) {
      if (prices[i] > peak) {
        peak = prices[i];
      }
      const drawdown = (peak - prices[i]) / peak;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    }
    
    return maxDrawdown;
  }

  // 评估股票风险
  assessStockRisk(stockCode: string, stockName: string, historicalData?: number[]): RiskAssessment {
    // 使用历史数据计算风险指标，否则使用模拟数据
    let volatility = 0.1 + Math.random() * 0.5; // 波动率 0.1-0.6
    let maxDrawdown = 0.1 + Math.random() * 0.6; // 最大回撤 0.1-0.7
    
    if (historicalData && historicalData.length > 10) {
      volatility = this.calculateVolatility(historicalData);
      maxDrawdown = this.calculateMaxDrawdown(historicalData);
      
      // 存储历史波动率数据
      if (!this.historicalVolatility.has(stockCode)) {
        this.historicalVolatility.set(stockCode, []);
      }
      this.historicalVolatility.get(stockCode)?.push(volatility);
    }

    // 其他风险指标
    const beta = 0.5 + Math.random() * 1.5; // 贝塔系数 0.5-2.0
    const sharpeRatio = -0.5 + Math.random() * 3; // 夏普比率 -0.5-2.5
    const liquidity = 0.3 + Math.random() * 0.7; // 流动性 0.3-1.0
    const sectorRisk = 0.2 + Math.random() * 0.6; // 行业风险 0.2-0.8
    const marketRisk = 0.3 + Math.random() * 0.5; // 市场风险 0.3-0.8
    const downsideDeviation = 0.05 + Math.random() * 0.4; // 下行风险 0.05-0.45
    const alpha = -0.5 + Math.random() * 2; // 阿尔法系数 -0.5-1.5
    const informationRatio = -0.5 + Math.random() * 3; // 信息比率 -0.5-2.5
    const kurtosis = 1 + Math.random() * 4; // 峰度 1-5
    const skewness = -1 + Math.random() * 2; // 偏度 -1-1

    // 计算风险评分 (更复杂的加权计算)
    const riskScore = Math.min(100, Math.round(
      volatility * 25 +
      Math.max(0, beta - 1) * 15 +
      (1 - Math.max(0, sharpeRatio)) * 15 +
      maxDrawdown * 20 +
      (1 - liquidity) * 10 +
      sectorRisk * 5 +
      marketRisk * 5 +
      downsideDeviation * 5
    ));

    // 确定风险等级
    let riskLevel: RiskLevel;
    if (riskScore < 25) {
      riskLevel = 'low';
    } else if (riskScore < 50) {
      riskLevel = 'medium';
    } else if (riskScore < 75) {
      riskLevel = 'high';
    } else {
      riskLevel = 'extreme';
    }

    // 生成风险建议
    const recommendations: string[] = [];
    if (volatility > 0.4) {
      recommendations.push('波动率较高，建议设置止损');
    }
    if (beta > 1.5) {
      recommendations.push('贝塔系数较高，市场波动影响较大');
    }
    if (sharpeRatio < 0) {
      recommendations.push('夏普比率为负，风险调整收益不佳');
    }
    if (maxDrawdown > 0.4) {
      recommendations.push('最大回撤较大，建议控制仓位');
    }
    if (liquidity < 0.5) {
      recommendations.push('流动性较差，可能影响交易执行');
    }
    if (downsideDeviation > 0.3) {
      recommendations.push('下行风险较大，建议降低仓位');
    }
    if (kurtosis > 3) {
      recommendations.push('收益率分布尾部较厚，极端风险较高');
    }

    const assessment: RiskAssessment = {
      stockCode,
      stockName,
      riskLevel,
      riskScore,
      volatility,
      beta,
      sharpeRatio,
      maxDrawdown,
      liquidity,
      sectorRisk,
      marketRisk,
      downsideDeviation,
      alpha,
      informationRatio,
      kurtosis,
      skewness,
      recommendations,
      timestamp: Date.now()
    };

    this.riskAssessments.set(stockCode, assessment);
    return assessment;
  }

  // 设置止损/止盈
  setStopLossTakeProfit(params: Omit<StopLossTakeProfit, 'createdAt' | 'updatedAt'>): StopLossTakeProfit {
    const sltp: StopLossTakeProfit = {
      ...params,
      riskRewardRatio: (params.takeProfitPrice - params.entryPrice) / (params.entryPrice - params.stopLossPrice),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    this.stopLossTakeProfit.set(params.stockCode, sltp);
    return sltp;
  }

  // 获取止损/止盈设置
  getStopLossTakeProfit(stockCode: string): StopLossTakeProfit | undefined {
    return this.stopLossTakeProfit.get(stockCode);
  }

  // 分析投资组合风险
  analyzePortfolio(stocks: Array<{ code: string; name: string; weight: number; price: number }>): PortfolioRisk {
    // 计算投资组合总价值
    const totalValue = stocks.reduce((sum, stock) => sum + stock.weight * stock.price, 0);
    
    // 获取每个股票的风险评估
    const assessments = stocks.map(stock => {
      return this.riskAssessments.get(stock.code) || this.assessStockRisk(stock.code, stock.name);
    });

    // 计算加权风险评分
    const weightedRiskScores = stocks.map((stock, index) => {
      return assessments[index].riskScore * stock.weight;
    });
    const totalRiskScore = weightedRiskScores.reduce((sum, score) => sum + score, 0);

    // 确定投资组合风险等级
    let riskLevel: RiskLevel;
    if (totalRiskScore < 25) {
      riskLevel = 'low';
    } else if (totalRiskScore < 50) {
      riskLevel = 'medium';
    } else if (totalRiskScore < 75) {
      riskLevel = 'high';
    } else {
      riskLevel = 'extreme';
    }

    // 模拟行业分布
    const sectorDistribution = {
      '科技': 30,
      '金融': 25,
      '医药': 20,
      '消费': 15,
      '能源': 10
    };

    // 计算风险分布
    const riskDistribution: Record<RiskLevel, number> = {
      'low': 0,
      'medium': 0,
      'high': 0,
      'extreme': 0
    };
    stocks.forEach((stock, index) => {
      const riskLevel = assessments[index].riskLevel;
      riskDistribution[riskLevel] += stock.weight * 100;
    });

    // 计算相关系数矩阵
    const correlationMatrix = stocks.map((stockA, i) => 
      stocks.map((stockB, j) => {
        if (i === j) return 1;
        // 模拟相关性，实际应用中应该使用历史数据计算
        return 0.1 + Math.random() * 0.8;
      })
    );

    // 计算风险价值 (VaR) - 简化计算
    const portfolioVolatility = Math.sqrt(
      stocks.reduce((sum, stock, i) => {
        return sum + Math.pow(stock.weight, 2) * Math.pow(assessments[i].volatility, 2) +
               stocks.slice(i + 1).reduce((sum2, stock2, j) => {
                 return sum2 + 2 * stock.weight * stock2.weight * 
                        correlationMatrix[i][j + i + 1] * 
                        assessments[i].volatility * assessments[j + i + 1].volatility;
               }, 0);
      }, 0)
    );
    const VaR = totalValue * portfolioVolatility * 1.645; // 95%置信区间
    const cVaR = totalValue * portfolioVolatility * 2.33; // 99%置信区间

    // 模拟最大回撤
    const maxDrawdown = 0.2 + Math.random() * 0.3; // 20-50%

    // 计算投资组合夏普比率
    const portfolioSharpe = 0.5 + Math.random() * 1.5; // 0.5-2.0
    const sortinoRatio = 0.8 + Math.random() * 1.2; // 0.8-2.0

    // 计算投资组合贝塔
    const portfolioBeta = stocks.reduce((sum, stock, index) => {
      return sum + stock.weight * assessments[index].beta;
    }, 0);

    // 计算分散化评分 (0-100)
    const diversificationScore = 100 - Math.min(100, 
      Object.values(sectorDistribution).reduce((sum, weight) => sum + Math.pow(weight / 100, 2), 0) * 100
    );

    // 生成投资组合建议
    const recommendations: string[] = [];
    if (riskDistribution.high + riskDistribution.extreme > 30) {
      recommendations.push('高风险资产占比过高，建议适当分散');
    }
    if (sectorDistribution.科技 > 40) {
      recommendations.push('科技行业占比过高，建议减少行业集中度');
    }
    if (portfolioSharpe < 1) {
      recommendations.push('夏普比率较低，建议优化资产配置');
    }
    if (diversificationScore < 50) {
      recommendations.push('投资组合分散度不足，建议增加资产类别');
    }
    if (portfolioBeta > 1.2) {
      recommendations.push('投资组合贝塔较高，市场下跌风险较大');
    }

    const portfolioRisk: PortfolioRisk = {
      totalValue,
      totalRiskScore,
      riskLevel,
      sectorDistribution,
      riskDistribution,
      correlationMatrix,
      VaR,
      cVaR,
      maxDrawdown,
      sharpeRatio: portfolioSharpe,
      sortinoRatio,
      portfolioBeta,
      diversificationScore,
      recommendations,
      timestamp: Date.now()
    };

    this.portfolioRisk = portfolioRisk;
    return portfolioRisk;
  }

  // 生成风险预警
  generateRiskAlerts(stocks: Array<{ code: string; name: string; price: number; weight?: number }>): RiskAlert[] {
    const alerts: RiskAlert[] = [];

    stocks.forEach(stock => {
      const assessment = this.riskAssessments.get(stock.code) || this.assessStockRisk(stock.code, stock.name);
      const sltp = this.stopLossTakeProfit.get(stock.code);

      // 波动率预警
      if (assessment.volatility > 0.4) {
        alerts.push({
          id: `alert-${Date.now()}-${stock.code}-1`,
          stockCode: stock.code,
          stockName: stock.name,
          alertType: 'volatility',
          severity: 'medium',
          message: `波动率较高 (${(assessment.volatility * 100).toFixed(2)}%)，建议关注`,
          timestamp: Date.now(),
          isRead: false,
          actionRequired: true,
          relatedStocks: []
        });
      }

      // 止损预警
      if (sltp && sltp.active && stock.price < sltp.stopLossPrice * 1.02) {
        alerts.push({
          id: `alert-${Date.now()}-${stock.code}-2`,
          stockCode: stock.code,
          stockName: stock.name,
          alertType: 'drawdown',
          severity: 'high',
          message: `接近止损价位 (当前: ${stock.price.toFixed(2)}, 止损: ${sltp.stopLossPrice.toFixed(2)})`,
          timestamp: Date.now(),
          isRead: false,
          actionRequired: true,
          relatedStocks: []
        });
      }

      // 流动性预警
      if (assessment.liquidity < 0.3) {
        alerts.push({
          id: `alert-${Date.now()}-${stock.code}-3`,
          stockCode: stock.code,
          stockName: stock.name,
          alertType: 'liquidity',
          severity: 'low',
          message: `流动性较差，可能影响交易执行`,
          timestamp: Date.now(),
          isRead: false,
          actionRequired: false,
          relatedStocks: []
        });
      }

      // 下行风险预警
      if (assessment.downsideDeviation > 0.3) {
        alerts.push({
          id: `alert-${Date.now()}-${stock.code}-4`,
          stockCode: stock.code,
          stockName: stock.name,
          alertType: 'drawdown',
          severity: 'medium',
          message: `下行风险较大 (${(assessment.downsideDeviation * 100).toFixed(2)}%)，建议降低仓位`,
          timestamp: Date.now(),
          isRead: false,
          actionRequired: true,
          relatedStocks: []
        });
      }

      // 极端风险预警
      if (assessment.kurtosis > 3) {
        alerts.push({
          id: `alert-${Date.now()}-${stock.code}-5`,
          stockCode: stock.code,
          stockName: stock.name,
          alertType: 'volatility',
          severity: 'medium',
          message: `收益率分布尾部较厚，极端风险较高`,
          timestamp: Date.now(),
          isRead: false,
          actionRequired: false,
          relatedStocks: []
        });
      }
    });

    // 投资组合集中度预警
    if (stocks.length > 1) {
      // 检查是否所有股票都有weight属性
      const allHaveWeight = stocks.every(stock => stock.weight !== undefined);
      if (allHaveWeight) {
        const totalWeight = stocks.reduce((sum, stock) => sum + (stock.weight || 0), 0);
        const topStockWeight = Math.max(...stocks.map(stock => (stock.weight || 0) / totalWeight));
        
        if (topStockWeight > 0.4) {
          const topStock = stocks.find(stock => (stock.weight || 0) / totalWeight === topStockWeight);
          if (topStock) {
            alerts.push({
              id: `alert-${Date.now()}-portfolio-1`,
              stockCode: 'portfolio',
              stockName: '投资组合',
              alertType: 'concentration',
              severity: 'medium',
              message: `投资组合集中度较高，${topStock.name}占比达${(topStockWeight * 100).toFixed(2)}%`,
              timestamp: Date.now(),
              isRead: false,
              actionRequired: true,
              relatedStocks: stocks.map(stock => stock.code)
            });
          }
        }
      }
    }

    this.riskAlerts = [...this.riskAlerts, ...alerts];
    // 限制预警数量，只保留最近200个
    if (this.riskAlerts.length > 200) {
      this.riskAlerts = this.riskAlerts.slice(-200);
    }
    return alerts;
  }

  // 获取风险预警
  getRiskAlerts(): RiskAlert[] {
    return this.riskAlerts;
  }

  // 标记预警为已读
  markAlertAsRead(alertId: string): void {
    const alert = this.riskAlerts.find(a => a.id === alertId);
    if (alert) {
      alert.isRead = true;
    }
  }

  // 清除已读预警
  clearReadAlerts(): void {
    this.riskAlerts = this.riskAlerts.filter(alert => !alert.isRead);
  }

  // 获取投资组合风险
  getPortfolioRisk(): PortfolioRisk | null {
    return this.portfolioRisk;
  }

  // 获取所有风险评估
  getRiskAssessments(): RiskAssessment[] {
    return Array.from(this.riskAssessments.values());
  }
}

// 单例模式
let riskManagerInstance: RiskManager | null = null;

export const getRiskManager = (): RiskManager => {
  if (!riskManagerInstance) {
    riskManagerInstance = new RiskManager();
  }
  return riskManagerInstance;
};
