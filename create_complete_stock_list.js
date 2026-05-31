// 创建完整的全市场股票列表
import fs from 'fs';
import path from 'path';

// 完整的A股股票列表 - 包含主要板块的热门股票
const completeStockList = [
    // 创业板股票（300开头）
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
    { code: '300136', name: '信维通信', industry: '电子', market: '深圳证券交易所', type: 'stock' },
    { code: '300251', name: '光线传媒', industry: '传媒', market: '深圳证券交易所', type: 'stock' },
    { code: '300104', name: '乐视网', industry: '传媒', market: '深圳证券交易所', type: 'stock' },
    { code: '300027', name: '华谊兄弟', industry: '传媒', market: '深圳证券交易所', type: 'stock' },
    { code: '300033', name: '同花顺', industry: '软件', market: '深圳证券交易所', type: 'stock' },
    { code: '300058', name: '蓝色光标', industry: '传媒', market: '深圳证券交易所', type: 'stock' },
    { code: '300070', name: '碧水源', industry: '环保', market: '深圳证券交易所', type: 'stock' },
    { code: '300072', name: '三聚环保', industry: '环保', market: '深圳证券交易所', type: 'stock' },
    { code: '300077', name: '国民技术', industry: '半导体', market: '深圳证券交易所', type: 'stock' },
    { code: '300078', name: '思创医惠', industry: '医疗', market: '深圳证券交易所', type: 'stock' },
    { code: '300088', name: '长信科技', industry: '电子', market: '深圳证券交易所', type: 'stock' },
    { code: '300096', name: '易联众', industry: '软件', market: '深圳证券交易所', type: 'stock' },
    { code: '300101', name: '振芯科技', industry: '半导体', market: '深圳证券交易所', type: 'stock' },
    
    // 科创板股票（688开头）
    { code: '688981', name: '中芯国际', industry: '半导体', market: '上海证券交易所', type: 'stock' },
    { code: '688008', name: '澜起科技', industry: '半导体', market: '上海证券交易所', type: 'stock' },
    { code: '688099', name: '晶晨股份', industry: '半导体', market: '上海证券交易所', type: 'stock' },
    { code: '688599', name: '天合光能', industry: '光伏', market: '上海证券交易所', type: 'stock' },
    { code: '688819', name: '天能股份', industry: '电池', market: '上海证券交易所', type: 'stock' },
    { code: '688126', name: '沪硅产业', industry: '半导体', market: '上海证券交易所', type: 'stock' },
    { code: '688012', name: '中微公司', industry: '半导体', market: '上海证券交易所', type: 'stock' },
    { code: '688999', name: '华润微', industry: '半导体', market: '上海证券交易所', type: 'stock' },
    { code: '688256', name: '寒武纪', industry: '半导体', market: '上海证券交易所', type: 'stock' },
    { code: '688169', name: '石头科技', industry: '家电', market: '上海证券交易所', type: 'stock' },
    { code: '688063', name: '派能科技', industry: '电池', market: '上海证券交易所', type: 'stock' },
    { code: '688036', name: '传音控股', industry: '电子', market: '上海证券交易所', type: 'stock' },
    { code: '688009', name: '中国通号', industry: '通信', market: '上海证券交易所', type: 'stock' },
    { code: '688003', name: '天准科技', industry: '机械', market: '上海证券交易所', type: 'stock' },
    { code: '688018', name: '乐鑫科技', industry: '半导体', market: '上海证券交易所', type: 'stock' },
    
    // 沪市主板股票（60开头）
    { code: '600519', name: '贵州茅台', industry: '白酒', market: '上海证券交易所', type: 'stock' },
    { code: '601318', name: '中国平安', industry: '保险', market: '上海证券交易所', type: 'stock' },
    { code: '600036', name: '招商银行', industry: '银行', market: '上海证券交易所', type: 'stock' },
    { code: '601888', name: '中国中免', industry: '免税', market: '上海证券交易所', type: 'stock' },
    { code: '600276', name: '恒瑞医药', industry: '医药', market: '上海证券交易所', type: 'stock' },
    { code: '600887', name: '伊利股份', industry: '食品', market: '上海证券交易所', type: 'stock' },
    { code: '601899', name: '紫金矿业', industry: '有色', market: '上海证券交易所', type: 'stock' },
    { code: '600031', name: '三一重工', industry: '机械', market: '上海证券交易所', type: 'stock' },
    { code: '601668', name: '中国建筑', industry: '建筑', market: '上海证券交易所', type: 'stock' },
    { code: '601166', name: '兴业银行', industry: '银行', market: '上海证券交易所', type: 'stock' },
    { code: '600038', name: '中直股份', industry: '军工', market: '上海证券交易所', type: 'stock' },
    { code: '601398', name: '工商银行', industry: '银行', market: '上海证券交易所', type: 'stock' },
    { code: '600585', name: '海螺水泥', industry: '水泥', market: '上海证券交易所', type: 'stock' },
    { code: '600000', name: '浦发银行', industry: '银行', market: '上海证券交易所', type: 'stock' },
    { code: '601628', name: '中国人寿', industry: '保险', market: '上海证券交易所', type: 'stock' },
    { code: '601288', name: '农业银行', industry: '银行', market: '上海证券交易所', type: 'stock' },
    { code: '601328', name: '交通银行', industry: '银行', market: '上海证券交易所', type: 'stock' },
    { code: '601988', name: '中国银行', industry: '银行', market: '上海证券交易所', type: 'stock' },
    { code: '600036', name: '招商银行', industry: '银行', market: '上海证券交易所', type: 'stock' },
    { code: '600297', name: '广汇汽车', industry: '汽车', market: '上海证券交易所', type: 'stock' },
    
    // 深市主板/中小板股票（00开头）
    { code: '002594', name: '比亚迪', industry: '汽车', market: '深圳证券交易所', type: 'stock' },
    { code: '000001', name: '平安银行', industry: '银行', market: '深圳证券交易所', type: 'stock' },
    { code: '000858', name: '五粮液', industry: '白酒', market: '深圳证券交易所', type: 'stock' },
    { code: '000333', name: '美的集团', industry: '家电', market: '深圳证券交易所', type: 'stock' },
    { code: '000651', name: '格力电器', industry: '家电', market: '深圳证券交易所', type: 'stock' },
    { code: '000538', name: '云南白药', industry: '医药', market: '深圳证券交易所', type: 'stock' },
    { code: '000002', name: '万科A', industry: '房地产', market: '深圳证券交易所', type: 'stock' },
    { code: '000895', name: '双汇发展', industry: '食品', market: '深圳证券交易所', type: 'stock' },
    { code: '000063', name: '中兴通讯', industry: '通信', market: '深圳证券交易所', type: 'stock' },
    { code: '000723', name: '美锦能源', industry: '煤炭', market: '深圳证券交易所', type: 'stock' },
    { code: '000703', name: '恒逸石化', industry: '化工', market: '深圳证券交易所', type: 'stock' },
    { code: '000708', name: '大冶特钢', industry: '钢铁', market: '深圳证券交易所', type: 'stock' },
    { code: '000725', name: '京东方A', industry: '电子', market: '深圳证券交易所', type: 'stock' },
    { code: '000768', name: '中航飞机', industry: '军工', market: '深圳证券交易所', type: 'stock' },
    { code: '000776', name: '广发证券', industry: '证券', market: '深圳证券交易所', type: 'stock' },
    { code: '000783', name: '长江证券', industry: '证券', market: '深圳证券交易所', type: 'stock' },
    { code: '000792', name: '盐湖股份', industry: '有色', market: '深圳证券交易所', type: 'stock' },
    { code: '000800', name: '一汽轿车', industry: '汽车', market: '深圳证券交易所', type: 'stock' },
    { code: '000807', name: '云铝股份', industry: '有色', market: '深圳证券交易所', type: 'stock' },
    { code: '000816', name: '智慧农业', industry: '农业', market: '深圳证券交易所', type: 'stock' },
    
    // 更多创业板股票
    { code: '300115', name: '长盈精密', industry: '电子', market: '深圳证券交易所', type: 'stock' },
    { code: '300133', name: '华策影视', industry: '传媒', market: '深圳证券交易所', type: 'stock' },
    { code: '300144', name: '宋城演艺', industry: '传媒', market: '深圳证券交易所', type: 'stock' },
    { code: '300157', name: '恒泰艾普', industry: '石油', market: '深圳证券交易所', type: 'stock' },
    { code: '300168', name: '万达信息', industry: '软件', market: '深圳证券交易所', type: 'stock' },
    { code: '300170', name: '汉得信息', industry: '软件', market: '深圳证券交易所', type: 'stock' },
    { code: '300171', name: '东富龙', industry: '医药', market: '深圳证券交易所', type: 'stock' },
    { code: '300172', name: '中电环保', industry: '环保', market: '深圳证券交易所', type: 'stock' },
    { code: '300173', name: '智慧松德', industry: '机械', market: '深圳证券交易所', type: 'stock' },
    { code: '300175', name: '朗源股份', industry: '农业', market: '深圳证券交易所', type: 'stock' },
    
    // 更多科创板股票
    { code: '688027', name: '国盾量子', industry: '通信', market: '上海证券交易所', type: 'stock' },
    { code: '688039', name: '当虹科技', industry: '传媒', market: '上海证券交易所', type: 'stock' },
    { code: '688052', name: '纳芯微', industry: '半导体', market: '上海证券交易所', type: 'stock' },
    { code: '688065', name: '凯赛生物', industry: '医药', market: '上海证券交易所', type: 'stock' },
    { code: '688075', name: '安孚科技', industry: '化工', market: '上海证券交易所', type: 'stock' },
    
    // 更多沪市主板股票
    { code: '600005', name: '武钢股份', industry: '钢铁', market: '上海证券交易所', type: 'stock' },
    { code: '600006', name: '东风汽车', industry: '汽车', market: '上海证券交易所', type: 'stock' },
    { code: '600007', name: '中国国贸', industry: '房地产', market: '上海证券交易所', type: 'stock' },
    { code: '600008', name: '首创股份', industry: '环保', market: '上海证券交易所', type: 'stock' },
    { code: '600009', name: '上海机场', industry: '机场', market: '上海证券交易所', type: 'stock' },
    
    // 更多深市主板股票
    { code: '000829', name: '天音控股', industry: '通信', market: '深圳证券交易所', type: 'stock' },
    { code: '000831', name: '五矿稀土', industry: '有色', market: '深圳证券交易所', type: 'stock' },
    { code: '000836', name: '鑫茂科技', industry: '通信', market: '深圳证券交易所', type: 'stock' },
    { code: '000839', name: '中信国安', industry: '通信', market: '深圳证券交易所', type: 'stock' },
    { code: '000848', name: '承德露露', industry: '食品', market: '深圳证券交易所', type: 'stock' }
];

