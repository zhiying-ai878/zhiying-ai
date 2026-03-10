// 大语言模型集成
import { OpenAI } from 'openai';
// 金融知识库
export const financeKnowledgeBase = `
# 金融投资知识库

## 市场分析
- 上证指数：上海证券交易所综合股价指数，反映上海证券交易所上市股票价格的变动情况
- 深证成指：深圳证券交易所成份股价指数，反映深圳证券交易所上市股票价格的变动情况
- 创业板指：创业板指数，反映创业板股票价格的变动情况
- 科创板指：科创板指数，反映科创板股票价格的变动情况
- 主力资金：指机构投资者、大户等大额资金的流向
- 北向资金：指通过沪港通、深港通流入A股市场的香港资金
- 南向资金：指通过沪港通、深港通流入港股市场的内地资金
- 融资融券：投资者向证券公司借入资金买入证券或借入证券卖出的交易行为
- 龙虎榜：交易所公布的每日涨跌幅度、换手率等排名靠前的股票交易信息

## 技术指标
- MA：移动平均线，反映股票价格的平均水平，包括MA5、MA10、MA20、MA60、MA120、MA250等不同周期
- MACD：平滑异同移动平均线，用于判断股票价格的趋势和动量，由快线、慢线和柱状图组成
- RSI：相对强弱指标，用于判断股票的超买超卖情况，取值范围0-100
- KDJ：随机指标，用于判断股票价格的强弱，由K线、D线和J线组成
- 布林带：用于判断股票价格的波动范围，由上轨、中轨和下轨组成
- WR：威廉指标，用于判断股票的超买超卖情况，取值范围0-100
- CCI：顺势指标，用于判断股票价格是否超出常态分布范围
- ROC：变动率指标，用于衡量股票价格的变化速度
- OBV：能量潮指标，用于衡量成交量与价格之间的关系
- PSY：心理线指标，用于衡量市场情绪
- BIAS：乖离率，用于衡量股票价格与移动平均线之间的偏离程度
- DMI：趋向指标，用于判断股票价格的趋势强度
- SAR：抛物线转向指标，用于判断股票价格的转折点
- TRIX：三重指数平滑平均线，用于判断股票价格的长期趋势
- MACD柱状图：MACD指标的组成部分，反映多空力量的变化
- 成交量：股票交易的数量，反映市场活跃度
- 换手率：股票成交量与流通股本的比率，反映股票的活跃程度

## 基本面分析
- 市盈率（PE）：股票价格与每股收益的比率，反映股票的估值水平
- 市净率（PB）：股票价格与每股净资产的比率，反映股票的估值水平
- 净资产收益率（ROE）：净利润与平均股东权益的比率，反映公司的盈利能力
- 总资产收益率（ROA）：净利润与平均总资产的比率，反映公司的资产利用效率
- 营业收入增长率：反映公司的成长能力
- 净利润增长率：反映公司的盈利增长能力
- 资产负债率：总负债与总资产的比率，反映公司的偿债能力
- 流动比率：流动资产与流动负债的比率，反映公司的短期偿债能力
- 速动比率：速动资产与流动负债的比率，反映公司的即时偿债能力
- 毛利率：毛利润与营业收入的比率，反映公司的产品盈利能力
- 净利率：净利润与营业收入的比率，反映公司的整体盈利能力
- 每股收益（EPS）：净利润除以总股本，反映公司的每股盈利水平
- 每股净资产（BVPS）：净资产除以总股本，反映公司的每股价值

## 投资策略
- 价值投资：基于股票内在价值进行投资，寻找被低估的股票
- 成长投资：投资于具有高成长潜力的公司，关注公司的成长速度
- 趋势投资：基于股票价格趋势进行投资，跟随市场趋势
- 动量投资：基于股票价格动量进行投资，买入近期表现强势的股票
- 逆向投资：投资于被市场低估的股票，反向操作
- 量化投资：使用数学模型和计算机算法进行投资决策
- 指数投资：投资于指数基金，获得市场平均收益
- 行业轮动：根据行业周期进行投资，在不同行业之间切换
- 主题投资：基于特定主题或概念进行投资，如新能源、人工智能等

## 风险控制
- 止损：设置止损位，控制投资损失
- 止盈：设置止盈位，锁定投资收益
- 仓位管理：合理分配投资资金，控制单一股票的仓位
- 分散投资：投资于不同行业、不同类型的股票，降低风险
- 风险评估：评估投资风险，制定相应的投资策略
- 资金管理：合理管理投资资金，避免过度杠杆
- 情绪控制：保持理性投资心态，避免情绪化决策

## 市场热点
- 半导体：芯片设计、制造、封测、半导体设备等相关公司
- 人工智能：AI芯片、AI应用、AI算法、大模型等相关公司
- 新能源：新能源汽车、光伏、风电、储能、氢能等相关公司
- 消费：食品饮料、医药、零售、免税、电商等相关公司
- 金融：银行、保险、券商、金融科技等相关公司
- 医药：创新药、医疗器械、医疗服务、生物技术等相关公司
- 科技：云计算、大数据、物联网、5G等相关公司
- 高端制造：智能制造、工业机器人、高端装备等相关公司
- 新材料：半导体材料、新能源材料、先进复合材料等相关公司
- 国防军工：军工电子、航空航天、船舶制造等相关公司

## 股票推荐原则
- 基本面良好：盈利能力强、成长性好、财务状况健康
- 技术面支撑：股价处于上升趋势，技术指标向好
- 行业前景：所属行业处于上升周期，有政策支持
- 估值合理：市盈率、市净率等估值指标合理
- 资金关注：有主力资金流入，市场关注度高
- 催化剂：有潜在的利好因素，如业绩超预期、政策支持、行业景气度提升等
- 竞争优势：公司具有独特的竞争优势，如技术领先、品牌价值、成本优势等
- 管理层：公司管理层能力强，战略清晰

## 宏观经济指标
- GDP：国内生产总值，反映经济规模和增长速度
- CPI：消费者价格指数，反映通货膨胀水平
- PPI：生产者价格指数，反映工业产品价格水平
- PMI：采购经理指数，反映制造业景气程度
- 利率：包括存贷款利率，影响企业融资成本和居民储蓄
- 汇率：人民币兑美元汇率，影响进出口和外资流入
- 货币供应量：M2等指标，反映市场流动性
- 财政政策：政府的财政支出和税收政策
- 货币政策：中央银行的货币供应量和利率政策
`;
// 系统提示词
export const systemPrompt = `
你是智盈AI投资助手，一个专业的金融投资顾问。你的任务是：

1. 基于用户的问题，提供专业、准确的金融投资分析和建议
2. 结合金融知识库中的信息，给出有针对性的回答
3. 保持客观中立的态度，不做确定性的投资预测
4. 提供具体的投资建议时，要包含风险提示
5. 回答要清晰、有条理，使用适当的格式和标签
6. 当用户询问具体股票时，要分析其基本面、技术面和行业前景
7. 当用户询问市场趋势时，要分析当前市场环境、资金流向和热点板块
8. 当用户询问投资策略时，要根据不同的风险偏好提供相应的策略建议

请记住：你的回答仅供参考，不构成投资建议。投资者应该根据自己的风险承受能力和投资目标做出投资决策。
`;
// LLM集成类
export class LLMIntegration {
    constructor(config = {}) {
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "history", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "openai", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        this.config = {
            model: config.model || 'gpt',
            apiKey: config.apiKey || '',
            baseUrl: config.baseUrl || '',
            temperature: config.temperature || 0.7,
            maxTokens: config.maxTokens || 1000
        };
        // 初始化OpenAI客户端
        if (this.config.apiKey) {
            this.openai = new OpenAI({
                apiKey: this.config.apiKey,
                baseURL: this.config.baseUrl
            });
        }
        // 添加系统提示词
        this.history.push({ role: 'system', content: systemPrompt + financeKnowledgeBase });
    }
    // 设置API密钥
    setApiKey(apiKey) {
        this.config.apiKey = apiKey;
        // 初始化OpenAI客户端
        this.openai = new OpenAI({
            apiKey: this.config.apiKey,
            baseURL: this.config.baseUrl
        });
    }
    // 设置模型类型
    setModel(model) {
        this.config.model = model;
    }
    // 添加用户消息
    addUserMessage(content) {
        this.history.push({ role: 'user', content });
    }
    // 添加助手消息
    addAssistantMessage(content) {
        this.history.push({ role: 'assistant', content });
    }
    // 清空历史记录
    clearHistory() {
        this.history = [{ role: 'system', content: systemPrompt + financeKnowledgeBase }];
    }
    // 获取响应
    async getResponse() {
        const startTime = Date.now();
        let content;
        let model;
        let promptTokens = 0;
        let completionTokens = 0;
        // 检查是否有OpenAI客户端
        if (this.openai) {
            try {
                // 调用真实的OpenAI API
                const completion = await this.openai.chat.completions.create({
                    model: this.config.model === 'gpt' ? 'gpt-3.5-turbo' : this.config.model,
                    messages: this.history.map(item => ({
                        role: item.role,
                        content: item.content
                    })),
                    temperature: this.config.temperature,
                    max_tokens: this.config.maxTokens
                });
                content = completion.choices[0].message.content || '抱歉，我无法生成响应。';
                model = completion.model;
                promptTokens = completion.usage?.prompt_tokens || 0;
                completionTokens = completion.usage?.completion_tokens || 0;
            }
            catch (error) {
                console.error('OpenAI API调用失败:', error);
                // 失败时使用模拟响应
                content = this.generateMockResponse(this.history[this.history.length - 1].content);
                model = this.config.model;
                promptTokens = Math.floor(Math.random() * 100) + 50;
                completionTokens = Math.floor(Math.random() * 200) + 100;
            }
        }
        else {
            // 没有OpenAI客户端时使用模拟响应
            await new Promise(resolve => setTimeout(resolve, 1000));
            content = this.generateMockResponse(this.history[this.history.length - 1].content);
            model = this.config.model;
            promptTokens = Math.floor(Math.random() * 100) + 50;
            completionTokens = Math.floor(Math.random() * 200) + 100;
        }
        const response = {
            content,
            model,
            tokens: {
                prompt: promptTokens,
                completion: completionTokens
            },
            latency: Date.now() - startTime
        };
        // 添加助手消息到历史记录
        this.addAssistantMessage(response.content);
        return response;
    }
    // 生成模拟响应
    generateMockResponse(userInput) {
        const lowerInput = userInput.toLowerCase();
        if (lowerInput.includes('分析') && lowerInput.includes('市场')) {
            return '📊 **市场分析报告**\n\n**大盘指数：**\n• 上证指数：3258.63 +0.03%\n• 深证成指：11164.26 +1.17%\n• 创业板指：2260.85 +1.26%\n\n**市场情绪：**\n• 资金流向：主力资金净流入256.8亿元\n• 涨跌比：2856:1523\n• 涨停家数：89家，跌停家数：12家\n\n**市场热点：**\n科技股集体上涨，半导体、人工智能板块表现强势。建议关注：半导体设备、AI应用、新能源产业链。\n\n**风险提示：** 市场短期波动较大，建议控制仓位，谨慎操作。';
        }
        if (lowerInput.includes('热点') || lowerInput.includes('板块')) {
            return '🔥 **今日热点板块分析**\n\n**涨幅榜前5板块：**\n1. 半导体：+5.23% - AI芯片需求旺盛\n2. 人工智能：+4.87% - 大模型应用落地\n3. 新能源汽车：+3.65% - 销量超预期\n4. 光伏储能：+3.12% - 政策利好\n5. 军工航天：+2.89% - 行业景气度提升\n\n**资金净流入前3：**\n• 半导体：+68.5亿元\n• 人工智能：+52.3亿元\n• 新能源汽车：+45.8亿元\n\n**建议关注：** 板块轮动加快，建议控制仓位，分批布局。';
        }
        if (lowerInput.includes('策略') || lowerInput.includes('投资')) {
            return '📈 **投资策略建议**\n\n**当前市场策略：**\n\n1. **趋势跟踪策略**（适合当前市场）\n• 突破20日均线买入，跌破10日均线卖出\n• 适合强势板块和龙头股\n\n2. **波段操作策略**\n• RSI < 30买入，RSI > 70卖出\n• 配合MACD金叉死叉确认\n\n3. **价值投资策略**\n• 选择低PE、高ROE的优质公司\n• 长期持有，忽略短期波动\n\n**风险控制建议：**\n• 单股仓位不超过总资金20%\n• 设置5-10%止损位\n• 总仓位控制在60-80%\n\n**仓位管理：**\n• 核心仓位：40-50%（长期持有）\n• 波段仓位：20-30%（灵活操作）\n• 现金储备：20-30%（等待机会）';
        }
        if (lowerInput.includes('推荐') || lowerInput.includes('股票')) {
            return '🎯 **股票观察名单**\n\n**科技板块：**\n• 600584 长电科技 - 半导体封装龙头\n• 300750 宁德时代 - 新能源电池龙头\n• 002415 海康威视 - AI安防龙头\n\n**消费板块：**\n• 600519 贵州茅台 - 白酒龙头\n• 000858 五粮液 - 白酒龙头\n• 600887 伊利股份 - 乳业龙头\n\n**金融板块：**\n• 600036 招商银行 - 银行龙头\n• 601318 中国平安 - 保险龙头\n\n**新能源板块：**\n• 002594 比亚迪 - 新能源车龙头\n• 300274 阳光电源 - 光伏龙头\n\n⚠️ 免责声明：以上仅为观察名单，不构成投资建议。股市有风险，投资需谨慎！请结合自身分析做出投资决策。';
        }
        if (lowerInput.includes('技术') || lowerInput.includes('指标')) {
            return '📊 **技术指标分析指南**\n\n**常用技术指标：**\n\n1. **MACD**\n• 金叉：短期均线上穿长期均线，买入信号\n• 死叉：短期均线下穿长期均线，卖出信号\n• 背离：价格与MACD走势相反，反转信号\n\n2. **RSI**\n• RSI > 70：超买，可能回调\n• RSI < 30：超卖，可能反弹\n• RSI背离：价格创新高/低，RSI未创新高/低\n\n3. **KDJ**\n• K线金叉D线：买入信号\n• K线死叉D线：卖出信号\n• J值 > 100：超买，J值 < 0：超卖\n\n4. **布林带**\n• 价格突破上轨：可能继续上涨\n• 价格跌破下轨：可能继续下跌\n• 布林带收窄：可能即将突破\n\n**应用建议：** 结合多个技术指标进行分析，避免单一指标的误判。';
        }
        return '感谢您的提问！\n\n作为AI投资助手，我可以为您提供以下服务：\n\n📊 市场分析与走势判断\n🔥 热点板块与题材挖掘\n📈 投资策略与交易建议\n⚙️ 技术指标解读与应用\n⚠️ 风险控制与仓位管理\n\n您可以点击下方的快捷问题按钮，或者直接输入您想了解的内容！\n\n💡 提示：试试问我"分析市场"、"热点板块"、"投资策略"等问题！';
    }
    // 分析股票
    async analyzeStock(stockCode, stockName) {
        const prompt = `请分析股票 ${stockName} (${stockCode}) 的投资价值，包括：\n1. 基本面分析（财务状况、盈利能力、成长性、估值水平）\n2. 技术面分析（价格趋势、技术指标、量能分析）\n3. 行业前景分析（行业地位、竞争优势、行业趋势）\n4. 资金流向分析（主力资金、北向资金、融资融券）\n5. 投资建议和风险提示\n6. 目标价和操作策略`;
        this.addUserMessage(prompt);
        return this.getResponse();
    }
    // 分析市场
    async analyzeMarket() {
        const prompt = '请分析当前A股市场的整体走势，包括：\n1. 大盘指数表现（上证指数、深证成指、创业板指、科创板指）\n2. 市场热点板块分析（涨幅、资金流入、行业逻辑）\n3. 资金流向分析（北向资金、主力资金、融资融券）\n4. 宏观经济环境分析（政策面、资金面、基本面）\n5. 短期市场展望和风险提示\n6. 投资策略建议和仓位管理';
        this.addUserMessage(prompt);
        return this.getResponse();
    }
    // 提供投资策略
    async provideStrategy(riskLevel) {
        const prompt = `请为${riskLevel === 'low' ? '保守型' : riskLevel === 'medium' ? '稳健型' : '激进型'}投资者提供一套完整的投资策略，包括：\n1. 资产配置建议（股票、债券、现金等比例）\n2. 行业选择和轮动策略\n3. 选股标准和方法\n4. 买入卖出策略和时机选择\n5. 风险控制措施和止损策略\n6. 仓位管理和资金分配\n7. 投资心态和情绪管理`;
        this.addUserMessage(prompt);
        return this.getResponse();
    }
    // 分析行业
    async analyzeIndustry(industry) {
        const prompt = `请分析${industry}行业的投资机会，包括：\n1. 行业基本情况（产业链、竞争格局、市场规模）\n2. 行业发展趋势和前景\n3. 政策环境和支持力度\n4. 行业内主要公司分析\n5. 投资机会和风险提示\n6. 相关股票推荐`;
        this.addUserMessage(prompt);
        return this.getResponse();
    }
    // 分析宏观经济
    async analyzeMacroEconomy() {
        const prompt = '请分析当前宏观经济形势，包括：\n1. 国内经济增长情况（GDP、PMI等指标）\n2. 通货膨胀水平（CPI、PPI）\n3. 货币政策和财政政策\n4. 国际经济环境和影响\n5. 对A股市场的影响分析\n6. 投资策略建议';
        this.addUserMessage(prompt);
        return this.getResponse();
    }
    // 分析资金流向
    async analyzeFundFlow() {
        const prompt = '请分析当前A股市场的资金流向情况，包括：\n1. 北向资金流向分析\n2. 主力资金流向分析\n3. 行业资金流向排名\n4. 个股资金流向TOP10\n5. 资金流向对市场的影响\n6. 投资机会分析';
        this.addUserMessage(prompt);
        return this.getResponse();
    }
    // 提供个性化投资建议
    async providePersonalizedAdvice(investmentAmount, riskLevel, investmentHorizon) {
        const horizonMap = { short: '短期（1年以内）', medium: '中期（1-3年）', long: '长期（3年以上）' };
        const prompt = `请为投资金额${investmentAmount}元、风险偏好${riskLevel === 'low' ? '保守型' : riskLevel === 'medium' ? '稳健型' : '激进型'}、投资期限${horizonMap[investmentHorizon]}的投资者提供个性化投资建议，包括：\n1. 资产配置方案\n2. 行业选择建议\n3. 具体股票推荐\n4. 买入时机和价格建议\n5. 持有策略和止盈止损建议\n6. 风险控制措施`;
        this.addUserMessage(prompt);
        return this.getResponse();
    }
}
// 创建LLM实例
export const createLLM = (config = {}) => {
    return new LLMIntegration(config);
};
// 全局LLM实例
let llmInstance = null;
export const getLLM = () => {
    if (!llmInstance) {
        llmInstance = createLLM();
    }
    return llmInstance;
};
