
// 简单测试数据源切换功能
import { getStockDataSource } from './src/utils/stockData.js';

async function testDataSourceSwitching() {
  console.log('=== 智盈AI数据源切换测试 ===');
  
  try {
    // 创建数据源实例
    const dataSource = getStockDataSource('eastmoney');
    
    // 测试数据
    const stockCode = '301179';
    
    // 测试主要数据源
    const mainSources = ['eastmoney', 'tencent', 'sina', 'ths', 'xueqiu'];
    const results = [];
    
    console.log('\n开始测试主要数据源...');
    
    for (const source of mainSources) {
      try {
        console.log(`\n测试数据源: ${source}`);
        
        // 切换数据源
        const switchSuccess = await dataSource.switchDataSource(source);
        
        if (switchSuccess) {
          // 获取股票数据
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
    }
    
    // 输出测试结果
    console.log('\n=== 测试结果 ===');
    const successCount = results.filter(r => r.status === '成功').length;
    const totalCount = results.length;
    
    console.log(`总数据源数: ${totalCount}`);
    console.log(`成功数据源数: ${successCount}`);
    console.log(`成功率: ${(successCount / totalCount * 100).toFixed(2)}%`);
    
    console.log('\n详细结果:');
    results.forEach(result => {
      console.log(`${result.source}: ${result.status}${result.price ? ` (价格: ${result.price}, 涨跌幅: ${result.changePercent}%, 响应时间: ${result.responseTime})` : ''}`);
    });
    
    // 测试故障转移
    console.log('\n=== 故障转移测试 ===');
    try {
      const currentSource = dataSource.getSourceType();
      console.log(`当前数据源: ${currentSource}`);
      
      const newSource = await dataSource.autoFailover();
      console.log(`故障转移结果: 从 ${currentSource} 切换到 ${newSource}`);
      
    } catch (error) {
      console.log(`故障转移测试失败: ${error.message}`);
    }
    
    // 获取数据源状态
    console.log('\n=== 数据源状态 ===');
    const healthStatus = dataSource.getHealthStatus();
    console.log(JSON.stringify(healthStatus, null, 2));
    
  } catch (error) {
    console.error('测试过程中出现错误:', error);
  }
}

// 运行测试
testDataSourceSwitching().catch(console.error);
