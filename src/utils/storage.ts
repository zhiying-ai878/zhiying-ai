// 存储工具函数

// 加密函数
export const encryptData = (data: string): string => {
  // 这里使用简单的Base64编码作为示例，实际应用中应该使用更安全的加密方法
  return btoa(unescape(encodeURIComponent(data)));
};

// 解密函数
export const decryptData = (encryptedData: string): string => {
  return decodeURIComponent(escape(atob(encryptedData)));
};

// 存储数据到本地存储
export const setStorageItem = (key: string, value: any): boolean => {
  try {
    const encryptedValue = encryptData(JSON.stringify(value));
    localStorage.setItem(key, encryptedValue);
    return true;
  } catch (error) {
    console.error('存储数据失败:', error);
    return false;
  }
};

// 从本地存储获取数据
export const getStorageItem = <T>(key: string): T | null => {
  try {
    const encryptedValue = localStorage.getItem(key);
    if (!encryptedValue) return null;
    const decryptedValue = decryptData(encryptedValue);
    return JSON.parse(decryptedValue) as T;
  } catch (error) {
    console.error('获取数据失败:', error);
    // 如果解密失败，清除存储的信息
    localStorage.removeItem(key);
    return null;
  }
};

// 从本地存储删除数据
export const removeStorageItem = (key: string): boolean => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('删除数据失败:', error);
    return false;
  }
};

// 清除所有本地存储数据
export const clearStorage = (): boolean => {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error('清除存储失败:', error);
    return false;
  }
};

// 存储用户信息
export const saveUserInfo = (userInfo: {
  username: string;
  token: string;
  expiresAt: number;
}): boolean => {
  return setStorageItem('userInfo', userInfo);
};

// 获取用户信息
export const getUserInfo = (): {
  username: string;
  token: string;
  expiresAt: number;
} | null => {
  const userInfo = getStorageItem<{
    username: string;
    token: string;
    expiresAt: number;
  }>('userInfo');
  
  // 检查token是否过期
  if (userInfo && userInfo.expiresAt < Date.now()) {
    removeStorageItem('userInfo');
    return null;
  }
  
  return userInfo;
};

// 存储交易设置
export const saveTradeSettings = (settings: {
  maxTradeAmount: number;
  stopLoss: number;
  takeProfit: number;
  tradeFrequency: string;
  riskLevel: number;
}): boolean => {
  return setStorageItem('tradeSettings', settings);
};

// 获取交易设置
export const getTradeSettings = (): {
  maxTradeAmount: number;
  stopLoss: number;
  takeProfit: number;
  tradeFrequency: string;
  riskLevel: number;
} | null => {
  return getStorageItem<{
    maxTradeAmount: number;
    stopLoss: number;
    takeProfit: number;
    tradeFrequency: string;
    riskLevel: number;
  }>('tradeSettings');
};

// 存储AI策略设置
export const saveStrategySettings = (settings: any): boolean => {
  return setStorageItem('strategySettings', settings);
};

// 获取AI策略设置
export const getStrategySettings = (): any => {
  return getStorageItem('strategySettings');
};

// 存储交易历史
export const saveTradeHistory = (trades: Array<{
  key: string;
  time: string;
  code: string;
  name: string;
  type: 'buy' | 'sell';
  price: number;
  volume: number;
  amount: number;
}>): boolean => {
  return setStorageItem('tradeHistory', trades);
};

// 获取交易历史
export const getTradeHistory = (): Array<{
  key: string;
  time: string;
  code: string;
  name: string;
  type: 'buy' | 'sell';
  price: number;
  volume: number;
  amount: number;
}> => {
  const history = getStorageItem<Array<{
    key: string;
    time: string;
    code: string;
    name: string;
    type: 'buy' | 'sell';
    price: number;
    volume: number;
    amount: number;
  }>>('tradeHistory');
  return history || [];
};

// 存储自选股票
export const saveWatchlist = (stocks: Array<{
  code: string;
  name: string;
}>): boolean => {
  return setStorageItem('watchlist', stocks);
};

// 获取自选股票
export const getWatchlist = (): Array<{
  code: string;
  name: string;
}> => {
  const watchlist = getStorageItem<Array<{
    code: string;
    name: string;
  }>>('watchlist');
  return watchlist || [];
};

// 添加股票到自选
export const addToWatchlist = (stock: {
  code: string;
  name: string;
}): boolean => {
  const watchlist = getWatchlist();
  const exists = watchlist.some(item => item.code === stock.code);
  if (!exists) {
    watchlist.push(stock);
    return saveWatchlist(watchlist);
  }
  return true;
};

// 从自选中删除股票
export const removeFromWatchlist = (code: string): boolean => {
  const watchlist = getWatchlist();
  const filtered = watchlist.filter(item => item.code !== code);
  return saveWatchlist(filtered);
};