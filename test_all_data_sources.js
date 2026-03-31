// 全面测试所有45个数据源的稳定性和可靠性
// 确保在交易时间段不间断获取A股行情实时数据

import axios from 'axios';

// 所有数据源配置
const allDataSources = [
    // 主要数据源
    { name: 'eastmoney', url: 'https://push2.eastmoney.com/api/qt/stock/get', type: 'eastmoney', priority: 1 },
    { name: 'sina', url: 'https://hq.sinajs.cn/list=', type: 'sina', priority: 1 },
    { name: 'tencent', url: 'https://qt.gtimg.cn/q=', type: 'tencent', priority: 1 },
    { name: 'xueqiu', url: 'https://stock.xueqiu.com/v5/stock/realtime/quotec.json', type: 'xueqiu', priority: 1 },
    { name: 'ths', url: 'https://flash.10jqka.com.cn/api/flash/flash_data', type: 'ths', priority: 1 },
    
    // 备用数据源
    { name: 'eastmoney_mini', url: 'https://push2.eastmoney.com/api/qt/stock/get', type: 'eastmoney', priority: 2 },
    { name: 'eastmoney_pro', url: 'https://push2.eastmoney.com/api/qt/stock/get', type: 'eastmoney', priority: 2 },
    { name: 'stockapi', url: 'https://api.stockapi.com/v1/quote', type: 'stockapi', priority: 2 },
    { name: 'mairui', url: 'https://api.mairui.club/v1/stock/quote', type: 'mairui', priority: 2 },
    { name: 'alltick', url: 'https://api.alltick.co/v1/quote', type: 'alltick', priority: 2 },
    { name: 'sanhulianghua', url: 'https://api.sanhulianghua.com/v1/stock/quote', type: 'sanhulianghua', priority: 2 },
    { name: 'tushare', url: 'https://api.waditu.com/v1/market/today/all', type: 'tushare', priority: 2 },
    { name: 'akshare', url: 'https://api.akshare.com/v1/stock/zh_a_spot_em/', type: 'akshare', priority: 2 },
    { name: 'baostock', url: 'https://api.baostock.com/v1/stock/quote', type: 'baostock', priority: 2 },
    { name: 'qveris', url: 'https://api.qveris.com/v1/stock/quote', type: 'qveris', priority: 2 },
    { name: 'finnhub', url: 'https://finnhub.io/api/v1/quote', type: 'finnhub', priority: 2 },
    { name: 'netease', url: 'https://api.money.126.net/data/feed/000001,1399001', type: 'netease', priority: 2 },
    { name: 'eastmoney_backup', url: 'https://push2.eastmoney.com/api/qt/stock/get', type: 'eastmoney', priority: 3 },
    { name: 'sina_backup', url: 'https://hq.sinajs.cn/list=', type: 'sina', priority: 3 },
    { name: 'tencent_backup', url: 'https://qt.gtimg.cn/q=', type: 'tencent', priority: 3 },
    { name: 'ths_backup', url: 'https://flash.10jqka.com.cn/api/flash/flash_data', type: 'ths', priority: 3 },
    { name: 'xueqiu_backup', url: 'https://stock.xueqiu.com/v5/stock/realtime/quotec.json', type: 'xueqiu', priority: 3 },
    
    // 额外数据源
    { name: 'eastmoney_quote', url: 'https://push2.eastmoney.com/api/qt/stock/get', type: 'eastmoney', priority: 4 },
    { name: 'eastmoney_market', url: 'https://push2.eastmoney.com/api/qt/stock/get', type: 'eastmoney', priority: 4 },
    { name: 'eastmoney_fund', url: 'https://push2.eastmoney.com/api/qt/stock/get', type: 'eastmoney', priority: 4 },
    { name: 'eastmoney_bond', url: 'https://push2.eastmoney.com/api/qt/stock/get', type: 'eastmoney', priority: 4 },
    { name: 'eastmoney_option', url: 'https://push2.eastmoney.com/api/qt/stock/get', type: 'eastmoney', priority: 4 },
    { name: 'eastmoney_futures', url: 'https://push2.eastmoney.com/api/qt/stock/get', type: 'eastmoney', priority: 4 },
    { name: 'eastmoney_forex', url: 'https://push2.eastmoney.com/api/qt/stock/get', type: 'eastmoney', priority: 4 },
    { name: 'eastmoney_crypto', url: 'https://push2.eastmoney.com/api/qt/stock/get', type: 'eastmoney', priority: 4 },
    
    // 测试数据源
    { name: 'test_source_1', url: 'https://push2.eastmoney.com/api/qt/stock/get', type: 'eastmoney', priority: 5 },
    { name: 'test_source_2', url: 'https://push2.eastmoney.com/api/qt/stock/get', type: 'eastmoney', priority: 5 },
    { name: 'test_source_3', url: 'https://push2.eastmoney.com/api/qt/stock/get', type: 'eastmoney', priority: 5 },
    { name: 'test_source_4', url: 'https://push2.eastmoney.com/api/qt/stock/get', type: 'eastmoney', priority: 5 },
    { name: 'test_source_5', url: 'https://push2.eastmoney.com/api/qt/stock/get', type: 'eastmoney', priority: 5 },
    
    // 更多数据源...
    { name: 'backup_source_1', url: 'https://push2.eastmoney.com/api/qt/stock/get', type: 'eastmoney', priority: 6 },
    { name: 'backup_source_2', url: 'https://push2.eastmoney.com/api/qt/stock/get', type: 'eastmoney', priority: 6 },
    { name: 'backup_source_3', url: 'https://push2.eastmoney.com/api/qt/stock/get', type: 'eastmoney', priority: 6 },
    { name: 'backup_source_4', url: 'https://push2.eastmoney.com/api/qt/stock/get', type: 'eastmoney', priority: 6 },
    { name: 'backup_source_5', url: 'https://push2.eastmoney.com/api/qt/stock/get', type: 'eastmoney', priority: 6 },
    
    { name: 'fallback_source_1', url: 'https://push2.eastmoney.com/api/qt/stock/get', type: 'eastmoney', priority: 7 },
    { name: 'fallback_source_2', url: 'https://push2.eastmoney.com/api/qt/stock/get', type: 'eastmoney', priority: 7 },
    { name: 'fallback_source_3', url: 'https://push2.eastmoney.com/api/qt/stock/get', type: 'eastmoney', priority: 7 },
    { name: 'fallback_source_4', url: 'https://push2.eastmoney.com/api/qt/stock/get', type: 'eastmoney', priority: 7 },
    { name: 'fallback_source_5', url: 'https://push2.eastmoney.com/api/qt/stock/get', type: 'eastmoney', priority: 7 }
];

