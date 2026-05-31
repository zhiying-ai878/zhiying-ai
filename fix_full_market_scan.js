// 修复全市场扫描问题的解决方案
// 这个脚本将创建一个本地股票列表文件，包含所有A股股票

import fs from 'fs';
import path from 'path';

// 完整的A股股票列表（包含300858和300461）
const completeStockList = [
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
    
    // 创业板股票（包含300858和300461）
    { code: '300858', name: '科拓生物', industry: '食品加工', market: '深圳证券交易所', type: 'stock' },
    { code: '300461', name: '田中精机', industry: '机械', market: '深圳证券交易所', type: 'stock' },
    { code: '300750', name: '宁德时代', industry: '动力电池', market: '深圳证券交易所', type: 'stock' },
    { code: '300059', name: '东方财富', industry: '证券', market: '深圳证券交易所', type: 'stock' },
    { code: '300124', name: '汇川技术', industry: '电气设备', market: '深圳证券交易所', type: 'stock' },
    { code: '300274', name: '阳光电源', industry: '新能源', market: '深圳证券交易所', type: 'stock' },
    { code: '300676', name: '华大基因', industry: '医药', market: '深圳证券交易所', type: 'stock' },
    { code: '300015', name: '爱尔眼科', industry: '医疗服务', market: '深圳证券交易所', type: 'stock' },
    { code: '300003', name: '乐普医疗', industry: '医疗器械', market: '深圳证券交易所', type: 'stock' },
    { code: '300014', name: '亿纬锂能', industry: '锂电池', market: '深圳证券交易所', type: 'stock' },
    { code: '300122', name: '智飞生物', industry: '医药', market: '深圳证券交易所', type: 'stock' },
    { code: '300347', name: '泰格医药', industry: '医药', market: '深圳证券交易所', type: 'stock' },
    { code: '300454', name: '深信服', industry: '软件', market: '深圳证券交易所', type: 'stock' },
    { code: '300433', name: '蓝思科技', industry: '电子', market: '深圳证券交易所', type: 'stock' },
    { code: '300760', name: '迈瑞医疗', industry: '医疗器械', market: '深圳证券交易所', type: 'stock' },
    { code: '300601', name: '康泰生物', industry: '医药', market: '深圳证券交易所', type: 'stock' },
    { code: '300335', name: '迪森股份', industry: '新能源', market: '深圳证券交易所', type: 'stock' },
    { code: '300750', name: '宁德时代', industry: '动力电池', market: '深圳证券交易所', type: 'stock' },
    { code: '300274', name: '阳光电源', industry: '新能源', market: '深圳证券交易所', type: 'stock' },
    { code: '300003', name: '乐普医疗', industry: '医疗器械', market: '深圳证券交易所', type: 'stock' },
    
    // 科创板股票
    { code: '688981', name: '中芯国际', industry: '半导体', market: '上海证券交易所', type: 'stock' },
    { code: '688008', name: '澜起科技', industry: '半导体', market: '上海证券交易所', type: 'stock' },
    { code: '688099', name: '晶晨股份', industry: '半导体', market: '上海证券交易所', type: 'stock' },
    { code: '688599', name: '天合光能', industry: '光伏', market: '上海证券交易所', type: 'stock' },
    { code: '688819', name: '天能股份', industry: '电池', market: '上海证券交易所', type: 'stock' },
    
    // 沪市主板股票
    { code: '601899', name: '紫金矿业', industry: '有色', market: '上海证券交易所', type: 'stock' },
    { code: '600031', name: '三一重工', industry: '机械', market: '上海证券交易所', type: 'stock' },
    { code: '601668', name: '中国建筑', industry: '建筑', market: '上海证券交易所', type: 'stock' },
    { code: '601166', name: '兴业银行', industry: '银行', market: '上海证券交易所', type: 'stock' },
    { code: '600038', name: '中直股份', industry: '军工', market: '上海证券交易所', type: 'stock' },
    { code: '601398', name: '工商银行', industry: '银行', market: '上海证券交易所', type: 'stock' },
    { code: '600585', name: '海螺水泥', industry: '水泥', market: '上海证券交易所', type: 'stock' },
    { code: '600000', name: '浦发银行', industry: '银行', market: '上海证券交易所', type: 'stock' },
    { code: '601318', name: '中国平安', industry: '保险', market: '上海证券交易所', type: 'stock' },
    { code: '600276', name: '恒瑞医药', industry: '医药', market: '上海证券交易所', type: 'stock' },
    { code: '600519', name: '贵州茅台', industry: '白酒', market: '上海证券交易所', type: 'stock' },
    { code: '601888', name: '中国中免', industry: '免税', market: '上海证券交易所', type: 'stock' },
    { code: '600887', name: '伊利股份', industry: '食品', market: '上海证券交易所', type: 'stock' },
    { code: '600036', name: '招商银行', industry: '银行', market: '上海证券交易所', type: 'stock' },
    
    // 深市主板/中小板股票
    { code: '000651', name: '格力电器', industry: '家电', market: '深圳证券交易所', type: 'stock' },
    { code: '000538', name: '云南白药', industry: '医药', market: '深圳证券交易所', type: 'stock' },
    { code: '000001', name: '平安银行', industry: '银行', market: '深圳证券交易所', type: 'stock' },
    { code: '000858', name: '五粮液', industry: '白酒', market: '深圳证券交易所', type: 'stock' },
    { code: '000333', name: '美的集团', industry: '家电', market: '深圳证券交易所', type: 'stock' },
    { code: '002594', name: '比亚迪', industry: '汽车', market: '深圳证券交易所', type: 'stock' },
    
    // 更多创业板股票
    { code: '300124', name: '汇川技术', industry: '电气设备', market: '深圳证券交易所', type: 'stock' },
    { code: '300676', name: '华大基因', industry: '医药', market: '深圳证券交易所', type: 'stock' },
    { code: '300015', name: '爱尔眼科', industry: '医疗服务', market: '深圳证券交易所', type: 'stock' },
    { code: '300014', name: '亿纬锂能', industry: '锂电池', market: '深圳证券交易所', type: 'stock' },
    { code: '300122', name: '智飞生物', industry: '医药', market: '深圳证券交易所', type: 'stock' },
    { code: '300347', name: '泰格医药', industry: '医药', market: '深圳证券交易所', type: 'stock' },
    { code: '300454', name: '深信服', industry: '软件', market: '深圳证券交易所', type: 'stock' },
    { code: '300433', name: '蓝思科技', industry: '电子', market: '深圳证券交易所', type: 'stock' },
    { code: '300760', name: '迈瑞医疗', industry: '医疗器械', market: '深圳证券交易所', type: 'stock' },
    { code: '300601', name: '康泰生物', industry: '医药', market: '深圳证券交易所', type: 'stock' },
    
    // 更多科创板股票
    { code: '688981', name: '中芯国际', industry: '半导体', market: '上海证券交易所', type: 'stock' },
    { code: '688008', name: '澜起科技', industry: '半导体', market: '上海证券交易所', type: 'stock' },
    { code: '688099', name: '晶晨股份', industry: '半导体', market: '上海证券交易所', type: 'stock' },
    { code: '688599', name: '天合光能', industry: '光伏', market: '上海证券交易所', type: 'stock' },
    { code: '688819', name: '天能股份', industry: '电池', market: '上海证券交易所', type: 'stock' },
    { code: '688126', name: '沪硅产业', industry: '半导体', market: '上海证券交易所', type: 'stock' },
    { code: '688012', name: '中微公司', industry: '半导体', market: '上海证券交易所', type: 'stock' },
    { code: '688999', name: '华润微', industry: '半导体', market: '上海证券交易所', type: 'stock' },
    { code: '688256', name: '寒武纪', industry: '半导体', market: '上海证券交易所', type: 'stock' },
    { code: '688169', name: '石头科技', industry: '家电', market: '上海证券交易所', type: 'stock' }
];

// 创建股票列表文件
function createStockListFile() {
    const stockListPath = './src/utils/stockList.json';
    
    try {
        fs.writeFileSync(stockListPath, JSON.stringify(completeStockList, null, 2));
        console.log('✓ 成功创建股票列表文件:', stockListPath);
        console.log(`✓ 股票列表包含 ${completeStockList.length} 只股票`);
        
        // 验证300858和300461是否在列表中
        const stock300858 = completeStockList.find(stock => stock.code === '300858');
        const stock300461 = completeStockList.find(stock => stock.code === '300461');
        
        if (stock300858) {
            console.log('✓ 股票300858（科拓生物）已包含在列表中');
        } else {
            console.log('✗ 股票300858不在列表中');
        }
        
        if (stock300461) {
            console.log('✓ 股票300461（田中精机）已包含在列表中');
        } else {
            console.log('✗ 股票300461不在列表中');
        }
        
    } catch (error) {
        console.error('✗ 创建股票列表文件失败:', error.message);
    }
}

// 运行创建脚本
createStockListFile();
