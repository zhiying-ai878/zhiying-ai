// 插件系统模块

// 插件接口
export interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  enabled: boolean;
  init: (api: PluginAPI) => void;
  destroy: () => void;
  [key: string]: any;
}

// 插件API接口
export interface PluginAPI {
  // 数据相关API
  getData: (key: string) => Promise<any>;
  setData: (key: string, value: any) => Promise<void>;
  
  // 交易相关API
  executeTrade: (tradeData: TradeData) => Promise<TradeResult>;
  getTradeHistory: () => Promise<TradeData[]>;
  
  // 策略相关API
  createStrategy: (strategy: StrategyData) => Promise<string>;
  updateStrategy: (id: string, strategy: StrategyData) => Promise<void>;
  deleteStrategy: (id: string) => Promise<void>;
  getStrategies: () => Promise<StrategyData[]>;
  
  // 事件相关API
  on: (event: string, callback: (data: any) => void) => void;
  off: (event: string, callback: (data: any) => void) => void;
  emit: (event: string, data: any) => void;
  
  // UI相关API
  addMenuItem: (menuItem: MenuItem) => void;
  addWidget: (widget: Widget) => void;
  
  // 配置相关API
  getConfig: (key: string) => any;
  setConfig: (key: string, value: any) => void;
}

// 交易数据接口
export interface TradeData {
  id?: string;
  stockCode: string;
  stockName: string;
  type: 'buy' | 'sell' | 'short' | 'cover';
  price: number;
  volume: number;
  time: string;
  strategy?: string;
}

// 交易结果接口
export interface TradeResult {
  success: boolean;
  message: string;
  tradeId?: string;
  error?: string;
}

// 策略数据接口
export interface StrategyData {
  id?: string;
  name: string;
  description: string;
  type: string;
  parameters: Record<string, any>;
  enabled: boolean;
}

// 菜单项接口
export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  onClick: () => void;
  parentId?: string;
  order?: number;
}

// 部件接口
export interface Widget {
  id: string;
  name: string;
  component: React.ReactNode;
  position: 'dashboard' | 'sidebar' | 'header' | 'footer';
  order?: number;
}

// 插件管理器
class PluginManager {
  private plugins: Map<string, Plugin> = new Map();
  private events: Map<string, Array<(data: any) => void>> = new Map();
  private menuItems: MenuItem[] = [];
  private widgets: Widget[] = [];
  private config: Record<string, any> = {};
  private dataStore: Record<string, any> = {};

  // 触发事件
  private emit(event: string, data: any) {
    const callbacks = this.events.get(event);
    callbacks?.forEach(callback => callback(data));
  }

  // 初始化插件系统
  init(): void {
    console.log('插件系统初始化');
    // 加载已安装的插件
    this.loadPlugins();
  }

  // 加载插件
  private loadPlugins(): void {
    // 这里可以从本地存储或服务器加载插件
    // 现在使用模拟插件
    const mockPlugins = this.getMockPlugins();
    mockPlugins.forEach(plugin => this.registerPlugin(plugin));
  }

  // 注册插件
  registerPlugin(plugin: Plugin): void {
    if (this.plugins.has(plugin.id)) {
      console.warn(`插件 ${plugin.id} 已存在`);
      return;
    }

    this.plugins.set(plugin.id, plugin);
    
    if (plugin.enabled) {
      this.enablePlugin(plugin.id);
    }

    console.log(`插件 ${plugin.name} 注册成功`);
  }

  // 启用插件
  enablePlugin(pluginId: string): void {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      console.error(`插件 ${pluginId} 不存在`);
      return;
    }

