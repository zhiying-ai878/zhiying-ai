
import { getMarketMonitor } from './src/utils/marketMonitorManager.js';
import { getStockDataSource } from './src/utils/stockData.js';

async function testMarketMonitor() {
    console.log('=== 市场监控系统调试 ===');
    
    // 获取市场监控实例
    const marketMonitor = getMarketMonitor();
    
    // 检查当前时间和市场状态
    const now = new Date();
    console.log('当前时间:', now.toLocaleString('zh-CN'));
    
    const marketStatus = marketMonitor.checkMarketStatus();
    console.log('市场状态:', marketStatus);
    
    // 检查监控器状态
    const monitorStatus = marketMonitor.getStatus();
    console.log('监控器状态:', {
        enabled: monitorStatus.enabled,
        marketStatus: monitorStatus.marketStatus,
        stockCount: monitorStatus.stockCount,
        lastScanTime: monitorStatus.lastScanTime ? new Date(monitorStatus.lastScanTime).toLocaleString('zh-CN') : null,
        isScanning: monitorStatus.isScanning,
        scanStatus: monitorStatus.scanStatus,
        activeScans: monitorStatus.activeScans
    });
    
    // 检查定时器状态
    console.log('扫描定时器:', marketMonitor.scanTimer ? '已启动' : '未启动');
    
    // 检查数据源状态
    const stockDataSource = getStockDataSource();
    const currentSource = stockDataSource.getSourceType();
    const healthStatus = stockDataSource.getHealthStatus();
    const sourceHealth = healthStatus instanceof Map ? healthStatus.get(currentSource) : null;
    console.log('当前数据源:', currentSource);
    console.log('数据源健康状态:', sourceHealth?.status || 'unknown');
    
    // 尝试获取股票列表
    console.log('尝试获取股票列表...');
    try {
        const stockList = await stockDataSource.getStockList();
        console.log('获取到股票数量:', stockList.length);
    } catch (error) {
        console.error('获取股票列表失败:', error.message);
    }
    
    // 尝试执行一次扫描
    console.log('尝试执行扫描...');
    try {
        await marketMonitor.performScan();
        
        // 再次检查状态
        const newStatus = marketMonitor.getStatus();
        console.log('扫描后的状态:', {
            isScanning: newStatus.isScanning,
            scanStatus: newStatus.scanStatus,
            lastScanTime: newStatus.lastScanTime ? new Date(newStatus.lastScanTime).toLocaleString('zh-CN') : null,
            scanHistory: newStatus.scanHistory.slice(-3).map(h => ({
                timestamp: new Date(h.timestamp).toLocaleTimeString('zh-CN'),
                status: h.status,
                dataSourceStatus: h.dataSourceStatus,
                totalStocks: h.totalStocks,
                processedStocks: h.processedStocks,
                buySignals: h.buySignals,
                sellSignals: h.sellSignals,
                duration: h.duration
            }))
        });
    } catch (error) {
        console.error('扫描执行失败:', error.message);
    }
}

testMarketMonitor().catch(console.error);
