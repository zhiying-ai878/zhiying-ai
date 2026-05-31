// 插件系统

// 插件接口
export interface MarketMonitorPlugin {
  name: string;
  version: string;
  description: string;
  author?: string;
  dependencies?: string[];
  permissions?: string[];
  category?: string; // 插件分类
  
  // 插件初始化
  initialize(config: any): Promise<boolean>;
  
  // 在系统启动时执行
  onSystemStart?(): Promise<void>;
  
  // 在系统关闭时执行
  onSystemShutdown?(): Promise<void>;
  
  // 在扫描开始前执行
  beforeScan?(scanId: string): Promise<void>;
  
  // 在获取行情数据前执行
  beforeQuoteFetch?(scanId: string): Promise<void>;
  
  // 在获取行情数据后执行
  afterQuoteFetch?(scanId: string, quotes: any[]): Promise<any[]>;
  
  // 在获取主力资金数据前执行
  beforeMainForceDataFetch?(scanId: string, stockCodes: string[]): Promise<string[]>;
  
  // 在获取主力资金数据后执行
  afterMainForceDataFetch?(scanId: string, mainForceDataMap: Map<string, any>): Promise<Map<string, any>>;
  
  // 在生成信号前执行
  beforeSignalGeneration?(scanId: string, quotes: any[], mainForceDataMap: Map<string, any>): Promise<void>;
  
  // 在生成信号后执行
  afterSignalGeneration?(scanId: string, signals: any[]): Promise<any[]>;
  
  // 在扫描完成后执行
  afterScan?(scanId: string, scanResult: any): Promise<void>;
  
  // 在配置变更时执行
  onConfigChange?(newConfig: any, oldConfig: any): Promise<void>;
  
  // 在信号执行前执行
  beforeSignalExecution?(signal: any): Promise<boolean>;
  
  // 在信号执行后执行
  afterSignalExecution?(signal: any, result: any): Promise<void>;
  
  // 在数据缓存更新时执行
  onCacheUpdate?(key: string, value: any): Promise<void>;
  
  // 在用户操作时执行
  onUserAction?(action: string, data: any): Promise<void>;
  
  // 插件清理
  cleanup(): Promise<void>;
}

// 插件元数据
export interface PluginMetadata {
  name: string;
  version: string;
  description: string;
  author?: string;
  dependencies?: string[];
  permissions?: string[];
  category?: string;
  enabled: boolean;
  loaded: boolean;
  lastError?: string;
  installDate?: number;
  lastUpdated?: number;
}

// 插件管理器
export class PluginManager {
  private plugins: Map<string, MarketMonitorPlugin> = new Map();
  private pluginMetadata: Map<string, PluginMetadata> = new Map();
  private pluginOrder: string[] = [];
  
  // 单例模式
  private static instance: PluginManager;
  
  public static getInstance(): PluginManager {
    if (!PluginManager.instance) {
      PluginManager.instance = new PluginManager();
    }
    return PluginManager.instance;
  }
  
  // 注册插件
  public registerPlugin(plugin: MarketMonitorPlugin): boolean {
    if (this.plugins.has(plugin.name)) {
      console.warn(`插件 ${plugin.name} 已经注册，跳过`);
      return false;
    }
    
    // 检查依赖
    if (plugin.dependencies) {
      for (const dep of plugin.dependencies) {
        if (!this.plugins.has(dep)) {
          console.warn(`插件 ${plugin.name} 依赖 ${dep} 尚未注册，可能无法正常工作`);
        }
      }
    }
    
    this.plugins.set(plugin.name, plugin);
    this.pluginOrder.push(plugin.name);
    
    // 初始化插件元数据
    this.pluginMetadata.set(plugin.name, {
      name: plugin.name,
      version: plugin.version,
      description: plugin.description,
      author: plugin.author,
      dependencies: plugin.dependencies,
      permissions: plugin.permissions,
      category: plugin.category,
      enabled: true,
      loaded: false,
      installDate: Date.now(),
      lastUpdated: Date.now()
    });
    
    console.log(`插件 ${plugin.name} v${plugin.version} 注册成功`);
    return true;
  }
  
