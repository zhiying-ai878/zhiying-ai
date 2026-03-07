// 实时数据流处理模块
// 实时数据管理器
class RealTimeDataManager {
    constructor(url, _userId, deviceId) {
        Object.defineProperty(this, "ws", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "listeners", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "syncListeners", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "alertConfigs", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "alertEvents", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "alertListeners", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "reconnectAttempts", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "maxReconnectAttempts", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 10
        });
        Object.defineProperty(this, "reconnectDelay", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 500
        });
        Object.defineProperty(this, "url", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "deviceId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "isReconnecting", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "dataBuffer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "bufferTimer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "bufferInterval", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 100
        }); // 批处理间隔（毫秒）
        Object.defineProperty(this, "lastDataUpdate", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "minUpdateInterval", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 50
        }); // 最小更新间隔（毫秒）
        Object.defineProperty(this, "maxBufferSize", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 1000
        }); // 最大缓冲区大小
        Object.defineProperty(this, "memoryLimit", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 10 * 1024 * 1024
        }); // 10MB 内存限制
        Object.defineProperty(this, "memoryUsage", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        this.url = url;
        this.deviceId = deviceId;
    }
    // 连接WebSocket
    connect() {
        if (this.isReconnecting)
            return;
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
                    }
                    else if (data.type === 'sync') {
                        this.handleSyncData(data);
                    }
                }
                catch (error) {
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
        }
        catch (error) {
            console.error('WebSocket连接失败:', error);
            this.attemptReconnect();
        }
    }
    // 发送设备信息
    sendDeviceInfo() {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                type: 'device_info',
                deviceId: this.deviceId,
                timestamp: Date.now()
            }));
        }
    }
    // 尝试重连
    attemptReconnect() {
        if (this.isReconnecting)
            return;
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.isReconnecting = true;
            this.reconnectAttempts++;
            const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 10000); // 最大延迟10秒
            console.log(`尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
            setTimeout(() => {
                this.connect();
            }, delay);
        }
        else {
            console.error('重连失败，已达到最大尝试次数');
            this.isReconnecting = false;
        }
    }
    // 批处理数据
    processDataBuffer() {
        if (this.dataBuffer.length === 0)
            return;
        // 按股票代码分组
        const groupedData = new Map();
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
    handleRealTimeDataInternal(data) {
        const listeners = this.listeners.get(data.stockCode) || [];
        listeners.forEach(listener => listener(data));
        // 同时触发所有股票的监听器
        const allListeners = this.listeners.get('*') || [];
        allListeners.forEach(listener => listener(data));
        // 检查预警条件
        this.checkAlerts(data);
    }
    // 处理实时数据
    handleRealTimeData(data) {
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
    calculateMemoryUsage(data) {
        // 估算数据大小（简化计算）
        const dataSize = JSON.stringify(data).length;
        this.memoryUsage += dataSize;
        // 定期清理内存使用记录
        if (this.memoryUsage > this.memoryLimit * 0.8) {
            this.memoryUsage = 0;
        }
    }
    // 处理同步数据
    handleSyncData(data) {
        // 过滤掉自己发送的数据
        if (data.deviceId === this.deviceId)
            return;
        const listeners = this.syncListeners.get(data.type) || [];
        listeners.forEach(listener => listener(data));
        // 同时触发所有类型的同步监听器
        const allListeners = this.syncListeners.get('*') || [];
        allListeners.forEach(listener => listener(data));
    }
    // 订阅实时数据
    subscribe(stockCode, listener) {
        if (!this.listeners.has(stockCode)) {
            this.listeners.set(stockCode, []);
        }
        this.listeners.get(stockCode)?.push(listener);
    }
    // 取消订阅
    unsubscribe(stockCode, listener) {
        const listeners = this.listeners.get(stockCode);
        if (listeners) {
            this.listeners.set(stockCode, listeners.filter(l => l !== listener));
        }
    }
    // 订阅同步数据
    subscribeSync(type, listener) {
        if (!this.syncListeners.has(type)) {
            this.syncListeners.set(type, []);
        }
        this.syncListeners.get(type)?.push(listener);
    }
    // 取消同步订阅
    unsubscribeSync(type, listener) {
        const listeners = this.syncListeners.get(type);
        if (listeners) {
            this.syncListeners.set(type, listeners.filter(l => l !== listener));
        }
    }
    // 发送同步数据
    sendSyncData(type, data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            const syncData = {
                deviceId: this.deviceId,
                timestamp: Date.now(),
                data,
                type
            };
            this.ws.send(JSON.stringify(syncData));
        }
    }
    // 关闭连接
    close() {
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
    isConnected() {
        return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
    }
    // 添加预警配置
    addAlertConfig(config) {
        this.alertConfigs.set(config.id, config);
    }
    // 删除预警配置
    removeAlertConfig(id) {
        this.alertConfigs.delete(id);
    }
    // 更新预警配置
    updateAlertConfig(config) {
        this.alertConfigs.set(config.id, config);
    }
    // 获取预警配置
    getAlertConfigs() {
        return Array.from(this.alertConfigs.values());
    }
    // 订阅预警事件
    subscribeAlert(listener) {
        this.alertListeners.push(listener);
    }
    // 取消订阅预警事件
    unsubscribeAlert(listener) {
        this.alertListeners = this.alertListeners.filter(l => l !== listener);
    }
    // 检查预警条件
    checkAlerts(data) {
        const activeAlerts = Array.from(this.alertConfigs.values()).filter(config => config.active);
        activeAlerts.forEach(config => {
            if (config.stockCode === data.stockCode || config.stockCode === '*') {
                let currentValue;
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
    triggerAlert(event) {
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
    notifyUser(event) {
        // 这里可以实现浏览器通知
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('市场预警', {
                body: `${event.stockCode}: ${event.message}`,
                icon: '/favicon.ico'
            });
        }
    }
    // 获取预警事件历史
    getAlertEvents() {
        return this.alertEvents;
    }
    // 清空预警事件历史
    clearAlertEvents() {
        this.alertEvents = [];
    }
}
// 设备管理
class DeviceManager {
    constructor(_userId) {
        Object.defineProperty(this, "devices", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
    }
    // 添加设备
    addDevice(deviceId, deviceInfo) {
        this.devices.set(deviceId, {
            lastActive: Date.now(),
            deviceInfo
        });
    }
    // 更新设备状态
    updateDevice(deviceId) {
        const device = this.devices.get(deviceId);
        if (device) {
            device.lastActive = Date.now();
        }
    }
    // 获取所有设备
    getDevices() {
        return Array.from(this.devices.entries()).map(([deviceId, info]) => ({
            deviceId,
            ...info
        }));
    }
    // 清理 inactive 设备
    cleanupInactiveDevices(timeout = 3600000) {
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
    syncToLocal: (key, data) => {
        try {
            localStorage.setItem(key, JSON.stringify({
                data,
                timestamp: Date.now()
            }));
        }
        catch (error) {
            console.error('同步到本地存储失败:', error);
        }
    },
    // 从本地存储同步
    syncFromLocal: (key) => {
        try {
            const stored = localStorage.getItem(key);
            if (stored) {
                return JSON.parse(stored);
            }
            return null;
        }
        catch (error) {
            console.error('从本地存储同步失败:', error);
            return null;
        }
    },
    // 比较并合并数据
    mergeData: (localData, remoteData, timestamp) => {
        // 简单的时间戳比较策略
        const localTimestamp = localData?.timestamp || 0;
        if (timestamp > localTimestamp) {
            return remoteData;
        }
        return localData?.data;
    }
};
// 生成设备ID
export const generateDeviceId = () => {
    const navigatorInfo = navigator.userAgent + navigator.platform;
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 10);
    return btoa(navigatorInfo + timestamp + random).substring(0, 32);
};
// 导出单例实例
let realTimeManager = null;
let deviceManager = null;
export const getRealTimeManager = (url = 'wss://api.example.com/ws', userId = 'default', deviceId = generateDeviceId()) => {
    if (!realTimeManager) {
        realTimeManager = new RealTimeDataManager(url, userId, deviceId);
        realTimeManager.connect();
    }
    return realTimeManager;
};
export const getDeviceManager = (userId = 'default') => {
    if (!deviceManager) {
        deviceManager = new DeviceManager(userId);
    }
    return deviceManager;
};
// 模拟实时数据（用于开发测试）
export const mockRealTimeData = (stockCode) => {
    const basePrice = 100 + Math.random() * 100;
    const change = (Math.random() - 0.5) * 5;
    const price = basePrice + change;
    return {
        stockCode,
        price,
        change,
        changePercent: (change / basePrice) * 100,
        volume: Math.floor(Math.random() * 1000000),
        timestamp: Date.now()
    };
};
// 启动模拟实时数据
export const startMockRealTimeData = (callback, interval = 1000) => {
    const stockCodes = ['000001', '600519', '000858', '601318', '000333'];
    let index = 0;
    const timer = setInterval(() => {
        const stockCode = stockCodes[index % stockCodes.length];
        const data = mockRealTimeData(stockCode);
        callback(data);
        index++;
    }, interval);
    return timer;
};
