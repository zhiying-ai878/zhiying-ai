
import { getStockDataSource } from './src/utils/stockData.js';

async function testIndexData() {
    console.log('=== 测试指数数据 ===');
    
    const dataSource = getStockDataSource();
    
    // 测试上证指数
    console.log('测试上证指数 (sh000001)...');
    try {
        const shIndexData = await dataSource.getEastMoneyMiniRealtimeQuote(['sh000001']);
        console.log('上证指数数据:', shIndexData);
    } catch (error) {
        console.error('获取上证指数失败:', error.message);
    }
    
    // 测试科创综指
    console.log('\n测试科创综指 (sh000688)...');
    try {
        const sciIndexData = await dataSource.getEastMoneyMiniRealtimeQuote(['sh000688']);
        console.log('科创综指数据:', sciIndexData);
    } catch (error) {
        console.error('获取科创综指失败:', error.message);
    }
    
    // 测试股票数据
    console.log('\n测试股票数据 (600519)...');
    try {
        const stockData = await dataSource.getEastMoneyMiniRealtimeQuote(['600519']);
        console.log('股票数据:', stockData);
    } catch (error) {
        console.error('获取股票数据失败:', error.message);
    }
    
    // 测试指数代码识别
    console.log('\n测试指数代码识别:');
    const testCodes = ['sh000001', '000001', 'sh000688', '000688', '600519', '000001'];
    testCodes.forEach(code => {
        console.log(`${code}: ${dataSource.isIndexCode(code)}`);
    });
}

testIndexData().catch(console.error);
