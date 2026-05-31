
// 调试当前数据获取流程
import axios from 'axios';

async function debugCurrentData() {
    console.log('=== 调试当前数据获取流程 ===\n');
    
    try {
        // 测试指数数据
        const indexCodes = ['sh000001', 'sh000688'];
        console.log('请求指数代码:', indexCodes);
        
        // 直接调用新浪API测试
        console.log('\n1. 测试新浪API:');
        const sinaCodes = indexCodes.join(',');
        const sinaResponse = await axios.get(`https://hq.sinajs.cn/list=${sinaCodes}`, {
            headers: {
                'Referer': 'https://finance.sina.com.cn/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        console.log('新浪API响应:', sinaResponse.data);
        
        // 解析新浪数据
        const lines = sinaResponse.data.split('\n');
        for (const line of lines) {
            if (!line) continue;
            
            const codeMatch = line.match(/hq_str_([^\s]+)=/);
            if (!codeMatch) continue;
            
            const sinaCode = codeMatch[1];
            const match = line.match(/"([^"]+)"/);
            if (match) {
                const values = match[1].split(',');
                if (values.length >= 32) {
                    const name = values[0];
                    const priceValue = parseFloat(values[1]);
                    const isIndex = sinaCode.startsWith('sh000') || sinaCode.startsWith('sz399');
                    const price = isIndex ? priceValue / 100 : priceValue;
                    
                    console.log(`${name} (${sinaCode}): 原始价格=${priceValue}, 处理后价格=${price}`);
                }
            }
        }
        
        // 测试腾讯API
        console.log('\n2. 测试腾讯API:');
        const tencentResponse = await axios.get(`https://qt.gtimg.cn/q=${sinaCodes}`);
        console.log('腾讯API响应:', tencentResponse.data);
        
        // 解析腾讯数据
        const tencentLines = tencentResponse.data.split('\n');
        for (const line of tencentLines) {
            if (!line) continue;
            
            const match = line.match(/v_(\w+)="([^"]+)"/);
            if (match) {
                const tencentCode = match[1];
                const values = match[2].split('~');
                if (values.length >= 30) {
                    const name = values[1];
                    const priceValue = parseFloat(values[3]);
                    const isIndex = tencentCode.startsWith('sh000') || tencentCode.startsWith('sz399');
                    const price = isIndex ? priceValue / 100 : priceValue;
                    
                    console.log(`${name} (${tencentCode}): 原始价格=${priceValue}, 处理后价格=${price}`);
                }
            }
        }
        
    } catch (error) {
        console.error('调试失败:', error.message);
    }
    
    console.log('\n=== 调试完成 ===');
}

debugCurrentData().catch(console.error);
