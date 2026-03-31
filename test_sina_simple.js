// 测试新浪API是否返回数据
import axios from 'axios';

async function testSinaAPI() {
    try {
        console.log('=== 测试新浪API ===');
        
        const url = 'https://hq.sinajs.cn/list=sh600519,sz000858';
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Referer': 'https://finance.sina.com.cn/'
            },
            timeout: 10000
        });
        
        console.log('API响应状态:', response.status);
        console.log('响应数据长度:', response.data.length);
        
        // 解析数据
        const lines = response.data.split('\n');
        console.log('解析到的行数:', lines.length);
        
        for (const line of lines) {
            if (line.trim()) {
                const match = line.match(/var hq_str_(\w+)="([^"]+)"/);
                if (match) {
                    const code = match[1];
                    const values = match[2].split(',');
                    
                    if (values.length >= 11) {
                        const stockData = {
                            code: code.startsWith('sh') || code.startsWith('sz') ? code.substring(2) : code,
                            name: values[0],
                            price: parseFloat(values[3])
                        };
                        
                        console.log(`股票: ${stockData.code} ${stockData.name} - 价格: ${stockData.price}`);
                    }
                }
            }
        }
        
    } catch (error) {
        console.error('API请求失败:', error);
        if (error.response) {
            console.error('响应状态:', error.response.status);
            console.error('响应数据:', error.response.data);
        }
    }
}

testSinaAPI();
