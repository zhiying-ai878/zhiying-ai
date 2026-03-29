
// 简化的数据源故障转移测试
// 直接测试主要数据源和备用数据源的可用性

import axios from 'axios';

// 主要数据源列表
const primarySources = [
    { name: 'eastmoney', url: 'https://push2.eastmoney.com/api/qt/stock/get' },
    { name: 'sina', url: 'https://hq.sinajs.cn/list=' },
    { name: 'tencent', url: 'https://qt.gtimg.cn/q=' }
];

// 备用数据源列表
const backupSources = [
    { name: 'eastmoney_mini', url: 'https://push2.eastmoney.com/api/qt/stock/get' },
    { name: 'eastmoney_pro', url: 'https://push2.eastmoney.com/api/qt/stock/get' }
];

// 测试代码
const testCodes = ['sh000001', 'sz399001', '600519', '002594', '000001'];

// 测试单个数据源
async function testSource(source, code) {
    try {
        let response;
        
        if (source.name.startsWith('eastmoney')) {
            // 东方财富API
            let cleanCode = code;
            let secid;
            
            if (code.startsWith('sh')) {
                cleanCode = code.substring(2);
                secid = `1.${cleanCode}`;
            } else if (code.startsWith('sz')) {
                cleanCode = code.substring(2);
                secid = `0.${cleanCode}`;
            } else {
                secid = code.startsWith('6') ? `1.${code}` : `0.${code}`;
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
                timeout: 3000
            });
            
            if (response.data && response.data.data) {
                const data = response.data.data;
                return {
                    success: true,
                    price: data.f43 / 100,
                    changePercent: data.f170,
                    name: data.f58
                };
            }
            
        } else if (source.name === 'sina') {
            // 新浪API
            let sinaCode = code;
            if (!sinaCode.startsWith('sh') && !sinaCode.startsWith('sz')) {
                sinaCode = code.startsWith('6') ? `sh${code}` : `sz${code}`;
            }
            
            response = await axios.get(`${source.url}${sinaCode}`, {
                headers: {
                    'Referer': 'https://finance.sina.com.cn/',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': '*/*',
                    'Accept-Language': 'zh-CN,zh;q=0.9',
                    'Connection': 'keep-alive'
                },
                timeout: 3000
            });
            
            if (response.data && response.data.includes('hq_str_')) {
                return { success: true };
            }
            
        } else if (source.name === 'tencent') {
            // 腾讯API
            let tencentCode = code;
            if (!tencentCode.startsWith('sh') && !tencentCode.startsWith('sz')) {
                tencentCode = code.startsWith('6') ? `sh${code}` : `sz${code}`;
            }
            
            response = await axios.get(`${source.url}${tencentCode}`, {
                headers: {
                    'Referer': 'https://finance.qq.com/',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': '*/*',
                    'Accept-Language': 'zh-CN,zh;q=0.9',
                    'Connection': 'keep-alive'
                },
                timeout: 3000
            });
            
            if (response.data && response.data.includes('v_')) {
                return { success: true };
            }
        }
        
        return { success: false };
        
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// 模拟故障转移测试
async function simulateFailover() {
    console.log('=== 模拟数据源故障转移测试 ===\n');
    
    for (const code of testCodes) {
        console.log(`测试代码: ${code}`);
        
        // 先测试主要数据源
        let primarySuccess = false;
        let primarySource = null;
        
        for (const source of primarySources) {
            const result = await testSource(source, code);
            if (result.success) {
                primarySuccess = true;
                primarySource = source.name;
                console.log(`✓ 主要数据源 ${source.name} 成功`);
                break;
            } else {
                console.log(`✗ 主要数据源 ${source.name} 失败: ${result.error || '无数据'}`);
            }
        }
        
        // 如果主要数据源都失败，测试备用数据源
        if (!primarySuccess) {
            console.log('主要数据源全部失败，尝试备用数据源...');
            
            for (const source of backupSources) {
                const result = await testSource(source, code);
                if (result.success) {
                    console.log(`✓ 备用数据源 ${source.name} 成功，故障转移生效！`);
                    break;
                } else {
                    console.log(`✗ 备用数据源 ${source.name} 失败`);
                }
            }
        }
        
        console.log('---\n');
    }
}

// 测试实时数据一致性
async function testDataConsistency() {
    console.log('=== 测试数据一致性 ===\n');
    
    const code = '600519'; // 贵州茅台
    
    console.log(`测试股票: ${code}`);
    
    const results = [];
    
    // 测试所有数据源
    for (const source of [...primarySources, ...backupSources]) {
        const result = await testSource(source, code);
        if (result.success) {
            results.push({
                source: source.name,
                price: result.price,
                changePercent: result.changePercent,
                name: result.name
            });
        }
    }
    
    if (results.length > 0) {
        console.log('各数据源数据对比:');
        results.forEach(result => {
            console.log(`  ${result.source}: ${result.name} - ${result.price.toFixed(2)}元 (${result.changePercent >= 0 ? '+' : ''}${result.changePercent}%)`);
        });
        
        // 计算价格差异
        const prices = results.map(r => r.price);
        const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
        const maxDiff = Math.max(...prices) - Math.min(...prices);
        
        console.log(`\n平均价格: ${avgPrice.toFixed(2)}元`);
        console.log(`价格差异范围: ${maxDiff.toFixed(2)}元`);
        
        if (maxDiff < 1) {
            console.log('✓ 数据一致性良好');
        } else {
            console.log('⚠ 数据存在较大差异');
        }
    } else {
        console.log('✗ 没有可用的数据源');
    }
}

// 主测试函数
async function runTests() {
    console.log('开始数据源故障转移测试...\n');
    
    try {
        // 测试故障转移
        await simulateFailover();
        
        // 测试数据一致性
        await testDataConsistency();
        
        console.log('\n=== 测试完成 ===');
        console.log('✓ 数据源故障转移测试完成');
        console.log('✓ 数据一致性测试完成');
        
    } catch (error) {
        console.error('测试过程中发生错误:', error);
    }
}

// 运行测试
runTests().catch(error => {
    console.error('测试失败:', error);
});

