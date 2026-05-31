import axios from 'axios';

// 股票名称映射接口
interface StockNameMap {
  [code: string]: string;
}

// 股票名称管理器
export class StockNameManager {
  private stockNameMap: StockNameMap = {};
  private cache: Map<string, { name: string; timestamp: number }> = new Map();
  private cacheExpiry = 24 * 60 * 60 * 1000; // 缓存24小时
  private updateInterval = 60 * 60 * 1000; // 每小时更新一次

  constructor() {
    // 初始化股票名称映射
    this.initializeStockNameMap();
    
    // 启动定期更新
    this.startPeriodicUpdate();
  }

  // 初始化股票名称映射
  private initializeStockNameMap() {
    // 手动添加一些常见股票的名称
    this.stockNameMap = {
      'sh600000': '浦发银行',
      'sh600036': '招商银行',
      'sh600519': '贵州茅台',
      'sh601318': '中国平安',
      'sh601888': '中国中免',
      'sz000001': '平安银行',
      'sz000858': '五粮液',
      'sz300750': '宁德时代',
      'sz300900': '广联航空', // 300900的正确名称
      'sz301178': '天亿马',
      'sz300857': '协创数据',
      'sz300583': '赛托生物',
      'sz300466': '赛摩智能',
      'sz301195': '北路智控'
    };
  }

  // 启动定期更新
  private startPeriodicUpdate() {
    setInterval(() => {
      this.updateStockNames();
    }, this.updateInterval);
  }

  // 更新股票名称
  private async updateStockNames() {
    try {
      // 从多个数据源获取股票名称
      await Promise.all([
        this.updateFromEastMoney(),
        this.updateFromSina(),
        this.updateFromTencent()
      ]);
      
      console.log('股票名称更新完成');
    } catch (error) {
      console.error('更新股票名称失败:', error);
    }
  }

  // 从东方财富更新股票名称
  private async updateFromEastMoney() {
    try {
      // 东方财富的股票列表API
      const url = 'https://push2.eastmoney.com/api/qt/clist/get?pn=1&pz=1000&po=1&np=1&ut=bd1d9ddb04089700cf9c27f6f7426281&fltt=2&invt=2&fid=f3&fs=m:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23,m:0+t:81+s:2048&stat=1&fields=f12,f14&rt=53814992';
      
      const response = await axios.get(url, {
        timeout: 5000
      });
      
      const data = response.data as any;
      if (data && data.data && data.data.diff) {
        data.data.diff.forEach((item: any) => {
          const code = item.f12.startsWith('6') ? `sh${item.f12}` : `sz${item.f12}`;
          this.stockNameMap[code] = item.f14;
        });
      }
    } catch (error) {
      console.warn('从东方财富更新股票名称失败:', error);
    }
  }

  // 从新浪财经更新股票名称
  private async updateFromSina() {
    try {
      // 新浪财经的股票列表API
      const url = 'http://vip.stock.finance.sina.com.cn/q/go.php/vInvestConsult/kind/sz000001/index.phtml';
      
      const response = await axios.get(url, {
        timeout: 5000
      });
      
      // 解析HTML获取股票名称
      // 这里只是示例，实际解析需要更复杂的逻辑
    } catch (error) {
      console.warn('从新浪财经更新股票名称失败:', error);
    }
  }

  // 从腾讯财经更新股票名称
  private async updateFromTencent() {
    try {
      // 腾讯财经的股票列表API
      const url = 'https://qt.gtimg.cn/q=s_sh000001';
      
      const response = await axios.get(url, {
        timeout: 5000
      });
      
      // 解析腾讯财经的数据
      // 这里只是示例，实际解析需要更复杂的逻辑
    } catch (error) {
      console.warn('从腾讯财经更新股票名称失败:', error);
    }
  }

  // 获取股票名称
  async getStockName(code: string): Promise<string> {
    // 检查缓存
    const cached = this.cache.get(code);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.name;
    }

    // 检查映射表
    if (this.stockNameMap[code]) {
      const name = this.stockNameMap[code];
      this.cache.set(code, {
        name,
        timestamp: Date.now()
      });
      return name;
    }

    // 尝试从数据源获取
    try {
      const name = await this.fetchStockName(code);
      if (name) {
        this.stockNameMap[code] = name;
        this.cache.set(code, {
          name,
          timestamp: Date.now()
        });
        return name;
      }
    } catch (error) {
      console.warn(`获取${code}股票名称失败:`, error);
    }

    // 返回默认名称
    const defaultName = `股票${code.slice(2)}`;
    this.cache.set(code, {
      name: defaultName,
      timestamp: Date.now()
    });
    return defaultName;
  }

  // 从数据源获取股票名称
  private async fetchStockName(code: string): Promise<string | null> {
    // 尝试从东方财富获取
    try {
      const secid = code.startsWith('sh') ? `1.${code.slice(2)}` : `0.${code.slice(2)}`;
      const url = `https://push2.eastmoney.com/api/qt/stock/get?secid=${secid}&fields=f14`;
      
      const response = await axios.get(url, {
        timeout: 3000
      });
      
      const data = response.data as any;
      if (data && data.data && data.data.f14) {
        return data.data.f14;
      }
    } catch (error) {
      console.warn(`从东方财富获取${code}股票名称失败:`, error);
    }

    // 尝试从新浪财经获取
    try {
      const sinaCode = code.startsWith('sh') ? `sh${code.slice(2)}` : `sz${code.slice(2)}`;
      const url = `http://hq.sinajs.cn/list=${sinaCode}`;
      
      const response = await axios.get(url, {
        timeout: 3000
      });
      
      const match = (response.data as string).match(/"([^"]+)"/);
      if (match) {
        const parts = match[1].split(',');
        return parts[0];
      }
    } catch (error) {
      console.warn(`从新浪财经获取${code}股票名称失败:`, error);
    }

    return null;
  }

  // 批量获取股票名称
  async getStockNames(codes: string[]): Promise<{ [code: string]: string }> {
    const result: { [code: string]: string } = {};
    
    const promises = codes.map(async (code) => {
      result[code] = await this.getStockName(code);
    });
    
    await Promise.all(promises);
    return result;
  }

  // 添加股票名称
  addStockName(code: string, name: string): void {
    this.stockNameMap[code] = name;
    this.cache.set(code, {
      name,
      timestamp: Date.now()
    });
  }

  // 批量添加股票名称
  addStockNames(names: StockNameMap): void {
    Object.entries(names).forEach(([code, name]) => {
      this.addStockName(code, name);
    });
  }

  // 清除缓存
  clearCache(): void {
    this.cache.clear();
  }

  // 获取映射表大小
  getMapSize(): number {
    return Object.keys(this.stockNameMap).length;
  }
}

// 导出单例
export const stockNameManager = new StockNameManager();
export const getStockNameManager = () => stockNameManager;