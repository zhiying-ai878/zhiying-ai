
import { StockDataSource } from './src/utils/stockData.js';

async function testChangePoints() {
    console.log('测试涨跌点数计算...');
    
    const dataSource = new StockDataSource('eastmoney_mini');
    
    // 测试上证指数（指数）
    console.log('\n测试上证指数 (sh000001)...');
    const shIndexResult = await dataSource.getEastMoneyMiniRealtimeQuote(['sh000001']);
    console.log('上证指数数据:', shIndexResult[0]);
    
    // 测试科创综指（指数）
    console.log('\n测试科创综指 (sh000688)...');
    const kcIndexResult = await dataSource.getEastMoneyMiniRealtimeQuote(['sh000688']);
    console.log('科创综指数据:', kcIndexResult[0]);
    
    // 测试股票（非指数）
    console.log('\n测试股票 (600519)...');
    const stockResult = await dataSource.getEastMoneyMiniRealtimeQuote(['600519']);
    console.log('股票数据:', stockResult[0]);
    
    // 测试指数代码识别
    console.log('\n指数代码识别测试:');
    console.log('sh000001 是指数:', dataSource.isIndexCode('sh000001'));
    console.log('000001 是指数:', dataSource.isIndexCode('000001'));
    console.log('sh000688 是指数:', dataSource.isIndexCode('sh000688'));
    console.log('000688 是指数:', dataSource.isIndexCode('000688'));
    console.log('600519 是指数:', dataSource.isIndexCode('600519'));
    console.log('002594 是指数:', dataSource.isIndexCode('002594'));
}

testChangePoints().catch(console.error);