  // 卸载插件
  public async unregisterPlugin(pluginName: string): Promise<boolean> {
    if (!this.plugins.has(pluginName)) {
      console.warn(`插件 ${pluginName} 未注册，无法卸载`);
      return false;
    }
    
    const plugin = this.plugins.get(pluginName);
    if (plugin) {
      try {
        await plugin.cleanup();
        console.log(`插件 ${pluginName} 清理成功`);
      } catch (error) {
        console.error(`插件 ${pluginName} 清理出错:`, error);
      }
    }
    
    this.plugins.delete(pluginName);
    this.pluginMetadata.delete(pluginName);
    this.pluginOrder = this.pluginOrder.filter(name => name !== pluginName);
    
    console.log(`插件 ${pluginName} 卸载成功`);
    return true;
  }
  
  // 初始化所有插件
  public async initializePlugins(config: any): Promise<boolean> {
    let allSuccess = true;
    
    for (const pluginName of this.pluginOrder) {
      const plugin = this.plugins.get(pluginName);
      const metadata = this.pluginMetadata.get(pluginName);
      
      if (plugin && metadata && metadata.enabled) {
        try {
          const success = await plugin.initialize(config);
          if (!success) {
            console.warn(`插件 ${pluginName} 初始化失败`);
            metadata.loaded = false;
            metadata.lastError = '初始化失败';
            allSuccess = false;
          } else {
            console.log(`插件 ${pluginName} 初始化成功`);
            metadata.loaded = true;
            metadata.lastError = undefined;
            
            // 执行插件的系统启动方法
            if (plugin.onSystemStart) {
              try {
                await plugin.onSystemStart();
              } catch (error) {
                console.error(`插件 ${pluginName} onSystemStart 执行出错:`, error);
              }
            }
          }
        } catch (error) {
          console.error(`插件 ${pluginName} 初始化出错:`, error);
          if (metadata) {
            metadata.loaded = false;
            metadata.lastError = error instanceof Error ? error.message : String(error);
          }
          allSuccess = false;
        }
      }
    }
    
    return allSuccess;
  }
  
  // 执行插件的beforeScan方法
  public async executeBeforeScan(scanId: string): Promise<void> {
    for (const pluginName of this.pluginOrder) {
      const plugin = this.plugins.get(pluginName);
      const metadata = this.pluginMetadata.get(pluginName);
      
      if (plugin && metadata && metadata.enabled && metadata.loaded && plugin.beforeScan) {
        try {
          await plugin.beforeScan(scanId);
        } catch (error) {
          console.error(`插件 ${pluginName} beforeScan 执行出错:`, error);
          if (metadata) {
            metadata.lastError = error instanceof Error ? error.message : String(error);
          }
        }
      }
    }
  }
  
  // 执行插件的beforeQuoteFetch方法
  public async executeBeforeQuoteFetch(scanId: string): Promise<void> {
    for (const pluginName of this.pluginOrder) {
      const plugin = this.plugins.get(pluginName);
      const metadata = this.pluginMetadata.get(pluginName);
      
      if (plugin && metadata && metadata.enabled && metadata.loaded && plugin.beforeQuoteFetch) {
        try {
          await plugin.beforeQuoteFetch(scanId);
        } catch (error) {
          console.error(`插件 ${pluginName} beforeQuoteFetch 执行出错:`, error);
          if (metadata) {
            metadata.lastError = error instanceof Error ? error.message : String(error);
          }
        }
      }
    }
  }
  
  // 执行插件的afterQuoteFetch方法
  public async executeAfterQuoteFetch(scanId: string, quotes: any[]): Promise<any[]> {
    let processedQuotes = [...quotes];
    
    for (const pluginName of this.pluginOrder) {
      const plugin = this.plugins.get(pluginName);
      const metadata = this.pluginMetadata.get(pluginName);
      
      if (plugin && metadata && metadata.enabled && metadata.loaded && plugin.afterQuoteFetch) {
        try {
          processedQuotes = await plugin.afterQuoteFetch(scanId, processedQuotes);
        } catch (error) {
          console.error(`插件 ${pluginName} afterQuoteFetch 执行出错:`, error);
          if (metadata) {
            metadata.lastError = error instanceof Error ? error.message : String(error);
          }
        }
      }
    }
    
    return processedQuotes;
  }
  
