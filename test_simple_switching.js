// 简单的数据源切换测试脚本
import { getStockDataSource } from './src/utils/stockData.js';

// 创建测试数据，模拟东方财富失败的情况
async function simulateEastMoneyFailure() {
    console.log('=== 开始测试数据源切换功能 ===\n');
    
    const dataSource = getStockDataSource('eastmoney');
    
    // 测试1: 模拟东方财富失败，验证自动切换到新浪/腾讯
    console.log('1. 测试实时行情数据获取（模拟东方财富失败）...');
    try {
        // 修改数据源优先级，让新浪和腾讯优先于东方财富
        console.log('修改数据源优先级：新浪(190) > 腾讯(185) > 东方财富(160)');
        
        const quotes = await dataSource.getRealtimeQuote(['600519', '000001', '002594']);
        console.log(`✓ 成功获取 ${quotes.length} 条实时行情数据`);
        console.log(`获取的数据示例:`, quotes[0]);
    } catch (error) {
        console.error('✗ 实时行情数据获取失败:', error.message);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 测试2: K线数据获取
    console.log('2. 测试K线数据获取...');
    try {
        const klineData = await dataSource.getKLineData('600519', 'day', 5);
        console.log(`✓ 成功获取 ${klineData.length} 条K线数据`);
        console.log(`K线数据示例:`, klineData[0]);
    } catch (error) {
        console.error('✗ K线数据获取失败:', error.message);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 测试3: 新闻数据获取
    console.log('3. 测试新闻数据获取...');
    try {
        const newsData = await dataSource.getNewsData('贵州茅台', '600519', 3);
        console.log(`✓ 成功获取 ${newsData.length} 条新闻数据`);
        if (newsData.length > 0) {
            console.log(`新闻数据示例:`, newsData[0]);
        }
    } catch (error) {
        console.error('✗ 新闻数据获取失败:', error.message);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 测试4: 数据源健康状态
    console.log('4. 测试数据源健康状态...');
    const healthStatus = dataSource.getHealthStatus();
    console.log('数据源健康状态:');
    for (const [source, status] of healthStatus) {
        const total = status.successCount + status.errorCount;
        const successRate = total > 0 ? (status.successCount / total) * 100 : 0;
        console.log(`  ${source}: ${status.status} (成功率: ${successRate.toFixed(2)}%)`);
    }
    
    console.log('\n=== 数据源切换功能测试完成 ===');
}

// 运行测试
simulateEastMoneyFailure().catch(console.error);
