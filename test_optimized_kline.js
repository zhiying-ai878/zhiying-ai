
import axios from 'axios';

async function testOptimizedKLineAPIs() {
    console.log('=== 测试优化后的K线数据API ===');
    
    const stockCode = '300730';
    
    // 测试东方财富备用API
    console.log('\n1. 测试东方财富备用API...');
    try {
        const secid = stockCode.startsWith('6') ? `1.${stockCode}` : `0.${stockCode}`;
        
        const response = await axios.get('https://push2.eastmoney.com/api/qt/stock/kline/get', {
            params: {
                secid,
                klt: 101, // 日线
                fqt: 1,
                lmt: 100,
                fields1: 'f1,f2,f3,f4,f5,f6',
                fields2: 'f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61',
                _: Date.now()
            },
            headers: {
                'Referer': 'https://quote.eastmoney.com/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'zh-CN,zh;q=0.9',
                'Connection': 'keep-alive'
            },
            timeout: 5000
        });
        
        console.log('东方财富API响应:', JSON.stringify(response.data, null, 2));
        
        if (response.data && response.data.data && response.data.data.klines) {
            console.log(`✓ 东方财富API成功获取${response.data.data.klines.length}条数据`);
        } else {
            console.log('✗ 东方财富API未返回数据');
        }
        
    } catch (error) {
        console.log('东方财富API失败:', error.message);
    }
    
    // 测试新浪备用API
    console.log('\n2. 测试新浪备用API...');
    try {
        const sinaCode = stockCode.startsWith('6') ? `sh${stockCode}` : `sz${stockCode}`;
        
        const response = await axios.get('https://finance.sina.com.cn/stock/api/jsonp_v2.php/var_A=' + sinaCode, {
            params: {
                symbol: sinaCode,
                scale: 240,
                data: 'day',
                dnt: '1633041600'
            },
            headers: {
                'Referer': 'https://finance.sina.com.cn/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 5000
        });
        
        console.log('新浪API响应状态:', response.status);
        console.log('新浪API响应数据前500字符:', response.data.substring(0, 500));
        
    } catch (error) {
        console.log('新浪API失败:', error.message);
    }
    
    // 测试腾讯备用API
    console.log('\n3. 测试腾讯备用API...');
    try {
        const tencentCode = stockCode.startsWith('6') ? `sh${stockCode}` : `sz${stockCode}`;
        
        const response = await axios.get(`https://web.ifzq.gtimg.cn/appstock/app/kline/kline?param=${tencentCode},day,,100`, {
            headers: {
                'Referer': 'https://stock.gtimg.cn/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 5000
        });
        
        console.log('腾讯API响应:', JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        console.log('腾讯API失败:', error.message);
    }
    
    // 测试其他数据源
    console.log('\n4. 测试其他数据源...');
    
    // 测试雪球API
    try {
        const xueqiuCode = stockCode.startsWith('6') ? `SH${stockCode}` : `SZ${stockCode}`;
        
        const response = await axios.get(`https://stock.xueqiu.com/v5/stock/chart/kline.json`, {
            params: {
                symbol: xueqiuCode,
                period: 'day',
                type: 'before',
                count: 100,
                indicator: 'kline'
            },
            headers: {
                'Referer': 'https://xueqiu.com/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Cookie': 'xq_a_token=your_token_here'
            },
            timeout: 5000
        });
        
        console.log('雪球API响应状态:', response.status);
        
    } catch (error) {
        console.log('雪球API失败:', error.message);
    }
    
    console.log('\n=== 测试完成 ===');
}

testOptimizedKLineAPIs();