  // 执行插件的beforeMainForceDataFetch方法
  public async executeBeforeMainForceDataFetch(scanId: string, stockCodes: string[]): Promise<string[]> {
    let processedStockCodes = [...stockCodes];
    
    for (const pluginName of this.pluginOrder) {
      const plugin = this.plugins.get(pluginName);
      const metadata = this.pluginMetadata.get(pluginName);
      
      if (plugin && metadata && metadata.enabled && metadata.loaded && plugin.beforeMainForceDataFetch) {
        try {
          processedStockCodes = await plugin.beforeMainForceDataFetch(scanId, processedStockCodes);
        } catch (error) {
          console.error(`插件 ${pluginName} beforeMainForceDataFetch 执行出错:`, error);
          if (metadata) {
            metadata.lastError = error instanceof Error ? error.message : String(error);
          }
        }
      }
    }
    
    return processedStockCodes;
  }
  
  // 执行插件的afterMainForceDataFetch方法
  public async executeAfterMainForceDataFetch(scanId: string, mainForceDataMap: Map<string, any>): Promise<Map<string, any>> {
    let processedDataMap = new Map(mainForceDataMap);
    
    for (const pluginName of this.pluginOrder) {
      const plugin = this.plugins.get(pluginName);
      const metadata = this.pluginMetadata.get(pluginName);
      
      if (plugin && metadata && metadata.enabled && metadata.loaded && plugin.afterMainForceDataFetch) {
        try {
          processedDataMap = await plugin.afterMainForceDataFetch(scanId, processedDataMap);
        } catch (error) {
          console.error(`插件 ${pluginName} afterMainForceDataFetch 执行出错:`, error);
          if (metadata) {
            metadata.lastError = error instanceof Error ? error.message : String(error);
          }
        }
      }
    }
    
    return processedDataMap;
  }
  
  // 执行插件的beforeSignalGeneration方法
  public async executeBeforeSignalGeneration(scanId: string, quotes: any[], mainForceDataMap: Map<string, any>): Promise<void> {
    for (const pluginName of this.pluginOrder) {
      const plugin = this.plugins.get(pluginName);
      const metadata = this.pluginMetadata.get(pluginName);
      
      if (plugin && metadata && metadata.enabled && metadata.loaded && plugin.beforeSignalGeneration) {
        try {
          await plugin.beforeSignalGeneration(scanId, quotes, mainForceDataMap);
        } catch (error) {
          console.error(`插件 ${pluginName} beforeSignalGeneration 执行出错:`, error);
          if (metadata) {
            metadata.lastError = error instanceof Error ? error.message : String(error);
          }
        }
      }
    }
  }
  
  // 执行插件的afterSignalGeneration方法
  public async executeAfterSignalGeneration(scanId: string, signals: any[]): Promise<any[]> {
    let processedSignals = [...signals];
    
    for (const pluginName of this.pluginOrder) {
      const plugin = this.plugins.get(pluginName);
      const metadata = this.pluginMetadata.get(pluginName);
      
      if (plugin && metadata && metadata.enabled && metadata.loaded && plugin.afterSignalGeneration) {
        try {
          processedSignals = await plugin.afterSignalGeneration(scanId, processedSignals);
        } catch (error) {
          console.error(`插件 ${pluginName} afterSignalGeneration 执行出错:`, error);
          if (metadata) {
            metadata.lastError = error instanceof Error ? error.message : String(error);
          }
        }
      }
    }
    
    return processedSignals;
  }
  
  // 执行插件的afterScan方法
  public async executeAfterScan(scanId: string, scanResult: any): Promise<void> {
    for (const pluginName of this.pluginOrder) {
      const plugin = this.plugins.get(pluginName);
      const metadata = this.pluginMetadata.get(pluginName);
      
      if (plugin && metadata && metadata.enabled && metadata.loaded && plugin.afterScan) {
        try {
          await plugin.afterScan(scanId, scanResult);
        } catch (error) {
          console.error(`插件 ${pluginName} afterScan 执行出错:`, error);
          if (metadata) {
            metadata.lastError = error instanceof Error ? error.message : String(error);
          }
        }
      }
    }
  }
  
