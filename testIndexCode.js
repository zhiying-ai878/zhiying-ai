
// 测试指数代码识别逻辑
function isIndexCode(code) {
    const indexPatterns = [
        /^sh000\d{3}$/, // 上证指数系列
        /^sz399\d{3}$/, // 深证指数系列
        /^sh000001$/, // 上证指数
        /^sz399001$/, // 深证成指
        /^sh000300$/, // 沪深300
        /^sh000016$/, // 上证50
        /^sz399005$/, // 中小板指
        /^sz399006$/, // 创业板指
        /^sh000905$/, // 中证500
    ];
    return indexPatterns.some(pattern => pattern.test(code));
}

// 测试各种指数代码
const testCodes = [
    'sh000001', // 上证指数
    'sz399001', // 深证成指
    'sz399006', // 创业板指
    'sh000688', // 科创综指
    'sh000300', // 沪深300
    'sh000016', // 上证50
    'sz399005', // 中小板指
    'sh000905', // 中证500
];

console.log('指数代码识别测试:');
testCodes.forEach(code => {
    const isIndex = isIndexCode(code);
    console.log(`${code}: ${isIndex ? '✓ 是指数' : '✗ 不是指数'}`);
    
    // 测试正则表达式匹配
    const matchPattern = /^sh000\d{3}$/;
    const matchesPattern = matchPattern.test(code);
    console.log(`  ${code} 匹配 /^sh000\\d{3}$/: ${matchesPattern}`);
});
