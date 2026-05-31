import { IndexedDBManager, IndexedDBStrategy, IndexedDBBacktest } from './indexedDBManager';

export interface StrategyRule {
  type: 'mainForce' | 'technical' | 'volume' | 'trend' | 'news';
  condition: string;
  weight: number;
  parameters: Record<string, number>;
}

export interface Trade {
  stockCode: string;
  stockName: string;
  type: 'buy' | 'sell';
  price: number;
  amount: number;
  timestamp: number;
  reason: string;
}

export interface BacktestResult {
  strategyId: string;
  strategyName: string;
  startDate: number;
  endDate: number;
  initialCapital: number;
  finalCapital: number;
  totalReturn: number;
  annualReturn: number;
  winRate: number;
  maxDrawdown: number;
  profitFactor: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  averageWin: number;
  averageLoss: number;
  trades: Trade[];
  dailyReturns: number[];
  cumulativeReturns: number[];
  sharpeRatio?: number;
  sortinoRatio?: number;
}

export class StrategyBacktestManager {
  private static instance: StrategyBacktestManager;
  private db: IndexedDBManager;

  private constructor() {
    this.db = IndexedDBManager.getInstance();
  }

  public static getInstance(): StrategyBacktestManager {
    if (!StrategyBacktestManager.instance) {
      StrategyBacktestManager.instance = new StrategyBacktestManager();
    }
    return StrategyBacktestManager.instance;
  }

  public async createStrategy(strategy: Omit<IndexedDBStrategy, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    const strategyId = Date.now().toString() + Math.random().toString(36).substring(2, 11);
    const newStrategy: IndexedDBStrategy = {
      id: strategyId,
      ...strategy,
      created_at: Date.now(),
      updated_at: Date.now()
    };
    
    await this.db.addStrategy(newStrategy);
    return strategyId;
  }

  public async getStrategies(isActive?: boolean): Promise<IndexedDBStrategy[]> {
    return await this.db.getStrategies(isActive !== undefined ? { isActive } : undefined);
  }

  public async runBacktest(
    strategyId: string,
    strategyName: string,
    startDate: Date,
    endDate: Date,
    initialCapital: number = 100000
  ): Promise<BacktestResult> {
    const startTimestamp = startDate.getTime();
    const endTimestamp = endDate.getTime();

    const trades: Trade[] = [];
    const dailyReturns: number[] = [];
    const cumulativeReturns: number[] = [];
    
    let currentCapital = initialCapital;
    let peakCapital = initialCapital;
    let maxDrawdown = 0;
    let winningTrades = 0;
    let losingTrades = 0;
    let totalWins = 0;
    let totalLosses = 0;

    const days = Math.floor((endTimestamp - startTimestamp) / (24 * 60 * 60 * 1000));
    for (let i = 0; i < days; i++) {
      const currentDate = new Date(startTimestamp + i * 24 * 60 * 60 * 1000);
      
      const dailyReturn = (Math.random() - 0.45) * 0.06;
      dailyReturns.push(dailyReturn);
      
      currentCapital *= (1 + dailyReturn);
      
      if (currentCapital > peakCapital) {
        peakCapital = currentCapital;
      }
      
      const drawdown = (peakCapital - currentCapital) / peakCapital;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
      
      cumulativeReturns.push((currentCapital - initialCapital) / initialCapital);

      if (Math.random() > 0.7) {
        const trade: Trade = {
          stockCode: `STOCK${Math.floor(Math.random() * 1000)}`,
          stockName: `模拟股票${Math.floor(Math.random() * 1000)}`,
          type: Math.random() > 0.5 ? 'buy' : 'sell',
          price: Math.random() * 100 + 10,
          amount: Math.floor(Math.random() * 1000) + 100,
          timestamp: currentDate.getTime(),
          reason: '策略触发'
        };
        
        trades.push(trade);
        
        const profit = (Math.random() - 0.4) * 1000;
        if (profit > 0) {
          winningTrades++;
          totalWins += profit;
        } else {
          losingTrades++;
          totalLosses -= profit;
        }
      }
    }

    const totalReturn = (currentCapital - initialCapital) / initialCapital;
    const totalTrades = winningTrades + losingTrades;
    const winRate = totalTrades > 0 ? winningTrades / totalTrades : 0;
    const averageWin = winningTrades > 0 ? totalWins / winningTrades : 0;
    const averageLoss = losingTrades > 0 ? totalLosses / losingTrades : 0;
    const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? 999 : 1;
    const years = days / 365;
    const annualReturn = years > 0 ? (1 + totalReturn) ** (1 / years) - 1 : 0;

    const result: BacktestResult = {
      strategyId,
      strategyName,
      startDate: startTimestamp,
      endDate: endTimestamp,
      initialCapital,
      finalCapital: currentCapital,
      totalReturn,
      annualReturn,
      winRate,
      maxDrawdown,
      profitFactor,
      totalTrades,
      winningTrades,
      losingTrades,
      averageWin,
      averageLoss,
      trades,
      dailyReturns,
      cumulativeReturns,
      sharpeRatio: this.calculateSharpeRatio(dailyReturns),
      sortinoRatio: this.calculateSortinoRatio(dailyReturns)
    };

    await this.saveBacktest(result);

    return result;
  }

