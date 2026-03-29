
import { getWatchlist } from './src/utils/storage.js';

// 检查本地存储中的自选股数据
const watchlist = getWatchlist();
console.log('本地存储中的自选股数据:', JSON.stringify(watchlist, null, 2));

if (watchlist && watchlist.length > 0) {
    console.log('\n自选股代码格式:');
    watchlist.forEach(stock => {
        console.log(`代码: ${stock.code}, 名称: ${stock.name}, 价格: ${stock.price}`);
        console.log(`代码是否包含sh/sz前缀: ${stock.code.startsWith('sh') || stock.code.startsWith('sz')}`);
    });
} else {
    console.log('本地存储中没有自选股数据');
}
