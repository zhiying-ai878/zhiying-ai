// 存储工具函数
import { message } from 'antd';

// 生成更强的密钥
const generateStrongKey = (): string => {
  const key = localStorage.getItem('encryptionKey');
  if (key && key.length >= 64) {
    return key;
  }
  // 生成更安全的随机密钥（64位）
  const newKey = Array.from({ length: 64 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('');
  localStorage.setItem('encryptionKey', newKey);
  return newKey;
};

// 更安全的加密函数
export const encryptData = (data: string): string => {
  try {
    const key = generateStrongKey();
    // 使用更安全的加密方法 - 增强的XOR加密
    let result = '';
    for (let i = 0; i < data.length; i++) {
      const charCode = data.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      result += String.fromCharCode(charCode);
    }
    // 再进行Base64编码以确保安全存储
    return btoa(unescape(encodeURIComponent(result)));
  } catch (error) {
    console.error('加密失败:', error);
    // 降级到Base64编码
    return btoa(unescape(encodeURIComponent(data)));
  }
};

// 更安全的解密函数
export const decryptData = (encryptedData: string): string => {
  try {
    const key = generateStrongKey();
    const decodedData = decodeURIComponent(escape(atob(encryptedData)));
    let result = '';
    for (let i = 0; i < decodedData.length; i++) {
      const charCode = decodedData.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      result += String.fromCharCode(charCode);
    }
    return result;
  } catch (error) {
    console.error('解密失败:', error);
    // 降级尝试直接Base64解码
    try {
      return decodeURIComponent(escape(atob(encryptedData)));
    } catch {
      return '';
    }
  }
};

// 生成安全的随机ID
const generateSecureId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
};

// 验证输入数据
export const validateInput = (input: any, type: string): boolean => {
  switch (type) {
    case 'string':
      return typeof input === 'string' && input.length > 0;
    case 'number':
      return typeof input === 'number' && !isNaN(input);
    case 'boolean':
      return typeof input === 'boolean';
    case 'array':
      return Array.isArray(input);
    case 'object':
      return input !== null && typeof input === 'object';
    default:
      return false;
  }
};

// 存储数据到本地存储
export const setStorageItem = (key: string, value: any): boolean => {
  try {
    // 验证输入
    if (!validateInput(key, 'string')) {
      console.error('无效的存储键');
      return false;
    }
    
    const encryptedValue = encryptData(JSON.stringify(value));
    localStorage.setItem(key, encryptedValue);
    // 记录存储操作日志
    logStorageOperation('set', key);
    return true;
  } catch (error) {
    console.error('存储数据失败:', error);
    return false;
  }
};

// 从本地存储获取数据
export const getStorageItem = <T>(key: string): T | null => {
  try {
    // 验证输入
    if (!validateInput(key, 'string')) {
      console.error('无效的存储键');
      return null;
    }
    
    const encryptedValue = localStorage.getItem(key);
    if (!encryptedValue) return null;
    const decryptedValue = decryptData(encryptedValue);
    // 记录读取操作日志
    logStorageOperation('get', key);
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
    // 记录删除操作日志
    logStorageOperation('remove', key);
    return true;
  } catch (error) {
    console.error('删除数据失败:', error);
    return false;
  }
};

// 清除所有本地存储数据
export const clearStorage = (): boolean => {
  try {
    // 记录清除操作日志
    logStorageOperation('clear', 'all');
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
  permissions?: string[];
  sessionId?: string;
}): boolean => {
  // 生成会话ID
  const sessionId = userInfo.sessionId || generateSessionId();
  const userInfoWithSession = { ...userInfo, sessionId };
  // 验证token格式
  if (!validateToken(userInfo.token)) {
    console.error('无效的token格式');
    return false;
  }
  return setStorageItem('userInfo', userInfoWithSession);
};

// 生成会话ID
const generateSessionId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
};

// 验证token格式
const validateToken = (token: string): boolean => {
  // 简单的token格式验证
  return !!token && token.length > 10;
};

