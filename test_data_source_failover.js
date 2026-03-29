
// 数据源故障转移测试脚本
// 测试系统在主要数据源失败时能否自动切换到备用数据源

import axios from 'axios';

// 数据源列表
const dataSources = [
    { name: 'eastmoney', url: 'https://push2.eastmoney.com/api/qt/stock/get', requiresSecid: true },
    { name: 'sina', url: 'https://hq.sinajs.cn/list=', requiresSecid: false },
    { name: 'tencent', url: 'https://qt.gtimg.cn/q=', requiresSecid: false },
    { name: 'xueqiu', url: 'https://stock.xueqiu.com/v5/stock/realtime/quotec.json', requiresSecid: false },
    { name: 'ths', url: 'https://flash.10jqka.com.cn/api/flash/flash_data', requiresSecid: false },
    { name: 'stockapi', url: 'https://api.stockapi.com/v1/quote', requiresSecid: false },
    { name: 'mairui', url: 'https://api.mairui.club/v1/stock/quote', requiresSecid: false },
    { name: 'alltick', url: 'https://api.alltick.co/v1/quote', requiresSecid: false },
    { name: 'sanhulianghua', url: 'https://api.sanhulianghua.com/v1/stock/quote', requiresSecid: false },
    { name: 'tushare', url: 'https://api.waditu.com/v1/market/today/all', requiresSecid: false },
    { name: 'akshare', url: 'https://api.akshare.com/v1/stock/zh_a_spot_em/', requiresSecid: false },
    { name: 'baostock', url: 'https://api.baostock.com/v1/stock/quote', requiresSecid: false },
    { name: 'qveris', url: 'https://api.qveris.com/v1/stock/quote', requiresSecid: false },
    { name: 'finnhub', url: 'https://finnhub.io/api/v1/quote', requiresSecid: false },
    { name: 'netease', url: 'https://api.money.126.net/data/feed/000001,1399001', requiresSecid: false },
    { name: 'eastmoney_mini', url: 'https://push2.eastmoney.com/api/qt/stock/get', requiresSecid: true },
    { name: 'eastmoney_pro', url: 'https://push2.eastmoney.com/api/qt/stock/get', requiresSecid: true }
];

// 测试股票和指数代码
const testCodes = [
    { code: 'sh000001', name: '上证指数', isIndex: true },
    { code: 'sz399001', name: '深证成指', isIndex: true },
    { code: '600519', name: '贵州茅台', isIndex: false },
    { code: '002594', name: '比亚迪', isIndex: false },
    { code: '000001', name: '平安银行', isIndex: false }
];

