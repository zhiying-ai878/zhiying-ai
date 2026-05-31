import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, Button, Table, Tag, Progress, message, Space, Alert, Statistic, Row, Col, Tooltip } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, ReloadOutlined, RocketOutlined, EyeOutlined } from '@ant-design/icons';
import { scanAllStocks, generateMarketSignals } from '../../utils/stockData';
import { useTranslation } from 'react-i18next';
const MarketScan = React.memo(() => {
    const { t } = useTranslation();
    const [state, setState] = useState({
        status: 'idle',
        progress: 0,
        totalStocks: 0,
        processedStocks: 0,
        foundSignals: 0,
        scanResults: [],
        signals: [],
        loading: false,
        error: null
    });
    const [autoScan, setAutoScan] = useState(false);
    const intervalRef = useRef(null);
    // 开始全市场扫描
    const startScan = useCallback(async () => {
        try {
            setState(prev => ({
                ...prev,
                status: 'scanning',
                progress: 0,
                loading: true,
                error: null
            }));
            message.info('开始全市场扫描，请稍候...');
            // 获取全市场股票数据
            const results = await scanAllStocks(50);
            setState(prev => ({
                ...prev,
                status: 'completed',
                scanResults: results,
                totalStocks: results.length,
                processedStocks: results.length,
                progress: 100,
                loading: false
            }));
            message.success(`全市场扫描完成！共获取 ${results.length} 只股票数据`);
        }
        catch (error) {
            setState(prev => ({
                ...prev,
                status: 'error',
                loading: false,
                error: error instanceof Error ? error.message : '扫描失败'
            }));
            message.error('全市场扫描失败，请稍后重试');
        }
    }, []);
    // 生成市场信号
    const generateSignals = useCallback(async () => {
        if (state.scanResults.length === 0) {
            message.warning('请先进行全市场扫描');
            return;
        }
        try {
            setState(prev => ({
                ...prev,
                status: 'analyzing',
                progress: 0,
                loading: true,
                error: null
            }));
            message.info('开始分析市场信号，请稍候...');
            // 生成市场信号
            const signals = await generateMarketSignals(50);
            setState(prev => ({
                ...prev,
                status: 'completed',
                signals,
                foundSignals: signals.length,
                progress: 100,
                loading: false
            }));
            message.success(`信号分析完成！发现 ${signals.length} 个潜在买入信号`);
        }
        catch (error) {
            setState(prev => ({
                ...prev,
                status: 'error',
                loading: false,
                error: error instanceof Error ? error.message : '信号生成失败'
            }));
            message.error('信号生成失败，请稍后重试');
        }
    }, [state.scanResults.length]);
    // 切换自动扫描
    const toggleAutoScan = useCallback(() => {
        if (autoScan) {
            // 停止自动扫描
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            setAutoScan(false);
            message.success('自动扫描已关闭');
        }
        else {
            // 开始自动扫描
            startScan();
            intervalRef.current = setInterval(() => {
                startScan();
            }, 300000); // 每5分钟扫描一次
            setAutoScan(true);
            message.success('自动扫描已开启，每5分钟扫描一次');
        }
    }, [autoScan, startScan]);
    // 组件卸载时清理定时器
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);
    // 表格列定义
    const columns = [
        {
            title: '股票代码',
            dataIndex: 'stockCode',
            key: 'stockCode',
            width: 80,
            render: (code) => _jsx("span", { style: { fontWeight: 'bold' }, children: code })
        },
        {
            title: '股票名称',
            dataIndex: 'stockName',
            key: 'stockName',
            width: 100
        },
        {
            title: '当前价格',
            dataIndex: 'price',
            key: 'price',
            width: 80,
            render: (price) => (_jsx("span", { style: { fontWeight: 'bold' }, children: price.toFixed(2) }))
        },
        {
            title: '涨跌幅',
            dataIndex: 'changePercent',
            key: 'changePercent',
            width: 80,
            render: (changePercent) => (_jsxs(Tag, { color: changePercent >= 0 ? 'red' : 'green', children: [changePercent >= 0 ? '+' : '', changePercent.toFixed(2), "%"] }))
        },
        {
            title: '信心度',
            dataIndex: 'confidence',
            key: 'confidence',
            width: 80,
            render: (confidence) => (_jsx(Progress, { percent: confidence, size: "small", status: confidence >= 80 ? 'success' : confidence >= 60 ? 'normal' : 'exception' }))
        },
        {
            title: '信号类型',
            dataIndex: 'type',
            key: 'type',
            width: 80,
            render: (type) => (_jsx(Tag, { color: type === 'buy' ? 'red' : 'green', children: type === 'buy' ? '买入' : '卖出' }))
        },
        {
            title: '技术指标',
            dataIndex: 'technicalData',
            key: 'technicalData',
            render: (data) => (_jsx(Tooltip, { title: _jsxs("div", { children: [data.rsi && _jsxs("div", { children: ["RSI: ", data.rsi.toFixed(2)] }), data.macd && _jsxs("div", { children: ["MACD: ", data.macd.diff.toFixed(4)] }), data.kdj && _jsxs("div", { children: ["KDJ: K=", data.kdj.k.toFixed(2), ", D=", data.kdj.d.toFixed(2)] })] }), children: _jsx(EyeOutlined, { style: { cursor: 'pointer', color: '#1890ff' } }) }))
        },
        {
            title: '时间',
            dataIndex: 'timestamp',
            key: 'timestamp',
            width: 120,
            render: (timestamp) => (_jsx("span", { children: new Date(timestamp).toLocaleTimeString() }))
        }
    ];
    return (_jsx("div", { className: "market-scan", style: { padding: '10px' }, children: _jsxs(Card, { title: "\u5168\u5E02\u573A\u76D1\u63A7", extra: _jsxs(Space, { children: [_jsx(Button, { type: autoScan ? 'primary' : 'default', icon: autoScan ? _jsx(PauseCircleOutlined, {}) : _jsx(PlayCircleOutlined, {}), onClick: toggleAutoScan, children: autoScan ? '停止自动扫描' : '开启自动扫描' }), _jsx(Button, { icon: _jsx(ReloadOutlined, {}), onClick: startScan, loading: state.loading && state.status === 'scanning', children: "\u5F00\u59CB\u626B\u63CF" }), _jsx(Button, { icon: _jsx(RocketOutlined, {}), onClick: generateSignals, loading: state.loading && state.status === 'analyzing', disabled: state.scanResults.length === 0, children: "\u751F\u6210\u4FE1\u53F7" })] }), children: [state.error && (_jsx(Alert, { message: "\u9519\u8BEF", description: state.error, type: "error", showIcon: true, style: { marginBottom: '16px' } })), _jsxs(Row, { gutter: 16, style: { marginBottom: '16px' }, children: [_jsx(Col, { span: 6, children: _jsx(Card, { size: "small", children: _jsx(Statistic, { title: "\u626B\u63CF\u72B6\u6001", value: state.status === 'scanning' ? '扫描中' :
                                        state.status === 'analyzing' ? '分析中' :
                                            state.status === 'completed' ? '完成' :
                                                state.status === 'error' ? '错误' : '就绪', valueStyle: { color: state.status === 'completed' ? '#3f8600' :
                                            state.status === 'error' ? '#cf1322' : '#1890ff' } }) }) }), _jsx(Col, { span: 6, children: _jsx(Card, { size: "small", children: _jsx(Statistic, { title: "\u603B\u80A1\u7968\u6570", value: state.totalStocks, valueStyle: { color: '#1890ff' } }) }) }), _jsx(Col, { span: 6, children: _jsx(Card, { size: "small", children: _jsx(Statistic, { title: "\u5904\u7406\u80A1\u7968\u6570", value: state.processedStocks, valueStyle: { color: '#52c41a' } }) }) }), _jsx(Col, { span: 6, children: _jsx(Card, { size: "small", children: _jsx(Statistic, { title: "\u53D1\u73B0\u4FE1\u53F7\u6570", value: state.foundSignals, valueStyle: { color: '#cf1322' } }) }) })] }), (state.status === 'scanning' || state.status === 'analyzing') && (_jsx("div", { style: { marginBottom: '16px' }, children: _jsx(Progress, { percent: state.progress, status: "active", format: () => `${state.status === 'scanning' ? '扫描中' : '分析中'} ${state.progress}%` }) })), _jsx(Table, { columns: columns, dataSource: state.signals, rowKey: "id", loading: state.loading, pagination: { pageSize: 20 }, scroll: { x: 'max-content' }, locale: { emptyText: '暂无信号数据' } })] }) }));
});
export default MarketScan;
