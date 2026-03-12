// 投资组合分析模块
// 模拟持仓数据
export const mockPositions = [
    {
        stockCode: '000001',
        stockName: '平安银行',
        price: 18.76,
        cost: 17.50,
        volume: 1000,
        profit: 1260,
        profitPercent: 7.2,
        industry: '银行',
        sector: '金融'
    },
    {
        stockCode: '000858',
        stockName: '五粮液',
        price: 168.50,
        cost: 165.20,
        volume: 200,
        profit: 660,
        profitPercent: 2.0,
        industry: '白酒',
        sector: '食品饮料'
    },
    {
        stockCode: '000333',
        stockName: '美的集团',
        price: 58.76,
        cost: 57.50,
        volume: 300,
        profit: 378,
        profitPercent: 2.2,
        industry: '家电',
        sector: '家用电器'
    },
    {
        stockCode: '002594',
        stockName: '比亚迪',
        price: 285.60,
        cost: 265.40,
        volume: 50,
        profit: 1010,
        profitPercent: 7.6,
        industry: '新能源汽车',
        sector: '汽车'
    },
    {
        stockCode: '600745',
        stockName: '闻泰科技',
        price: 89.20,
        cost: 95.60,
        volume: 100,
        profit: -640,
        profitPercent: -6.7,
        industry: '半导体',
        sector: '电子'
    }
];
// 计算投资组合总览
export const calculatePortfolio = (positions, cash = 10000) => {
    const totalValue = positions.reduce((sum, pos) => sum + pos.price * pos.volume, 0);
    const totalCost = positions.reduce((sum, pos) => sum + pos.cost * pos.volume, 0);
    const totalProfit = totalValue - totalCost;
    const totalProfitPercent = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;
    const totalAsset = totalValue + cash;
    return {
        positions,
        totalValue,
        totalCost,
        totalProfit,
        totalProfitPercent,
        cash,
        totalAsset
    };
};
// 计算行业分布
export const calculateIndustryDistribution = (positions) => {
    const industryMap = new Map();
    const totalValue = positions.reduce((sum, pos) => sum + pos.price * pos.volume, 0);
    positions.forEach(pos => {
        const key = pos.industry;
        if (!industryMap.has(key)) {
            industryMap.set(key, { value: 0, cost: 0, profit: 0 });
        }
        const industry = industryMap.get(key);
        industry.value += pos.price * pos.volume;
        industry.cost += pos.cost * pos.volume;
        industry.profit += pos.profit;
    });
    return Array.from(industryMap.entries()).map(([industry, data]) => ({
        industry,
        value: data.value,
        percentage: totalValue > 0 ? (data.value / totalValue) * 100 : 0,
        profit: data.profit,
        profitPercent: data.cost > 0 ? (data.profit / data.cost) * 100 : 0
    })).sort((a, b) => b.value - a.value);
};
// 计算风险指标
export const calculateRiskMetrics = (portfolio) => {
    // 模拟风险指标计算
    // 实际项目中应该使用真实的历史数据计算
    return {
        volatility: 0.18,
        maxDrawdown: 0.12,
        sharpeRatio: 1.2,
        beta: 0.95,
        alpha: 0.02,
        informationRatio: 0.8
    };
};
// 生成投资组合建议
export const generatePortfolioRecommendations = (portfolio, industryDistribution) => {
    const recommendations = [];
    // 检查行业集中度
    const topIndustry = industryDistribution[0];
    if (topIndustry && topIndustry.percentage > 40) {
        recommendations.push(`行业集中度较高，${topIndustry.industry}占比${topIndustry.percentage.toFixed(1)}%，建议适当分散投资`);
    }
    // 检查盈利情况
    if (portfolio.totalProfitPercent < -5) {
        recommendations.push('投资组合整体亏损较多，建议重新评估持仓结构');
    }
    else if (portfolio.totalProfitPercent > 10) {
        recommendations.push('投资组合表现良好，建议保持当前配置');
    }
    // 检查现金比例
    const cashPercentage = (portfolio.cash / portfolio.totalAsset) * 100;
    if (cashPercentage < 10) {
        recommendations.push('现金比例较低，建议保留一定比例的现金以应对市场波动');
    }
    else if (cashPercentage > 50) {
        recommendations.push('现金比例较高，建议适当增加投资以提高资金利用率');
    }
    // 检查单个股票占比
    const maxPositionValue = Math.max(...portfolio.positions.map(pos => pos.price * pos.volume));
    const maxPositionPercentage = (maxPositionValue / portfolio.totalValue) * 100;
    if (maxPositionPercentage > 30) {
        recommendations.push('单个股票占比过高，建议降低集中度');
    }
    return recommendations.length > 0 ? recommendations : ['投资组合配置合理，建议保持当前策略'];
};
// 个性化股票推荐
export const generateStockRecommendations = (portfolio, riskLevel) => {
    // 模拟股票推荐
    const recommendations = [
        {
            stockCode: '601318',
            stockName: '中国平安',
            reason: '低估值、高股息，适合价值投资',
            confidence: 0.85
        },
        {
            stockCode: '000977',
            stockName: '浪潮信息',
            reason: '人工智能概念股，行业前景广阔',
            confidence: 0.75
        },
        {
            stockCode: '300750',
            stockName: '宁德时代',
            reason: '新能源汽车产业链龙头，成长性强',
            confidence: 0.80
        },
        {
            stockCode: '600887',
            stockName: '伊利股份',
            reason: '消费龙头，业绩稳定',
            confidence: 0.70
        },
        {
            stockCode: '600036',
            stockName: '招商银行',
            reason: '银行业龙头，资产质量优异',
            confidence: 0.82
        }
    ];
    // 根据风险等级过滤推荐
    switch (riskLevel) {
        case 'low':
            return recommendations.filter(rec => rec.confidence > 0.75).slice(0, 3);
        case 'medium':
            return recommendations.slice(0, 4);
        case 'high':
            return recommendations;
        default:
            return recommendations.slice(0, 3);
    }
};
// 投资组合回测
export const backtestPortfolio = (portfolio, days = 30) => {
    const result = [];
    const startValue = portfolio.totalAsset;
    let currentValue = startValue;
    for (let i = days; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        // 模拟资产价值变化
        const change = (Math.random() - 0.48) * 0.02; // 平均每天上涨0.2%
        currentValue = currentValue * (1 + change);
        const profit = currentValue - startValue;
        const profitPercent = (profit / startValue) * 100;
        result.push({
            date: date.toISOString().split('T')[0],
            value: currentValue,
            profit,
            profitPercent
        });
    }
    return result;
};
// 计算最优资产配置
export const calculateOptimalAllocation = (riskLevel) => {
    switch (riskLevel) {
        case 'low':
            return [
                { sector: '金融', percentage: 30 },
                { sector: '消费', percentage: 25 },
                { sector: '公用事业', percentage: 20 },
                { sector: '医药', percentage: 15 },
                { sector: '科技', percentage: 10 }
            ];
        case 'medium':
            return [
                { sector: '科技', percentage: 25 },
                { sector: '消费', percentage: 25 },
                { sector: '金融', percentage: 20 },
                { sector: '医药', percentage: 15 },
                { sector: '新能源', percentage: 15 }
            ];
        case 'high':
            return [
                { sector: '科技', percentage: 35 },
                { sector: '新能源', percentage: 25 },
                { sector: '医药', percentage: 15 },
                { sector: '消费', percentage: 15 },
                { sector: '金融', percentage: 10 }
            ];
        default:
            return [
                { sector: '科技', percentage: 25 },
                { sector: '消费', percentage: 25 },
                { sector: '金融', percentage: 20 },
                { sector: '医药', percentage: 15 },
                { sector: '新能源', percentage: 15 }
            ];
    }
};
