// 测试自选股删除和指数数据问题
const { getWatchlist, saveWatchlist, removeFromWatchlist } = require('./src/utils/storage');
const { getStockDataSource } = require('./src/utils/stockData');

async function testWatchlist() {
    console.log('=== 测试自选股删除功能 ===');
    
    // 获取当前自选股
    const currentWatchlist = getWatchlist();
    console.log('当前自选股:', JSON.stringify(currentWatchlist, null, 2));
    
    // 如果有自选股，尝试删除第一个
    if (currentWatchlist.length > 0) {
        const stockToRemove = currentWatchlist[0];
        console.log(`尝试删除股票: ${stockToRemove.name}(${stockToRemove.code})`);
        
        const result = removeFromWatchlist(stockToRemove.code);
        console.log('删除结果:', result);
        
        // 再次获取自选股，验证是否删除成功
        const updatedWatchlist = getWatchlist();
        console.log('删除后的自选股:', JSON.stringify(updatedWatchlist, null, 2));
        
        if (!updatedWatchlist.find(s => s.code === stockToRemove.code)) {
            console.log('✓ 自选股删除成功');
        } else {
            console.log('✗ 自选股删除失败');
        }
    } else {
        console.log('当前没有自选股，无法测试删除功能');
    }
}

async function testIndexData() {
    console.log('\n=== 测试指数数据 ===');
    
    const stockDataSource = getStockDataSource();
    
    // 测试上证指数和科创50指数
    const indexCodes = ['sh000001', 'sh000688'];
    
    try {
        const results = await stockDataSource.getRealtimeQuote(indexCodes);
        console.log('获取到的指数数据:', JSON.stringify(results, null, 2));
        
        results.forEach(quote => {
            console.log(`\n${quote.name}(${quote.code}):`);
            console.log(`  价格: ${quote.price}`);
            console.log(`  涨跌幅: ${quote.changePercent}%`);
            
            // 检查指数价格是否合理
            if (quote.code === 'sh000001' || quote.code === '000001') {
                if (quote.price < 1000) {
                    console.log('  ⚠️  上证指数价格异常，可能需要除以100');
                    console.log(`  修正后价格: ${quote.price * 100}`);
                }
            } else if (quote.code === 'sh000688' || quote.code === '000688') {
                if (quote.price < 1000) {
                    console.log('  ⚠️  科创综指价格异常，可能需要除以100');
                    console.log(`  修正后价格: ${quote.price * 100}`);
                }
            }
        });
        
    } catch (error) {
        console.error('获取指数数据失败:', error);
    }
}

// 运行测试
(async () => {
    await testWatchlist();
    await testIndexData();
})();
