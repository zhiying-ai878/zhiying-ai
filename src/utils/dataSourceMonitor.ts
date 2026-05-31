import { enhancedDataSourceManager } from './enhancedDataSourceManager';

// 数据源状态接口
export interface DataSourceStatus {
  source: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  successRate: number;
  responseTime: number;
  lastCheck: number;
  consecutiveFailures: number;
}

// 数据源监控事件接口
export interface DataSourceEvent {
  type: 'statusChange' | 'error' | 'recovery';
  source: string;
  oldStatus?: 'healthy' | 'unhealthy' | 'degraded';
  newStatus?: 'healthy' | 'unhealthy' | 'degraded';
  error?: string;
  timestamp: number;
}

// 数据源监控器
export class DataSourceMonitor {
  private statusHistory: Map<string, DataSourceStatus[]> = new Map();
  private eventHistory: DataSourceEvent[] = [];
  private maxHistory = 100;
  private checkInterval = 5000; // 每5秒检查一次
  private statusCallback?: (status: DataSourceStatus[]) => void;
  private eventCallback?: (event: DataSourceEvent) => void;

  constructor() {
    // 启动监控
    this.startMonitoring();
  }

  // 启动监控
  private startMonitoring() {
    setInterval(() => {
      this.checkDataSourceStatus();
    }, this.checkInterval);
  }

  // 检查数据源状态
  private checkDataSourceStatus() {
    const statusMap = enhancedDataSourceManager.getDataSourceStatus();
    const currentStatuses: DataSourceStatus[] = [];

    statusMap.forEach((health, source) => {
      const status: DataSourceStatus = {
        source,
        status: health.status,
        successRate: health.successRate,
        responseTime: health.responseTime,
        lastCheck: health.lastCheck,
        consecutiveFailures: 0 // 这里应该从数据源管理器获取连续失败次数
      };

      currentStatuses.push(status);

      // 检查状态变化
      this.checkStatusChange(source, status);

      // 记录状态历史
      this.recordStatusHistory(source, status);
    });

    // 触发状态回调
    if (this.statusCallback) {
      this.statusCallback(currentStatuses);
    }
  }

  // 检查状态变化
  private checkStatusChange(source: string, newStatus: DataSourceStatus) {
    const history = this.statusHistory.get(source);
    if (history && history.length > 0) {
      const oldStatus = history[history.length - 1];
      if (oldStatus.status !== newStatus.status) {
        const event: DataSourceEvent = {
          type: 'statusChange',
          source,
          oldStatus: oldStatus.status,
          newStatus: newStatus.status,
          timestamp: Date.now()
        };

        this.eventHistory.push(event);
        this.eventHistory = this.eventHistory.slice(-this.maxHistory);

        // 触发事件回调
        if (this.eventCallback) {
          this.eventCallback(event);
        }

        // 记录状态变化日志
        console.log(`数据源${source}状态变化: ${oldStatus.status} -> ${newStatus.status}`);
      }
    }
  }

  // 记录状态历史
  private recordStatusHistory(source: string, status: DataSourceStatus) {
    let history = this.statusHistory.get(source) || [];
    history.push(status);
    history = history.slice(-this.maxHistory);
    this.statusHistory.set(source, history);
  }

  // 记录错误事件
  recordError(source: string, error: string) {
    const event: DataSourceEvent = {
      type: 'error',
      source,
      error,
      timestamp: Date.now()
    };

    this.eventHistory.push(event);
    this.eventHistory = this.eventHistory.slice(-this.maxHistory);

    // 触发事件回调
    if (this.eventCallback) {
      this.eventCallback(event);
    }

    // 记录错误日志
    console.error(`数据源${source}错误: ${error}`);
  }

  // 记录恢复事件
  recordRecovery(source: string) {
    const event: DataSourceEvent = {
      type: 'recovery',
      source,
      timestamp: Date.now()
    };

    this.eventHistory.push(event);
    this.eventHistory = this.eventHistory.slice(-this.maxHistory);

    // 触发事件回调
    if (this.eventCallback) {
      this.eventCallback(event);
    }

    // 记录恢复日志
    console.log(`数据源${source}恢复正常`);
  }

  // 获取数据源状态
  getDataSourceStatus(): DataSourceStatus[] {
    const statuses: DataSourceStatus[] = [];
    const statusMap = enhancedDataSourceManager.getDataSourceStatus();

    statusMap.forEach((health, source) => {
      statuses.push({
        source,
        status: health.status,
        successRate: health.successRate,
        responseTime: health.responseTime,
        lastCheck: health.lastCheck,
        consecutiveFailures: 0
      });
    });

    return statuses;
  }

  // 获取事件历史
  getEventHistory(): DataSourceEvent[] {
    return this.eventHistory;
  }

  // 获取状态历史
  getStatusHistory(source: string): DataSourceStatus[] {
    return this.statusHistory.get(source) || [];
  }

  // 设置状态回调
  setStatusCallback(callback: (status: DataSourceStatus[]) => void) {
    this.statusCallback = callback;
  }

  // 设置事件回调
  setEventCallback(callback: (event: DataSourceEvent) => void) {
    this.eventCallback = callback;
  }

  // 获取监控摘要
  getMonitoringSummary() {
    const statuses = this.getDataSourceStatus();
    const healthyCount = statuses.filter(s => s.status === 'healthy').length;
    const degradedCount = statuses.filter(s => s.status === 'degraded').length;
    const unhealthyCount = statuses.filter(s => s.status === 'unhealthy').length;

    const averageSuccessRate = statuses.reduce((sum, s) => sum + s.successRate, 0) / statuses.length;
    const averageResponseTime = statuses.reduce((sum, s) => sum + s.responseTime, 0) / statuses.length;

    return {
      totalSources: statuses.length,
      healthyCount,
      degradedCount,
      unhealthyCount,
      averageSuccessRate,
      averageResponseTime,
      lastCheck: Date.now()
    };
  }

  // 生成错误提示
  generateErrorNotification(event: DataSourceEvent): string {
    switch (event.type) {
      case 'statusChange':
        if (event.newStatus === 'unhealthy') {
          return `⚠️ 数据源 ${event.source} 状态变为不健康，请检查网络连接`;
        } else if (event.newStatus === 'degraded') {
          return `⚠️ 数据源 ${event.source} 状态变为降级，可能影响数据获取速度`;
        } else if (event.newStatus === 'healthy') {
          return `✅ 数据源 ${event.source} 状态恢复正常`;
        }
        break;
      case 'error':
        return `❌ 数据源 ${event.source} 发生错误: ${event.error}`;
      case 'recovery':
        return `✅ 数据源 ${event.source} 已恢复正常`;
    }
    return '';
  }
}

// 导出单例
export const dataSourceMonitor = new DataSourceMonitor();
export const getDataSourceMonitor = () => dataSourceMonitor;