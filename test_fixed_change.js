
// 测试修复后的涨跌点数计算逻辑
import axios from 'axios';

// 模拟指数代码识别函数
function isIndexCode(code) {
    const indexPatterns = [
        /^(sh)?000\d{3}$/,
        /^(sz)?399\d{3}$/,
        /^(sh)?000001$/,
        /^(sz)?399001$/,
        /^(sh)?000300$/,
        /^(sh)?000016$/,
        /^(sz)?399005$/,
        /^(sz)?399006$/,
        /^(sh)?000905$/,
        /^(sh)?000688$/,
    ];
    return indexPatterns.some(pattern => pattern.test(code));
}

async function testFixedChangeLogic() {
    console.log('测试修复后的涨跌点数计算逻辑...');
    
    try {
        // 测试上证指数
        console.log('\n=== 测试上证指数 (sh000001) ===');
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
        
        const shData = shResponse.data.data.diff[0];
        console.log('原始数据:', {
            f2: shData.f2,   // 当前价格
            f3: shData.f3,   // 涨跌点数（显示为0）
            f4: shData.f4,   // 涨跌百分比
            f24: shData.f24, // 实际涨跌点数
            f18: shData.f18, // 最低价
            f20: shData.f20  // 收盘价
        });
        
        const shIsIndex = isIndexCode('sh000001');
        const shDivisor = shIsIndex ? 1 : 100;
        const shChangeValue = shData.f24 ? shData.f24 / shDivisor : shData.f3 / shDivisor;
        const shCurrentPrice = shData.f2 > 0 ? shData.f2 / shDivisor : (shData.f18 ? shData.f18 / shDivisor : 0);
        
        console.log('修复后计算结果:');
        console.log('  指数识别:', shIsIndex);
        console.log('  除数:', shDivisor);
        console.log('  当前价格:', shCurrentPrice.toFixed(2));
        console.log('  涨跌点数:', shChangeValue.toFixed(2));
        console.log('  涨跌百分比:', shData.f4);
        
        // 测试科创综指
        console.log('\n=== 测试科创综指 (sh000688) ===');
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
        
        const kcData = kcResponse.data.data.diff[0];
        console.log('原始数据:', {
            f2: kcData.f2,   // 当前价格
            f3: kcData.f3,   // 涨跌点数（显示为0）
            f4: kcData.f4,   // 涨跌百分比
            f24: kcData.f24, // 实际涨跌点数
            f18: kcData.f18, // 最低价
            f20: kcData.f20  // 收盘价
        });
        
        const kcIsIndex = isIndexCode('sh000688');
        const kcDivisor = kcIsIndex ? 1 : 100;
        const kcChangeValue = kcData.f24 ? kcData.f24 / kcDivisor : kcData.f3 / kcDivisor;
        const kcCurrentPrice = kcData.f2 > 0 ? kcData.f2 / kcDivisor : (kcData.f18 ? kcData.f18 / kcDivisor : 0);
        
        console.log('修复后计算结果:');
        console.log('  指数识别:', kcIsIndex);
        console.log('  除数:', kcDivisor);
        console.log('  当前价格:', kcCurrentPrice.toFixed(2));
        console.log('  涨跌点数:', kcChangeValue.toFixed(2));
        console.log('  涨跌百分比:', kcData.f4);
        
        // 测试股票
        console.log('\n=== 测试股票 (600519) ===');
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
        
        const stockData = stockResponse.data.data.diff[0];
        console.log('原始数据:', {
            f2: stockData.f2,   // 当前价格（显示为0）
            f3: stockData.f3,   // 涨跌点数（显示为0）
            f4: stockData.f4,   // 涨跌百分比
            f24: stockData.f24, // 实际涨跌点数
            f18: stockData.f18, // 最低价（实际为收盘价）
            f20: stockData.f20  // 收盘价
        });
        
        const stockIsIndex = isIndexCode('600519');
        const stockDivisor = stockIsIndex ? 1 : 100;
        const stockChangeValue = stockData.f24 ? stockData.f24 / stockDivisor : stockData.f3 / stockDivisor;
        const stockCurrentPrice = stockData.f2 > 0 ? stockData.f2 / stockDivisor : (stockData.f18 ? stockData.f18 / stockDivisor : 0);
        
        console.log('修复后计算结果:');
        console.log('  指数识别:', stockIsIndex);
        console.log('  除数:', stockDivisor);
        console.log('  当前价格:', stockCurrentPrice.toFixed(2));
        console.log('  涨跌点数:', stockChangeValue.toFixed(2));
        console.log('  涨跌百分比:', stockData.f4);
        
    } catch (error) {
        console.error('API请求失败:', error);
    }
}

testFixedChangeLogic().catch(console.error);
