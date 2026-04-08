
import axios from 'axios';

async function testSinaDataSource() {
    console.log('开始测试新浪数据源...');
    
    try {
        // 测试新浪数据源
        const sinaCodes = 'sh600519,sz002594'; // 贵州茅台和比亚迪
        console.log('测试新浪数据源，股票代码:', sinaCodes);
        
        const response = await axios.get(`https://hq.sinajs.cn/list=${sinaCodes}`, {
            headers: {
                'Referer': 'https://finance.sina.com.cn/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'zh-CN,zh;q=0.9',
                'Connection': 'keep-alive'
            },
            timeout: 5000
        });

        console.log('新浪数据源连接成功!');
        console.log('响应数据:', response.data);
        
        // 解析数据
        const lines = response.data.split('\n');
        for (const line of lines) {
            if (!line) continue;
            
            const codeMatch = line.match(/hq_str_([^\s]+)=/);
            if (!codeMatch) continue;
            
            const sinaCode = codeMatch[1];
            const match = line.match(/"([^"]+)"/);
            if (match) {
                const values = match[1].split(',');
                if (values.length >= 32) {
                    let code = sinaCode;
                    if (sinaCode.startsWith('sh')) {
                        code = sinaCode.substring(2);
                    } else if (sinaCode.startsWith('sz')) {
                        code = sinaCode.substring(2);
                    }
                    
                    const name = values[0];
                    const price = parseFloat(values[1]);
                    const open = parseFloat(values[2]);
                    const close = parseFloat(values[3]);
                    const high = parseFloat(values[4]);
                    const low = parseFloat(values[5]);
                    const volume = parseInt(values[8]);
                    const amount = parseFloat(values[9]);
                    
                    console.log(`股票: ${name} (${code})`);
                    console.log(`价格: ${price}, 开盘: ${open}, 收盘: ${close}`);
                    console.log(`最高价: ${high}, 最低价: ${low}`);
                    console.log(`成交量: ${volume}, 成交额: ${amount}`);
                    console.log('---');
                }
            }
        }
        
    } catch (error) {
        console.error('新浪数据源连接失败:', error.message);
        if (error.response) {
            console.error('响应状态:', error.response.status);
            console.error('响应数据:', error.response.data);
        }
    }
}

testSinaDataSource();
