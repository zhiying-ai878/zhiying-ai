import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Card, Typography, Button, message } from 'antd';
import { getHistoricalDataManager } from '../../utils/historicalData';
import { getTimeSeriesPredictor } from '../../utils/timeSeriesPredictor';
import { getRealtimeQuote } from '../../utils/stockData';
const { Text } = Typography;
export const PredictionVisualization = ({ stockCode, stockName }) => {
    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPrice, setCurrentPrice] = useState(null);
    useEffect(() => {
        loadPredictionData();
    }, [stockCode]);
    const loadPredictionData = async () => {
        console.log(`开始加载股票 ${stockCode} 的预测数据`);
        setLoading(true);
        try {
            // 获取当前实时价格
            console.log(`正在获取股票 ${stockCode} 的实时价格`);
            const realtimeData = await getRealtimeQuote([stockCode]);
            console.log(`实时数据:`, realtimeData);
            if (realtimeData && realtimeData.length > 0) {
                setCurrentPrice(realtimeData[0].price);
                console.log(`股票 ${stockCode} 当前实时价格: ${realtimeData[0].price}`);
            }
            else {
                message.warning('无法获取实时价格，使用历史数据进行预测');
            }
            const historicalManager = getHistoricalDataManager();
            console.log(`正在获取股票 ${stockCode} 的历史数据`);
            const data = await historicalManager.getHistoricalData(stockCode);
            console.log(`获取到历史数据: ${data.length} 条`);
            if (data.length === 0) {
                console.error(`股票 ${stockCode} 历史数据为空`);
                message.warning('没有可用的历史数据');
                setLoading(false);
                return;
            }
            console.log(`历史数据样本:`, data.slice(0, 5));
            const predictor = getTimeSeriesPredictor();
            console.log(`正在对股票 ${stockCode} 进行预测`);
            const predictionResults = await predictor.predict(stockCode, data, currentPrice || undefined);
            console.log(`预测结果: ${predictionResults.length} 条`, predictionResults);
            setPredictions(predictionResults);
            const hasBuySignal = predictionResults.some(p => p.buySignal);
            if (hasBuySignal) {
                message.success(`${stockName}(${stockCode}) 检测到买入信号！`);
            }
        }
        catch (error) {
            console.error('加载预测数据失败:', error);
            message.error(`加载预测数据失败: ${error instanceof Error ? error.message : String(error)}`);
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx(Card, { title: `${stockName}(${stockCode}) AI预测`, extra: _jsx(Button, { type: "primary", onClick: loadPredictionData, loading: loading, children: "\u5237\u65B0" }), children: loading ? (_jsx(Text, { children: "\u52A0\u8F7D\u9884\u6D4B\u4E2D..." })) : predictions.length === 0 ? (_jsx(Text, { children: "\u6682\u65E0\u9884\u6D4B\u6570\u636E" })) : (_jsx("div", { children: predictions.map((prediction, index) => (_jsxs("div", { style: { marginBottom: 16 }, children: [_jsx(Text, { strong: true, children: prediction.date }), _jsxs("div", { children: ["\u9884\u6D4B\u4EF7\u683C: ", prediction.predictedClose.toFixed(2), "\u5143"] }), _jsxs("div", { children: ["\u4E0A\u6DA8\u7A7A\u95F4: +", prediction.upsidePotential.toFixed(2), "%"] }), _jsxs("div", { children: ["\u76EE\u6807\u4EF7\u683C: ", prediction.targetPrice.toFixed(2), "\u5143"] }), _jsxs("div", { children: ["\u6B62\u635F\u4EF7\u683C: ", prediction.stopLoss.toFixed(2), "\u5143"] }), prediction.buySignal && (_jsx(Text, { type: "success", children: "\u4E70\u5165\u4FE1\u53F7" })), prediction.sellSignal && (_jsx(Text, { type: "danger", children: "\u5356\u51FA\u4FE1\u53F7" }))] }, index))) })) }));
};
