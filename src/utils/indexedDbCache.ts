// IndexedDB缓存工具，用于存储更大量的历史数据

interface DBConfig {
  name: string;
  version: number;
  stores: {
    name: string;
    keyPath: string;
    indexes?: Array<{
      name: string;
      keyPath: string;
      unique?: boolean;
    }>;
  }[];
}

class IndexedDBCache {
  private db: IDBDatabase | null = null;
  private config: DBConfig;
  private isInitialized: boolean = false;
  private initializationPromise: Promise<void> | null = null;

  constructor(config: DBConfig) {
    this.config = config;
  }

  // 初始化数据库
  async init(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.config.name, this.config.version);

      request.onerror = () => {
        reject(new Error('IndexedDB initialization failed'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.isInitialized = true;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = request.result;

        this.config.stores.forEach((store) => {
          if (!db.objectStoreNames.contains(store.name)) {
            const objectStore = db.createObjectStore(store.name, { keyPath: store.keyPath });

            if (store.indexes) {
              store.indexes.forEach((index) => {
                objectStore.createIndex(index.name, index.keyPath, { unique: index.unique || false });
              });
            }
          }
        });
      };
    });

    return this.initializationPromise;
  }

  // 存储数据
  async set<T>(storeName: string, key: string, value: T, expirationTime?: number): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);

      const item = {
        [this.config.stores.find(s => s.name === storeName)?.keyPath || 'key']: key,
        value,
        timestamp: Date.now(),
        expiration: expirationTime || null
      };

      const request = store.put(item);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to store data'));
    });
  }

  // 获取数据
  async get<T>(storeName: string, key: string): Promise<T | null> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => {
        const item = request.result;
        if (!item) {
          resolve(null);
          return;
        }

        // 检查数据是否过期
        if (item.expiration && Date.now() > item.expiration) {
          // 删除过期数据
          this.delete(storeName, key);
          resolve(null);
          return;
        }

        resolve(item.value as T);
      };

      request.onerror = () => reject(new Error('Failed to get data'));
    });
  }

  // 删除数据
  async delete(storeName: string, key: string): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to delete data'));
    });
  }

  // 清除所有数据
  async clear(storeName: string): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to clear data'));
    });
  }

  // 获取所有数据
  async getAll<T>(storeName: string): Promise<Array<{ key: string; value: T }>> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        const items = request.result;
        const result: Array<{ key: string; value: T }> = [];

        items.forEach((item: any) => {
          // 检查数据是否过期
          if (!item.expiration || Date.now() <= item.expiration) {
            result.push({
              key: item[this.config.stores.find(s => s.name === storeName)?.keyPath || 'key'],
              value: item.value
            });
          } else {
            // 删除过期数据
            this.delete(storeName, item[this.config.stores.find(s => s.name === storeName)?.keyPath || 'key']);
          }
        });

        resolve(result);
      };

      request.onerror = () => reject(new Error('Failed to get all data'));
    });
  }

  // 获取数据数量
  async count(storeName: string): Promise<number> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('Failed to count data'));
    });
  }

  // 关闭数据库
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.isInitialized = false;
    }
  }
}

// 导出默认实例
export const indexedDbCache = new IndexedDBCache({
  name: 'zhiying-ai-cache',
  version: 1,
  stores: [
    {
      name: 'stockHistory',
      keyPath: 'key',
      indexes: [
        {
          name: 'byStockCode',
          keyPath: 'stockCode',
          unique: false
        },
        {
          name: 'byTimestamp',
          keyPath: 'timestamp',
          unique: false
        }
      ]
    },
    {
      name: 'userPreferences',
      keyPath: 'key'
    },
    {
      name: 'aiModels',
      keyPath: 'key'
    },
    {
      name: 'marketData',
      keyPath: 'key'
    }
  ]
});

export default IndexedDBCache;