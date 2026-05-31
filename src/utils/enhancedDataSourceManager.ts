import axios from 'axios';
import { StockQuote } from './stockData';

// 增强的数据源类型
export type EnhancedDataSourceType = 'sina' | 'tencent' | 'eastmoney' | 'xueqiu' | 'netease' | 'sina_backup' | 'tencent_backup' | 'eastmoney_backup' | 'tencent_cors' | 'sina_cors' | 'eastmoney_cors';

// 数据源健康状态
export interface DataSourceHealth {
  status: 'healthy' | 'unhealthy' | 'degraded';
  successRate: number;
  responseTime: number;
  lastCheck: number;
}

// 增强的数据源管理器
export class EnhancedDataSourceManager {
  private sources: EnhancedDataSourceType[] = [
    'tencent_cors',
    'sina_cors',
    'eastmoney_cors',
    'tencent',
    'sina',
    'eastmoney',
    'tencent_backup',
    'sina_backup',
    'eastmoney_backup',
    'netease'
  ];

  private healthStatus: Map<EnhancedDataSourceType, DataSourceHealth> = new Map();
  private consecutiveFailures: Map<EnhancedDataSourceType, number> = new Map();
  private performanceStats: Map<EnhancedDataSourceType, { totalRequests: number; successfulRequests: number; totalResponseTime: number }> = new Map();
  private requestTimeout = 2000; // 减少超时时间，更快失败切换
  private retryConfig = {
    maxRetries: 5,
    baseDelay: 300,
    maxDelay: 2000,
    exponentialBackoff: true,
    jitterFactor: 0.2
  };

  constructor() {
    // 初始化数据源状态
    this.sources.forEach(source => {
      this.healthStatus.set(source, {
        status: 'healthy',
        successRate: 1.0,
        responseTime: 0,
        lastCheck: Date.now()
      });
      this.consecutiveFailures.set(source, 0);
      this.performanceStats.set(source, {
        totalRequests: 0,
        successfulRequests: 0,
        totalResponseTime: 0
      });
    });

    // 启动定期健康检查
    this.startHealthCheck();
  }

  // 定期检查数据源健康状态
  private startHealthCheck() {
    setInterval(() => {
      this.checkAllDataSources();
    }, 30000); // 每30秒检查一次
  }

  // 检查所有数据源的健康状态
  private async checkAllDataSources() {
    const testCodes = ['sh600000', 'sz000001'];
    
    for (const source of this.sources) {
      try {
        const startTime = Date.now();
        await this.testDataSource(source, testCodes);
        const responseTime = Date.now() - startTime;
        
        this.updateHealthStatus(source, true, responseTime);
      } catch (error) {
        this.updateHealthStatus(source, false);
      }
    }
  }

