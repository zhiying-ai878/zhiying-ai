// 测试前端显示逻辑，模拟Dashboard组件的数据处理
// 验证创业板指和科创综指的数据显示是否正确

// 模拟getRealtimeQuote函数
async function getRealtimeQuote(codes) {
    console.log('模拟获取实时数据，代码:', codes);
    
    // 模拟东方财富API返回的数据
    const mockData = {
        'sh000001': {
            code: 'sh000001',
            name: '上证指数',
            price: 3913.72,
            change: 24.64,
            changePercent: 0.63
        },
        'sz399001': {
            code: 'sz399001',
            name: '深证成指',
            price: 13760.37,
            change: 153.93,
            changePercent: 1.13
        },
        'sz399006': {
            code: 'sz399006',
            name: '创业板指',
            price: 3295.88,
            change: 23.39,
            changePercent: 0.71
        },
        'sh000688': {
            code: 'sh000688',
            name: '科创综指',
            price: 1300.76,
            change: 11.95,
            changePercent: 0.93
        }
    };
    
    return codes.map(code => mockData[code] || null).filter(Boolean);
}

// 模拟Dashboard组件中的数据处理逻辑
async function testDashboardDataProcessing() {
    console.log('=== 测试Dashboard数据处理逻辑 ===\n');
    
    // 更新市场指数数据
    const indexCodes = ['sh000001', 'sz399001', 'sz399006', 'sh000688'];
    console.log('开始获取指数数据，代码:', indexCodes);
    
    try {
        const indexResults = await getRealtimeQuote(indexCodes);
        console.log('获取到的指数数据:', JSON.stringify(indexResults, null, 2));
        
        if (indexResults && indexResults.length > 0) {
            console.log('成功获取到', indexResults.length, '个指数数据');
            console.log('指数数据详情:', JSON.stringify(indexResults, null, 2));
            
            // 创建代码到数据的映射（支持带前缀和不带前缀的代码）
            const indexMap = new Map();
            indexResults.forEach(r => {
                // 同时保存带前缀和不带前缀的代码映射
                indexMap.set(r.code, r);
                if (r.code.startsWith('sh') || r.code.startsWith('sz')) {
                    indexMap.set(r.code.substring(2), r);
                } else {
                    const prefixedCode = r.code.startsWith('6') || r.code.startsWith('000') ? `sh${r.code}` : `sz${r.code}`;
                    indexMap.set(prefixedCode, r);
                }
            });
            
            console.log('指数映射键:', Array.from(indexMap.keys()));
            
            const updatedMarketData = [
                { name: '上证指数', value: indexMap.get('sh000001')?.price || indexMap.get('000001')?.price || 0, change: indexMap.get('sh000001')?.change || indexMap.get('000001')?.change || 0, changePercent: indexMap.get('sh000001')?.changePercent || indexMap.get('000001')?.changePercent || 0 },
                { name: '深证成指', value: indexMap.get('sz399001')?.price || indexMap.get('399001')?.price || 0, change: indexMap.get('sz399001')?.change || indexMap.get('399001')?.change || 0, changePercent: indexMap.get('sz399001')?.changePercent || indexMap.get('399001')?.changePercent || 0 },
                { name: '创业板指', value: indexMap.get('sz399006')?.price || indexMap.get('399006')?.price || 0, change: indexMap.get('sz399006')?.change || indexMap.get('399006')?.change || 0, changePercent: indexMap.get('sz399006')?.changePercent || indexMap.get('399006')?.changePercent || 0 },
                { name: '科创综指', value: indexMap.get('sh000688')?.price || indexMap.get('000688')?.price || 0, change: indexMap.get('sh000688')?.change || indexMap.get('000688')?.change || 0, changePercent: indexMap.get('sh000688')?.changePercent || indexMap.get('000688')?.changePercent || 0 },
            ];
            
            console.log('准备更新市场数据:', JSON.stringify(updatedMarketData, null, 2));
            
            // 验证数据显示
            console.log('\n=== 验证数据显示 ===');
            updatedMarketData.forEach(item => {
                console.log(`${item.name}:`);
                console.log(`  价格: ${item.value.toFixed(2)}`);
                console.log(`  变动: ${item.change >= 0 ? '+' : ''}${item.change.toFixed(2)}`);
                console.log(`  涨跌幅: ${item.changePercent >= 0 ? '+' : ''}${item.changePercent.toFixed(2)}%`);
                console.log('---');
            });
            
            return updatedMarketData;
            
        } else {
            console.warn('未获取到指数数据');
            return null;
        }
    } catch (error) {
        console.error('获取指数数据失败:', error);
        return null;
    }
}

// 测试数据转换和显示
function testDataConversion() {
    console.log('\n=== 测试数据转换和显示 ===');
    
    // 模拟东方财富API返回的原始数据
    const rawData = {
        f43: 329588, // 创业板指价格（整数形式，需要除以100）
        f46: 327249, // 开盘价
        f60: 327249, // 昨日收盘价
        f169: 2339,  // 价格变动（整数形式，需要除以100）
        f170: 71,    // 涨跌幅（指数的f170是整数形式，如71表示0.71%）
        f58: '创业板指'
    };
    
    console.log('原始数据:', rawData);
    
    // 数据转换
    const price = rawData.f43 / 100;
    const close = rawData.f60 / 100;
    const change = rawData.f169 / 100;
    
    // 指数判断和涨跌幅计算
    const code = 'sz399006';
    const cleanCode = code.substring(2); // '399006'
    const isIndex = cleanCode.startsWith('000') || cleanCode.startsWith('399');
    const changePercentValue = rawData.f170 !== undefined ? (isIndex ? rawData.f170 / 100 : rawData.f170) : ((price - close) / close) * 100;
    
    console.log('转换后的数据:');
    console.log(`  价格: ${price.toFixed(2)}`);
    console.log(`  昨日收盘: ${close.toFixed(2)}`);
    console.log(`  变动: ${change.toFixed(2)}`);
    console.log(`  代码: ${code}`);
    console.log(`  是否指数: ${isIndex}`);
    console.log(`  涨跌幅: ${changePercentValue >= 0 ? '+' : ''}${changePercentValue.toFixed(2)}%`);
    
    // 手动计算验证
    const manualCalculation = ((price - close) / close) * 100;
    console.log(`  手动计算涨跌幅: ${manualCalculation >= 0 ? '+' : ''}${manualCalculation.toFixed(2)}%`);
}

// 运行测试
async function runTests() {
    console.log(`测试时间: ${new Date().toLocaleString()}`);
    console.log('=' .repeat(60));
    
    await testDashboardDataProcessing();
    testDataConversion();
    
    console.log('\n=== 测试完成 ===');
}

runTests().catch(error => {
    console.error('测试失败:', error);
});
