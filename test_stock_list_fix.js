
// 测试股票列表修复效果
import { getStockDataSource } from './src/utils/stockData.js';

async function testStockList() {
    console.log('开始测试股票列表修复...');
    
    try {
        // 获取股票数据源
        const dataSource = getStockDataSource();
        
        // 测试getStockList方法
        console.log('调用getStockList方法...');
        const stockList = await dataSource.getStockList();
        
        console.log(`获取到股票数量: ${stockList.length}只`);
        console.log(`前5只股票:`, stockList.slice(0, 5));
        
        if (stockList.length > 0) {
            console.log('✅ 修复成功！股票列表正常返回');
        } else {
            console.log('❌ 修复失败！股票列表为空');
        }
        
    } catch (error) {
        console.error('测试过程中发生错误:', error);
    }
}

testStockList();
