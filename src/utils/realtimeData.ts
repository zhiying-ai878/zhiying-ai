// 实时数据流处理模块

// 实时数据接口
export interface RealTimeData {
  stockCode: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: number;
}

// 设备同步数据接口
export interface SyncData {
  deviceId: string;
  timestamp: number;
  data: any;
  type: 'strategy' | 'portfolio' | 'settings' | 'trade';
}

// 预警配置接口
export interface AlertConfig {
  id: string;
  stockCode: string;
  type: 'price' | 'volume' | 'changePercent' | 'technical';
  condition: 'above' | 'below' | 'cross';
  value: number;
  active: boolean;
  notify: boolean;
  message: string;
}

// 预警事件接口
export interface AlertEvent {
  id: string;
  stockCode: string;
  type: 'price' | 'volume' | 'changePercent' | 'technical';
  condition: 'above' | 'below' | 'cross';
  value: number;
  currentValue: number;
  timestamp: number;
  message: string;
}

// 实时数据管理器
class RealTimeDataManager {
  private ws: WebSocket | null = null;
  private listeners: Map<string, Array<(data: RealTimeData) => void>> = new Map();
  private syncListeners: Map<string, Array<(data: SyncData) => void>> = new Map();
  private alertConfigs: Map<string, AlertConfig> = new Map();
  private alertEvents: AlertEvent[] = [];
  private alertListeners: Array<(event: AlertEvent) => void> = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 500;
  private url: string;
  private deviceId: string;
  private isReconnecting = false;
  private dataBuffer: RealTimeData[] = [];
  private bufferTimer: NodeJS.Timeout | null = null;
  private bufferInterval = 100; // 批处理间隔（毫秒）
  private lastDataUpdate: Map<string, number> = new Map();
  private minUpdateInterval = 50; // 最小更新间隔（毫秒）
  private maxBufferSize = 1000; // 最大缓冲区大小
  private memoryLimit = 10 * 1024 * 1024; // 10MB 内存限制
  private memoryUsage = 0;

  constructor(url: string, _userId: string, deviceId: string) {
    this.url = url;
    this.deviceId = deviceId;
  }