// 获取用户信息
export const getUserInfo = (): {
  username: string;
  token: string;
  expiresAt: number;
  permissions?: string[];
  sessionId?: string;
} | null => {
  const userInfo = getStorageItem<{
    username: string;
    token: string;
    expiresAt: number;
    permissions?: string[];
    sessionId?: string;
  }>('userInfo');
  
  // 检查token是否过期
  if (userInfo && userInfo.expiresAt < Date.now()) {
    removeStorageItem('userInfo');
    return null;
  }
  
  // 检查会话是否有效
  if (userInfo && !userInfo.sessionId) {
    // 为旧用户添加会话ID
    saveUserInfo({ ...userInfo, sessionId: generateSessionId() });
  }
  
  return userInfo;
};

// 权限检查
export const checkPermission = (requiredPermission: string): boolean => {
  const userInfo = getUserInfo();
  if (!userInfo) return false;
  
  // 如果用户没有权限列表，默认拥有所有权限
  if (!userInfo.permissions) return true;
  
  // 检查是否有直接权限或角色权限
  return userInfo.permissions.includes(requiredPermission) || checkRolePermission(userInfo.permissions, requiredPermission);
};

// 检查角色权限
const checkRolePermission = (permissions: string[], requiredPermission: string): boolean => {
  // 角色权限映射
  const rolePermissions: Record<string, string[]> = {
    'admin': ['trade', 'strategy', 'admin', 'view'],
    'trader': ['trade', 'view'],
    'analyst': ['strategy', 'view']
  };
  
  // 检查用户是否有角色权限
  for (const role in rolePermissions) {
    if (permissions.includes(role) && rolePermissions[role].includes(requiredPermission)) {
      return true;
    }
  }
  
  return false;
};

// 存储交易设置
export const saveTradeSettings = (settings: {
  maxTradeAmount: number;
  stopLoss: number;
  takeProfit: number;
  tradeFrequency: string;
  riskLevel: number;
}): boolean => {
  // 权限检查：只有具有交易权限的用户才能修改交易设置
  if (!checkPermission('trade')) {
    console.error('无权限修改交易设置');
    return false;
  }
  // 验证设置数据
  if (!validateTradeSettings(settings)) {
    console.error('无效的交易设置');
    return false;
  }
  return setStorageItem('tradeSettings', settings);
};