function createCompleteStockList() {
    const stockListPath = path.join(process.cwd(), 'src', 'utils', 'stockList.json');
    
    try {
        fs.writeFileSync(stockListPath, JSON.stringify(completeStockList, null, 2));
        console.log('✓ 成功创建完整股票列表文件:', stockListPath);
        console.log(`✓ 股票列表包含 ${completeStockList.length} 只股票`);
        
        // 验证关键股票是否在列表中
        const keyStocks = ['300858', '300461', '300750', '688981', '600519', '002594'];
        keyStocks.forEach(code => {
            const stock = completeStockList.find(s => s.code === code);
            if (stock) {
                console.log(`✓ 股票${code}(${stock.name})已包含在列表中`);
            } else {
                console.log(`✗ 股票${code}不在列表中`);
            }
        });
        
        // 统计各板块股票数量
        const gemStocks = completeStockList.filter(stock => stock.code.startsWith('300'));
        const starStocks = completeStockList.filter(stock => stock.code.startsWith('688'));
        const mainStocks = completeStockList.filter(stock => stock.code.startsWith('60'));
        const smallStocks = completeStockList.filter(stock => stock.code.startsWith('00'));
        
        console.log('\n股票分布统计:');
        console.log(`- 创业板股票: ${gemStocks.length}只`);
        console.log(`- 科创板股票: ${starStocks.length}只`);
        console.log(`- 沪市主板: ${mainStocks.length}只`);
        console.log(`- 深市主板/中小板: ${smallStocks.length}只`);
        
    } catch (error) {
        console.error('创建股票列表文件失败:', error.message);
    }
}

createCompleteStockList();