  // 测试数据源是否可用
  private async testDataSource(source: EnhancedDataSourceType, codes: string[]): Promise<boolean> {
    try {
      switch (source) {
        case 'tencent_cors':
          await this.getTencentRealtimeQuote(codes);
          break;
        case 'sina_cors':
          await this.getSinaRealtimeQuote(codes);
          break;
        case 'eastmoney_cors':
          await this.getEastMoneyRealtimeQuote(codes);
          break;
        case 'tencent':
          await this.getTencentRealtimeQuote(codes);
          break;
        case 'sina':
          await this.getSinaRealtimeQuote(codes);
          break;
        case 'eastmoney':
          await this.getEastMoneyRealtimeQuote(codes);
          break;
        case 'tencent_backup':
          await this.getTencentRealtimeQuote(codes);
          break;
        case 'sina_backup':
          await this.getSinaRealtimeQuote(codes);
          break;
        case 'eastmoney_backup':
          await this.getEastMoneyRealtimeQuote(codes);
          break;
        case 'netease':
          await this.getNeteaseRealtimeQuote(codes);
          break;
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  // 更新数据源健康状态
  private updateHealthStatus(source: EnhancedDataSourceType, success: boolean, responseTime?: number) {
    const health = this.healthStatus.get(source);
    const stats = this.performanceStats.get(source);

    if (health && stats) {
      stats.totalRequests++;
      if (success) {
        stats.successfulRequests++;
        this.consecutiveFailures.set(source, 0);
        if (responseTime) {
          health.responseTime = responseTime;
        }
      } else {
        const failures = this.consecutiveFailures.get(source) || 0;
        this.consecutiveFailures.set(source, failures + 1);
      }

      health.successRate = stats.successfulRequests / stats.totalRequests;
      health.lastCheck = Date.now();

      // 更新状态
      const failures = this.consecutiveFailures.get(source) || 0;
      if (failures >= 5) {
        health.status = 'unhealthy';
      } else if (health.successRate < 0.5) {
        health.status = 'degraded';
      } else {
        health.status = 'healthy';
      }

      this.healthStatus.set(source, health);
      this.performanceStats.set(source, stats);
    }
  }

  // 获取最佳数据源
  getBestDataSource(): EnhancedDataSourceType {
    const healthySources = this.sources.filter(source => {
      const health = this.healthStatus.get(source);
      return health && health.status === 'healthy';
    });

    if (healthySources.length === 0) {
      // 如果没有健康的数据源，返回第一个数据源
      return this.sources[0];
    }

    // 按响应时间排序，选择最快的数据源
    healthySources.sort((a, b) => {
      const healthA = this.healthStatus.get(a);
      const healthB = this.healthStatus.get(b);
      return (healthA?.responseTime || 999999) - (healthB?.responseTime || 999999);
    });

    return healthySources[0];
  }

  // 带重试机制的请求
  private async requestWithRetry<T>(fn: () => Promise<T>, maxRetries: number = this.retryConfig.maxRetries): Promise<T> {
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (attempt < maxRetries) {
          // 指数退避策略
          const backoffTime = Math.min(
            this.retryConfig.maxDelay,
            this.retryConfig.baseDelay * Math.pow(2, attempt - 1)
          );
          const jitter = Math.random() * (backoffTime * this.retryConfig.jitterFactor);
          await new Promise(resolve => setTimeout(resolve, backoffTime + jitter));
        }
      }
    }

    throw lastError;
  }

  // 获取腾讯实时行情
  private async getTencentRealtimeQuote(codes: string[]): Promise<StockQuote[]> {
    const url = `https://qt.gtimg.cn/q=${codes.map(code => {
      if (code.startsWith('sh')) return `sh${code.slice(2)}`;
      if (code.startsWith('sz')) return `sz${code.slice(2)}`;
      return code;
    }).join(',')}`;

    return this.requestWithRetry(async () => {
      const response = await axios.get(url, {
        timeout: this.requestTimeout
      });

      // 解析腾讯行情数据
      const quotes: StockQuote[] = [];
      const data = response.data as string;
      
      codes.forEach(code => {
        const prefix = code.startsWith('sh') ? 'sh' : 'sz';
        const stockCode = code.slice(2);
        const match = data.match(new RegExp(`${prefix}${stockCode}=([^;]+)`));
        
        if (match) {
          const parts = match[1].split('~');
          const price = parseFloat(parts[3]);
          const prevClose = parseFloat(parts[2]);
          quotes.push({
            code,
            name: parts[1],
            price,
            change: price - prevClose,
            changePercent: ((price - prevClose) / prevClose) * 100,
            open: parseFloat(parts[5]),
            high: parseFloat(parts[4]),
            low: parseFloat(parts[5]),
            volume: parseInt(parts[6]),
            amount: parseFloat(parts[7]),
            close: price
          });
        }
      });

      return quotes;
    });
  }

  // 获取新浪实时行情
  private async getSinaRealtimeQuote(codes: string[]): Promise<StockQuote[]> {
    const url = `http://hq.sinajs.cn/list=${codes.map(code => {
      if (code.startsWith('sh')) return `sh${code.slice(2)}`;
      if (code.startsWith('sz')) return `sz${code.slice(2)}`;
      return code;
    }).join(',')}`;

    return this.requestWithRetry(async () => {
      const response = await axios.get(url, {
        timeout: this.requestTimeout
      });

      // 解析新浪行情数据
      const quotes: StockQuote[] = [];
      const lines = (response.data as string).split('\n');
      
      lines.forEach((line: string, index: number) => {
        if (line && index < codes.length) {
          const code = codes[index];
          const match = line.match(/"([^"]+)"/);
          
          if (match) {
            const parts = match[1].split(',');
            const price = parseFloat(parts[3]);
            const prevClose = parseFloat(parts[2]);
            quotes.push({
              code,
              name: parts[0],
              price,
              change: price - prevClose,
              changePercent: ((price - prevClose) / prevClose) * 100,
              open: parseFloat(parts[1]),
              high: parseFloat(parts[3]),
              low: parseFloat(parts[4]),
              volume: parseInt(parts[8]),
              amount: parseFloat(parts[9]),
              close: price
            });
          }
        }
      });

      return quotes;
    });
  }

