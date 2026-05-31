
// 测试指数数据修复
import { getRealtimeQuote } from './src/utils/stockData.js';

async function testIndexFix() {
    console.log('=== 测试指数数据修复 ===\n');
    
    const indexCodes = ['sh000001', 'sh000688'];
    
    try {
        console.log('获取指数数据:', indexCodes);
        const results = await getRealtimeQuote(indexCodes);
        
        console.log('\n获取到的指数数据:');
        results.forEach(result => {
            console.log(`${result.name} (${result.code}): 价格=${result.price}, 涨跌幅=${result.changePercent}%`);
            
            // 验证价格是否合理
            if (result.code === 'sh000001' || result.code === '000001') {
                if (result.price > 3000 && result.price < 5000) {
                    console.log('✅ 上证指数价格显示正常:', result.price);
                } else {
                    console.log('❌ 上证指数价格显示异常:', result.price);
                }
            } else if (result.code === 'sh000688' || result.code === '000688') {
                if (result.price > 1000 && result.price < 2000) {
                    console.log('✅ 科创综指价格显示正常:', result.price);
                } else {
                    console.log('❌ 科创综指价格显示异常:', result.price);
                }
            }
        });
        
        console.log(`\n成功获取 ${results.length}/${indexCodes.length} 条数据`);
        
    } catch (error) {
        console.error('获取数据失败:', error.message);
    }
    
    console.log('\n=== 测试完成 ===');
}

testIndexFix().catch(console.error);
