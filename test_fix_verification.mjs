
// 验证修复效果的测试脚本
import { getMarketMonitor } from './src/utils/marketMonitorManager.js';
import { getStockDataSource } from './src/utils/stockData.js';

async function testFixVerification() {
    console.log('=== 验证监控股票数量修复效果 ===');
    
    try {
        // 测试股票列表获取
        console.log('1. 测试股票列表获取...');
        const stockDataSource = getStockDataSource();
        const stockList = await stockDataSource.getStockList();
        console.log(`   获取到股票数量: ${stockList.length}`);
        
        // 测试市场监控管理器
        console.log('\n2. 测试市场监控管理器...');
        const marketMonitor = getMarketMonitor();
        
        // 测试getStatus方法
        console.log('3. 测试getStatus方法...');
        const status = await marketMonitor.getStatus();
        console.log(`   监控股票数量: ${status.stockCount}`);
        console.log(`   市场状态: ${status.marketStatus}`);
        console.log(`   扫描状态: ${status.scanStatus}`);
        
        // 验证修复效果
        if (status.stockCount > 0) {
            console.log('\n✅ 修复成功！监控股票数量正确显示');
        } else {
            console.log('\n❌ 修复失败！监控股票数量仍为0');
        }
        
    } catch (error) {
        console.error('测试过程中出现错误:', error);
    }
}

// 运行测试
testFixVerification().catch(console.error);