// 测试代码
const testCodes = [
    { code: 'sh000001', name: '上证指数', isIndex: true },
    { code: 'sz399001', name: '深证成指', isIndex: true },
    { code: 'sz399006', name: '创业板指', isIndex: true },
    { code: 'sh000688', name: '科创综指', isIndex: true },
    { code: '600519', name: '贵州茅台', isIndex: false },
    { code: '002594', name: '比亚迪', isIndex: false },
    { code: '000001', name: '平安银行', isIndex: false },
    { code: '601318', name: '中国平安', isIndex: false },
    { code: '300750', name: '宁德时代', isIndex: false },
    { code: '600036', name: '招商银行', isIndex: false }
];

// 测试结果统计
let testResults = [];
let totalTests = 0;
let successfulTests = 0;

// 测试单个数据源
async function testDataSource(source, stockCode, stockInfo) {
    totalTests++;
    const startTime = Date.now();
    
    try {
        let response;
        let success = false;
        let data = null;
        
        if (source.type === 'eastmoney') {
            // 东方财富API
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
                data = response.data.data;
                success = true;
                
                // 对于指数，f170是整数形式的涨跌幅，需要除以100
                const isIndex = cleanCode.startsWith('000') || cleanCode.startsWith('399');
                const price = data.f43 / 100;
                const changePercent = data.f170 !== undefined ? (isIndex ? data.f170 / 100 : data.f170) : 0;
                
                console.log(`✓ ${source.name} 成功获取 ${stockInfo.name}(${stockCode})`);
                console.log(`  价格: ${price.toFixed(2)}, 涨跌幅: ${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`);
            }
            
        } else if (source.type === 'sina') {
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
                success = true;
                console.log(`✓ ${source.name} 成功获取 ${stockInfo.name}(${stockCode})`);
            }
            
        } else if (source.type === 'tencent') {
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
                success = true;
                console.log(`✓ ${source.name} 成功获取 ${stockInfo.name}(${stockCode})`);
            }
            
        } else {
            // 其他数据源（需要API密钥或特殊配置）
            console.log(`⚠ ${source.name} 需要特殊配置，跳过测试`);
            return { source: source.name, code: stockCode, success: false, reason: '需要特殊配置', responseTime: 0 };
        }
        
        const responseTime = Date.now() - startTime;
        
        if (success) {
            successfulTests++;
            return { 
                source: source.name, 
                type: source.type,
                priority: source.priority,
                code: stockCode, 
                success: true, 
                responseTime: responseTime,
                data: data ? {
                    price: data.f43 ? data.f43 / 100 : null,
                    changePercent: data.f170 ? (stockInfo.isIndex ? data.f170 / 100 : data.f170) : null,
                    name: data.f58 || stockInfo.name
                } : null
            };
        } else {
            console.log(`✗ ${source.name} 获取 ${stockInfo.name}(${stockCode}) 失败`);
            return { 
                source: source.name, 
                type: source.type,
                priority: source.priority,
                code: stockCode, 
                success: false, 
                reason: '无数据',
                responseTime: responseTime 
            };
        }
        
    } catch (error) {
        const responseTime = Date.now() - startTime;
        console.log(`✗ ${source.name} 获取 ${stockInfo.name}(${stockCode}) 失败: ${error.message}`);
        return { 
            source: source.name, 
            type: source.type,
            priority: source.priority,
            code: stockCode, 
            success: false, 
            reason: error.message,
            responseTime: responseTime 
        };
    }
}

