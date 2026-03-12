// API工具函数
import axios from 'axios';
import { getDataCache, CacheKeys } from './dataCache';

// 东方财富API基础URL
const BASE_URL = 'https://api.eastmoney.com';

// 创建axios实例
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 缓存实例
const cache = getDataCache();

// 重试配置
const retryConfig = {
  retries: 3,
  retryDelay: (retryCount: number) => Math.min(1000 * Math.pow(2, retryCount), 10000),
  retryableStatuses: [429, 500, 502, 503, 504]
};

// 正在进行的请求
const pendingRequests = new Map<string, Promise<any>>();

// 网络状态
let isOnline = navigator.onLine;

// 网络状态变化监听
window.addEventListener('online', () => {
  isOnline = true;
  console.log('网络已连接');
});

window.addEventListener('offline', () => {
  isOnline = false;
  console.log('网络已断开');
});

// 生成请求key
const generateRequestKey = (url: string, params?: any) => {
  return `${url}_${JSON.stringify(params || {})}`;
};

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 检查网络状态
    if (!isOnline) {
      console.warn('网络离线，使用缓存数据');
      // 可以在这里添加离线处理逻辑
    }
    
    // 可以在这里添加认证token等
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    // 缓存GET请求的响应
    if (response.config.method === 'get') {
      const cacheKey = cache.generateKey(CacheKeys.STOCK_DATA, response.config.url || '', JSON.stringify(response.config.params || {}));
      cache.set(cacheKey, response.data, 5 * 60 * 1000); // 5分钟缓存
    }
    return response.data;
  },
  async (error) => {
    console.error('API请求错误:', error);
    
    // 重试机制
    const config = error.config;
    if (!config || !retryConfig.retryableStatuses.includes(error.response?.status)) {
      return Promise.reject(error);
    }
    
    config.retryCount = config.retryCount || 0;
    if (config.retryCount < retryConfig.retries) {
      config.retryCount++;
      const delay = retryConfig.retryDelay(config.retryCount);
      console.log(`API请求重试 ${config.retryCount}/${retryConfig.retries}，延迟 ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return api(config);
    }
    
    return Promise.reject(error);
  }
);

// 带缓存和请求合并的GET请求
export const cachedGet = async (url: string, params?: any, cacheTime: number = 5 * 60 * 1000) => {
  const cacheKey = cache.generateKey(CacheKeys.STOCK_DATA, url, JSON.stringify(params || {}));
  const requestKey = generateRequestKey(url, params);
  
  // 检查缓存
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    console.log(`从缓存获取数据: ${url}`);
    return cachedData;
  }
  
  // 检查是否有正在进行的请求
  if (pendingRequests.has(requestKey)) {
    console.log(`合并请求: ${url}`);
    return pendingRequests.get(requestKey);
  }
  
  // 创建新请求
  const request = api.get(url, { params })
    .then(response => {
      // 缓存响应
      cache.set(cacheKey, response, cacheTime);
      return response;
    })
    .finally(() => {
      // 清除正在进行的请求
      pendingRequests.delete(requestKey);
    });
  
  // 记录正在进行的请求
  pendingRequests.set(requestKey, request);
  
  return request;
};

// 清除指定URL的缓存
export const clearCache = (url: string, params?: any) => {
  const cacheKey = cache.generateKey(CacheKeys.STOCK_DATA, url, JSON.stringify(params || {}));
  cache.delete(cacheKey);
};

// 清除所有缓存
export const clearAllCache = () => {
  cache.clear();
};

// 市场数据API
export const marketApi = {
  // 获取大盘指数
  getMarketIndex: () => {
    return cachedGet('/market/index');
  },
  
  // 获取股票列表
  getStockList: (params: { industry?: string; concept?: string; page?: number; size?: number }) => {
    return cachedGet('/stock/list', params);
  },
  
  // 获取股票详情
  getStockDetail: (code: string) => {
    return cachedGet(`/stock/detail/${code}`);
  },
  
  // 获取主力资金流向
  getMainForceFlow: (params: { page?: number; size?: number }) => {
    return cachedGet('/market/main-force', params);
  },
  
  // 获取热点事件
  getHotEvents: (params: { page?: number; size?: number }) => {
    return cachedGet('/market/events', params);
  }
};

// 交易API
export const tradeApi = {
  // 获取交易历史
  getTradeHistory: (params: { page?: number; size?: number }) => {
    return cachedGet('/trade/history', params);
  },
  
  // 获取持仓信息
  getHoldings: () => {
    return cachedGet('/trade/holdings');
  },
  
  // 提交交易
  submitTrade: (data: {
    type: 'buy' | 'sell';
    code: string;
    price: number;
    volume: number;
  }) => {
    return api.post('/trade/submit', data);
  },
  
  // 同步交易
  syncTrades: () => {
    return api.post('/trade/sync');
  }
};

// AI策略API
export const strategyApi = {
  // 获取策略列表
  getStrategies: () => {
    return cachedGet('/strategy/list');
  },
  
  // 获取策略详情
  getStrategyDetail: (id: string) => {
    return cachedGet(`/strategy/detail/${id}`);
  },
  
  // 创建策略
  createStrategy: (data: {
    name: string;
    type: string;
    description: string;
    riskLevel: number;
  }) => {
    return api.post('/strategy/create', data);
  },
  
  // 更新策略
  updateStrategy: (id: string, data: any) => {
    return api.put(`/strategy/update/${id}`, data);
  },
  
  // 启动/停止策略
  toggleStrategy: (id: string, status: 'start' | 'stop') => {
    return api.post(`/strategy/toggle/${id}`, { status });
  },
  
  // 获取策略参数
  getStrategyParams: (id: string) => {
    return cachedGet(`/strategy/params/${id}`);
  },
  
  // 更新策略参数
  updateStrategyParams: (id: string, data: any) => {
    return api.put(`/strategy/params/${id}`, data);
  }
};

export default api;