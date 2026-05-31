
// 简单测试涨跌点数计算
import axios from 'axios';

async function testChangePoints() {
    console.log('测试涨跌点数计算...');
    
    // 测试东方财富mini API的原始数据
    try {
        // 测试上证指数
        const shResponse = await axios.get('https://push2.eastmoney.com/api/qt/ulist.np/get', {
            params: {
                secids: '1.000001',
                fields: 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f22,f11,f62,f128,f136,f115,f152,f135',
                _: Date.now().toString()
            },
            headers: {
                'Referer': 'https://quote.eastmoney.com/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        
        console.log('上证指数原始数据:', shResponse.data.data.diff[0]);
        
        // 测试科创综指
        const kcResponse = await axios.get('https://push2.eastmoney.com/api/qt/ulist.np/get', {
            params: {
                secids: '1.000688',
                fields: 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f22,f11,f62,f128,f136,f115,f152,f135',
                _: Date.now().toString()
            },
            headers: {
                'Referer': 'https://quote.eastmoney.com/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        
        console.log('科创综指原始数据:', kcResponse.data.data.diff[0]);
        
        // 测试股票
        const stockResponse = await axios.get('https://push2.eastmoney.com/api/qt/ulist.np/get', {
            params: {
                secids: '1.600519',
                fields: 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f22,f11,f62,f128,f136,f115,f152,f135',
                _: Date.now().toString()
            },
            headers: {
                'Referer': 'https://quote.eastmoney.com/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        
        console.log('股票原始数据:', stockResponse.data.data.diff[0]);
        
    } catch (error) {
        console.error('API请求失败:', error);
    }
}

testChangePoints().catch(console.error);
