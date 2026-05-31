
import { getStockDataSource } from './src/utils/stockData.js';
import MarketMonitorManager from './src/utils/marketMonitorManager.js';

// 模拟浏览器环境
global.window = {
    localStorage: {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {}
    },
    location: {
        href: 'http://localhost:3000'
    }
};

async function debugMarketStatus() {
    console.log('=== 调试市场监控状态 ===');
    
    // 获取当前时间
    const now = new Date();
    console.log(`当前时间: ${now.toLocaleString('zh-CN')}`);
    
    // 检查市场状态
    const monitor = new MarketMonitorManager();
    const marketStatus = monitor.checkMarketStatus();
    console.log(`市场状态: ${marketStatus}`);
    
    // 获取股票数据源
    const stockDataSource = getStockDataSource();
    
    // 测试股票列表获取
    try {
        console.log('开始获取股票列表...');
        const stockList = await stockDataSource.getStockList();
        console.log(`获取到股票数量: ${stockList.length}`);
        if (stockList.length > 0) {
            console.log(`前5只股票:`, stockList.slice(0, 5));
        }
    } catch (error) {
        console.error('获取股票列表失败:', error);
    }
    
    // 测试扫描功能
    console.log('\n=== 开始测试扫描功能 ===');
    try {
        await monitor.performScan();
        console.log('扫描完成');
        console.log('扫描状态:', monitor.scanStatus);
        console.log('监控股票数量:', monitor.getStockCount());
        
        // 查看扫描历史
        if (monitor.scanHistory.length > 0) {
            const lastScan = monitor.scanHistory[monitor.scanHistory.length - 1];
            console.log('最后一次扫描:');
            console.log('  监控股票:', lastScan.totalStocks);
            console.log('  处理股票:', lastScan.processedStocks);
            console.log('  买入信号:', lastScan.buySignals);
            console.log('  卖出信号:', lastScan.sellSignals);
            console.log('  数据源状态:', lastScan.dataSourceStatus);
        }
    } catch (error) {
        console.error('扫描失败:', error);
    }
}

// 运行调试
debugMarketStatus().catch(console.error);
