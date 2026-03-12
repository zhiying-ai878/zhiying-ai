import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Card, Tabs, Row, Col, Statistic, Progress, Button, List, Tag, Space, Input, Select, message, Alert, Spin } from 'antd';
import { RiseOutlined, FallOutlined, SearchOutlined, HistoryOutlined, BarChartOutlined, FundOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { createModel, generatePrediction, calculateMA, calculateRSI, calculateMACD, calculateBollingerBands } from '../../utils/machineLearningModel';
import { getKLineData } from '../../utils/stockData';
const { Option } = Select;
const Prediction = () => {
    const [searchCode, setSearchCode] = useState('002594');
    const [searchName, setSearchName] = useState('比亚迪');
    const [predictionResult, setPredictionResult] = useState({
        price: 185.6,
        confidence: 78,
        trend: 'up',
        signal: 'buy',
        targetPrice: 192.5,
        supportPrice: 180.0,
        resistancePrice: 188.0,
        timeFrame: '3天'
    });
    const [loading, setLoading] = useState(false);
    const [modelLoading, setModelLoading] = useState(false);
    const [modelTrained, setModelTrained] = useState(false);
    const [technicalIndicators, setTechnicalIndicators] = useState({
        ma5: 0,
        ma10: 0,
        ma20: 0,
        rsi: 0,
        macd: 0,
        macdSignal: 0,
        macdHistogram: 0,
        bollingerUpper: 0,
        bollingerMiddle: 0,
        bollingerLower: 0
    });
    const [historyPredictions, setHistoryPredictions] = useState([
        { id: '1', code: '002594', name: '比亚迪', date: '2025-02-27', prediction: 'up', actual: 'up', accuracy: true },
        { id: '2', code: '300750', name: '宁德时代', date: '2025-02-26', prediction: 'down', actual: 'down', accuracy: true },
        { id: '3', code: '600519', name: '贵州茅台', date: '2025-02-25', prediction: 'up', actual: 'down', accuracy: false }
    ]);
    // 训练模型
    const trainModel = async (prices) => {
        setModelLoading(true);
        try {
            const modelParams = {
                epochs: 50,
                batchSize: 32,
                learningRate: 0.001,
                sequenceLength: 10,
                hiddenUnits: 50
            };
            const model = createModel('lstm', modelParams);
            const result = await model.train(prices);
            console.log('模型训练完成:', result);
            setModelTrained(true);
            return model;
        }
        catch (error) {
            console.error('模型训练失败:', error);
            message.error('模型训练失败');
            return null;
        }
        finally {
            setModelLoading(false);
        }
    };
    const handleSearch = async () => {
        setLoading(true);
        message.loading({ content: 'AI正在分析中...', key: 'predict' });
        try {
            // 获取历史K线数据
            const klineData = await getKLineData(searchCode, 'day', 60);
            const prices = klineData.map(item => item.close);
            // 计算技术指标
            const ma5 = calculateMA(prices, 5);
            const ma10 = calculateMA(prices, 10);
            const ma20 = calculateMA(prices, 20);
            const rsi = calculateRSI(prices, 14);
            const macd = calculateMACD(prices);
            const bollinger = calculateBollingerBands(prices);
            // 训练模型
            const model = await trainModel(prices);
            if (!model) {
                throw new Error('模型训练失败');
            }
            // 生成预测
            const currentPrice = prices[prices.length - 1];
            const prediction = await generatePrediction(prices, model, currentPrice);
            // 计算支撑位和压力位
            const supportPrice = currentPrice * 0.95;
            const resistancePrice = currentPrice * 1.05;
            setPredictionResult({
                ...prediction,
                targetPrice: prediction.price,
                supportPrice,
                resistancePrice,
                timeFrame: '3天'
            });
            // 保存技术指标数据用于展示
            setTechnicalIndicators({
                ma5: ma5[ma5.length - 1],
                ma10: ma10[ma10.length - 1],
                ma20: ma20[ma20.length - 1],
                rsi: rsi[rsi.length - 1],
                macd: macd.macd[macd.macd.length - 1],
                macdSignal: macd.signal[macd.signal.length - 1],
                macdHistogram: macd.histogram[macd.histogram.length - 1],
                bollingerUpper: bollinger.upper[bollinger.upper.length - 1],
                bollingerMiddle: bollinger.middle[bollinger.middle.length - 1],
                bollingerLower: bollinger.lower[bollinger.lower.length - 1]
            });
            message.success({ content: '预测完成！', key: 'predict' });
        }
        catch (error) {
            console.error('预测失败:', error);
            message.error('预测失败，请稍后重试');
        }
        finally {
            setLoading(false);
        }
    };
    const predictionTab = {
        key: '1',
        label: _jsxs("span", { children: [_jsx(BarChartOutlined, {}), "\u6DA8\u8DCC\u9884\u6D4B"] }),
        children: (_jsxs("div", { children: [_jsx(Card, { size: "small", style: { margin: '2px' }, children: _jsxs(Space.Compact, { style: { width: '100%' }, children: [_jsx(Input, { placeholder: "\u8F93\u5165\u80A1\u7968\u4EE3\u7801", value: searchCode, onChange: (e) => setSearchCode(e.target.value), prefix: _jsx(SearchOutlined, {}) }), _jsx(Input, { placeholder: "\u80A1\u7968\u540D\u79F0", value: searchName, onChange: (e) => setSearchName(e.target.value) }), _jsxs(Select, { defaultValue: "3days", style: { width: 120 }, children: [_jsx(Option, { value: "1day", children: "1\u5929" }), _jsx(Option, { value: "3days", children: "3\u5929" }), _jsx(Option, { value: "1week", children: "1\u5468" })] }), _jsx(Button, { type: "primary", icon: _jsx(ThunderboltOutlined, {}), onClick: handleSearch, children: "AI\u9884\u6D4B" })] }) }), _jsxs(Row, { gutter: [2, 2], children: [_jsx(Col, { xs: 24, sm: 12, children: _jsxs(Card, { size: "small", style: { margin: '2px' }, children: [_jsx(Statistic, { title: "\u5F53\u524D\u80A1\u7968", value: searchName, prefix: _jsx(FundOutlined, {}), valueStyle: { fontSize: '20px' } }), _jsxs("div", { style: { marginTop: '8px', color: '#666' }, children: ["\u4EE3\u7801\uFF1A", searchCode] }), modelLoading && (_jsx("div", { style: { marginTop: '8px' }, children: _jsx(Spin, { size: "small", tip: "\u6A21\u578B\u8BAD\u7EC3\u4E2D..." }) })), modelTrained && (_jsx("div", { style: { marginTop: '8px', color: '#52c41a' }, children: "\u2705 \u6A21\u578B\u8BAD\u7EC3\u5B8C\u6210" }))] }) }), _jsx(Col, { xs: 24, sm: 12, children: _jsxs(Card, { size: "small", style: { margin: '2px' }, children: [_jsx(Statistic, { title: "\u9884\u6D4B\u65B9\u5411", value: predictionResult.trend === 'up' ? '上涨' : predictionResult.trend === 'down' ? '下跌' : '稳定', prefix: predictionResult.trend === 'up' ? _jsx(RiseOutlined, {}) : predictionResult.trend === 'down' ? _jsx(FallOutlined, {}) : _jsx(FundOutlined, {}), valueStyle: { color: predictionResult.trend === 'up' ? '#3f8600' : predictionResult.trend === 'down' ? '#cf1322' : '#1890ff', fontSize: '20px' } }), _jsxs("div", { style: { marginTop: '8px' }, children: [_jsx("span", { children: "\u7F6E\u4FE1\u5EA6\uFF1A" }), _jsx(Progress, { percent: predictionResult.confidence, size: "small", style: { width: '120px', display: 'inline-block', verticalAlign: 'middle' }, strokeColor: predictionResult.trend === 'up' ? '#52c41a' : predictionResult.trend === 'down' ? '#ff4d4f' : '#1890ff' })] }), _jsxs("div", { style: { marginTop: '8px' }, children: [_jsx("span", { children: "\u4EA4\u6613\u4FE1\u53F7\uFF1A" }), _jsx(Tag, { color: predictionResult.signal === 'buy' ? 'green' : predictionResult.signal === 'sell' ? 'red' : 'blue', children: predictionResult.signal === 'buy' ? '买入' : predictionResult.signal === 'sell' ? '卖出' : '持有' })] })] }) })] }), _jsxs(Row, { gutter: [2, 2], style: { marginTop: '2px' }, children: [_jsx(Col, { xs: 24, sm: 8, children: _jsx(Card, { size: "small", style: { margin: '2px' }, children: _jsx(Statistic, { title: "\u76EE\u6807\u4EF7\u683C", value: predictionResult.targetPrice, precision: 2, prefix: _jsx(RiseOutlined, {}), valueStyle: { color: '#3f8600' } }) }) }), _jsx(Col, { xs: 24, sm: 8, children: _jsx(Card, { size: "small", style: { margin: '2px' }, children: _jsx(Statistic, { title: "\u652F\u6491\u4F4D", value: predictionResult.supportPrice, precision: 2, valueStyle: { color: '#1890ff' } }) }) }), _jsx(Col, { xs: 24, sm: 8, children: _jsx(Card, { size: "small", style: { margin: '2px' }, children: _jsx(Statistic, { title: "\u538B\u529B\u4F4D", value: predictionResult.resistancePrice, precision: 2, valueStyle: { color: '#faad14' } }) }) })] }), _jsxs(Card, { size: "small", style: { margin: '2px' }, title: "AI\u5206\u6790\u62A5\u544A", children: [_jsx(Alert, { message: "\u9884\u6D4B\u65F6\u95F4\u5468\u671F", description: `未来 ${predictionResult.timeFrame} 的价格走势预测`, type: "info", showIcon: true, style: { marginBottom: '12px' } }), _jsxs("div", { children: [_jsx("h4", { style: { marginBottom: '8px' }, children: "\uD83D\uDCCA \u6280\u672F\u6307\u6807\u5206\u6790\uFF1A" }), _jsxs("ul", { style: { margin: 0, paddingLeft: '20px' }, children: [_jsxs("li", { children: ["MA5\uFF1A", technicalIndicators.ma5.toFixed(2), "\u5143 ", technicalIndicators.ma5 > technicalIndicators.ma10 ? '(向上趋势)' : '(向下趋势)'] }), _jsxs("li", { children: ["MA10\uFF1A", technicalIndicators.ma10.toFixed(2), "\u5143"] }), _jsxs("li", { children: ["MA20\uFF1A", technicalIndicators.ma20.toFixed(2), "\u5143"] }), _jsxs("li", { children: ["RSI\uFF1A", technicalIndicators.rsi.toFixed(1), " ", technicalIndicators.rsi > 70 ? '(超买)' : technicalIndicators.rsi < 30 ? '(超卖)' : '(中性)'] }), _jsxs("li", { children: ["MACD\uFF1A", technicalIndicators.macd.toFixed(4), " ", technicalIndicators.macd > technicalIndicators.macdSignal ? '(金叉)' : '(死叉)'] }), _jsxs("li", { children: ["MACD\u67F1\u72B6\u56FE\uFF1A", technicalIndicators.macdHistogram > 0 ? '红柱' : '绿柱'] }), _jsxs("li", { children: ["\u5E03\u6797\u5E26\u4E0A\u8F68\uFF1A", technicalIndicators.bollingerUpper.toFixed(2), "\u5143"] }), _jsxs("li", { children: ["\u5E03\u6797\u5E26\u4E2D\u8F68\uFF1A", technicalIndicators.bollingerMiddle.toFixed(2), "\u5143"] }), _jsxs("li", { children: ["\u5E03\u6797\u5E26\u4E0B\u8F68\uFF1A", technicalIndicators.bollingerLower.toFixed(2), "\u5143"] })] })] }), _jsxs("div", { style: { marginTop: '12px' }, children: [_jsx("h4", { style: { marginBottom: '8px' }, children: "\uD83D\uDCA1 \u64CD\u4F5C\u5EFA\u8BAE\uFF1A" }), _jsx(Tag, { color: predictionResult.trend === 'up' ? 'green' : 'red', children: predictionResult.trend === 'up' ? '建议买入/持有' : '建议卖出/观望' }), _jsx("p", { style: { marginTop: '8px', color: '#666', fontSize: '13px' }, children: "\u26A0\uFE0F \u514D\u8D23\u58F0\u660E\uFF1A\u4EE5\u4E0A\u9884\u6D4B\u4EC5\u4F9B\u53C2\u8003\uFF0C\u4E0D\u6784\u6210\u6295\u8D44\u5EFA\u8BAE\u3002\u80A1\u5E02\u6709\u98CE\u9669\uFF0C\u6295\u8D44\u9700\u8C28\u614E\uFF01" })] })] })] }))
    };
    const historyTab = {
        key: '2',
        label: _jsxs("span", { children: [_jsx(HistoryOutlined, {}), "\u5386\u53F2\u9884\u6D4B"] }),
        children: (_jsxs("div", { children: [_jsxs(Row, { gutter: [2, 2], style: { marginBottom: '2px' }, children: [_jsx(Col, { xs: 12, sm: 6, children: _jsx(Card, { size: "small", style: { margin: '2px' }, children: _jsx(Statistic, { title: "\u603B\u9884\u6D4B\u6B21\u6570", value: historyPredictions.length, prefix: _jsx(HistoryOutlined, {}) }) }) }), _jsx(Col, { xs: 12, sm: 6, children: _jsx(Card, { size: "small", style: { margin: '2px' }, children: _jsx(Statistic, { title: "\u9884\u6D4B\u51C6\u786E", value: historyPredictions.filter(p => p.accuracy).length, valueStyle: { color: '#3f8600' } }) }) }), _jsx(Col, { xs: 12, sm: 6, children: _jsx(Card, { size: "small", style: { margin: '2px' }, children: _jsx(Statistic, { title: "\u9884\u6D4B\u9519\u8BEF", value: historyPredictions.filter(p => !p.accuracy).length, valueStyle: { color: '#cf1322' } }) }) }), _jsx(Col, { xs: 12, sm: 6, children: _jsx(Card, { size: "small", style: { margin: '2px' }, children: _jsx(Statistic, { title: "\u51C6\u786E\u7387", value: (historyPredictions.filter(p => p.accuracy).length / historyPredictions.length * 100).toFixed(1), suffix: "%", valueStyle: { color: '#1890ff' } }) }) })] }), _jsx(List, { dataSource: historyPredictions, renderItem: (item) => (_jsx(List.Item, { children: _jsx(Card, { size: "small", style: { width: '100%', margin: '2px' }, children: _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsx("div", { children: _jsxs(Space, { children: [_jsx("span", { style: { fontWeight: 'bold' }, children: item.name }), _jsx("span", { style: { color: '#666' }, children: item.code }), _jsx(Tag, { color: "blue", children: item.date }), _jsxs(Tag, { color: item.prediction === 'up' ? 'green' : 'red', children: [item.prediction === 'up' ? _jsx(RiseOutlined, {}) : _jsx(FallOutlined, {}), item.prediction === 'up' ? '预测上涨' : '预测下跌'] }), _jsxs(Tag, { color: item.actual === 'up' ? 'green' : 'red', children: [item.actual === 'up' ? _jsx(RiseOutlined, {}) : _jsx(FallOutlined, {}), item.actual === 'up' ? '实际上涨' : '实际下跌'] })] }) }), _jsx(Tag, { color: item.accuracy ? 'green' : 'red', children: item.accuracy ? '✓ 准确' : '✗ 错误' })] }) }) })) })] }))
    };
    return _jsx("div", { className: "prediction-page", children: _jsx(Tabs, { defaultActiveKey: "1", size: "small", items: [predictionTab, historyTab] }) });
};
export default Prediction;
