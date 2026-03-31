
import axios from 'axios';

async function testDataSourceUsage() {
    console.log('测试各个数据源的指数数据处理...');
    
    // 测试不同的数据源
    const dataSources = [
        { 
            name: 'eastmoney',
            url: 'https://push2.eastmoney.com/api/qt/stock/get',
            params: {
                secid: '1.000001',
                fields: 'f43,f44,f45,f46,f47,f48,f49,f50,f51,f52,f57,f58,f60,f169,f170'
            }
        },
        {
            name: 'eastmoney_mini',
            url: 'https://push2.eastmoney.com/api/qt/ulist.np/get',
            params: {
                secids: '1.000001',
                fields: 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f22,f11,f62,f128,f136,f115,f152,f135'
            }
        },
        {
            name: 'eastmoney_pro',
            url: 'https://push2.eastmoney.com/api/qt/stock/get',
            params: {
                secid: '1.000001',
                fields: 'f43,f44,f45,f46,f47,f48,f49,f50,f51,f52,f57,f58,f60,f107,f116,f117,f127,f169,f170'
            }
        }
    ];
    
    for (const source of dataSources) {
        console.log(`\n=== 测试 ${source.name} 数据源 ===`);
        
        try {
            const response = await axios.get(source.url, {
                params: {
                    ...source.params,
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
                const data = source.name === 'eastmoney_mini' ? response.data.data.diff[0] : response.data.data;
                
                console.log('原始数据:', data);
                
                // 应用修复后的逻辑
                let price, open, high, low, close;
                
                if (source.name === 'eastmoney_mini') {
                    price = data.f2 / 100;
                    open = data.f15 / 100;
                    high = data.f17 / 100;
                    low = data.f18 / 100;
                    close = data.f20 / 100;
                } else {
                    price = data.f43 / 100;
                    open = data.f46 / 100;
                    high = data.f44 / 100;
                    low = data.f45 / 100;
                    close = data.f60 / 100;
                }
                
                console.log('修复后的数据:', {
                    price: price.toFixed(2),
                    open: open.toFixed(2),
                    high: high.toFixed(2),
                    low: low.toFixed(2),
                    close: close.toFixed(2)
                });
                
                // 验证点位是否合理
                if (price > 1000 && price< 5000) {
                    console.log('✅', source.name, '数据源点位显示正常:', price.toFixed(2));
                } else {
                    console.log('❌', source.name, '数据源点位显示异常:', price.toFixed(2));
                }
                
            } else {
                console.error('获取数据失败');
            }
        } catch (error) {
            console.error('请求失败:', error.message);
        }
    }
    
    console.log('\n=== 测试完成 ===');
}

testDataSourceUsage();
