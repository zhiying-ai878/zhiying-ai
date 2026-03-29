// 测试东方财富API
import axios from 'axios';

async function testEastmoneyAPI() {
    console.log('=== 测试东方财富API ===');
    
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
        const startTime = Date.now();
        const response = await axios.get(url, { params, headers, timeout: 10000 });
        const endTime = Date.now();
        
        console.log('请求耗时:', endTime - startTime, 'ms');
        console.log('响应状态:', response.status);
        console.log('响应数据:', JSON.stringify(response.data, null, 2));
        
        if (response.data && response.data.data) {
            console.log('成功获取数据');
            console.log('股票代码:', response.data.data.f12);
            console.log('股票名称:', response.data.data.f14);
            console.log('当前价格:', response.data.data.f2);
            console.log('涨跌幅:', response.data.data.f3);
        } else {
            console.log('获取的数据格式不正确');
        }
        
    } catch (error) {
        console.error('请求失败:', error.message);
        if (error.response) {
            console.error('响应状态:', error.response.status);
            console.error('响应数据:', error.response.data);
        } else if (error.request) {
            console.error('请求发送但没有收到响应');
        } else {
            console.error('请求配置错误:', error.config);
        }
    }
}

// 运行测试
testEastmoneyAPI().catch(console.error);
