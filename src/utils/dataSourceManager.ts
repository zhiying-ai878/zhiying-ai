import { LogLevel } from './stockData';

interface DataSource {
  id: string;
  name: string;
  url: string;
  type: 'primary' | 'secondary' | 'backup';
  reliability: number; // 0-100
  lastUsed: Date | null;
  isHealthy: boolean;
  apiKey?: string;
}

interface DataSourceStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  lastRequestTime: Date | null;
  lastError: string | null;
}

class DataSourceManager {
  private dataSources: Map<string, DataSource> = new Map();
  private dataSourceStats: Map<string, DataSourceStats> = new Map();
  private currentPrimarySource: string | null = null;

  constructor() {
    this.initializeDataSources();
  }

  private initializeDataSources() {
    // 添加多个数据源
    this.addDataSource({
      id: 'sina',
      name: '新浪财经',
      url: 'https://finance.sina.com.cn',
      type: 'primary',
      reliability: 95,
      lastUsed: null,
      isHealthy: true
    });

    this.addDataSource({
      id: 'eastmoney',
      name: '东方财富',
      url: 'https://www.eastmoney.com',
      type: 'primary',
      reliability: 90,
      lastUsed: null,
      isHealthy: true
    });

    this.addDataSource({
      id: 'tushare',
      name: 'TuShare',
      url: 'https://tushare.pro',
      type: 'secondary',
      reliability: 85,
      lastUsed: null,
      isHealthy: true,
      apiKey: process.env.TUSHARE_API_KEY
    });

    this.addDataSource({
      id: '1688',
      name: '同花顺',
      url: 'https://www.10jqka.com.cn',
      type: 'secondary',
      reliability: 80,
      lastUsed: null,
      isHealthy: true
    });

    this.addDataSource({
      id: 'xueqiu',
      name: '雪球',
      url: 'https://xueqiu.com',
      type: 'backup',
      reliability: 75,
      lastUsed: null,
      isHealthy: true
    });

    // 设置默认主数据源
    this.currentPrimarySource = 'sina';
  }

  private addDataSource(source: DataSource) {
    this.dataSources.set(source.id, source);
    this.dataSourceStats.set(source.id, {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      lastRequestTime: null,
      lastError: null
    });
  }

  public getAvailableDataSources(): DataSource[] {
    return Array.from(this.dataSources.values()).filter(source => source.isHealthy);
  }

  public getPrimaryDataSources(): DataSource[] {
    return Array.from(this.dataSources.values()).filter(source => source.type === 'primary' && source.isHealthy);
  }

  public getSecondaryDataSources(): DataSource[] {
    return Array.from(this.dataSources.values()).filter(source => source.type === 'secondary' && source.isHealthy);
  }

  public getBackupDataSources(): DataSource[] {
    return Array.from(this.dataSources.values()).filter(source => source.type === 'backup' && source.isHealthy);
  }

  public async fetchData(sourceId: string, endpoint: string, params: any): Promise<any> {
    const source = this.dataSources.get(sourceId);
    if (!source || !source.isHealthy) {
      throw new Error(`DataSource ${sourceId} is not available`);
    }

    const startTime = Date.now();
    const stats = this.dataSourceStats.get(sourceId)!;
    stats.totalRequests++;

    try {
      // 这里应该根据不同的数据源实现不同的API调用
      // 暂时返回模拟数据
      console.log(`Fetching data from ${source.name} (${sourceId})`);
      
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));
      
