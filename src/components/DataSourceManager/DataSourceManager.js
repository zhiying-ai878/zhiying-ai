import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { Card, Select, Button, Table, Alert, Row, Col, Tag, Space, message, Spin, List, Switch, Form, InputNumber } from 'antd';
import { CheckCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { getStockDataSource, getStockList, testDataSource, getDataSourceHealth } from '../../utils/stockData';
const { Option } = Select;
const DataSourceManager = React.memo(() => {
    const [currentSource, setCurrentSource] = useState('sina');
    const [stockList, setStockList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [testResult, setTestResult] = useState(null);
    const [testing, setTesting] = useState(false);
    const [healthStatus, setHealthStatus] = useState(null);
    const [autoFailover, setAutoFailover] = useState(true);
    const [failoverTimeout, setFailoverTimeout] = useState(30000);
    const [maxRetryAttempts, setMaxRetryAttempts] = useState(3);
    const dataSource = getStockDataSource();
    useEffect(() => {
        loadStockList();
        loadHealthStatus();
    }, [currentSource]);
    const loadStockList = async () => {
        setLoading(true);
        try {
            const list = await getStockList();
            setStockList(list.slice(0, 10));
        }
        catch (error) {
            message.error('加载股票列表失败');
        }
        finally {
            setLoading(false);
        }
    };
    const loadHealthStatus = () => {
        const health = getDataSourceHealth();
        setHealthStatus(health);
    };
    const handleSourceChange = (value) => {
        setCurrentSource(value);
        dataSource.setSourceType(value);
        setTestResult(null);
        message.success(`已切换到${getSourceName(value)}数据源`);
    };
    const getSourceName = (source) => {
        const map = {
            sina: '新浪财经',
            tencent: '腾讯财经',
            eastmoney: '东方财富',
            xueqiu: '雪球',
            ths: '同花顺',
            mock: '模拟数据',
            huatai: '华泰证券',
            gtja: '国泰君安',
            haitong: '海通证券',
            wind: 'Wind',
            choice: 'Choice',
            tdx: '通达信',
            dzh: '大智慧',
            jrj: '金融界',
            p5w: '全景网'
        };
        return map[source];
    };
    const testDataSourceConnection = async () => {
        setTesting(true);
        setTestResult(null);
        try {
            const result = await testDataSource(currentSource);
            setTestResult(result);
            if (result.success) {
                message.success('数据源测试成功');
            }
            else {
                message.error('数据源测试失败');
            }
            loadHealthStatus();
        }
        catch (error) {
            setTestResult({
                success: false,
                message: `测试失败：${error.message}`
            });
            message.error('数据源测试失败');
        }
        finally {
            setTesting(false);
        }
    };
    const getHealthStatusColor = (status) => {
        switch (status) {
            case 'healthy': return 'success';
            case 'degraded': return 'warning';
            case 'unhealthy': return 'error';
            default: return 'default';
        }
    };
    const getHealthStatusText = (status) => {
        switch (status) {
            case 'healthy': return '健康';
            case 'degraded': return '降级';
            case 'unhealthy': return '异常';
            default: return '未知';
        }
    };
    const columns = [
        { title: '股票代码', dataIndex: 'code', key: 'code' },
        { title: '股票名称', dataIndex: 'name', key: 'name' },
        {
            title: '最新价',
            dataIndex: 'price',
            key: 'price',
            render: (price) => price ? price.toFixed(2) : '-'
        },
        {
            title: '涨跌幅',
            dataIndex: 'changePercent',
            key: 'changePercent',
            render: (percent) => {
                if (percent === undefined || percent === null)
                    return '-';
                return (_jsxs("span", { style: { color: percent >= 0 ? '#ff4d4f' : '#52c41a' }, children: [percent >= 0 ? '+' : '', percent.toFixed(2), "%"] }));
            }
        },
        {
            title: '成交量',
            dataIndex: 'volume',
            key: 'volume',
            render: (vol) => vol ? (vol / 10000).toFixed(0) + '万' : '-'
        }
    ];
    const dataSources = [
        { type: 'eastmoney', name: '东方财富', description: '东方财富网API，支持实时行情和主力资金数据' },
        { type: 'sina', name: '新浪财经', description: '新浪财经API，支持实时行情数据' },
        { type: 'tencent', name: '腾讯财经', description: '腾讯财经API，支持实时行情数据' },
        { type: 'xueqiu', name: '雪球', description: '雪球API，支持实时行情数据' },
        { type: 'ths', name: '同花顺', description: '同花顺API，支持实时行情数据' },
        { type: 'tdx', name: '通达信', description: '通达信API，支持实时行情数据' },
        { type: 'dzh', name: '大智慧', description: '大智慧API，支持实时行情数据' },
        { type: 'huatai', name: '华泰证券', description: '华泰证券API，支持实时行情数据' },
        { type: 'gtja', name: '国泰君安', description: '国泰君安API，支持实时行情数据' },
        { type: 'haitong', name: '海通证券', description: '海通证券API，支持实时行情数据' },
        { type: 'wind', name: 'Wind', description: 'Wind金融终端API，提供专业金融数据' },
        { type: 'choice', name: 'Choice', description: 'Choice金融终端API，提供全面金融数据' },
        { type: 'jrj', name: '金融界', description: '金融界API，支持实时行情数据' },
        { type: 'p5w', name: '全景网', description: '全景网API，支持实时行情数据' },
        { type: 'mock', name: '模拟数据', description: '本地模拟数据，离线可用，用于开发和测试' }
    ];
    return (_jsxs("div", { style: { padding: '0px' }, children: [_jsx("div", { style: { marginBottom: '10px' }, children: _jsx("h2", { style: { margin: 0 }, children: "\u6570\u636E\u6E90\u7BA1\u7406" }) }), _jsxs(Row, { gutter: [2, 2], style: { marginBottom: '2px' }, children: [_jsxs(Col, { xs: 24, lg: 12, children: [_jsxs(Card, { size: "small", title: "\u6570\u636E\u6E90\u9009\u62E9", style: { margin: '2px' }, children: [_jsx("div", { style: { marginBottom: '2px' }, children: _jsxs(Space, { children: [_jsx("span", { children: "\u5F53\u524D\u6570\u636E\u6E90\uFF1A" }), _jsx(Select, { value: currentSource, onChange: handleSourceChange, style: { width: 200 }, showSearch: true, optionFilterProp: "children", filterOption: (input, option) => (option?.children).toLowerCase().includes(input.toLowerCase()), children: dataSources.map(source => (_jsx(Option, { value: source.type, children: source.name }, source.type))) }), _jsx(Tag, { color: "blue", children: "\u5F53\u524D\u4F7F\u7528" })] }) }), _jsx("div", { style: { marginBottom: '2px' }, children: _jsxs(Space, { children: [_jsx(Button, { type: "primary", icon: testing ? _jsx(Spin, { size: "small" }) : _jsx(CheckCircleOutlined, {}), onClick: testDataSourceConnection, loading: testing, children: "\u6D4B\u8BD5\u8FDE\u63A5" }), _jsx(Button, { icon: _jsx(ReloadOutlined, {}), onClick: () => { loadStockList(); loadHealthStatus(); }, loading: loading, children: "\u5237\u65B0\u6570\u636E" })] }) }), testResult && (_jsx(Alert, { message: testResult.success ? '测试成功' : '测试失败', description: testResult.message, type: testResult.success ? 'success' : 'error', showIcon: true, style: { marginBottom: '2px' } })), _jsx(Card, { size: "small", title: "\u6570\u636E\u6E90\u914D\u7F6E", style: { marginTop: '2px', margin: '2px' }, children: _jsxs(Form, { layout: "vertical", children: [_jsx(Form.Item, { label: "\u81EA\u52A8\u6545\u969C\u8F6C\u79FB", children: _jsx(Switch, { checked: autoFailover, onChange: setAutoFailover }) }), _jsx(Form.Item, { label: "\u6545\u969C\u8F6C\u79FB\u8D85\u65F6\u65F6\u95F4 (\u6BEB\u79D2)", children: _jsx(InputNumber, { min: 5000, max: 60000, step: 1000, value: failoverTimeout, onChange: (value) => value !== null && setFailoverTimeout(value), style: { width: '100%' } }) }), _jsx(Form.Item, { label: "\u6700\u5927\u91CD\u8BD5\u6B21\u6570", children: _jsx(InputNumber, { min: 1, max: 10, step: 1, value: maxRetryAttempts, onChange: (value) => value !== null && setMaxRetryAttempts(value), style: { width: '100%' } }) })] }) })] }), _jsx(Card, { size: "small", title: "\u6570\u636E\u6E90\u8BF4\u660E", style: { marginTop: '2px', margin: '2px' }, children: _jsx(List, { dataSource: dataSources, renderItem: (source) => (_jsx(List.Item, { children: _jsxs("div", { style: { width: '100%' }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsx("strong", { children: source.name }), currentSource === source.type && (_jsx(Tag, { color: "blue", children: "\u5F53\u524D\u4F7F\u7528" }))] }), _jsx("div", { style: { fontSize: '12px', color: '#666', marginTop: '4px' }, children: source.description })] }) })) }) })] }), _jsxs(Col, { xs: 24, lg: 12, children: [_jsxs(Card, { size: "small", title: "\u80A1\u7968\u6570\u636E\u9884\u89C8", style: { margin: '2px' }, children: [_jsx(Table, { dataSource: stockList, columns: columns, rowKey: "code", pagination: false, loading: loading, size: "small" }), _jsxs("div", { style: { marginTop: '8px', fontSize: '12px', color: '#999', textAlign: 'center' }, children: ["\u6570\u636E\u6765\u6E90\uFF1A", getSourceName(currentSource)] })] }), healthStatus && (_jsx(Card, { size: "small", title: "\u6570\u636E\u6E90\u5065\u5EB7\u72B6\u6001", style: { marginTop: '2px', margin: '2px' }, children: _jsx(List, { dataSource: Array.from(healthStatus.values()), renderItem: (health) => (_jsx(List.Item, { children: _jsxs("div", { style: { width: '100%' }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsx("span", { children: getSourceName(health.source) }), _jsx(Tag, { color: getHealthStatusColor(health.status), children: getHealthStatusText(health.status) })] }), _jsxs("div", { style: { fontSize: '12px', color: '#666', marginTop: '4px' }, children: ["\u6210\u529F: ", health.successCount, " | \u5931\u8D25: ", health.errorCount, health.responseTime && ` | 响应时间: ${health.responseTime}ms`] })] }) })) }) }))] })] }), _jsx(Alert, { message: "\u4F7F\u7528\u5EFA\u8BAE", description: _jsxs("div", { children: [_jsxs("p", { children: ["\u2022 ", _jsx("strong", { children: "\u6A21\u62DF\u6570\u636E\uFF1A" }), "\u9002\u5408\u5F00\u53D1\u548C\u6D4B\u8BD5\uFF0C\u65E0\u9700\u7F51\u7EDC\u8FDE\u63A5"] }), _jsxs("p", { children: ["\u2022 ", _jsx("strong", { children: "\u4E1C\u65B9\u8D22\u5BCC\uFF1A" }), "\u63A8\u8350\u4F7F\u7528\uFF0C\u652F\u6301\u4E3B\u529B\u8D44\u91D1\u6570\u636E\uFF0C\u6570\u636E\u8F83\u4E3A\u5168\u9762"] }), _jsxs("p", { children: ["\u2022 ", _jsx("strong", { children: "\u65B0\u6D6A/\u817E\u8BAF\uFF1A" }), "\u5907\u9009\u6570\u636E\u6E90\uFF0C\u4E3B\u8981\u7528\u4E8E\u5B9E\u65F6\u884C\u60C5"] }), _jsx("p", { children: "\u2022 \u6CE8\u610F\uFF1A\u7B2C\u4E09\u65B9API\u53EF\u80FD\u6709\u8BBF\u95EE\u9650\u5236\uFF0C\u5EFA\u8BAE\u5408\u7406\u63A7\u5236\u8BF7\u6C42\u9891\u7387" })] }), type: "info" })] }));
});
export default DataSourceManager;
