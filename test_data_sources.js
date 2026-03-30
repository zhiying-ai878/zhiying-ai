// 数据源测试脚本
import axios from 'axios';

// 测试东方财富API
async function testEastMoneyAPI() {
    console.log('=== 测试东方财富API ===');
    try {
        const response = await axios.get('https://push2.eastmoney.com/api/qt/clist/get', {
            params: {
                cb: 'jQuery1124010095947680688758_1710739200000',
                type: '11',
                pageindex: '1',
                pagesize: '10',
                fields: 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f22,f11,f62,f128,f136,f115,f152,f135',
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
        
        console.log('✓ 东方财富API请求成功');
        console.log('响应状态:', response.status);
        
        // 解析JSONP数据
        const jsonpMatch = response.data.match(/\((.*)\)/);
        if (jsonpMatch) {
            const data = JSON.parse(jsonpMatch[1]);
            if (data.data && data.data.diff) {
                console.log(`✓ 成功获取 ${data.data.diff.length} 条数据`);
                console.log('示例数据:', data.data.diff[0]);
            } else {
                console.log('✗ 数据格式不正确');
            }
        } else {
            console.log('✗ JSONP解析失败');
        }
        
        return true;
    } catch (error) {
        console.log('✗ 东方财富API请求失败:', error.message);
        if (error.response) {
            console.log('响应状态:', error.response.status);
            console.log('响应数据:', error.response.data);
        }
        return false;
    }
}

// 测试新浪API
async function testSinaAPI() {
    console.log('\n=== 测试新浪API ===');
    try {
        const response = await axios.get('https://hq.sinajs.cn/', {
            params: {
                list: 'sh000001,sz399001'
            },
            timeout: 5000
        });
        
        console.log('✓ 新浪API请求成功');
        console.log('响应状态:', response.status);
        console.log('响应数据:', response.data);
        return true;
    } catch (error) {
        console.log('✗ 新浪API请求失败:', error.message);
        return false;
    }
}

// 测试腾讯API
async function testTencentAPI() {
    console.log('\n=== 测试腾讯API ===');
    try {
        const response = await axios.get('https://web.ifzq.gtimg.cn/appstock/app/kline/kline?param=sh000001,day,1,640', {
            timeout: 5000
        });
        
        console.log('✓ 腾讯API请求成功');
        console.log('响应状态:', response.status);
        console.log('响应数据长度:', response.data.length);
        return true;
    } catch (error) {
        console.log('✗ 腾讯API请求失败:', error.message);
        return false;
    }
}

// 测试本地JSON文件
async function testLocalStockList() {
    console.log('\n=== 测试本地股票列表 ===');
    try {
        const stockList = await import('./src/utils/stockList.json', { assert: { type: 'json' } });
        console.log(`✓ 成功加载本地股票列表，共 ${stockList.default.length} 只股票`);
        console.log('前5只股票:', stockList.default.slice(0, 5));
        return true;
    } catch (error) {
        console.log('✗ 本地股票列表加载失败:', error.message);
        return false;
    }
}

// 运行所有测试
async function runAllTests() {
    console.log('开始数据源连接测试...\n');
    
    const eastMoneyResult = await testEastMoneyAPI();
    const sinaResult = await testSinaAPI();
    const tencentResult = await testTencentAPI();
    const localResult = testLocalStockList();
    
    console.log('\n=== 测试结果汇总 ===');
    console.log(`东方财富API: ${eastMoneyResult ? '✓ 成功' : '✗ 失败'}`);
    console.log(`新浪API: ${sinaResult ? '✓ 成功' : '✗ 失败'}`);
    console.log(`腾讯API: ${tencentResult ? '✓ 成功' : '✗ 失败'}`);
    console.log(`本地股票列表: ${localResult ? '✓ 成功' : '✗ 失败'}`);
    
    const successCount = [eastMoneyResult, sinaResult, tencentResult, localResult].filter(Boolean).length;
    console.log(`\n总体成功率: ${successCount}/4 (${(successCount/4*100).toFixed(0)}%)`);
    
    if (successCount === 0) {
        console.log('\n❌ 所有数据源都无法连接，请检查网络连接和API配置');
    } else if (successCount >= 2) {
        console.log('\n✅ 多个数据源可用，系统应该能够正常运行');
    } else {
        console.log('\n⚠️  只有部分数据源可用，可能会影响系统稳定性');
    }
}

// 执行测试
runAllTests();
