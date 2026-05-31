import { IndexedDBManager, IndexedDBAAlert } from './indexedDBManager';

export interface AlertCondition {
  type: 'price_above' | 'price_below' | 'price_change' | 'volume_above' | 'volume_change' | 'rsi_above' | 'rsi_below' | 'macd_cross' | 'kdj_cross' | 'mainForce_above' | 'limitUp_potential';
  threshold: number;
  comparison?: 'above' | 'below' | 'cross_up' | 'cross_down';
  period?: number;
}

export interface AlertTrigger {
  alertId: string;
  stockCode: string;
  stockName: string;
  alertType: string;
  condition: AlertCondition;
  triggerValue: number;
  timestamp: number;
}

export class SmartAlertManager {
  private static instance: SmartAlertManager;
  private db: IndexedDBManager;
  private triggers: AlertTrigger[] = [];
  private listeners: ((trigger: AlertTrigger) => void)[] = [];
  private isRunning = false;
  private checkInterval: number | null = null;

  private constructor() {
    this.db = IndexedDBManager.getInstance();
  }

  public static getInstance(): SmartAlertManager {
    if (!SmartAlertManager.instance) {
      SmartAlertManager.instance = new SmartAlertManager();
    }
    return SmartAlertManager.instance;
  }

  public async createAlert(alert: Omit<IndexedDBAAlert, 'id' | 'triggerCount' | 'created_at' | 'updated_at'>): Promise<string> {
    const alertId = Date.now().toString() + Math.random().toString(36).substring(2, 11);
    const newAlert: IndexedDBAAlert = {
      id: alertId,
      ...alert,
      triggerCount: 0,
      created_at: Date.now(),
      updated_at: Date.now()
    };
    
    await this.db.addAlert(newAlert);
    return alertId;
  }

  public async getAlerts(filters?: { stockCode?: string; isActive?: boolean; alertType?: string }): Promise<IndexedDBAAlert[]> {
    return await this.db.getAlerts(filters);
  }

  public async updateAlert(alertId: string, updates: Partial<IndexedDBAAlert>): Promise<void> {
    await this.db.updateAlert(alertId, updates);
  }

  public async deleteAlert(alertId: string): Promise<void> {
    await this.db.deleteAlert(alertId);
  }

  public async toggleAlert(alertId: string, isActive: boolean): Promise<void> {
    await this.updateAlert(alertId, { isActive });
  }

  public startMonitoring(intervalMs: number = 30000): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('智能预警监控已启动');
    
    this.checkInterval = window.setInterval(() => {
      this.checkAllAlerts();
    }, intervalMs);
    
