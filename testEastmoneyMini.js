
// 测试东方财富迷你版数据源
import axios from 'axios';

async function testEastmoneyMini() {
    console.log('=== 测试东方财富迷你版数据源 ===\n');
    
    const testCodes = ['sh000001', 'sz399001', 'sz399006', 'sh000688'];
    
    try {
        // 构建secids
        const secids = testCodes.map(code => {
            let cleanCode = code;
            if (code.startsWith('sh')) {
                cleanCode = code.substring(2);
            } else if (code.startsWith('sz')) {
                cleanCode = code.substring(2);
            }
            return cleanCode.startsWith('6') ? `1.${cleanCode}` : `0.${cleanCode}`;
        }).join(',');
        
        console.log(`请求的secids: ${secids}`);
        
        const response = await axios.get('https://push2.eastmoney.com/api/qt/ulist.np/get', {
            params: {
                secids,
                fields: 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f22,f11,f62,f128,f136,f115,f152,f135',
                _: Date.now().toString()
            },
            headers: {
                'Referer': 'https://quote.eastmoney.com/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'zh-CN,zh;q=0.9'
            },
            timeout: 5000
        });
        
        console.log('东方财富迷你版API返回:', response.data);
        
        if (response.data && response.data.data && response.data.data.diff) {
            console.log('\n解析结果:');
            for (const item of response.data.data.diff) {
                console.log(`代码: ${item.f12}, 名称: ${item.f14}`);
                console.log(`  最新价: ${item.f2 / 100}`);
                console.log(`  涨跌额: ${item.f3 / 100}`);
                console.log(`  涨跌幅: ${item.f4}%`);
                console.log(`  开盘价: ${item.f15 / 100}`);
                console.log(`  最高价: ${item.f17 / 100}`);
                console.log(`  最低价: ${item.f18 / 100}`);
                console.log(`  昨收价: ${item.f20 / 100}`);
                console.log('---');
            }
        }
        
    } catch (error) {
        console.error('东方财富迷你版API请求失败:', error);
    }
}

// 运行测试
testEastmoneyMini().catch(console.error);
