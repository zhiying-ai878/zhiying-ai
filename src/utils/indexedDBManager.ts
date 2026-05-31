export interface IndexedDBSignal {
  id: string;
  stockCode: string;
  stockName: string;
  type: 'buy' | 'sell';
  score: number;
  confidence: number;
  reason: string;
  timestamp: number;
  isRead: boolean;
  isAuctionPeriod?: boolean;
  mainForceFlow?: number;
  mainForceRatio?: number;
  volumeAmplification?: number;
  turnoverRate?: number;
  price?: number;
  targetPrice?: number;
  created_at?: number;
  updated_at?: number;
}

export interface IndexedDBPosition {
  stockCode: string;
  stockName: string;
  entryPrice: number;
  volume: number;
  entryTime: number;
  created_at?: number;
  updated_at?: number;
}

export interface IndexedDBStockDataHistory {
  id?: number;
  stockCode: string;
  stockName: string;
  currentPrice: number;
  mainForceNetFlow?: number;
  totalNetFlow?: number;
  superLargeOrderFlow?: number;
  largeOrderFlow?: number;
  mediumOrderFlow?: number;
  smallOrderFlow?: number;
  volumeAmplification?: number;
  turnoverRate?: number;
  timestamp: number;
  created_at?: number;
}

export interface IndexedDBAIModelState {
  modelId: string;
  modelType: string;
  modelData: any;
  trainingData: any[];
  performance: any;
  lastUpdated: number;
  version: number;
}

export interface IndexedDBAAlert {
  id: string;
  stockCode: string;
  stockName: string;
  alertType: string;
  condition: any;
  isActive: boolean;
  triggerCount: number;
  lastTriggered?: number;
  created_at: number;
  updated_at: number;
}

export interface IndexedDBStrategy {
  id: string;
  name: string;
  description?: string;
  parameters: any;
  isActive: boolean;
  created_at: number;
  updated_at: number;
}

export interface IndexedDBBacktest {
  id: string;
  strategyId: string;
  strategyName: string;
  startDate: number;
  endDate: number;
  initialCapital: number;
  finalCapital: number;
  totalReturn: number;
  winRate: number;
  maxDrawdown: number;
  tradeCount: number;
  results: any;
  created_at: number;
}

export interface IndexedDBOptimizationParams {
  id: string;
  buySignalThreshold?: number;
  sellSignalThreshold?: number;
  specialSignalThreshold?: number;
  targetPriceMultiplier?: number;
  predictionConfidence?: number;
  rsiWeight?: number;
  macdWeight?: number;
  kdjWeight?: number;
  volumeWeight?: number;
  priceChangeWeight?: number;
  savedAt?: number;
  buySuccessRate?: number;
  sellSuccessRate?: number;
  specialSuccessRate?: number;
  averageProfit?: number;
  overallConfidence?: number;
  timestamp?: number;
}

export interface IndexedDBSignalResult {
  id: string;
  signalId: string;
  stockCode: string;
  signalType: 'buy' | 'sell' | 'special';
  signalPrice: number;
  signalTime: number;
  confidence: number;
  futurePrice1d: number | null;
  futurePrice3d: number | null;
  futurePrice5d: number | null;
  futurePrice10d: number | null;
  profit1d: number | null;
  profit3d: number | null;
  profit5d: number | null;
  created_at?: number;
  profit10d: number | null;
  success: boolean;
}

export interface IndexedDBOptimizationHistory {
  id: string;
  timestamp: number;
  performance: any;
  marketFeatures: any;
  oldParams: any;
  newParams: any;
  changes: any;
}

import { DataCompression } from './dataCompression';

export class IndexedDBManager {
  private static instance: IndexedDBManager;
  private db: IDBDatabase | null = null;
  private dbName = 'zhiying-ai-db';
  private dbVersion = 3;
  private dataCompression: DataCompression;
  private cleanupTimer: number | null = null;

  private constructor() {
    this.dataCompression = DataCompression.getInstance();
    this.startCleanupTimer();
  }

  public static getInstance(): IndexedDBManager {
    if (!IndexedDBManager.instance) {
      IndexedDBManager.instance = new IndexedDBManager();
    }
    return IndexedDBManager.instance;
  }

