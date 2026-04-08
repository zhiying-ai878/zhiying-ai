
import { getStockDataSource, scanAllStocks } from './src/utils/stockData.js';

async function testScanFunction() {
    console.log('开始测试扫描功能...');
    
    try {
        // 获取数据源实例
        const dataSource = getStockDataSource();
        console.log('当前数据源类型:', dataSource.getSourceType());
        
        // 测试获取股票列表
        console.log('测试获取股票列表...');
        const stockList = await dataSource.getStockList();
        console.log(`获取到 ${stockList.length} 只股票`);
        
        // 测试扫描功能（使用小批量测试）
        console.log('测试扫描功能...');
        const startTime = Date.now();
        const quotes = await scanAllStocks(20); // 只扫描20只股票
        const endTime = Date.now();
        
        console.log(`扫描完成，耗时 ${endTime - startTime}ms`);
        console.log(`成功获取 ${quotes.length} 只股票的行情数据`);
        
        // 显示前5只股票的信息
        console.log('前5只股票信息:');
        quotes.slice(0, 5).forEach(quote => {
            console.log(`${quote.code} ${quote.name}: ${quote.price}元, 涨跌幅: ${quote.changePercent.toFixed(2)}%`);
        });
        
    } catch (error) {
        console.error('扫描测试失败:', error.message);
        if (error.stack) {
            console.error(error.stack);
        }
    }
}

testScanFunction();
