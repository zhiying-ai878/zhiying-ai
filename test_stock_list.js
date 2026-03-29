import { getStockDataSource } from './src/utils/stockData.js';

async function testStockList() {
    console.log('测试股票列表获取...');
    
    try {
        const dataSource = getStockDataSource();
        
        console.log('调用getStockList方法...');
        const stockList = await dataSource.getStockList();
        
        console.log(`获取到 ${stockList.length} 只股票`);
        
        if (stockList.length > 0) {
            console.log('前10只股票:');
            stockList.slice(0, 10).forEach((stock, index) => {
                console.log(`${index + 1}. ${stock.code} - ${stock.name}`);
            });
        } else {
            console.log('未获取到股票列表数据');
        }
        
    } catch (error) {
        console.error('获取股票列表失败:', error.message);
        if (error.response) {
            console.error('响应状态:', error.response.status);
            console.error('响应数据:', error.response.data);
        }
    }
}

testStockList();