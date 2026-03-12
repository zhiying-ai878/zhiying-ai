import * as tf from '@tensorflow/tfjs';
export class StockPredictionModel {
    constructor() {
        Object.defineProperty(this, "model", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "scaler", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "sequenceLength", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 30
        });
        Object.defineProperty(this, "isTrained", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        this.initializeModel();
    }
    async initializeModel() {
        try {
            const savedModel = localStorage.getItem('stockPredictionModel');
            if (savedModel) {
                const modelData = JSON.parse(savedModel);
                if (modelData.scaler) {
                    this.scaler = modelData.scaler;
                    this.isTrained = true;
                }
            }
        }
        catch (error) {
            console.log('没有找到已保存的模型，将使用新模型');
        }
    }
    buildModel(inputShape) {
        const model = tf.sequential();
        model.add(tf.layers.lstm({
            units: 64,
            returnSequences: true,
            inputShape: inputShape,
            kernelRegularizer: tf.regularizers.l2({ l2: 0.01 })
        }));
        model.add(tf.layers.dropout({ rate: 0.2 }));
        model.add(tf.layers.lstm({
            units: 32,
            returnSequences: false,
            kernelRegularizer: tf.regularizers.l2({ l2: 0.01 })
        }));
        model.add(tf.layers.dropout({ rate: 0.2 }));
        model.add(tf.layers.dense({ units: 16, activation: 'relu' }));
        model.add(tf.layers.dense({ units: 1, activation: 'linear' }));
        model.compile({
            optimizer: tf.train.adam(0.001),
            loss: 'meanSquaredError',
            metrics: ['mae']
        });
        return model;
    }
    normalizeData(data) {
        const mean = data.reduce((a, b) => a + b, 0) / data.length;
        const std = Math.sqrt(data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length);
        const normalized = data.map(val => (val - mean) / (std || 1));
        return { normalized, scaler: { mean, std } };
    }
    denormalize(value, scaler) {
        return value * scaler.std + scaler.mean;
    }
    createSequences(data, sequenceLength) {
        const x = [];
        const y = [];
        for (let i = sequenceLength; i < data.length; i++) {
            x.push(data.slice(i - sequenceLength, i));
            y.push(data[i]);
        }
        return { x, y };
    }
    async train(historicalPrices, onProgress) {
        if (historicalPrices.length < this.sequenceLength + 10) {
            throw new Error('需要至少 ' + (this.sequenceLength + 10) + ' 个数据点进行训练');
        }
        const { normalized, scaler } = this.normalizeData(historicalPrices);
        this.scaler = scaler;
        const { x, y } = this.createSequences(normalized, this.sequenceLength);
        const xTensor = tf.tensor3d(x.map(seq => seq.map(val => [val])));
        const yTensor = tf.tensor2d(y.map(val => [val]));
        this.model = this.buildModel([this.sequenceLength, 1]);
        const epochs = 50;
        const batchSize = 16;
        for (let epoch = 0; epoch < epochs; epoch++) {
            const history = await this.model.fit(xTensor, yTensor, {
                epochs: 1,
                batchSize: batchSize,
                shuffle: true,
                verbose: 0
            });
            const loss = history.history.loss[0];
            if (onProgress) {
                onProgress({
                    epoch: epoch + 1,
                    loss: loss
                });
            }
            if (loss < 0.001) {
                break;
            }
        }
        this.isTrained = true;
        localStorage.setItem('stockPredictionModel', JSON.stringify({
            scaler: this.scaler,
            trainedAt: new Date().toISOString()
        }));
        xTensor.dispose();
        yTensor.dispose();
    }
    async predict(historicalPrices) {
        if (!this.scaler) {
            return this.generateRuleBasedPrediction(historicalPrices);
        }
        const recentPrices = historicalPrices.slice(-this.sequenceLength);
        if (recentPrices.length < this.sequenceLength) {
            return this.generateRuleBasedPrediction(historicalPrices);
        }
        const { normalized } = this.normalizeData(recentPrices);
        const inputSequence = normalized.slice(-this.sequenceLength);
        const confidence = this.calculateConfidence(recentPrices);
        const currentPrice = recentPrices[recentPrices.length - 1];
        let predictedPrice;
        if (this.model && this.isTrained) {
            try {
                const xTensor = tf.tensor3d([inputSequence.map(val => [val])]);
                const prediction = this.model.predict(xTensor);
                const predictedNormalized = (await prediction.data())[0];
                predictedPrice = this.denormalize(predictedNormalized, this.scaler);
                xTensor.dispose();
                prediction.dispose();
            }
            catch (error) {
                predictedPrice = this.generateRuleBasedPrice(historicalPrices);
            }
        }
        else {
            predictedPrice = this.generateRuleBasedPrice(historicalPrices);
        }
        const change = predictedPrice - currentPrice;
        const changePercent = (change / currentPrice) * 100;
        let direction = 'neutral';
        if (changePercent > 0.5) {
            direction = 'up';
        }
        else if (changePercent < -0.5) {
            direction = 'down';
        }
        return {
            price: predictedPrice,
            change: change,
            changePercent: changePercent,
            confidence: confidence,
            direction: direction
        };
    }
    generateRuleBasedPrediction(prices) {
        const currentPrice = prices[prices.length - 1];
        const ma5 = prices.slice(-5).reduce((a, b) => a + b, 0) / 5;
        const ma10 = prices.slice(-10).reduce((a, b) => a + b, 0) / 10;
        let predictedPrice = this.generateRuleBasedPrice(prices);
        const change = predictedPrice - currentPrice;
        const changePercent = (change / currentPrice) * 100;
        const confidence = this.calculateConfidence(prices);
        let direction = 'neutral';
        if (changePercent > 0.5) {
            direction = 'up';
        }
        else if (changePercent < -0.5) {
            direction = 'down';
        }
        return {
            price: predictedPrice,
            change: change,
            changePercent: changePercent,
            confidence: confidence,
            direction: direction
        };
    }
    generateRuleBasedPrice(prices) {
        const currentPrice = prices[prices.length - 1];
        const ma5 = prices.slice(-5).reduce((a, b) => a + b, 0) / 5;
        const ma10 = prices.slice(-10).reduce((a, b) => a + b, 0) / 10;
        const volatility = this.calculateVolatility(prices);
        let trendFactor = 1;
        if (currentPrice > ma5 && ma5 > ma10) {
            trendFactor = 1 + volatility * 0.3;
        }
        else if (currentPrice < ma5 && ma5 < ma10) {
            trendFactor = 1 - volatility * 0.3;
        }
        return currentPrice * trendFactor;
    }
    calculateVolatility(prices) {
        const returns = [];
        for (let i = 1; i < prices.length; i++) {
            returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
        }
        const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
        const variance = returns.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / returns.length;
        return Math.sqrt(variance);
    }
    calculateConfidence(prices) {
        const currentPrice = prices[prices.length - 1];
        const ma5 = prices.slice(-5).reduce((a, b) => a + b, 0) / 5;
        const ma10 = prices.slice(-10).reduce((a, b) => a + b, 0) / 10;
        const volatility = this.calculateVolatility(prices);
        let confidence = 50;
        if (currentPrice > ma5 && ma5 > ma10) {
            confidence += 20;
        }
        else if (currentPrice < ma5 && ma5 < ma10) {
            confidence += 20;
        }
        if (volatility < 0.02) {
            confidence += 15;
        }
        else if (volatility > 0.05) {
            confidence -= 15;
        }
        if (this.isTrained) {
            confidence += 10;
        }
        return Math.min(Math.max(confidence, 30), 95);
    }
    async predictMultipleDays(historicalPrices, days) {
        const predictions = [];
        let currentPrices = [...historicalPrices];
        for (let i = 0; i < days; i++) {
            const prediction = await this.predict(currentPrices);
            predictions.push(prediction);
            currentPrices.push(prediction.price);
        }
        return predictions;
    }
    reset() {
        this.model = null;
        this.scaler = null;
        this.isTrained = false;
        localStorage.removeItem('stockPredictionModel');
    }
    getModelStatus() {
        return {
            isTrained: this.isTrained,
            hasScaler: this.scaler !== null
        };
    }
}
export const stockPredictionModel = new StockPredictionModel();
