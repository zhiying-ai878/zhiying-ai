import { superDataSourceManager } from './superDataSourceManager';
import { superSignalGenerator } from './superSignalGenerator';
import { realtimeOptimizer } from './realtimeOptimizer';
import { dataSourceMonitor } from './dataSourceMonitor';

// 系统状态接口
export interface SystemStatus {
  timestamp: number;
  overall: 'healthy' | 'degraded' | 'unhealthy';
  components: {
    dataSource: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      healthyCount: number;
      totalCount: number;
      successRate: number;
    };
    signalGenerator: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      signalCount: number;
      lastSignalTime: number;
    };
    realtime: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      processingStatus: any;
    };
  };
  performance: {
    responseTime: number;
    memoryUsage: number;
    cpuUsage: number;
  };
  alerts: Alert[];
}

// 告警接口
export interface Alert {
  id: string;
  timestamp: number;
  level: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  component: string;
  details?: any;
  isResolved: boolean;
}

// 日志接口
export interface Log {
  id: string;
  timestamp: number;
  level: 'debug' | 'info' | 'warning' | 'error' | 'critical';
  message: string;
  component: string;
  details?: any;
}

// 系统监控器
export class SystemMonitor {
  private alerts: Alert[] = [];
  private logs: Log[] = [];
  private maxAlerts = 1000;
  private maxLogs = 10000;
  private checkInterval = 5000; // 每5秒检查一次
  private monitoringTimer: NodeJS.Timeout | null = null;
  private lastStatus: SystemStatus | null = null;

  constructor() {
    // 初始化系统监控器
    this.startMonitoring();
  }

  // 开始监控
  startMonitoring() {
    this.monitoringTimer = setInterval(() => {
      this.checkSystemStatus();
    }, this.checkInterval);
  }

