
// 测试市场监控管理器的扫描功能
import MarketMonitorManager from './src/utils/marketMonitorManager.js';

async function testMonitorScan() {
    console.log('=== 测试市场监控管理器扫描功能 ===');
    
    // 创建市场监控管理器实例
    const monitor = new MarketMonitorManager();
    
    // 检查初始状态
    console.log('初始状态:');
    console.log('  扫描状态:', monitor.scanStatus);
    console.log('  是否扫描中:', monitor.isScanning);
    console.log('  监控股票数量:', monitor.getStockCount());
    
    // 执行扫描
    console.log('\n开始执行扫描...');
    try {
        await monitor.performScan();
        
        console.log('\n扫描完成后状态:');
        console.log('  扫描状态:', monitor.scanStatus);
        console.log('  是否扫描中:', monitor.isScanning);
        console.log('  监控股票数量:', monitor.getStockCount());
        
        // 查看扫描历史
        if (monitor.scanHistory.length > 0) {
            const lastScan = monitor.scanHistory[monitor.scanHistory.length - 1];
            console.log('\n最后一次扫描详情:');
            console.log('  监控股票:', lastScan.totalStocks);
            console.log('  处理股票:', lastScan.processedStocks);
            console.log('  买入信号:', lastScan.buySignals);
            console.log('  卖出信号:', lastScan.sellSignals);
            console.log('  数据源状态:', lastScan.dataSourceStatus);
            console.log('  扫描状态:', lastScan.status);
        }
        
    } catch (error) {
        console.error('扫描失败:', error);
    }
}

// 运行测试
testMonitorScan().catch(console.error);
