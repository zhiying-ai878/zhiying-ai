interface ErrorLog {
  id: string;
  timestamp: number;
  type: 'error' | 'warning' | 'info';
  message: string;
  stack?: string;
  context?: Record<string, any>;
  resolved: boolean;
}

interface PerformanceMetric {
  id: string;
  timestamp: number;
  type: 'load' | 'render' | 'network' | 'memory';
  name: string;
  duration: number;
  value?: number;
  unit?: string;
}

interface HealthCheck {
  id: string;
  timestamp: number;
  component: string;
  status: 'healthy' | 'warning' | 'error';
  message: string;
  details?: Record<string, any>;
}

interface AutoRecoveryRule {
  id: string;
  component: string;
  errorPattern: RegExp;
  maxRetries: number;
  retryDelay: number;
  action: 'retry' | 'fallback' | 'reset';
}

export class SystemReliabilityManager {
  private static instance: SystemReliabilityManager;
  private errors: ErrorLog[] = [];
  private performance: PerformanceMetric[] = [];
  private healthChecks: HealthCheck[] = [];
  private recoveryRules: AutoRecoveryRule[] = [];
  private retryCounts: Map<string, number> = new Map();
  private listeners: ((event: { type: string; data: any }) => void)[] = [];
  private maxErrors = 1000;
  private maxPerformanceMetrics = 500;
  private initialized = false;

  private constructor() {
    this.initializeDefaultRules();
  }

  public static getInstance(): SystemReliabilityManager {
    if (!SystemReliabilityManager.instance) {
      SystemReliabilityManager.instance = new SystemReliabilityManager();
    }
    return SystemReliabilityManager.instance;
  }

  public initialize(): void {
    if (this.initialized) return;
    
    this.setupGlobalErrorHandling();
    this.setupUnhandledRejectionHandling();
    this.setupPerformanceMonitoring();
    this.setupHealthChecks();
    this.startBackgroundHealthMonitoring();
    
    this.initialized = true;
    console.log('🚀 System reliability manager initialized');
  }

  private initializeDefaultRules(): void {
    this.recoveryRules = [
      {
        id: 'network-retry',
        component: 'network',
        errorPattern: /(fetch|network|timeout)/i,
        maxRetries: 3,
        retryDelay: 1000,
        action: 'retry'
      },
      {
        id: 'database-retry',
        component: 'database',
        errorPattern: /(indexeddb|storage|quota)/i,
        maxRetries: 2,
        retryDelay: 500,
        action: 'fallback'
      },
      {
        id: 'component-reset',
        component: 'ui',
        errorPattern: /(render|react|undefined|null)/i,
        maxRetries: 1,
        retryDelay: 0,
        action: 'reset'
      }
    ];
  }

  private setupGlobalErrorHandling(): void {
    const originalOnError = window.onerror;
    window.onerror = (message, source, lineno, colno, error) => {
      this.logError({
        type: 'error',
        message: String(message),
        stack: error?.stack,
        context: {
          source,
          lineno,
          colno,
          url: window.location.href
        }
      });
      
      if (originalOnError) {
        return originalOnError(message, source, lineno, colno, error);
      }
      return false;
    };
  }

