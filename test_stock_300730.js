
import axios from 'axios';

async function testStock300730() {
    console.log('=== 测试股票300730历史数据获取 ===');
    
    const stockCode = '300730';
    const cleanCode = stockCode;
    const marketCode = cleanCode.startsWith('6') ? '1' : '0';
    const secid = `${marketCode}.${cleanCode}`;
    
    console.log(`股票代码: ${stockCode}`);
    console.log(`处理后代码: ${cleanCode}, 市场代码: ${marketCode}, secid: ${secid}`);
    
    try {
        // 尝试东方财富历史数据API
        const response = await axios.get('https://push2his.eastmoney.com/api/qt/stock/kline/get', {
            params: {
                secid,
                klt: 101, // 日线
                fqt: 1, // 前复权
                end: Date.now(),
                lmt: 50
            },
            headers: {
                'Referer': 'https://quote.eastmoney.com/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': '*/*',
                'Accept-Language': 'zh-CN,zh;q=0.9',
                'Connection': 'keep-alive'
            },
            timeout: 10000
        });
        
        console.log('API响应状态:', response.status);
        console.log('API响应数据:', JSON.stringify(response.data, null, 2));
        
        if (response.data && response.data.data && response.data.data.kline) {
            const klines = response.data.data.kline;
            console.log(`成功获取 ${klines.length} 条历史数据`);
            console.log('最新5条数据:');
            klines.slice(-5).forEach((kline, index) => {
                console.log(`${index + 1}. ${kline[0]}: 开=${kline[1]/100}, 收=${kline[2]/100}, 高=${kline[3]/100}, 低=${kline[4]/100}`);
            });
        } else {
            console.log('未获取到数据');
            
            // 尝试备用API（腾讯）
            console.log('\n尝试备用API（腾讯）...');
            const tencentResponse = await axios.get('https://web.ifzq.gtimg.cn/appstock/app/kline/kline', {
                params: {
                    param: `${marketCode}.${cleanCode},day,1,1000`
                },
                headers: {
                    'Referer': 'https://stock.qq.com/',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': '*/*',
                    'Accept-Language': 'zh-CN,zh;q=0.9',
                    'Connection': 'keep-alive'
                },
                timeout: 10000
            });
            
            console.log('腾讯API响应状态:', tencentResponse.status);
            console.log('腾讯API响应数据:', JSON.stringify(tencentResponse.data, null, 2));
            
            const dataObj = typeof tencentResponse.data === 'string' ? JSON.parse(tencentResponse.data) : tencentResponse.data;
            const key = `${marketCode}.${cleanCode}`;
            
            if (dataObj[key] && dataObj[key].data && dataObj[key].data.day) {
                const klines = dataObj[key].data.day;
                console.log(`腾讯API成功获取 ${klines.length} 条历史数据`);
                console.log('最新5条数据:');
                klines.slice(-5).forEach((kline, index) => {
                    console.log(`${index + 1}. ${kline[0]}: 开=${kline[1]}, 收=${kline[2]}, 高=${kline[4]}, 低=${kline[5]}`);
                });
            } else {
                console.log('腾讯API也未获取到数据');
            }
        }
        
    } catch (error) {
        console.error(`获取历史数据失败:`, error.message);
        console.error('错误详情:', error);
    }
    
    console.log('\n=== 测试完成 ===');
}

testStock300730();
