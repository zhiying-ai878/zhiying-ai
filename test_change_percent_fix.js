
// 测试涨跌百分比修复效果
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

async function testChangePercentFix() {
    console.log('测试涨跌百分比修复效果...');
    
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
        });
        
        const shIsIndex = isIndexCode('sh000001');
        const shDivisor = shIsIndex ? 1 : 100;
        // 优先使用f3作为涨跌点数，如果f3为0再使用f24字段
        const shChangeValue = (shData.f3 !== undefined && shData.f3 !== 0) ? shData.f3 / shDivisor : (shData.f24 ? shData.f24 / shDivisor : 0);
        const shCurrentPrice = shData.f2 > 0 ? shData.f2 / shDivisor : (shData.f18 ? shData.f18 / shDivisor : 0);
        // 涨跌百分比：股票数据需要除以100，指数数据直接使用
        const shChangePercentValue = shIsIndex ? shData.f4 : (shData.f4 / 100);
        
        console.log('修复后计算结果:');
        console.log('  指数识别:', shIsIndex);
        console.log('  除数:', shDivisor);
        console.log('  当前价格:', shCurrentPrice.toFixed(2));
        console.log('  涨跌点数:', shChangeValue.toFixed(2));
        console.log('  涨跌百分比:', shChangePercentValue.toFixed(2) + '%');
        
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
            f2: stockData.f2,   // 当前价格
            f3: stockData.f3,   // 涨跌点数
            f4: stockData.f4,   // 涨跌百分比
            f24: stockData.f24, // 另一个字段
        });
        
        const stockIsIndex = isIndexCode('600519');
        const stockDivisor = stockIsIndex ? 1 : 100;
        const stockChangeValue = (stockData.f3 !== undefined && stockData.f3 !== 0) ? stockData.f3 / stockDivisor : (stockData.f24 ? stockData.f24 / stockDivisor : 0);
        const stockCurrentPrice = stockData.f2 > 0 ? stockData.f2 / stockDivisor : (stockData.f18 ? stockData.f18 / stockDivisor : 0);
        // 涨跌百分比：股票数据需要除以100，指数数据直接使用
        const stockChangePercentValue = stockIsIndex ? stockData.f4 : (stockData.f4 / 100);
        
        console.log('修复后计算结果:');
        console.log('  指数识别:', stockIsIndex);
        console.log('  除数:', stockDivisor);
        console.log('  当前价格:', stockCurrentPrice.toFixed(2));
        console.log('  涨跌点数:', stockChangeValue.toFixed(2));
        console.log('  涨跌百分比:', stockChangePercentValue.toFixed(2) + '%');
        
        console.log('\n=== 修复总结 ===');
        console.log('1. 指数数据：涨跌百分比直接使用f4字段');
        console.log('2. 股票数据：涨跌百分比需要除以100');
        console.log('3. 这样可以避免涨跌百分比显示异常（如-36.00%）');
        
    } catch (error) {
        console.error('API请求失败:', error);
    }
}

testChangePercentFix().catch(console.error);
