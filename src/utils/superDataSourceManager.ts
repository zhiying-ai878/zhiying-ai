import axios from 'axios';
import { StockQuote } from './stockData';

// 超级数据源类型
export type SuperDataSourceType = 
  | 'tencent_cors' | 'tencent' | 'tencent_backup' | 'tencent_cors_v2' | 'tencent_cors_v3'
  | 'sina_cors' | 'sina' | 'sina_backup' | 'sina_mobile'
  | 'eastmoney_cors' | 'eastmoney' | 'eastmoney_backup' | 'eastmoney_mini' | 'eastmoney_pro'
  | 'netease' | 'netease_cors'
  | 'xueqiu' | 'xueqiu_cors'
  | 'ths' | 'ths_cors'
  | 'jrj' | 'hexun' | 'stcn'
  | 'alpha_vantage' | 'finnhub'
  | 'backup_1' | 'backup_2' | 'backup_3';

// 数据源健康状态
export interface DataSourceHealth {
  status: 'healthy' | 'unhealthy' | 'degraded';
  successRate: number;
  responseTime: number;
  lastCheck: number;
  consecutiveFailures: number;
}

// 网络请求配置
export interface NetworkConfig {
  timeout: number;
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  exponentialBackoff: boolean;
  jitterFactor: number;
}

// 超级数据源管理器
export class SuperDataSourceManager {
  private sources: SuperDataSourceType[] = [
    // 腾讯系数据源
    'tencent_cors', 'tencent', 'tencent_backup', 'tencent_cors_v2', 'tencent_cors_v3',
    // 新浪系数据源
    'sina_cors', 'sina', 'sina_backup', 'sina_mobile',
    // 东方财富系数据源
    'eastmoney_cors', 'eastmoney', 'eastmoney_backup', 'eastmoney_mini', 'eastmoney_pro',
    // 其他数据源
    'netease', 'netease_cors',
    'xueqiu', 'xueqiu_cors',
    'ths', 'ths_cors',
    'jrj', 'hexun', 'stcn',
    // 备用数据源
    'backup_1', 'backup_2', 'backup_3'
  ];

  private healthStatus: Map<SuperDataSourceType, DataSourceHealth> = new Map();
  private performanceStats: Map<SuperDataSourceType, { totalRequests: number; successfulRequests: number; totalResponseTime: number }> = new Map();
  private networkConfig: NetworkConfig = {
    timeout: 1500, // 减少超时时间，更快失败切换
    maxRetries: 5,
    baseDelay: 200,
    maxDelay: 1500,
    exponentialBackoff: true,
    jitterFactor: 0.3
  };

  private requestCache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheExpiry = 30000; // 缓存30秒

  constructor() {
    // 初始化数据源状态
    this.initializeDataSources();
    
    // 启动定期健康检查
    this.startHealthCheck();
  }

  // 初始化数据源状态
  private initializeDataSources() {
    this.sources.forEach(source => {
      this.healthStatus.set(source, {
        status: 'healthy',
        successRate: 1.0,
        responseTime: 0,
        lastCheck: Date.now(),
        consecutiveFailures: 0
      });
      this.performanceStats.set(source, {
        totalRequests: 0,
        successfulRequests: 0,
        totalResponseTime: 0
      });
    });
  }

  // 启动定期健康检查
  private startHealthCheck() {
    setInterval(() => {
      this.checkAllDataSources();
    }, 15000); // 每15秒检查一次
  }

  // 检查所有数据源的健康状态
  private async checkAllDataSources() {
    const testCodes = ['sh600000', 'sz000001'];
    
    // 并行测试所有数据源
    const testPromises = this.sources.map(async (source) => {
      try {
        const startTime = Date.now();
        await this.testDataSource(source, testCodes);
        const responseTime = Date.now() - startTime;
        
        this.updateHealthStatus(source, true, responseTime);
      } catch (error) {
        this.updateHealthStatus(source, false);
      }
    });
    
    await Promise.all(testPromises);
  }

