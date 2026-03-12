# 东方财富与新浪财经API集成完全指南

## 一、概述

本指南详细介绍如何在您的智盈AI中集成东方财富和新浪财经的真实数据源，实现：
1. 实时行情数据获取
2. 主力资金数据追踪
3. K线历史数据获取
4. 股票基础信息查询

## 二、核心功能模块

### 2.1 已实现的主力资金追踪系统

位置：`src/utils/mainForceTracker.ts`

**主要功能：**
- 主力资金数据接口定义
- 预警配置管理
- 实时预警触发
- 浏览器通知推送
- 模拟数据生成（用于开发测试）

**使用示例：**
```typescript
import { getMainForceTracker } from './utils/mainForceTracker';

const tracker = getMainForceTracker();

// 添加预警配置
tracker.addAlertConfig({
  stockCode: '*',
  type: 'mainForceBuy',
  threshold: 500000000,
  enabled: true,
  urgency: 'emergency'
});

// 订阅预警
tracker.subscribe((alerts) => {
  console.log('收到预警:', alerts);
});

// 更新主力资金数据（实际项目中从API获取）
const mockData = tracker.generateMockData('600519', '贵州茅台');
tracker.updateMainForceData(mockData);
```

## 三、东方财富API集成方案

### 3.1 实时行情API

**接口地址：**
```
https://push2.eastmoney.com/api/qt/stock/get
```

**请求参数：**
| 参数 | 说明 | 示例 |
|------|------|------|
| secid | 证券代码 | 1.600519（沪市）/ 0.000001（深市） |
| fields | 字段列表 | f43,f44,f45,f46,f47,f48,f57,f58,f60 |

**字段说明：**
- f43: 最新价
- f44: 最高价
- f45: 最低价
- f46: 开盘价
- f47: 成交量
- f48: 成交额
- f57: 股票代码
- f58: 股票名称
- f60: 昨收价

**请求示例（axios）：**
```typescript
import axios from 'axios';

async function getEastMoneyQuote(code: string) {
  const secid = code.startsWith('6') ? `1.${code}` : `0.${code}`;
  
  const response = await axios.get('https://push2.eastmoney.com/api/qt/stock/get', {
    params: {
      secid,
      fields: 'f43,f44,f45,f46,f47,f48,f57,f58,f60'
    },
    headers: {
      'Referer': 'https://quote.eastmoney.com/'
    }
  });
  
  return response.data;
}
```

### 3.2 主力资金API

**接口地址：**
```
https://push2his.eastmoney.com/api/qt/stock/fflow/daykline/get
```

**请求参数：**
| 参数 | 说明 | 示例 |
|------|------|------|
| lmt | 数据条数 | 1 |
| klt | K线类型 | 101（日K） |
| secid | 证券代码 | 1.600519 |
| fields1 | 字段列表 | f1,f2,f3,f4,f5,f6,f7 |

**字段说明：**
- f1: 日期
- f2: 主力净流入
- f3: 超大单净流入
- f4: 大单净流入
- f5: 中单净流入
- f6: 小单净流入
- f7: 收盘价

**请求示例：**
```typescript
async function getMainForceData(code: string) {
  const secid = code.startsWith('6') ? `1.${code}` : `0.${code}`;
  
  const response = await axios.get('https://push2his.eastmoney.com/api/qt/stock/fflow/daykline/get', {
    params: {
      lmt: 1,
      klt: 101,
      secid,
      fields1: 'f1,f2,f3,f4,f5,f6,f7'
    },
    headers: {
      'Referer': 'https://data.eastmoney.com/'
    }
  });
  
  return response.data;
}
```

### 3.3 K线数据API

**接口地址：**
```
https://push2his.eastmoney.com/api/qt/stock/kline/get
```

