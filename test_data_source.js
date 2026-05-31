import axios from 'axios';

async function testEastMoneyAPI() {
    console.log('测试东方财富API...');
    try {
        const code = '601318';
        const secid = '1.601318';
        const response = await axios.get('https://push2his.eastmoney.com/api/qt/stock/kline/get', {
            params: {
                secid,
                klt: 101,
                fqt: 1,
                lmt: 30,
                fields1: 'f1,f2,f3,f4,f5,f6',
                fields2: 'f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61'
            },
            headers: {
                'Referer': 'https://quote.eastmoney.com/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'zh-CN,zh;q=0.9',
                'Connection': 'keep-alive'
            },
            timeout: 10000
        });
        
        console.log('东方财富API响应状态:', response.status);
        console.log('响应数据:', JSON.stringify(response.data, null, 2));
        
        if (response.data && response.data.data && response.data.data.klines) {
            console.log('✓ 东方财富API获取成功，数据条数:', response.data.data.klines.length);
            return response.data.data.klines;
        } else {
            console.log('✗ 东方财富API未返回有效数据');
            return null;
        }
    } catch (error) {
        console.log('✗ 东方财富API请求失败:', error.message);
        return null;
    }
}

async function testSinaAPI() {
    console.log('测试新浪API...');
    try {
        const code = '601318';
        const sinaCode = 'sh601318';
        const response = await axios.get('https://quotes.sina.cn/cn/api/jsonp_v2.php/QuotesService.getKLineData', {
            params: {
                symbol: sinaCode,
                scale: 240,
                ma: '5,10,20,30,60',
                dkline: 1,
                end: new Date().toISOString().split('T')[0]
            },
            headers: {
                'Referer': 'https://finance.sina.com.cn/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'zh-CN,zh;q=0.9',
                'Connection': 'keep-alive'
            },
            timeout: 10000
        });
        
        console.log('新浪API响应状态:', response.status);
        console.log('响应数据:', response.data);
        
        const jsonpMatch = response.data.match(/\((.*)\)/);
        if (jsonpMatch) {
            const data = JSON.parse(jsonpMatch[1]);
            if (data && data.result && data.result.data) {
                console.log('✓ 新浪API获取成功，数据条数:', data.result.data.length);
                return data.result.data;
            } else {
                console.log('✗ 新浪API未返回有效数据');
                return null;
            }
        } else {
            console.log('✗ 新浪API响应格式错误');
            return null;
        }
    } catch (error) {
        console.log('✗ 新浪API请求失败:', error.message);
        return null;
    }
}

async function testTencentAPI() {
    console.log('测试腾讯API...');
    try {
        const code = '601318';
        const tencentCode = 'sh601318';
        const response = await axios.get('https://web.ifzq.gtimg.cn/appstock/app/kline/kline?param=' + tencentCode + ',day,,,100,&_var=kline_day&r=0.5', {
            responseType: 'text'
        });
        console.log('腾讯API响应状态:', response.status);
        console.log('响应数据:', response.data);
        
        // 解析腾讯API返回的JSONP格式数据
        const dataStr = response.data;
        const match = dataStr.match(/kline_day=(.*)/);
        if (match && match[1]) {
            const jsonData = JSON.parse(match[1]);
            if (jsonData && jsonData.data && jsonData.data[tencentCode]) {
                const klineData = jsonData.data[tencentCode];
                if (klineData && klineData.day) {
                    console.log('✓ 腾讯API获取成功，数据条数:', klineData.day.length);
                    return klineData.day;
                } else {
                    console.log('✗ 腾讯API未返回有效的K线数据');
                    return null;
                }
            } else {
                console.log('✗ 腾讯API未返回有效数据结构');
                return null;
            }
        } else {
            console.log('✗ 腾讯API响应格式错误');
            return null;
        }
    } catch (error) {
        console.log('✗ 腾讯API请求失败:', error.message);
        return null;
    }
}

async function runTests() {
    console.log('开始测试股票数据源API...');
    
    await testEastMoneyAPI();
    console.log('---');
    await testSinaAPI();
    console.log('---');
    await testTencentAPI();
    
    console.log('测试完成');
}

runTests();