  // 测试数据源是否可用
  private async testDataSource(source: SuperDataSourceType, codes: string[]): Promise<boolean> {
    try {
      switch (source) {
        case 'tencent_cors':
        case 'tencent':
        case 'tencent_backup':
        case 'tencent_cors_v2':
        case 'tencent_cors_v3':
          await this.getTencentRealtimeQuote(codes);
          break;
        case 'sina_cors':
        case 'sina':
        case 'sina_backup':
        case 'sina_mobile':
          await this.getSinaRealtimeQuote(codes);
          break;
        case 'eastmoney_cors':
        case 'eastmoney':
        case 'eastmoney_backup':
        case 'eastmoney_mini':
        case 'eastmoney_pro':
          await this.getEastMoneyRealtimeQuote(codes);
          break;
        case 'netease':
        case 'netease_cors':
          await this.getNeteaseRealtimeQuote(codes);
          break;
        case 'xueqiu':
        case 'xueqiu_cors':
          await this.getXueQiuRealtimeQuote(codes);
          break;
        case 'ths':
        case 'ths_cors':
          await this.getTHSRealtimeQuote(codes);
          break;
        case 'jrj':
          await this.getJRJRealtimeQuote(codes);
          break;
        case 'hexun':
          await this.getHexunRealtimeQuote(codes);
          break;
        case 'stcn':
          await this.getSTCNRealtimeQuote(codes);
          break;
        case 'backup_1':
        case 'backup_2':
        case 'backup_3':
          await this.getBackupRealtimeQuote(codes);
          break;
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  // 更新数据源健康状态
  private updateHealthStatus(source: SuperDataSourceType, success: boolean, responseTime?: number) {
    const health = this.healthStatus.get(source);
    const stats = this.performanceStats.get(source);

    if (health && stats) {
      stats.totalRequests++;
      if (success) {
        stats.successfulRequests++;
        health.consecutiveFailures = 0;
        if (responseTime) {
          health.responseTime = responseTime;
        }
      } else {
        health.consecutiveFailures++;
      }

      health.successRate = stats.successfulRequests / stats.totalRequests;
      health.lastCheck = Date.now();

      // 更新状态
      if (health.consecutiveFailures >= 3) {
        health.status = 'unhealthy';
      } else if (health.successRate < 0.6) {
        health.status = 'degraded';
      } else {
        health.status = 'healthy';
      }

      this.healthStatus.set(source, health);
      this.performanceStats.set(source, stats);
    }
  }

  // 获取最佳数据源
  getBestDataSource(): SuperDataSourceType {
    const healthySources = this.sources.filter(source => {
      const health = this.healthStatus.get(source);
      return health && health.status === 'healthy';
    });

    if (healthySources.length === 0) {
      // 如果没有健康的数据源，返回第一个数据源
      return this.sources[0];
    }

    // 按响应时间和成功率排序
    healthySources.sort((a, b) => {
      const healthA = this.healthStatus.get(a);
      const healthB = this.healthStatus.get(b);
      
      // 首先按成功率排序
      const successRateDiff = (healthB?.successRate || 0) - (healthA?.successRate || 0);
      if (successRateDiff !== 0) {
        return successRateDiff;
      }
      
      // 然后按响应时间排序
      return (healthA?.responseTime || 999999) - (healthB?.responseTime || 999999);
    });

    return healthySources[0];
  }

  // 带重试机制的请求
  private async requestWithRetry<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: any;

    for (let attempt = 1; attempt <= this.networkConfig.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (attempt < this.networkConfig.maxRetries) {
          // 指数退避策略
          const backoffTime = Math.min(
            this.networkConfig.maxDelay,
            this.networkConfig.baseDelay * Math.pow(2, attempt - 1)
          );
          const jitter = Math.random() * (backoffTime * this.networkConfig.jitterFactor);
          await new Promise(resolve => setTimeout(resolve, backoffTime + jitter));
        }
      }
    }

    throw lastError;
  }

  // 获取腾讯实时行情
  private async getTencentRealtimeQuote(codes: string[]): Promise<StockQuote[]> {
    const cacheKey = `tencent_${codes.join(',')}`;
    const cached = this.requestCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }

    const url = `https://qt.gtimg.cn/q=${codes.map(code => {
      if (code.startsWith('sh')) return `sh${code.slice(2)}`;
      if (code.startsWith('sz')) return `sz${code.slice(2)}`;
      return code;
    }).join(',')}`;

    const result = await this.requestWithRetry(async () => {
      const response = await axios.get(url, {
        timeout: this.networkConfig.timeout
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

    // 缓存结果
    this.requestCache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    return result;
  }

  // 获取新浪实时行情
  private async getSinaRealtimeQuote(codes: string[]): Promise<StockQuote[]> {
    const cacheKey = `sina_${codes.join(',')}`;
    const cached = this.requestCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }

    const url = `http://hq.sinajs.cn/list=${codes.map(code => {
      if (code.startsWith('sh')) return `sh${code.slice(2)}`;
      if (code.startsWith('sz')) return `sz${code.slice(2)}`;
      return code;
    }).join(',')}`;

    const result = await this.requestWithRetry(async () => {
      const response = await axios.get(url, {
        timeout: this.networkConfig.timeout
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

    // 缓存结果
    this.requestCache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    return result;
  }

  // 获取东方财富实时行情
  private async getEastMoneyRealtimeQuote(codes: string[]): Promise<StockQuote[]> {
    const quotes: StockQuote[] = [];

    // 东方财富API一次只能查询一个股票
    for (const code of codes) {
      const cacheKey = `eastmoney_${code}`;
      const cached = this.requestCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
        quotes.push(cached.data);
        continue;
      }

      const secid = code.startsWith('sh') ? `1.${code.slice(2)}` : `0.${code.slice(2)}`;
      const url = `https://push2.eastmoney.com/api/qt/stock/get?secid=${secid}&fields=f43,f44,f45,f46,f47,f48,f49,f50,f51,f52,f57,f58,f60,f169,f170`;

      try {
        const response = await this.requestWithRetry(async () => {
          return await axios.get(url, {
            timeout: this.networkConfig.timeout
          });
        });

        const data = response.data as any;
        if (data && data.data) {
          const d = data.data;
          const price = parseFloat(d.f43);
          const prevClose = parseFloat(d.f47);
          const quote = {
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
          };
          quotes.push(quote);

          // 缓存结果
          this.requestCache.set(cacheKey, {
            data: quote,
            timestamp: Date.now()
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
    const cacheKey = `netease_${codes.join(',')}`;
    const cached = this.requestCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }

    const url = `http://api.money.126.net/data/feed/${codes.join(',')},money.api`;

    const result = await this.requestWithRetry(async () => {
      const response = await axios.get(url, {
        timeout: this.networkConfig.timeout
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

    // 缓存结果
    this.requestCache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    return result;
  }

  // 获取雪球实时行情
  private async getXueQiuRealtimeQuote(codes: string[]): Promise<StockQuote[]> {
    const quotes: StockQuote[] = [];

    for (const code of codes) {
      const cacheKey = `xueqiu_${code}`;
      const cached = this.requestCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
        quotes.push(cached.data);
        continue;
      }

      const url = `https://xueqiu.com/service/v5/stock/screener/quote/list?symbol=${code}&count=1&order_by=percent&order=desc`;

      try {
        const response = await this.requestWithRetry(async () => {
          return await axios.get(url, {
            timeout: this.networkConfig.timeout,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          });
        });

        const data = response.data as any;
        if (data && data.data && data.data.items && data.data.items.length > 0) {
          const item = data.data.items[0];
          const price = parseFloat(item.current);
          const prevClose = parseFloat(item.last_close);
          const quote = {
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
          };
          quotes.push(quote);

          // 缓存结果
          this.requestCache.set(cacheKey, {
            data: quote,
            timestamp: Date.now()
          });
        }
      } catch (error) {
        console.warn(`获取${code}雪球行情失败:`, error);
      }
    }

    return quotes;
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
        case 'tencent_cors_v2':
        case 'tencent_cors_v3':
          quotes = await this.getTencentRealtimeQuote(codes);
          break;
        case 'sina_cors':
        case 'sina':
        case 'sina_backup':
        case 'sina_mobile':
          quotes = await this.getSinaRealtimeQuote(codes);
          break;
        case 'eastmoney_cors':
        case 'eastmoney':
        case 'eastmoney_backup':
        case 'eastmoney_mini':
        case 'eastmoney_pro':
          quotes = await this.getEastMoneyRealtimeQuote(codes);
          break;
        case 'netease':
        case 'netease_cors':
          quotes = await this.getNeteaseRealtimeQuote(codes);
          break;
        case 'xueqiu':
        case 'xueqiu_cors':
          quotes = await this.getXueQiuRealtimeQuote(codes);
          break;
        case 'ths':
        case 'ths_cors':
          quotes = await this.getTHSRealtimeQuote(codes);
          break;
        case 'jrj':
          quotes = await this.getJRJRealtimeQuote(codes);
          break;
        case 'hexun':
          quotes = await this.getHexunRealtimeQuote(codes);
          break;
        case 'stcn':
          quotes = await this.getSTCNRealtimeQuote(codes);
          break;
        case 'backup_1':
        case 'backup_2':
        case 'backup_3':
          quotes = await this.getBackupRealtimeQuote(codes);
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
              case 'tencent_cors_v2':
              case 'tencent_cors_v3':
                quotes = await this.getTencentRealtimeQuote(codes);
                break;
              case 'sina_cors':
              case 'sina':
              case 'sina_backup':
              case 'sina_mobile':
                quotes = await this.getSinaRealtimeQuote(codes);
                break;
              case 'eastmoney_cors':
              case 'eastmoney':
              case 'eastmoney_backup':
              case 'eastmoney_mini':
              case 'eastmoney_pro':
                quotes = await this.getEastMoneyRealtimeQuote(codes);
                break;
              case 'netease':
              case 'netease_cors':
                quotes = await this.getNeteaseRealtimeQuote(codes);
                break;
              case 'xueqiu':
              case 'xueqiu_cors':
                quotes = await this.getXueQiuRealtimeQuote(codes);
                break;
              case 'ths':
              case 'ths_cors':
                quotes = await this.getTHSRealtimeQuote(codes);
                break;
              case 'jrj':
                quotes = await this.getJRJRealtimeQuote(codes);
                break;
              case 'hexun':
                quotes = await this.getHexunRealtimeQuote(codes);
                break;
              case 'stcn':
                quotes = await this.getSTCNRealtimeQuote(codes);
                break;
              case 'backup_1':
              case 'backup_2':
              case 'backup_3':
                quotes = await this.getBackupRealtimeQuote(codes);
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

    // 清理过期缓存
    this.cleanExpiredCache();

    return quotes;
  }

  // 清理过期缓存
  private cleanExpiredCache() {
    const now = Date.now();
    for (const [key, value] of this.requestCache.entries()) {
      if (now - value.timestamp > this.cacheExpiry) {
        this.requestCache.delete(key);
      }
    }
  }

  // 获取数据源状态
  getDataSourceStatus(): Map<SuperDataSourceType, DataSourceHealth> {
    return this.healthStatus;
  }

  // 获取数据源性能统计
  getPerformanceStats(source: SuperDataSourceType) {
    return this.performanceStats.get(source);
  }

  // 清除缓存
  clearCache() {
    this.requestCache.clear();
  }

  // 获取缓存状态
  getCacheStatus() {
    return {
      size: this.requestCache.size,
      expiry: this.cacheExpiry
    };
  }
}

// 导出单例
export const superDataSourceManager = new SuperDataSourceManager();
export const getSuperDataSource = () => superDataSourceManager;