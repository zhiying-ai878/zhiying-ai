// 性能优化工具模块

// 数据缓存管理器
class DataCache {
  private cache: Map<string, { data: any; timestamp: number; expiry: number }>;
  
  constructor() {
    this.cache = new Map();
    // 定期清理过期缓存
    setInterval(() => this.cleanExpired(), 60000); // 每分钟清理一次
  }
  
  // 设置缓存
  set(key: string, data: any, expiry: number = 300000): void { // 默认5分钟过期
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry
    });
  }
  
  // 获取缓存
  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
  
  // 删除缓存
  delete(key: string): void {
    this.cache.delete(key);
  }
  
  // 清空缓存
  clear(): void {
    this.cache.clear();
  }
  
  // 清理过期缓存
  private cleanExpired(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

// 导出单例实例
export const dataCache = new DataCache();

// 防抖函数
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: number | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait) as unknown as number;
  };
};

// 节流函数
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// 虚拟滚动数据处理
export const processVirtualScrollData = <T>(
  data: T[],
  pageSize: number,
  currentPage: number
): T[] => {
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  return data.slice(start, end);
};

// 批量处理数据
export const batchProcess = <T, R>(
  data: T[],
  processor: (item: T) => R,
  batchSize: number = 100
): R[] => {
  const result: R[] = [];
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    const batchResults = batch.map(processor);
    result.push(...batchResults);
  }
  return result;
};

// 计算密集型任务的Web Worker包装
export const runInWorker = <T, R>(
  fn: (data: T) => R,
  data: T
): Promise<R> => {
  return new Promise((resolve, reject) => {
    // 创建Worker
    const workerCode = `
      self.onmessage = function(e) {
        const { fn, data } = e.data;
        try {
          const result = eval(fn)(data);
          self.postMessage({ success: true, result });
        } catch (error) {
          self.postMessage({ success: false, error: error.message });
        }
      };
    `;
    
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    const worker = new Worker(workerUrl);
    
    worker.onmessage = (e) => {
      const { success, result, error } = e.data;
      if (success) {
        resolve(result);
      } else {
        reject(new Error(error));
      }
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
    };
    
    worker.onerror = (error) => {
      reject(error);
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
    };
    
    // 发送数据到Worker
    worker.postMessage({
      fn: fn.toString(),
      data
    });
  });
};

// 图表数据优化
export const optimizeChartData = (data: number[], maxPoints: number = 1000): number[] => {
  if (data.length <= maxPoints) return data;
  
  const step = Math.ceil(data.length / maxPoints);
  const optimizedData: number[] = [];
  
  for (let i = 0; i < data.length; i += step) {
    // 取区间内的平均值
    const end = Math.min(i + step, data.length);
    const chunk = data.slice(i, end);
    const average = chunk.reduce((sum, val) => sum + val, 0) / chunk.length;
    optimizedData.push(average);
  }
  
  return optimizedData;
};

// 内存使用监控
export const monitorMemoryUsage = (): void => {
  if (typeof performance !== 'undefined' && (performance as any).memory) {
    const memory = (performance as any).memory;
    console.log('Memory usage:', {
      used: (memory.usedJSHeapSize / 1024 / 1024).toFixed(2) + ' MB',
      total: (memory.totalJSHeapSize / 1024 / 1024).toFixed(2) + ' MB',
      limit: (memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2) + ' MB'
    });
  }
};

// 组件渲染性能监控
export const monitorRenderPerformance = (componentName: string, callback: () => void): void => {
  const start = performance.now();
  callback();
  const end = performance.now();
  console.log(`${componentName} render time: ${(end - start).toFixed(2)}ms`);
};

// 数据预加载
export const preloadData = async <T>(keys: string[], fetchFn: (key: string) => Promise<T>): Promise<void> => {
  const promises = keys.map(async (key) => {
    if (!dataCache.get(key)) {
      const data = await fetchFn(key);
      dataCache.set(key, data);
    }
  });
  
  await Promise.all(promises);
};