**请求参数：**
| 参数 | 说明 | 示例 |
|------|------|------|
| secid | 证券代码 | 1.600519 |
| klt | K线类型 | 101（日）/102（周）/103（月） |
| fqt | 复权方式 | 1（前复权） |
| beg | 开始日期 | 20240101 |
| end | 结束日期 | 20241231 |

## 四、新浪财经API集成方案

### 4.1 实时行情API

**接口地址：**
```
https://hq.sinajs.cn/list=sh600519,sz000001
```

**请求示例：**
```typescript
async function getSinaQuote(codes: string[]) {
  const codeStr = codes.map(code => {
    return code.startsWith('6') ? `sh${code}` : `sz${code}`;
  }).join(',');
  
  const response = await axios.get(`https://hq.sinajs.cn/list=${codeStr}`, {
    headers: {
      'Referer': 'https://finance.sina.com.cn/'
    }
  });
  
  return response.data;
}
```

**返回数据解析：**
```typescript
function parseSinaData(data: string) {
  const regex = /var hq_str_([a-z]{2}\d{6})="([^"]+)"/g;
  const results = [];
  
  let match;
  while ((match = regex.exec(data)) !== null) {
    const [, fullCode, valuesStr] = match;
    const values = valuesStr.split(',');
    
    results.push({
      code: fullCode.slice(2),
      name: values[0],
      price: parseFloat(values[1]),
      preClose: parseFloat(values[2]),
      open: parseFloat(values[3]),
      high: parseFloat(values[4]),
      low: parseFloat(values[5]),
      volume: parseInt(values[8]),
      amount: parseFloat(values[9])
    });
  }
  
  return results;
}
```

## 五、完整集成实现

### 5.1 更新 stockData.ts

将以下代码添加到 `src/utils/stockData.ts` 中：

```typescript
// 获取东方财富主力资金数据
private async getEastMoneyMainForceData(codes: string[]): Promise<MainForceData[]> {
  const results: MainForceData[] = [];
  
  for (const code of codes) {
    try {
      const secid = code.startsWith('6') ? `1.${code}` : `0.${code}`;
      const response = await axios.get('https://push2his.eastmoney.com/api/qt/stock/fflow/daykline/get', {
        params: {
          lmt: 1,
          klt: 101,
          secid,
          fields1: 'f1,f2,f3,f4,f5,f6,f7'
        },
        headers: {
          'Referer': 'https://data.eastmoney.com/'
        }
      });

      const stockName = code === '600519' ? '贵州茅台' : 
                      code === '000001' ? '平安银行' : '股票' + code;
      
      if (response.data && response.data.data && response.data.data.klines) {
        const klines = response.data.data.klines;
        if (klines.length > 0) {
          const data = klines[0].split(',');
          results.push({
            stockCode: code,
            stockName,
            timestamp: Date.now(),
            superLargeOrder: {
              volume: 0,
              amount: Math.abs(parseFloat(data[3])),
              netFlow: parseFloat(data[3])
            },
            largeOrder: {
              volume: 0,
              amount: Math.abs(parseFloat(data[4])),
              netFlow: parseFloat(data[4])
            },
            mediumOrder: {
              volume: 0,
              amount: Math.abs(parseFloat(data[5])),
              netFlow: parseFloat(data[5])
            },
            smallOrder: {
              volume: 0,
              amount: Math.abs(parseFloat(data[6])),
              netFlow: parseFloat(data[6])
            },
            totalNetFlow: parseFloat(data[2]),
            mainForceNetFlow: parseFloat(data[3]) + parseFloat(data[4])
          });
          continue;
        }
      }
      
      results.push(this.getMockMainForceData(code, stockName));
    } catch (err) {
      console.error(`获取${code}主力资金数据失败:`, err);
      const stockName = code === '600519' ? '贵州茅台' : 
                      code === '000001' ? '平安银行' : '股票' + code;
      results.push(this.getMockMainForceData(code, stockName));
    }
  }

  return results;
}