      // 模拟成功率90%
      if (Math.random() > 0.1) {
        stats.successfulRequests++;
        stats.lastRequestTime = new Date();
        source.lastUsed = new Date();
        
        const responseTime = Date.now() - startTime;
        stats.averageResponseTime = (stats.averageResponseTime * (stats.successfulRequests - 1) + responseTime) / stats.successfulRequests;
        
        return {
          success: true,
          data: {
            stockCode: params.stockCode,
            price: 100 + Math.random() * 50,
            timestamp: new Date().toISOString()
          },
          source: source.name
        };
      } else {
        throw new Error('Simulated API error');
      }
    } catch (error) {
      stats.failedRequests++;
      stats.lastRequestTime = new Date();
      stats.lastError = error instanceof Error ? error.message : 'Unknown error';
      
      // 如果主数据源失败，标记为不健康并切换到备用数据源
      if (source.type === 'primary') {
        source.isHealthy = false;
        console.warn(`Primary data source ${sourceId} failed, switching to backup`);
        this.switchToBackupSource();
      }
      
      throw error;
    }
  }

  public async fetchDataWithFallback(endpoint: string, params: any): Promise<any> {
    // 首先尝试主数据源
    const primarySources = this.getPrimaryDataSources();
    for (const source of primarySources) {
      try {
        return await this.fetchData(source.id, endpoint, params);
      } catch (error) {
        console.warn(`Primary source ${source.id} failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // 主数据源失败，尝试次要数据源
    const secondarySources = this.getSecondaryDataSources();
    for (const source of secondarySources) {
      try {
        return await this.fetchData(source.id, endpoint, params);
      } catch (error) {
        console.warn(`Secondary source ${source.id} failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // 次要数据源失败，尝试备份数据源
    const backupSources = this.getBackupDataSources();
    for (const source of backupSources) {
      try {
        return await this.fetchData(source.id, endpoint, params);
      } catch (error) {
        console.warn(`Backup source ${source.id} failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // 所有数据源都失败
    throw new Error('All data sources failed');
  }

  private switchToBackupSource() {
    // 找到可靠性最高的备用主数据源
    const primarySources = this.getPrimaryDataSources();
    if (primarySources.length > 0) {
      const bestSource = primarySources.reduce((best, current) => 
        current.reliability > best.reliability ? current : best
      );
      this.currentPrimarySource = bestSource.id;
      console.log(`Switched primary data source to ${bestSource.name} (${bestSource.id})`);
    } else {
      // 没有主数据源可用，尝试使用次要数据源
      const secondarySources = this.getSecondaryDataSources();
      if (secondarySources.length > 0) {
        const bestSource = secondarySources.reduce((best, current) => 
          current.reliability > best.reliability ? current : best
        );
        this.currentPrimarySource = bestSource.id;
        console.warn(`No primary data sources available, using secondary source ${bestSource.name} (${bestSource.id})`);
      }
    }
  }

  public getDataSourceStats(): Map<string, DataSourceStats> {
    return this.dataSourceStats;
  }

  public getDataSourceStatus(): { id: string; name: string; type: string; reliability: number; isHealthy: boolean; stats: DataSourceStats }[] {
    return Array.from(this.dataSources.entries()).map(([id, source]) => ({
      id,
      name: source.name,
      type: source.type,
      reliability: source.reliability,
      isHealthy: source.isHealthy,
      stats: this.dataSourceStats.get(id)!
    }));
  }

  public async checkDataSourceHealth(sourceId: string): Promise<boolean> {
    const source = this.dataSources.get(sourceId);
    if (!source) {
      return false;
    }

    try {
      // 发送健康检查请求
      await this.fetchData(sourceId, '/health', {});
      source.isHealthy = true;
      console.log(`DataSource ${sourceId} is healthy`);
      return true;
    } catch (error) {
      source.isHealthy = false;
      console.warn(`DataSource ${sourceId} is unhealthy: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }

  public async checkAllDataSourcesHealth() {
    const sourceIds = Array.from(this.dataSources.keys());
    for (const sourceId of sourceIds) {
      await this.checkDataSourceHealth(sourceId);
    }
  }
}

// 导出单例
const dataSourceManager = new DataSourceManager();
export default dataSourceManager;
export type { DataSource, DataSourceStats };
export { DataSourceManager };
