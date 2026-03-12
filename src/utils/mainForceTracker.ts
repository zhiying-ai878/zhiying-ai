export interface MainForceData {
  stockCode: string;
  stockName: string;
  timestamp: number;
  currentPrice?: number;
  marketCap?: number;
  floatMarketCap?: number;
  volumeAmplification?: number;
  turnoverRate?: number;
  superLargeOrder: {
    volume: number;
    amount: number;
    netFlow: number;
  };
  largeOrder: {
    volume: number;
    amount: number;
    netFlow: number;
  };
  mediumOrder: {
    volume: number;
    amount: number;
    netFlow: number;
  };
  smallOrder: {
    volume: number;
    amount: number;
    netFlow: number;
  };
  totalNetFlow: number;
  mainForceNetFlow: number;
}

export interface AlertConfig {
  id: string;
  stockCode: string;
  type: 'mainForceBuy' | 'mainForceSell' | 'superLargeOrder';
  threshold: number;
  enabled: boolean;
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  createdAt: number;
}

export interface AlertEvent {
  id: string;
  stockCode: string;
  stockName: string;
  type: 'mainForceBuy' | 'mainForceSell' | 'superLargeOrder';
  message: string;
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  timestamp: number;
  data: MainForceData;
  read: boolean;
}

class MainForceTracker {
  private alertConfigs: Map<string, AlertConfig> = new Map();
  private alertHistory: AlertEvent[] = [];
  private currentData: Map<string, MainForceData> = new Map();
  private listeners: Array<(alerts: AlertEvent[]) => void> = [];

  constructor() {
    this.initDefaultConfigs();
  }

  private initDefaultConfigs() {
    const defaults: Omit<AlertConfig, 'id' | 'createdAt'>[] = [
      {
        stockCode: '*',
        type: 'mainForceBuy',
        threshold: 500000000,
        enabled: true,
        urgency: 'emergency'
      },
      {
        stockCode: '*',
        type: 'mainForceSell',
        threshold: 500000000,
        enabled: true,
        urgency: 'emergency'
      },
      {
        stockCode: '*',
        type: 'superLargeOrder',
        threshold: 300000000,
        enabled: true,
        urgency: 'high'
      }
    ];

    defaults.forEach(config => {
      this.addAlertConfig(config);
    });
  }

  addAlertConfig(config: Omit<AlertConfig, 'id' | 'createdAt'>): AlertConfig {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const fullConfig: AlertConfig = {
      ...config,
      id,
      createdAt: Date.now()
    };
    this.alertConfigs.set(id, fullConfig);
    return fullConfig;
  }

  getAlertConfigs(): AlertConfig[] {
    return Array.from(this.alertConfigs.values());
  }

  getAlertHistory(): AlertEvent[] {
    return this.alertHistory;
  }

  markAlertAsRead(id: string) {
    const alert = this.alertHistory.find(a => a.id === id);
    if (alert) {
      alert.read = true;
    }
  }

  subscribe(listener: (alerts: AlertEvent[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  updateMainForceData(data: MainForceData) {
    this.currentData.set(data.stockCode, data);
    this.checkAlerts(data);
  }

  getCurrentData(stockCode: string): MainForceData | undefined {
    return this.currentData.get(stockCode);
  }

  private checkAlerts(data: MainForceData) {
    const newAlerts: AlertEvent[] = [];
    
    this.alertConfigs.forEach(config => {
      if (!config.enabled) return;
      if (config.stockCode !== '*' && config.stockCode !== data.stockCode) return;
      
      let shouldAlert = false;
      let message = '';
      
      switch (config.type) {
        case 'mainForceBuy':
          if (data.mainForceNetFlow > config.threshold) {
            shouldAlert = true;
            message = '主力资金大幅净流入 ' + (data.mainForceNetFlow / 100000000).toFixed(2) + ' 亿元，建议紧急买入！';
          }
          break;
        case 'mainForceSell':
          if (data.mainForceNetFlow < -config.threshold) {
            shouldAlert = true;
            message = '主力资金大幅净流出 ' + (Math.abs(data.mainForceNetFlow) / 100000000).toFixed(2) + ' 亿元，建议紧急卖出！';
          }
          break;
        case 'superLargeOrder':
          if (data.superLargeOrder.netFlow > config.threshold) {
            shouldAlert = true;
            message = '超大单资金净流入 ' + (data.superLargeOrder.netFlow / 100000000).toFixed(2) + ' 亿元，主力抢筹！';
          }
          break;
      }
      
      if (shouldAlert) {
        const alert: AlertEvent = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          stockCode: data.stockCode,
          stockName: data.stockName,
          type: config.type,
          message,
          urgency: config.urgency,
          timestamp: Date.now(),
          data,
          read: false
        };
        
        newAlerts.push(alert);
        this.alertHistory.unshift(alert);
        
        if (config.urgency === 'emergency' || config.urgency === 'high') {
          this.showNotification(alert);
        }
      }
    });
    
    if (newAlerts.length > 0) {
      this.listeners.forEach(listener => listener(newAlerts));
    }
  }

  private showNotification(alert: AlertEvent) {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(alert.stockName + ' 主力资金预警', {
          body: alert.message
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    }
  }

  generateMockData(stockCode: string, stockName: string): MainForceData {
    const baseAmount = 100000000;
    const randomFactor = Math.random() - 0.3;
    
    const superLargeNetFlow = baseAmount * randomFactor * 2;
    const largeNetFlow = baseAmount * randomFactor * 1.5;
    const mediumNetFlow = -baseAmount * randomFactor * 0.5;
    const smallNetFlow = -baseAmount * randomFactor * 0.8;
    
    return {
      stockCode,
      stockName,
      timestamp: Date.now(),
      superLargeOrder: {
        volume: Math.floor(Math.random() * 1000000),
        amount: Math.abs(superLargeNetFlow),
        netFlow: superLargeNetFlow
      },
      largeOrder: {
        volume: Math.floor(Math.random() * 2000000),
        amount: Math.abs(largeNetFlow),
        netFlow: largeNetFlow
      },
      mediumOrder: {
        volume: Math.floor(Math.random() * 3000000),
        amount: Math.abs(mediumNetFlow),
        netFlow: mediumNetFlow
      },
      smallOrder: {
        volume: Math.floor(Math.random() * 5000000),
        amount: Math.abs(smallNetFlow),
        netFlow: smallNetFlow
      },
      totalNetFlow: superLargeNetFlow + largeNetFlow + mediumNetFlow + smallNetFlow,
      mainForceNetFlow: superLargeNetFlow + largeNetFlow
    };
  }
}

let mainForceTrackerInstance: MainForceTracker | null = null;

export const getMainForceTracker = (): MainForceTracker => {
  if (!mainForceTrackerInstance) {
    mainForceTrackerInstance = new MainForceTracker();
  }
  return mainForceTrackerInstance;
};
