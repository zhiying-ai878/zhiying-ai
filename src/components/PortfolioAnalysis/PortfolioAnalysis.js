import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Card, Table, Statistic, Row, Col, Progress, Tag, Button, Space, message, Tabs, Alert, Modal, Divider } from 'antd';
import { WalletOutlined, RiseOutlined, BarChartOutlined, BulbOutlined, ThunderboltOutlined, SafetyOutlined, ExperimentOutlined, LineChartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
const PortfolioAnalysis = () => {
    const navigate = useNavigate();
    const [equityChartOption, setEquityChartOption] = useState(null);
    const [portfolioData] = useState({
        totalValue: 1285000,
        todayProfit: 28500,
        totalProfit: 125000,
        profitPercent: 10.8
    });
    const [holdings] = useState([
        { key: '1', code: '600519', name: '贵州茅台', quantity: 100, price: 1892.00, costPrice: 1850.00, marketValue: 189200, profit: 4200, profitPercent: 2.27 },
        { key: '2', code: '000858', name: '五粮液', quantity: 200, price: 168.50, costPrice: 165.20, marketValue: 33700, profit: 660, profitPercent: 2.00 },
        { key: '3', code: '002594', name: '比亚迪', quantity: 500, price: 256.80, costPrice: 245.00, marketValue: 128400, profit: 5900, profitPercent: 4.80 },
        { key: '4', code: '600036', name: '招商银行', quantity: 1000, price: 35.20, costPrice: 32.50, marketValue: 35200, profit: 2700, profitPercent: 8.31 },
        { key: '5', code: '000063', name: '中兴通讯', quantity: 800, price: 28.50, costPrice: 30.00, marketValue: 22800, profit: -1200, profitPercent: -4.00 }
    ]);
    const [showSuggestionModal, setShowSuggestionModal] = useState(false);
    useEffect(() => {
        generateEquityChart();
    }, []);
    const generateEquityChart = () => {
        const days = 90;
        const dates = [];
        const equityValues = [];
        const benchmarkValues = [];
        const initialEquity = 1160000;
        const initialBenchmark = 1000000;
        let currentEquity = initialEquity;
        let currentBenchmark = initialBenchmark;
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            dates.push(date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }));
            const equityChange = (Math.random() - 0.45) * 0.025;
            const benchmarkChange = (Math.random() - 0.48) * 0.02;
            currentEquity *= (1 + equityChange);
            currentBenchmark *= (1 + benchmarkChange);
            equityValues.push(currentEquity);
            benchmarkValues.push(currentBenchmark);
        }
        const option = {
            title: {
                text: '资产净值走势',
                left: 'center',
                textStyle: { fontSize: 14 }
            },
            tooltip: {
                trigger: 'axis',
                formatter: (params) => {
                    let result = params[0].axisValue + '<br/>';
                    params.forEach((param) => {
                        result += `${param.seriesName}: ¥${param.data.toLocaleString()}<br/>`;
                    });
                    return result;
                }
            },
            legend: {
                data: ['组合净值', '基准指数'],
                bottom: 0
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '15%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: dates,
                axisLabel: { interval: 15 }
            },
            yAxis: {
                type: 'value',
                scale: true,
                axisLabel: {
                    formatter: (value) => '¥' + (value / 10000).toFixed(0) + '万'
                }
            },
            series: [
                {
                    name: '组合净值',
                    type: 'line',
                    smooth: true,
                    symbol: 'none',
                    sampling: 'lttb',
                    lineStyle: { color: '#1890ff', width: 2 },
                    areaStyle: {
                        color: {
                            type: 'linear',
                            x: 0, y: 0, x2: 0, y2: 1,
                            colorStops: [
                                { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
                                { offset: 1, color: 'rgba(24, 144, 255, 0.05)' }
                            ]
                        }
                    },
                    data: equityValues
                },
                {
                    name: '基准指数',
                    type: 'line',
                    smooth: true,
                    symbol: 'none',
                    sampling: 'lttb',
                    lineStyle: { color: '#faad14', width: 2, type: 'dashed' },
                    data: benchmarkValues
                }
            ]
        };
        setEquityChartOption(option);
    };
    const columns = [
        { title: '股票代码', dataIndex: 'code', key: 'code', width: 100 },
        { title: '股票名称', dataIndex: 'name', key: 'name', width: 120 },
        { title: '持有数量', dataIndex: 'quantity', key: 'quantity', width: 100 },
        { title: '当前价格', dataIndex: 'price', key: 'price', width: 100, render: (price) => `¥${price.toFixed(2)}` },
        { title: '成本价格', dataIndex: 'costPrice', key: 'costPrice', width: 100, render: (price) => `¥${price.toFixed(2)}` },
        { title: '市值', dataIndex: 'marketValue', key: 'marketValue', width: 120, render: (value) => `¥${value.toLocaleString()}` },
        {
            title: '盈亏',
            dataIndex: 'profit',
            key: 'profit',
            width: 120,
            render: (profit) => (_jsxs("span", { style: { color: profit >= 0 ? '#ff4d4f' : '#52c41a' }, children: [profit >= 0 ? '+' : '', "\u00A5", profit.toLocaleString()] }))
        },
        {
            title: '盈亏比例',
            dataIndex: 'profitPercent',
            key: 'profitPercent',
            width: 120,
            render: (percent) => (_jsxs("span", { style: { color: percent >= 0 ? '#ff4d4f' : '#52c41a' }, children: [percent >= 0 ? '+' : '', percent.toFixed(2), "%"] }))
        }
    ];
    return (_jsxs("div", { style: { padding: '0px' }, children: [_jsxs("div", { style: { marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsx("h2", { style: { margin: 0 }, children: _jsxs(Space, { children: [_jsx(WalletOutlined, {}), _jsx("span", { children: "\u6295\u8D44\u7EC4\u5408\u5206\u6790" })] }) }), _jsxs(Space, { children: [_jsx(Button, { type: "primary", icon: _jsx(BulbOutlined, {}), onClick: () => setShowSuggestionModal(true), size: "small", children: "AI\u667A\u80FD\u5EFA\u8BAE" }), _jsx(Button, { onClick: () => message.info('添加持仓功能开发中'), size: "small", children: "\u6DFB\u52A0\u6301\u4ED3" }), _jsx(Button, { onClick: () => message.info('导出报表功能开发中'), size: "small", children: "\u5BFC\u51FA\u62A5\u8868" })] })] }), _jsxs(Row, { gutter: [2, 2], style: { marginBottom: '2px' }, children: [_jsx(Col, { xs: 24, sm: 12, md: 6, children: _jsx(Card, { size: "small", bordered: false, style: { margin: '2px' }, children: _jsx(Statistic, { title: "\u603B\u8D44\u4EA7", value: portfolioData.totalValue, precision: 0, valueStyle: { fontSize: '24px' }, prefix: _jsx(WalletOutlined, {}) }) }) }), _jsx(Col, { xs: 24, sm: 12, md: 6, children: _jsx(Card, { size: "small", bordered: false, style: { margin: '2px' }, children: _jsx(Statistic, { title: "\u4ECA\u65E5\u6536\u76CA", value: portfolioData.todayProfit, precision: 0, valueStyle: { color: '#ff4d4f', fontSize: '24px' }, prefix: _jsx(RiseOutlined, {}) }) }) }), _jsx(Col, { xs: 24, sm: 12, md: 6, children: _jsx(Card, { size: "small", bordered: false, style: { margin: '2px' }, children: _jsx(Statistic, { title: "\u603B\u6536\u76CA", value: portfolioData.totalProfit, precision: 0, valueStyle: { color: '#ff4d4f', fontSize: '24px' }, prefix: _jsx(RiseOutlined, {}) }) }) }), _jsx(Col, { xs: 24, sm: 12, md: 6, children: _jsx(Card, { size: "small", bordered: false, style: { margin: '2px' }, children: _jsx(Statistic, { title: "\u6536\u76CA\u7387", value: portfolioData.profitPercent, precision: 1, suffix: "%", valueStyle: { color: '#ff4d4f', fontSize: '24px' }, prefix: _jsx(BarChartOutlined, {}) }) }) })] }), _jsxs(Tabs, { defaultActiveKey: "holdings", size: "small", style: { marginBottom: '10px' }, children: [_jsx(Tabs.TabPane, { tab: _jsxs("span", { children: [_jsx(ThunderboltOutlined, {}), "\u6301\u4ED3\u660E\u7EC6"] }), children: _jsx(Card, { size: "small", bordered: false, title: "\u6301\u4ED3\u660E\u7EC6", style: { margin: '2px' }, children: _jsx(Table, { columns: columns, dataSource: holdings, pagination: { pageSize: 10, size: 'small' }, rowKey: "key", size: "small" }) }) }, "holdings"), _jsx(Tabs.TabPane, { tab: _jsxs("span", { children: [_jsx(LineChartOutlined, {}), "\u6536\u76CA\u8D70\u52BF"] }), children: equityChartOption && (_jsx(Card, { size: "small", bordered: false, title: "\u8D44\u4EA7\u51C0\u503C\u8D70\u52BF", style: { margin: '2px' }, children: _jsx(ReactECharts, { option: equityChartOption, style: { height: '400px' } }) })) }, "equity"), _jsx(Tabs.TabPane, { tab: _jsxs("span", { children: [_jsx(SafetyOutlined, {}), "\u98CE\u9669\u5206\u6790"] }), children: _jsxs(Row, { gutter: [2, 2], children: [_jsx(Col, { xs: 24, lg: 12, children: _jsx(Card, { size: "small", bordered: false, title: "\u8D44\u4EA7\u914D\u7F6E", style: { margin: '2px' }, children: _jsxs(Space, { direction: "vertical", style: { width: '100%' }, size: "small", children: [_jsxs("div", { children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }, children: [_jsx("span", { children: "\u8D35\u5DDE\u8305\u53F0" }), _jsx("span", { children: "59.6%" })] }), _jsx(Progress, { percent: 59.6, status: "active", strokeColor: "#1890ff" })] }), _jsxs("div", { children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }, children: [_jsx("span", { children: "\u6BD4\u4E9A\u8FEA" }), _jsx("span", { children: "20.4%" })] }), _jsx(Progress, { percent: 20.4, status: "active", strokeColor: "#52c41a" })] }), _jsxs("div", { children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }, children: [_jsx("span", { children: "\u62DB\u5546\u94F6\u884C" }), _jsx("span", { children: "10.6%" })] }), _jsx(Progress, { percent: 10.6, status: "active", strokeColor: "#faad14" })] }), _jsxs("div", { children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }, children: [_jsx("span", { children: "\u5176\u4ED6" }), _jsx("span", { children: "9.4%" })] }), _jsx(Progress, { percent: 9.4, status: "active", strokeColor: "#722ed1" })] })] }) }) }), _jsx(Col, { xs: 24, lg: 12, children: _jsx(Card, { size: "small", bordered: false, title: "\u6536\u76CA\u5206\u6790", style: { margin: '2px' }, children: _jsxs(Space, { direction: "vertical", style: { width: '100%' }, size: "small", children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsx("span", { children: "\u76C8\u5229\u80A1\u7968" }), _jsx(Tag, { color: "green", children: "4\u53EA" })] }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsx("span", { children: "\u4E8F\u635F\u80A1\u7968" }), _jsx(Tag, { color: "red", children: "1\u53EA" })] }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsx("span", { children: "\u6700\u5927\u76C8\u5229" }), _jsx("span", { style: { color: '#ff4d4f' }, children: "+\u00A55,900" })] }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsx("span", { children: "\u6700\u5927\u4E8F\u635F" }), _jsx("span", { style: { color: '#52c41a' }, children: "-\u00A51,200" })] }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsx("span", { children: "\u76C8\u4E8F\u6BD4" }), _jsx(Tag, { color: "blue", children: "4.9:1" })] })] }) }) })] }) }, "risk"), _jsx(Tabs.TabPane, { tab: _jsxs("span", { children: [_jsx(ExperimentOutlined, {}), "AI\u5206\u6790"] }), children: _jsxs(Row, { gutter: [2, 2], children: [_jsx(Col, { xs: 24, lg: 12, children: _jsx(Card, { size: "small", bordered: false, title: "\u98CE\u9669\u8BC4\u4F30", style: { margin: '2px' }, children: _jsxs(Space, { direction: "vertical", style: { width: '100%' }, size: "small", children: [_jsx(Alert, { message: "\u8D44\u4EA7\u96C6\u4E2D\u5EA6\u98CE\u9669", description: "\u8D35\u5DDE\u8305\u53F0\u4ED3\u4F4D\u8FC7\u9AD8(59.6%)\uFF0C\u5EFA\u8BAE\u964D\u4F4E\u81F330%\u4EE5\u4E0B", type: "warning", showIcon: true }), _jsx(Alert, { message: "\u884C\u4E1A\u5206\u5E03", description: "\u5F53\u524D\u6301\u4ED3\u96C6\u4E2D\u5728\u6D88\u8D39\u548C\u65B0\u80FD\u6E90\uFF0C\u5EFA\u8BAE\u589E\u52A0\u79D1\u6280\u548C\u91D1\u878D\u914D\u7F6E", type: "info", showIcon: true }), _jsx(Alert, { message: "\u6574\u4F53\u98CE\u9669\u7B49\u7EA7", description: "\u4E2D\u7B49\u98CE\u9669\uFF0C\u6574\u4F53\u7EC4\u5408\u7A33\u5065", type: "success", showIcon: true })] }) }) }), _jsx(Col, { xs: 24, lg: 12, children: _jsx(Card, { size: "small", bordered: false, title: "\u4F18\u5316\u5EFA\u8BAE", style: { margin: '2px' }, children: _jsxs(Space, { direction: "vertical", style: { width: '100%' }, size: "small", children: [_jsx(Alert, { message: "\u51CF\u4ED3\u8D35\u5DDE\u8305\u53F0", description: "\u5EFA\u8BAE\u51CF\u4ED350%\u8D35\u5DDE\u8305\u53F0\uFF0C\u5206\u6563\u98CE\u9669", type: "info", showIcon: true }), _jsx(Alert, { message: "\u589E\u6301\u4E2D\u5174\u901A\u8BAF", description: "\u4E2D\u5174\u901A\u8BAF\u77ED\u671F\u8C03\u6574\u5230\u4F4D\uFF0C\u5EFA\u8BAE\u9002\u5EA6\u589E\u6301", type: "success", showIcon: true }), _jsx(Alert, { message: "\u8BBE\u7F6E\u6B62\u635F", description: "\u4E3A\u6240\u6709\u6301\u4ED3\u8BBE\u7F6E8-10%\u7684\u6B62\u635F\u4F4D", type: "warning", showIcon: true })] }) }) })] }) }, "ai")] }), _jsx(Modal, { title: _jsxs(Space, { children: [_jsx(BulbOutlined, {}), _jsx("span", { children: "AI\u667A\u80FD\u8D44\u4EA7\u914D\u7F6E\u5EFA\u8BAE" })] }), open: showSuggestionModal, onCancel: () => setShowSuggestionModal(false), footer: [
                    _jsx(Button, { onClick: () => setShowSuggestionModal(false), size: "small", children: "\u5173\u95ED" }, "close"),
                    _jsx(Button, { type: "primary", onClick: () => { message.success('建议已应用！'); setShowSuggestionModal(false); }, size: "small", children: "\u5E94\u7528\u5EFA\u8BAE" }, "apply")
                ], width: 800, children: _jsxs("div", { children: [_jsx(Alert, { message: "AI\u5206\u6790\u7ED3\u679C", description: "\u57FA\u4E8E\u60A8\u7684\u5F53\u524D\u6301\u4ED3\u548C\u5E02\u573A\u60C5\u51B5\uFF0CAI\u4E3A\u60A8\u751F\u6210\u4EE5\u4E0B\u8D44\u4EA7\u914D\u7F6E\u5EFA\u8BAE", type: "info", showIcon: true, style: { marginBottom: 16 } }), _jsx(Divider, { children: "\u5EFA\u8BAE\u8D44\u4EA7\u914D\u7F6E" }), _jsxs(Row, { gutter: [2, 2], style: { marginBottom: 16 }, children: [_jsx(Col, { xs: 12, children: _jsx(Card, { size: "small", title: "\u5F53\u524D\u914D\u7F6E", style: { textAlign: 'center', margin: '2px' }, children: _jsxs(Space, { direction: "vertical", style: { width: '100%' }, size: "small", children: [_jsx("div", { children: _jsx(Tag, { color: "blue", children: "\u8D35\u5DDE\u8305\u53F0 59.6%" }) }), _jsx("div", { children: _jsx(Tag, { color: "green", children: "\u6BD4\u4E9A\u8FEA 20.4%" }) }), _jsx("div", { children: _jsx(Tag, { color: "orange", children: "\u62DB\u5546\u94F6\u884C 10.6%" }) }), _jsx("div", { children: _jsx(Tag, { color: "purple", children: "\u5176\u4ED6 9.4%" }) })] }) }) }), _jsx(Col, { xs: 12, children: _jsx(Card, { size: "small", title: "\u5EFA\u8BAE\u914D\u7F6E", style: { textAlign: 'center', margin: '2px' }, children: _jsxs(Space, { direction: "vertical", style: { width: '100%' }, size: "small", children: [_jsx("div", { children: _jsx(Tag, { color: "blue", children: "\u8D35\u5DDE\u8305\u53F0 30%" }) }), _jsx("div", { children: _jsx(Tag, { color: "green", children: "\u6BD4\u4E9A\u8FEA 25%" }) }), _jsx("div", { children: _jsx(Tag, { color: "orange", children: "\u62DB\u5546\u94F6\u884C 20%" }) }), _jsx("div", { children: _jsx(Tag, { color: "purple", children: "\u4E2D\u5174\u901A\u8BAF 15%" }) }), _jsx("div", { children: _jsx(Tag, { color: "cyan", children: "\u73B0\u91D1 10%" }) })] }) }) })] }), _jsx(Divider, { children: "\u64CD\u4F5C\u5EFA\u8BAE" }), _jsxs(Space, { direction: "vertical", style: { width: '100%' }, size: "small", children: [_jsx(Alert, { message: "1. \u51CF\u4ED3\u8D35\u5DDE\u8305\u53F0", description: "\u5356\u51FA50\u80A1\u8D35\u5DDE\u8305\u53F0\uFF0C\u91CA\u653E\u7EA695\u4E07\u8D44\u91D1", type: "warning", showIcon: true }), _jsx(Alert, { message: "2. \u589E\u6301\u6BD4\u4E9A\u8FEA", description: "\u589E\u6301100\u80A1\u6BD4\u4E9A\u8FEA\uFF0C\u589E\u52A0\u65B0\u80FD\u6E90\u914D\u7F6E", type: "info", showIcon: true }), _jsx(Alert, { message: "3. \u589E\u6301\u62DB\u5546\u94F6\u884C", description: "\u589E\u6301500\u80A1\u62DB\u5546\u94F6\u884C\uFF0C\u589E\u52A0\u91D1\u878D\u914D\u7F6E", type: "info", showIcon: true }), _jsx(Alert, { message: "4. \u589E\u6301\u4E2D\u5174\u901A\u8BAF", description: "\u589E\u6301200\u80A1\u4E2D\u5174\u901A\u8BAF\uFF0C\u589E\u52A0\u79D1\u6280\u914D\u7F6E", type: "success", showIcon: true }), _jsx(Alert, { message: "5. \u4FDD\u7559\u73B0\u91D1", description: "\u4FDD\u755910%\u73B0\u91D1\uFF0C\u7B49\u5F85\u66F4\u597D\u7684\u6295\u8D44\u673A\u4F1A", type: "info", showIcon: true })] }), _jsx(Divider, { children: "\u9884\u671F\u6548\u679C" }), _jsxs(Row, { gutter: [2, 2], children: [_jsx(Col, { xs: 8, children: _jsx(Card, { size: "small", style: { textAlign: 'center', margin: '2px' }, children: _jsx(Statistic, { title: "\u98CE\u9669\u964D\u4F4E", value: 35, suffix: "%", valueStyle: { color: '#52c41a' } }) }) }), _jsx(Col, { xs: 8, children: _jsx(Card, { size: "small", style: { textAlign: 'center', margin: '2px' }, children: _jsx(Statistic, { title: "\u5206\u6563\u5EA6\u63D0\u5347", value: 60, suffix: "%", valueStyle: { color: '#1890ff' } }) }) }), _jsx(Col, { xs: 8, children: _jsx(Card, { size: "small", style: { textAlign: 'center', margin: '2px' }, children: _jsx(Statistic, { title: "\u9884\u671F\u6536\u76CA", value: 12, suffix: "%", valueStyle: { color: '#ff4d4f' } }) }) })] })] }) })] }));
};
export default PortfolioAnalysis;
