
// 简单测试股票列表获取功能
import fs from 'fs';
import path from 'path';

// 直接读取本地股票列表文件
const stockListPath = path.join('src', 'utils', 'stockList.json');

console.log('=== 测试股票列表获取 ===');
console.log(`读取文件: ${stockListPath}`);

try {
    const data = fs.readFileSync(stockListPath, 'utf8');
    const stockList = JSON.parse(data);
    console.log(`成功加载股票数量: ${stockList.length}`);
    
    if (stockList.length > 0) {
        console.log('前5只股票:');
        stockList.slice(0, 5).forEach((stock, index) => {
            console.log(`${index + 1}. ${stock.code} - ${stock.name}`);
        });
    }
    
    // 检查股票代码格式
    const invalidCodes = stockList.filter(stock => !stock.code || typeof stock.code !== 'string');
    if (invalidCodes.length > 0) {
        console.log(`发现 ${invalidCodes.length} 个无效股票代码`);
    } else {
        console.log('所有股票代码格式正确');
    }
    
} catch (error) {
    console.error('读取股票列表失败:', error.message);
}
