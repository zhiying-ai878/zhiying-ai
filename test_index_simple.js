
// 简化的指数数据测试脚本
import { getStockDataSource } from './src/utils/stockData.js';

async function testIndexData() {
    console.log('=== 测试指数数据获取 ===');
    
    try {
        const dataSource = getStockDataSource();
        
        // 测试上证指数和科创综指
        const indexCodes = ['sh000001', 'sh000688', 'sz399001', 'sz399006'];
        
        console.log('正在获取指数数据:', indexCodes);
        
        const results = await dataSource.getRealtimeQuote(indexCodes);
        
        console.log('获取到的指数数据:');
        results.forEach(quote => {
            console.log(`代码: ${quote.code}, 名称: ${quote.name}, 价格: ${quote.price}, 涨跌幅: ${quote.changePercent}%`);
        });
        
        // 检查数据质量
        console.log('\n=== 数据质量检查 ===');
        results.forEach(quote => {
            console.log(`${quote.name}: ${quote.price}`);
            if (quote.price < 100 && (quote.code === 'sh000001' || quote.code === 'sh000688')) {
                console.log(`⚠️  数据异常: ${quote.name} 价格 ${quote.price} 过低，可能未正确处理指数数据`);
            }
        });
        
    } catch (error) {
        console.error('测试失败:', error);
        console.error('错误详情:', JSON.stringify(error, null, 2));
    }
}

testIndexData();

