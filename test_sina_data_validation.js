import axios from 'axios';

async function testSinaData() {
    console.log('测试新浪数据源数据...');
    
    try {
        // 测试新浪API
        const sinaCodes = 'sh000001,sz399001,sz399006,600519,002594';
        const response = await axios.get(`https://hq.sinajs.cn/list=${sinaCodes}`, {
            headers: {
                'Referer': 'https://finance.sina.com.cn/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 10000
        });
        
        console.log('新浪响应数据:');
        console.log(response.data);
        
        // 解析新浪数据
        const lines = response.data.split('\n');
        const quotes = [];
        
        for (const line of lines) {
            if (!line) continue;
            
            const codeMatch = line.match(/hq_str_([^\s]+)=/);
            if (!codeMatch) continue;
            
            const sinaCode = codeMatch[1];
            const match = line.match(/"([^"]+)"/);
            if (!match) continue;
            
            const values = match[1].split(',');
            if (values.length >= 32) {
                let code = sinaCode;
                if (sinaCode.startsWith('sh')) {
                    code = sinaCode.substring(2);
                } else if (sinaCode.startsWith('sz')) {
                    code = sinaCode.substring(2);
                }
                
                let name = values[0];
                name = name.replace(/锟斤拷/g, '').replace(/æ/g, '').replace(/€/g, '').replace(/�/g, '').replace(/Ã/g, '').replace(/©/g, '').replace(/Â/g, '').trim();
                
                const open = parseFloat(values[1]) || 0;
                const close = parseFloat(values[2]) || 0;
                const price = parseFloat(values[3]) || 0;
                const high = parseFloat(values[4]) || 0;
                const low = parseFloat(values[5]) || 0;
                const change = parseFloat(values[6]) || 0;
                const changePercent = parseFloat(values[7]) || 0;
                const volume = parseInt(values[8]) || 0;
                const amount = parseFloat(values[9]) || 0;
                
                const quote = {
                    code,
                    name,
                    price,
                    open,
                    high,
                    low,
                    close,
                    change,
                    changePercent,
                    volume,
                    amount
                };
                
                quotes.push(quote);
                console.log(`解析的行情数据:`);
                console.log(quote);
                console.log('价格是否大于0:', price > 0);
                console.log('名称是否有效:', name && name.length > 0);
                console.log('涨跌幅是否定义:', changePercent !== undefined);
                console.log('---');
            }
        }
        
        console.log(`总共解析到 ${quotes.length} 条行情数据`);
        
    } catch (error) {
        console.error('新浪API失败:', error.message);
    }
}

testSinaData();