
import axios from 'axios';

async function testTencentKLineData() {
    console.log('测试腾讯K线数据获取...');
    
    const stockCode = '300730';
    const tencentCode = `sz${stockCode}`;
    
    console.log(`股票代码: ${stockCode}, 腾讯代码: ${tencentCode}`);
    
    try {
        const response = await axios.get(`https://web.ifzq.gtimg.cn/appstock/app/kline/kline`, {
            params: {
                param: `${tencentCode},day,,100`
            },
            headers: {
                'Referer': 'https://stock.gtimg.cn/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 5000
        });
        
        console.log('API响应状态:', response.status);
        console.log('响应数据:', JSON.stringify(response.data, null, 2));
        
        if (response.data && response.data.data && response.data.data[tencentCode]) {
            const klineData = response.data.data[tencentCode].day;
            if (klineData && klineData.qfqday) {
                console.log(`成功获取到${klineData.qfqday.length}条K线数据`);
                
                // 显示前5条数据
                console.log('前5条K线数据:');
                klineData.qfqday.slice(0, 5).forEach((item, index) => {
                    console.log(`${index + 1}. 日期: ${item[0]}, 开盘: ${item[1]}, 收盘: ${item[2]}, 最高: ${item[3]}, 最低: ${item[4]}`);
                });
            } else {
                console.error('未获取到K线数据');
            }
        } else {
            console.error('响应数据格式不正确');
        }
        
    } catch (error) {
        console.error('获取腾讯K线数据失败:', error.message);
        if (error.response) {
            console.error('响应状态:', error.response.status);
            console.error('响应数据:', error.response.data);
        }
    }
}

testTencentKLineData();