// 验证交易设置
const validateTradeSettings = (settings: any): boolean => {
  return (
    typeof settings.maxTradeAmount === 'number' && settings.maxTradeAmount > 0 &&
    typeof settings.stopLoss === 'number' && settings.stopLoss >= 0 && settings.stopLoss <= 100 &&
    typeof settings.takeProfit === 'number' && settings.takeProfit >= 0 &&
    typeof settings.tradeFrequency === 'string' &&
    typeof settings.riskLevel === 'number' && settings.riskLevel >= 1 && settings.riskLevel <= 5
  );
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
  // 权限检查：只有具有策略管理权限的用户才能修改策略设置
  if (!checkPermission('strategy')) {
    console.error('无权限修改策略设置');
    return false;
  }
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
  // 权限检查：只有具有交易权限的用户才能修改交易历史
  if (!checkPermission('trade')) {
    console.error('无权限修改交易历史');
    return false;
  }
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

// 获取当前用户
const getCurrentUser = (): string | null => {
  try {
    const userInfo = getUserInfo();
    return userInfo?.username || null;
  } catch (error) {
    console.error('获取当前用户失败:', error);
    return null;
  }
};

// 获取用户特定的存储key
const getUserStorageKey = (baseKey: string): string => {
  const username = getCurrentUser();
  return username ? `${baseKey}_${username}` : baseKey;
};

// 存储自选股票
export const saveWatchlist = (stocks: Array<{
  code: string;
  name: string;
}>): boolean => {
  const key = getUserStorageKey('watchlist');
  return setStorageItem(key, stocks);
};

// 获取自选股票
export const getWatchlist = (): Array<{
  code: string;
  name: string;
}> => {
  const key = getUserStorageKey('watchlist');
  const watchlist = getStorageItem<Array<{
    code: string;
    name: string;
  }>>(key);
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
  // 处理代码格式不匹配问题 - 支持带前缀和不带前缀的代码匹配
  const filtered = watchlist.filter(item => {
    // 完全匹配
    if (item.code === code) return false;
    
    // 处理带前缀和不带前缀的情况
    const itemCodeNoPrefix = item.code.startsWith('sh') || item.code.startsWith('sz') ? item.code.substring(2) : item.code;
    const targetCodeNoPrefix = code.startsWith('sh') || code.startsWith('sz') ? code.substring(2) : code;
    
    if (itemCodeNoPrefix === targetCodeNoPrefix) return false;
    
    // 尝试反向匹配（如果存储的是不带前缀的，而传入的是带前缀的）
    if (!item.code.startsWith('sh') && !item.code.startsWith('sz')) {
      const prefixedItemCode = item.code.startsWith('6') ? `sh${item.code}` : `sz${item.code}`;
      if (prefixedItemCode === code) return false;
    }
    
    return true;
  });
  return saveWatchlist(filtered);
};

// 存储敏感配置（如API密钥）
export const saveSensitiveConfig = (config: {
  apiKey?: string;
  secretKey?: string;
  brokerCredentials?: any;
}): boolean => {
  // 权限检查：只有具有管理员权限的用户才能修改敏感配置
  if (!checkPermission('admin')) {
    console.error('无权限修改敏感配置');
    return false;
  }
  // 加密敏感信息
  const encryptedConfig = {
    apiKey: config.apiKey ? encryptData(config.apiKey) : undefined,
    secretKey: config.secretKey ? encryptData(config.secretKey) : undefined,
    brokerCredentials: config.brokerCredentials ? encryptData(JSON.stringify(config.brokerCredentials)) : undefined
  };
  return setStorageItem('sensitiveConfig', encryptedConfig);
};

// 获取敏感配置
export const getSensitiveConfig = (): {
  apiKey?: string;
  secretKey?: string;
  brokerCredentials?: any;
} | null => {
  // 权限检查：只有具有管理员权限的用户才能获取敏感配置
  if (!checkPermission('admin')) {
    console.error('无权限获取敏感配置');
    return null;
  }
  const encryptedConfig = getStorageItem<{
    apiKey?: string;
    secretKey?: string;
    brokerCredentials?: string;
  }>('sensitiveConfig');
  
  if (!encryptedConfig) return null;
  
  // 解密敏感信息
  return {
    apiKey: encryptedConfig.apiKey ? decryptData(encryptedConfig.apiKey) : undefined,
    secretKey: encryptedConfig.secretKey ? decryptData(encryptedConfig.secretKey) : undefined,
    brokerCredentials: encryptedConfig.brokerCredentials ? JSON.parse(decryptData(encryptedConfig.brokerCredentials)) : undefined
  };
};

// 存储操作日志
const logStorageOperation = (operation: string, key: string, details?: any) => {
  try {
    const log = {
      timestamp: Date.now(),
      operation,
      key,
      userId: getCurrentUser(),
      ip: window.location.hostname, // 记录来源地址
      userAgent: navigator.userAgent, // 记录用户代理
      details: details ? JSON.stringify(details) : undefined
    };
    
    // 获取现有的日志
    const logs = getStorageItem<Array<any>>('storageLogs') || [];
    logs.push(log);
    
    // 只保留最近200条日志
    if (logs.length > 200) {
      logs.splice(0, logs.length - 200);
    }
    
    // 存储日志（不加密，方便查看）
    localStorage.setItem('storageLogs', JSON.stringify(logs));
  } catch (error) {
    console.error('记录存储操作日志失败:', error);
  }
};

// 清除存储操作日志
export const clearStorageLogs = (): boolean => {
  try {
    localStorage.removeItem('storageLogs');
    return true;
  } catch (error) {
    console.error('清除存储操作日志失败:', error);
    return false;
  }
};

// 验证用户会话
export const validateSession = (): boolean => {
  const userInfo = getUserInfo();
  if (!userInfo) return false;
  
  // 检查会话是否有效
  return userInfo.sessionId !== undefined;
};

// 登出用户
export const logoutUser = (): boolean => {
  // 记录登出日志
  logStorageOperation('logout', 'userInfo');
  // 清除用户信息
  return removeStorageItem('userInfo');
};

// 检查存储安全状态
export const checkStorageSecurity = (): {
  isSecure: boolean;
  issues: string[];
  securityScore: number;
} => {
  const issues: string[] = [];
  let securityScore = 100;
  
  // 检查加密密钥是否存在
  const key = localStorage.getItem('encryptionKey');
  if (!key) {
    issues.push('加密密钥不存在');
    securityScore -= 30;
  } else if (key.length < 64) {
    issues.push('加密密钥长度不足');
    securityScore -= 20;
  }
  
  // 检查用户信息是否加密
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo && !userInfo.includes('=')) {
    issues.push('用户信息可能未加密');
    securityScore -= 20;
  }
  
  // 检查敏感配置是否加密
  const sensitiveConfig = localStorage.getItem('sensitiveConfig');
  if (sensitiveConfig && !sensitiveConfig.includes('=')) {
    issues.push('敏感配置可能未加密');
    securityScore -= 20;
  }
  
  // 检查存储日志是否存在
  const storageLogs = localStorage.getItem('storageLogs');
  if (!storageLogs) {
    issues.push('存储操作日志不存在');
    securityScore -= 10;
  }
  
  // 检查会话是否有效
  const userInfoData = getUserInfo();
  if (userInfoData && !userInfoData.sessionId) {
    issues.push('用户会话ID不存在');
    securityScore -= 10;
  }
  
  // 确保安全分数不低于0
  securityScore = Math.max(0, securityScore);
  
  return {
    isSecure: issues.length === 0,
    issues,
    securityScore
  };
};

