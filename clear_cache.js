// 清理缓存和扫描历史的脚本
import fs from 'fs';
import path from 'path';

// 清理股票列表缓存
function clearStockListCache() {
    try {
        // 删除浏览器localStorage中的缓存（需要在浏览器控制台执行）
        console.log('请在浏览器控制台执行以下命令清除缓存:');
        console.log('localStorage.clear();');
        console.log('sessionStorage.clear();');
        console.log('location.reload();');
        
        // 清理Node.js缓存
        Object.keys(require.cache).forEach(key => {
            delete require.cache[key];
        });
        
        console.log('✓ 缓存清理指令已生成，请在浏览器控制台执行');
        
    } catch (error) {
        console.error('清理缓存失败:', error);
    }
}

// 验证股票列表
function verifyStockList() {
    try {
        const stockListPath = path.join(process.cwd(), 'src', 'utils', 'stockList.json');
        const stockListData = fs.readFileSync(stockListPath, 'utf8');
        const stockList = JSON.parse(stockListData);
        
        console.log(`✓ 股票列表验证成功:`);
        console.log(`  - 总数量: ${stockList.length}只`);
        console.log(`  - 第一个股票: ${stockList[0].code} (${stockList[0].name})`);
        console.log(`  - 最后一个股票: ${stockList[stockList.length - 1].code} (${stockList[stockList.length - 1].name})`);
        
        // 验证是否为创业板股票
        const gemStocks = stockList.filter(stock => stock.code.startsWith('300') || stock.code.startsWith('301'));
        console.log(`  - 创业板股票数量: ${gemStocks.length}只`);
        
        if (gemStocks.length === stockList.length) {
            console.log('✓ 所有股票均为创业板股票');
        } else {
            console.log('✗ 存在非创业板股票');
        }
        
    } catch (error) {
        console.error('验证股票列表失败:', error);
    }
}

console.log('=== 缓存清理工具 ===');
console.log('');
verifyStockList();
console.log('');
clearStockListCache();
console.log('');
console.log('操作完成！请在浏览器中按F5刷新页面，或在控制台执行上述命令。');