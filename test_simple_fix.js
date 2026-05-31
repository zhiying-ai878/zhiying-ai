
import axios from 'axios';

async function testIndexData() {
    console.log('测试指数数据修复效果...');
    
    // 测试上证指数和科创综指
    const indexes = [
        { code: 'sh000001', name: '上证指数', secid: '1.000001' },
        { code: 'sh000688', name: '科创综指', secid: '1.000688' }
    ];
    
    for (const index of indexes) {
        console.log(`\n=== 测试 ${index.name} (${index.code}) ===`);
        
        try {
            const response = await axios.get('https://push2.eastmoney.com/api/qt/stock/get', {
                params: {
                    secid: index.secid,
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
                console.log('原始数据:', {
                    f43: data.f43,
                    f46: data.f46,
                    f44: data.f44,
                    f45: data.f45,
                    f60: data.f60,
                    f169: data.f169,
                    f170: data.f170,
                    name: data.f58
                });
                
                // 应用修复后的逻辑（除以100）
                const price = data.f43 / 100;
                const open = data.f46 / 100;
                const high = data.f44 / 100;
                const low = data.f45 / 100;
                const close = data.f60 / 100;
                const change = data.f169 ? data.f169 / 100 : price - close;
                const changePercent = data.f170 !== undefined ? data.f170 / 100 : ((price - close) / close) * 100;
                
                console.log('修复后的数据:', {
                    code: index.code,
                    name: data.f58 || index.name,
                    price: price.toFixed(2),
                    open: open.toFixed(2),
                    high: high.toFixed(2),
                    low: low.toFixed(2),
                    close: close.toFixed(2),
                    change: change.toFixed(2),
                    changePercent: changePercent.toFixed(2) + '%'
                });
                
                // 验证点位是否合理
                if (price > 1000 && price< 5000) {
                    console.log('✅', index.name, '点位显示正常:', price.toFixed(2));
                } else {
                    console.log('❌', index.name, '点位显示异常:', price.toFixed(2));
                }
                
            } else {
                console.error('获取数据失败');
            }
        } catch (error) {
            console.error('请求失败:', error.message);
        }
    }
    
    console.log('\n=== 验证完成 ===');
}

testIndexData();