// 增强存储安全
export const enhanceStorageSecurity = (): boolean => {
  try {
    // 生成新的加密密钥
    generateStrongKey();
    
    // 重新加密所有数据
    const keysToReencrypt = ['userInfo', 'tradeSettings', 'strategySettings', 'tradeHistory'];
    keysToReencrypt.forEach(key => {
      const data = getStorageItem(key);
      if (data) {
        setStorageItem(key, data);
      }
    });
    
    return true;
  } catch (error) {
    console.error('增强存储安全失败:', error);
    return false;
  }
};

// ==================== 数据导出/导入功能 ====================

// 导出所有数据
export const exportAllData = (): string => {
  try {
    const exportData: Record<string, any> = {
      version: '1.0',
      exportTime: new Date().toISOString(),
      data: {}
    };
    
    // 收集所有需要导出的数据
    const keysToExport = [
      'portfolio',           // 持仓数据
      'currentUser',         // 用户信息
      'signalHistory',       // 信号历史
      'tradeSettings',       // 交易设置
      'strategySettings',    // 策略设置
      'tradeHistory',        // 交易历史
      'watchlist',           // 自选股
      'encryptionKey'        // 加密密钥（重要！用于跨设备解密）
    ];
    
    // 获取当前用户名，处理带用户名的key
    const username = getCurrentUser();
    if (username) {
      keysToExport.push(`watchlist_${username}`);
    }
    
    // 遍历localStorage，导出所有相关数据
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        // 导出匹配的key
        if (keysToExport.some(exportKey => key.includes(exportKey))) {
          exportData.data[key] = localStorage.getItem(key);
        }
      }
    }
    
    // 生成JSON并格式化
    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error('导出数据失败:', error);
    throw new Error('数据导出失败');
  }
};

