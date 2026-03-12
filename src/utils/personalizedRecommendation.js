// 个性化推荐模块
import { getHistoryManager } from './historyManager';
// 股票行业映射
const stockIndustryMap = {
    '002594': '新能源汽车',
    '300750': '新能源',
    '601799': '汽车零部件',
    '000887': '汽车零部件',
    '600519': '白酒',
    '000858': '白酒',
    '600809': '白酒',
    '600779': '白酒',
    '600036': '银行',
    '601318': '保险',
    '000001': '银行',
    '600031': '工程机械',
    '600499': '新能源',
    '002460': '新能源',
    '000333': '家电',
    '600887': '食品饮料',
    '601166': '银行',
    '600276': '医药',
    '601888': '家电',
    '600895': '汽车',
    '002415': '电子',
    '300274': '新能源',
    '000977': '食品饮料',
    '600104': '汽车',
    '600332': '医药',
    '000568': '白酒',
    '600703': '医药'
};
// 股票风险等级
const stockRiskMap = {
    '002594': 'high',
    '300750': 'high',
    '601799': 'medium',
    '000887': 'medium',
    '600519': 'low',
    '000858': 'low',
    '600809': 'medium',
    '600779': 'medium',
    '600036': 'low',
    '601318': 'low',
    '000001': 'low',
    '600031': 'medium',
    '600499': 'high',
    '002460': 'high',
    '000333': 'medium',
    '600887': 'low',
    '601166': 'low',
    '600276': 'medium',
    '601888': 'medium',
    '600895': 'medium',
    '002415': 'high',
    '300274': 'high',
    '000977': 'low',
    '600104': 'medium',
    '600332': 'medium',
    '000568': 'medium',
    '600703': 'medium'
};
class PersonalizedRecommendation {
    constructor() {
        Object.defineProperty(this, "historyManager", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: getHistoryManager()
        });
    }
    // 分析用户偏好
    analyzeUserPreferences() {
        const records = this.historyManager.getRecords();
        const stockFrequency = {};
        const categoryScores = {};
        const industryScores = {};
        const interactionPatterns = {};
        const stockInteraction = {};
        let totalHoldTime = 0;
        let holdTimeCount = 0;
        let totalReturn = 0;
        let returnCount = 0;
        let totalInvestment = 0;
        let investmentCount = 0;
        // 分析历史记录
        records.forEach(record => {
            if (record.stockCode && record.stockName) {
                if (!stockFrequency[record.stockCode]) {
                    stockFrequency[record.stockCode] = { name: record.stockName, count: 0 };
                }
                stockFrequency[record.stockCode].count++;
                // 分析行业偏好
                const industry = stockIndustryMap[record.stockCode];
                if (industry) {
                    industryScores[industry] = (industryScores[industry] || 0) + 1;
                }
                // 分析股票互动
                if (!stockInteraction[record.stockCode]) {
                    stockInteraction[record.stockCode] = { views: 0, analyses: 0, ignores: 0 };
                }
                if (record.title.includes('推荐互动')) {
                    if (record.title.includes('查看')) {
                        stockInteraction[record.stockCode].views++;
                    }
                    else if (record.title.includes('分析')) {
                        stockInteraction[record.stockCode].analyses++;
                    }
                    else if (record.title.includes('忽略')) {
                        stockInteraction[record.stockCode].ignores++;
                    }
                }
            }
            // 分析记录类型
            categoryScores[record.type] = (categoryScores[record.type] || 0) + 1;
            // 分析互动模式
            interactionPatterns[record.type] = (interactionPatterns[record.type] || 0) + 1;
            // 分析持有时间
            if (record.type === 'signal_buy' && record.description) {
                const match = record.description.match(/持有(\d+)天/);
                if (match) {
                    totalHoldTime += parseInt(match[1]);
                    holdTimeCount++;
                }
                // 分析投资金额
                const investmentMatch = record.description.match(/投资(\d+\.?\d*)元/);
                if (investmentMatch) {
                    totalInvestment += parseFloat(investmentMatch[1]);
                    investmentCount++;
                }
            }
            // 分析收益率
            if (record.type === 'signal_sell' && record.description) {
                const match = record.description.match(/收益率([+-]\d+\.\d+)%/);
                if (match) {
                    totalReturn += parseFloat(match[1]);
                    returnCount++;
                }
            }
        });
        // 计算最近活动
        const now = Date.now();
        const recentRecords = records.filter(record => now - record.timestamp < 7 * 24 * 60 * 60 * 1000);
        const recentActivity = recentRecords.length;
        // 计算风险承受能力（增强版）
        const buySignals = records.filter(r => r.type === 'signal_buy').length;
        const sellSignals = records.filter(r => r.type === 'signal_sell').length;
        const highRiskStocks = records.filter(r => r.stockCode && stockRiskMap[r.stockCode] === 'high').length;
        const mediumRiskStocks = records.filter(r => r.stockCode && stockRiskMap[r.stockCode] === 'medium').length;
        const lowRiskStocks = records.filter(r => r.stockCode && stockRiskMap[r.stockCode] === 'low').length;
        const totalRiskStocks = highRiskStocks + mediumRiskStocks + lowRiskStocks;
        let riskTolerance = 'medium';
        // 基于多种因素计算风险承受能力
        const riskScore = totalRiskStocks > 0 ? (highRiskStocks * 3 + mediumRiskStocks * 2 + lowRiskStocks * 1) / totalRiskStocks : 2;
        const tradingFrequency = buySignals + sellSignals;
        const averageInvestment = investmentCount > 0 ? totalInvestment / investmentCount : 0;
        if (riskScore > 2.2 || buySignals > sellSignals * 1.5 || tradingFrequency > 10 || averageInvestment > 10000) {
            riskTolerance = 'high';
        }
        else if (riskScore < 1.8 || sellSignals > buySignals * 1.5 || tradingFrequency < 3 || averageInvestment < 1000) {
            riskTolerance = 'low';
        }
        // 计算平均持有时间
        const averageHoldTime = holdTimeCount > 0 ? totalHoldTime / holdTimeCount : 0;
        // 计算平均收益率
        const averageReturn = returnCount > 0 ? totalReturn / returnCount : 0;
        // 计算投资期限偏好
        let investmentHorizon = 'medium';
        if (averageHoldTime < 7) {
            investmentHorizon = 'short';
        }
        else if (averageHoldTime > 30) {
            investmentHorizon = 'long';
        }
        // 计算行业集中度
        const totalIndustryScore = Object.values(industryScores).reduce((sum, score) => sum + score, 0);
        const industryConcentration = totalIndustryScore > 0 ?
            Math.max(...Object.values(industryScores)) / totalIndustryScore : 0;
        // 转换为数组并排序
        const favoriteStocks = Object.entries(stockFrequency)
            .map(([code, data]) => ({
            code,
            name: data.name,
            frequency: data.count,
            interaction: stockInteraction[code] || { views: 0, analyses: 0, ignores: 0 }
        }))
            .sort((a, b) => b.frequency - a.frequency);
        const preferredCategories = Object.entries(categoryScores)
            .map(([category, score]) => ({ category, score }))
            .sort((a, b) => b.score - a.score);
        const preferredIndustries = Object.entries(industryScores)
            .map(([industry, score]) => ({ industry, score }))
            .sort((a, b) => b.score - a.score);
        return {
            favoriteStocks,
            preferredCategories,
            preferredIndustries,
            recentActivity,
            riskTolerance,
            averageHoldTime,
            interactionPatterns,
            averageReturn,
            tradingFrequency,
            investmentHorizon,
            industryConcentration,
            averageInvestment
        };
    }
    // 生成个性化推荐
    generateRecommendations() {
        const preferences = this.analyzeUserPreferences();
        const recommendations = [];
        // 基于用户历史行为生成推荐
        if (preferences.favoriteStocks.length > 0) {
            // 为用户最常关注的股票生成相似推荐
            preferences.favoriteStocks.slice(0, 3).forEach(stock => {
                const similarStocks = this.findSimilarStocks(stock.code);
                similarStocks.forEach(similarStock => {
                    const industry = stockIndustryMap[similarStock.code];
                    const riskLevel = stockRiskMap[similarStock.code];
                    const score = this.calculateScore(similarStock.code, preferences, 'similar');
                    recommendations.push({
                        stockCode: similarStock.code,
                        stockName: similarStock.name,
                        score,
                        reasons: [`与您关注的 ${stock.name} 相关`, '基于您的历史偏好'],
                        category: 'similar',
                        industry,
                        riskLevel
                    });
                });
            });
        }
        // 基于行业偏好推荐
        if (preferences.preferredIndustries.length > 0) {
            const industryRecommendations = this.getIndustryRecommendations(preferences.preferredIndustries[0].industry);
            recommendations.push(...industryRecommendations);
        }
        // 基于风险偏好推荐
        const riskBasedRecommendations = this.getRiskBasedRecommendations(preferences.riskTolerance);
        recommendations.push(...riskBasedRecommendations);
        // 基于技术分析推荐
        const technicalRecommendations = this.getTechnicalRecommendations();
        recommendations.push(...technicalRecommendations);
        // 基于趋势推荐
        const trendingStocks = this.getTrendingStocks();
        recommendations.push(...trendingStocks);
        // 基于近期活动推荐
        if (preferences.recentActivity > 5) {
            const recentActivityRecommendations = this.getRecentActivityRecommendations(preferences);
            recommendations.push(...recentActivityRecommendations);
        }
        // 去重并排序
        const uniqueRecommendations = this.removeDuplicates(recommendations);
        return uniqueRecommendations.sort((a, b) => b.score - a.score).slice(0, 15);
    }
    // 计算推荐评分
    calculateScore(stockCode, preferences, category) {
        let baseScore = 0.5;
        // 基于行业偏好
        const stockIndustry = stockIndustryMap[stockCode];
        if (stockIndustry) {
            const industryPreference = preferences.preferredIndustries.find(pi => pi.industry === stockIndustry);
            if (industryPreference) {
                baseScore += industryPreference.score / 10;
            }
        }
        // 基于风险偏好
        const stockRisk = stockRiskMap[stockCode];
        if (stockRisk === preferences.riskTolerance) {
            baseScore += 0.2;
        }
        else if ((preferences.riskTolerance === 'medium' && (stockRisk === 'low' || stockRisk === 'high')) ||
            (preferences.riskTolerance === 'high' && stockRisk === 'medium') ||
            (preferences.riskTolerance === 'low' && stockRisk === 'medium')) {
            baseScore += 0.1;
        }
        // 基于投资期限偏好
        if (preferences.investmentHorizon === 'short' && stockRisk === 'high') {
            baseScore += 0.1; // 短线投资者偏好高风险股票
        }
        else if (preferences.investmentHorizon === 'long' && stockRisk === 'low') {
            baseScore += 0.1; // 长线投资者偏好低风险股票
        }
        // 基于行业集中度
        if (preferences.industryConcentration > 0.5 && stockIndustry) {
            // 如果用户行业集中度高，优先推荐其偏好行业的股票
            const industryPreference = preferences.preferredIndustries.find(pi => pi.industry === stockIndustry);
            if (industryPreference) {
                baseScore += 0.1;
            }
        }
        // 基于推荐类型
        switch (category) {
            case 'similar':
                baseScore += 0.2;
                break;
            case 'trending':
                baseScore += 0.15;
                break;
            case 'technical':
                baseScore += 0.1;
                break;
            case 'industry':
                baseScore += 0.15;
                break;
            case 'risk_based':
                baseScore += 0.2;
                break;
            case 'recent_activity':
                baseScore += 0.1;
                break;
        }
        // 基于近期活动
        if (preferences.recentActivity > 10) {
            baseScore += 0.1;
        }
        // 基于交易频率
        if (preferences.tradingFrequency > 5) {
            baseScore += 0.05;
        }
        // 基于平均收益率
        if (preferences.averageReturn > 5) {
            baseScore += 0.05;
        }
        return Math.min(baseScore, 0.95);
    }
    // 查找相似股票
    findSimilarStocks(stockCode) {
        // 模拟相似股票数据
        const similarStocksMap = {
            '002594': [
                { code: '300750', name: '宁德时代' },
                { code: '601799', name: '星宇股份' },
                { code: '000887', name: '中鼎股份' },
                { code: '600895', name: '张江高科' }
            ],
            '600519': [
                { code: '000858', name: '五粮液' },
                { code: '600809', name: '山西汾酒' },
                { code: '600779', name: '水井坊' },
                { code: '000568', name: '泸州老窖' }
            ],
            '300750': [
                { code: '002594', name: '比亚迪' },
                { code: '600499', name: '科达制造' },
                { code: '002460', name: '赣锋锂业' },
                { code: '300274', name: '阳光电源' }
            ],
            '600036': [
                { code: '000001', name: '平安银行' },
                { code: '601166', name: '兴业银行' },
                { code: '601328', name: '交通银行' }
            ],
            '601318': [
                { code: '601628', name: '中国人寿' },
                { code: '601336', name: '新华保险' },
                { code: '601601', name: '中国太保' }
            ],
            '000001': [
                { code: '600036', name: '招商银行' },
                { code: '601166', name: '兴业银行' },
                { code: '601328', name: '交通银行' }
            ]
        };
        return similarStocksMap[stockCode] || [];
    }
    // 获取行业推荐
    getIndustryRecommendations(industry) {
        const industryStocks = [];
        // 查找该行业的股票
        Object.entries(stockIndustryMap).forEach(([code, stockIndustry]) => {
            if (stockIndustry === industry) {
                industryStocks.push({ code, name: this.getStockName(code) });
            }
        });
        return industryStocks.slice(0, 3).map(stock => ({
            stockCode: stock.code,
            stockName: stock.name,
            score: 0.75,
            reasons: [`属于您关注的 ${industry} 行业`, '基于您的行业偏好'],
            category: 'industry',
            industry: industry,
            riskLevel: stockRiskMap[stock.code]
        }));
    }
    // 获取基于风险的推荐
    getRiskBasedRecommendations(riskTolerance) {
        const riskStocks = [];
        // 查找符合风险等级的股票
        Object.entries(stockRiskMap).forEach(([code, risk]) => {
            if (risk === riskTolerance) {
                riskStocks.push({ code, name: this.getStockName(code) });
            }
        });
        return riskStocks.slice(0, 3).map(stock => ({
            stockCode: stock.code,
            stockName: stock.name,
            score: 0.7,
            reasons: [`符合您的风险偏好 (${riskTolerance === 'low' ? '低风险' : riskTolerance === 'medium' ? '中等风险' : '高风险'})`, '基于您的风险承受能力'],
            category: 'risk_based',
            industry: stockIndustryMap[stock.code],
            riskLevel: stockRiskMap[stock.code]
        }));
    }
    // 获取技术分析推荐
    getTechnicalRecommendations() {
        // 模拟技术分析推荐
        return [
            {
                stockCode: '600036',
                stockName: '招商银行',
                score: 0.75,
                reasons: ['技术指标金叉', '量价配合良好', 'MACD红柱放大'],
                category: 'technical',
                industry: '银行',
                riskLevel: 'low'
            },
            {
                stockCode: '601318',
                stockName: '中国平安',
                score: 0.7,
                reasons: ['RSI超卖反弹', 'MACD底背离', 'KDJ金叉'],
                category: 'technical',
                industry: '保险',
                riskLevel: 'low'
            },
            {
                stockCode: '002594',
                stockName: '比亚迪',
                score: 0.8,
                reasons: ['突破前期高点', '成交量有效放大', '均线多头排列'],
                category: 'technical',
                industry: '新能源汽车',
                riskLevel: 'high'
            }
        ];
    }
    // 获取趋势推荐
    getTrendingStocks() {
        // 模拟趋势推荐
        return [
            {
                stockCode: '000001',
                stockName: '平安银行',
                score: 0.8,
                reasons: ['近期走势强劲', '成交量放大', '行业龙头'],
                category: 'trending',
                industry: '银行',
                riskLevel: 'low'
            },
            {
                stockCode: '600031',
                stockName: '三一重工',
                score: 0.7,
                reasons: ['行业景气度上升', '机构资金流入', '政策利好'],
                category: 'trending',
                industry: '工程机械',
                riskLevel: 'medium'
            },
            {
                stockCode: '300750',
                stockName: '宁德时代',
                score: 0.85,
                reasons: ['新能源板块领涨', '业绩超预期', '全球市场份额领先'],
                category: 'trending',
                industry: '新能源',
                riskLevel: 'high'
            }
        ];
    }
    // 获取基于近期活动的推荐
    getRecentActivityRecommendations(preferences) {
        // 基于用户近期活动生成推荐
        const recentStocks = preferences.favoriteStocks.slice(0, 2);
        return recentStocks.map(stock => ({
            stockCode: stock.code,
            stockName: stock.name,
            score: 0.8,
            reasons: ['您近期频繁关注', '基于您的浏览历史', '可能符合您的投资兴趣'],
            category: 'recent_activity',
            industry: stockIndustryMap[stock.code],
            riskLevel: stockRiskMap[stock.code]
        }));
    }
    // 获取股票名称
    getStockName(stockCode) {
        const stockMap = {
            '002594': '比亚迪',
            '300750': '宁德时代',
            '601799': '星宇股份',
            '000887': '中鼎股份',
            '600519': '贵州茅台',
            '000858': '五粮液',
            '600809': '山西汾酒',
            '600779': '水井坊',
            '600036': '招商银行',
            '601318': '中国平安',
            '000001': '平安银行',
            '600031': '三一重工',
            '600499': '科达制造',
            '002460': '赣锋锂业',
            '000333': '美的集团',
            '600887': '伊利股份',
            '601166': '兴业银行',
            '600276': '恒瑞医药',
            '601888': '中国中免',
            '600895': '张江高科',
            '002415': '海康威视',
            '300274': '阳光电源',
            '000977': '浪潮信息',
            '600104': '上汽集团',
            '600332': '白云山',
            '000568': '泸州老窖',
            '600703': '三安光电'
        };
        return stockMap[stockCode] || '未知股票';
    }
    // 去重推荐
    removeDuplicates(recommendations) {
        const seen = new Set();
        return recommendations.filter(rec => {
            if (seen.has(rec.stockCode)) {
                return false;
            }
            seen.add(rec.stockCode);
            return true;
        });
    }
    // 记录用户与推荐的互动
    recordRecommendationInteraction(stockCode, stockName, action) {
        this.historyManager.addRecord({
            type: 'ai_analysis',
            stockCode,
            stockName,
            title: `推荐互动 - ${action}`,
            description: `用户${action === 'view' ? '查看' : action === 'ignore' ? '忽略' : '分析'}了推荐股票 ${stockName}(${stockCode})`
        });
    }
    // 获取推荐解释
    getRecommendationExplanation(stockCode, preferences) {
        const industry = stockIndustryMap[stockCode];
        const riskLevel = stockRiskMap[stockCode];
        const explanations = [];
        if (industry) {
            const industryPreference = preferences.preferredIndustries.find(pi => pi.industry === industry);
            if (industryPreference) {
                explanations.push(`您对${industry}行业有较高的关注度`);
            }
        }
        if (riskLevel === preferences.riskTolerance) {
            explanations.push(`该股票的风险等级与您的风险偏好匹配`);
        }
        const favoriteStock = preferences.favoriteStocks.find(stock => stock.code === stockCode);
        if (favoriteStock) {
            explanations.push(`这是您经常关注的股票之一`);
        }
        if (explanations.length === 0) {
            return '基于市场表现和技术分析推荐';
        }
        return explanations.join('，') + '，因此为您推荐';
    }
}
let recommendationInstance = null;
export const getPersonalizedRecommendation = () => {
    if (!recommendationInstance) {
        recommendationInstance = new PersonalizedRecommendation();
    }
    return recommendationInstance;
};