  // 执行插件的onConfigChange方法
  public async executeOnConfigChange(newConfig: any, oldConfig: any): Promise<void> {
    for (const pluginName of this.pluginOrder) {
      const plugin = this.plugins.get(pluginName);
      const metadata = this.pluginMetadata.get(pluginName);
      
      if (plugin && metadata && metadata.enabled && metadata.loaded && plugin.onConfigChange) {
        try {
          await plugin.onConfigChange(newConfig, oldConfig);
        } catch (error) {
          console.error(`插件 ${pluginName} onConfigChange 执行出错:`, error);
          if (metadata) {
            metadata.lastError = error instanceof Error ? error.message : String(error);
          }
        }
      }
    }
  }
  
  // 执行插件的beforeSignalExecution方法
  public async executeBeforeSignalExecution(signal: any): Promise<boolean> {
    let canExecute = true;
    
    for (const pluginName of this.pluginOrder) {
      const plugin = this.plugins.get(pluginName);
      const metadata = this.pluginMetadata.get(pluginName);
      
      if (plugin && metadata && metadata.enabled && metadata.loaded && plugin.beforeSignalExecution) {
        try {
          const result = await plugin.beforeSignalExecution(signal);
          if (!result) {
            canExecute = false;
            break;
          }
        } catch (error) {
          console.error(`插件 ${pluginName} beforeSignalExecution 执行出错:`, error);
          if (metadata) {
            metadata.lastError = error instanceof Error ? error.message : String(error);
          }
        }
      }
    }
    
    return canExecute;
  }
  
  // 执行插件的afterSignalExecution方法
  public async executeAfterSignalExecution(signal: any, result: any): Promise<void> {
    for (const pluginName of this.pluginOrder) {
      const plugin = this.plugins.get(pluginName);
      const metadata = this.pluginMetadata.get(pluginName);
      
      if (plugin && metadata && metadata.enabled && metadata.loaded && plugin.afterSignalExecution) {
        try {
          await plugin.afterSignalExecution(signal, result);
        } catch (error) {
          console.error(`插件 ${pluginName} afterSignalExecution 执行出错:`, error);
          if (metadata) {
            metadata.lastError = error instanceof Error ? error.message : String(error);
          }
        }
      }
    }
  }
  
  // 执行插件的onCacheUpdate方法
  public async executeOnCacheUpdate(key: string, value: any): Promise<void> {
    for (const pluginName of this.pluginOrder) {
      const plugin = this.plugins.get(pluginName);
      const metadata = this.pluginMetadata.get(pluginName);
      
      if (plugin && metadata && metadata.enabled && metadata.loaded && plugin.onCacheUpdate) {
        try {
          await plugin.onCacheUpdate(key, value);
        } catch (error) {
          console.error(`插件 ${pluginName} onCacheUpdate 执行出错:`, error);
          if (metadata) {
            metadata.lastError = error instanceof Error ? error.message : String(error);
          }
        }
      }
    }
  }
  
  // 执行插件的onUserAction方法
  public async executeOnUserAction(action: string, data: any): Promise<void> {
    for (const pluginName of this.pluginOrder) {
      const plugin = this.plugins.get(pluginName);
      const metadata = this.pluginMetadata.get(pluginName);
      
      if (plugin && metadata && metadata.enabled && metadata.loaded && plugin.onUserAction) {
        try {
          await plugin.onUserAction(action, data);
        } catch (error) {
          console.error(`插件 ${pluginName} onUserAction 执行出错:`, error);
          if (metadata) {
            metadata.lastError = error instanceof Error ? error.message : String(error);
          }
        }
      }
    }
  }
  
  // 按分类获取插件
  public getPluginsByCategory(category: string): PluginMetadata[] {
    const result: PluginMetadata[] = [];
    
    this.pluginMetadata.forEach(metadata => {
      if (metadata.category === category) {
        result.push(metadata);
      }
    });
    
    return result;
  }
  
  // 获取所有插件元数据
  public getAllPluginMetadata(): PluginMetadata[] {
    return Array.from(this.pluginMetadata.values());
  }
  
