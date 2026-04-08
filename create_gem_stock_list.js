// 创建创业板股票列表（300001-301800）
import fs from 'fs';
import path from 'path';

// 创建创业板股票列表
function createGemStockList() {
    const stockList = [];
    
    // 生成创业板股票代码：300001-301800
    for (let i = 300001; i <= 301800; i++) {
        const code = i.toString();
        stockList.push({
            code: code,
            name: `股票${code}`,
            industry: '未知',
            market: '深圳证券交易所',
            type: 'stock'
        });
    }
    
    const stockListPath = path.join(process.cwd(), 'src', 'utils', 'stockList.json');
    
    try {
        fs.writeFileSync(stockListPath, JSON.stringify(stockList, null, 2));
        console.log('✓ 成功创建创业板股票列表文件:', stockListPath);
        console.log(`✓ 股票列表包含 ${stockList.length} 只创业板股票`);
        console.log(`✓ 股票代码范围: 300001 - 301800`);
        
        // 验证部分股票是否在列表中
        const testCodes = ['300001', '300900', '301800'];
        testCodes.forEach(code => {
            const stock = stockList.find(s => s.code === code);
            if (stock) {
                console.log(`✓ 股票${code}已包含在列表中`);
            } else {
                console.log(`✗ 股票${code}不在列表中`);
            }
        });
        
    } catch (error) {
        console.error('创建股票列表文件失败:', error.message);
    }
}

createGemStockList();