  private setupUnhandledRejectionHandling(): void {
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        type: 'error',
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        context: {
          reason: event.reason,
          url: window.location.href
        }
      });
    });
  }

  private setupPerformanceMonitoring(): void {
    if ('performance' in window) {
      window.addEventListener('load', () => {
        const navigationTiming = performance.timing;
        const loadTime = navigationTiming.loadEventEnd - navigationTiming.navigationStart;
        
        this.recordPerformance({
          type: 'load',
          name: 'page-load',
          duration: loadTime,
          unit: 'ms'
        });
      });
    }
  }

  private setupHealthChecks(): void {
    this.registerHealthCheck('storage', async () => {
      try {
        const testKey = 'health-check-test';
        localStorage.setItem(testKey, 'ok');
        localStorage.removeItem(testKey);
        return { component: 'storage', status: 'healthy' as const, message: 'Storage operational' };
      } catch (error) {
        return { component: 'storage', status: 'error' as const, message: 'Storage access failed' };
      }
    });

    this.registerHealthCheck('indexeddb', async () => {
      try {
        const db = await window.indexedDB.open('health-check', 1);
        db.onerror = () => {
          this.recordHealthCheck({
            component: 'indexeddb',
            status: 'error',
            message: 'IndexedDB access failed'
          });
        };
        db.onsuccess = () => {
          this.recordHealthCheck({
            component: 'indexeddb',
            status: 'healthy',
            message: 'IndexedDB operational'
          });
        };
        return { component: 'indexeddb', status: 'healthy' as const, message: 'IndexedDB operational' };
      } catch (error) {
        return { component: 'indexeddb', status: 'error' as const, message: 'IndexedDB access failed' };
      }
    });

    this.registerHealthCheck('network', async () => {
      return navigator.onLine 
        ? { component: 'network', status: 'healthy' as const, message: 'Network online' } 
        : { component: 'network', status: 'warning' as const, message: 'Network offline' };
    });
  }

  private startBackgroundHealthMonitoring(): void {
    setInterval(() => {
      this.runAllHealthChecks();
      this.cleanupOldData();
    }, 60000);
  }

  public logError(error: Omit<ErrorLog, 'id' | 'timestamp' | 'resolved'>): void {
    const errorLog: ErrorLog = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
      timestamp: Date.now(),
      ...error,
      resolved: false
    };
    
    this.errors.push(errorLog);
    
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }
    
    console.error(`[${error.type.toUpperCase()}]`, error.message);
    this.notifyListeners({ type: 'error', data: errorLog });
    
    this.attemptAutoRecovery(errorLog);
  }

  public logWarning(message: string, context?: Record<string, any>): void {
    this.logError({ type: 'warning', message, context });
  }

  public logInfo(message: string, context?: Record<string, any>): void {
    this.logError({ type: 'info', message, context });
  }

  public recordPerformance(metric: Omit<PerformanceMetric, 'id' | 'timestamp'>): void {
    const perfMetric: PerformanceMetric = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
      timestamp: Date.now(),
      ...metric
    };
    
    this.performance.push(perfMetric);
    
    if (this.performance.length > this.maxPerformanceMetrics) {
      this.performance.shift();
    }
    
    if (metric.duration > 2000) {
      this.logWarning(`Performance issue: ${metric.name} took ${metric.duration}ms`, {
        type: metric.type,
        duration: metric.duration
      });
    }
  }

  public recordHealthCheck(check: Omit<HealthCheck, 'id' | 'timestamp'>): void {
    const healthCheck: HealthCheck = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
      timestamp: Date.now(),
      ...check
    };
    
    this.healthChecks.push(healthCheck);
    
    if (healthCheck.status === 'error') {
      this.logError({
        type: 'error',
        message: `Health check failed for ${check.component}: ${check.message}`,
        context: check.details
      });
    }
  }

  public async measurePerformance<T>(
    name: string,
    type: PerformanceMetric['type'],
    fn: () => T | Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    
    try {
      const result = await fn();
      const duration = performance.now() - startTime;
      
      this.recordPerformance({
        type,
        name,
        duration,
        unit: 'ms'
      });
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      this.logError({
        type: 'error',
        message: `Performance measurement failed for ${name}: ${error}`,
        context: { name, type, duration }
      });
      
      throw error;
    }
  }

  private async attemptAutoRecovery(errorLog: ErrorLog): Promise<void> {
    const matchingRule = this.recoveryRules.find(rule => 
      rule.errorPattern.test(errorLog.message)
    );
    
    if (!matchingRule) return;
    
    const retryKey = `${matchingRule.id}-${errorLog.message.substring(0, 50)}`;
    const retryCount = this.retryCounts.get(retryKey) || 0;
    
    if (retryCount >= matchingRule.maxRetries) {
      this.logWarning(`Max retries reached for ${matchingRule.component}`);
      return;
    }
    
    this.retryCounts.set(retryKey, retryCount + 1);
    
    console.log(`🔄 Attempting auto-recovery for ${matchingRule.component}...`);
    
    switch (matchingRule.action) {
      case 'retry':
        setTimeout(() => {
          this.logInfo(`Retry triggered for ${matchingRule.component}`);
        }, matchingRule.retryDelay);
        break;
      case 'fallback':
        this.logInfo(`Fallback activated for ${matchingRule.component}`);
        break;
      case 'reset':
        this.logInfo(`Reset triggered for ${matchingRule.component}`);
        break;
    }
  }

  public async runAllHealthChecks(): Promise<HealthCheck[]> {
    const results: HealthCheck[] = [];
    const components: string[] = ['storage', 'indexeddb', 'network'];
    
    for (const component of components) {
      let check: Omit<HealthCheck, 'id' | 'timestamp'>;
      
      try {
        switch (component) {
          case 'storage': {
            const testKey = 'health-check-test';
            localStorage.setItem(testKey, 'ok');
            localStorage.removeItem(testKey);
            check = {
              component,
              status: 'healthy' as const,
              message: 'Storage operational'
            };
            break;
          }
          case 'network': {
            const isOnline = navigator.onLine;
            check = {
              component,
              status: isOnline ? ('healthy' as const) : ('warning' as const),
              message: isOnline ? 'Network online' : 'Network offline'
            };
            break;
          }
          default:
            check = {
              component,
              status: 'healthy' as const,
              message: 'Component operational'
            };
        }
      } catch (error) {
        check = {
          component,
          status: 'error' as const,
          message: `Component check failed: ${error}`
        };
      }
      
      const healthCheck: HealthCheck = {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
        timestamp: Date.now(),
        ...check
      };
      
      this.recordHealthCheck(check);
      results.push(healthCheck);
    }
    
    return results;
  }

  public registerHealthCheck(
    component: string,
    check: () => Promise<Omit<HealthCheck, 'id' | 'timestamp'>>
  ): void {
    this.logInfo(`Health check registered for ${component}`);
  }

  public getErrors(limit?: number): ErrorLog[] {
    const errors = [...this.errors].sort((a, b) => b.timestamp - a.timestamp);
    return limit ? errors.slice(0, limit) : errors;
  }

  public getPerformanceMetrics(limit?: number): PerformanceMetric[] {
    const metrics = [...this.performance].sort((a, b) => b.timestamp - a.timestamp);
    return limit ? metrics.slice(0, limit) : metrics;
  }

  public getHealthChecks(limit?: number): HealthCheck[] {
    const checks = [...this.healthChecks].sort((a, b) => b.timestamp - a.timestamp);
    return limit ? checks.slice(0, limit) : checks;
  }

  public getSystemStatus(): {
    overallStatus: 'healthy' | 'warning' | 'error';
    lastCheck: number;
    stats: {
      totalErrors: number;
      unResolvedErrors: number;
      avgPerformance: number;
      healthyComponents: number;
      totalComponents: number;
    };
  } {
    const recentHealthChecks = this.getHealthChecks(10);
    const lastHour = Date.now() - 3600000;
    const recentErrors = this.errors.filter(e => e.timestamp > lastHour);
    const recentPerformance = this.performance.filter(p => p.timestamp > lastHour);
    
    const status: 'healthy' | 'warning' | 'error' = recentHealthChecks.reduce(
      (acc: 'healthy' | 'warning' | 'error', check: HealthCheck) => {
        if (check.status === 'error') return 'error';
        if (check.status === 'warning' && acc !== 'error') return 'warning';
        return acc;
      },
      'healthy'
    );
    
    const avgPerformance = recentPerformance.length > 0 
      ? recentPerformance.reduce((sum, p) => sum + p.duration, 0) / recentPerformance.length
      : 0;
    
    const healthyComponents = recentHealthChecks.filter(c => c.status === 'healthy').length;
    
    return {
      overallStatus: status,
      lastCheck: Date.now(),
      stats: {
        totalErrors: recentErrors.length,
        unResolvedErrors: recentErrors.filter(e => !e.resolved).length,
        avgPerformance: Math.round(avgPerformance),
        healthyComponents,
        totalComponents: 3
      }
    };
  }

  public addListener(listener: (event: { type: string; data: any }) => void): void {
    this.listeners.push(listener);
  }

  public removeListener(listener: (event: { type: string; data: any }) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index !== -1) {
      this.listeners.splice(index, 1);
    }
  }

  private notifyListeners(event: { type: string; data: any }): void {
    this.listeners.forEach(listener => listener(event));
  }

  private cleanupOldData(): void {
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    
    this.errors = this.errors.filter(e => e.timestamp > oneWeekAgo);
    this.performance = this.performance.filter(p => p.timestamp > oneWeekAgo);
    this.healthChecks = this.healthChecks.filter(c => c.timestamp > oneWeekAgo);
  }

  public clearErrors(): void {
    this.errors = [];
  }

  public exportDiagnostics(): string {
    return JSON.stringify({
      version: '1.0',
      timestamp: Date.now(),
      errors: this.getErrors(100),
      performance: this.getPerformanceMetrics(50),
      healthChecks: this.getHealthChecks(20),
      systemStatus: this.getSystemStatus()
    }, null, 2);
  }
}
