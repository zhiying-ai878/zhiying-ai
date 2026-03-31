// 基础股票列表 - 作为备用数据源
// 包含A股主要股票和指数

export const baseStockList = [
    // 上证指数
    { code: 'sh000001', name: '上证指数', industry: '指数', market: '上海证券交易所', type: 'index' },
    { code: 'sz399001', name: '深证成指', industry: '指数', market: '深圳证券交易所', type: 'index' },
    { code: 'sz399006', name: '创业板指', industry: '指数', market: '深圳证券交易所', type: 'index' },
    { code: 'sh000688', name: '科创综指', industry: '指数', market: '上海证券交易所', type: 'index' },
    
    // 金融板块
    { code: '601318', name: '中国平安', industry: '金融', market: '上海证券交易所', type: 'stock' },
    { code: '600036', name: '招商银行', industry: '金融', market: '上海证券交易所', type: 'stock' },
    { code: '601166', name: '兴业银行', industry: '金融', market: '上海证券交易所', type: 'stock' },
    { code: '600276', name: '恒瑞医药', industry: '医药', market: '上海证券交易所', type: 'stock' },
    
    // 科技板块
    { code: '000063', name: '中兴通讯', industry: '科技', market: '深圳证券交易所', type: 'stock' },
    { code: '002594', name: '比亚迪', industry: '科技', market: '深圳证券交易所', type: 'stock' },
    { code: '600519', name: '贵州茅台', industry: '消费', market: '上海证券交易所', type: 'stock' },
    { code: '601888', name: '中国中免', industry: '消费', market: '上海证券交易所', type: 'stock' },
    
    // 新能源
    { code: '300750', name: '宁德时代', industry: '新能源', market: '深圳证券交易所', type: 'stock' },
    { code: '601899', name: '紫金矿业', industry: '材料', market: '上海证券交易所', type: 'stock' },
    
    // 互联网
    { code: '000002', name: '万科A', industry: '房地产', market: '深圳证券交易所', type: 'stock' },
    { code: '600031', name: '三一重工', industry: '工业', market: '上海证券交易所', type: 'stock' },
    { code: '600887', name: '伊利股份', industry: '消费', market: '上海证券交易所', type: 'stock' },
    
    // 半导体
    { code: '600703', name: '三安光电', industry: '半导体', market: '上海证券交易所', type: 'stock' },
    { code: '002079', name: '苏州固锝', industry: '半导体', market: '深圳证券交易所', type: 'stock' },
    
    // 医药
    { code: '600276', name: '恒瑞医药', industry: '医药', market: '上海证券交易所', type: 'stock' },
    { code: '600518', name: '康美药业', industry: '医药', market: '上海证券交易所', type: 'stock' },
    
    // 消费
    { code: '600887', name: '伊利股份', industry: '消费', market: '上海证券交易所', type: 'stock' },
    { code: '000858', name: '五粮液', industry: '消费', market: '深圳证券交易所', type: 'stock' },
    
    // 其他重要股票
    { code: '600000', name: '浦发银行', industry: '金融', market: '上海证券交易所', type: 'stock' },
    { code: '601628', name: '中国人寿', industry: '金融', market: '上海证券交易所', type: 'stock' },
    { code: '601899', name: '紫金矿业', industry: '材料', market: '上海证券交易所', type: 'stock' },
    { code: '601398', name: '工商银行', industry: '金融', market: '上海证券交易所', type: 'stock' },
    { code: '601288', name: '农业银行', industry: '金融', market: '上海证券交易所', type: 'stock' },
    { code: '601988', name: '中国银行', industry: '金融', market: '上海证券交易所', type: 'stock' },
    { code: '601328', name: '交通银行', industry: '金融', market: '上海证券交易所', type: 'stock' },
    
    // 科技股
    { code: '600036', name: '招商银行', industry: '金融', market: '上海证券交易所', type: 'stock' },
    { code: '600519', name: '贵州茅台', industry: '消费', market: '上海证券交易所', type: 'stock' },
    { code: '000858', name: '五粮液', industry: '消费', market: '深圳证券交易所', type: 'stock' },
    { code: '601888', name: '中国中免', industry: '消费', market: '上海证券交易所', type: 'stock' },
    
    // 新能源汽车
    { code: '002594', name: '比亚迪', industry: '新能源', market: '深圳证券交易所', type: 'stock' },
    { code: '300750', name: '宁德时代', industry: '新能源', market: '深圳证券交易所', type: 'stock' },
    
    // 半导体
    { code: '600703', name: '三安光电', industry: '半导体', market: '上海证券交易所', type: 'stock' },
    { code: '002079', name: '苏州固锝', industry: '半导体', market: '深圳证券交易所', type: 'stock' },
    { code: '600584', name: '长电科技', industry: '半导体', market: '上海证券交易所', type: 'stock' },
    
    // 医药生物
    { code: '600276', name: '恒瑞医药', industry: '医药', market: '上海证券交易所', type: 'stock' },
    { code: '600518', name: '康美药业', industry: '医药', market: '上海证券交易所', type: 'stock' },
    { code: '000661', name: '长春高新', industry: '医药', market: '深圳证券交易所', type: 'stock' },
    
    // 互联网科技
    { code: '000063', name: '中兴通讯', industry: '科技', market: '深圳证券交易所', type: 'stock' },
    { code: '600410', name: '华胜天成', industry: '科技', market: '上海证券交易所', type: 'stock' },
    { code: '002230', name: '科大讯飞', industry: '科技', market: '深圳证券交易所', type: 'stock' },
    
    // 工业制造
    { code: '600031', name: '三一重工', industry: '工业', market: '上海证券交易所', type: 'stock' },
    { code: '601100', name: '恒立液压', industry: '工业', market: '上海证券交易所', type: 'stock' },
    { code: '000651', name: '格力电器', industry: '工业', market: '深圳证券交易所', type: 'stock' },
    
    // 房地产
    { code: '000002', name: '万科A', industry: '房地产', market: '深圳证券交易所', type: 'stock' },
    { code: '600048', name: '保利发展', industry: '房地产', market: '上海证券交易所', type: 'stock' },
    { code: '600383', name: '金地集团', industry: '房地产', market: '上海证券交易所', type: 'stock' },
    
    // 材料
    { code: '601899', name: '紫金矿业', industry: '材料', market: '上海证券交易所', type: 'stock' },
    { code: '600549', name: '厦门钨业', industry: '材料', market: '上海证券交易所', type: 'stock' },
    { code: '000897', name: '津滨发展', industry: '房地产', market: '深圳证券交易所', type: 'stock' },
    
    // 公用事业
    { code: '600011', name: '华能国际', industry: '公用事业', market: '上海证券交易所', type: 'stock' },
    { code: '600027', name: '华电国际', industry: '公用事业', market: '上海证券交易所', type: 'stock' },
    { code: '601991', name: '大唐发电', industry: '公用事业', market: '上海证券交易所', type: 'stock' },
    
    // 通信
    { code: '600050', name: '中国联通', industry: '通信', market: '上海证券交易所', type: 'stock' },
    { code: '600487', name: '亨通光电', industry: '通信', market: '上海证券交易所', type: 'stock' },
    { code: '600522', name: '中天科技', industry: '通信', market: '上海证券交易所', type: 'stock' },
    
    // 能源
    { code: '601857', name: '中国石油', industry: '能源', market: '上海证券交易所', type: 'stock' },
    { code: '600028', name: '中国石化', industry: '能源', market: '上海证券交易所', type: 'stock' },
    { code: '601018', name: '宁波港', industry: '能源', market: '上海证券交易所', type: 'stock' },
    
    // 其他重要指数
    { code: 'sh000300', name: '沪深300', industry: '指数', market: '上海证券交易所', type: 'index' },
    { code: 'sh000016', name: '上证50', industry: '指数', market: '上海证券交易所', type: 'index' },
    { code: 'sz399005', name: '中小板指', industry: '指数', market: '深圳证券交易所', type: 'index' },
    { code: 'sz399008', name: '创业板综', industry: '指数', market: '深圳证券交易所', type: 'index' },
    { code: 'sh000015', name: '上证红利', industry: '指数', market: '上海证券交易所', type: 'index' },
    { code: 'sh000012', name: '上证国债', industry: '指数', market: '上海证券交易所', type: 'index' },
    
    // 科创板股票
    { code: '688981', name: '中芯国际', industry: '半导体', market: '上海证券交易所', type: 'stock' },
    { code: '688008', name: '澜起科技', industry: '半导体', market: '上海证券交易所', type: 'stock' },
    { code: '688189', name: '南微医学', industry: '医药', market: '上海证券交易所', type: 'stock' },
    
    // 创业板股票
    { code: '300059', name: '东方财富', industry: '金融', market: '深圳证券交易所', type: 'stock' },
    { code: '300104', name: '乐视网', industry: '科技', market: '深圳证券交易所', type: 'stock' },
    { code: '300251', name: '光线传媒', industry: '传媒', market: '深圳证券交易所', type: 'stock' },
    
    // 主板股票
    { code: '600036', name: '招商银行', industry: '金融', market: '上海证券交易所', type: 'stock' },
    { code: '600519', name: '贵州茅台', industry: '消费', market: '上海证券交易所', type: 'stock' },
    { code: '601318', name: '中国平安', industry: '金融', market: '上海证券交易所', type: 'stock' },
    { code: '601888', name: '中国中免', industry: '消费', market: '上海证券交易所', type: 'stock' },
    { code: '600276', name: '恒瑞医药', industry: '医药', market: '上海证券交易所', type: 'stock' },
    { code: '600887', name: '伊利股份', industry: '消费', market: '上海证券交易所', type: 'stock' },
    
    // 深圳主板
    { code: '000001', name: '平安银行', industry: '金融', market: '深圳证券交易所', type: 'stock' },
    { code: '000002', name: '万科A', industry: '房地产', market: '深圳证券交易所', type: 'stock' },
    { code: '000009', name: '中国宝安', industry: '房地产', market: '深圳证券交易所', type: 'stock' },
    { code: '000063', name: '中兴通讯', industry: '科技', market: '深圳证券交易所', type: 'stock' },
    { code: '000069', name: '华侨城A', industry: '房地产', market: '深圳证券交易所', type: 'stock' },
    { code: '000088', name: '盐田港', industry: '物流', market: '深圳证券交易所', type: 'stock' },
    { code: '000089', name: '深圳机场', industry: '交通', market: '深圳证券交易所', type: 'stock' },
    { code: '000099', name: '中信海直', industry: '交通', market: '深圳证券交易所', type: 'stock' },
    
    // 中小板股票
    { code: '002001', name: '新和成', industry: '医药', market: '深圳证券交易所', type: 'stock' },
    { code: '002007', name: '华兰生物', industry: '医药', market: '深圳证券交易所', type: 'stock' },
    { code: '002024', name: '苏宁易购', industry: '零售', market: '深圳证券交易所', type: 'stock' },
    { code: '002027', name: '分众传媒', industry: '传媒', market: '深圳证券交易所', type: 'stock' },
    { code: '002038', name: '双鹭药业', industry: '医药', market: '深圳证券交易所', type: 'stock' },
    { code: '002041', name: '登海种业', industry: '农业', market: '深圳证券交易所', type: 'stock' },
    { code: '002049', name: '紫光国微', industry: '半导体', market: '深圳证券交易所', type: 'stock' },
    
    // 其他重要股票
    { code: '600036', name: '招商银行', industry: '金融', market: '上海证券交易所', type: 'stock' },
    { code: '600519', name: '贵州茅台', industry: '消费', market: '上海证券交易所', type: 'stock' },
    { code: '601318', name: '中国平安', industry: '金融', market: '上海证券交易所', type: 'stock' },
    { code: '601888', name: '中国中免', industry: '消费', market: '上海证券交易所', type: 'stock' },
    { code: '000858', name: '五粮液', industry: '消费', market: '深圳证券交易所', type: 'stock' },
    { code: '002594', name: '比亚迪', industry: '新能源', market: '深圳证券交易所', type: 'stock' },
    { code: '300750', name: '宁德时代', industry: '新能源', market: '深圳证券交易所', type: 'stock' },
    { code: '600276', name: '恒瑞医药', industry: '医药', market: '上海证券交易所', type: 'stock' },
    { code: '600887', name: '伊利股份', industry: '消费', market: '上海证券交易所', type: 'stock' },
    { code: '600031', name: '三一重工', industry: '工业', market: '上海证券交易所', type: 'stock' },
    { code: '000002', name: '万科A', industry: '房地产', market: '深圳证券交易所', type: 'stock' },
    { code: '600048', name: '保利发展', industry: '房地产', market: '上海证券交易所', type: 'stock' },
    { code: '601899', name: '紫金矿业', industry: '材料', market: '上海证券交易所', type: 'stock' },
    { code: '600703', name: '三安光电', industry: '半导体', market: '上海证券交易所', type: 'stock' },
    { code: '002079', name: '苏州固锝', industry: '半导体', market: '深圳证券交易所', type: 'stock' },
    { code: '600584', name: '长电科技', industry: '半导体', market: '上海证券交易所', type: 'stock' },
    { code: '000661', name: '长春高新', industry: '医药', market: '深圳证券交易所', type: 'stock' },
    { code: '002230', name: '科大讯飞', industry: '科技', market: '深圳证券交易所', type: 'stock' },
    { code: '601100', name: '恒立液压', industry: '工业', market: '上海证券交易所', type: 'stock' },
    { code: '000651', name: '格力电器', industry: '工业', market: '深圳证券交易所', type: 'stock' },
    { code: '600011', name: '华能国际', industry: '公用事业', market: '上海证券交易所', type: 'stock' },
    { code: '600050', name: '中国联通', industry: '通信', market: '上海证券交易所', type: 'stock' },
    { code: '601857', name: '中国石油', industry: '能源', market: '上海证券交易所', type: 'stock' },
    { code: '600028', name: '中国石化', industry: '能源', market: '上海证券交易所', type: 'stock' },
    { code: '688981', name: '中芯国际', industry: '半导体', market: '上海证券交易所', type: 'stock' },
    { code: '300059', name: '东方财富', industry: '金融', market: '深圳证券交易所', type: 'stock' },
    { code: '000001', name: '平安银行', industry: '金融', market: '深圳证券交易所', type: 'stock' },
    { code: '002024', name: '苏宁易购', industry: '零售', market: '深圳证券交易所', type: 'stock' },
    { code: '002049', name: '紫光国微', industry: '半导体', market: '深圳证券交易所', type: 'stock' },
    
    // 最后添加一些重要的指数和股票
    { code: 'sh000001', name: '上证指数', industry: '指数', market: '上海证券交易所', type: 'index' },
    { code: 'sz399001', name: '深证成指', industry: '指数', market: '深圳证券交易所', type: 'index' },
    { code: 'sz399006', name: '创业板指', industry: '指数', market: '深圳证券交易所', type: 'index' },
    { code: 'sh000688', name: '科创综指', industry: '指数', market: '上海证券交易所', type: 'index' },
    { code: 'sh000300', name: '沪深300', industry: '指数', market: '上海证券交易所', type: 'index' },
    { code: 'sh000016', name: '上证50', industry: '指数', market: '上海证券交易所', type: 'index' },
    { code: '600519', name: '贵州茅台', industry: '消费', market: '上海证券交易所', type: 'stock' },
    { code: '000858', name: '五粮液', industry: '消费', market: '深圳证券交易所', type: 'stock' },
    { code: '601318', name: '中国平安', industry: '金融', market: '上海证券交易所', type: 'stock' },
    { code: '600036', name: '招商银行', industry: '金融', market: '上海证券交易所', type: 'stock' },
    { code: '002594', name: '比亚迪', industry: '新能源', market: '深圳证券交易所', type: 'stock' },
    { code: '300750', name: '宁德时代', industry: '新能源', market: '深圳证券交易所', type: 'stock' },
    { code: '600276', name: '恒瑞医药', industry: '医药', market: '上海证券交易所', type: 'stock' },
    { code: '600887', name: '伊利股份', industry: '消费', market: '上海证券交易所', type: 'stock' },
    { code: '600031', name: '三一重工', industry: '工业', market: '上海证券交易所', type: 'stock' },
    { code: '000002', name: '万科A', industry: '房地产', market: '深圳证券交易所', type: 'stock' },
    { code: '600048', name: '保利发展', industry: '房地产', market: '上海证券交易所', type: 'stock' },
    { code: '601899', name: '紫金矿业', industry: '材料', market: '上海证券交易所', type: 'stock' },
    { code: '600703', name: '三安光电', industry: '半导体', market: '上海证券交易所', type: 'stock' },
    { code: '002079', name: '苏州固锝', industry: '半导体', market: '深圳证券交易所', type: 'stock' },
    { code: '600584', name: '长电科技', industry: '半导体', market: '上海证券交易所', type: 'stock' },
    { code: '000661', name: '长春高新', industry: '医药', market: '深圳证券交易所', type: 'stock' },
    { code: '002230', name: '科大讯飞', industry: '科技', market: '深圳证券交易所', type: 'stock' },
    { code: '601100', name: '恒立液压', industry: '工业', market: '上海证券交易所', type: 'stock' },
    { code: '000651', name: '格力电器', industry: '工业', market: '深圳证券交易所', type: 'stock' },
    { code: '600011', name: '华能国际', industry: '公用事业', market: '上海证券交易所', type: 'stock' },
    { code: '600050', name: '中国联通', industry: '通信', market: '上海证券交易所', type: 'stock' },
    { code: '601857', name: '中国石油', industry: '能源', market: '上海证券交易所', type: 'stock' },
    { code: '600028', name: '中国石化', industry: '能源', market: '上海证券交易所', type: 'stock' },
    { code: '688981', name: '中芯国际', industry: '半导体', market: '上海证券交易所', type: 'stock' },
    { code: '300059', name: '东方财富', industry: '金融', market: '深圳证券交易所', type: 'stock' },
    { code: '000001', name: '平安银行', industry: '金融', market: '深圳证券交易所', type: 'stock' },
    { code: '002024', name: '苏宁易购', industry: '零售', market: '深圳证券交易所', type: 'stock' },
    { code: '002049', name: '紫光国微', industry: '半导体', market: '深圳证券交易所', type: 'stock' }
];