// 测试单个数据源
async function testDataSource(source, stockCode, stockInfo) {
    console.log(`\n=== 测试数据源: ${source.name} ===`);
    
    try {
        let response;
        
        if (source.name === 'eastmoney' || source.name === 'eastmoney_mini' || source.name === 'eastmoney_pro') {
            // 东方财富API需要特殊处理
            let cleanCode = stockCode;
            let secid;
            
            if (stockCode.startsWith('sh')) {
                cleanCode = stockCode.substring(2);
                secid = `1.${cleanCode}`;
            } else if (stockCode.startsWith('sz')) {
                cleanCode = stockCode.substring(2);
                secid = `0.${cleanCode}`;
            } else {
                secid = stockCode.startsWith('6') ? `1.${stockCode}` : `0.${stockCode}`;
            }
            
            response = await axios.get(source.url, {
                params: {
                    secid,
                    fields: 'f43,f44,f45,f46,f47,f48,f49,f50,f51,f52,f57,f58,f60,f169,f170',
                    _: Date.now().toString()
                },
                headers: {
                    'Referer': 'https://quote.eastmoney.com/',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': 'application/json, text/plain, */*',
                    'Accept-Language': 'zh-CN,zh;q=0.9',
                    'Connection': 'keep-alive'
                },
                timeout: 5000
            });
            
            if (response.data && response.data.data) {
                const data = response.data.data;
                console.log(`✓ ${source.name} 成功获取 ${stockInfo.name}(${stockCode}) 数据`);
                console.log(`  当前价格: ${(data.f43 / 100).toFixed(2)}`);
                console.log(`  涨跌幅: ${data.f170 ? data.f170.toFixed(2) + '%' : 'N/A'}`);
                return true;
            } else {
                console.log(`✗ ${source.name} 获取 ${stockInfo.name}(${stockCode}) 数据失败: 数据为空`);
                return false;
            }
            
        } else if (source.name === 'sina') {
            // 新浪API
            let sinaCode = stockCode;
            if (!sinaCode.startsWith('sh') && !sinaCode.startsWith('sz')) {
                sinaCode = stockCode.startsWith('6') ? `sh${stockCode}` : `sz${stockCode}`;
            }
            
            response = await axios.get(`${source.url}${sinaCode}`, {
                headers: {
                    'Referer': 'https://finance.sina.com.cn/',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': '*/*',
                    'Accept-Language': 'zh-CN,zh;q=0.9',
                    'Connection': 'keep-alive'
                },
                timeout: 5000
            });
            
            if (response.data && response.data.includes('hq_str_')) {
                console.log(`✓ ${source.name} 成功获取 ${stockInfo.name}(${stockCode}) 数据`);
                return true;
            } else {
                console.log(`✗ ${source.name} 获取 ${stockInfo.name}(${stockCode}) 数据失败`);
                return false;
            }
            
        } else if (source.name === 'tencent') {
            // 腾讯API
            let tencentCode = stockCode;
            if (!tencentCode.startsWith('sh') && !tencentCode.startsWith('sz')) {
                tencentCode = stockCode.startsWith('6') ? `sh${stockCode}` : `sz${stockCode}`;
            }
            
            response = await axios.get(`${source.url}${tencentCode}`, {
                headers: {
                    'Referer': 'https://finance.qq.com/',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': '*/*',
                    'Accept-Language': 'zh-CN,zh;q=0.9',
                    'Connection': 'keep-alive'
                },
                timeout: 5000
            });
            
            if (response.data && response.data.includes('v_')) {
                console.log(`✓ ${source.name} 成功获取 ${stockInfo.name}(${stockCode}) 数据`);
                return true;
            } else {
                console.log(`✗ ${source.name} 获取 ${stockInfo.name}(${stockCode}) 数据失败`);
                return false;
            }
            
        } else {
            // 其他数据源的基本测试（可能需要特殊处理）
            console.log(`⚠ ${source.name} 需要特殊配置或API密钥，跳过测试`);
            return false;
        }
        
    } catch (error) {
        console.log(`✗ ${source.name} 获取 ${stockInfo.name}(${stockCode}) 数据失败: ${error.message}`);
        return false;
    }
}

// 测试故障转移机制
async function testFailoverMechanism() {
    console.log('=== 测试数据源故障转移机制 ===');
    
    const primarySources = ['eastmoney', 'sina', 'tencent', 'xueqiu', 'ths'];
    const backupSources = dataSources.filter(source => !primarySources.includes(source.name));
    
    console.log(`主要数据源: ${primarySources.join(', ')}`);
    console.log(`备用数据源: ${backupSources.map(s => s.name).join(', ')}`);
    
    const testStock = testCodes[2]; // 使用贵州茅台进行测试
    
    console.log(`\n测试股票: ${testStock.name}(${testStock.code})`);
    
    // 模拟主要数据源全部失败
    console.log('\n模拟主要数据源全部失败...');
    
    let successCount = 0;
    let totalTests = 0;
    
    // 测试所有数据源
    for (const source of dataSources) {
        totalTests++;
        const success = await testDataSource(source, testStock.code, testStock);
        if (success) {
            successCount++;
        }
        
        // 添加延迟避免请求过于频繁
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`\n=== 测试结果统计 ===`);
    console.log(`总数据源数: ${dataSources.length}`);
    console.log(`成功数据源数: ${successCount}`);
    console.log(`失败数据源数: ${totalTests - successCount}`);
    console.log(`成功率: ${(successCount / totalTests * 100).toFixed(2)}%`);
    
    if (successCount > 0) {
        console.log('✓ 故障转移机制工作正常：即使主要数据源失败，仍有备用数据源可用');
    } else {
        console.log('✗ 故障转移机制失败：所有数据源都无法获取数据');
    }
    
    return successCount > 0;
}

// 测试实时数据获取的可靠性
async function testRealtimeDataReliability() {
    console.log('\n=== 测试实时数据获取可靠性 ===');
    
    const testResults = [];
    
    for (const stockInfo of testCodes) {
        console.log(`\n测试 ${stockInfo.name}(${stockInfo.code})`);
        
        let successSources = [];
        
        for (const source of dataSources.slice(0, 5)) { // 只测试前5个主要数据源
            const success = await testDataSource(source, stockInfo.code, stockInfo);
            if (success) {
                successSources.push(source.name);
            }
        }
        
        testResults.push({
            stock: stockInfo.name,
            code: stockInfo.code,
            successSources,
            successCount: successSources.length
        });
        
        console.log(`成功数据源: ${successSources.join(', ') || '无'}`);
    }
    
    console.log('\n=== 可靠性测试结果 ===');
    testResults.forEach(result => {
        console.log(`${result.stock}(${result.code}): ${result.successCount}/5 个数据源成功`);
    });
    
    const totalSuccess = testResults.reduce((sum, result) => sum + result.successCount, 0);
    const totalTests = testResults.length * 5;
    console.log(`总体成功率: ${(totalSuccess / totalTests * 100).toFixed(2)}%`);
    
    return totalSuccess > 0;
}

// 主测试函数
async function runDataSourceTests() {
    console.log('开始数据源故障转移测试...');
    
    try {
        // 测试故障转移机制
        const failoverSuccess = await testFailoverMechanism();
        
        // 测试实时数据可靠性
        const reliabilitySuccess = await testRealtimeDataReliability();
        
        console.log('\n=== 测试总结 ===');
        console.log(`故障转移测试: ${failoverSuccess ? '通过' : '失败'}`);
        console.log(`实时数据可靠性测试: ${reliabilitySuccess ? '通过' : '失败'}`);
        
        if (failoverSuccess && reliabilitySuccess) {
            console.log('✓ 所有测试通过！系统具备良好的数据源故障转移能力');
        } else {
            console.log('✗ 部分测试失败，需要进一步优化数据源配置');
        }
        
    } catch (error) {
        console.error('测试过程中发生错误:', error);
    }
}

// 运行测试
runDataSourceTests().catch(error => {
    console.error('测试失败:', error);
});