  // 连接WebSocket
  connect(): void {
    if (this.isReconnecting) return;
    
    try {
      this.ws = new WebSocket(this.url);
      
      this.ws.onopen = () => {
        console.log('WebSocket连接成功');
        this.reconnectAttempts = 0;
        this.isReconnecting = false;
        // 发送设备信息
        this.sendDeviceInfo();
      };
      
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'realtime') {
            this.handleRealTimeData(data);
          } else if (data.type === 'sync') {
            this.handleSyncData(data);
          }
        } catch (error) {
          console.error('解析WebSocket消息失败:', error);
        }
      };
      
      this.ws.onclose = () => {
        console.log('WebSocket连接关闭');
        this.attemptReconnect();
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket错误:', error);
      };
    } catch (error) {
      console.error('WebSocket连接失败:', error);
      this.attemptReconnect();
    }
  }

  // 发送设备信息
  private sendDeviceInfo(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'device_info',
        deviceId: this.deviceId,
        timestamp: Date.now()
      }));
    }
  }

  // 尝试重连
  private attemptReconnect(): void {
    if (this.isReconnecting) return;
    
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.isReconnecting = true;
      this.reconnectAttempts++;
      const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 10000); // 最大延迟10秒
      console.log(`尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.error('重连失败，已达到最大尝试次数');
      this.isReconnecting = false;
    }
  }

  // 批处理数据
  private processDataBuffer(): void {
    if (this.dataBuffer.length === 0) return;
    
    // 按股票代码分组
    const groupedData = new Map<string, RealTimeData>();
    this.dataBuffer.forEach(data => {
      groupedData.set(data.stockCode, data);
    });
    
    // 处理每组数据
    groupedData.forEach(data => {
      this.handleRealTimeDataInternal(data);
    });
    
    // 清空缓冲区
    this.dataBuffer = [];
  }

  // 内部处理实时数据
  private handleRealTimeDataInternal(data: RealTimeData): void {
    const listeners = this.listeners.get(data.stockCode) || [];
    listeners.forEach(listener => listener(data));
    
    // 同时触发所有股票的监听器
    const allListeners = this.listeners.get('*') || [];
    allListeners.forEach(listener => listener(data));
    
    // 检查预警条件
    this.checkAlerts(data);
  }

  // 处理实时数据
  private handleRealTimeData(data: RealTimeData): void {
    const now = Date.now();
    const lastUpdate = this.lastDataUpdate.get(data.stockCode) || 0;
    
    // 节流处理，避免频繁更新
    if (now - lastUpdate < this.minUpdateInterval) {
      return;
    }
    
    this.lastDataUpdate.set(data.stockCode, now);
    
    // 检查缓冲区大小
    if (this.dataBuffer.length >= this.maxBufferSize) {
      // 处理当前缓冲区数据
      this.processDataBuffer();
    }
    
    // 检查内存使用
    this.calculateMemoryUsage(data);
    if (this.memoryUsage > this.memoryLimit) {
      console.warn('内存使用超过限制，清理缓冲区');
      this.processDataBuffer();
    }
    
    // 添加到缓冲区
    this.dataBuffer.push(data);
    
    // 设置批处理定时器
    if (!this.bufferTimer) {
      this.bufferTimer = setTimeout(() => {
        this.processDataBuffer();
        this.bufferTimer = null;
      }, this.bufferInterval);
    }
  }

  // 计算内存使用
  private calculateMemoryUsage(data: RealTimeData): void {
    // 估算数据大小（简化计算）
    const dataSize = JSON.stringify(data).length;
    this.memoryUsage += dataSize;
    
    // 定期清理内存使用记录
    if (this.memoryUsage > this.memoryLimit * 0.8) {
      this.memoryUsage = 0;
    }
  }

  // 处理同步数据
  private handleSyncData(data: SyncData): void {
    // 过滤掉自己发送的数据
    if (data.deviceId === this.deviceId) return;
    
    const listeners = this.syncListeners.get(data.type) || [];
    listeners.forEach(listener => listener(data));
    
    // 同时触发所有类型的同步监听器
    const allListeners = this.syncListeners.get('*') || [];
    allListeners.forEach(listener => listener(data));
  }

  // 订阅实时数据
  subscribe(stockCode: string, listener: (data: RealTimeData) => void): void {
    if (!this.listeners.has(stockCode)) {
      this.listeners.set(stockCode, []);
    }
    this.listeners.get(stockCode)?.push(listener);
  }

  // 取消订阅
  unsubscribe(stockCode: string, listener: (data: RealTimeData) => void): void {
    const listeners = this.listeners.get(stockCode);
    if (listeners) {
      this.listeners.set(stockCode, listeners.filter(l => l !== listener));
    }
  }

  // 订阅同步数据
  subscribeSync(type: string, listener: (data: SyncData) => void): void {
    if (!this.syncListeners.has(type)) {
      this.syncListeners.set(type, []);
    }
    this.syncListeners.get(type)?.push(listener);
  }

  // 取消同步订阅
  unsubscribeSync(type: string, listener: (data: SyncData) => void): void {
    const listeners = this.syncListeners.get(type);
    if (listeners) {
      this.syncListeners.set(type, listeners.filter(l => l !== listener));
    }
  }

  // 发送同步数据
  sendSyncData(type: 'strategy' | 'portfolio' | 'settings' | 'trade', data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const syncData: SyncData = {
        deviceId: this.deviceId,
        timestamp: Date.now(),
        data,
        type
      };
      this.ws.send(JSON.stringify(syncData));
    }
  }

  // 关闭连接
  close(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    // 清理定时器
    if (this.bufferTimer) {
      clearTimeout(this.bufferTimer);
      this.bufferTimer = null;
    }
    
    // 清空缓冲区
    this.dataBuffer = [];
  }

  // 检查连接状态
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  // 添加预警配置
  addAlertConfig(config: AlertConfig): void {
    this.alertConfigs.set(config.id, config);
  }

  // 删除预警配置
  removeAlertConfig(id: string): void {
    this.alertConfigs.delete(id);
  }

  // 更新预警配置
  updateAlertConfig(config: AlertConfig): void {
    this.alertConfigs.set(config.id, config);
  }

  // 获取预警配置
  getAlertConfigs(): AlertConfig[] {
    return Array.from(this.alertConfigs.values());
  }

  // 订阅预警事件
  subscribeAlert(listener: (event: AlertEvent) => void): void {
    this.alertListeners.push(listener);
  }

  // 取消订阅预警事件
  unsubscribeAlert(listener: (event: AlertEvent) => void): void {
    this.alertListeners = this.alertListeners.filter(l => l !== listener);
  }

  // 检查预警条件
  private checkAlerts(data: RealTimeData): void {
    const activeAlerts = Array.from(this.alertConfigs.values()).filter(config => config.active);
    
    activeAlerts.forEach(config => {
      if (config.stockCode === data.stockCode || config.stockCode === '*') {
        let currentValue: number;
        
        switch (config.type) {
          case 'price':
            currentValue = data.price;
            break;
          case 'volume':
            currentValue = data.volume;
            break;
          case 'changePercent':
            currentValue = data.changePercent;
            break;
          case 'technical':
            // 这里可以添加技术指标的计算
            currentValue = 0;
            break;
          default:
            return;
        }

        let shouldTrigger = false;
        switch (config.condition) {
          case 'above':
            shouldTrigger = currentValue > config.value;
            break;
          case 'below':
            shouldTrigger = currentValue < config.value;
            break;
          case 'cross':
            // 这里需要存储历史值来检测交叉
            shouldTrigger = false;
            break;
          default:
            return;
        }

        if (shouldTrigger) {
          this.triggerAlert({
            id: Date.now().toString(),
            stockCode: data.stockCode,
            type: config.type,
            condition: config.condition,
            value: config.value,
            currentValue,
            timestamp: Date.now(),
            message: config.message
          });
        }
      }
    });
  }

  // 触发预警事件
  private triggerAlert(event: AlertEvent): void {
    this.alertEvents.push(event);
    // 限制事件数量，只保留最近100个
    if (this.alertEvents.length > 100) {
      this.alertEvents.shift();
    }

    // 通知所有监听器
    this.alertListeners.forEach(listener => listener(event));

    // 如果需要通知用户
    if (event.message) {
      this.notifyUser(event);
    }
  }

  // 通知用户
  private notifyUser(event: AlertEvent): void {
    // 这里可以实现浏览器通知
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('市场预警', {
        body: `${event.stockCode}: ${event.message}`,
        icon: '/favicon.ico'
      });
    }
  }

  // 获取预警事件历史
  getAlertEvents(): AlertEvent[] {
    return this.alertEvents;
  }

  // 清空预警事件历史
  clearAlertEvents(): void {
    this.alertEvents = [];
  }
}

// 设备管理
class DeviceManager {
  private devices: Map<string, { lastActive: number; deviceInfo: any }> = new Map();

  constructor(_userId: string) {
  }

  // 添加设备
  addDevice(deviceId: string, deviceInfo: any): void {
    this.devices.set(deviceId, {
      lastActive: Date.now(),
      deviceInfo
    });
  }

  // 更新设备状态
  updateDevice(deviceId: string): void {
    const device = this.devices.get(deviceId);
    if (device) {
      device.lastActive = Date.now();
    }
  }

  // 获取所有设备
  getDevices(): Array<{ deviceId: string; lastActive: number; deviceInfo: any }> {
    return Array.from(this.devices.entries()).map(([deviceId, info]) => ({
      deviceId,
      ...info
    }));
  }

  // 清理 inactive 设备
  cleanupInactiveDevices(timeout: number = 3600000): void { // 默认1小时
    const now = Date.now();
    for (const [deviceId, info] of this.devices.entries()) {
      if (now - info.lastActive > timeout) {
        this.devices.delete(deviceId);
      }
    }
  }
}

// 本地存储同步
export const syncWithLocalStorage = {
  // 同步数据到本地存储
  syncToLocal: (key: string, data: any): void => {
    try {
      localStorage.setItem(key, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('同步到本地存储失败:', error);
    }
  },

  // 从本地存储同步
  syncFromLocal: (key: string): { data: any; timestamp: number } | null => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored);
      }
      return null;
    } catch (error) {
      console.error('从本地存储同步失败:', error);
      return null;
    }
  },

  // 比较并合并数据
  mergeData: (localData: any, remoteData: any, timestamp: number): any => {
    // 简单的时间戳比较策略
    const localTimestamp = localData?.timestamp || 0;
    if (timestamp > localTimestamp) {
      return remoteData;
    }
    return localData?.data;
  }
};

// 生成设备ID
export const generateDeviceId = (): string => {
  const navigatorInfo = navigator.userAgent + navigator.platform;
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 10);
  return btoa(navigatorInfo + timestamp + random).substring(0, 32);
};

// 导出单例实例
let realTimeManager: RealTimeDataManager | null = null;
let deviceManager: DeviceManager | null = null;

export const getRealTimeManager = (url: string = 'wss://api.example.com/ws', userId: string = 'default', deviceId: string = generateDeviceId()): RealTimeDataManager => {
  if (!realTimeManager) {
    realTimeManager = new RealTimeDataManager(url, userId, deviceId);
    realTimeManager.connect();
  }
  return realTimeManager;
};

export const getDeviceManager = (userId: string = 'default'): DeviceManager => {
  if (!deviceManager) {
    deviceManager = new DeviceManager(userId);
  }
  return deviceManager;
};

// 存储股票的基准价格
const stockBasePrices: Record<string, number> = {
  '000001': 12.56,  // 平安银行
  '600519': 1856.00, // 贵州茅台
  '002594': 256.80,  // 比亚迪
  '300750': 210.80,  // 宁德时代
  '601318': 48.20,   // 中国平安
  'sh000001': 4123.14, // 上证指数
  'sz399001': 12567.89, // 深证成指
  'sz399006': 2567.89, // 创业板指
  'sh000688': 923.45, // 科创板指
};

// 模拟实时数据（用于开发测试）
export const mockRealTimeData = (stockCode: string): RealTimeData => {
  // 获取股票的基准价格，如果没有则使用默认值
  const basePrice = stockBasePrices[stockCode] || 100;
  // 生成小幅度的随机变化（±0.5%）
  const changePercent = (Math.random() - 0.5) * 1;
  const change = basePrice * (changePercent / 100);
  const price = basePrice + change;
  
  return {
    stockCode,
    price: parseFloat(price.toFixed(2)),
    change: parseFloat(change.toFixed(2)),
    changePercent: parseFloat(changePercent.toFixed(2)),
    volume: Math.floor(Math.random() * 1000000),
    timestamp: Date.now()
  };
};

// 启动模拟实时数据
export const startMockRealTimeData = (callback: (data: RealTimeData) => void, interval: number = 1000): number => {
  const stockCodes = ['000001', '600519', '002594', '300750', '601318', 'sh000001', 'sz399001', 'sz399006', 'sh000688'];
  let index = 0;
  
  const timer = setInterval(() => {
    const stockCode = stockCodes[index % stockCodes.length];
    const data = mockRealTimeData(stockCode);
    callback(data);
    index++;
  }, interval) as unknown as number;
  
  return timer;
};
