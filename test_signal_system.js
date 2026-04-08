// 测试脚本：验证买卖提示信号系统的各个环节
const { getStockList, getBatchRealtimeQuote, getMainForceData, getTechnicalIndicators } = require('./dist/utils/stockData');
const { getMarketMonitor } = require('./dist/utils/marketMonitorManager');
const { getSignalManager } = require('./dist/utils/optimizedSignalManager');

async function testStockList() {
  console.log('=== 测试股票列表获取 ===');
  try {
    const stockList = await getStockList();
    console.log(`成功获取股票列表，数量: ${stockList.length}`);
    console.log(`前5只股票:`, stockList.slice(0, 5));
    return stockList;
  } catch (error) {
    console.error('获取股票列表失败:', error);
    return [];
  }
}

async function testRealtimeData(stockList) {
  console.log('\n=== 测试实时行情数据获取 ===');
  try {
    const testCodes = stockList.slice(0, 10).map(stock => stock.code);
    const quotes = await getBatchRealtimeQuote(testCodes);
    console.log(`成功获取实时行情数据，数量: ${quotes.length}`);
    if (quotes.length > 0) {
      console.log(`第一个股票数据:`, quotes[0]);
    }
    return quotes;
  } catch (error) {
    console.error('获取实时行情数据失败:', error);
    return [];
  }
}

async function testMainForceData(stockList) {
  console.log('\n=== 测试主力资金数据获取 ===');
  try {
    const testCodes = stockList.slice(0, 5).map(stock => stock.code);
    const mainForceData = await getMainForceData(testCodes);
    console.log(`成功获取主力资金数据，数量: ${mainForceData.length}`);
    if (mainForceData.length > 0) {
      console.log(`第一个股票主力资金数据:`, mainForceData[0]);
    }
    return mainForceData;
  } catch (error) {
    console.error('获取主力资金数据失败:', error);
    return [];
  }
}

async function testTechnicalIndicators(stockList) {
  console.log('\n=== 测试技术指标计算 ===');
  try {
    const testCode = stockList[0].code;
    const indicators = await getTechnicalIndicators(testCode);
    console.log(`成功获取技术指标数据:`);
    console.log('RSI:', indicators.rsi);
    console.log('MACD:', indicators.macd);
    console.log('KDJ:', indicators.kdj);
    return indicators;
  } catch (error) {
    console.error('获取技术指标失败:', error);
    return null;
  }
}

async function testSignalGeneration() {
  console.log('\n=== 测试信号生成 ===');
  try {
    const marketMonitor = getMarketMonitor();
    const status = await marketMonitor.getStatus();
    console.log('市场监控状态:', status);
    
    // 手动触发一次扫描
    await marketMonitor.performScan();
    
    // 获取生成的信号
    const signalManager = getSignalManager();
    const signals = signalManager.getSignalHistory();
    console.log(`生成的信号数量: ${signals.length}`);
    
    if (signals.length > 0) {
      console.log('最新的信号:', signals[0]);
    }
    
    return signals;
  } catch (error) {
    console.error('信号生成失败:', error);
    return [];
  }
}

async function runAllTests() {
  console.log('开始测试买卖提示信号系统...\n');
  
  // 1. 测试股票列表获取
  const stockList = await testStockList();
  
  if (stockList.length === 0) {
    console.log('股票列表获取失败，测试终止');
    return;
  }
  
  // 2. 测试实时行情数据获取
  await testRealtimeData(stockList);
  
  // 3. 测试主力资金数据获取
  await testMainForceData(stockList);
  
  // 4. 测试技术指标计算
  await testTechnicalIndicators(stockList);
  
  // 5. 测试信号生成
  await testSignalGeneration();
  
  console.log('\n测试完成！');
}

// 运行测试
runAllTests().catch(console.error);
