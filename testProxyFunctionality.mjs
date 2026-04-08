
import fetch from 'node-fetch';

// 代理配置
const PROXY_CONFIG = {
    enabled: true,
    proxyUrls: [
        'https://api.allorigins.win/raw?url=',
        'https://cors-anywhere.herokuapp.com/',
        'https://proxy.cors.sh/',
        'https://corsproxy.io/?url=',
        'https://cors-proxy.tk/'
    ],
    currentProxyIndex: 0,
    proxyTimeout: 15000
};

// 获取带代理的URL
function getProxyUrl(url) {
    if (!PROXY_CONFIG.enabled) {
        return url;
    }
    const proxyUrl = PROXY_CONFIG.proxyUrls[PROXY_CONFIG.currentProxyIndex];
    return `${proxyUrl}${encodeURIComponent(url)}`;
}

// 切换到下一个代理服务器
function switchProxy() {
    PROXY_CONFIG.currentProxyIndex = (PROXY_CONFIG.currentProxyIndex + 1) % PROXY_CONFIG.proxyUrls.length;
    console.log(`切换到代理服务器: ${PROXY_CONFIG.proxyUrls[PROXY_CONFIG.currentProxyIndex]}`);
}

async function testDataSourceWithProxy(name, originalUrl) {
    console.log(`\n=== 测试 ${name} ===`);
    console.log(`原始URL: ${originalUrl}`);
    
    // 尝试所有代理服务器
    for (let attempt = 0; attempt < PROXY_CONFIG.proxyUrls.length; attempt++) {
        try {
            const proxyUrl = getProxyUrl(originalUrl);
            console.log(`尝试代理服务器 ${attempt + 1}/${PROXY_CONFIG.proxyUrls.length}: ${PROXY_CONFIG.proxyUrls[PROXY_CONFIG.currentProxyIndex]}`);
            console.log(`代理URL: ${proxyUrl}`);
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), PROXY_CONFIG.proxyTimeout);
            
            const response = await fetch(proxyUrl, {
                headers: {
                    'Referer': originalUrl.includes('sinajs') ? 'https://finance.sina.com.cn/' : 
                              originalUrl.includes('money.126') ? 'https://quotes.money.163.com/' : 'https://www.10jqka.com.cn/',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1',
                    'Cache-Control': 'max-age=0',
                    'Sec-Fetch-Dest': 'document',
                    'Sec-Fetch-Mode': 'navigate',
                    'Sec-Fetch-Site': 'none',
                    'Sec-Fetch-User': '?1',
                    'Sec-Ch-Ua': '"Not.A/Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
                    'Sec-Ch-Ua-Mobile': '?0',
                    'Sec-Ch-Ua-Platform': '"Windows"'
                },
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            console.log(`状态码: ${response.status}`);
            
            const text = await response.text();
            console.log('响应长度:', text.length, '字符');
            
            if (text.length > 0) {
                console.log('响应示例:', text.substring(0, 300) + (text.length > 300 ? '...' : ''));
                return {
                    name,
                    success: true,
                    status: response.status,
                    responseLength: text.length,
                    proxyUsed: PROXY_CONFIG.proxyUrls[PROXY_CONFIG.currentProxyIndex]
                };
            } else {
                console.log('响应为空，尝试下一个代理服务器');
                switchProxy();
                continue;
            }
        } catch (error) {
            console.error(`代理服务器 ${PROXY_CONFIG.proxyUrls[PROXY_CONFIG.currentProxyIndex]} 错误:`, error.message);
            switchProxy();
            continue;
        }
    }
    
    console.log('所有代理服务器都失败了');
    return {
        name,
        success: false,
        error: '所有代理服务器都失败'
    };
}

async function runTests() {
    console.log('开始测试代理功能...');
    
    const tests = [
        {
            name: '新浪行情（代理）',
            url: 'https://hq.sinajs.cn/list=sh600519'
        },
        {
            name: '网易行情（代理）',
            url: 'https://api.money.126.net/data/feed/0600519,money.api'
        },
        {
            name: '同花顺行情（代理）',
            url: 'https://api.10jqka.com.cn/v1/quote/newest?codes=sh600519'
        }
    ];
    
    const results = [];
    
    for (const test of tests) {
        const result = await testDataSourceWithProxy(test.name, test.url);
        results.push(result);
    }
    
    console.log('\n=== 测试结果汇总 ===');
    console.table(results);
    
    // 分析成功的测试
    console.log('\n=== 成功的测试分析 ===');
    const successful = results.filter(r => r.success);
    console.log(`成功的测试: ${successful.map(r => r.name).join(', ') || '无'}`);
    
    return results;
}

runTests().catch(console.error);