  // 更新插件
  public updatePlugin(plugin: MarketMonitorPlugin): boolean {
    if (!this.plugins.has(plugin.name)) {
      console.warn(`插件 ${plugin.name} 未注册，无法更新`);
      return false;
    }
    
    this.plugins.set(plugin.name, plugin);
    
    const metadata = this.pluginMetadata.get(plugin.name);
    if (metadata) {
      metadata.version = plugin.version;
      metadata.description = plugin.description;
      metadata.author = plugin.author;
      metadata.dependencies = plugin.dependencies;
      metadata.permissions = plugin.permissions;
      metadata.category = plugin.category;
      metadata.lastUpdated = Date.now();
    }
    
    console.log(`插件 ${plugin.name} 更新成功`);
    return true;
  }
  
  // 清理所有插件
  public async cleanupPlugins(): Promise<void> {
    for (const pluginName of this.pluginOrder) {
      const plugin = this.plugins.get(pluginName);
      const metadata = this.pluginMetadata.get(pluginName);
      
      if (plugin && metadata && metadata.loaded) {
        try {
          // 执行插件的系统关闭方法
          if (plugin.onSystemShutdown) {
            await plugin.onSystemShutdown();
          }
          
          await plugin.cleanup();
          console.log(`插件 ${pluginName} 清理成功`);
          metadata.loaded = false;
        } catch (error) {
          console.error(`插件 ${pluginName} 清理出错:`, error);
          if (metadata) {
            metadata.lastError = error instanceof Error ? error.message : String(error);
          }
        }
      }
    }
  }
  
  // 获取所有插件
  public getPlugins(): MarketMonitorPlugin[] {
    return Array.from(this.plugins.values());
  }
  
  // 获取所有插件元数据
  public getPluginMetadata(): PluginMetadata[] {
    return Array.from(this.pluginMetadata.values());
  }
  
  // 根据名称获取插件
  public getPlugin(name: string): MarketMonitorPlugin | undefined {
    return this.plugins.get(name);
  }
  
  // 根据名称获取插件元数据
  public getPluginMetadataByName(name: string): PluginMetadata | undefined {
    return this.pluginMetadata.get(name);
  }
  
  // 启用插件
  public enablePlugin(name: string): boolean {
    const metadata = this.pluginMetadata.get(name);
    if (metadata) {
      metadata.enabled = true;
      console.log(`插件 ${name} 已启用`);
      return true;
    }
    console.warn(`插件 ${name} 未找到，无法启用`);
    return false;
  }
  
  // 禁用插件
  public disablePlugin(name: string): boolean {
    const metadata = this.pluginMetadata.get(name);
    if (metadata) {
      metadata.enabled = false;
      console.log(`插件 ${name} 已禁用`);
      return true;
    }
    console.warn(`插件 ${name} 未找到，无法禁用`);
    return false;
  }
  
  // 重新加载插件
  public async reloadPlugin(name: string, config: any): Promise<boolean> {
    const plugin = this.plugins.get(name);
    const metadata = this.pluginMetadata.get(name);
    
    if (plugin && metadata) {
      try {
        // 清理插件
        if (plugin.onSystemShutdown) {
          await plugin.onSystemShutdown();
        }
        await plugin.cleanup();
        
        // 重新初始化插件
        const success = await plugin.initialize(config);
        if (success) {
          metadata.loaded = true;
          metadata.lastError = undefined;
          
          // 执行系统启动方法
          if (plugin.onSystemStart) {
            await plugin.onSystemStart();
          }
          
          console.log(`插件 ${name} 重新加载成功`);
          return true;
        } else {
          metadata.loaded = false;
          metadata.lastError = '重新加载失败';
          console.warn(`插件 ${name} 重新加载失败`);
          return false;
        }
      } catch (error) {
        console.error(`插件 ${name} 重新加载出错:`, error);
        if (metadata) {
          metadata.loaded = false;
          metadata.lastError = error instanceof Error ? error.message : String(error);
        }
        return false;
      }
    }
    
    console.warn(`插件 ${name} 未找到，无法重新加载`);
    return false;
  }
  
  // 重新加载所有插件
  public async reloadAllPlugins(config: any): Promise<boolean> {
    let allSuccess = true;
    
    for (const pluginName of this.pluginOrder) {
      const success = await this.reloadPlugin(pluginName, config);
      if (!success) {
        allSuccess = false;
      }
    }
    
    return allSuccess;
  }
  
