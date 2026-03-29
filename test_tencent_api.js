// 测试腾讯财经API
import axios from 'axios';

async function testTencentAPI() {
    console.log('=== 测试腾讯财经API ===');
    
    try {
        const tencentCode = '1.600519'; // 贵州茅台
        const url = 'https://web.ifzq.gtimg.cn/appstock/app/kline/kline';
        const params = {
            param: `${tencentCode},day,1,1000`
        };
        
        const headers = {
            'Referer': 'https://stock.gtimg.cn/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Connection': 'keep-alive'
        };
        
        console.log('正在请求腾讯API...');
        const startTime = Date.now();
        const response = await axios.get(url, { params, headers, timeout: 10000 });
        const endTime = Date.now();
        
        console.log('请求耗时:', endTime - startTime, 'ms');
        console.log('响应状态:', response.status);
        
        // 腾讯API返回的是JavaScript代码，需要解析
        const dataStr = response.data;
        console.log('响应数据类型:', typeof dataStr);
        console.log('响应数据长度:', dataStr.length);
        
        // 尝试解析数据
        if (typeof dataStr === 'string') {
            // 腾讯API返回的是类似 "v_szhkline='{...}';" 的格式
            const match = dataStr.match(/v_szhkline='(.*?)';/);
            if (match) {
                try {
                    const jsonData = JSON.parse(match[1]);
                    console.log('成功解析数据');
                    console.log('数据结构:', Object.keys(jsonData));
                    
                    if (jsonData[tencentCode] && jsonData[tencentCode].data && jsonData[tencentCode].data.day) {
                        const dayData = jsonData[tencentCode].data.day;
                        console.log('日线数据数量:', dayData.length);
                        if (dayData.length > 0) {
                            console.log('最新数据:', dayData[dayData.length - 1]);
                        }
                    }
                } catch (parseError) {
                    console.error('JSON解析失败:', parseError.message);
                }
            } else {
                console.log('未能找到数据格式');
            }
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
testTencentAPI().catch(console.error);
