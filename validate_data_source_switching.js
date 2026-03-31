
// 验证智盈AI系统数据源切换能力
// 测试17个数据源的自由切换和稳定性

import { getStockDataSource } from './src/utils/stockData.js';

async function validateDataSourceSwitching() {
  console.log('=== 智盈AI系统数据源切换能力验证 ===');
  console.log('开始验证17个数据源的自由切换能力...\n');

  try {
    // 创建数据源实例
    const dataSource = getStockDataSource('eastmoney');
    
    // 测试数据：301179股票
    const stockCode = '301179';
    
    // 测试的数据源列表（17个）
    const testSources = [
      'sina', 'tencent', 'eastmoney', 'xueqiu', 'ths', 
      'huatai', 'gtja', 'haitong', 'wind', 'choice', 
      'tushare', 'akshare', 'baostock', 'gugudata', 
      'stockapi', 'mairui', 'alltick'
    ];
    
    const results = [];
    
    console.log('测试数据源切换和数据获取...\n');
    
    for (const source of testSources) {
      console.log(`正在测试: ${source}`);
      
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
    
    // 验证故障转移能力
    console.log('=== 故障转移能力验证 ===');
    console.log('测试自动故障转移机制...');
    
    try {
      const currentSource = dataSource.getSourceType();
      console.log(`当前数据源: ${currentSource}`);
      
      // 执行自动故障转移
      const newSource = await dataSource.autoFailover();
      console.log(`故障转移结果: 从 ${currentSource} 切换到 ${newSource}`);
      
    } catch (error) {
      console.log(`故障转移测试失败: ${error.message}`);
    }
    
    // 验证智能优化功能
    console.log('\n=== 智能优化验证 ===');
    console.log('测试智能数据源选择...');
    
    try {
      // 获取最佳数据源
      const optimalSource = await dataSource.enhancedAutoFailover();
      console.log(`智能选择的最佳数据源: ${optimalSource}`);
      
    } catch (error) {
      console.log(`智能优化测试失败: ${error.message}`);
    }
    
    // 输出验证结果
    console.log('\n=== 验证结果汇总 ===');
    const successCount = results.filter(r => r.status === '成功').length;
    const totalCount = results.length;
    
    console.log(`总数据源数: ${totalCount}`);
    console.log(`成功数据源数: ${successCount}`);
    console.log(`成功率: ${(successCount / totalCount * 100).toFixed(2)}%`);
    
    console.log('\n详细结果:');
    results.forEach(result => {
      console.log(`${result.source}: ${result.status}${result.price ? ` (价格: ${result.price}, 涨跌幅: ${result.changePercent}%, 响应时间: ${result.responseTime})` : ''}`);
    });
    
    // 获取系统状态
    console.log('\n=== 系统状态 ===');
    const healthStatus = dataSource.getHealthStatus();
    console.log(JSON.stringify(healthStatus, null, 2));
    
    const performanceStats = dataSource.getDataSourceSummary();
    console.log('\n=== 性能统计 ===');
    console.log(JSON.stringify(performanceStats, null, 2));
    
    return {
      success: successCount > 0,
      successRate: (successCount / totalCount * 100).toFixed(2),
      results
    };
    
  } catch (error) {
    console.error('验证过程中出现错误:', error);
    return { success: false, error: error.message };
  }
}

// 运行验证
validateDataSourceSwitching().then(result => {
  console.log('\n=== 验证完成 ===');
  console.log(`验证结果: ${result.success ? '成功' : '失败'}`);
  if (result.successRate) {
    console.log(`成功率: ${result.successRate}%`);
  }
}).catch(console.error);
