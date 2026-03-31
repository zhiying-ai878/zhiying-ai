export const localAI = {
    predict: async (symbol, prices) => {
        const currentPrice = prices[prices.length - 1];
        const ma5 = prices.slice(-5).reduce((a, b) => a + b, 0) / 5;
        const ma10 = prices.slice(-10).reduce((a, b) => a + b, 0) / 10;
        const ma20 = prices.slice(-20).reduce((a, b) => a + b, 0) / 20;
        let prediction = 'neutral';
        let confidence = 50;
        if (currentPrice > ma5 && ma5 > ma10) {
            prediction = 'up';
            confidence = 65;
        }
        else if (currentPrice < ma5 && ma5 < ma10) {
            prediction = 'down';
            confidence = 65;
        }
        return {
            prediction,
            confidence,
            features: {
                rsi: 50,
                macd: 0,
                volatility: 0.02,
                ma5,
                ma10,
                ma20
            }
        };
    }
};
