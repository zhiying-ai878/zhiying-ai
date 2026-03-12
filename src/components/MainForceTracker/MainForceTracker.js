import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, Row, Col, Table, Statistic, Tag, Progress, Button, Space, message, Select, Tooltip, Tabs, DatePicker, List, Badge, Empty, Modal } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, SyncOutlined, BarChartOutlined, LineChartOutlined, ClockCircleOutlined, FilterOutlined, HistoryOutlined, AlertOutlined, DownloadOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { getMainForceTracker } from '../../utils/mainForceTracker';
const { Option } = Select;
const { RangePicker } = DatePicker;
const MainForceTrackerComponent = () => {
    const [selectedStock, setSelectedStock] = useState('000001');
    const [mainForceDataList, setMainForceDataList] = useState([]);
    const [historicalData, setHistoricalData] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [lastUpdateTime, setLastUpdateTime] = useState(null);
    const [autoUpdate, setAutoUpdate] = useState(true);
    const [activeTab, setActiveTab] = useState('realtime');
    const [dateRange, setDateRange] = useState([null, null]);
    const [showSectorData, setShowSectorData] = useState(false);
    const intervalRef = useRef(null);
    const tracker = getMainForceTracker();
    useEffect(() => {
        loadMainForceData();
        loadHistoricalData();
        loadAlerts();
    }, []);
    useEffect(() => {
        if (autoUpdate) {
            intervalRef.current = setInterval(() => {
                updateMainForceData();
            }, 5000);
        }
        else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [autoUpdate]);
    const formatMoney = (amount) => {
        if (amount >= 100000000) {
            return (amount / 100000000).toFixed(2) + '亿';
        }
        else if (amount >= 10000) {
            return (amount / 10000).toFixed(2) + '万';
        }
        return amount.toLocaleString();
    };
    const calculatePercent = (inflow, outflow) => {
        const total = inflow + outflow;
        if (total === 0)
            return 0;
        return Math.min(100, (inflow / total) * 100);
    };
    const generateSampleData = () => {
        const stocks = [
            { code: '000001', name: '平安银行' },
            { code: '600519', name: '贵州茅台' },
            { code: '000858', name: '五粮液' },
            { code: '601318', name: '中国平安' },
            { code: '000333', name: '美的集团' }
        ];
        return stocks.map(stock => {
            const superLargeInflow = 280000000 + (Math.random() - 0.5) * 100000000;
            const superLargeOutflow = 150000000 + (Math.random() - 0.5) * 80000000;
            const largeInflow = 320000000 + (Math.random() - 0.5) * 120000000;
            const largeOutflow = 280000000 + (Math.random() - 0.5) * 100000000;
            const mediumInflow = 180000000 + (Math.random() - 0.5) * 80000000;
            const mediumOutflow = 200000000 + (Math.random() - 0.5) * 70000000;
            const smallInflow = 120000000 + (Math.random() - 0.5) * 60000000;
            const smallOutflow = 150000000 + (Math.random() - 0.5) * 50000000;
            const superLargeNet = superLargeInflow - superLargeOutflow;
            const largeNet = largeInflow - largeOutflow;
            const mediumNet = mediumInflow - mediumOutflow;
            const smallNet = smallInflow - smallOutflow;
            const totalNet = superLargeNet + largeNet + mediumNet + smallNet;
            let trend = 'neutral';
            if (totalNet > 50000000) {
                trend = 'up';
            }
            else if (totalNet < -50000000) {
                trend = 'down';
            }
            return {
                code: stock.code,
                name: stock.name,
                superLarge: { inflow: superLargeInflow, outflow: superLargeOutflow, net: superLargeNet },
                large: { inflow: largeInflow, outflow: largeOutflow, net: largeNet },
                medium: { inflow: mediumInflow, outflow: mediumOutflow, net: mediumNet },
                small: { inflow: smallInflow, outflow: smallOutflow, net: smallNet },
                totalNet,
                trend,
                lastUpdate: new Date().toLocaleTimeString('zh-CN'),
                timestamp: Date.now()
            };
        });
    };
    const generateHistoricalData = () => {
        const data = [];
        const now = new Date();
        for (let i = 30; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            data.push({
                date: date.toLocaleDateString('zh-CN'),
                superLargeNet: (Math.random() - 0.5) * 200000000,
                largeNet: (Math.random() - 0.5) * 150000000,
                mediumNet: (Math.random() - 0.5) * 100000000,
                smallNet: (Math.random() - 0.5) * 80000000,
                totalNet: (Math.random() - 0.5) * 530000000
            });
        }
        return data;
    };
    const loadMainForceData = () => {
        setLoading(true);
        setTimeout(() => {
            const sampleData = generateSampleData();
            setMainForceDataList(sampleData);
            setLastUpdateTime(new Date());
            setLoading(false);
            message.success('数据加载成功');
        }, 500);
    };
    const loadHistoricalData = () => {
        const data = generateHistoricalData();
        setHistoricalData(data);
    };
    const loadAlerts = () => {
        setAlerts(tracker.getAlertHistory().slice(0, 20));
    };
    const updateMainForceData = useCallback(() => {
        setMainForceDataList(prev => prev.map(item => {
            const superLargeInflow = item.superLarge.inflow + (Math.random() - 0.3) * 20000000;
            const superLargeOutflow = item.superLarge.outflow + (Math.random() - 0.3) * 18000000;
            const largeInflow = item.large.inflow + (Math.random() - 0.3) * 25000000;
            const largeOutflow = item.large.outflow + (Math.random() - 0.3) * 22000000;
            const mediumInflow = item.medium.inflow + (Math.random() - 0.3) * 15000000;
            const mediumOutflow = item.medium.outflow + (Math.random() - 0.3) * 12000000;
            const smallInflow = item.small.inflow + (Math.random() - 0.3) * 10000000;
            const smallOutflow = item.small.outflow + (Math.random() - 0.3) * 8000000;
            const superLargeNet = superLargeInflow - superLargeOutflow;
            const largeNet = largeInflow - largeOutflow;
            const mediumNet = mediumInflow - mediumOutflow;
            const smallNet = smallInflow - smallOutflow;
            const totalNet = superLargeNet + largeNet + mediumNet + smallNet;
            let trend = 'neutral';
            if (totalNet > 50000000) {
                trend = 'up';
            }
            else if (totalNet < -50000000) {
                trend = 'down';
            }
            return {
                ...item,
                superLarge: { inflow: superLargeInflow, outflow: superLargeOutflow, net: superLargeNet },
                large: { inflow: largeInflow, outflow: largeOutflow, net: largeNet },
                medium: { inflow: mediumInflow, outflow: mediumOutflow, net: mediumNet },
                small: { inflow: smallInflow, outflow: smallOutflow, net: smallNet },
                totalNet,
                trend,
                lastUpdate: new Date().toLocaleTimeString('zh-CN'),
                timestamp: Date.now()
            };
        }));
        setLastUpdateTime(new Date());
    }, []);
    const handleRefresh = () => {
        loadMainForceData();
    };
    const handleToggleAutoUpdate = () => {
        setAutoUpdate(!autoUpdate);
        message.success(autoUpdate ? '自动更新已关闭' : '自动更新已开启');
    };
    const handleFilter = () => {
        message.info('筛选功能开发中...');
    };
    const handleViewDetail = (record) => {
        setSelectedStock(record.code);
        setActiveTab('chart');
    };
    const getCurrentStockData = () => {
        return mainForceDataList.find(item => item.code === selectedStock) || mainForceDataList[0];
    };
    const getTrendChartOption = () => {
        const dates = historicalData.map(d => d.date);
        return {
            title: { text: '主力资金流向趋势', left: 'center' },
            tooltip: { trigger: 'axis' },
            legend: { data: ['超大单', '大单', '中单', '小单', '合计'], bottom: 10 },
            grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
            xAxis: { type: 'category', boundaryGap: false, data: dates },
            yAxis: { type: 'value' },
            series: [
                {
                    name: '超大单',
                    type: 'line',
                    smooth: true,
                    data: historicalData.map(d => d.superLargeNet / 100000000),
                    itemStyle: { color: '#ff4d4f' }
                },
                {
                    name: '大单',
                    type: 'line',
                    smooth: true,
                    data: historicalData.map(d => d.largeNet / 100000000),
                    itemStyle: { color: '#fa8c16' }
                },
                {
                    name: '中单',
                    type: 'line',
                    smooth: true,
                    data: historicalData.map(d => d.mediumNet / 100000000),
                    itemStyle: { color: '#1890ff' }
                },
                {
                    name: '小单',
                    type: 'line',
                    smooth: true,
                    data: historicalData.map(d => d.smallNet / 100000000),
                    itemStyle: { color: '#52c41a' }
                },
                {
                    name: '合计',
                    type: 'line',
                    smooth: true,
                    data: historicalData.map(d => d.totalNet / 100000000),
                    itemStyle: { color: '#722ed1' },
                    lineStyle: { width: 3 }
                }
            ]
        };
    };
    const getCompositionChartOption = () => {
        const currentData = getCurrentStockData();
        if (!currentData)
            return {};
        return {
            title: { text: '资金构成分析', left: 'center' },
            tooltip: { trigger: 'item' },
            legend: { orient: 'vertical', left: 'left', top: 'middle' },
            series: [
                {
                    name: '资金构成',
                    type: 'pie',
                    radius: ['40%', '70%'],
                    avoidLabelOverlap: false,
                    itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
                    label: { show: true, formatter: '{b}: {c} ({d}%)' },
                    emphasis: { label: { show: true, fontSize: 16, fontWeight: 'bold' } },
                    labelLine: { show: true },
                    data: [
                        { value: Math.abs(currentData.superLarge.net), name: '超大单', itemStyle: { color: '#ff4d4f' } },
                        { value: Math.abs(currentData.large.net), name: '大单', itemStyle: { color: '#fa8c16' } },
                        { value: Math.abs(currentData.medium.net), name: '中单', itemStyle: { color: '#1890ff' } },
                        { value: Math.abs(currentData.small.net), name: '小单', itemStyle: { color: '#52c41a' } }
                    ]
                }
            ]
        };
    };
    const columns = [
        {
            title: '股票代码',
            dataIndex: 'code',
            key: 'code',
        },
        {
            title: '股票名称',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (_jsx("a", { onClick: () => handleViewDetail(record), children: text }))
        },
        {
            title: '超大单',
            key: 'superLarge',
            render: (_, record) => (_jsxs("span", { style: { color: record.superLarge.net >= 0 ? '#ff4d4f' : '#52c41a' }, children: [record.superLarge.net >= 0 ? '+' : '', formatMoney(record.superLarge.net)] })),
        },
        {
            title: '大单',
            key: 'large',
            render: (_, record) => (_jsxs("span", { style: { color: record.large.net >= 0 ? '#ff4d4f' : '#52c41a' }, children: [record.large.net >= 0 ? '+' : '', formatMoney(record.large.net)] })),
        },
        {
            title: '中单',
            key: 'medium',
            render: (_, record) => (_jsxs("span", { style: { color: record.medium.net >= 0 ? '#ff4d4f' : '#52c41a' }, children: [record.medium.net >= 0 ? '+' : '', formatMoney(record.medium.net)] })),
        },
        {
            title: '小单',
            key: 'small',
            render: (_, record) => (_jsxs("span", { style: { color: record.small.net >= 0 ? '#ff4d4f' : '#52c41a' }, children: [record.small.net >= 0 ? '+' : '', formatMoney(record.small.net)] })),
        },
        {
            title: '净流入',
            key: 'totalNet',
            render: (_, record) => (_jsxs("span", { style: { color: record.totalNet >= 0 ? '#ff4d4f' : '#52c41a', fontWeight: 'bold' }, children: [record.totalNet >= 0 ? '+' : '', formatMoney(record.totalNet)] })),
        },
        {
            title: '趋势',
            key: 'trend',
            render: (_, record) => {
                const trendMap = {
                    up: { icon: _jsx(ArrowUpOutlined, {}), color: 'red', text: '上涨' },
                    down: { icon: _jsx(ArrowDownOutlined, {}), color: 'green', text: '下跌' },
                    neutral: { icon: _jsx(BarChartOutlined, {}), color: 'blue', text: '震荡' }
                };
                const trend = trendMap[record.trend];
                return (_jsxs(Tag, { color: trend.color, children: [trend.icon, " ", trend.text] }));
            },
        },
        {
            title: '更新时间',
            dataIndex: 'lastUpdate',
            key: 'lastUpdate',
        },
    ];
    const formatLastUpdate = () => {
        if (!lastUpdateTime)
            return '尚未更新';
        return lastUpdateTime.toLocaleTimeString('zh-CN');
    };
    const currentData = getCurrentStockData();
    const unreadAlertCount = alerts.filter(a => !a.read).length;
    const renderAlertItem = (alert) => {
        const urgencyColor = {
            emergency: 'red',
            high: 'orange',
            medium: 'gold',
            low: 'blue'
        }[alert.urgency];
        const urgencyText = {
            emergency: '紧急',
            high: '高',
            medium: '中',
            low: '低'
        }[alert.urgency];
        return (_jsx(List.Item, { className: `signal-item ${alert.read ? 'read' : 'unread'}`, actions: [
                !alert.read && (_jsx(Button, { type: "text", size: "small", onClick: () => {
                        tracker.markAlertAsRead(alert.id);
                        loadAlerts();
                    }, children: "\u6807\u4E3A\u5DF2\u8BFB" }))
            ].filter(Boolean), children: _jsx(List.Item.Meta, { avatar: _jsx(AlertOutlined, { style: { color: urgencyColor } }), title: _jsxs(Space, { children: [_jsx("span", { children: alert.stockName }), _jsx(Tag, { color: urgencyColor, children: urgencyText })] }), description: _jsxs("div", { children: [_jsx("div", { children: alert.message }), _jsx("div", { style: { fontSize: '12px', color: '#999' }, children: new Date(alert.timestamp).toLocaleString('zh-CN') })] }) }) }, alert.id));
    };
    return (_jsxs("div", { className: "main-force-tracker", style: { padding: '0px' }, children: [_jsxs("div", { className: "dashboard-header", style: { marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '16px' }, children: [_jsx("h2", { style: { margin: 0 }, children: "\u4E3B\u529B\u8D44\u91D1\u8FFD\u8E2A\u7CFB\u7EDF" }), _jsxs(Space, { children: [_jsx(Tooltip, { title: `自动更新: ${autoUpdate ? '开启' : '关闭'}`, children: _jsxs(Space, { size: "small", children: [_jsx(ClockCircleOutlined, { style: { color: autoUpdate ? '#52c41a' : '#8c8c8c' } }), _jsxs("span", { style: { fontSize: '14px' }, children: ["\u81EA\u52A8\u66F4\u65B0: ", autoUpdate ? '开启' : '关闭'] })] }) }), _jsx(Tooltip, { title: "\u6700\u540E\u66F4\u65B0\u65F6\u95F4", children: _jsxs(Space, { size: "small", children: [_jsx(SyncOutlined, { spin: autoUpdate }), _jsxs("span", { style: { fontSize: '14px', color: '#666' }, children: ["\u6700\u540E\u66F4\u65B0: ", formatLastUpdate()] })] }) })] })] }), _jsxs(Space, { children: [_jsx(Button, { type: "default", icon: _jsx(FilterOutlined, {}), onClick: handleFilter, size: "small", children: "\u7B5B\u9009" }), _jsx(Button, { type: "default", icon: _jsx(HistoryOutlined, {}), onClick: () => setShowSectorData(!showSectorData), size: "small", children: showSectorData ? '隐藏板块' : '板块分析' }), _jsx(Button, { type: autoUpdate ? 'default' : 'primary', onClick: handleToggleAutoUpdate, size: "small", children: autoUpdate ? '暂停更新' : '开启更新' }), _jsx(Button, { type: "primary", icon: _jsx(SyncOutlined, {}), onClick: handleRefresh, size: "small", loading: loading, children: "\u7ACB\u5373\u66F4\u65B0" })] })] }), _jsx(Tabs, { activeKey: activeTab, onChange: setActiveTab, size: "small", items: [
                    {
                        key: 'realtime',
                        label: '实时追踪',
                        children: (_jsxs(_Fragment, { children: [currentData && (_jsxs(_Fragment, { children: [_jsxs(Row, { gutter: [2, 2], style: { marginBottom: '2px' }, children: [_jsx(Col, { xs: 24, sm: 12, md: 12, lg: 6, xl: 6, children: _jsxs(Card, { size: "small", bordered: false, style: { height: '100%', margin: '2px' }, children: [_jsx(Statistic, { title: currentData.name, value: currentData.totalNet, precision: 0, valueStyle: { color: currentData.totalNet >= 0 ? '#ff4d4f' : '#52c41a', fontSize: '24px' }, formatter: (value) => {
                                                                    const num = value;
                                                                    return `${num >= 0 ? '+' : ''}${formatMoney(num)}`;
                                                                } }), _jsx("div", { style: { marginTop: '8px', fontSize: '12px', color: '#666' }, children: "\u51C0\u6D41\u5165" })] }) }), _jsx(Col, { xs: 24, sm: 12, md: 12, lg: 6, xl: 6, children: _jsx(Card, { size: "small", bordered: false, style: { height: '100%', margin: '2px' }, children: _jsxs("div", { style: { textAlign: 'center' }, children: [_jsx("div", { style: { color: '#722ed1', fontSize: '16px', fontWeight: 'bold' }, children: "\u8D85\u5927\u5355" }), _jsx("div", { style: { marginTop: '8px' }, children: _jsxs(Tag, { color: "red", children: ["\u6D41\u5165: ", formatMoney(currentData.superLarge.inflow)] }) }), _jsx("div", { style: { marginTop: '4px' }, children: _jsxs(Tag, { color: "green", children: ["\u6D41\u51FA: ", formatMoney(currentData.superLarge.outflow)] }) }), _jsxs("div", { style: { marginTop: '4px', color: currentData.superLarge.net >= 0 ? '#ff4d4f' : '#52c41a', fontWeight: 'bold' }, children: ["\u51C0", currentData.superLarge.net >= 0 ? '流入' : '流出', ": ", formatMoney(Math.abs(currentData.superLarge.net))] })] }) }) }), _jsx(Col, { xs: 24, sm: 12, md: 12, lg: 6, xl: 6, children: _jsx(Card, { size: "small", bordered: false, style: { height: '100%', margin: '2px' }, children: _jsxs("div", { style: { textAlign: 'center' }, children: [_jsx("div", { style: { color: '#1890ff', fontSize: '16px', fontWeight: 'bold' }, children: "\u5927\u5355" }), _jsx("div", { style: { marginTop: '8px' }, children: _jsxs(Tag, { color: "red", children: ["\u6D41\u5165: ", formatMoney(currentData.large.inflow)] }) }), _jsx("div", { style: { marginTop: '4px' }, children: _jsxs(Tag, { color: "green", children: ["\u6D41\u51FA: ", formatMoney(currentData.large.outflow)] }) }), _jsxs("div", { style: { marginTop: '4px', color: currentData.large.net >= 0 ? '#ff4d4f' : '#52c41a', fontWeight: 'bold' }, children: ["\u51C0", currentData.large.net >= 0 ? '流入' : '流出', ": ", formatMoney(Math.abs(currentData.large.net))] })] }) }) }), _jsx(Col, { xs: 24, sm: 12, md: 12, lg: 6, xl: 6, children: _jsx(Card, { size: "small", bordered: false, style: { height: '100%', margin: '2px' }, children: _jsxs("div", { style: { textAlign: 'center' }, children: [_jsx("div", { style: { color: '#faad14', fontSize: '16px', fontWeight: 'bold' }, children: "\u4E2D\u5355" }), _jsx("div", { style: { marginTop: '8px' }, children: _jsxs(Tag, { color: "red", children: ["\u6D41\u5165: ", formatMoney(currentData.medium.inflow)] }) }), _jsx("div", { style: { marginTop: '4px' }, children: _jsxs(Tag, { color: "green", children: ["\u6D41\u51FA: ", formatMoney(currentData.medium.outflow)] }) }), _jsxs("div", { style: { marginTop: '4px', color: currentData.medium.net >= 0 ? '#ff4d4f' : '#52c41a', fontWeight: 'bold' }, children: ["\u51C0", currentData.medium.net >= 0 ? '流入' : '流出', ": ", formatMoney(Math.abs(currentData.medium.net))] })] }) }) })] }), _jsxs(Row, { gutter: [2, 2], style: { marginBottom: '2px' }, children: [_jsx(Col, { xs: 24, sm: 24, md: 12, lg: 12, xl: 12, children: _jsxs(Card, { size: "small", bordered: false, title: _jsxs(Space, { children: [_jsx(LineChartOutlined, {}), _jsx("span", { children: "\u8D44\u91D1\u6D41\u5165\u8BE6\u60C5" })] }), style: { margin: '2px' }, children: [_jsxs("div", { style: { marginBottom: '2px' }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }, children: [_jsx("span", { children: "\u8D85\u5927\u5355\u6D41\u5165" }), _jsx("span", { style: { color: '#ff4d4f' }, children: formatMoney(currentData.superLarge.inflow) })] }), _jsx(Progress, { percent: calculatePercent(currentData.superLarge.inflow, currentData.superLarge.outflow), strokeColor: "#ff4d4f", size: "small" })] }), _jsxs("div", { style: { marginBottom: '2px' }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }, children: [_jsx("span", { children: "\u8D85\u5927\u5355\u6D41\u51FA" }), _jsx("span", { style: { color: '#52c41a' }, children: formatMoney(currentData.superLarge.outflow) })] }), _jsx(Progress, { percent: calculatePercent(currentData.superLarge.outflow, currentData.superLarge.inflow), strokeColor: "#52c41a", size: "small" })] }), _jsxs("div", { style: { marginBottom: '2px' }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }, children: [_jsx("span", { children: "\u5927\u5355\u6D41\u5165" }), _jsx("span", { style: { color: '#ff4d4f' }, children: formatMoney(currentData.large.inflow) })] }), _jsx(Progress, { percent: calculatePercent(currentData.large.inflow, currentData.large.outflow), strokeColor: "#ff4d4f", size: "small" })] }), _jsxs("div", { style: { marginBottom: '2px' }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }, children: [_jsx("span", { children: "\u5927\u5355\u6D41\u51FA" }), _jsx("span", { style: { color: '#52c41a' }, children: formatMoney(currentData.large.outflow) })] }), _jsx(Progress, { percent: calculatePercent(currentData.large.outflow, currentData.large.inflow), strokeColor: "#52c41a", size: "small" })] }), _jsxs("div", { style: { marginBottom: '2px' }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }, children: [_jsx("span", { children: "\u4E2D\u5355\u6D41\u5165" }), _jsx("span", { style: { color: '#ff4d4f' }, children: formatMoney(currentData.medium.inflow) })] }), _jsx(Progress, { percent: calculatePercent(currentData.medium.inflow, currentData.medium.outflow), strokeColor: "#ff4d4f", size: "small" })] }), _jsxs("div", { children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }, children: [_jsx("span", { children: "\u4E2D\u5355\u6D41\u51FA" }), _jsx("span", { style: { color: '#52c41a' }, children: formatMoney(currentData.medium.outflow) })] }), _jsx(Progress, { percent: calculatePercent(currentData.medium.outflow, currentData.medium.inflow), strokeColor: "#52c41a", size: "small" })] })] }) }), _jsx(Col, { xs: 24, sm: 24, md: 12, lg: 12, xl: 12, children: _jsxs(Card, { size: "small", bordered: false, title: "\u8D44\u91D1\u5206\u6790", style: { margin: '2px' }, children: [_jsx("div", { style: { textAlign: 'center', padding: '20px' }, children: currentData.totalNet >= 0 ? (_jsxs("div", { children: [_jsx(ArrowUpOutlined, { style: { fontSize: '48px', color: '#ff4d4f' } }), _jsx("div", { style: { fontSize: '20px', fontWeight: 'bold', marginTop: '12px' }, children: "\u4E3B\u529B\u8D44\u91D1\u6D41\u5165" }), _jsx(Progress, { percent: 75, status: "active", style: { marginTop: '16px' } }), _jsx("div", { style: { color: '#666', marginTop: '8px' }, children: "\u5EFA\u8BAE\u5173\u6CE8" })] })) : (_jsxs("div", { children: [_jsx(ArrowDownOutlined, { style: { fontSize: '48px', color: '#52c41a' } }), _jsx("div", { style: { fontSize: '20px', fontWeight: 'bold', marginTop: '12px' }, children: "\u4E3B\u529B\u8D44\u91D1\u6D41\u51FA" }), _jsx(Progress, { percent: 35, status: "exception", style: { marginTop: '16px' } }), _jsx("div", { style: { color: '#666', marginTop: '8px' }, children: "\u5EFA\u8BAE\u89C2\u671B" })] })) }), _jsxs("div", { style: { fontSize: '12px', color: '#999', textAlign: 'center', marginTop: '12px' }, children: ["\u6700\u540E\u66F4\u65B0: ", currentData.lastUpdate] })] }) })] }), _jsx(Row, { gutter: [2, 2], style: { marginBottom: '2px' }, children: _jsx(Col, { xs: 24, sm: 24, md: 24, lg: 24, xl: 24, children: _jsx(Card, { size: "small", bordered: false, style: { margin: '2px' }, children: _jsxs("div", { style: { textAlign: 'center' }, children: [_jsx("div", { style: { color: '#52c41a', fontSize: '16px', fontWeight: 'bold' }, children: "\u5C0F\u5355" }), _jsx("div", { style: { marginTop: '8px' }, children: _jsxs(Tag, { color: "red", children: ["\u6D41\u5165: ", formatMoney(currentData.small.inflow)] }) }), _jsx("div", { style: { marginTop: '4px' }, children: _jsxs(Tag, { color: "green", children: ["\u6D41\u51FA: ", formatMoney(currentData.small.outflow)] }) }), _jsxs("div", { style: { marginTop: '4px', color: currentData.small.net >= 0 ? '#ff4d4f' : '#52c41a', fontWeight: 'bold' }, children: ["\u51C0", currentData.small.net >= 0 ? '流入' : '流出', ": ", formatMoney(Math.abs(currentData.small.net))] })] }) }) }) })] })), _jsx(Row, { gutter: [2, 2], children: _jsx(Col, { xs: 24, sm: 24, md: 24, lg: 24, xl: 24, children: _jsx(Card, { size: "small", bordered: false, title: _jsxs(Space, { children: [_jsx(BarChartOutlined, {}), _jsx("span", { children: "\u4E3B\u529B\u8D44\u91D1\u6D41\u5411\u80A1\u7968\u5217\u8868" })] }), extra: _jsx(Space, { children: _jsx(Select, { value: selectedStock, onChange: setSelectedStock, style: { width: 200 }, size: "small", children: mainForceDataList.map(item => (_jsxs(Option, { value: item.code, children: [item.name, " (", item.code, ")"] }, item.code))) }) }), style: { margin: '2px' }, children: _jsx(Table, { columns: columns, dataSource: mainForceDataList, pagination: false, rowKey: "code", size: "small", loading: loading }) }) }) })] }))
                    },
                    {
                        key: 'chart',
                        label: '图表分析',
                        children: (_jsxs(Row, { gutter: [2, 2], children: [_jsx(Col, { xs: 24, lg: 12, children: _jsx(Card, { size: "small", bordered: false, title: "\u8D44\u91D1\u6D41\u5411\u8D8B\u52BF", style: { margin: '2px' }, children: _jsx(ReactECharts, { option: getTrendChartOption(), style: { height: '400px' } }) }) }), _jsx(Col, { xs: 24, lg: 12, children: _jsx(Card, { size: "small", bordered: false, title: "\u8D44\u91D1\u6784\u6210\u5206\u6790", style: { margin: '2px' }, children: _jsx(ReactECharts, { option: getCompositionChartOption(), style: { height: '400px' } }) }) })] }))
                    },
                    {
                        key: 'history',
                        label: '历史数据',
                        children: (_jsxs(Card, { size: "small", bordered: false, style: { margin: '2px' }, children: [_jsx("div", { style: { marginBottom: 2 }, children: _jsxs(Space, { children: [_jsx(RangePicker, { value: dateRange, onChange: (dates) => setDateRange(dates), size: "small" }), _jsx(Button, { size: "small", type: "primary", children: "\u67E5\u8BE2" }), _jsx(Button, { size: "small", icon: _jsx(DownloadOutlined, {}), children: "\u5BFC\u51FA" })] }) }), _jsx(Empty, { description: "\u5386\u53F2\u6570\u636E\u529F\u80FD\u5F00\u53D1\u4E2D..." })] }))
                    },
                    {
                        key: 'alerts',
                        label: (_jsx(Badge, { count: unreadAlertCount, showZero: false, children: "\u8B66\u62A5" })),
                        children: (_jsx(Card, { size: "small", bordered: false, title: "\u4E3B\u529B\u8D44\u91D1\u5F02\u52A8\u8B66\u62A5", style: { margin: '2px' }, children: alerts.length > 0 ? (_jsx(List, { dataSource: alerts, renderItem: renderAlertItem })) : (_jsx(Empty, { description: "\u6682\u65E0\u5F02\u52A8\u8B66\u62A5" })) }))
                    }
                ] }), showSectorData && (_jsx(Modal, { title: "\u677F\u5757\u8D44\u91D1\u5206\u6790", open: showSectorData, onCancel: () => setShowSectorData(false), footer: null, width: 800, children: _jsx(Empty, { description: "\u677F\u5757\u8D44\u91D1\u5206\u6790\u529F\u80FD\u5F00\u53D1\u4E2D..." }) }))] }));
};
export default MainForceTrackerComponent;