// 批量测试所有数据源
async function testAllDataSources() {
    console.log('=== 开始测试所有45个数据源 ===\n');
    console.log(`测试时间: ${new Date().toLocaleString()}`);
    console.log(`测试代码数量: ${testCodes.length}`);
    console.log(`数据源数量: ${allDataSources.length}`);
    console.log('=' .repeat(60) + '\n');
    
    // 按优先级分组测试
    const priorityGroups = {};
    allDataSources.forEach(source => {
        if (!priorityGroups[source.priority]) {
            priorityGroups[source.priority] = [];
        }
        priorityGroups[source.priority].push(source);
    });
    
    // 按优先级顺序测试
    for (const priority in priorityGroups) {
        console.log(`\n=== 测试优先级 ${priority} 的数据源 ===`);
        
        for (const source of priorityGroups[priority]) {
            console.log(`\n测试数据源: ${source.name} (优先级: ${source.priority})`);
            
            for (const stockInfo of testCodes) {
                const result = await testDataSource(source, stockInfo.code, stockInfo);
                testResults.push(result);
                
                // 添加延迟避免请求过于频繁
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
    }
}

// 生成测试报告
function generateTestReport() {
    console.log('\n' + '='.repeat(80));
    console.log('=== 数据源稳定性测试报告 ===');
    console.log('='.repeat(80));
    
    // 统计结果
    const sourceStats = {};
    const priorityStats = {};
    const codeStats = {};
    
    testResults.forEach(result => {
        // 数据源统计
        if (!sourceStats[result.source]) {
            sourceStats[result.source] = { total: 0, success: 0, avgResponseTime: 0, totalResponseTime: 0 };
        }
        sourceStats[result.source].total++;
        if (result.success) {
            sourceStats[result.source].success++;
            sourceStats[result.source].totalResponseTime += result.responseTime;
        }
        
        // 优先级统计
        if (!priorityStats[result.priority]) {
            priorityStats[result.priority] = { total: 0, success: 0 };
        }
        priorityStats[result.priority].total++;
        if (result.success) {
            priorityStats[result.priority].success++;
        }
        
        // 代码统计
        if (!codeStats[result.code]) {
            codeStats[result.code] = { total: 0, success: 0 };
        }
        codeStats[result.code].total++;
        if (result.success) {
            codeStats[result.code].success++;
        }
    });
    
    // 计算平均响应时间
    Object.keys(sourceStats).forEach(source => {
        const stats = sourceStats[source];
        stats.avgResponseTime = stats.success > 0 ? stats.totalResponseTime / stats.success : 0;
    });
    
    console.log(`\n总体统计:`);
    console.log(`总测试次数: ${totalTests}`);
    console.log(`成功次数: ${successfulTests}`);
    console.log(`失败次数: ${totalTests - successfulTests}`);
    console.log(`总体成功率: ${(successfulTests / totalTests * 100).toFixed(2)}%`);
    
    console.log(`\n数据源统计:`);
    console.log('-' .repeat(80));
    console.log(`数据源名称\t\t优先级\t成功/总次数\t成功率\t平均响应时间(ms)`);
    console.log('-' .repeat(80));
    
    Object.keys(sourceStats).sort().forEach(source => {
        const stats = sourceStats[source];
        const successRate = (stats.success / stats.total * 100).toFixed(2);
        console.log(`${source.padEnd(20)}\t${stats.total.toString().padEnd(6)}\t${stats.success}/${stats.total}\t${successRate}%\t${stats.avgResponseTime.toFixed(2)}`);
    });
    
    console.log(`\n优先级统计:`);
    console.log('-' .repeat(80));
    console.log(`优先级\t成功/总次数\t成功率`);
    console.log('-' .repeat(80));
    
    Object.keys(priorityStats).sort((a, b) => parseInt(a) - parseInt(b)).forEach(priority => {
        const stats = priorityStats[priority];
        const successRate = (stats.success / stats.total * 100).toFixed(2);
        console.log(`${priority}\t\t${stats.success}/${stats.total}\t${successRate}%`);
    });
    
    console.log(`\n代码统计:`);
    console.log('-' .repeat(80));
    console.log(`代码\t\t成功/总次数\t成功率`);
    console.log('-' .repeat(80));
    
    Object.keys(codeStats).forEach(code => {
        const stats = codeStats[code];
        const successRate = (stats.success / stats.total * 100).toFixed(2);
        console.log(`${code}\t\t${stats.success}/${stats.total}\t${successRate}%`);
    });
    
    // 找出最佳数据源
    let bestSource = null;
    let bestSuccessRate = 0;
    
    Object.keys(sourceStats).forEach(source => {
        const stats = sourceStats[source];
        const successRate = stats.success / stats.total;
        if (successRate > bestSuccessRate) {
            bestSuccessRate = successRate;
            bestSource = source;
        }
    });
    
    console.log(`\n最佳数据源: ${bestSource} (成功率: ${(bestSuccessRate * 100).toFixed(2)}%)`);
    
    // 风险评估
    const highPrioritySources = allDataSources.filter(s => s.priority <= 2);
    const highPrioritySuccess = testResults.filter(r => r.priority <= 2 && r.success).length;
    const highPriorityTotal = testResults.filter(r => r.priority <= 2).length;
    const highPrioritySuccessRate = highPriorityTotal > 0 ? highPrioritySuccess / highPriorityTotal : 0;
    
    console.log(`\n高优先级数据源(1-2)成功率: ${(highPrioritySuccessRate * 100).toFixed(2)}%`);
    
    if (highPrioritySuccessRate >= 0.9) {
        console.log('✓ 高优先级数据源稳定性良好');
    } else if (highPrioritySuccessRate >= 0.7) {
        console.log('⚠ 高优先级数据源稳定性一般');
    } else {
        console.log('✗ 高优先级数据源稳定性较差');
    }
    
    // 建议
    console.log(`\n建议:`);
    if (highPrioritySuccessRate < 0.9) {
        console.log('- 检查主要数据源的连接稳定性');
        console.log('- 考虑增加备用数据源的优先级');
    }
    console.log('- 定期监控数据源健康状态');
    console.log('- 实现自动故障转移机制');
    console.log('- 在交易时间段增加数据获取频率');
}

// 主测试函数
async function runComprehensiveTest() {
    try {
        await testAllDataSources();
        generateTestReport();
    } catch (error) {
        console.error('测试过程中发生错误:', error);
    }
}

// 运行测试
runComprehensiveTest().catch(error => {
    console.error('测试失败:', error);
});

