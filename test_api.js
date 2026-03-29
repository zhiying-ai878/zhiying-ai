// 测试API数据获取
import axios from 'axios';

// 测试新浪API
async function testSinaAPI() {
    try {
        console.log('=== 测试新浪API ===');
        
        // 使用正确的URL格式
        const url = 'https://hq.sinajs.cn/list=sh600519,sz000858';
        
        // 设置请求头以避免403错误
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Referer': 'https://finance.sina.com.cn/'
            }
        });
        
        console.log('API响应状态:', response.status);
        console.log('响应数据:', response.data);
        
        // 解析数据
        const lines = response.data.split('\n');
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
                            open: parseFloat(values[1]),
                            close: parseFloat(values[2]),
                            price: parseFloat(values[3]),
                            high: parseFloat(values[4]),
                            low: parseFloat(values[5]),
                            volume: parseInt(values[8]),
                            amount: parseFloat(values[9]),
                            change: parseFloat(values[3]) - parseFloat(values[2]),
                            changePercent: ((parseFloat(values[3]) - parseFloat(values[2])) / parseFloat(values[2]) * 100)
                        };
                        
                        console.log(`\n股票: ${stockData.code} ${stockData.name}`);
                        console.log(`价格: ${stockData.price}`);
                        console.log(`涨跌幅: ${stockData.changePercent.toFixed(2)}%`);
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

// 运行测试
testSinaAPI();
