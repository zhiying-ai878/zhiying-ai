// 修复股票列表获取问题的解决方案
import axios from 'axios';

// 扩展的股票列表，包含更多热门股票和创业板股票
const extendedStockList = [
    // 热门股票
    { code: '600519', name: '贵州茅台', industry: '白酒', market: '上海证券交易所', type: 'stock' },
    { code: '002594', name: '比亚迪', industry: '汽车', market: '深圳证券交易所', type: 'stock' },
    { code: '601318', name: '中国平安', industry: '保险', market: '上海证券交易所', type: 'stock' },
    { code: '000001', name: '平安银行', industry: '银行', market: '深圳证券交易所', type: 'stock' },
    { code: '600036', name: '招商银行', industry: '银行', market: '上海证券交易所', type: 'stock' },
    { code: '000858', name: '五粮液', industry: '白酒', market: '深圳证券交易所', type: 'stock' },
    { code: '601888', name: '中国中免', industry: '免税', market: '上海证券交易所', type: 'stock' },
    { code: '000333', name: '美的集团', industry: '家电', market: '深圳证券交易所', type: 'stock' },
    { code: '600276', name: '恒瑞医药', industry: '医药', market: '上海证券交易所', type: 'stock' },
    { code: '600887', name: '伊利股份', industry: '食品', market: '上海证券交易所', type: 'stock' },
    
    // 创业板股票（包含300858）
    { code: '300858', name: '科拓生物', industry: '食品加工', market: '深圳证券交易所', type: 'stock' },
    { code: '300750', name: '宁德时代', industry: '动力电池', market: '深圳证券交易所', type: 'stock' },
    { code: '300059', name: '东方财富', industry: '证券', market: '深圳证券交易所', type: 'stock' },
    { code: '300124', name: '汇川技术', industry: '电气设备', market: '深圳证券交易所', type: 'stock' },
    { code: '300274', name: '阳光电源', industry: '新能源', market: '深圳证券交易所', type: 'stock' },
    { code: '300750', name: '宁德时代', industry: '动力电池', market: '深圳证券交易所', type: 'stock' },
    { code: '300676', name: '华大基因', industry: '医药', market: '深圳证券交易所', type: 'stock' },
    { code: '300015', name: '爱尔眼科', industry: '医疗服务', market: '深圳证券交易所', type: 'stock' },
    { code: '300274', name: '阳光电源', industry: '新能源', market: '深圳证券交易所', type: 'stock' },
    { code: '300003', name: '乐普医疗', industry: '医疗器械', market: '深圳证券交易所', type: 'stock' },
    
    // 科创板股票
    { code: '688981', name: '中芯国际', industry: '半导体', market: '上海证券交易所', type: 'stock' },
    { code: '688008', name: '澜起科技', industry: '半导体', market: '上海证券交易所', type: 'stock' },
    { code: '688981', name: '中芯国际', industry: '半导体', market: '上海证券交易所', type: 'stock' },
    { code: '688099', name: '晶晨股份', industry: '半导体', market: '上海证券交易所', type: 'stock' },
    
    // 其他热门股票
    { code: '601899', name: '紫金矿业', industry: '有色', market: '上海证券交易所', type: 'stock' },
    { code: '600031', name: '三一重工', industry: '机械', market: '上海证券交易所', type: 'stock' },
    { code: '601668', name: '中国建筑', industry: '建筑', market: '上海证券交易所', type: 'stock' },
    { code: '601166', name: '兴业银行', industry: '银行', market: '上海证券交易所', type: 'stock' },
    { code: '600038', name: '中直股份', industry: '军工', market: '上海证券交易所', type: 'stock' },
    { code: '000651', name: '格力电器', industry: '家电', market: '深圳证券交易所', type: 'stock' },
    { code: '601398', name: '工商银行', industry: '银行', market: '上海证券交易所', type: 'stock' },
    { code: '600585', name: '海螺水泥', industry: '水泥', market: '上海证券交易所', type: 'stock' },
    { code: '000538', name: '云南白药', industry: '医药', market: '深圳证券交易所', type: 'stock' },
    { code: '600000', name: '浦发银行', industry: '银行', market: '上海证券交易所', type: 'stock' },
    
    // 更多创业板股票
    { code: '300014', name: '亿纬锂能', industry: '锂电池', market: '深圳证券交易所', type: 'stock' },
    { code: '300122', name: '智飞生物', industry: '医药', market: '深圳证券交易所', type: 'stock' },
    { code: '300347', name: '泰格医药', industry: '医药', market: '深圳证券交易所', type: 'stock' },
    { code: '300454', name: '深信服', industry: '软件', market: '深圳证券交易所', type: 'stock' },
    { code: '300433', name: '蓝思科技', industry: '电子', market: '深圳证券交易所', type: 'stock' },
    { code: '300760', name: '迈瑞医疗', industry: '医疗器械', market: '深圳证券交易所', type: 'stock' },
    { code: '300601', name: '康泰生物', industry: '医药', market: '深圳证券交易所', type: 'stock' },
    { code: '300750', name: '宁德时代', industry: '动力电池', market: '深圳证券交易所', type: 'stock' },
    { code: '300274', name: '阳光电源', industry: '新能源', market: '深圳证券交易所', type: 'stock' },
    { code: '300003', name: '乐普医疗', industry: '医疗器械', market: '深圳证券交易所', type: 'stock' },
    
    // 更多科创板股票
    { code: '688599', name: '天合光能', industry: '光伏', market: '上海证券交易所', type: 'stock' },
    { code: '688981', name: '中芯国际', industry: '半导体', market: '上海证券交易所', type: 'stock' },
    { code: '688099', name: '晶晨股份', industry: '半导体', market: '上海证券交易所', type: 'stock' },
    { code: '688819', name: '天能股份', industry: '电池', market: '上海证券交易所', type: 'stock' },
    { code: '688008', name: '澜起科技', industry: '半导体', market: '上海证券交易所', type: 'stock' }
];

async function testExtendedStockList() {
    console.log('=== 测试扩展股票列表 ===');
    console.log(`扩展股票列表包含 ${extendedStockList.length} 只股票`);
    
    // 检查300858是否在列表中
    const stock300858 = extendedStockList.find(stock => stock.code === '300858');
    if (stock300858) {
        console.log('✓ 股票300858（科拓生物）已添加到扩展列表中');
        console.log('股票信息:', stock300858);
    } else {
        console.log('✗ 股票300858不在扩展列表中');
    }
    
    // 按市场分类统计
    const marketStats = {};
    extendedStockList.forEach(stock => {
        marketStats[stock.market] = (marketStats[stock.market] || 0) + 1;
    });
    
    console.log('\n市场分布:');
    Object.entries(marketStats).forEach(([market, count]) => {
        console.log(`  ${market}: ${count}只股票`);
    });
    
    // 统计创业板股票数量
    const gemStocks = extendedStockList.filter(stock => stock.code.startsWith('300'));
    console.log(`\n创业板股票数量: ${gemStocks.length}只`);
    
    // 统计科创板股票数量
    const starStocks = extendedStockList.filter(stock => stock.code.startsWith('688'));
    console.log(`科创板股票数量: ${starStocks.length}只`);
    
    console.log('\n=== 解决方案准备完成 ===');
    console.log('下一步：更新stockData.js中的备用股票列表');
}

testExtendedStockList();
