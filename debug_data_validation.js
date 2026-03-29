// 调试数据验证逻辑
import axios from 'axios';

// 模拟数据验证函数
function isValidStockQuote(quote) {
    if (!quote || typeof quote !== 'object')
        return false;
    
    // 验证核心必需字段
    const coreFields = ['code', 'name', 'price'];
    for (const field of coreFields) {
        if (!(field in quote)) {
            console.warn(`数据验证失败: 缺少核心字段 ${field}`);
            return false;
        }
    }
    
    // 验证价格字段的有效性
    const priceFields = ['price', 'open', 'high', 'low', 'close'];
    for (const field of priceFields) {
        if (quote[field] !== undefined) {
            const value = quote[field];
            if (typeof value !== 'number' || isNaN(value) || value < 0) {
                console.warn(`数据验证失败: ${field} 不是有效数字: ${value}`);
                return false;
            }
        }
    }
    
    // 高级数据验证
    return performAdvancedDataValidation(quote);
}

function performAdvancedDataValidation(quote) {
    const { code, price, open, high, low, close, volume, amount, changePercent } = quote;
    
    // 验证价格范围合理性
    if (price > 100000 || price < 0) {
        console.warn(`数据验证失败: ${code} 价格超出合理范围: ${price}`);
        return false;
    }
    
    // 验证价格逻辑合理性（仅在所有字段都存在时验证）
    if (high !== undefined && low !== undefined) {
        if (high < low) {
            console.warn(`数据验证失败: ${code} 最高价(${high})低于最低价(${low})`);
            return false;
        }
    }
    
    // 验证涨跌幅合理性
    if (changePercent !== undefined) {
        if (Math.abs(changePercent) > 100) {
            console.warn(`数据验证失败: ${code} 涨跌幅(${changePercent}%)异常`);
            return false;
        }
    }
    
    return true;
}

// 测试新浪API返回的数据
async function testSinaAPI() {
    try {
        console.log('=== 测试新浪API数据 ===');
        const response = await axios.get('https://hq.sinajs.cn/list=sh600519,sz000858');
        const data = response.data;
        
        console.log('原始数据:', data);
        
        // 解析新浪数据
        const lines = data.split('\n');
        for (const line of lines) {
            if (line.trim()) {
                const match = line.match(/var hq_str_(\w+)="([^"]+)"/);
                if (match) {
                    const code = match[1];
                    const values = match[2].split(',');
                    
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
                    console.log(`最高价: ${stockData.high}`);
                    console.log(`最低价: ${stockData.low}`);
                    
                    // 验证数据
                    const isValid = isValidStockQuote(stockData);
                    console.log(`数据验证结果: ${isValid ? '通过' : '失败'}`);
                    
                    if (!isValid) {
                        console.log('数据被拒绝!');
                    }
                }
            }
        }
        
    } catch (error) {
        console.error('测试失败:', error);
    }
}

// 运行测试
testSinaAPI();