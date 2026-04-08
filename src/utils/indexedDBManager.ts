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

import { DataCompression } from './dataCompression';

export class IndexedDBManager {
  private static instance: IndexedDBManager;
  private db: IDBDatabase | null = null;
  private dbName = 'zhiying-ai-db';
  private dbVersion = 1;
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
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction('signals', 'readwrite');
      const store = transaction.objectStore('signals');
      const request = store.add(signal);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error);
      };
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

  private async cleanupOldData(): Promise<void> {
    try {
      console.log('开始清理旧数据...');
      
      const now = Date.now();
      const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
      const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);

      // 清理30天前的信号数据
      await this.cleanupOldSignals(thirtyDaysAgo);
      
      // 清理7天前的股票历史数据
      await this.cleanupOldStockHistory(sevenDaysAgo);
      
      console.log('数据清理完成');
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

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          deletedCount++;
          cursor.continue();
        } else {
          console.log(`清理了 ${deletedCount} 条旧信号`);
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
          console.log(`清理了 ${deletedCount} 条旧股票历史数据`);
          resolve();
        }
      };

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }
}