// 图片懒加载
export const lazyLoadImage = (img: HTMLImageElement, src: string): void => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        img.src = src;
        observer.unobserve(img);
      }
    });
  });
  
  observer.observe(img);
};

// 增量学习优化
class IncrementalLearningOptimizer {
  private modelCache: Map<string, { model: any; timestamp: number; dataSize: number }>;
  private batchSize: number;
  private updateThreshold: number;

  constructor(batchSize: number = 100, updateThreshold: number = 0.05) {
    this.modelCache = new Map();
    this.batchSize = batchSize;
    this.updateThreshold = updateThreshold;
  }

  // 缓存模型
  cacheModel(modelId: string, model: any, dataSize: number): void {
    this.modelCache.set(modelId, {
      model,
      timestamp: Date.now(),
      dataSize
    });
  }

  // 获取缓存的模型
  getCachedModel(modelId: string): any | null {
    return this.modelCache.get(modelId)?.model || null;
  }

  // 增量更新模型
  async incrementalUpdate(modelId: string, newData: Array<{ features: number[]; label: number }>, updateFn: (model: any, data: Array<{ features: number[]; label: number }>) => any): Promise<any> {
    const cached = this.modelCache.get(modelId);
    let model = cached?.model;

    // 分批处理新数据
    const batches = this.batchData(newData, this.batchSize);
    
    for (const batch of batches) {
      if (model) {
        // 更新现有模型
        model = updateFn(model, batch);
      } else {
        // 首次训练模型
        // 这里应该调用完整的训练函数
        break;
      }
    }

    // 更新缓存
    if (model) {
      this.cacheModel(modelId, model, (cached?.dataSize || 0) + newData.length);
    }

    return model;
  }

  // 数据分批
  private batchData(data: Array<{ features: number[]; label: number }>, batchSize: number): Array<Array<{ features: number[]; label: number }>> {
    const batches: Array<Array<{ features: number[]; label: number }>> = [];
    for (let i = 0; i < data.length; i += batchSize) {
      batches.push(data.slice(i, i + batchSize));
    }
    return batches;
  }

  // 清理过期模型
  cleanupExpiredModels(maxAge: number = 3600000): void { // 默认1小时
    const now = Date.now();
    for (const [modelId, info] of this.modelCache.entries()) {
      if (now - info.timestamp > maxAge) {
        this.modelCache.delete(modelId);
      }
    }
  }

  // 获取模型统计信息
  getModelStats(): Array<{ modelId: string; dataSize: number; age: number }> {
    const now = Date.now();
    return Array.from(this.modelCache.entries()).map(([modelId, info]) => ({
      modelId,
      dataSize: info.dataSize,
      age: now - info.timestamp
    }));
  }
}

// 导出增量学习优化器单例
export const incrementalLearningOptimizer = new IncrementalLearningOptimizer();

// 并行处理任务
export const parallelProcess = async <T, R>(
tasks: T[],
processor: (task: T) => Promise<R>,
concurrency: number = 4
): Promise<R[]> => {
  const results: R[] = [];
  const executing: Promise<void>[] = [];

  for (const task of tasks) {
    const executeTask = async () => {
      const result = await processor(task);
      results.push(result);
    };

    const promise = executeTask();
    executing.push(promise);

    if (executing.length >= concurrency) {
      await Promise.race(executing);
      // 过滤掉已完成的任务
      executing.filter(p => !p.isFulfilled());
    }
  }

  // 等待所有任务完成
  await Promise.all(executing);
  return results;
};

// 扩展Promise以支持isFulfilled方法
declare global {
  interface Promise<T> {
    isFulfilled(): boolean;
  }
}

Promise.prototype.isFulfilled = function(this: Promise<any>): boolean {
  let isFulfilled = false;
  this.then(() => {
    isFulfilled = true;
  }).catch(() => {
    isFulfilled = true;
  });
  return isFulfilled;
};
