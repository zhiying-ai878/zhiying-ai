
import { getRealtimeQuote } from './src/utils/stockData.js';

async function testDashboardData() {
    console.log('测试Dashboard组件调用的getRealtimeQuote函数...');
    
    const indexCodes = ['sh000001', 'sz399001', 'sz399006', 'sh000688'];
    console.log('获取指数代码:', indexCodes);
    
    try {
        const results = await getRealtimeQuote(indexCodes);
        console.log('获取到的指数数据:', JSON.stringify(results, null, 2));
        
        if (results && results.length > 0) {
            console.log('成功获取到', results.length, '个指数数据');
            
            // 详细检查每个指数的数据
            results.forEach(quote => {
                console.log(`详细检查 ${quote.name}: 代码=${quote.code}, 价格=${quote.price}, 涨跌幅=${quote.changePercent}%`);
                
                // 验证点位是否合理
                if (quote.code === 'sh000001' || quote.code === 'sh000688') {
                    if (quote.price > 1000 && quote.price< 5000) {
                        console.log('✅', quote.name, '点位显示正常:', quote.price);
                    } else {
                        console.log('❌', quote.name, '点位显示异常:', quote.price);
                    }
                }
            });
        } else {
            console.error('没有获取到指数数据');
        }
        
    } catch (error) {
        console.error('获取数据失败:', error.message);
    }
}

testDashboardData();
