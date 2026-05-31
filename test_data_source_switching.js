
// 测试智盈AI系统数据源切换能力
import { getStockDataSource } from './src/utils/stockData.js';

async function testDataSourceSwitching() {
  console.log('=== 智盈AI系统数据源切换测试 ===');
  console.log('开始测试17个数据源的切换能力...\n');

  const dataSource = getStockDataSource('eastmoney');
  
  // 测试数据
  const stockCode = '301179';
  const stockCodeWithPrefix = 'SZ301179';
  
  // 测试所有数据源
  const allSources = [
    'sina', 'tencent', 'eastmoney', 'xueqiu', 'ths', 'huatai', 'gtja', 
    'haitong', 'wind', 'choice', 'tushare', 'akshare', 'baostock', 
    'gugudata', 'stockapi', 'mairui', 'alltick'
  ];
  
  const results = [];
  
  for (const source of allSources) {
    console.log(`正在测试数据源: ${source}`);
    
    try {
      // 切换数据源
      const switchSuccess = await dataSource.switchDataSource(source);
      
      if (switchSuccess) {
        // 测试获取股票数据
        const startTime = Date.now();
        const stockData = await dataSource.getRealtimeQuote(stockCode);
        const responseTime = Date.now() - startTime;
        
        if (stockData && stockData.price > 0) {
          results.push({
            source,
            status: '成功',
            price: stockData.price,
            changePercent: stockData.changePercent,
            responseTime: `${responseTime}ms`
          });
          console.log(`  ✓ 成功: 价格=${stockData.price}, 涨跌幅=${stockData.changePercent}%, 响应时间=${responseTime}ms`);
        } else {
          results.push({
            source,
            status: '失败',
            message: '获取数据为空'
          });
          console.log(`  ✗ 失败: 获取数据为空`);
        }
      } else {
        results.push({
          source,
          status: '失败',
          message: '数据源切换失败'
        });
        console.log(`  ✗ 失败: 数据源切换失败`);
      }
      
    } catch (error) {
      results.push({
        source,
        status: '错误',
        message: error.message
      });
      console.log(`  ✗ 错误: ${error.message}`);
    }
    
    console.log('');
  }
  
  // 输出测试总结
  console.log('=== 测试总结 ===');
  const successCount = results.filter(r => r.status === '成功').length;
  const totalCount = results.length;
  
  console.log(`总数据源数: ${totalCount}`);
  console.log(`成功数据源数: ${successCount}`);
  console.log(`成功率: ${(successCount / totalCount * 100).toFixed(2)}%`);
  
  console.log('\n详细结果:');
  results.forEach(result => {
    console.log(`${result.source}: ${result.status}${result.price ? ` (价格: ${result.price}, 响应时间: ${result.responseTime})` : ''}`);
  });
  
  // 测试故障转移能力
  console.log('\n=== 故障转移测试 ===');
  console.log('模拟当前数据源故障，测试自动切换能力...');
  
  try {
    // 先测试当前数据源
    const currentSource = dataSource.getSourceType();
    console.log(`当前数据源: ${currentSource}`);
    
    // 执行自动故障转移
    const newSource = await dataSource.autoFailover();
    console.log(`故障转移结果: 从 ${currentSource} 切换到 ${newSource}`);
    
  } catch (error) {
    console.log(`故障转移测试失败: ${error.message}`);
  }
  
  // 获取所有数据源健康状态
  console.log('\n=== 数据源健康状态 ===');
  const healthStatus = dataSource.getHealthStatus();
  console.log(JSON.stringify(healthStatus, null, 2));
  
  // 获取数据源性能统计
  console.log('\n=== 数据源性能统计 ===');
  const performanceStats = dataSource.getDataSourceSummary();
  console.log(JSON.stringify(performanceStats, null, 2));
  
  return results;
}

// 运行测试
testDataSourceSwitching().catch(console.error);