    this.checkAllAlerts();
  }

  public stopMonitoring(): void {
    this.isRunning = false;
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    console.log('智能预警监控已停止');
  }

  private async checkAllAlerts(): Promise<void> {
    try {
      const alerts = await this.getAlerts({ isActive: true });
      
      for (const alert of alerts) {
        await this.checkAlert(alert);
      }
    } catch (error) {
      console.error('检查预警失败:', error);
    }
  }

  private async checkAlert(alert: IndexedDBAAlert): Promise<void> {
    try {
      const condition = alert.condition as AlertCondition;
      let shouldTrigger = false;
      let triggerValue = 0;

      switch (condition.type) {
        case 'price_above':
        case 'price_below':
          shouldTrigger = await this.checkPriceCondition(alert.stockCode, condition);
          break;
        case 'volume_above':
        case 'volume_change':
          shouldTrigger = await this.checkVolumeCondition(alert.stockCode, condition);
          break;
        case 'rsi_above':
        case 'rsi_below':
          shouldTrigger = await this.checkRSICondition(alert.stockCode, condition);
          break;
        case 'macd_cross':
          shouldTrigger = await this.checkMACDCondition(alert.stockCode, condition);
          break;
        case 'kdj_cross':
          shouldTrigger = await this.checkKDJCondition(alert.stockCode, condition);
          break;
        case 'mainForce_above':
          shouldTrigger = await this.checkMainForceCondition(alert.stockCode, condition);
          break;
        case 'limitUp_potential':
          shouldTrigger = await this.checkLimitUpCondition(alert.stockCode, condition);
          break;
      }

      if (shouldTrigger) {
        await this.triggerAlert(alert, triggerValue);
      }
    } catch (error) {
      console.error(`检查预警 ${alert.id} 失败:`, error);
    }
  }

  private async checkPriceCondition(stockCode: string, condition: AlertCondition): Promise<boolean> {
    try {
      const result = await this.checkPriceCondition(stockCode, condition);
      return result;
    } catch (error) {
      console.error(`价格条件检查失败:`, error);
      return false;
    }
  }

  private async checkVolumeCondition(stockCode: string, condition: AlertCondition): Promise<boolean> {
    return true;
  }

  private async checkRSICondition(stockCode: string, condition: AlertCondition): Promise<boolean> {
    return true;
  }

  private async checkMACDCondition(stockCode: string, condition: AlertCondition): Promise<boolean> {
    return true;
  }

  private async checkKDJCondition(stockCode: string, condition: AlertCondition): Promise<boolean> {
    return true;
  }

  private async checkMainForceCondition(stockCode: string, condition: AlertCondition): Promise<boolean> {
    return true;
  }

  private async checkLimitUpCondition(stockCode: string, condition: AlertCondition): Promise<boolean> {
    return true;
  }

  private async triggerAlert(alert: IndexedDBAAlert, triggerValue: number): Promise<void> {
    const trigger: AlertTrigger = {
      alertId: alert.id,
      stockCode: alert.stockCode,
      stockName: alert.stockName,
      alertType: alert.alertType,
      condition: alert.condition as AlertCondition,
      triggerValue,
      timestamp: Date.now()
    };

    this.triggers.push(trigger);
    
    await this.db.updateAlert(alert.id, {
      lastTriggered: Date.now(),
      triggerCount: alert.triggerCount + 1
    });

    this.listeners.forEach(listener => listener(trigger));

    console.log(`预警触发: ${alert.stockName}(${alert.stockCode}) - ${alert.alertType}`);
  }

  public addListener(listener: (trigger: AlertTrigger) => void): void {
    this.listeners.push(listener);
  }

  public removeListener(listener: (trigger: AlertTrigger) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index !== -1) {
      this.listeners.splice(index, 1);
    }
  }

  public getRecentTriggers(limit: number = 20): AlertTrigger[] {
    return this.triggers.slice(-limit).reverse();
  }

  public async createDefaultAlerts(stockCode: string, stockName: string): Promise<void> {
    const defaultAlerts: Omit<IndexedDBAAlert, 'id' | 'triggerCount' | 'created_at' | 'updated_at'>[] = [
      {
        stockCode,
        stockName,
        alertType: 'price',
        condition: { type: 'price_change', threshold: 5 },
        isActive: true
      },
      {
        stockCode,
        stockName,
        alertType: 'volume',
        condition: { type: 'volume_change', threshold: 50 },
        isActive: true
      },
      {
        stockCode,
        stockName,
        alertType: 'rsi',
        condition: { type: 'rsi_above', threshold: 70 },
        isActive: true
      },
      {
        stockCode,
        stockName,
        alertType: 'rsi',
        condition: { type: 'rsi_below', threshold: 30 },
        isActive: true
      },
      {
        stockCode,
        stockName,
        alertType: 'limitUp',
        condition: { type: 'limitUp_potential', threshold: 50 },
        isActive: true
      }
    ];

    for (const alert of defaultAlerts) {
      await this.createAlert(alert);
    }
  }

  public async getStatistics(): Promise<{
    totalAlerts: number;
    activeAlerts: number;
    totalTriggers: number;
    todayTriggers: number;
  }> {
    const alerts = await this.getAlerts();
    const activeAlerts = await this.getAlerts({ isActive: true });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTriggers = this.triggers.filter(t => t.timestamp >= today.getTime()).length;

    const totalTriggers = alerts.reduce((sum, a) => sum + a.triggerCount, 0);

    return {
      totalAlerts: alerts.length,
      activeAlerts: activeAlerts.length,
      totalTriggers,
      todayTriggers
    };
  }
}
