
// 简单测试脚本验证修复效果
import fs from 'fs';
import path from 'path';

// 直接测试股票列表文件
async function testStockList() {
    console.log('=== 测试股票列表文件 ===');
    const stockListPath = path.join('src', 'utils', 'stockList.json');
    
    try {
        const data = fs.readFileSync(stockListPath, 'utf8');
        const stockList = JSON.parse(data);
        console.log(`股票列表文件包含 ${stockList.length} 只股票`);
        
        if (stockList.length > 0) {
            console.log('前5只股票:');
            stockList.slice(0, 5).forEach((stock, index) => {
                console.log(`${index + 1}. ${stock.code} - ${stock.name}`);
            });
        }
        
        return stockList.length;
    } catch (error) {
        console.error('读取股票列表文件失败:', error.message);
        return 0;
    }
}

// 运行测试
testStockList().then(count => {
    console.log(`\n测试结果: ${count > 0 ? '成功' : '失败'}`);
    process.exit(0);
}).catch(error => {
    console.error('测试失败:', error);
    process.exit(1);
});
