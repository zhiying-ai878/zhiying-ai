import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Card, Row, Col, Select, Button, Statistic, Progress, Tag, Space, Table, Alert } from 'antd';
import { ReloadOutlined, BarChartOutlined, RiseOutlined, FallOutlined, InfoCircleOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { getChipPeakAnalyzer } from '../../utils/chipPeakAnalyzer';
import { getStockList } from '../../utils/stockData';
const { Option } = Select;
const ChipPeakAnalyzerComponent = () => {
    const [selectedStock, setSelectedStock] = useState('600519');
    const [stockList, setStockList] = useState([]);
    const [chipDistribution, setChipDistribution] = useState(null);
    const [loading, setLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const analyzer = getChipPeakAnalyzer();
    useEffect(() => {
        loadStockList();
    }, []);
    useEffect(() => {
        if (stockList.length > 0) {
            loadChipDistribution();
        }
    }, [selectedStock, stockList]);
    const loadStockList = async () => {
        try {
            const list = await getStockList();
            setStockList(list.map(item => ({ code: item.code, name: item.name })));
        }
        catch (error) {
            console.error('加载股票列表失败:', error);
            setStockList([
                { code: '600519', name: '贵州茅台' },
                { code: '000001', name: '平安银行' },
                { code: '002594', name: '比亚迪' },
                { code: '000977', name: '浪潮信息' },
                { code: '300418', name: '昆仑万维' }
            ]);
        }
    };
    const loadChipDistribution = () => {
        setLoading(true);
        setTimeout(() => {
            const stock = stockList.find(s => s.code === selectedStock);
            const currentPrice = selectedStock === '600519' ? 1856.00 :
                selectedStock === '000001' ? 12.56 :
                    selectedStock === '002594' ? 256.80 :
                        selectedStock === '000977' ? 45.80 : 38.50;
            const distribution = analyzer.generateChipDistribution(selectedStock, stock?.name || '未知股票', currentPrice);
            setChipDistribution(distribution);
            const result = analyzer.analyzeChipDistribution(distribution);
            setAnalysisResult(result);
            setLoading(false);
        }, 500);
    };
    const getSignalIcon = (signal) => {
        switch (signal) {
            case 'bullish': return _jsx(RiseOutlined, { style: { color: '#ff4d4f' } });
            case 'bearish': return _jsx(FallOutlined, { style: { color: '#52c41a' } });
            default: return _jsx(BarChartOutlined, { style: { color: '#1890ff' } });
        }
    };
    const getSignalText = (signal) => {
        switch (signal) {
            case 'bullish': return '看涨';
            case 'bearish': return '看跌';
            default: return '中性';
        }
    };
    const getSignalColor = (signal) => {
        switch (signal) {
            case 'bullish': return 'red';
            case 'bearish': return 'green';
            default: return 'blue';
        }
    };
    const getChipChartOption = () => {
        if (!chipDistribution)
            return {};
        const maxVolume = Math.max(...chipDistribution.peaks.map(p => p.volume));
        return {
            title: {
                text: '筹码分布',
                left: 'center',
                textStyle: { fontSize: 16, fontWeight: 'bold' }
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                formatter: (params) => {
                    const data = params[0];
                    if (!data)
                        return '';
                    return `
            <div>价格: ${data.value[0].toFixed(2)}</div>
            <div>成交量: ${(data.value[1] / 10000).toFixed(2)}万</div>
            <div>占比: ${data.value[2].toFixed(2)}%</div>
          `;
                }
            },
            grid: { left: '10%', right: '10%', bottom: '15%', top: '15%' },
            xAxis: {
                type: 'value',
                name: '成交量',
                axisLabel: {
                    formatter: (value) => (value / 10000).toFixed(0) + '万'
                }
            },
            yAxis: {
                type: 'value',
                name: '价格',
                position: 'right'
            },
            series: [{
                    type: 'bar',
                    layout: 'horizontal',
                    data: chipDistribution.peaks.map(p => [p.price, p.volume, p.percentage]),
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
                                label: { formatter: '当前价格: {c}' }
                            }
                        ]
                    }
                }]
        };
    };
    const getPeakTableColumns = () => [
        {
            title: '价格',
            dataIndex: 'price',
            key: 'price',
            render: (price) => price.toFixed(2),
            sorter: (a, b) => a.price - b.price
        },
        {
            title: '成交量',
            dataIndex: 'volume',
            key: 'volume',
            render: (vol) => (vol / 10000).toFixed(2) + '万',
            sorter: (a, b) => a.volume - b.volume
        },
        {
            title: '占比',
            dataIndex: 'percentage',
            key: 'percentage',
            render: (percent) => (_jsx(Progress, { percent: percent, size: "small", strokeColor: "#1890ff" })),
            sorter: (a, b) => a.percentage - b.percentage
        },
        {
            title: '类型',
            dataIndex: 'isPeak',
            key: 'isPeak',
            render: (isPeak) => (isPeak ? _jsx(Tag, { color: "orange", children: "\u7B79\u7801\u5CF0" }) : _jsx(Tag, { color: "default", children: "\u666E\u901A" }))
        }
    ];
    return (_jsxs("div", { style: { padding: '0px' }, children: [_jsxs("div", { style: { marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsx("h2", { style: { margin: 0 }, children: "\u7B79\u7801\u5CF0\u5206\u6790" }), _jsxs(Space, { children: [_jsx(Select, { value: selectedStock, onChange: setSelectedStock, style: { width: 200 }, loading: stockList.length === 0, children: stockList.map(stock => (_jsxs(Option, { value: stock.code, children: [stock.name, " (", stock.code, ")"] }, stock.code))) }), _jsx(Button, { type: "primary", icon: _jsx(ReloadOutlined, {}), onClick: loadChipDistribution, loading: loading, children: "\u5237\u65B0\u5206\u6790" })] })] }), chipDistribution && analysisResult && (_jsxs(_Fragment, { children: [_jsxs(Row, { gutter: [2, 2], style: { marginBottom: '2px' }, children: [_jsx(Col, { xs: 24, sm: 12, md: 8, lg: 6, xl: 4, children: _jsx(Card, { size: "small", bordered: false, style: { margin: '2px' }, children: _jsx(Statistic, { title: "\u5F53\u524D\u4EF7\u683C", value: chipDistribution.currentPrice, precision: 2, valueStyle: { color: '#ff4d4f' } }) }) }), _jsx(Col, { xs: 24, sm: 12, md: 8, lg: 6, xl: 4, children: _jsx(Card, { size: "small", bordered: false, style: { margin: '2px' }, children: _jsx(Statistic, { title: "\u5E73\u5747\u6210\u672C", value: chipDistribution.avgCost, precision: 2, valueStyle: { color: '#1890ff' } }) }) }), _jsx(Col, { xs: 24, sm: 12, md: 8, lg: 6, xl: 4, children: _jsx(Card, { size: "small", bordered: false, style: { margin: '2px' }, children: _jsx(Statistic, { title: "\u83B7\u5229\u76D8\u6BD4\u4F8B", value: chipDistribution.profitPercentage, precision: 2, suffix: "%", valueStyle: { color: '#52c41a' } }) }) }), _jsx(Col, { xs: 24, sm: 12, md: 8, lg: 6, xl: 4, children: _jsx(Card, { size: "small", bordered: false, style: { margin: '2px' }, children: _jsx(Statistic, { title: "\u7B79\u7801\u96C6\u4E2D\u5EA6", value: chipDistribution.concentration, precision: 2, suffix: "%", valueStyle: { color: '#faad14' } }) }) }), _jsx(Col, { xs: 24, sm: 12, md: 8, lg: 6, xl: 4, children: _jsx(Card, { size: "small", bordered: false, style: { margin: '2px' }, children: _jsx(Statistic, { title: "\u652F\u6491\u4F4D", value: chipDistribution.supportLevel, precision: 2, valueStyle: { color: '#52c41a' } }) }) }), _jsx(Col, { xs: 24, sm: 12, md: 8, lg: 6, xl: 4, children: _jsx(Card, { size: "small", bordered: false, style: { margin: '2px' }, children: _jsx(Statistic, { title: "\u963B\u529B\u4F4D", value: chipDistribution.resistanceLevel, precision: 2, valueStyle: { color: '#ff4d4f' } }) }) })] }), _jsxs(Row, { gutter: [2, 2], style: { marginBottom: '2px' }, children: [_jsx(Col, { xs: 24, lg: 8, children: _jsx(Card, { size: "small", bordered: false, title: "\u7EFC\u5408\u5206\u6790", style: { margin: '2px' }, children: _jsxs("div", { style: { textAlign: 'center', padding: '20px 0' }, children: [_jsx("div", { style: { fontSize: '48px', marginBottom: '10px' }, children: getSignalIcon(analysisResult.signal) }), _jsx("div", { style: { fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }, children: _jsx(Tag, { color: getSignalColor(analysisResult.signal), style: { fontSize: '18px', padding: '8px 16px' }, children: getSignalText(analysisResult.signal) }) }), _jsx("div", { style: { marginBottom: '20px' }, children: _jsx(Progress, { percent: analysisResult.score, strokeColor: {
                                                        '0%': '#52c41a',
                                                        '50%': '#faad14',
                                                        '100%': '#ff4d4f'
                                                    } }) }), _jsxs("div", { style: { fontSize: '14px', color: '#666' }, children: ["\u8BC4\u5206: ", analysisResult.score, "/100"] })] }) }) }), _jsx(Col, { xs: 24, lg: 16, children: _jsx(Card, { size: "small", bordered: false, title: "\u5206\u6790\u4F9D\u636E", style: { margin: '2px' }, children: analysisResult.reasons.map((reason, index) => (_jsx(Alert, { message: reason, type: "info", showIcon: true, style: { marginBottom: index < analysisResult.reasons.length - 1 ? '2px' : 0 } }, index))) }) })] }), _jsxs(Row, { gutter: [2, 2], style: { marginBottom: '2px' }, children: [_jsx(Col, { xs: 24, lg: 16, children: _jsxs(Card, { size: "small", bordered: false, title: "\u7B79\u7801\u5206\u5E03\u56FE", style: { margin: '2px' }, children: [_jsx(ReactECharts, { option: getChipChartOption(), style: { height: '400px' } }), _jsxs("div", { style: { marginTop: '12px', display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '12px' }, children: [_jsx("span", { children: _jsx(Tag, { color: "green", children: "\u83B7\u5229\u76D8" }) }), _jsx("span", { children: _jsx(Tag, { color: "gold", children: "\u5F53\u524D\u4EF7\u683C\u9644\u8FD1" }) }), _jsx("span", { children: _jsx(Tag, { color: "red", children: "\u5957\u7262\u76D8" }) }), _jsx("span", { children: _jsx(Tag, { color: "blue", children: "\u5176\u4ED6" }) })] })] }) }), _jsx(Col, { xs: 24, lg: 8, children: _jsx(Card, { size: "small", bordered: false, title: "\u7B79\u7801\u8BE6\u60C5", style: { margin: '2px' }, children: _jsx(Table, { columns: getPeakTableColumns(), dataSource: chipDistribution.peaks, rowKey: "price", pagination: { pageSize: 10, size: 'small' }, size: "small" }) }) })] }), _jsxs(Card, { size: "small", bordered: false, style: { margin: '2px' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }, children: [_jsx(InfoCircleOutlined, { style: { color: '#1890ff' } }), _jsx("span", { style: { fontWeight: 'bold' }, children: "\u4F7F\u7528\u8BF4\u660E" })] }), _jsxs("ul", { style: { margin: 0, paddingLeft: '20px', color: '#666', fontSize: '13px' }, children: [_jsx("li", { children: "\u7B79\u7801\u5206\u5E03\u56FE\u663E\u793A\u4E86\u4E0D\u540C\u4EF7\u683C\u533A\u95F4\u7684\u6210\u4EA4\u91CF\u5206\u5E03\u60C5\u51B5" }), _jsx("li", { children: "\u7EFF\u8272\u8868\u793A\u83B7\u5229\u76D8\uFF08\u4F4E\u4E8E\u5F53\u524D\u4EF7\u683C\u7684\u7B79\u7801\uFF09\uFF0C\u7EA2\u8272\u8868\u793A\u5957\u7262\u76D8\uFF08\u9AD8\u4E8E\u5F53\u524D\u4EF7\u683C\u7684\u7B79\u7801\uFF09" }), _jsx("li", { children: "\u7B79\u7801\u96C6\u4E2D\u5EA6\u8D8A\u9AD8\uFF0C\u8BF4\u660E\u4E3B\u529B\u63A7\u76D8\u7A0B\u5EA6\u8D8A\u9AD8" }), _jsx("li", { children: "\u652F\u6491\u4F4D\u548C\u963B\u529B\u4F4D\u662F\u57FA\u4E8E\u7B79\u7801\u5CF0\u8BA1\u7B97\u5F97\u51FA\u7684\u91CD\u8981\u4EF7\u683C\u4F4D\u7F6E" }), _jsx("li", { children: "\u7EFC\u5408\u5206\u6790\u7ED3\u679C\u4EC5\u4F9B\u53C2\u8003\uFF0C\u4E0D\u6784\u6210\u6295\u8D44\u5EFA\u8BAE" })] })] })] }))] }));
};
export default ChipPeakAnalyzerComponent;
