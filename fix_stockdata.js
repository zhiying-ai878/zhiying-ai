
const fs = require('fs');
const path = require('path');

// 文件路径
const filePath = path.join(__dirname, 'src/utils/stockData.ts');

console.log('正在读取文件...');
let content = fs.readFileSync(filePath, 'utf8');

console.log('正在修复HTML实体...');
// 把 &lt; 替换回 <
content = content.replace(/&lt;/g, '<');

// 同时删除多余的if块
const findStr = `
            // 如果还是乱码，用默认名称
            if (!name || name.length < 2 || name.includes('锟') || name.includes('拷')) {
              name = \`股票\${code}\`;
            }
            
            if (name.includes('锟') || name.includes('拷') || name.length < 2) {
              // 对于301197等特定股票使用硬编码名称
              const knownStockNames: Record<string, string> = {
                '301197': '华如科技',
                '002594': '比亚迪',
                '600519': '贵州茅台',
                '000001': '上证指数',
                '399001': '深证成指',
                '399006': '创业板指',
                '000688': '科创50',
                'sh600519': '贵州茅台',
                'sz002594': '比亚迪',
                'sz301197': '华如科技',
                'sz000001': '平安银行',
                'sh000001': '上证指数',
                'sz399001': '深证成指',
                'sz399006': '创业板指',
                'sh000688': '科创50'
              };
              name = knownStockNames[code] || \`股票\${code}\`;
            }
            // 如果清理后为空，使用股票代码
            name = name || \`股票\${code}\`;
`;
const replaceStr = '';
content = content.split(findStr).join(replaceStr);

// 保存文件
fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ 文件修复成功！');
