// 数据缓存模块
import { indexedDbCache } from './indexedDbCache';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
  lastAccessed: number;
}

class DataCache {
  private cache: Map<string, CacheItem<any>> = new Map();
  private defaultExpiry = 5 * 60 * 1000; // 默认5分钟过期
  private maxSize = 1000; // 最大缓存项数
  private maxMemoryBytes = 50 * 1024 * 1024; // 最大内存使用量 (50MB)
  private currentMemoryUsage = 0;
  private largeDataThreshold = 100 * 1024; // 超过此大小的数据使用IndexedDB (100KB)

  // 计算数据大小（粗略估计）
  private calculateSize(data: any): number {
    if (data === null || data === undefined) return 0;
    if (typeof data === 'string') return data.length * 2;
    if (typeof data === 'number') return 8;
    if (typeof data === 'boolean') return 1;
    if (Array.isArray(data)) {
      return data.reduce((acc: number, item: any) => acc + this.calculateSize(item), 0);
    }
    if (typeof data === 'object') {
      return Object.values(data).reduce((acc: number, value: any) => acc + this.calculateSize(value), 0);
    }
    return 0;
  }

  // 清理过期缓存
  private cleanupExpired(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.expiry) {
        this.currentMemoryUsage -= this.calculateSize(item.data);
        this.cache.delete(key);
      }
    }
  }

  // LRU清理
  private cleanupLRU(): void {
    if (this.cache.size <= this.maxSize && this.currentMemoryUsage <= this.maxMemoryBytes) {
      return;
    }

    // 按最后访问时间排序
    const items = Array.from(this.cache.entries())
      .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);

    // 清理直到达到限制
    while (this.cache.size > this.maxSize || this.currentMemoryUsage > this.maxMemoryBytes) {
      if (items.length === 0) break;
      const [key, item] = items.shift()!;
      this.currentMemoryUsage -= this.calculateSize(item.data);
      this.cache.delete(key);
    }
  }

  // 设置缓存
  async set<T>(key: string, data: T, expiry: number = this.defaultExpiry): Promise<void> {
    // 清理过期缓存
    this.cleanupExpired();

    // 计算新数据大小
    const dataSize = this.calculateSize(data);

    // 根据数据大小选择存储方式
    if (dataSize > this.largeDataThreshold) {
      // 大数据使用IndexedDB
      try {
        await indexedDbCache.set('stockHistory', key, data, Date.now() + expiry);
      } catch (error) {
        console.error('Failed to store data in IndexedDB:', error);
        // 失败时回退到内存缓存
        this.setMemoryCache(key, data, expiry, dataSize);
      }
    } else {
      // 小数据使用内存缓存
      this.setMemoryCache(key, data, expiry, dataSize);
    }
  }

  // 设置内存缓存
  private setMemoryCache<T>(key: string, data: T, expiry: number, dataSize: number): void {
    // 如果已存在，先减去旧数据大小
    if (this.cache.has(key)) {
      const oldItem = this.cache.get(key)!;
      this.currentMemoryUsage -= this.calculateSize(oldItem.data);
    }

    // 设置新缓存
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry,
      lastAccessed: Date.now()
    });

    // 更新内存使用
    this.currentMemoryUsage += dataSize;

    // 执行LRU清理
    this.cleanupLRU();
  }

  // 获取缓存
  async get<T>(key: string): Promise<T | null> {
    // 先从内存缓存获取
    const item = this.cache.get(key);
    if (item) {
      // 检查是否过期
      if (Date.now() - item.timestamp <= item.expiry) {
        // 更新最后访问时间
        item.lastAccessed = Date.now();
        this.cache.set(key, item);
        return item.data;
      } else {
        // 过期，删除
        this.currentMemoryUsage -= this.calculateSize(item.data);
        this.cache.delete(key);
      }
    }

    // 内存缓存没有，从IndexedDB获取
    try {
      const data = await indexedDbCache.get<T>('stockHistory', key);
      if (data !== null) {
        // 将数据加载到内存缓存
        const dataSize = this.calculateSize(data);
        if (dataSize <= this.largeDataThreshold) {
          this.setMemoryCache(key, data, this.defaultExpiry, dataSize);
        }
        return data;
      }
    } catch (error) {
      console.error('Failed to get data from IndexedDB:', error);
    }

    return null;
  }

  // 删除缓存
  async delete(key: string): Promise<void> {
    // 从内存缓存删除
    const item = this.cache.get(key);
    if (item) {
      this.currentMemoryUsage -= this.calculateSize(item.data);
      this.cache.delete(key);
    }

    // 从IndexedDB删除
    try {
      await indexedDbCache.delete('stockHistory', key);
    } catch (error) {
      console.error('Failed to delete data from IndexedDB:', error);
    }
  }

  // 清空缓存
  async clear(): Promise<void> {
    // 清空内存缓存
    this.cache.clear();
    this.currentMemoryUsage = 0;

    // 清空IndexedDB缓存
    try {
      await indexedDbCache.clear('stockHistory');
    } catch (error) {
      console.error('Failed to clear IndexedDB cache:', error);
    }
  }

  // 获取缓存大小
  size(): number {
    return this.cache.size;
  }

  // 获取内存使用量
  getMemoryUsage(): number {
    return this.currentMemoryUsage;
  }

  // 检查缓存是否存在
  async has(key: string): Promise<boolean> {
    // 检查内存缓存
    if (this.cache.has(key)) {
      const item = this.cache.get(key)!;
      if (Date.now() - item.timestamp <= item.expiry) {
        return true;
      }
      // 过期，删除
      this.currentMemoryUsage -= this.calculateSize(item.data);
      this.cache.delete(key);
    }

    // 检查IndexedDB
    try {
      const data = await indexedDbCache.get('stockHistory', key);
      return data !== null;
    } catch (error) {
      console.error('Failed to check data in IndexedDB:', error);
      return false;
    }
  }

  // 缓存键生成器
  generateKey(prefix: string, ...params: any[]): string {
    const paramString = params.map(param => {
      if (typeof param === 'object') {
        return JSON.stringify(param);
      }
      return String(param);
    }).join('_');
    return `${prefix}_${paramString}`;
  }

  // 批量设置缓存
  async setBatch(items: Array<{ key: string; data: any; expiry?: number }>): Promise<void> {
    for (const item of items) {
      await this.set(item.key, item.data, item.expiry);
    }
  }

  // 批量获取缓存
  async getBatch(keys: string[]): Promise<Map<string, any>> {
    const result = new Map<string, any>();
    for (const key of keys) {
      const data = await this.get(key);
      if (data !== null) {
        result.set(key, data);
      }
    }
    return result;
  }

  // 按前缀删除缓存
  async deleteByPrefix(prefix: string): Promise<void> {
    // 从内存缓存删除
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.delete(key);
      }
    }

    // 从IndexedDB删除
    try {
      const allData = await indexedDbCache.getAll('stockHistory');
      for (const { key } of allData) {
        if (key.startsWith(prefix)) {
          await indexedDbCache.delete('stockHistory', key);
        }
      }
    } catch (error) {
      console.error('Failed to delete data from IndexedDB:', error);
    }
  }

  // 获取缓存统计信息
  async getStats(): Promise<{
    size: number;
    memoryUsage: number;
    maxMemory: number;
    maxSize: number;
    indexedDbSize: number;
  }> {
    let indexedDbSize = 0;
    try {
      indexedDbSize = await indexedDbCache.count('stockHistory');
    } catch (error) {
      console.error('Failed to get IndexedDB size:', error);
    }

    return {
      size: this.cache.size,
      memoryUsage: this.currentMemoryUsage,
      maxMemory: this.maxMemoryBytes,
      maxSize: this.maxSize,
      indexedDbSize
    };
  }
}

// 导出单例实例
let dataCacheInstance: DataCache | null = null;

export const getDataCache = (): DataCache => {
  if (!dataCacheInstance) {
    dataCacheInstance = new DataCache();
  }
  return dataCacheInstance;
};

// 缓存键前缀
export const CacheKeys = {
  STOCK_DATA: 'stock_data',
  TECHNICAL_INDICATORS: 'technical_indicators',
  MODEL_PREDICTION: 'model_prediction',
  LLM_RESPONSE: 'llm_response',
  RECOMMENDATIONS: 'recommendations',
  MARKET_DATA: 'market_data'
};