
// 测试所有45个数据源的连接状态
// 验证智盈AI系统恢复完整数据源配置后的功能

import { getStockDataSource } from './src/utils/stockData.js';

async function testAllDataSources() {
  console.log('=== 智盈AI系统45个数据源连接测试 ===');
  console.log('开始验证所有45个数据源的连接状态...\n');

  try {
    // 创建数据源实例
    const dataSource = getStockDataSource('eastmoney');
    
    // 测试数据：301179股票
    const stockCode = '301179';
    
    // 所有45个数据源列表
    const allSources = [
      // 核心数据源
      'sina', 'tencent', 'eastmoney', 
      
      // 券商数据源
      'huatai', 'gtja', 'haitong', 
      
      // 专业金融数据源
      'wind', 'choice', 'tushare', 'akshare', 'baostock', 
      
      // API服务提供商
      'gugudata', 'stockapi', 'mairui', 'alltick', 'sanhulianghua', 'qveris', 
      
      // 国际数据源
      'finnhub', 'netease', 
      
      // 移动数据源
      'eastmoney_mobile', 'sina_mobile', 'tencent_mobile', 
      
      // 新闻数据源
      'jrj', 'hexun', 'stcn', 'yicai', 
      
      // 备用数据源
      'sina_backup', 'tencent_backup', 'eastmoney_backup', 
      
      // 扩展数据源
      'xueqiu', 'ths', 'eastmoney_mini', 'eastmoney_pro', 'futunn', 'tiger', 
      
      // 新闻数据源扩展
      'cnstock', 'financialnews', 'zqrb', 'cnstocknews', 
      'jrj_mobile', 'hexun_mobile', 'stcn_mobile', 'yicai_mobile', 
      
      // 最低优先级数据源
      'ths_backup', 'xueqiu_backup', 'backup_1'
    ];
    
    const results = [];
    let successCount = 0;
    let failCount = 0;
    let errorCount = 0;
    
    console.log(`总数据源数: ${allSources.length}`);
    console.log('开始逐个测试数据源...\n');
    
    for (const source of allSources) {
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
            successCount++;
            results.push({
              source,
              status: '成功',
              price: stockData.price,
              changePercent: stockData.changePercent,
              responseTime: `${responseTime}ms`
            });
            console.log(`  ✓ 成功: 价格=${stockData.price}, 涨跌幅=${stockData.changePercent}%, 响应时间=${responseTime}ms`);
          } else {
            failCount++;
            results.push({
              source,
              status: '失败',
              message: '获取数据为空'
            });
            console.log(`  ✗ 失败: 获取数据为空`);
          }
        } else {
          failCount++;
          results.push({
            source,
            status: '失败',
            message: '数据源切换失败'
          });
          console.log(`  ✗ 失败: 数据源切换失败`);
        }
        
      } catch (error) {
        errorCount++;
        results.push({
          source,
          status: '错误',
          message: error.message
        });
        console.log(`  ✗ 错误: ${error.message}`);
      }
      
      console.log('');
    }
    
    // 输出测试结果
    console.log('=== 测试结果汇总 ===');
    console.log(`总数据源数: ${allSources.length}`);
    console.log(`成功数据源数: ${successCount}`);
    console.log(`失败数据源数: ${failCount}`);
    console.log(`错误数据源数: ${errorCount}`);
    console.log(`成功率: ${(successCount / allSources.length * 100).toFixed(2)}%`);
    
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
      successRate: (successCount / allSources.length * 100).toFixed(2),
      successCount,
      failCount,
      errorCount,
      results
    };
    
  } catch (error) {
    console.error('测试过程中出现错误:', error);
    return { success: false, error: error.message };
  }
}

// 运行测试
testAllDataSources().then(result => {
  console.log('\n=== 测试完成 ===');
  console.log(`测试结果: ${result.success ? '成功' : '失败'}`);
  if (result.successRate) {
    console.log(`成功率: ${result.successRate}%`);
    console.log(`成功: ${result.successCount}, 失败: ${result.failCount}, 错误: ${result.errorCount}`);
  }
}).catch(console.error);
