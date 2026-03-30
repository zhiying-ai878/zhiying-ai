
// 测试自选股删除和指数数据问题
import { getWatchlist, saveWatchlist, removeFromWatchlist } from './src/utils/storage.js';
import { getRealtimeQuote } from './src/utils/stockData.js';

async function testWatchlistRemove() {
    console.log('=== 测试自选股删除功能 ===');
    
    // 获取当前自选股
    const watchlist = getWatchlist();
    console.log('当前自选股:', watchlist);
    
    if (watchlist.length > 0) {
        const stockToRemove = watchlist[0];
        console.log(`准备删除股票: ${stockToRemove.name}(${stockToRemove.code})`);
        
        // 删除股票
        const result = removeFromWatchlist(stockToRemove.code);
        console.log('删除结果:', result);
        
        // 再次获取自选股
        const updatedWatchlist = getWatchlist();
        console.log('删除后自选股:', updatedWatchlist);
        
        // 验证是否删除成功
        const stillExists = updatedWatchlist.some(s => s.code === stockToRemove.code);
        if (!stillExists) {
            console.log('✅ 自选股删除成功！');
        } else {
            console.log('❌ 自选股删除失败！');
        }
    } else {
        console.log('自选股列表为空，无法测试删除功能');
    }
}

async function testIndexData() {
    console.log('\n=== 测试指数数据获取 ===');
    
    const indexCodes = ['sh000001', 'sz399001', 'sz399006', 'sh000688'];
    
    try {
        console.log('开始获取指数数据...');
        const results = await getRealtimeQuote(indexCodes);
        console.log('获取到的指数数据:', JSON.stringify(results, null, 2));
        
        results.forEach(quote => {
            console.log(`${quote.name}(${quote.code}): ${quote.price} 点, 涨跌幅: ${quote.changePercent}%`);
            
            // 检查指数数值是否合理
            if (quote.code === 'sh000001' && quote.price < 2000) {
                console.log(`⚠️  上证指数数值异常: ${quote.price}（正常应该在3000左右）`);
            }
            if (quote.code === 'sh000688' && quote.price < 1000) {
                console.log(`⚠️  科创综指数值异常: ${quote.price}（正常应该在1000以上）`);
            }
        });
        
    } catch (error) {
        console.error('获取指数数据失败:', error);
    }
}

// 运行测试
async function runTests() {
    await testWatchlistRemove();
    await testIndexData();
}

runTests();
