// 测试后端API是否正常返回股票数量
import { getStockDataSource } from './src/utils/stockData.js';
import { getMarketMonitor } from './src/utils/marketMonitorManager.js';

async function testBackendAPI() {
    console.log('=== 测试后端API ===');
    
    try {
        // 测试股票数据源
        console.log('1. 测试股票数据源 getStockList()...');
        const stockDataSource = getStockDataSource();
        const stockList = await stockDataSource.getStockList();
        console.log(`   股票列表数量: ${stockList.length}`);
        
        // 测试市场监控管理器
        console.log('\n2. 测试市场监控管理器 getStatus()...');
        const marketMonitor = getMarketMonitor();
        const status = await marketMonitor.getStatus();
        console.log(`   监控股票数量: ${status.stockCount}`);
        console.log(`   市场状态: ${status.marketStatus}`);
        console.log(`   扫描状态: ${status.scanStatus}`);
        
    } catch (error) {
        console.error('测试失败:', error);
    }
}

testBackendAPI();
