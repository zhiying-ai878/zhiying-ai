// 调试股票列表加载
import { getStockDataSource } from './src/utils/stockData.js';

async function debugStockList() {
    console.log('=== 开始调试股票列表 ===');
    
    try {
        const dataSource = getStockDataSource();
        console.log('获取数据源实例成功');
        
        console.log('开始获取股票列表...');
        const stockList = await dataSource.getStockList();
        console.log(`股票列表获取成功，共 ${stockList.length} 只股票`);
        console.log('前5只股票:', stockList.slice(0, 5));
        
    } catch (error) {
        console.error('股票列表获取失败:', error.message);
        console.error('错误详情:', error);
    }
}

debugStockList();