  private startCleanupTimer(): void {
    // 每天执行一次数据清理
    this.cleanupTimer = window.setInterval(() => {
      this.cleanupOldData();
    }, 24 * 60 * 60 * 1000);
  }

  private stopCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  public async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.db) {
        resolve();
        return;
      }

      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('signals')) {
          const signalsStore = db.createObjectStore('signals', { keyPath: 'id' });
          signalsStore.createIndex('stockCode', 'stockCode', { unique: false });
          signalsStore.createIndex('timestamp', 'timestamp', { unique: false });
          signalsStore.createIndex('type', 'type', { unique: false });
          signalsStore.createIndex('isRead', 'isRead', { unique: false });
        }

        if (!db.objectStoreNames.contains('positions')) {
          const positionsStore = db.createObjectStore('positions', { keyPath: 'stockCode' });
          positionsStore.createIndex('stockCode', 'stockCode', { unique: true });
        }

        if (!db.objectStoreNames.contains('stockDataHistory')) {
          const historyStore = db.createObjectStore('stockDataHistory', { keyPath: 'id', autoIncrement: true });
          historyStore.createIndex('stockCode', 'stockCode', { unique: false });
          historyStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('aiModelState')) {
          const modelStore = db.createObjectStore('aiModelState', { keyPath: 'modelId' });
          modelStore.createIndex('modelType', 'modelType', { unique: false });
          modelStore.createIndex('lastUpdated', 'lastUpdated', { unique: false });
        }

        if (!db.objectStoreNames.contains('alerts')) {
          const alertsStore = db.createObjectStore('alerts', { keyPath: 'id' });
          alertsStore.createIndex('stockCode', 'stockCode', { unique: false });
          alertsStore.createIndex('isActive', 'isActive', { unique: false });
          alertsStore.createIndex('alertType', 'alertType', { unique: false });
        }

        if (!db.objectStoreNames.contains('strategies')) {
          const strategiesStore = db.createObjectStore('strategies', { keyPath: 'id' });
          strategiesStore.createIndex('isActive', 'isActive', { unique: false });
        }

        if (!db.objectStoreNames.contains('backtests')) {
          const backtestsStore = db.createObjectStore('backtests', { keyPath: 'id' });
          backtestsStore.createIndex('strategyId', 'strategyId', { unique: false });
          backtestsStore.createIndex('created_at', 'created_at', { unique: false });
        }

        if (!db.objectStoreNames.contains('optimizationParams')) {
          const paramsStore = db.createObjectStore('optimizationParams', { keyPath: 'id' });
          paramsStore.createIndex('savedAt', 'savedAt', { unique: false });
        }

        if (!db.objectStoreNames.contains('signalResults')) {
          const resultsStore = db.createObjectStore('signalResults', { keyPath: 'id' });
          resultsStore.createIndex('signalId', 'signalId', { unique: false });
          resultsStore.createIndex('stockCode', 'stockCode', { unique: false });
          resultsStore.createIndex('signalType', 'signalType', { unique: false });
          resultsStore.createIndex('signalTime', 'signalTime', { unique: false });
        }

        if (!db.objectStoreNames.contains('optimizationHistory')) {
          const historyStore = db.createObjectStore('optimizationHistory', { keyPath: 'id' });
          historyStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        console.log('IndexedDB initialized successfully');
        resolve();
      };

      request.onerror = (event) => {
        console.error('IndexedDB initialization failed:', (event.target as IDBOpenDBRequest).error);
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  }

  public async close(): Promise<void> {
    this.stopCleanupTimer();
    if (this.db) {
      this.db.close();
      this.db = null;
      console.log('IndexedDB connection closed');
    }
  }

  public async addSignal(signal: IndexedDBSignal): Promise<void> {
    await this.init();
    return new Promise(async (resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const MAX_NON_SELL_SIGNALS = 200;

      try {
        // 先添加新信号
        const addTransaction = this.db.transaction('signals', 'readwrite');
        const addStore = addTransaction.objectStore('signals');
        const addRequest = addStore.add(signal);

        await new Promise((res, rej) => {
          addRequest.onsuccess = () => res(undefined);
          addRequest.onerror = (event) => rej((event.target as IDBRequest).error);
        });

        // ====== 【完全禁用】IndexedDB层面的自动清理 ======
        // 用户反馈：信号累加到40多个就开始删除直到0个
        // 原因：IndexedDB层面也有删除逻辑，每次添加信号都会检查并删除
        // 现在只由 optimizedSignalManager 统一管理删除
        const allSignals = await this.getSignals();
        const sellSignals = allSignals.filter(s => s.type === 'sell');
        const nonSellSignals = allSignals.filter(s => s.type !== 'sell');
        
        console.log(`[IndexedDB] 添加信号成功！当前总数: ${allSignals.length}, 卖出: ${sellSignals.length}, 非卖出: ${nonSellSignals.length}`);
        console.log(`[IndexedDB] 【完全禁用】自动清理！信号将无限累积，统一由 SignalManager 管理！`);
        
        if (nonSellSignals.length > MAX_NON_SELL_SIGNALS) {
          console.log(`[IndexedDB] 【警告】非卖出信号已达${nonSellSignals.length}个，超过${MAX_NON_SELL_SIGNALS}限制，但已禁用删除！`);
        }

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  public async addPosition(position: IndexedDBPosition): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction('positions', 'readwrite');
      const store = transaction.objectStore('positions');
      const request = store.put(position);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }

  public async deletePosition(stockCode: string): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction('positions', 'readwrite');
      const store = transaction.objectStore('positions');
      const request = store.delete(stockCode);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }

  public async clearPositions(): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction('positions', 'readwrite');
      const store = transaction.objectStore('positions');
      const request = store.clear();

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }

  public async addStockDataHistory(data: IndexedDBStockDataHistory): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction('stockDataHistory', 'readwrite');
      const store = transaction.objectStore('stockDataHistory');
      const request = store.add(data);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }

  public async addAIModelState(modelState: IndexedDBAIModelState): Promise<void> {
    await this.init();
    return new Promise(async (resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      try {
        // 压缩模型数据以节省存储空间
        const compressedModelData = await this.dataCompression.compressData(modelState.modelData);
        const compressedTrainingData = await this.dataCompression.compressData(modelState.trainingData);
        const compressedPerformance = await this.dataCompression.compressData(modelState.performance);

        const compressedModelState = {
          ...modelState,
          modelData: compressedModelData,
          trainingData: compressedTrainingData,
          performance: compressedPerformance,
          isCompressed: true
        };

        const transaction = this.db.transaction('aiModelState', 'readwrite');
        const store = transaction.objectStore('aiModelState');
        const request = store.put(compressedModelState);

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = (event) => {
          reject((event.target as IDBRequest).error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  public async getSignals(filters?: { type?: 'buy' | 'sell'; isRead?: boolean; limit?: number }): Promise<IndexedDBSignal[]> {
    await this.init();
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction('signals', 'readonly');
      const store = transaction.objectStore('signals');
      let request: IDBRequest;

      if (filters?.type) {
        const index = store.index('type');
        request = index.getAll(filters.type);
      } else if (filters?.isRead !== undefined) {
        const index = store.index('isRead');
        request = index.getAll(filters.isRead as any);
      } else {
        request = store.getAll();
      }

      request.onsuccess = (event) => {
        let results = (event.target as IDBRequest).result as IndexedDBSignal[];
        
        if (filters?.limit) {
          results = results.slice(0, filters.limit);
        }
        
        resolve(results.sort((a, b) => b.timestamp - a.timestamp));
      };

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }

  public async getPositions(): Promise<IndexedDBPosition[]> {
    await this.init();
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction('positions', 'readonly');
      const store = transaction.objectStore('positions');
      const request = store.getAll();

      request.onsuccess = (event) => {
        resolve((event.target as IDBRequest).result as IndexedDBPosition[]);
      };

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }

  public async getStockDataHistory(stockCode: string, limit?: number): Promise<IndexedDBStockDataHistory[]> {
    await this.init();
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction('stockDataHistory', 'readonly');
      const store = transaction.objectStore('stockDataHistory');
      const index = store.index('stockCode');
      const request = index.getAll(stockCode);

      request.onsuccess = (event) => {
        let results = (event.target as IDBRequest).result as IndexedDBStockDataHistory[];
        
        if (limit) {
          results = results.slice(0, limit);
        }
        
        resolve(results.sort((a, b) => b.timestamp - a.timestamp));
      };

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }

  public async getAIModelState(modelId: string): Promise<IndexedDBAIModelState | null> {
    await this.init();
    return new Promise(async (resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction('aiModelState', 'readonly');
      const store = transaction.objectStore('aiModelState');
      const request = store.get(modelId);

      request.onsuccess = async (event) => {
        const modelState = (event.target as IDBRequest).result as any;
        if (modelState) {
          try {
            // 如果数据被压缩，需要解压缩
            if (modelState.isCompressed) {
              const decompressedModelData = await this.dataCompression.decompressData(modelState.modelData);
              const decompressedTrainingData = await this.dataCompression.decompressData(modelState.trainingData);
              const decompressedPerformance = await this.dataCompression.decompressData(modelState.performance);

              const decompressedModelState = {
                ...modelState,
                modelData: decompressedModelData,
                trainingData: decompressedTrainingData,
                performance: decompressedPerformance,
                isCompressed: false
              };

              resolve(decompressedModelState as IndexedDBAIModelState);
            } else {
              resolve(modelState as IndexedDBAIModelState);
            }
          } catch (error) {
            console.error('解压缩模型数据失败', error);
            resolve(modelState as IndexedDBAIModelState);
          }
        } else {
          resolve(null);
        }
      };

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }

  public async updateSignal(signalId: string, updates: Partial<IndexedDBSignal>): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction('signals', 'readwrite');
      const store = transaction.objectStore('signals');
      const request = store.get(signalId);

      request.onsuccess = (event) => {
        const signal = (event.target as IDBRequest).result as IndexedDBSignal;
        if (signal) {
          const updatedSignal = { ...signal, ...updates };
          store.put(updatedSignal);
          resolve();
        } else {
          reject(new Error('Signal not found'));
        }
      };

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }

  public async deleteSignal(signalId: string): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction('signals', 'readwrite');
      const store = transaction.objectStore('signals');
      const request = store.delete(signalId);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }

  public async clearSignals(): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction('signals', 'readwrite');
      const store = transaction.objectStore('signals');
      const request = store.clear();

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }

  // 批量保存所有信号（使用put代替add，确保能更新已存在的记录）
  public async addAllSignals(signals: any[]): Promise<void> {
    await this.init();
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    if (signals.length === 0) {
      return;
    }

    try {
      console.log('开始批量保存' + signals.length + '个信号到数据库');
      
      // 使用put代替add，确保能更新已存在的记录
      const transaction = this.db.transaction('signals', 'readwrite');
      const store = transaction.objectStore('signals');
      
      let savedCount = 0;
      
      for (const signal of signals) {
        try {
          await new Promise<void>((resolve) => {
            // 使用put代替add：put既能添加新记录，也能更新已存在的记录
            const putRequest = store.put(signal);
            putRequest.onsuccess = () => {
              savedCount++;
              resolve();
            };
            putRequest.onerror = () => {
              console.warn('保存信号失败:', signal.id);
              resolve(); // 继续下一个
            };
          });
        } catch (e) {
          console.warn('保存信号失败:', e);
        }
      }
      
      console.log('成功批量保存' + savedCount + '个信号到数据库');
      
    } catch (error) {
      console.error('批量保存信号失败:', error);
      throw error;
    }
  }

  public async addSignalHistory(signals: any[]): Promise<void> {
    await this.init();
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    if (signals.length === 0) {
      return;
    }

    const MAX_SIGNALS = 200;
    
    try {
      // 1. 获取当前所有信号
      const currentSignals = await this.getSignalHistory();
      console.log('当前数据库有' + currentSignals.length + '个信号，准备添加' + signals.length + '个新信号');
      
      // 2. 逐个添加新信号，避免重复
      const transaction = this.db.transaction('signals', 'readwrite');
      const store = transaction.objectStore('signals');
      
      let addedCount = 0;
      const existingIds = new Set(currentSignals.map(s => s.id));
      
      for (const signal of signals) {
        if (!existingIds.has(signal.id)) {
          try {
            await new Promise<void>((resolve) => {
              const addRequest = store.add(signal);
              addRequest.onsuccess = () => {
                addedCount++;
                existingIds.add(signal.id);
                resolve();
              };
              addRequest.onerror = () => resolve();
            });
          } catch (e) {
            console.warn('添加信号失败:', e);
          }
        }
      }
      
      console.log('成功添加' + addedCount + '个新信号到数据库');
      
      // 3. 【临时禁用】删除逻辑 - 先让信号正常累积
      console.log('【临时禁用】数据库删除逻辑，确保信号正常累积！');
      /*
      // 再次获取所有信号，检查是否超过200个
      const allSignals = await this.getSignalHistory();
      
      // 分离卖出信号和非卖出信号
      const sellSignals = allSignals.filter(s => s.type === 'sell');
      const nonSellSignals = allSignals.filter(s => s.type !== 'sell');
      
      if (nonSellSignals.length > MAX_SIGNALS) {
        // 只删除非卖出信号中最旧的，卖出信号永不自动删除
        // 每次只删除最旧的一个，保持信号数量稳定在200个
        const sortedNonSellSignals = [...nonSellSignals].sort((a, b) => a.timestamp - b.timestamp);
        const signalsToDelete = sortedNonSellSignals.slice(0, nonSellSignals.length - MAX_SIGNALS);
        
        const deleteTransaction = this.db.transaction('signals', 'readwrite');
        const deleteStore = deleteTransaction.objectStore('signals');
        
        for (const signal of signalsToDelete) {
          try {
            await new Promise<void>((resolve) => {
              const delRequest = deleteStore.delete(signal.id);
              delRequest.onsuccess = () => resolve();
              delRequest.onerror = () => resolve();
            });
          } catch (e) {
            console.warn('删除旧信号失败:', e);
          }
        }
        
        console.log('信号历史管理: 当前非卖出信号总数' + nonSellSignals.length + '个，删除了' + signalsToDelete.length + '个最旧信号，保留最近的' + MAX_SIGNALS + '个（卖出信号' + sellSignals.length + '个始终保留，永不自动删除）');
    }
    */
    
  } catch (error) {
    console.error('保存信号历史失败:', error);
    throw error;
  }
}

public async cleanupSignalHistory(maxSignals: number): Promise<void> {
  // 暂时禁用数据库清理逻辑，避免和内存中的信号产生冲突
  // 让信号管理器自己处理信号清理
  console.log('数据库清理逻辑已禁用，信号管理由信号管理器处理');
  return;
}

public async getSignalHistory(): Promise<any[]> {
    await this.init();
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction('signals', 'readonly');
      const store = transaction.objectStore('signals');
      const request = store.getAll();

      request.onsuccess = (event) => {
        const signals = (event.target as IDBRequest).result as any[];
        resolve(signals.sort((a, b) => b.timestamp - a.timestamp));
      };

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }

  public async clearSignalHistory(): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction('signals', 'readwrite');
      const store = transaction.objectStore('signals');
      const request = store.clear();

      request.onsuccess = () => {
        console.log('已清空所有信号历史');
        resolve();
      };

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }

  private async cleanupOldData(): Promise<void> {
    // ====== 【完全禁用】旧数据清理逻辑 ======
    // 绝不删除任何信号！
    console.log('【完全禁用】旧数据清理逻辑 - 绝不删除任何信号！');
    try {
      // 直接跳过所有清理操作
    } catch (error) {
      console.error('数据清理失败', error);
    }
  }

  private async cleanupOldSignals(cutoffTime: number): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction('signals', 'readwrite');
      const store = transaction.objectStore('signals');
      const index = store.index('timestamp');
      
      const range = IDBKeyRange.upperBound(cutoffTime);
      const request = index.openCursor(range);

      let deletedCount = 0;
      let skippedSellSignals = 0;

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const signal = cursor.value;
          // 根据业务规则：卖出信号永不自动删除
          if (signal.type === 'sell') {
            skippedSellSignals++;
            cursor.continue();
          } else {
            cursor.delete();
            deletedCount++;
            cursor.continue();
          }
        } else {
          console.log('清理了 ' + deletedCount + ' 条旧信号（跳过 ' + skippedSellSignals + ' 条卖出信号）');
          resolve();
        }
      };

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }

  private async cleanupOldStockHistory(cutoffTime: number): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction('stockDataHistory', 'readwrite');
      const store = transaction.objectStore('stockDataHistory');
      const index = store.index('timestamp');
      
      const range = IDBKeyRange.upperBound(cutoffTime);
      const request = index.openCursor(range);

      let deletedCount = 0;

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          deletedCount++;
          cursor.continue();
        } else {
          console.log('清理了 ' + deletedCount + ' 条旧股票历史数据');
          resolve();
        }
      };

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }

  // Alert methods
  public async addAlert(alert: IndexedDBAAlert): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction('alerts', 'readwrite');
      const store = transaction.objectStore('alerts');
      const request = store.add(alert);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }

  public async getAlerts(filters?: { stockCode?: string; isActive?: boolean; alertType?: string }): Promise<IndexedDBAAlert[]> {
    await this.init();
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction('alerts', 'readonly');
      const store = transaction.objectStore('alerts');
      let request: IDBRequest;

      if (filters?.stockCode) {
        const index = store.index('stockCode');
        request = index.getAll(filters.stockCode);
      } else if (filters?.isActive !== undefined) {
        const index = store.index('isActive');
        request = index.getAll(filters.isActive as any);
      } else if (filters?.alertType) {
        const index = store.index('alertType');
        request = index.getAll(filters.alertType);
      } else {
        request = store.getAll();
      }

      request.onsuccess = (event) => {
        resolve((event.target as IDBRequest).result as IndexedDBAAlert[]);
      };

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }

  public async updateAlert(alertId: string, updates: Partial<IndexedDBAAlert>): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction('alerts', 'readwrite');
      const store = transaction.objectStore('alerts');
      const request = store.get(alertId);

      request.onsuccess = (event) => {
        const alert = (event.target as IDBRequest).result as IndexedDBAAlert;
        if (alert) {
          const updatedAlert = { ...alert, ...updates, updated_at: Date.now() };
          store.put(updatedAlert);
          resolve();
        } else {
          reject(new Error('Alert not found'));
        }
      };

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }

  public async deleteAlert(alertId: string): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction('alerts', 'readwrite');
      const store = transaction.objectStore('alerts');
      const request = store.delete(alertId);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }

  // Strategy methods
  public async addStrategy(strategy: IndexedDBStrategy): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction('strategies', 'readwrite');
      const store = transaction.objectStore('strategies');
      const request = store.add(strategy);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }

  public async getStrategies(filters?: { isActive?: boolean }): Promise<IndexedDBStrategy[]> {
    await this.init();
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction('strategies', 'readonly');
      const store = transaction.objectStore('strategies');
      let request: IDBRequest;

      if (filters?.isActive !== undefined) {
        const index = store.index('isActive');
        request = index.getAll(filters.isActive as any);
      } else {
        request = store.getAll();
      }

      request.onsuccess = (event) => {
        resolve((event.target as IDBRequest).result as IndexedDBStrategy[]);
      };

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }

  public async updateStrategy(strategyId: string, updates: Partial<IndexedDBStrategy>): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction('strategies', 'readwrite');
      const store = transaction.objectStore('strategies');
      const request = store.get(strategyId);

      request.onsuccess = (event) => {
        const strategy = (event.target as IDBRequest).result as IndexedDBStrategy;
        if (strategy) {
          const updatedStrategy = { ...strategy, ...updates, updated_at: Date.now() };
          store.put(updatedStrategy);
          resolve();
        } else {
          reject(new Error('Strategy not found'));
        }
      };

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }

  public async deleteStrategy(strategyId: string): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction('strategies', 'readwrite');
      const store = transaction.objectStore('strategies');
      const request = store.delete(strategyId);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }

  // Backtest methods
  public async addBacktest(backtest: IndexedDBBacktest): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction('backtests', 'readwrite');
      const store = transaction.objectStore('backtests');
      const request = store.add(backtest);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }

  public async getBacktests(filters?: { strategyId?: string; limit?: number }): Promise<IndexedDBBacktest[]> {
    await this.init();
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction('backtests', 'readonly');
      const store = transaction.objectStore('backtests');
      let request: IDBRequest;

      if (filters?.strategyId) {
        const index = store.index('strategyId');
        request = index.getAll(filters.strategyId);
      } else {
        request = store.getAll();
      }

      request.onsuccess = (event) => {
        let results = (event.target as IDBRequest).result as IndexedDBBacktest[];
        
        if (filters?.limit) {
          results = results.slice(0, filters.limit);
        }
        
        resolve(results.sort((a, b) => b.created_at - a.created_at));
      };

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }

  // Optimization params methods
  public async putOptimizationParams(params: IndexedDBOptimizationParams): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction('optimizationParams', 'readwrite');
      const store = transaction.objectStore('optimizationParams');
      const request = store.put(params);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }

  public async getOptimizationParams(id: string): Promise<IndexedDBOptimizationParams | null> {
    await this.init();
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction('optimizationParams', 'readonly');
      const store = transaction.objectStore('optimizationParams');
      const request = store.get(id);

      request.onsuccess = (event) => {
        resolve((event.target as IDBRequest).result as IndexedDBOptimizationParams | null);
      };

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }

  // Signal results methods
  public async putSignalResult(result: IndexedDBSignalResult): Promise<void> {
    await this.init();
    const MAX_RESULTS = 100; // 最多保存100个学习样本

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction('signalResults', 'readwrite');
      const store = transaction.objectStore('signalResults');

      // 先获取所有结果数量
      const countRequest = store.count();
      
      countRequest.onsuccess = () => {
        const count = countRequest.result;
        
        // 如果超过100个，先删除最旧的
        if (count >= MAX_RESULTS) {
          // 获取最旧的结果（按创建时间排序）
          const getAllRequest = store.getAll();
          getAllRequest.onsuccess = () => {
            const allResults = getAllRequest.result as IndexedDBSignalResult[];
            // 按创建时间排序，删除最早的
            allResults.sort((a, b) => (a.created_at || 0) - (b.created_at || 0));
            const resultsToDelete = allResults.slice(0, count - MAX_RESULTS + 1);
            
            let deleteCount = 0;
            resultsToDelete.forEach((item, index) => {
              const deleteRequest = store.delete(item.id);
              deleteRequest.onsuccess = () => {
                deleteCount++;
                if (deleteCount === resultsToDelete.length) {
                  // 删除完成后保存新结果
                  const putRequest = store.put(result);
                  putRequest.onsuccess = () => resolve();
                  putRequest.onerror = (event) => reject((event.target as IDBRequest).error);
                }
              };
              deleteRequest.onerror = () => {
                deleteCount++;
                if (deleteCount === resultsToDelete.length) {
                  const putRequest = store.put(result);
                  putRequest.onsuccess = () => resolve();
                  putRequest.onerror = (event) => reject((event.target as IDBRequest).error);
                }
              };
            });

            if (resultsToDelete.length === 0) {
              const putRequest = store.put(result);
              putRequest.onsuccess = () => resolve();
              putRequest.onerror = (event) => reject((event.target as IDBRequest).error);
            }
          };
          getAllRequest.onerror = (event) => reject((event.target as IDBRequest).error);
        } else {
          // 直接保存新结果
          const putRequest = store.put(result);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = (event) => reject((event.target as IDBRequest).error);
        }
      };

      countRequest.onerror = (event) => reject((event.target as IDBRequest).error);
    });
  }

  public async getAllSignalResults(): Promise<IndexedDBSignalResult[]> {
    await this.init();
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction('signalResults', 'readonly');
      const store = transaction.objectStore('signalResults');
      const request = store.getAll();

      request.onsuccess = (event) => {
        resolve((event.target as IDBRequest).result as IndexedDBSignalResult[]);
      };

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }

  // Optimization history methods
  public async addOptimizationHistory(history: IndexedDBOptimizationHistory): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction('optimizationHistory', 'readwrite');
      const store = transaction.objectStore('optimizationHistory');
      const request = store.add(history);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }

  public async getOptimizationHistory(limit?: number): Promise<IndexedDBOptimizationHistory[]> {
    await this.init();
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction('optimizationHistory', 'readonly');
      const store = transaction.objectStore('optimizationHistory');
      const request = store.getAll();

      request.onsuccess = (event) => {
        let results = (event.target as IDBRequest).result as IndexedDBOptimizationHistory[];
        
        if (limit) {
          results = results.slice(0, limit);
        }
        
        resolve(results.sort((a, b) => b.timestamp - a.timestamp));
      };

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }
}