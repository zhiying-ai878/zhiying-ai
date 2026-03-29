
import axios from 'axios';

async function testSinaAPI() {
    console.log('=== 测试新浪API数据 ===');
    
    try {
        // 测试贵州茅台和比亚迪的股票数据
        const codes = ['sh600519', 'sz002594'];
        const sinaCodes = codes.join(',');
        
        console.log('请求URL:', `https://hq.sinajs.cn/list=${sinaCodes}`);
        
        const response = await axios.get(`https://hq.sinajs.cn/list=${sinaCodes}`, {
            headers: {
                'Referer': 'https://finance.sina.com.cn/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'zh-CN,zh;q=0.9',
                'Connection': 'keep-alive'
            },
            timeout: 3000
        });
        
        console.log('\n原始响应数据:');
        console.log(response.data);
        
        const lines = response.data.split('\n');
        console.log(`\n解析出 ${lines.length} 行数据`);
        
        for (const line of lines) {
            if (!line) continue;
            
            console.log(`\n处理行: ${line}`);
            
            const codeMatch = line.match(/hq_str_([^\s]+)=/);
            if (!codeMatch) {
                console.log('  未找到代码匹配');
                continue;
            }
            
            const sinaCode = codeMatch[1];
            console.log(`  股票代码: ${sinaCode}`);
            
            const match = line.match(/"([^"]+)"/);
            if (!match) {
                console.log('  未找到数据匹配');
                continue;
            }
            
            const values = match[1].split(',');
            console.log(`  数据字段数量: ${values.length}`);
            
            if (values.length >= 32) {
                console.log('  价格数据:');
                console.log(`    名称: ${values[0]}`);
                console.log(`    当前价格: ${values[1]}`);
                console.log(`    开盘价: ${values[2]}`);
                console.log(`    昨日收盘价: ${values[3]}`);
                console.log(`    最高价: ${values[4]}`);
                console.log(`    最低价: ${values[5]}`);
                console.log(`    成交量: ${values[8]}`);
                console.log(`    成交额: ${values[9]}`);
                
                // 解析并显示数值
                const price = parseFloat(values[1]);
                const open = parseFloat(values[2]);
                const close = parseFloat(values[3]);
                const high = parseFloat(values[4]);
                const low = parseFloat(values[5]);
                
                console.log('\n  解析后的数值:');
                console.log(`    当前价格: ${price}`);
                console.log(`    开盘价: ${open}`);
                console.log(`    昨日收盘价: ${close}`);
                console.log(`    最高价: ${high}`);
                console.log(`    最低价: ${low}`);
                
                // 计算涨跌幅
                const change = price - close;
                const changePercent = ((price - close) / close) * 100;
                console.log(`    涨跌额: ${change}`);
                console.log(`    涨跌幅: ${changePercent}%`);
            }
        }
        
    } catch (error) {
        console.error('请求失败:', error);
    }
}

testSinaAPI();
