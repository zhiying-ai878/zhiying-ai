import axios from 'axios';

async function testFixedTencentAPI() {
    console.log('测试修复后的腾讯API...');
    try {
        const code = '601318';
        const tencentCode = 'sh601318';
        const period = 'day';
        const count = 30;
        
        const response = await axios.get(`https://web.ifzq.gtimg.cn/appstock/app/kline/kline?param=${tencentCode},${period},,,${count},&_var=kline_day&r=0.5`, {
            headers: {
                'Referer': 'https://stock.gtimg.cn/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'zh-CN,zh;q=0.9',
                'Connection': 'keep-alive'
            },
            timeout: 10000,
            responseType: 'text'
        });
        
        console.log('腾讯API响应状态:', response.status);
        
        // 解析腾讯API返回的JSONP格式数据
        const dataStr = response.data;
        console.log('原始响应数据开头:', dataStr.substring(0, 100) + '...');
        
        const match = dataStr.match(/kline_day=(.*)/);
        if (match && match[1]) {
            const jsonData = JSON.parse(match[1]);
            console.log('解析后的JSON数据结构:', JSON.stringify(jsonData, null, 2));
            
            if (jsonData && jsonData.data && jsonData.data[tencentCode]) {
                const klineData = jsonData.data[tencentCode];
                if (klineData && klineData.day) {
                    console.log('✓ 腾讯API获取成功，数据条数:', klineData.day.length);
                    console.log('第一条数据:', klineData.day[0]);
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

testFixedTencentAPI();
