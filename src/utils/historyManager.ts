// 历史记录管理模块

export type HistoryRecordType = 'signal_buy' | 'signal_sell' | 'ai_analysis' | 'prediction' | 'portfolio_update' | 'trade' | 'social_post' | 'social_like' | 'social_comment' | 'social_follow';

export interface HistoryRecord {
  id: string;
  type: HistoryRecordType;
  timestamp: number;
  stockCode?: string;
  stockName?: string;
  title: string;
  description: string;
  metadata?: Record<string, any>;
}

const STORAGE_KEY = 'aiInvestmentHistory';
const MAX_RECORDS = 1000; // 最多保存1000条记录

class HistoryManager {
  private records: HistoryRecord[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        this.records = JSON.parse(saved);
      }
    } catch (error) {
      console.error('加载历史记录失败:', error);
      this.records = [];
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.records));
    } catch (error) {
      console.error('保存历史记录失败:', error);
    }
  }

  addRecord(record: Omit<HistoryRecord, 'id' | 'timestamp'>): HistoryRecord {
    const newRecord: HistoryRecord = {
      ...record,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now()
    };

    this.records.unshift(newRecord);

    // 限制记录数量
    if (this.records.length > MAX_RECORDS) {
      this.records = this.records.slice(0, MAX_RECORDS);
    }

    this.saveToStorage();
    return newRecord;
  }

  getRecords(options?: {
    type?: HistoryRecordType | HistoryRecordType[];
    stockCode?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): HistoryRecord[] {
    let filtered = [...this.records];

    if (options?.type) {
      const types = Array.isArray(options.type) ? options.type : [options.type];
      filtered = filtered.filter(record => types.includes(record.type));
    }

    if (options?.stockCode) {
      filtered = filtered.filter(record => record.stockCode === options.stockCode);
    }

    if (options?.startDate) {
      filtered = filtered.filter(record => record.timestamp >= options.startDate!.getTime());
    }

    if (options?.endDate) {
      filtered = filtered.filter(record => record.timestamp <= options.endDate!.getTime());
    }

    if (options?.limit) {
      filtered = filtered.slice(0, options.limit);
    }

    return filtered;
  }

  deleteRecord(id: string): boolean {
    const index = this.records.findIndex(record => record.id === id);
    if (index !== -1) {
      this.records.splice(index, 1);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  clearRecords(): void {
    this.records = [];
    this.saveToStorage();
  }

  clearOldRecords(days: number = 30): number {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    const originalLength = this.records.length;
    this.records = this.records.filter(record => record.timestamp >= cutoff);
    const deleted = originalLength - this.records.length;
    this.saveToStorage();
    return deleted;
  }

  getStatistics(): {
    total: number;
    byType: Record<HistoryRecordType, number>;
    today: number;
    thisWeek: number;
  } {
    const now = Date.now();
    const todayStart = new Date().setHours(0, 0, 0, 0);
    const weekStart = todayStart - 7 * 24 * 60 * 60 * 1000;

    const byType: Record<HistoryRecordType, number> = {
      signal_buy: 0,
      signal_sell: 0,
      ai_analysis: 0,
      prediction: 0,
      portfolio_update: 0,
      trade: 0,
      social_post: 0,
      social_like: 0,
      social_comment: 0,
      social_follow: 0
    };

    let today = 0;
    let thisWeek = 0;

    this.records.forEach(record => {
      byType[record.type]++;
      if (record.timestamp >= todayStart) today++;
      if (record.timestamp >= weekStart) thisWeek++;
    });

    return {
      total: this.records.length,
      byType,
      today,
      thisWeek
    };
  }

  // 便捷方法：记录买入信号
  recordBuySignal(stockCode: string, stockName: string, reason: string, metadata?: Record<string, any>): HistoryRecord {
    return this.addRecord({
      type: 'signal_buy',
      stockCode,
      stockName,
      title: `买入信号 - ${stockName}(${stockCode})`,
      description: reason,
      metadata
    });
  }

  // 便捷方法：记录卖出信号
  recordSellSignal(stockCode: string, stockName: string, reason: string, metadata?: Record<string, any>): HistoryRecord {
    return this.addRecord({
      type: 'signal_sell',
      stockCode,
      stockName,
      title: `卖出信号 - ${stockName}(${stockCode})`,
      description: reason,
      metadata
    });
  }

  // 便捷方法：记录AI分析
  recordAIAnalysis(stockCode: string, stockName: string, analysis: string, metadata?: Record<string, any>): HistoryRecord {
    return this.addRecord({
      type: 'ai_analysis',
      stockCode,
      stockName,
      title: `AI分析 - ${stockName}(${stockCode})`,
      description: analysis,
      metadata
    });
  }

  // 便捷方法：记录预测
  recordPrediction(stockCode: string, stockName: string, prediction: string, metadata?: Record<string, any>): HistoryRecord {
    return this.addRecord({
      type: 'prediction',
      stockCode,
      stockName,
      title: `价格预测 - ${stockName}(${stockCode})`,
      description: prediction,
      metadata
    });
  }
}

let historyManagerInstance: HistoryManager | null = null;

export const getHistoryManager = (): HistoryManager => {
  if (!historyManagerInstance) {
    historyManagerInstance = new HistoryManager();
  }
  return historyManagerInstance;
};
