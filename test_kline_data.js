
import axios from 'axios';

async function testKLineData() {
    console.log('测试300730股票的K线数据获取...');
    
    const stockCode = '300730';
    
    try {
        // 构建secid
        const secid = stockCode.startsWith('6') ? `1.${stockCode}` : `0.${stockCode}`;
        
        console.log(`股票代码: ${stockCode}, secid: ${secid}`);
        
        const response = await axios.get('https://push2his.eastmoney.com/api/qt/stock/kline/get', {
            params: {
                secid,
                klt: 101, // 日线
                fqt: 1,
                lmt: 100,
                fields1: 'f1,f2,f3,f4,f5,f6',
                fields2: 'f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61'
            },
            headers: {
                'Referer': 'https://quote.eastmoney.com/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'zh-CN,zh;q=0.9'
            },
            timeout: 5000
        });
        
        console.log('API响应状态:', response.status);
        console.log('响应数据:', JSON.stringify(response.data, null, 2));
        
        if (response.data && response.data.data && response.data.data.klines) {
            const klines = response.data.data.klines;
            console.log(`成功获取到${klines.length}条K线数据`);
            
            // 显示前5条数据
            console.log('前5条K线数据:');
            klines.slice(0, 5).forEach((kline, index) => {
                const values = kline.split(',');
                if (values.length >= 6) {
                    console.log(`${index + 1}. 日期: ${values[0]}, 开盘: ${parseFloat(values[1]) / 100}, 最高: ${parseFloat(values[2]) / 100}, 最低: ${parseFloat(values[3]) / 100}, 收盘: ${parseFloat(values[4]) / 100}`);
                }
            });
        } else {
            console.error('未获取到K线数据');
        }
        
    } catch (error) {
        console.error('获取K线数据失败:', error.message);
        if (error.response) {
            console.error('响应状态:', error.response.status);
            console.error('响应数据:', error.response.data);
        }
    }
}

testKLineData();
