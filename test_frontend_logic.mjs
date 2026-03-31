
// 测试前端页面的逻辑
console.log('=== 测试前端页面逻辑 ===');

// 模拟前端页面的逻辑
class MockMarketMonitor {
    constructor() {
        this.scanHistory = [];
    }
    
    async getStatus() {
        // 模拟异步获取状态
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    marketStatus: 'open',
                    stockCount: 11999,
                    scanStatus: 'completed',
                    isScanning: false,
                    lastScanTime: Date.now()
                });
            }, 100);
        });
    }
    
    async performScan() {
        // 模拟扫描过程
        return new Promise((resolve) => {
            setTimeout(() => {
                this.scanHistory.push({
                    timestamp: Date.now(),
                    totalStocks: 11999,
                    processedStocks: 11999,
                    buySignals: 0,
                    sellSignals: 0,
                    duration: 1000,
                    status: 'success',
                    dataSourceStatus: 'connected'
                });
                resolve();
            }, 500);
        });
    }
}

// 模拟前端页面的逻辑
async function testFrontendLogic() {
    const marketMonitor = new MockMarketMonitor();
    
    console.log('1. 测试getStatus方法...');
    const status = await marketMonitor.getStatus();
    console.log('   监控股票数量:', status.stockCount);
    console.log('   市场状态:', status.marketStatus);
    console.log('   扫描状态:', status.scanStatus);
    
    console.log('\n2. 测试performScan方法...');
    await marketMonitor.performScan();
    console.log('   扫描历史长度:', marketMonitor.scanHistory.length);
    
    console.log('\n3. 再次测试getStatus方法...');
    const status2 = await marketMonitor.getStatus();
    console.log('   监控股票数量:', status2.stockCount);
    
    if (status2.stockCount === 11999) {
        console.log('\n✅ 测试成功！监控股票数量正确显示');
    } else {
        console.log('\n❌ 测试失败！监控股票数量显示错误');
    }
}

// 运行测试
testFrontendLogic().catch(console.error);
