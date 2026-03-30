
// 测试市场监控管理器的扫描历史和股票数量
import MarketMonitorManager from './src/utils/marketMonitorManager.js';

async function testScanHistory() {
    console.log('=== 测试市场监控管理器扫描历史 ===');
    
    // 创建市场监控管理器实例
    const monitor = new MarketMonitorManager();
    
    console.log('初始状态:');
    console.log('  scanHistory长度:', monitor.scanHistory.length);
    console.log('  监控股票数量:', monitor.getStockCount());
    
    // 直接测试股票列表获取
    console.log('\n=== 直接测试股票列表获取 ===');
    const stockDataSource = monitor.stockDataSource;
    
    try {
        const stockList = await stockDataSource.getStockList();
        console.log(`获取到股票数量: ${stockList.length}`);
        
        // 手动设置scanHistory
        if (stockList.length > 0) {
            const now = Date.now();
            monitor.scanHistory.push({
                timestamp: now,
                totalStocks: stockList.length,
                processedStocks: 0,
                buySignals: 0,
                sellSignals: 0,
                duration: 0,
                status: 'success',
                dataSourceStatus: 'connected'
            });
            
            console.log('\n手动设置scanHistory后:');
            console.log('  scanHistory长度:', monitor.scanHistory.length);
            console.log('  监控股票数量:', monitor.getStockCount());
        }
        
    } catch (error) {
        console.error('获取股票列表失败:', error);
    }
}

// 运行测试
testScanHistory().catch(console.error);
