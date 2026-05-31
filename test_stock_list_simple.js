
// 简单测试股票列表文件
import fs from 'fs';
import path from 'path';

async function testStockListFile() {
    console.log('开始测试股票列表文件...');
    
    try {
        const filePath = path.join(process.cwd(), 'src', 'utils', 'stockList.json');
        console.log(`检查文件路径: ${filePath}`);
        
        if (fs.existsSync(filePath)) {
            console.log('✅ stockList.json 文件存在');
            
            const content = fs.readFileSync(filePath, 'utf8');
            const stockList = JSON.parse(content);
            
            console.log(`获取到股票数量: ${stockList.length}只`);
            console.log(`前5只股票:`, stockList.slice(0, 5));
            
            if (stockList.length > 0) {
                console.log('✅ 股票列表文件正常');
            } else {
                console.log('❌ 股票列表文件为空');
            }
            
        } else {
            console.log('❌ stockList.json 文件不存在');
        }
        
    } catch (error) {
        console.error('测试过程中发生错误:', error);
    }
}

testStockListFile();
