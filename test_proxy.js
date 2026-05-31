// 测试代理服务器可用性
import axios from 'axios';

// 代理服务器列表
const proxyUrls = [
    'https://api.allorigins.win/raw?url=',
    'https://cors-anywhere.herokuapp.com/',
    'https://proxy.cors.sh/',
    'https://corsproxy.io/?url=',
    'https://cors-proxy.tk/'
];

// 测试URL
const testUrls = [
    'http://hq.sinajs.cn/list=sh600519,sz000001',
    'https://push2.eastmoney.com/api/qt/stock/get?secid=1.600519',
    'https://api.10jqka.com.cn/v1/quote/newest?codes=sh600519'
];

// 测试代理服务器
async function testProxy(proxyUrl, testUrl) {
    try {
        const startTime = Date.now();
        const url = `${proxyUrl}${encodeURIComponent(testUrl)}`;
        console.log(`测试: ${proxyUrl} -> ${testUrl}`);
        
        const response = await axios.get(url, {
            timeout: 10000,
            headers: {
                'Referer': 'https://finance.sina.com.cn/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        
        const duration = Date.now() - startTime;
        console.log(`✓ 成功: ${duration}ms, 响应长度: ${response.data.length} 字节`);
        return { success: true, duration, proxyUrl, testUrl };
    } catch (error) {
        console.log(`✗ 失败: ${error.message}`);
        return { success: false, error: error.message, proxyUrl, testUrl };
    }
}

// 测试直接访问
async function testDirect(testUrl) {
    try {
        const startTime = Date.now();
        console.log(`测试直接访问: ${testUrl}`);
        
        const response = await axios.get(testUrl, {
            timeout: 10000,
            headers: {
                'Referer': 'https://finance.sina.com.cn/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        
        const duration = Date.now() - startTime;
        console.log(`✓ 直接访问成功: ${duration}ms, 响应长度: ${response.data.length} 字节`);
        return { success: true, duration, testUrl };
    } catch (error) {
        console.log(`✗ 直接访问失败: ${error.message}`);
        return { success: false, error: error.message, testUrl };
    }
}

// 运行所有测试
async function runAllTests() {
    console.log('=== 代理服务器测试 ===\n');
    
    // 测试代理服务器
    for (const proxyUrl of proxyUrls) {
        for (const testUrl of testUrls) {
            await testProxy(proxyUrl, testUrl);
            console.log('');
        }
    }
    
    console.log('=== 直接访问测试 ===\n');
    
    // 测试直接访问
    for (const testUrl of testUrls) {
        await testDirect(testUrl);
        console.log('');
    }
    
    console.log('测试完成！');
}

runAllTests().catch(console.error);