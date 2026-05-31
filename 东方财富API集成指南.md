# 东方财富API集成使用指南

## 📋 重要说明

### ⚠️ 法律和安全提示

1. **东方财富没有公开API** - 东方财富官方不提供公开的API接口
2. **不能直接交易** - 通过第三方API进行实盘交易有法律风险
3. **仅供学习研究** - 本系统仅供学习和研究使用
4. **模拟交易优先** - 建议先使用模拟数据进行测试

---

## 🎯 可用的数据源

### 方案一：新浪财经API（推荐⭐⭐⭐⭐⭐）

**优点：**
- 免费使用
- 数据更新较快
- 支持多股票查询
- 接口稳定

**使用方式：**
```typescript
import { getStockDataSource } from './utils/stockData';

const dataSource = getStockDataSource('sina');
const quotes = await dataSource.getRealtimeQuote(['600519', '000001']);
```

### 方案二：腾讯财经API（备选⭐⭐⭐⭐）

**优点：**
- 免费使用
- 数据全面
- 接口简单

**使用方式：**
```typescript
const dataSource = getStockDataSource('tencent');
const quotes = await dataSource.getRealtimeQuote(['600519']);
```

### 方案三：模拟数据（开发测试⭐⭐⭐）

**优点：**
- 完全可控
- 不依赖网络
- 适合开发测试

**使用方式：**
```typescript
const dataSource = getStockDataSource('mock');
const quotes = await dataSource.getRealtimeQuote(['600519']);
```

---

## 🚀 快速开始

### 1. 基本使用

```typescript
import { getRealtimeQuote, getKLineData, getStockList } from './utils/stockData';

// 获取实时行情
const quotes = await getRealtimeQuote(['600519', '000001', '000858']);
console.log('实时行情:', quotes);

// 获取K线数据
const kline = await getKLineData('600519', 'day', 100);
console.log('K线数据:', kline);

// 获取股票列表
const stockList = await getStockList();
console.log('股票列表:', stockList);
```

### 2. 切换数据源

```typescript
import { getStockDataSource } from './utils/stockData';

const dataSource = getStockDataSource();

// 切换到新浪财经
dataSource.setSourceType('sina');

// 切换到腾讯财经
dataSource.setSourceType('tencent');

// 切换到模拟数据
dataSource.setSourceType('mock');
```

### 3. 完整示例

```typescript
import { getStockDataSource } from './utils/stockData';

async function example() {
  const dataSource = getStockDataSource('sina');
  
  try {
    // 获取股票列表
    const stocks = await dataSource.getStockList();
    console.log('可用股票:', stocks.map(s => `${s.name}(${s.code})`));
    
    // 获取实时行情
    const codes = stocks.slice(0, 5).map(s => s.code);
    const quotes = await dataSource.getRealtimeQuote(codes);
    
    quotes.forEach(quote => {
      console.log(`${quote.name}: ${quote.price} (${quote.change >= 0 ? '+' : ''}${quote.change.toFixed(2)})`);
    });
    
    // 获取K线数据
    const kline = await dataSource.getKLineData('600519', 'day', 60);
    console.log('最近60天K线数据:', kline);
    
  } catch (error) {
    console.error('获取数据失败:', error);
    // 失败时自动切换到模拟数据
    dataSource.setSourceType('mock');
    const quotes = await dataSource.getRealtimeQuote(['600519']);
    console.log('使用模拟数据:', quotes);
  }
}

example();
```

---

## 📊 数据接口说明

### RealtimeQuote（实时行情）

```typescript
interface RealtimeQuote {
  code: string;           // 股票代码
  name: string;           // 股票名称
  price: number;          // 当前价格
  preClose: number;       // 昨收价
  open: number;           // 开盘价
  high: number;           // 最高价
  low: number;            // 最低价
  volume: number;         // 成交量
  amount: number;         // 成交额
  bidPrice: number[];     // 买五价
  bidVolume: number[];    // 买五量
  askPrice: number[];     // 卖五价
  askVolume: number[];    // 卖五量
  timestamp: number;      // 时间戳
}
```