  // 停止监控
  stopMonitoring() {
    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer);
      this.monitoringTimer = null;
    }
  }

  // 检查系统状态
  private checkSystemStatus() {
    try {
      const status = this.getSystemStatus();
      this.lastStatus = status;

      // 检查告警
      this.checkAlerts(status);

      // 记录系统状态
      this.log('info', 'SystemStatus', '系统状态检查', status);
    } catch (error) {
      this.log('error', 'SystemMonitor', '系统状态检查失败', error);
    }
  }

  // 获取系统状态
  getSystemStatus(): SystemStatus {
    const timestamp = Date.now();

    // 检查数据源状态
    const dataSourceStatus = dataSourceMonitor.getDataSourceStatus();
    const dataSourceArray = Array.from(dataSourceStatus.entries());
    const healthyCount = dataSourceArray.filter(([_, status]) => status.status === 'healthy').length;
    const totalCount = dataSourceArray.length;
    const successRate = dataSourceArray.reduce((sum, [_, status]) => sum + status.successRate, 0) / totalCount;

    // 检查信号生成器状态
    const signals = superSignalGenerator.getSignals();
    const lastSignal = signals.length > 0 ? signals[0] : null;

    // 检查实时优化器状态
    const processingStatus = realtimeOptimizer.getProcessingStatus();

    // 检查性能
    const performance = this.getPerformance();

    // 检查告警
    const activeAlerts = this.alerts.filter(alert => !alert.isResolved);

    // 计算总体状态
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (healthyCount / totalCount < 0.5) {
      overallStatus = 'unhealthy';
    } else if (healthyCount / totalCount < 0.8) {
      overallStatus = 'degraded';
    }

    return {
      timestamp,
      overall: overallStatus,
      components: {
        dataSource: {
          status: healthyCount / totalCount < 0.5 ? 'unhealthy' : healthyCount / totalCount < 0.8 ? 'degraded' : 'healthy',
          healthyCount,
          totalCount,
          successRate
        },
        signalGenerator: {
          status: signals.length > 0 ? 'healthy' : 'degraded',
          signalCount: signals.length,
          lastSignalTime: lastSignal ? lastSignal.timestamp : 0
        },
        realtime: {
          status: processingStatus.isProcessing ? 'healthy' : 'degraded',
          processingStatus
        }
      },
      performance,
      alerts: activeAlerts
    };
  }

  // 获取性能数据
  private getPerformance() {
    // 简化的性能数据获取
    return {
      responseTime: Math.random() * 1000,
      memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024,
      cpuUsage: Math.random() * 100
    };
  }

  // 检查告警
  private checkAlerts(status: SystemStatus) {
    // 检查数据源状态
    if (status.components.dataSource.healthyCount === 0) {
      this.createAlert('critical', 'DataSource', '所有数据源都不可用');
    } else if (status.components.dataSource.healthyCount / status.components.dataSource.totalCount < 0.5) {
      this.createAlert('error', 'DataSource', '超过一半的数据源不可用');
    } else if (status.components.dataSource.healthyCount / status.components.dataSource.totalCount < 0.8) {
      this.createAlert('warning', 'DataSource', '部分数据源不可用');
    }

    // 检查信号生成
    if (status.components.signalGenerator.signalCount === 0 && Date.now() - status.components.signalGenerator.lastSignalTime > 300000) {
      this.createAlert('warning', 'SignalGenerator', '长时间没有生成信号');
    }

    // 检查实时处理
    if (!status.components.realtime.processingStatus.isProcessing) {
      this.createAlert('info', 'RealtimeOptimizer', '实时处理已停止');
    }
  }

  // 创建告警
  createAlert(level: 'info' | 'warning' | 'error' | 'critical', component: string, message: string, details?: any) {
    const alert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      level,
      message,
      component,
      details,
      isResolved: false
    };

    this.alerts.push(alert);
    this.alerts = this.alerts.slice(-this.maxAlerts);

    // 记录告警
    this.log(level as any, component, message, details);

    return alert;
  }

  // 解决告警
  resolveAlert(alertId: string) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.isResolved = true;
      this.log('info', 'SystemMonitor', `告警已解决: ${alert.message}`);
    }
  }

  // 记录日志
  log(level: 'debug' | 'info' | 'warning' | 'error' | 'critical', component: string, message: string, details?: any) {
    const log: Log = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      level,
      message,
      component,
      details
    };

    this.logs.push(log);
    this.logs = this.logs.slice(-this.maxLogs);

    // 控制台输出
    const timestamp = new Date(log.timestamp).toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] [${component}] ${message}`;
    
    switch (level) {
      case 'debug':
      case 'info':
        console.log(logMessage, details);
        break;
      case 'warning':
        console.warn(logMessage, details);
        break;
      case 'error':
      case 'critical':
        console.error(logMessage, details);
        break;
    }
  }

  // 获取告警
  getAlerts(): Alert[] {
    return this.alerts;
  }

  // 获取日志
  getLogs(limit: number = 100, level?: 'debug' | 'info' | 'warning' | 'error' | 'critical'): Log[] {
    let logs = this.logs;
    if (level) {
      logs = logs.filter(log => log.level === level);
    }
    return logs.slice(-limit);
  }

  // 获取系统状态摘要
  getSystemSummary() {
    const status = this.getSystemStatus();
    return {
      overall: status.overall,
      dataSourceHealth: status.components.dataSource.status,
      signalCount: status.components.signalGenerator.signalCount,
      activeAlerts: status.alerts.length,
      responseTime: status.performance.responseTime,
      memoryUsage: status.performance.memoryUsage,
      lastUpdated: status.timestamp
    };
  }

  // 清除历史数据
  clearHistory() {
    this.alerts = [];
    this.logs = [];
  }

  // 导出数据
  exportData() {
    return {
      status: this.getSystemStatus(),
      alerts: this.alerts,
      logs: this.logs
    };
  }

  // 导入数据
  importData(data: any) {
    if (data.alerts) {
      this.alerts = data.alerts;
    }
    if (data.logs) {
      this.logs = data.logs;
    }
  }
}

// 导出单例
export const systemMonitor = new SystemMonitor();
export const getSystemMonitor = () => systemMonitor;