  // 获取东方财富实时行情
  private async getEastMoneyRealtimeQuote(codes: string[]): Promise<StockQuote[]> {
    const quotes: StockQuote[] = [];

    // 东方财富API一次只能查询一个股票
    for (const code of codes) {
      const secid = code.startsWith('sh') ? `1.${code.slice(2)}` : `0.${code.slice(2)}`;
      const url = `https://push2.eastmoney.com/api/qt/stock/get?secid=${secid}&fields=f43,f44,f45,f46,f47,f48,f49,f50,f51,f52,f57,f58,f60,f169,f170`;

      try {
        const response = await this.requestWithRetry(async () => {
          return await axios.get(url, {
            timeout: this.requestTimeout
          });
        });

        const data = response.data as any;
        if (data && data.data) {
          const d = data.data;
          const price = parseFloat(d.f43);
          const prevClose = parseFloat(d.f47);
          quotes.push({
            code,
            name: d.f14 || `股票${code}`,
            price,
            change: price - prevClose,
            changePercent: ((price - prevClose) / prevClose) * 100,
            open: parseFloat(d.f45),
            high: parseFloat(d.f44),
            low: parseFloat(d.f46),
            volume: parseInt(d.f48),
            amount: parseFloat(d.f49),
            close: price
          });
        }
      } catch (error) {
        // 单个股票失败不影响其他股票
        console.warn(`获取${code}东方财富行情失败:`, error);
      }
    }

    return quotes;
  }

  // 获取网易实时行情
  private async getNeteaseRealtimeQuote(codes: string[]): Promise<StockQuote[]> {
    const url = `http://api.money.126.net/data/feed/${codes.join(',')},money.api`;

    return this.requestWithRetry(async () => {
      const response = await axios.get(url, {
        timeout: this.requestTimeout
      });

      // 解析网易行情数据
      const quotes: StockQuote[] = [];
      const data = JSON.parse((response.data as string).replace('ntesstock(', '').replace(');', ''));
      
      codes.forEach(code => {
        const item = data[code];
        if (item) {
          const price = parseFloat(item.price);
          const prevClose = parseFloat(item.yestclose);
          quotes.push({
            code,
            name: item.name,
            price,
            change: price - prevClose,
            changePercent: ((price - prevClose) / prevClose) * 100,
            open: parseFloat(item.open),
            high: parseFloat(item.high),
            low: parseFloat(item.low),
            volume: parseInt(item.volume),
            amount: parseFloat(item.amount),
            close: price
          });
        }
      });

      return quotes;
    });
  }

  // 获取实时行情（自动选择最佳数据源）
  async getRealtimeQuote(codes: string[]): Promise<StockQuote[]> {
    if (codes.length === 0) {
      return [];
    }

    let bestSource = this.getBestDataSource();
    let quotes: StockQuote[] = [];

    try {
      // 尝试使用最佳数据源
      switch (bestSource) {
        case 'tencent_cors':
        case 'tencent':
        case 'tencent_backup':
          quotes = await this.getTencentRealtimeQuote(codes);
          break;
        case 'sina_cors':
        case 'sina':
        case 'sina_backup':
          quotes = await this.getSinaRealtimeQuote(codes);
          break;
        case 'eastmoney_cors':
        case 'eastmoney':
        case 'eastmoney_backup':
          quotes = await this.getEastMoneyRealtimeQuote(codes);
          break;
        case 'netease':
          quotes = await this.getNeteaseRealtimeQuote(codes);
          break;
      }

      // 更新数据源状态
      this.updateHealthStatus(bestSource, true);
    } catch (error) {
      // 数据源失败，尝试下一个数据源
      console.warn(`数据源${bestSource}失败，尝试切换数据源:`, error);
      this.updateHealthStatus(bestSource, false);

      // 尝试所有数据源
      for (const source of this.sources) {
        if (source !== bestSource) {
          try {
            switch (source) {
              case 'tencent_cors':
              case 'tencent':
              case 'tencent_backup':
                quotes = await this.getTencentRealtimeQuote(codes);
                break;
              case 'sina_cors':
              case 'sina':
              case 'sina_backup':
                quotes = await this.getSinaRealtimeQuote(codes);
                break;
              case 'eastmoney_cors':
              case 'eastmoney':
              case 'eastmoney_backup':
                quotes = await this.getEastMoneyRealtimeQuote(codes);
                break;
              case 'netease':
                quotes = await this.getNeteaseRealtimeQuote(codes);
                break;
            }

            if (quotes.length > 0) {
              this.updateHealthStatus(source, true);
              break;
            }
          } catch (error) {
            this.updateHealthStatus(source, false);
          }
        }
      }
    }

    return quotes;
  }

  // 获取数据源状态
  getDataSourceStatus(): Map<EnhancedDataSourceType, DataSourceHealth> {
    return this.healthStatus;
  }
}

// 导出单例
export const enhancedDataSourceManager = new EnhancedDataSourceManager();
export const getEnhancedDataSource = () => enhancedDataSourceManager;