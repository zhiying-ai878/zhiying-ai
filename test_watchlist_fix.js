
// 测试自选股删除功能的简单脚本
import fs from 'fs';
import path from 'path';

// 模拟localStorage
const localStorageMock = {
    storage: {},
    getItem(key) {
        return this.storage[key] || null;
    },
    setItem(key, value) {
        this.storage[key] = value;
    },
    removeItem(key) {
        delete this.storage[key];
    },
    clear() {
        this.storage = {};
    }
};

// 模拟localStorage
global.localStorage = localStorageMock;

// 导入存储函数
import { getWatchlist, saveWatchlist, removeFromWatchlist } from './src/utils/storage.js';

async function testWatchlistFunctions() {
    console.log('=== 测试自选股功能 ===');
    
    // 初始化测试数据
    const initialStocks = [
        { code: 'sh600519', name: '贵州茅台' },
        { code: 'sz000858', name: '五粮液' },
        { code: 'sz300750', name: '宁德时代' }
    ];
    
    console.log('初始化自选股:', initialStocks);
    saveWatchlist(initialStocks);
    
    // 测试获取
    const watchlist1 = getWatchlist();
    console.log('获取自选股:', watchlist1);
    
    // 测试删除
    console.log('准备删除贵州茅台');
    const result = removeFromWatchlist('sh600519');
    console.log('删除结果:', result);
    
    // 再次获取
    const watchlist2 = getWatchlist();
    console.log('删除后自选股:', watchlist2);
    
    // 验证
    const stillExists = watchlist2.some(s => s.code === 'sh600519');
    if (!stillExists) {
        console.log('✅ 自选股删除功能正常！');
    } else {
        console.log('❌ 自选股删除功能异常！');
    }
    
    // 测试删除不存在的股票
    const result2 = removeFromWatchlist('sh600000');
    console.log('删除不存在股票的结果:', result2);
    
    const watchlist3 = getWatchlist();
    console.log('最终自选股:', watchlist3);
}

testWatchlistFunctions();
