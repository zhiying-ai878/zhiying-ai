
// 调试实际数据获取和显示
import axios from 'axios';

async function debugActualData() {
    console.log('=== 调试实际数据获取和显示 ===\n');
    
    const indexCodes = ['sh000001', 'sh000688'];
    
    try {
        console.log('测试指数代码:', indexCodes);
        
        // 直接测试东方财富迷你版API
        console.log('\n1. 测试东方财富迷你版API:');
        const secids = indexCodes.map(code => {
            let cleanCode = code;
            if (code.startsWith('sh')) {
                cleanCode = code.substring(2);
            } else if (code.startsWith('sz')) {
                cleanCode = code.substring(2);
            }
            return cleanCode.startsWith('6') ? `1.${cleanCode}` : `0.${cleanCode}`;
        }).join(',');
        
        console.log('请求的secids:', secids);
        
        const eastmoneyResponse = await axios.get('https://push2.eastmoney.com/api/qt/ulist.np/get', {
            params: {
                secids,
                fields: 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f22,f11,f62,f128,f136,f115,f152,f135',
                _: Date.now().toString()
            },
            headers: {
                'Referer': 'https://quote.eastmoney.com/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 5000
        });
        
        console.log('东方财富迷你版API响应:', JSON.stringify(eastmoneyResponse.data, null, 2));
        
        if (eastmoneyResponse.data && eastmoneyResponse.data.data && eastmoneyResponse.data.data.diff) {
            console.log('\n解析东方财富迷你版数据:');
            for (const item of eastmoneyResponse.data.data.diff) {
                console.log(`代码: ${item.f12}, 名称: ${item.f14}`);
                console.log(`原始价格: ${item.f2}, 处理后价格: ${item.f2 / 100}`);
                console.log(`原始涨跌: ${item.f3}, 处理后涨跌: ${item.f3 / 100}`);
                console.log(`涨跌幅: ${item.f4}%`);
                console.log(`原始开盘: ${item.f15}, 处理后开盘: ${item.f15 / 100}`);
                console.log(`原始最高: ${item.f17}, 处理后最高: ${item.f17 / 100}`);
                console.log(`原始最低: ${item.f18}, 处理后最低: ${item.f18 / 100}`);
                console.log(`原始收盘: ${item.f20}, 处理后收盘: ${item.f20 / 100}`);
                console.log('---');
            }
        }
        
        // 测试股票数据
        console.log('\n2. 测试股票数据:');
        const stockCodes = ['002594']; // 比亚迪
        const stockSecids = stockCodes.map(code => {
            return code.startsWith('6') ? `1.${code}` : `0.${code}`;
        }).join(',');
        
        const stockResponse = await axios.get('https://push2.eastmoney.com/api/qt/ulist.np/get', {
            params: {
                secids: stockSecids,
                fields: 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f22,f11,f62,f128,f136,f115,f152,f135',
                _: Date.now().toString()
            },
            headers: {
                'Referer': 'https://quote.eastmoney.com/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 5000
        });
        
        if (stockResponse.data && stockResponse.data.data && stockResponse.data.data.diff) {
            console.log('解析股票数据:');
            for (const item of stockResponse.data.data.diff) {
                console.log(`代码: ${item.f12}, 名称: ${item.f14}`);
                console.log(`原始价格: ${item.f2}, 处理后价格: ${item.f2 / 100}`);
                console.log(`涨跌幅: ${item.f4}%`);
            }
        }
        
    } catch (error) {
        console.error('调试失败:', error.message);
    }
    
    console.log('\n=== 调试完成 ===');
}

debugActualData().catch(console.error);
