
// 简单测试脚本，检查指数数据获取 - ES模块版本

import axios from 'axios';

async function testIndexData() {
    console.log('=== 指数数据测试 ===');
    console.log('时间:', new Date().toLocaleString());
    
    // 测试腾讯API（从代码中看到腾讯API能正常返回数据）
    const indexCodes = ['sh000001', 'sz399001', 'sz399006', 'sh000688'];
    const tencentCodes = indexCodes.join(',');
    
    try {
        console.log('测试腾讯API...');
        const response = await axios.get(`https://qt.gtimg.cn/q=${tencentCodes}`, {
            headers: {
                'Referer': 'https://finance.qq.com/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 3000
        });
        
        console.log('腾讯API响应:', response.data);
        
        // 解析数据
        const lines = response.data.split('\n');
        const results = [];
        
        for (const line of lines) {
            if (!line) continue;
            const match = line.match(/v_(\w+)="([^"]+)"/);
            if (match) {
                const tencentCode = match[1];
                const values = match[2].split('~');
                if (values.length >= 30) {
                    let code = tencentCode;
                    if (tencentCode.startsWith('sh')) {
                        code = tencentCode.substring(2);
                    } else if (tencentCode.startsWith('sz')) {
                        code = tencentCode.substring(2);
                    }
                    
                    const price = parseFloat(values[3]);
                    const change = parseFloat(values[3]) - parseFloat(values[4]);
                    const changePercent = ((parseFloat(values[3]) - parseFloat(values[4])) / parseFloat(values[4])) * 100;
                    
                    results.push({
                        code: tencentCode,
                        name: values[1],
                        price: price,
                        change: change,
                        changePercent: changePercent
                    });
                }
            }
        }
        
        console.log('\n解析后的指数数据:');
        results.forEach(item => {
            console.log(`${item.code} ${item.name}: ${item.price} (涨跌幅: ${item.changePercent.toFixed(2)}%)`);
        });
        
    } catch (error) {
        console.error('获取指数数据失败:', error.message);
    }
}

testIndexData();