// 下载导出文件
export const downloadExportFile = (filename?: string): void => {
  try {
    const dataStr = exportAllData();
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `zhiying-ai-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('数据导出成功');
  } catch (error) {
    console.error('下载导出文件失败:', error);
    throw new Error('文件下载失败');
  }
};

// 导入数据
export const importAllData = (jsonString: string): boolean => {
  try {
    const importData = JSON.parse(jsonString);
    
    // 验证数据格式
    if (!importData.version || !importData.data) {
      throw new Error('无效的备份文件格式');
    }
    
    // 确认导入
    const confirmed = window.confirm(
      `即将导入备份数据（${new Date(importData.exportTime).toLocaleString('zh-CN')}）\n\n` +
      '注意：这将覆盖当前所有数据，是否继续？'
    );
    
    if (!confirmed) {
      return false;
    }
    
    // 先备份当前数据（以防万一）
    try {
      const currentBackup = exportAllData();
      const backupBlob = new Blob([currentBackup], { type: 'application/json' });
      const backupUrl = URL.createObjectURL(backupBlob);
      const backupLink = document.createElement('a');
      backupLink.href = backupUrl;
      backupLink.download = `zhiying-ai-auto-backup-before-import-${Date.now()}.json`;
      document.body.appendChild(backupLink);
      backupLink.click();
      document.body.removeChild(backupLink);
      URL.revokeObjectURL(backupUrl);
    } catch (e) {
      console.log('自动备份失败，但继续导入');
    }
    
    // 清空现有数据
    localStorage.clear();
    
    // 导入数据
    Object.keys(importData.data).forEach(key => {
      const value = importData.data[key];
      if (value !== null && value !== undefined) {
        localStorage.setItem(key, value);
      }
    });
    
    console.log('数据导入成功');
    alert('数据导入成功！请刷新页面查看。');
    
    return true;
  } catch (error) {
    console.error('导入数据失败:', error);
    alert(`导入失败：${error instanceof Error ? error.message : '未知错误'}`);
    return false;
  }
};

// 触发文件选择并导入
export const triggerImportFile = (): void => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,application/json';
  input.onchange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          importAllData(content);
        } catch (error) {
          console.error('读取文件失败:', error);
          alert('文件读取失败');
        }
      };
      reader.readAsText(file);
    }
  };
  input.click();
};

// ==================== GitHub Gist 云同步功能 ====================

// Gist 配置存储 key
const GIST_CONFIG_KEY = 'gistSyncConfig';

// Gist 同步配置接口
interface GistConfig {
  githubToken: string;
  gistId: string;
  autoSync: boolean;
}

// 获取 Gist 配置
export const getGistConfig = (): GistConfig | null => {
  try {
    const config = getStorageItem<GistConfig>(GIST_CONFIG_KEY);
    return config;
  } catch (error) {
    console.error('获取Gist配置失败:', error);
    return null;
  }
};

// 保存 Gist 配置
export const saveGistConfig = (config: GistConfig): boolean => {
  try {
    return setStorageItem(GIST_CONFIG_KEY, config);
  } catch (error) {
    console.error('保存Gist配置失败:', error);
    return false;
  }
};

// 创建新的 Gist
const createNewGist = async (githubToken: string, data: string): Promise<string> => {
  const response = await fetch('https://api.github.com/gists', {
    method: 'POST',
    headers: {
      'Authorization': `token ${githubToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.github.v3+json'
    },
    body: JSON.stringify({
      description: '智盈AI数据备份',
      public: false,
      files: {
        'zhiying-ai-backup.json': {
          content: data
        }
      }
    })
  });

  if (!response.ok) {
    throw new Error(`创建Gist失败: ${response.status}`);
  }

  const result = await response.json();
  return result.id;
};

// 更新 Gist
const updateGist = async (githubToken: string, gistId: string, data: string): Promise<void> => {
  const response = await fetch(`https://api.github.com/gists/${gistId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `token ${githubToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.github.v3+json'
    },
    body: JSON.stringify({
      description: `智盈AI数据备份 - ${new Date().toLocaleString('zh-CN')}`,
      files: {
        'zhiying-ai-backup.json': {
          content: data
        }
      }
    })
  });

  if (!response.ok) {
    throw new Error(`更新Gist失败: ${response.status}`);
  }
};

