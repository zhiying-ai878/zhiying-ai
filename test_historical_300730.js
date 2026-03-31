
import { smartDataRequest } from './smart_data_source_manager.js';

async function testHistorical300730() {
    console.log('=== 测试股票300730历史数据获取 ===');
    
    const stockCode = '300730';
    
    try {
        console.log(`获取股票 ${stockCode} 的历史数据...`);
        
        // 测试不带前缀的代码
        const results1 = await smartDataRequest([stockCode], 'historical');
        console.log('不带前缀的代码结果:', JSON.stringify(results1, null, 2));
        
        // 测试带前缀的代码
        const formattedCode = stockCode.startsWith('6') ? `sh${stockCode}` : `sz${stockCode}`;
        console.log(`测试带前缀的代码: ${formattedCode}`);
        const results2 = await smartDataRequest([formattedCode], 'historical');
        console.log('带前缀的代码结果:', JSON.stringify(results2, null, 2));
        
        // 检查结果
        if (results1 && results1[stockCode] && results1[stockCode].length > 0) {
            console.log(`成功获取到 ${results1[stockCode].length} 条历史数据`);
            console.log('最新5条数据:');
            results1[stockCode].slice(-5).forEach((item, index) => {
                console.log(`${index + 1}. ${item.date}: 收=${item.close}`);
            });
        } else if (results2 && results2[formattedCode] && results2[formattedCode].length > 0) {
            console.log(`成功获取到 ${results2[formattedCode].length} 条历史数据`);
            console.log('最新5条数据:');
            results2[formattedCode].slice(-5).forEach((item, index) => {
                console.log(`${index + 1}. ${item.date}: 收=${item.close}`);
            });
        } else {
            console.log('未获取到历史数据');
        }
        
    } catch (error) {
        console.error('获取历史数据失败:', error);
    }
    
    console.log('\n=== 测试完成 ===');
}

testHistorical300730();