// 公开的主力资金数据获取方法
async getMainForceData(codes: string[]): Promise<MainForceData[]> {
  const cacheKey = 'mainforce_' + codes.join('_');
  const cached = this.getCache<MainForceData[]>(cacheKey);
  
  if (cached) {
    return cached;
  }

  try {
    let results: MainForceData[];
    
    switch (this.sourceType) {
      case 'eastmoney':
        results = await this.getEastMoneyMainForceData(codes);
        break;
      case 'mock':
      default:
        results = codes.map(code => {
          const stockName = code === '600519' ? '贵州茅台' : 
                          code === '000001' ? '平安银行' : '股票' + code;
          return this.getMockMainForceData(code, stockName);
        });
        break;
    }

    this.setCache(cacheKey, results);
    return results;
  } catch (error) {
    console.error('获取主力资金数据失败:', error);
    return codes.map(code => {
      const stockName = code === '600519' ? '贵州茅台' : 
                      code === '000001' ? '平安银行' : '股票' + code;
      return this.getMockMainForceData(code, stockName);
    });
  }
}
```

### 5.2 导出便捷方法

在文件末尾添加：

```typescript
export const getMainForceData = async (codes: string[]) => {
  return getStockDataSource().getMainForceData(codes);
};
```

## 六、使用示例

### 6.1 在组件中使用

```typescript
import { useEffect, useState } from 'react';
import { getMainForceTracker } from '../utils/mainForceTracker';
import { getMainForceData, getStockDataSource } from '../utils/stockData';

function MainForceMonitor() {
  const [alerts, setAlerts] = useState([]);
  const tracker = getMainForceTracker();

  useEffect(() => {
    const unsubscribe = tracker.subscribe((newAlerts) => {
      setAlerts(prev => [...newAlerts, ...prev]);
    });

    return unsubscribe;
  }, []);

  const refreshData = async () => {
    const stockCodes = ['600519', '000001', '002594'];
    
    try {
      const dataSource = getStockDataSource('eastmoney');
      const mainForceDataList = await dataSource.getMainForceData(stockCodes);
      
      mainForceDataList.forEach(data => {
        tracker.updateMainForceData(data);
      });
    } catch (error) {
      console.error('刷新数据失败:', error);
    }
  };

  return (
    <div>
      <button onClick={refreshData}>刷新主力资金数据</button>
      <h2>预警记录</h2>
      {alerts.map(alert => (
        <div key={alert.id} style={{ 
          color: alert.urgency === 'emergency' ? 'red' : 'orange' 
        }}>
          <strong>{alert.stockName}</strong>: {alert.message}
        </div>
      ))}
    </div>
  );
}
```

## 七、注意事项

### 7.1 CORS问题
由于浏览器同源策略限制，直接从前端调用这些API可能会遇到CORS问题。

**解决方案：**
1. 使用后端代理服务器
2. 使用浏览器插件（如CORS Unblock）进行开发测试
3. 部署时配置反向代理（如Nginx）

### 7.2 请求频率限制
- 避免过于频繁的请求
- 建议设置30秒以上的缓存时间
- 合理使用批量请求接口

### 7.3 数据准确性
- 免费API数据可能存在延迟
- 重要交易决策建议使用官方授权数据源
- 建议添加数据校验和异常处理机制

### 7.4 法律合规
- 仅用于个人学习和研究
- 不得用于商业用途
- 遵守相关网站的使用条款

## 八、下一步开发建议

1. **创建后端代理服务**：使用Node.js或Python创建API代理，解决CORS问题
2. **WebSocket实时数据**：集成WebSocket实现真正的实时数据推送
3. **数据持久化**：将历史数据保存到数据库
4. **多数据源融合**：结合多个数据源提高数据准确性
5. **回测系统**：基于历史数据进行策略回测

## 九、联系与支持

如有问题，请参考：
- 东方财富开发者文档：https://data.eastmoney.com/
- 新浪财经API文档：https://finance.sina.com.cn/
