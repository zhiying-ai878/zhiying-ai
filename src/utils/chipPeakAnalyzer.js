export class ChipPeakAnalyzer {
    constructor() {
        Object.defineProperty(this, "priceStep", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0.01
        });
        Object.defineProperty(this, "peakThreshold", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0.05
        });
    }
    generateChipDistribution(stockCode, stockName, currentPrice, klineData) {
        const peaks = [];
        const basePrice = currentPrice;
        const minPrice = basePrice * 0.85;
        const maxPrice = basePrice * 1.15;
        const priceStep = (maxPrice - minPrice) / 100;
        let totalVolume = 0;
        const tempPeaks = [];
        for (let i = 0; i <= 100; i++) {
            const price = minPrice + priceStep * i;
            const distanceFromCurrent = Math.abs(price - basePrice) / basePrice;
            let volume = 0;
            if (distanceFromCurrent < 0.05) {
                volume = Math.random() * 10000000 + 5000000;
            }
            else if (distanceFromCurrent < 0.1) {
                volume = Math.random() * 5000000 + 2000000;
            }
            else {
                volume = Math.random() * 2000000 + 500000;
            }
            if (Math.random() > 0.7) {
                volume *= 2;
            }
            tempPeaks.push({ price, volume });
            totalVolume += volume;
        }
        for (let i = 0; i < tempPeaks.length; i++) {
            const peak = tempPeaks[i];
            const percentage = (peak.volume / totalVolume) * 100;
            let isPeak = false;
            if (i > 2 && i < tempPeaks.length - 3) {
                const neighbors = tempPeaks.slice(i - 2, i + 3);
                const maxNeighbor = Math.max(...neighbors.map(n => n.volume));
                isPeak = peak.volume === maxNeighbor && percentage > this.peakThreshold;
            }
            let color = '#1890ff';
            if (peak.price < basePrice * 0.95) {
                color = '#52c41a';
            }
            else if (peak.price > basePrice * 1.05) {
                color = '#ff4d4f';
            }
            else {
                color = '#faad14';
            }
            peaks.push({
                price: peak.price,
                volume: peak.volume,
                percentage,
                isPeak,
                color
            });
        }
        let profitVolume = 0;
        let lossVolume = 0;
        let weightedSum = 0;
        peaks.forEach(peak => {
            weightedSum += peak.price * peak.volume;
            if (peak.price < basePrice) {
                profitVolume += peak.volume;
            }
            else {
                lossVolume += peak.volume;
            }
        });
        const avgCost = weightedSum / totalVolume;
        const profitPercentage = (profitVolume / totalVolume) * 100;
        const lossPercentage = (lossVolume / totalVolume) * 100;
        const maxPeak = peaks.reduce((max, peak) => peak.volume > max.volume ? peak : max, peaks[0]);
        const sortedPeaks = [...peaks].sort((a, b) => b.volume - a.volume);
        const top20Volume = sortedPeaks.slice(0, Math.floor(sortedPeaks.length * 0.2)).reduce((sum, p) => sum + p.volume, 0);
        const concentration = (top20Volume / totalVolume) * 100;
        const supportPeaks = peaks.filter(p => p.price < basePrice && p.isPeak);
        const supportLevel = supportPeaks.length > 0
            ? Math.max(...supportPeaks.map(p => p.price))
            : basePrice * 0.95;
        const resistancePeaks = peaks.filter(p => p.price > basePrice && p.isPeak);
        const resistanceLevel = resistancePeaks.length > 0
            ? Math.min(...resistancePeaks.map(p => p.price))
            : basePrice * 1.05;
        return {
            stockCode,
            stockName,
            peaks,
            avgCost,
            currentPrice: basePrice,
            profitPercentage,
            lossPercentage,
            maxPeakPrice: maxPeak.price,
            maxPeakVolume: maxPeak.volume,
            concentration,
            supportLevel,
            resistanceLevel,
            timestamp: Date.now()
        };
    }
    analyzeChipDistribution(distribution) {
        const reasons = [];
        let score = 50;
        if (distribution.profitPercentage > 60) {
            score += 15;
            reasons.push('获利盘比例较高，市场情绪积极');
        }
        else if (distribution.profitPercentage < 30) {
            score -= 10;
            reasons.push('获利盘比例较低，市场情绪谨慎');
        }
        if (distribution.concentration > 40) {
            score += 10;
            reasons.push('筹码集中度高，主力控盘迹象明显');
        }
        else if (distribution.concentration < 20) {
            score -= 5;
            reasons.push('筹码集中度低，筹码较为分散');
        }
        if (distribution.currentPrice > distribution.avgCost) {
            score += 8;
            reasons.push('当前价格高于平均成本，处于盈利状态');
        }
        else {
            score -= 8;
            reasons.push('当前价格低于平均成本，处于亏损状态');
        }
        const distanceFromMaxPeak = Math.abs(distribution.currentPrice - distribution.maxPeakPrice) / distribution.currentPrice;
        if (distanceFromMaxPeak < 0.05) {
            score -= 10;
            reasons.push('价格接近最大筹码峰，可能面临抛压');
        }
        if (distribution.currentPrice > distribution.supportLevel * 1.02) {
            score += 5;
            reasons.push('价格在支撑位上方，支撑有效');
        }
        if (distribution.currentPrice < distribution.resistanceLevel * 0.98) {
            score += 5;
            reasons.push('价格在阻力位下方，仍有上涨空间');
        }
        let signal = 'neutral';
        if (score >= 65) {
            signal = 'bullish';
        }
        else if (score <= 45) {
            signal = 'bearish';
        }
        return {
            signal,
            score,
            reasons
        };
    }
}
let chipPeakAnalyzerInstance = null;
export const getChipPeakAnalyzer = () => {
    if (!chipPeakAnalyzerInstance) {
        chipPeakAnalyzerInstance = new ChipPeakAnalyzer();
    }
    return chipPeakAnalyzerInstance;
};
