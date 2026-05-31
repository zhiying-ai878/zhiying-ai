import { DataSourceType } from './stockData';
import { enhancedDataSourceManager } from './enhancedDataSourceManager';

// 数据源适配器，将增强数据源包装为StockDataSource接口
export class EnhancedDataSourceAdapter {
  private sourceType: DataSourceType;

  constructor(sourceType: DataSourceType = 'tencent') {
    this.sourceType = sourceType;
  }

  // 实现StockDataSource接口的所有方法
  async getRealtimeQuote(codes: string[]) {
    return enhancedDataSourceManager.getRealtimeQuote(codes);
  }

  async getKlineData(code: string, period: string, size: number) {
    // 暂时使用原有的实现，后续可以优化
    const originalDataSource = this.getOriginalDataSource();
    return originalDataSource.getKlineData(code, period, size);
  }

  async getMainForceData(codes: string[]) {
    // 暂时使用原有的实现，后续可以优化
    const originalDataSource = this.getOriginalDataSource();
    return originalDataSource.getMainForceData(codes);
  }

  async getMarketOverview() {
    // 暂时使用原有的实现，后续可以优化
    const originalDataSource = this.getOriginalDataSource();
    return originalDataSource.getMarketOverview();
  }

  async getIndustryData() {
    // 暂时使用原有的实现，后续可以优化
    const originalDataSource = this.getOriginalDataSource();
    return originalDataSource.getIndustryData();
  }

  // 获取原始数据源（用于未实现的方法）
  private getOriginalDataSource() {
    // 动态导入原始的StockDataSource
    const { getStockDataSource } = require('./stockData');
    return getStockDataSource(this.sourceType);
  }

  // 其他方法的实现...
  setSourceType(type: DataSourceType) {
    this.sourceType = type;
  }

  getSourceType() {
    return this.sourceType;
  }

  getHealthStatus(source?: DataSourceType) {
    return enhancedDataSourceManager.getDataSourceStatus();
  }

  async switchDataSource(source: DataSourceType) {
    this.sourceType = source;
    return true;
  }

  getPerformanceStats(source: DataSourceType) {
    return null;
  }

  getDataSourceStatus() {
    return enhancedDataSourceManager.getDataSourceStatus();
  }
}

// 导出增强的数据源获取函数
export const getEnhancedStockDataSource = (sourceType?: DataSourceType) => {
  return new EnhancedDataSourceAdapter(sourceType);
};

// 覆盖默认的数据源获取函数
export const getStockDataSource = getEnhancedStockDataSource;