  // 检查插件权限
  public checkPluginPermissions(pluginName: string): boolean {
    const metadata = this.pluginMetadata.get(pluginName);
    if (!metadata) {
      return false;
    }
    
    // 这里可以添加权限检查逻辑
    // 例如检查用户是否有足够的权限来运行该插件
    return true;
  }
  
  // 动态加载插件
  public async loadPlugin(pluginPath: string): Promise<boolean> {
    try {
      // 这里可以添加动态加载插件的逻辑
      // 例如从外部文件或远程加载插件
      console.log(`动态加载插件 ${pluginPath}`);
      return true;
    } catch (error) {
      console.error(`动态加载插件 ${pluginPath} 失败:`, error);
      return false;
    }
  }
}

// 示例插件：基础分析插件
export class BasicAnalysisPlugin implements MarketMonitorPlugin {
  name = 'BasicAnalysisPlugin';
  version = '1.0.0';
  description = '基础股票分析插件';
  author = '智盈AI团队';
  
  async initialize(config: any): Promise<boolean> {
    console.log('基础分析插件初始化');
    return true;
  }
  
  async afterSignalGeneration(scanId: string, signals: any[]): Promise<any[]> {
    // 对信号进行基础分析
    return signals.map(signal => {
      // 添加一些基础分析指标
      if (signal.type === 'buy') {
        signal.analysis = {
          riskLevel: signal.confidence > 70 ? 'low' : signal.confidence > 40 ? 'medium' : 'high',
          potential: signal.expectedProfitPercent > 10 ? 'high' : signal.expectedProfitPercent > 5 ? 'medium' : 'low'
        };
      }
      return signal;
    });
  }
  
  async cleanup(): Promise<void> {
    console.log('基础分析插件清理');
  }
}

// 示例插件：行业分析插件
export class IndustryAnalysisPlugin implements MarketMonitorPlugin {
  name = 'IndustryAnalysisPlugin';
  version = '1.0.0';
  description = '行业分析插件';
  author = '智盈AI团队';
  
  async initialize(config: any): Promise<boolean> {
    console.log('行业分析插件初始化');
    return true;
  }
  
  async afterSignalGeneration(scanId: string, signals: any[]): Promise<any[]> {
    // 对信号添加行业分析
    return signals.map(signal => {
      // 模拟行业分析
      signal.industryAnalysis = {
        sector: 'Technology',
        sectorPerformance: Math.random() * 10 - 5,
        industryRank: Math.floor(Math.random() * 100)
      };
      return signal;
    });
  }
  
  async cleanup(): Promise<void> {
    console.log('行业分析插件清理');
  }
}

// 示例插件：技术指标插件
export class TechnicalIndicatorPlugin implements MarketMonitorPlugin {
  name = 'TechnicalIndicatorPlugin';
  version = '1.0.0';
  description = '技术指标分析插件';
  author = '智盈AI团队';
  
  async initialize(config: any): Promise<boolean> {
    console.log('技术指标插件初始化');
    return true;
  }
  
  async afterQuoteFetch(scanId: string, quotes: any[]): Promise<any[]> {
    // 对行情数据添加技术指标
    return quotes.map(quote => {
      // 模拟技术指标计算
      quote.technicalIndicators = {
        rsi: Math.random() * 100,
        macd: Math.random() * 10 - 5,
        kdj: {
          k: Math.random() * 100,
          d: Math.random() * 100,
          j: Math.random() * 100
        },
        bollinger: {
          upper: quote.price * (1 + 0.02),
          middle: quote.price,
          lower: quote.price * (1 - 0.02)
        }
      };
      return quote;
    });
  }
  
  async cleanup(): Promise<void> {
    console.log('技术指标插件清理');
  }
}

// 导出默认插件管理器
export const pluginManager = PluginManager.getInstance();

// 注册默认插件
export const registerDefaultPlugins = () => {
  pluginManager.registerPlugin(new BasicAnalysisPlugin());
  pluginManager.registerPlugin(new IndustryAnalysisPlugin());
  pluginManager.registerPlugin(new TechnicalIndicatorPlugin());
};