
// 简单调试脚本
import axios from 'axios';

async function testSinaAPI() {
    console.log('=== 测试新浪API ===');
    
    // 测试代码：带前缀和不带前缀
    const testCodes = ['sh600519', 'sz000858', '600519', '000858'];
    
    try {
        // 构造新浪API请求
        const sinaCodes = testCodes.map(code => {
            if (code.startsWith('sh') || code.startsWith('sz')) {
                return code;
            }
            return code.startsWith('6') ? `sh${code}` : `sz${code}`;
        }).join(',');
        
        console.log('请求代码:', sinaCodes);
        
        const response = await axios.get(`https://hq.sinajs.cn/list=${sinaCodes}`, {
            headers: {
                'Referer': 'https://finance.sina.com.cn/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 3000
        });
        
        console.log('API返回数据:');
        console.log(response.data);
        
        // 解析数据
        const lines = response.data.split('\n');
        for (const line of lines) {
            if (!line) continue;
            
            const codeMatch = line.match(/hq_str_([^\s]+)=/);
            if (!codeMatch) continue;
            
            const sinaCode = codeMatch[1];
            const match = line.match(/"([^"]+)"/);
            
            if (match) {
                const values = match[1].split(',');
                if (values.length >= 32) {
                    let code = sinaCode;
                    if (sinaCode.startsWith('sh')) {
                        code = sinaCode.substring(2);
                    } else if (sinaCode.startsWith('sz')) {
                        code = sinaCode.substring(2);
                    }
                    
                    const name = values[0];
                    const price = parseFloat(values[1]);
                    const change = parseFloat(values[1]) - parseFloat(values[2]);
                    const changePercent = ((parseFloat(values[1]) - parseFloat(values[2])) / parseFloat(values[2])) * 100;
                    
                    console.log(`\n股票: ${name} (${code})`);
                    console.log(`价格: ${price}`);
                    console.log(`涨跌幅: ${change.toFixed(2)} (${changePercent.toFixed(2)}%)`);
                }
            }
        }
        
    } catch (error) {
        console.error('请求失败:', error.message);
    }
}

testSinaAPI();