### KLineData（K线数据）

```typescript
interface KLineData {
  date: string;           // 日期
  open: number;           // 开盘价
  close: number;          // 收盘价
  high: number;           // 最高价
  low: number;            // 最低价
  volume: number;         // 成交量
  amount: number;         // 成交额
  change: number;         // 涨跌额
  changePercent: number;  // 涨跌幅
}
```

### StockData（股票数据）

```typescript
interface StockData {
  code: string;           // 股票代码
  name: string;           // 股票名称
  price: number;          // 当前价格
  change: number;         // 涨跌额
  changePercent: number;  // 涨跌幅
  volume: number;         // 成交量
  amount: number;         // 成交额
  high: number;           // 最高价
  low: number;            // 最低价
  open: number;           // 开盘价
  close: number;          // 收盘价
  timestamp: number;      // 时间戳
}
```

---

## 🔧 关于东方财富客户端

### 您的东方财富账户可以用来做什么？

✅ **可以做的：**
1. **在东方财富APP中交易** - 直接使用官方客户端进行实盘交易
2. **查看行情数据** - 使用东方财富客户端查看实时行情
3. **学习分析** - 使用东方财富的分析工具
4. **手动交易** - 根据本软件的AI建议，手动在东方财富交易

❌ **不建议做的：**
1. **尝试破解API** - 存在法律风险
2. **自动化实盘交易** - 不安全且可能违规
3. **大规模爬取数据** - 可能被封禁IP

---

## 💡 推荐使用方式

### 最佳实践流程：

1. **使用本软件进行分析**
   - 获取实时行情数据（新浪/腾讯API）
   - AI模型分析和预测
   - 生成交易建议

2. **在东方财富客户端验证**
   - 对比行情数据
   - 查看技术指标
   - 研究基本面

3. **手动决策和交易**
   - 根据综合分析做出决策
   - 在东方财富APP中手动交易
   - 记录交易结果

4. **回测和优化**
   - 使用模拟数据回测策略
   - 优化AI模型参数
   - 改进交易策略

---

## ⚠️ 风险提示

### 投资风险
1. **股市有风险** - 投资需谨慎
2. **AI建议仅供参考** - 不构成投资建议
3. **请自主决策** - 对自己的投资负责
4. **控制仓位** - 不要重仓一只股票
5. **设置止损** - 严格控制亏损

### 技术风险
1. **数据延迟** - 第三方数据源可能有延迟
2. **接口不稳定** - 免费接口可能随时变更
3. **缓存机制** - 注意数据刷新频率
4. **网络问题** - 确保网络连接稳定

---

## 🛠️ 故障排除

### 问题1：获取数据失败
**解决方案：**
- 检查网络连接
- 尝试切换数据源（sina → tencent → mock）
- 查看控制台错误信息

### 问题2：数据不更新
**解决方案：**
- 缓存时间30秒，等待刷新
- 或者切换数据源重置缓存
- 检查数据源是否正常

### 问题3：股票代码错误
**解决方案：**
- 沪市股票以6开头（600xxx）
- 深市股票以0或3开头（000xxx, 300xxx）
- 不需要加sh或sz前缀

---

## 📚 更多资源

- [新浪财经](https://finance.sina.com.cn/)
- [腾讯财经](https://finance.qq.com/)
- [东方财富网](https://www.eastmoney.com/)
- [雪球](https://xueqiu.com/)

---

## 🎉 总结

您现在拥有了一个功能完整的AI量化交易系统：

✅ **多种数据源** - 新浪、腾讯、模拟数据
✅ **实时行情** - 获取股票实时价格
✅ **K线数据** - 历史数据分析
✅ **AI模型** - 智能预测和建议
✅ **技术指标** - 完善的分析工具
✅ **风险可控** - 建议手动交易，AI辅助

**记住：AI是工具，决策在自己！投资有风险，入市需谨慎！**