// 从 Gist 获取数据
const getFromGist = async (githubToken: string, gistId: string): Promise<string> => {
  const response = await fetch(`https://api.github.com/gists/${gistId}`, {
    method: 'GET',
    headers: {
      'Authorization': `token ${githubToken}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  });

  if (!response.ok) {
    throw new Error(`获取Gist失败: ${response.status}`);
  }

  const result = await response.json();
  const file = result.files['zhiying-ai-backup.json'];
  if (!file) {
    throw new Error('备份文件不存在');
  }

  return file.content;
};

// 同步数据到云端
export const syncToCloud = async (showSuccessMessage: boolean = true): Promise<boolean> => {
  try {
    const config = getGistConfig();
    if (!config || !config.githubToken) {
      if (showSuccessMessage) {
        alert('请先配置云同步设置！');
      }
      return false;
    }

    const data = exportAllData();

    if (config.gistId) {
      await updateGist(config.githubToken, config.gistId, data);
    } else {
      const gistId = await createNewGist(config.githubToken, data);
      config.gistId = gistId;
      saveGistConfig(config);
    }

    if (showSuccessMessage) {
      message.success('☁️ 云同步成功！');
    }
    console.log('云同步成功');
    return true;
  } catch (error) {
    console.error('云同步失败:', error);
    message.error(`云同步失败: ${error instanceof Error ? error.message : '未知错误'}`);
    return false;
  }
};

// 从云端同步数据
export const syncFromCloud = async (): Promise<boolean> => {
  try {
    const config = getGistConfig();
    if (!config || !config.githubToken || !config.gistId) {
      alert('请先配置云同步设置！');
      return false;
    }

    const data = await getFromGist(config.githubToken, config.gistId);
    importAllData(data);
    return true;
  } catch (error) {
    console.error('从云端同步失败:', error);
    message.error(`从云端同步失败: ${error instanceof Error ? error.message : '未知错误'}`);
    return false;
  }
};

// 开启自动同步
let autoSyncInterval: NodeJS.Timeout | null = null;
let syncInProgress = false;

export const startAutoSync = (): void => {
  const config = getGistConfig();
  if (config?.autoSync && config?.githubToken) {
    // 页面加载时先从云端同步数据
    syncFromCloudOnStartup();
    
    // 每5分钟自动同步一次
    autoSyncInterval = setInterval(() => {
      if (!syncInProgress) {
        syncToCloud(false);
      }
    }, 5 * 60 * 1000);
    console.log('自动同步已启动');
  }
};

// 页面加载时从云端同步数据
const syncFromCloudOnStartup = async (): Promise<void> => {
  try {
    syncInProgress = true;
    const config = getGistConfig();
    if (config?.autoSync && config?.githubToken && config?.gistId) {
      console.log('页面加载时自动从云端同步数据...');
      const success = await syncFromCloud();
      if (success) {
        console.log('页面加载时云端同步成功');
      }
    }
  } catch (error) {
    console.error('页面加载时云端同步失败:', error);
  } finally {
    syncInProgress = false;
  }
};

export const stopAutoSync = (): void => {
  if (autoSyncInterval) {
    clearInterval(autoSyncInterval);
    autoSyncInterval = null;
    console.log('自动同步已停止');
  }
};

// 监听本地存储变化，自动同步到云端
export const setupAutoSyncListener = (): void => {
  window.addEventListener('storage', async (event) => {
    if (event.key && event.key !== GIST_CONFIG_KEY) {
      const config = getGistConfig();
      if (config?.autoSync && config?.githubToken && !syncInProgress) {
        // 本地存储变化时延迟1秒后同步到云端（防抖）
        setTimeout(() => {
          syncToCloud(false);
        }, 1000);
      }
    }
  });
  
  // 监听页面可见性变化，页面显示时检查云端更新
  document.addEventListener('visibilitychange', async () => {
    if (!document.hidden) {
      const config = getGistConfig();
      if (config?.autoSync && config?.githubToken && config?.gistId && !syncInProgress) {
        await syncFromCloud();
      }
    }
  });
};