
// 测试当前数据源获取的实时数据
import axios from 'axios';

// 直接测试各个数据源
async function testAllDataSources() {
    const testCodes = ['sh000001', 'sz399001', 'sz399006', 'sh000688'];
    
    console.log('=== 测试所有数据源 ===\n');
    
    for (const code of testCodes) {
        console.log(`\n=== 测试代码: ${code} ===`);
        
        // 测试东方财富数据源
        console.log('\n1. 东方财富数据源:');
        try {
            let secid;
            if (code.startsWith('sh')) {
                secid = `1.${code.substring(2)}`;
            } else if (code.startsWith('sz')) {
                secid = `0.${code.substring(2)}`;
            }
            
            const response = await axios.get('https://push2.eastmoney.com/api/qt/stock/get', {
                params: {
                    secid,
                    fields: 'f43,f44,f45,f46,f47,f48,f49,f50,f51,f52,f57,f58,f60,f169,f170',
                    _: Date.now().toString()
                },
                headers: {
                    'Referer': 'https://quote.eastmoney.com/',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'application/json, text/plain, */*',
                    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
                },
                timeout: 5000
            });
            
            if (response.data && response.data.data) {
                const data = response.data.data;
                const price = data.f43 / 100;
                console.log(`   价格: ${price}`);
                console.log(`   名称: ${data.f58}`);
            }
        } catch (error) {
            console.log(`   失败: ${error.message}`);
        }
        
        // 测试新浪数据源
        console.log('\n2. 新浪数据源:');
        try {
            const response = await axios.get(`https://hq.sinajs.cn/list=${code}`, {
                headers: {
                    'Referer': 'https://finance.sina.com.cn/',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': 'application/json, text/plain, */*',
                    'Accept-Language': 'zh-CN,zh;q=0.9',
                    'Connection': 'keep-alive'
                },
                timeout: 5000
            });
            
            const lines = response.data.split('\n');
            for (const line of lines) {
                if (!line) continue;
                
                const match = line.match(/"([^"]+)"/);
                if (match) {
                    const values = match[1].split(',');
                    if (values.length >= 32) {
                        // 修复后的字段映射
                        const price = parseFloat(values[3]);
                        const open = parseFloat(values[1]);
                        const close = parseFloat(values[2]);
                        console.log(`   价格: ${price}`);
                        console.log(`   开盘价: ${open}`);
                        console.log(`   昨收价: ${close}`);
                        console.log(`   名称: ${values[0]}`);
                        break;
                    }
                }
            }
        } catch (error) {
            console.log(`   失败: ${error.message}`);
        }
        
        // 测试腾讯数据源
        console.log('\n3. 腾讯数据源:');
        try {
            const response = await axios.get(`https://qt.gtimg.cn/q=${code}`, {
                headers: {
                    'Referer': 'https://finance.qq.com/',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': 'application/json, text/plain, */*',
                    'Accept-Language': 'zh-CN,zh;q=0.9',
                    'Connection': 'keep-alive'
                },
                timeout: 5000
            });
            
            const lines = response.data.split('\n');
            for (const line of lines) {
                if (!line) continue;
                
                const match = line.match(/v_(\w+)="([^"]+)"/);
                if (match) {
                    const values = match[2].split('~');
                    if (values.length >= 30) {
                        const price = parseFloat(values[3]);
                        console.log(`   价格: ${price}`);
                        console.log(`   名称: ${values[1]}`);
                        break;
                    }
                }
            }
        } catch (error) {
            console.log(`   失败: ${error.message}`);
        }
    }
}

// 运行测试
testAllDataSources().catch(console.error);