    try {
      plugin.init(this.getPluginAPI());
      plugin.enabled = true;
      console.log(`插件 ${plugin.name} 启用成功`);
    } catch (error) {
      console.error(`插件 ${plugin.name} 启用失败:`, error);
    }
  }

  // 禁用插件
  disablePlugin(pluginId: string): void {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      console.error(`插件 ${pluginId} 不存在`);
      return;
    }

    try {
      if (plugin.enabled) {
        plugin.destroy();
        plugin.enabled = false;
        console.log(`插件 ${plugin.name} 禁用成功`);
      }
    } catch (error) {
      console.error(`插件 ${plugin.name} 禁用失败:`, error);
    }
  }

  // 卸载插件
  unloadPlugin(pluginId: string): void {
    this.disablePlugin(pluginId);
    this.plugins.delete(pluginId);
    console.log(`插件 ${pluginId} 卸载成功`);
  }

  // 获取所有插件
  getPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  // 获取已启用的插件
  getEnabledPlugins(): Plugin[] {
    return Array.from(this.plugins.values()).filter(plugin => plugin.enabled);
  }

  // 获取插件API
  private getPluginAPI(): PluginAPI {
    return {
      // 数据相关API
      getData: async (key: string) => {
        return this.dataStore[key];
      },
      
      setData: async (key: string, value: any) => {
        this.dataStore[key] = value;
      },
      
      // 交易相关API
      executeTrade: async (tradeData: TradeData): Promise<TradeResult> => {
        // 模拟交易执行
        return {
          success: true,
          message: '交易执行成功',
          tradeId: Date.now().toString()
        };
      },
      
      getTradeHistory: async (): Promise<TradeData[]> => {
        // 模拟交易历史
        return [
          {
            id: '1',
            stockCode: '000001',
            stockName: '平安银行',
            type: 'buy',
            price: 17.50,
            volume: 1000,
            time: new Date().toISOString(),
            strategy: '趋势跟踪策略'
          }
        ];
      },
      
      // 策略相关API
      createStrategy: async (strategy: StrategyData): Promise<string> => {
        const id = Date.now().toString();
        // 模拟创建策略
        return id;
      },
      
      updateStrategy: async (id: string, strategy: StrategyData): Promise<void> => {
        // 模拟更新策略
      },
      
      deleteStrategy: async (id: string): Promise<void> => {
        // 模拟删除策略
      },
      
      getStrategies: async (): Promise<StrategyData[]> => {
        // 模拟策略列表
        return [
          {
            id: '1',
            name: '趋势跟踪策略',
            description: '基于价格趋势的策略',
            type: 'trend',
            parameters: { period: 20 },
            enabled: true
          }
        ];
      },
      
      // 事件相关API
      on: (event: string, callback: (data: any) => void) => {
        if (!this.events.has(event)) {
          this.events.set(event, []);
        }
        this.events.get(event)?.push(callback);
      },
      
      off: (event: string, callback: (data: any) => void) => {
        const callbacks = this.events.get(event);
        if (callbacks) {
          this.events.set(event, callbacks.filter(cb => cb !== callback));
        }
      },
      
      emit: (event: string, data: any) => {
        const callbacks = this.events.get(event);
        callbacks?.forEach(callback => callback(data));
      },
      
      // UI相关API
      addMenuItem: (menuItem: MenuItem) => {
        this.menuItems.push(menuItem);
        this.emit('menuItemAdded', menuItem);
      },
      
      addWidget: (widget: Widget) => {
        this.widgets.push(widget);
        this.emit('widgetAdded', widget);
      },
      
      // 配置相关API
      getConfig: (key: string) => {
        return this.config[key];
      },
      
      setConfig: (key: string, value: any) => {
        this.config[key] = value;
        this.emit('configChanged', { key, value });
      }
    };
  }

  // 获取菜单项
  getMenuItems(): MenuItem[] {
    return this.menuItems.sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  // 获取部件
  getWidgets(): Widget[] {
    return this.widgets.sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  // 模拟插件
  private getMockPlugins(): Plugin[] {
    return [
      {
        id: 'eastmoney-plugin',
        name: '东方财富插件',
        version: '1.0.0',
        description: '东方财富账户集成插件',
        author: 'AI投资团队',
        enabled: true,
        init: (api) => {
          console.log('东方财富插件初始化');
          // 添加菜单项
          api.addMenuItem({
            id: 'eastmoney-account',
            label: '东方财富账户',
            onClick: () => {
              console.log('打开东方财富账户');
            }
          });
          // 监听事件
          api.on('tradeExecuted', (trade) => {
            console.log('交易执行:', trade);
          });
        },
        destroy: () => {
          console.log('东方财富插件销毁');
        }
      },
      {
        id: 'news-plugin',
        name: '新闻分析插件',
        version: '1.0.0',
        description: '实时新闻分析和情绪检测',
        author: 'AI投资团队',
        enabled: true,
        init: (api) => {
          console.log('新闻分析插件初始化');
          // 添加部件
          api.addWidget({
            id: 'news-widget',
            name: '热点新闻',
            component: null, // 实际项目中应该是一个React组件
            position: 'dashboard',
            order: 1
          });
        },
        destroy: () => {
          console.log('新闻分析插件销毁');
        }
      }
    ];
  }
}

// API接口定义
class ApiInterface {
  private pluginManager: PluginManager;

  constructor(pluginManager: PluginManager) {
    this.pluginManager = pluginManager;
  }

  // 初始化API服务器
  init(): void {
    console.log('API接口初始化');
    // 这里可以设置HTTP服务器或WebSocket服务器
  }

  // 处理API请求
  handleRequest(path: string, method: string, data: any): Promise<any> {
    // 模拟API处理
    switch (path) {
      case '/api/plugins':
        return Promise.resolve(this.pluginManager.getPlugins());
      case '/api/strategies':
        return Promise.resolve([
          {
            id: '1',
            name: '趋势跟踪策略',
            description: '基于价格趋势的策略',
            type: 'trend',
            parameters: { period: 20 },
            enabled: true
          }
        ]);
      case '/api/portfolio':
        return Promise.resolve({
          totalValue: 100000,
          totalProfit: 5000,
          positions: [
            {
              stockCode: '000001',
              stockName: '平安银行',
              price: 18.76,
              cost: 17.50,
              volume: 1000,
              profit: 1260
            }
          ]
        });
      default:
        return Promise.reject({ error: 'API路径不存在' });
    }
  }
}

// 导出单例实例
let pluginManager: PluginManager | null = null;
let apiInterface: ApiInterface | null = null;

export const getPluginManager = (): PluginManager => {
  if (!pluginManager) {
    pluginManager = new PluginManager();
    pluginManager.init();
  }
  return pluginManager;
};

export const getApiInterface = (): ApiInterface => {
  if (!apiInterface) {
    apiInterface = new ApiInterface(getPluginManager());
    apiInterface.init();
  }
  return apiInterface;
};

// 插件开发工具函数
export const createPlugin = (pluginData: Partial<Plugin>): Plugin => {
  return {
    id: pluginData.id || `plugin-${Date.now()}`,
    name: pluginData.name || '未命名插件',
    version: pluginData.version || '1.0.0',
    description: pluginData.description || '',
    author: pluginData.author || '未知',
    enabled: pluginData.enabled || false,
    init: pluginData.init || (() => {}),
    destroy: pluginData.destroy || (() => {}),
    ...pluginData
  };
};
