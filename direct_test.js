import axios from 'axios';

// 模拟localStorage以避免错误
global.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {}
};

async function testSinaDirect() {
    console.log('=== 直接测试新浪API ===');
    try {
        const sinaCodes = 'sh600519';
        const response = await axios.get(`https://hq.sinajs.cn/list=${sinaCodes}`, {
            headers: {
                'Referer': 'https://finance.sina.com.cn/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 5000
        });
        
        console.log('新浪API响应:', response.data);
        
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
                    
                    let name = values[0];
                    name = name.replace(/锟斤拷/g, '').replace(/æ/g, '').replace(/€/g, '').replace(/�/g, '').replace(/Ã/g, '').replace(/©/g, '').replace(/Â/g, '').trim();
                    
                    const result = {
                        code,
                        name,
                        price: parseFloat(values[1]),
                        change: parseFloat(values[1]) - parseFloat(values[2]),
                        changePercent: ((parseFloat(values[1]) - parseFloat(values[2])) / parseFloat(values[2])) * 100,
                        open: parseFloat(values[2]),
                        high: parseFloat(values[4]),
                        low: parseFloat(values[5]),
                        close: parseFloat(values[3]),
                        volume: parseInt(values[8]),
                        amount: parseFloat(values[9])
                    };
                    
                    console.log('新浪解析结果:', result);
                }
            }
        }
    } catch (error) {
        console.error('新浪API测试失败:', error.message);
    }
}

async function testTencentDirect() {
    console.log('\n=== 直接测试腾讯API ===');
    try {
        const tencentCodes = 'sh600519';
        const response = await axios.get(`https://qt.gtimg.cn/q=${tencentCodes}`, {
            headers: {
                'Referer': 'https://finance.qq.com/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 5000
        });
        
        console.log('腾讯API响应:', response.data);
        
        const lines = response.data.split('\n');
        for (const line of lines) {
            if (!line || !line.includes('=')) continue;
            
            const parts = line.split('=');
            const code = parts[0].replace('v_', '');
            const dataStr = parts[1].replace(/"/g, '');
            const values = dataStr.split('~');
            
            if (values.length >= 32) {
                const result = {
                    code: code.replace('sh', '').replace('sz', ''),
                    name: values[1],
                    price: parseFloat(values[3]),
                    open: parseFloat(values[5]),
                    high: parseFloat(values[33]),
                    low: parseFloat(values[34]),
                    close: parseFloat(values[4]),
                    volume: parseInt(values[6]),
                    amount: parseFloat(values[37]),
                    change: parseFloat(values[3]) - parseFloat(values[4]),
                    changePercent: parseFloat(values[32])
                };
                
                console.log('腾讯解析结果:', result);
            }
        }
    } catch (error) {
        console.error('腾讯API测试失败:', error.message);
    }
}

async function testIndexDirect() {
    console.log('\n=== 直接测试指数API ===');
    try {
        const indexCodes = 'sh000001,sz399001,sz399006,sh000688';
        const response = await axios.get(`https://hq.sinajs.cn/list=${indexCodes}`, {
            headers: {
                'Referer': 'https://finance.sina.com.cn/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 5000
        });
        
        console.log('指数API响应:', response.data);
        
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
                    
                    let name = values[0];
                    name = name.replace(/锟斤拷/g, '').replace(/æ/g, '').replace(/€/g, '').replace(/�/g, '').replace(/Ã/g, '').replace(/©/g, '').replace(/Â/g, '').trim();
                    
                    const result = {
                        code,
                        name,
                        price: parseFloat(values[1]),
                        change: parseFloat(values[1]) - parseFloat(values[2]),
                        changePercent: ((parseFloat(values[1]) - parseFloat(values[2])) / parseFloat(values[2])) * 100,
                        open: parseFloat(values[2]),
                        high: parseFloat(values[4]),
                        low: parseFloat(values[5]),
                        close: parseFloat(values[3])
                    };
                    
                    console.log('指数解析结果:', result);
                }
            }
        }
    } catch (error) {
        console.error('指数API测试失败:', error.message);
    }
}

async function main() {
    await testSinaDirect();
    await testTencentDirect();
    await testIndexDirect();
}

main().catch(console.error);
