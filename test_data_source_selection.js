
import axios from 'axios';

async function testDataSourceSelection() {
    console.log('测试不同数据源的指数数据处理...');
    
    // 测试不同代码的数据源选择
    const indexes = [
        { code: 'sh000001', name: '上证指数', expected: '3900+' },
        { code: 'sh000688', name: '科创综指', expected: '1300+' },
        { code: 'sz399001', name: '深证成指', expected: '13000+' },
        { code: 'sz399006', name: '创业板指', expected: '3000+' }
    ];
    
    // 测试新浪数据源
    console.log('\n=== 测试新浪数据源 ===');
    for (const index of indexes) {
        try {
            const sinaCode = index.code.startsWith('sh') || index.code.startsWith('sz') ? index.code : 
                            index.code.startsWith('6') || index.code.startsWith('000') ? `sh${index.code}` : `sz${index.code}`;
            
            const response = await axios.get(`https://hq.sinajs.cn/list=${sinaCode}`, {
                headers: {
                    'Referer': 'https://finance.sina.com.cn/',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                },
                timeout: 5000
            });
            
            const lines = response.data.split('\n');
            for (const line of lines) {
                if (line) {
                    const match = line.match(/"([^"]+)"/);
                    if (match) {
                        const values = match[1].split(',');
                        if (values.length >= 32) {
                            const price = parseFloat(values[1]);
                            console.log(`${index.name} (${index.code}) - 新浪数据源: ${price} (期望: ${index.expected})`);
                        }
                    }
                }
            }
        } catch (error) {
            console.error(`${index.name} 新浪数据源测试失败:`, error.message);
        }
    }
    
    // 测试腾讯数据源
    console.log('\n=== 测试腾讯数据源 ===');
    for (const index of indexes) {
        try {
            const tencentCode = index.code.startsWith('sh') || index.code.startsWith('sz') ? index.code : 
                              index.code.startsWith('6') || index.code.startsWith('000') ? `sh${index.code}` : `sz${index.code}`;
            
            const response = await axios.get(`https://qt.gtimg.cn/q=${tencentCode}`, {
                headers: {
                    'Referer': 'https://finance.qq.com/',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                },
                timeout: 5000
            });
            
            const lines = response.data.split('\n');
            for (const line of lines) {
                if (line) {
                    const match = line.match(/v_(\w+)="([^"]+)"/);
                    if (match) {
                        const values = match[2].split('~');
                        if (values.length >= 30) {
                            const price = parseFloat(values[3]);
                            console.log(`${index.name} (${index.code}) - 腾讯数据源: ${price} (期望: ${index.expected})`);
                        }
                    }
                }
            }
        } catch (error) {
            console.error(`${index.name} 腾讯数据源测试失败:`, error.message);
        }
    }
    
    console.log('\n=== 测试完成 ===');
}

testDataSourceSelection();
