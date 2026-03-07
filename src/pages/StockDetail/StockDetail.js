import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { Card, Row, Col, Statistic, Tabs, Tag, Space, Button, Select, Table, Divider, Alert, Modal, Badge, message } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, BarChartOutlined, StockOutlined, RiseOutlined, StarOutlined, BellOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { getKLineData } from '../../utils/stockData';
import { getChipPeakAnalyzer } from '../../utils/chipPeakAnalyzer';
import * as SignalManager from '../../utils/optimizedSignalManager';
import { getMainForceTracker } from '../../utils/mainForceTracker';
const { getOptimizedSignalManager } = SignalManager;
const { Option } = Select;
const StockDetail = () => {
    const [stockInfo] = useState({
        code: '300402',
        name: '宝色股份',
        price: 24.76,
        change: 1.23,
        changePercent: 5.23,
        open: 23.38,
        high: 26.40,
        low: 23.31,
        volume: '24.47万手',
        turnover: '6.12亿',
        pe: 91.31,
        pb: 6.8,
    });
    const [kLinePeriod, setKLinePeriod] = useState('day');
    const [timeShareData, setTimeShareData] = useState([]);
    const [kLineData, setKLineData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [orderBook, setOrderBook] = useState([]);
    const [transactionData, setTransactionData] = useState([]);
    const [chipDistribution, setChipDistribution] = useState(null);
    const [currentSignal, setCurrentSignal] = useState(null);
    const [signalModalVisible, setSignalModalVisible] = useState(false);
    const [signalHistory, setSignalHistory] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const stockCode = stockInfo.code;
    const analyzer = getChipPeakAnalyzer();
    const signalManager = getOptimizedSignalManager();
    const mainForceTracker = getMainForceTracker();
    const signalTimerRef = useRef(null);
    useEffect(() => {
        loadTimeShareData();
        loadKLineData();
        loadOrderBook();
        loadTransactionData();
        loadChipDistribution();
        initializeSignals();
        return () => {
            if (signalTimerRef.current) {
                clearInterval(signalTimerRef.current);
            }
        };
    }, [stockCode, kLinePeriod]);
    const initializeSignals = () => {
        loadSignalHistory();
        startSignalGeneration();
    };
    const loadSignalHistory = () => {
        const history = signalManager.getSignalHistory();
        setSignalHistory(history);
        const unread = history.filter((s) => !s.isRead).length;
        setUnreadCount(unread);
    };
    const startSignalGeneration = () => {
        generateMockSignal();
        signalTimerRef.current = setInterval(() => {
            generateMockSignal();
        }, 30000);
    };
    const generateMockSignal = () => {
        const mockMainForceData = {
            stockCode: stockInfo.code,
            stockName: stockInfo.name,
            currentPrice: stockInfo.price,
            mainForceNetFlow: (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 500000000 + 50000000),
            totalNetFlow: (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 800000000 + 100000000),
            superLargeOrder: {
                netFlow: (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 300000000 + 20000000),
                volume: Math.random() * 500000000 + 100000000,
                amount: Math.random() * 500000000 + 100000000
            },
            largeOrder: {
                netFlow: (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 200000000 + 10000000),
                volume: Math.random() * 300000000 + 50000000,
                amount: Math.random() * 300000000 + 50000000
            },
            mediumOrder: {
                netFlow: (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 100000000 + 5000000),
                volume: Math.random() * 200000000 + 30000000,
                amount: Math.random() * 200000000 + 30000000
            },
            smallOrder: {
                netFlow: (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 50000000 + 2000000),
                volume: Math.random() * 100000000 + 20000000,
                amount: Math.random() * 100000000 + 20000000
            },
            volumeAmplification: Math.random() * 4 + 0.5,
            turnoverRate: Math.random() * 15 + 1,
            timestamp: Date.now()
        };
        signalManager.processMainForceData(mockMainForceData);
        if (Math.random() > 0.6) {
            const prediction = signalManager.processPredictionData(stockInfo.code, stockInfo.name, stockInfo.price);
        }
        const buySignals = signalManager.getOptimizedBuySignals();
        const sellSignals = signalManager.getOptimizedSellSignals();
        const allSignals = [...buySignals, ...sellSignals].sort((a, b) => b.confidence - a.confidence);
        if (allSignals.length > 0) {
            const newSignal = allSignals[0];
            if (!newSignal.isRead && signalManager.shouldNotifySignal(newSignal)) {
                setCurrentSignal(newSignal);
                setSignalModalVisible(true);
                setUnreadCount(prev => prev + 1);
                message.info(`收到${newSignal.type === 'buy' ? '买入' : '卖出'}信号：${newSignal.stockName}`);
            }
        }
        loadSignalHistory();
    };
    const handleSignalAction = (signal, action) => {
        signalManager.markSignalAsRead(signal.id);
        if (action === 'execute') {
            message.success(`已执行${signal.type === 'buy' ? '买入' : '卖出'}操作`);
        }
        else {
            message.info('已忽略该信号');
        }
        setSignalModalVisible(false);
        setUnreadCount(prev => Math.max(0, prev - 1));
        loadSignalHistory();
    };
    const loadTimeShareData = () => {
        const data = [];
        const basePrice = stockInfo.open;
        const startTime = 9 * 60 + 30;
        const endTime = 15 * 60;
        const intervals = Math.floor((endTime - startTime) / 1);
        let currentPrice = basePrice;
        for (let i = 0; i <= intervals; i++) {
            const minutes = startTime + i;
            const hour = Math.floor(minutes / 60);
            const minute = minutes % 60;
            const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            const change = (Math.random() - 0.5) * 0.5;
            currentPrice += change;
            data.push({
                time,
                price: currentPrice.toFixed(2),
                volume: Math.floor(Math.random() * 1000000),
                avg: (currentPrice + 2).toFixed(2)
            });
        }
        setTimeShareData(data);
    };
    const loadKLineData = async () => {
        setLoading(true);
        try {
            const data = await getKLineData(stockCode, kLinePeriod, 60);
            setKLineData(data);
        }
        catch (error) {
            console.error('加载K线数据失败:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const loadOrderBook = () => {
        const buyOrders = [];
        const sellOrders = [];
        let buyPrice = stockInfo.price;
        let sellPrice = stockInfo.price;
        for (let i = 0; i < 5; i++) {
            buyPrice -= 0.1 + Math.random() * 0.1;
            buyOrders.push({
                price: buyPrice.toFixed(2),
                volume: Math.floor(Math.random() * 10000) + 1000,
                type: 'buy'
            });
            sellPrice += 0.1 + Math.random() * 0.1;
            sellOrders.unshift({
                price: sellPrice.toFixed(2),
                volume: Math.floor(Math.random() * 10000) + 1000,
                type: 'sell'
            });
        }
        setOrderBook([...sellOrders, ...buyOrders]);
    };
    const loadTransactionData = () => {
        const data = [];
        const now = new Date();
        for (let i = 0; i < 20; i++) {
            const time = new Date(now.getTime() - i * 5000);
            const isBuy = Math.random() > 0.5;
            const priceChange = (Math.random() - 0.5) * 0.5;
            data.push({
                time: time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                price: (stockInfo.price + priceChange).toFixed(2),
                volume: Math.floor(Math.random() * 500) + 10,
                type: isBuy ? 'buy' : 'sell'
            });
        }
        setTransactionData(data);
    };
    const loadChipDistribution = () => {
        const distribution = analyzer.generateChipDistribution(stockCode, stockInfo.name, stockInfo.price);
        setChipDistribution(distribution);
    };
    const getTimeShareChartOption = () => {
        const prices = timeShareData.map(item => parseFloat(item.price));
        const averages = timeShareData.map(item => parseFloat(item.avg));
        const times = timeShareData.map(item => item.time);
        const signalMarkPoints = [];
        if (currentSignal && signalHistory.length > 0) {
            const randomIndex = Math.floor(Math.random() * times.length);
            signalMarkPoints.push({
                name: currentSignal.type === 'buy' ? '买入' : '卖出',
                coord: [times[randomIndex], prices[randomIndex]],
                value: currentSignal.type === 'buy' ? 'B' : 'S',
                itemStyle: {
                    color: currentSignal.type === 'buy' ? '#52c41a' : '#ff4d4f'
                }
            });
        }
        return {
            tooltip: {
                trigger: 'axis',
                formatter: (params) => {
                    const data = params[0];
                    return `${data.axisValue}<br/>价格: ${data.value}`;
                }
            },
            grid: { left: '8%', right: '3%', bottom: '3%', top: '10%', containLabel: true },
            xAxis: { type: 'category', boundaryGap: false, data: times, axisLabel: { fontSize: 10 } },
            yAxis: { type: 'value', scale: true, axisLabel: { fontSize: 10 } },
            series: [
                {
                    name: '价格',
                    type: 'line',
                    data: prices,
                    smooth: true,
                    itemStyle: { color: '#ff4d4f' },
                    areaStyle: {
                        color: {
                            type: 'linear',
                            x: 0, y: 0, x2: 0, y2: 1,
                            colorStops: [
                                { offset: 0, color: 'rgba(255,77,79,0.3)' },
                                { offset: 1, color: 'rgba(255,77,79,0.05)' }
                            ]
                        }
                    },
                    markPoint: {
                        data: signalMarkPoints,
                        symbol: 'pin',
                        symbolSize: 50,
                        label: {
                            show: true,
                            color: '#fff',
                            fontSize: 14,
                            fontWeight: 'bold'
                        }
                    }
                },
                {
                    name: '均价',
                    type: 'line',
                    data: averages,
                    smooth: true,
                    itemStyle: { color: '#ffc107' },
                    lineStyle: { type: 'dashed' }
                }
            ]
        };
    };
    const getVolumeChartOption = () => {
        const prices = timeShareData.map(item => parseFloat(item.price));
        const volumes = timeShareData.map(item => item.volume);
        const times = timeShareData.map(item => item.time);
        return {
            tooltip: {
                trigger: 'axis',
                formatter: (params) => {
                    const data = params[0];
                    return `${data.axisValue}<br/>成交量: ${(data.value / 10000).toFixed(2)}万`;
                }
            },
            grid: { left: '8%', right: '3%', bottom: '10%', top: '5%', containLabel: true },
            xAxis: { type: 'category', boundaryGap: false, data: times, axisLabel: { fontSize: 10, show: false } },
            yAxis: { type: 'value', axisLabel: { fontSize: 10, formatter: (value) => (value / 10000).toFixed(0) + '万' } },
            series: [
                {
                    name: '成交量',
                    type: 'bar',
                    data: volumes,
                    itemStyle: {
                        color: (params) => {
                            return prices[params.dataIndex] >= stockInfo.open ? '#cf1322' : '#52c41a';
                        }
                    }
                }
            ]
        };
    };
    const getMACDChartOption = () => {
        const times = timeShareData.map(item => item.time);
        const difData = timeShareData.map((_, i) => (Math.sin(i / 10) * 0.5));
        const deaData = timeShareData.map((_, i) => (Math.cos(i / 10) * 0.3));
        const macdData = timeShareData.map((_, i) => difData[i] - deaData[i]);
        return {
            tooltip: {
                trigger: 'axis',
                formatter: (params) => {
                    let result = params[0].axisValue + '<br/>';
                    params.forEach((param) => {
                        result += `${param.seriesName}: ${param.value.toFixed(3)}<br/>`;
                    });
                    return result;
                }
            },
            grid: { left: '8%', right: '3%', bottom: '10%', top: '15%', containLabel: true },
            legend: {
                data: ['DIF', 'DEA', 'MACD'],
                top: 0,
                textStyle: { fontSize: 10 }
            },
            xAxis: { type: 'category', boundaryGap: false, data: times, axisLabel: { fontSize: 9 } },
            yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
            series: [
                {
                    name: 'DIF',
                    type: 'line',
                    data: difData,
                    smooth: true,
                    itemStyle: { color: '#ffc107' }
                },
                {
                    name: 'DEA',
                    type: 'line',
                    data: deaData,
                    smooth: true,
                    itemStyle: { color: '#1890ff' }
                },
                {
                    name: 'MACD',
                    type: 'bar',
                    data: macdData,
                    itemStyle: {
                        color: (params) => {
                            return params.value >= 0 ? '#cf1322' : '#52c41a';
                        }
                    }
                }
            ]
        };
    };
    const getKDJChartOption = () => {
        const times = timeShareData.map(item => item.time);
        const kData = timeShareData.map((_, i) => 50 + Math.sin(i / 8) * 30);
        const dData = timeShareData.map((_, i) => 50 + Math.cos(i / 8) * 25);
        const jData = timeShareData.map((_, i) => 3 * kData[i] - 2 * dData[i]);
        return {
            tooltip: {
                trigger: 'axis',
                formatter: (params) => {
                    let result = params[0].axisValue + '<br/>';
                    params.forEach((param) => {
                        result += `${param.seriesName}: ${param.value.toFixed(3)}<br/>`;
                    });
                    return result;
                }
            },
            grid: { left: '8%', right: '3%', bottom: '10%', top: '15%', containLabel: true },
            legend: {
                data: ['K', 'D', 'J'],
                top: 0,
                textStyle: { fontSize: 10 }
            },
            xAxis: { type: 'category', boundaryGap: false, data: times, axisLabel: { fontSize: 9 } },
            yAxis: { type: 'value', min: 0, max: 100, axisLabel: { fontSize: 10 } },
            series: [
                {
                    name: 'K',
                    type: 'line',
                    data: kData,
                    smooth: true,
                    itemStyle: { color: '#ffc107' }
                },
                {
                    name: 'D',
                    type: 'line',
                    data: dData,
                    smooth: true,
                    itemStyle: { color: '#1890ff' }
                },
                {
                    name: 'J',
                    type: 'line',
                    data: jData,
                    smooth: true,
                    itemStyle: { color: '#a855f7' }
                }
            ]
        };
    };
    const getKLineChartOption = () => {
        const dates = kLineData.map(item => item.date);
        const values = kLineData.map(item => [item.open, item.close, item.low, item.high]);
        const volumes = kLineData.map(item => item.volume);
        const ma5 = kLineData.map((_, i, arr) => {
            if (i < 4) {
                return null;
            }
            let sum = 0;
            for (let j = 0; j < 5; j++) {
                sum += arr[i - j].close;
            }
            return (sum / 5).toFixed(2);
        });
        const ma10 = kLineData.map((_, i, arr) => {
            if (i < 9) {
                return null;
            }
            let sum = 0;
            for (let j = 0; j < 10; j++) {
                sum += arr[i - j].close;
            }
            return (sum / 10).toFixed(2);
        });
        const ma20 = kLineData.map((_, i, arr) => {
            if (i < 19) {
                return null;
            }
            let sum = 0;
            for (let j = 0; j < 20; j++) {
                sum += arr[i - j].close;
            }
            return (sum / 20).toFixed(2);
        });
        const signalMarkPoints = [];
        if (currentSignal && kLineData.length > 0) {
            const randomIndex = Math.floor(Math.random() * kLineData.length);
            signalMarkPoints.push({
                name: currentSignal.type === 'buy' ? '买入' : '卖出',
                coord: [dates[randomIndex], values[randomIndex][1]],
                value: currentSignal.type === 'buy' ? 'B' : 'S',
                itemStyle: {
                    color: currentSignal.type === 'buy' ? '#52c41a' : '#ff4d4f'
                }
            });
        }
        return {
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'cross' }
            },
            grid: [
                { left: '8%', right: '3%', top: '10%', height: '45%' },
                { left: '8%', right: '3%', top: '60%', height: '15%' }
            ],
            legend: {
                data: ['K线', 'MA5', 'MA10', 'MA20'],
                top: 0,
                textStyle: { fontSize: 10 }
            },
            xAxis: [
                { type: 'category', data: dates, boundaryGap: false, axisLine: { onZero: false }, splitLine: { show: false }, axisLabel: { fontSize: 10 } },
                { type: 'category', gridIndex: 1, data: dates, boundaryGap: false, axisLine: { onZero: false }, axisTick: { show: false }, splitLine: { show: false }, axisLabel: { show: false } }
            ],
            yAxis: [
                { scale: true, splitArea: { show: true }, axisLabel: { fontSize: 10 } },
                { scale: true, gridIndex: 1, splitNumber: 2, axisLabel: { show: false }, axisLine: { show: false }, axisTick: { show: false }, splitLine: { show: false } }
            ],
            dataZoom: [
                { type: 'inside', xAxisIndex: [0, 1], start: 50, end: 100 },
                { show: true, xAxisIndex: [0, 1], type: 'slider', bottom: '2%', start: 50, end: 100, height: 20 }
            ],
            series: [
                {
                    name: 'K线',
                    type: 'candlestick',
                    data: values,
                    itemStyle: { color: '#cf1322', color0: '#52c41a', borderColor: '#cf1322', borderColor0: '#52c41a' },
                    markPoint: {
                        data: signalMarkPoints,
                        symbol: 'pin',
                        symbolSize: 50,
                        label: {
                            show: true,
                            color: '#fff',
                            fontSize: 14,
                            fontWeight: 'bold'
                        }
                    }
                },
                {
                    name: 'MA5',
                    type: 'line',
                    data: ma5,
                    smooth: true,
                    itemStyle: { color: '#1890ff' },
                    showSymbol: false
                },
                {
                    name: 'MA10',
                    type: 'line',
                    data: ma10,
                    smooth: true,
                    itemStyle: { color: '#ffc107' },
                    showSymbol: false
                },
                {
                    name: 'MA20',
                    type: 'line',
                    data: ma20,
                    smooth: true,
                    itemStyle: { color: '#a855f7' },
                    showSymbol: false
                },
                {
                    name: '成交量',
                    type: 'bar',
                    xAxisIndex: 1,
                    yAxisIndex: 1,
                    data: volumes,
                    itemStyle: {
                        color: (params) => {
                            const dataIndex = params.dataIndex;
                            const value = values[dataIndex];
                            return value[1] >= value[0] ? '#cf1322' : '#52c41a';
                        }
                    }
                }
            ]
        };
    };
    const getChipChartOption = () => {
        if (!chipDistribution)
            return {};
        return {
            title: { text: '', left: 'center' },
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                formatter: (params) => {
                    const data = params[0];
                    if (!data)
                        return '';
                    return `
            <div>价格: ${data.value[1].toFixed(2)}</div>
            <div>成交量: ${(data.value[0] / 10000).toFixed(2)}万</div>
            <div>占比: ${data.value[2].toFixed(2)}%</div>
          `;
                }
            },
            grid: { left: '20%', right: '5%', bottom: '5%', top: '5%' },
            xAxis: {
                type: 'value',
                name: '',
                axisLabel: {
                    formatter: (value) => (value / 10000).toFixed(0) + '万',
                    fontSize: 10
                }
            },
            yAxis: {
                type: 'value',
                name: '',
                position: 'right',
                axisLabel: { fontSize: 10 }
            },
            series: [{
                    type: 'bar',
                    data: chipDistribution.peaks.map((p) => [p.volume, p.price, p.percentage]),
                    itemStyle: {
                        color: (params) => {
                            return chipDistribution.peaks[params.dataIndex].color;
                        }
                    },
                    markLine: {
                        data: [
                            {
                                yAxis: chipDistribution.currentPrice,
                                name: '当前价格',
                                lineStyle: { color: '#ff4d4f', width: 2, type: 'dashed' },
                                label: { formatter: '{c}', fontSize: 10 }
                            }
                        ]
                    }
                }]
        };
    };
    const renderOrderBook = () => {
        const sellOrders = orderBook.slice(0, 5).reverse();
        const buyOrders = orderBook.slice(5, 10);
        return (_jsxs("div", { style: { fontSize: '12px' }, children: [sellOrders.map((item, index) => (_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', padding: '2px 0' }, children: [_jsx("span", { style: { color: '#52c41a' }, children: item.price }), _jsx("span", { style: { color: '#666' }, children: item.volume })] }, `sell-${index}`))), _jsx(Divider, { style: { margin: '4px 0' } }), _jsx("div", { style: { display: 'flex', justifyContent: 'center', fontWeight: 'bold', color: '#cf1322', fontSize: '14px' }, children: stockInfo.price.toFixed(2) }), _jsx(Divider, { style: { margin: '4px 0' } }), buyOrders.map((item, index) => (_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', padding: '2px 0' }, children: [_jsx("span", { style: { color: '#cf1322' }, children: item.price }), _jsx("span", { style: { color: '#666' }, children: item.volume })] }, `buy-${index}`)))] }));
    };
    const basicInfoTab = {
        key: '1',
        label: _jsxs("span", { children: [_jsx(BarChartOutlined, {}), "\u57FA\u672C\u4FE1\u606F"] }),
        children: (_jsxs("div", { children: [_jsx(Card, { size: "small", style: { margin: '2px' }, children: _jsxs(Row, { gutter: [2, 2], children: [_jsx(Col, { xs: 12, sm: 6, children: _jsx(Statistic, { title: "\u4ECA\u5F00", value: stockInfo.open, precision: 2 }) }), _jsx(Col, { xs: 12, sm: 6, children: _jsx(Statistic, { title: "\u6700\u9AD8", value: stockInfo.high, precision: 2, valueStyle: { color: '#cf1322' } }) }), _jsx(Col, { xs: 12, sm: 6, children: _jsx(Statistic, { title: "\u6700\u4F4E", value: stockInfo.low, precision: 2, valueStyle: { color: '#3f8600' } }) }), _jsx(Col, { xs: 12, sm: 6, children: _jsx(Statistic, { title: "\u6210\u4EA4\u91CF", value: stockInfo.volume }) })] }) }), _jsx(Card, { size: "small", style: { margin: '2px' }, children: _jsxs(Row, { gutter: [2, 2], children: [_jsx(Col, { xs: 12, sm: 6, children: _jsx(Statistic, { title: "\u6210\u4EA4\u989D", value: stockInfo.turnover }) }), _jsx(Col, { xs: 12, sm: 6, children: _jsx(Statistic, { title: "\u5E02\u76C8\u7387(PE)", value: stockInfo.pe, precision: 1 }) }), _jsx(Col, { xs: 12, sm: 6, children: _jsx(Statistic, { title: "\u5E02\u51C0\u7387(PB)", value: stockInfo.pb, precision: 1 }) }), _jsx(Col, { xs: 12, sm: 6, children: _jsx(Statistic, { title: "\u6362\u624B\u7387", value: "10.05%" }) })] }) })] }))
    };
    const timeShareTab = {
        key: '2',
        label: _jsxs("span", { children: [_jsx(RiseOutlined, {}), "\u5206\u65F6"] }),
        children: (_jsx("div", { children: _jsxs(Row, { gutter: [2, 2], children: [_jsxs(Col, { xs: 24, lg: 20, children: [_jsx(Card, { size: "small", style: { margin: '2px' }, children: _jsx(ReactECharts, { option: getTimeShareChartOption(), style: { height: '280px' }, notMerge: true }) }), _jsx(Card, { size: "small", style: { margin: '2px' }, children: _jsx(ReactECharts, { option: getVolumeChartOption(), style: { height: '100px' }, notMerge: true }) }), _jsx(Card, { size: "small", style: { margin: '2px' }, children: _jsx(ReactECharts, { option: getMACDChartOption(), style: { height: '150px' }, notMerge: true }) }), _jsx(Card, { size: "small", style: { margin: '2px' }, children: _jsx(ReactECharts, { option: getKDJChartOption(), style: { height: '150px' }, notMerge: true }) })] }), _jsxs(Col, { xs: 24, lg: 4, children: [_jsx(Card, { size: "small", title: "\u4E94\u6863", style: { margin: '2px' }, children: renderOrderBook() }), _jsx(Card, { size: "small", title: "\u6BCF\u7B14\u6210\u4EA4", style: { margin: '2px' }, children: _jsx(Table, { columns: [
                                        {
                                            title: '时间',
                                            dataIndex: 'time',
                                            key: 'time',
                                            render: (text) => text.slice(3),
                                            width: '35%'
                                        },
                                        {
                                            title: '价格',
                                            dataIndex: 'price',
                                            key: 'price',
                                            render: (price, record) => (_jsx("span", { style: { color: record.type === 'buy' ? '#cf1322' : '#52c41a' }, children: price })),
                                            width: '35%'
                                        },
                                        {
                                            title: '成交量',
                                            dataIndex: 'volume',
                                            key: 'volume',
                                            width: '30%'
                                        }
                                    ], dataSource: transactionData, pagination: { pageSize: 10, size: 'small' }, size: "small", showHeader: true }) })] })] }) }))
    };
    const kLineTab = {
        key: '3',
        label: _jsxs("span", { children: [_jsx(StockOutlined, {}), "\u65E5K"] }),
        children: (_jsx("div", { children: _jsxs(Row, { gutter: [2, 2], children: [_jsxs(Col, { xs: 24, lg: 20, children: [_jsxs(Card, { size: "small", style: { margin: '2px' }, children: [_jsx("div", { style: { marginBottom: '2px', display: 'flex', gap: '8px', alignItems: 'center' }, children: _jsxs(Select, { value: kLinePeriod, onChange: (value) => setKLinePeriod(value), style: { width: 100 }, size: "small", children: [_jsx(Option, { value: "day", children: "\u65E5\u7EBF" }), _jsx(Option, { value: "week", children: "\u5468\u7EBF" }), _jsx(Option, { value: "month", children: "\u6708\u7EBF" })] }) }), _jsx(ReactECharts, { option: getKLineChartOption(), style: { height: '400px' }, notMerge: true })] }), _jsx(Card, { size: "small", style: { margin: '2px' }, children: _jsx(ReactECharts, { option: getMACDChartOption(), style: { height: '150px' }, notMerge: true }) }), _jsx(Card, { size: "small", style: { margin: '2px' }, children: _jsx(ReactECharts, { option: getKDJChartOption(), style: { height: '150px' }, notMerge: true }) })] }), _jsx(Col, { xs: 24, lg: 4, children: _jsx(Card, { size: "small", title: "\u7B79\u7801\u5CF0", style: { margin: '2px' }, children: chipDistribution && (_jsxs(_Fragment, { children: [_jsxs(Row, { gutter: [2, 2], style: { marginBottom: '2px' }, children: [_jsx(Col, { xs: 12, children: _jsxs("div", { style: { fontSize: '12px' }, children: [_jsx("div", { style: { color: '#666' }, children: "\u83B7\u5229\u6BD4\u4F8B:" }), _jsxs("div", { style: { color: '#52c41a', fontWeight: 'bold', fontSize: '14px' }, children: [chipDistribution.profitPercentage.toFixed(2), "%"] })] }) }), _jsx(Col, { xs: 12, children: _jsxs("div", { style: { fontSize: '12px' }, children: [_jsx("div", { style: { color: '#666' }, children: "\u5E73\u5747\u6210\u672C:" }), _jsx("div", { style: { color: '#1890ff', fontWeight: 'bold', fontSize: '14px' }, children: chipDistribution.avgCost.toFixed(2) })] }) })] }), _jsxs(Row, { gutter: [2, 2], style: { marginBottom: '2px' }, children: [_jsx(Col, { xs: 12, children: _jsxs("div", { style: { fontSize: '12px' }, children: [_jsx("div", { style: { color: '#666' }, children: "90%\u6210\u672C:" }), _jsx("div", { style: { color: '#666', fontSize: '11px' }, children: "21.14-25.06" })] }) }), _jsx(Col, { xs: 12, children: _jsxs("div", { style: { fontSize: '12px' }, children: [_jsx("div", { style: { color: '#666' }, children: "\u96C6\u4E2D\u5EA6:" }), _jsx("div", { style: { color: '#666', fontSize: '11px' }, children: "8.48%" })] }) })] }), _jsx(ReactECharts, { option: getChipChartOption(), style: { height: '250px' } }), _jsxs("div", { style: { marginTop: '2px', display: 'flex', justifyContent: 'center', gap: '12px', fontSize: '11px' }, children: [_jsx("span", { children: _jsx(Tag, { color: "green", children: "\u83B7\u5229\u76D8" }) }), _jsx("span", { children: _jsx(Tag, { color: "gold", children: "\u5F53\u524D\u4EF7" }) }), _jsx("span", { children: _jsx(Tag, { color: "red", children: "\u5957\u7262\u76D8" }) })] })] })) }) })] }) }))
    };
    return (_jsxs("div", { className: "stock-detail", style: { padding: '2px' }, children: [_jsx(Card, { size: "small", style: { margin: '2px' }, children: _jsxs(Row, { gutter: [2, 2], align: "middle", children: [_jsx(Col, { xs: 12, sm: 8, children: _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' }, children: [_jsx("h2", { style: { margin: 0, fontSize: '20px' }, children: stockInfo.name }), _jsx("span", { style: { color: '#666', fontSize: '14px' }, children: stockInfo.code }), _jsx(Button, { type: "text", icon: _jsx(StarOutlined, {}), size: "small" })] }) }), _jsx(Col, { xs: 12, sm: 16, style: { textAlign: 'right' }, children: _jsxs("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }, children: [_jsxs("div", { children: [_jsx("div", { style: { fontSize: '28px', fontWeight: 'bold', color: stockInfo.change >= 0 ? '#cf1322' : '#3f8600' }, children: stockInfo.price.toFixed(2) }), _jsxs(Tag, { color: stockInfo.change >= 0 ? 'red' : 'green', style: { fontSize: '14px' }, children: [stockInfo.change >= 0 ? _jsx(ArrowUpOutlined, {}) : _jsx(ArrowDownOutlined, {}), stockInfo.change >= 0 ? '+' : '', stockInfo.change.toFixed(2), " (", stockInfo.changePercent >= 0 ? '+' : '', stockInfo.changePercent.toFixed(2), "%)"] })] }), _jsxs("div", { style: { textAlign: 'left', fontSize: '12px', color: '#666' }, children: [_jsxs("div", { children: ["\u4ECA\u5F00 ", stockInfo.open.toFixed(2)] }), _jsxs("div", { children: ["\u6700\u9AD8 ", stockInfo.high.toFixed(2)] }), _jsxs("div", { children: ["\u6700\u4F4E ", stockInfo.low.toFixed(2)] })] }), _jsxs("div", { style: { textAlign: 'left', fontSize: '12px', color: '#666' }, children: [_jsx("div", { children: "\u6362\u624B 10.05%" }), _jsxs("div", { children: ["\u603B\u624B ", stockInfo.volume] }), _jsxs("div", { children: ["\u91D1\u989D ", stockInfo.turnover] })] }), _jsx(Badge, { count: unreadCount, overflowCount: 99, children: _jsx(Button, { type: "primary", icon: _jsx(BellOutlined, {}), size: "small", onClick: () => setSignalModalVisible(true), children: "\u4FE1\u53F7" }) })] }) })] }) }), currentSignal && (_jsx(Card, { size: "small", style: { margin: '2px' }, children: _jsx(Alert, { message: _jsxs(Space, { children: [currentSignal.type === 'buy' ? _jsx(CheckCircleOutlined, {}) : _jsx(CloseCircleOutlined, {}), _jsxs("span", { style: { fontWeight: 'bold' }, children: [currentSignal.type === 'buy' ? '买入' : '卖出', "\u4FE1\u53F7"] }), _jsxs(Tag, { color: currentSignal.type === 'buy' ? 'green' : 'red', children: ["\u7F6E\u4FE1\u5EA6: ", currentSignal.confidence, "%"] })] }), description: _jsxs("div", { children: [_jsx("div", { style: { marginBottom: '8px' }, children: currentSignal.reason }), _jsxs(Space, { children: [_jsx(Button, { type: "primary", size: "small", onClick: () => handleSignalAction(currentSignal, 'execute'), children: "\u6267\u884C" }), _jsx(Button, { size: "small", onClick: () => handleSignalAction(currentSignal, 'ignore'), children: "\u5FFD\u7565" })] })] }), type: currentSignal.type === 'buy' ? 'success' : 'error', showIcon: false }) })), _jsx(Tabs, { defaultActiveKey: "2", size: "small", items: [basicInfoTab, timeShareTab, kLineTab] }), _jsx(Modal, { title: _jsxs(Space, { children: [_jsx(BellOutlined, {}), _jsx("span", { children: "AI\u4FE1\u53F7\u4E2D\u5FC3" })] }), open: signalModalVisible, onCancel: () => setSignalModalVisible(false), footer: null, width: 700, children: _jsxs("div", { children: [_jsxs(Row, { gutter: [2, 2], style: { marginBottom: '2px' }, children: [_jsx(Col, { xs: 12, children: _jsx(Card, { size: "small", style: { margin: '2px' }, children: _jsx(Statistic, { title: "\u4E70\u5165\u4FE1\u53F7", value: signalHistory.filter(s => s.type === 'buy').length, valueStyle: { color: '#3f8600' }, prefix: _jsx(CheckCircleOutlined, {}) }) }) }), _jsx(Col, { xs: 12, children: _jsx(Card, { size: "small", style: { margin: '2px' }, children: _jsx(Statistic, { title: "\u5356\u51FA\u4FE1\u53F7", value: signalHistory.filter(s => s.type === 'sell').length, valueStyle: { color: '#cf1322' }, prefix: _jsx(CloseCircleOutlined, {}) }) }) })] }), _jsx("div", { style: { maxHeight: '400px', overflowY: 'auto' }, children: signalHistory.length === 0 ? (_jsx("div", { style: { textAlign: 'center', padding: '40px', color: '#999' }, children: "\u6682\u65E0\u4FE1\u53F7\uFF0C\u6B63\u5728\u76D1\u63A7\u4E2D..." })) : (signalHistory.map(signal => (_jsx(Card, { size: "small", style: { margin: '2px' }, children: _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }, children: [_jsxs("div", { style: { flex: 1 }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }, children: [_jsx("span", { style: { fontWeight: 'bold', fontSize: '16px' }, children: signal.stockName }), _jsx("span", { style: { color: '#666' }, children: signal.stockCode }), _jsx(Tag, { color: signal.type === 'buy' ? 'green' : 'red', children: signal.type === 'buy' ? '买入' : '卖出' }), !signal.isRead && _jsx(Tag, { color: "blue", children: "\u65B0" })] }), _jsx("div", { style: { marginBottom: '8px' }, children: _jsxs(Space, { size: "small", children: [_jsxs("span", { children: ["\u4EF7\u683C\uFF1A", _jsx("strong", { children: signal.price?.toFixed(2) })] }), _jsxs("span", { children: ["\u7F6E\u4FE1\u5EA6\uFF1A", _jsxs("strong", { children: [signal.confidence, "%"] })] }), _jsxs("span", { children: ["\u8BC4\u5206\uFF1A", _jsx("strong", { children: signal.score })] })] }) }), _jsx("div", { style: { fontSize: '12px', color: '#666' }, children: signal.reason }), _jsx("div", { style: { fontSize: '11px', color: '#999', marginTop: '4px' }, children: new Date(signal.timestamp).toLocaleTimeString('zh-CN') })] }), !signal.isRead && (_jsxs(Space, { direction: "vertical", children: [_jsx(Button, { type: "primary", size: "small", onClick: () => handleSignalAction(signal, 'execute'), children: "\u6267\u884C" }), _jsx(Button, { size: "small", onClick: () => handleSignalAction(signal, 'ignore'), children: "\u5FFD\u7565" })] }))] }) }, signal.id)))) })] }) })] }));
};
export default StockDetail;
