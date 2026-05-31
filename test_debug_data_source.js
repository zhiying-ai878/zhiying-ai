// 调试智能数据源管理器
import { smartDataRequest } from './smart_data_source_manager.js';
import axios from 'axios';

async function testDataSourceDirectly() {
    console.log('=== 直接测试东方财富API ===');
    
    try {
        const secid = '1.600519'; // 贵州茅台
        const url = 'https://push2.eastmoney.com/api/qt/stock/get';
        const params = {
            secid,
            fields: 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f26,f27,f28,f30,f31,f32,f33,f34,f35,f36,f37,f38,f39,f40,f41,f42,f43,f44,f45,f46,f47,f48,f49,f50,f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61,f62,f63,f64,f65,f66,f67,f68,f69,f70,f71,f72,f73,f74,f75,f76,f77,f78,f79,f80,f81,f82,f83,f84,f85,f86,f87,f88,f89,f90'
        };
        
        const headers = {
            'Referer': 'https://www.eastmoney.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Connection': 'keep-alive'
        };
        
        console.log('正在请求东方财富API...');
        const response = await axios.get(url, { params, headers, timeout: 10000 });
        
        console.log('响应数据:', JSON.stringify(response.data, null, 2));
        
        if (response.data && response.data.data) {
            const data = response.data.data;
            console.log('解析后的数据:');
            console.log('代码:', data.f57 || data.f12);
            console.log('名称:', data.f58 || data.f14);
            console.log('价格:', data.f60 || data.f2);
            console.log('开盘:', data.f71 || data.f17);
            console.log('最高:', data.f44 || data.f15);
            console.log('最低:', data.f45 || data.f16);
            console.log('成交量:', data.f49 || data.f5);
            console.log('成交额:', data.f48 || data.f6);
            console.log('涨跌幅:', data.f55 || data.f3);
        }
        
    } catch (error) {
        console.error('请求失败:', error.message);
    }
}

async function testSmartRequest() {
    console.log('\n=== 测试智能数据源请求 ===');
    
    try {
        console.log('尝试获取贵州茅台数据...');
        const result = await smartDataRequest(['600519'], 'realtime');
        console.log('智能请求结果:', result);
        console.log('获取数据数量:', result.length);
    } catch (error) {
        console.error('智能请求失败:', error.message);
        console.error('错误堆栈:', error.stack);
    }
}

// 运行测试
async function runTests() {
    await testDataSourceDirectly();
    await testSmartRequest();
}

runTests().catch(console.error);