  private calculateSharpeRatio(dailyReturns: number[], riskFreeRate: number = 0.03): number {
    if (dailyReturns.length === 0) return 0;

    const averageReturn = dailyReturns.reduce((sum, r) => sum + r, 0) / dailyReturns.length;
    const stdDev = Math.sqrt(dailyReturns.reduce((sum, r) => sum + (r - averageReturn) ** 2, 0) / dailyReturns.length);
    
    const dailyRiskFree = riskFreeRate / 252;
    const sharpeRatio = stdDev > 0 ? (averageReturn - dailyRiskFree) / stdDev * Math.sqrt(252) : 0;

    return sharpeRatio;
  }

  private calculateSortinoRatio(dailyReturns: number[], riskFreeRate: number = 0.03): number {
    if (dailyReturns.length === 0) return 0;

    const averageReturn = dailyReturns.reduce((sum, r) => sum + r, 0) / dailyReturns.length;
    const negativeReturns = dailyReturns.filter(r => r < 0);
    const downsideDeviation = negativeReturns.length > 0 
      ? Math.sqrt(negativeReturns.reduce((sum, r) => sum + r ** 2, 0) / dailyReturns.length)
      : 0;

    const dailyRiskFree = riskFreeRate / 252;
    const sortinoRatio = downsideDeviation > 0 ? (averageReturn - dailyRiskFree) / downsideDeviation * Math.sqrt(252) : 0;

    return sortinoRatio;
  }

  private async saveBacktest(result: BacktestResult): Promise<void> {
    const backtest: IndexedDBBacktest = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
      strategyId: result.strategyId,
      strategyName: result.strategyName,
      startDate: result.startDate,
      endDate: result.endDate,
      initialCapital: result.initialCapital,
      finalCapital: result.finalCapital,
      totalReturn: result.totalReturn,
      winRate: result.winRate,
      maxDrawdown: result.maxDrawdown,
      tradeCount: result.totalTrades,
      results: {
        trades: result.trades,
        dailyReturns: result.dailyReturns,
        cumulativeReturns: result.cumulativeReturns,
        profitFactor: result.profitFactor,
        annualReturn: result.annualReturn,
        sharpeRatio: result.sharpeRatio,
        sortinoRatio: result.sortinoRatio
      },
      created_at: Date.now()
    };

    await this.db.addBacktest(backtest);
  }

  public async getBacktests(strategyId?: string): Promise<IndexedDBBacktest[]> {
    return await this.db.getBacktests(strategyId ? { strategyId } : undefined);
  }

  public createDefaultStrategies(): Promise<string[]> {
    const defaultStrategies: Omit<IndexedDBStrategy, 'id' | 'created_at' | 'updated_at'>[] = [
      {
        name: '主力资金策略',
        description: '基于主力资金流向的策略，追踪大额资金的进出',
        parameters: {
          type: 'mainForce',
          mainForceThreshold: 1000000,
          volumeThreshold: 1.5
        },
        isActive: true
      },
      {
        name: '技术突破策略',
        description: '基于技术指标突破的策略，捕捉突破信号',
        parameters: {
          type: 'technical',
          useMACD: true,
          useMA: true,
          volumeThreshold: 1.3
        },
        isActive: true
      },
      {
        name: '涨停潜力策略',
        description: '专注于寻找具有涨停潜力的股票',
        parameters: {
          type: 'limitUp',
          mainForceThreshold: 5000000,
          turnoverRateThreshold: 5
        },
        isActive: true
      }
    ];

    const promises = defaultStrategies.map(strategy => this.createStrategy(strategy));
    return Promise.all(promises);
  }

  public compareStrategies(backtests: BacktestResult[]): {
    bestStrategy: BacktestResult;
    comparisons: Array<{
      strategyName: string;
      totalReturn: number;
      winRate: number;
      maxDrawdown: number;
      profitFactor: number;
      score: number;
    }>;
  } {
    const comparisons = backtests.map(backtest => {
      const score = this.calculateCompositeScore(backtest);
      return {
        strategyName: backtest.strategyName,
        totalReturn: backtest.totalReturn,
        winRate: backtest.winRate,
        maxDrawdown: backtest.maxDrawdown,
        profitFactor: backtest.profitFactor,
        score
      };
    });

    comparisons.sort((a, b) => b.score - a.score);
    const bestStrategy = backtests.find(bt => bt.strategyName === comparisons[0].strategyName)!;

    return {
      bestStrategy,
      comparisons
    };
  }

  private calculateCompositeScore(result: BacktestResult): number {
    let score = 0;
    score += result.totalReturn * 30;
    score += result.winRate * 25;
    score += (1 - result.maxDrawdown) * 25;
    score += Math.min(result.profitFactor, 5) * 4;
    score += Math.min(result.annualReturn, 1) * 20;
    
    return Math.max(0, score);
  }

  public async getStatistics(): Promise<{
    totalStrategies: number;
    activeStrategies: number;
    totalBacktests: number;
    averageWinRate: number;
    averageReturn: number;
  }> {
    const strategies = await this.getStrategies();
    const backtests = await this.getBacktests();

    const activeStrategies = strategies.filter(s => s.isActive).length;
    const averageWinRate = backtests.length > 0 
      ? backtests.reduce((sum, bt) => sum + bt.winRate, 0) / backtests.length 
      : 0;
    const averageReturn = backtests.length > 0 
      ? backtests.reduce((sum, bt) => sum + bt.totalReturn, 0) / backtests.length 
      : 0;

    return {
      totalStrategies: strategies.length,
      activeStrategies,
      totalBacktests: backtests.length,
      averageWinRate,
      averageReturn
    };
  }
}
