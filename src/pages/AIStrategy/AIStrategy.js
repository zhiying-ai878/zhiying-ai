import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback } from 'react';
import { Card, Tabs, Row, Col, Statistic, Button, List, Tag, Space, Progress, Select, Switch, Form, InputNumber, message, Modal, Alert, Tooltip, Slider, Badge, Divider, Typography } from 'antd';
import { RobotOutlined, PlayCircleOutlined, PauseCircleOutlined, ReloadOutlined, BarChartOutlined, HistoryOutlined, SettingOutlined, BankOutlined, WarningOutlined, DingdingOutlined, TagOutlined, RocketOutlined, ApiOutlined } from '@ant-design/icons';
const { Text } = Typography;
const { Option } = Select;
const AIStrategy = () => {
    const [strategies] = useState([
        {
            id: '1',
            name: '趋势跟踪策略',
            type: 'trend',
            status: 'running',
            winRate: 68,
            totalReturn: 32.5,
            maxDrawdown: 12.3,
            trades: 156,
            description: '基于均线突破和MACD金叉的趋势跟踪策略，适合强势市场',
            aiScore: 75,
            riskLevel: 'medium',
            sharpeRatio: 1.2,
            sortinoRatio: 1.5,
            calmarRatio: 2.6,
            alpha: 0.08,
            beta: 1.1,
            volatility: 18.5,
            drawdownDuration: 45,
            avgWin: 4.2,
            avgLoss: 2.1,
            profitFactor: 1.8,
            winLossRatio: 2.0,
            recentPerformance: [2.5, 1.8, -0.5, 3.2, 1.5],
            marketCorrelation: 0.75
        },
        {
            id: '2',
            name: '均值回归策略',
            type: 'mean',
            status: 'stopped',
            winRate: 62,
            totalReturn: 18.2,
            maxDrawdown: 8.5,
            trades: 203,
            description: '基于布林带和RSI超买超卖的均值回归策略，适合震荡市场',
            aiScore: 70,
            riskLevel: 'low',
            sharpeRatio: 1.0,
            sortinoRatio: 1.2,
            calmarRatio: 2.1,
            alpha: 0.05,
            beta: 0.8,
            volatility: 12.3,
            drawdownDuration: 30,
            avgWin: 2.8,
            avgLoss: 1.9,
            profitFactor: 1.5,
            winLossRatio: 1.5,
            recentPerformance: [1.2, -0.8, 1.5, 0.9, 1.1],
            marketCorrelation: 0.6
        },
        {
            id: '3',
            name: '动量策略',
            type: 'momentum',
            status: 'testing',
            winRate: 55,
            totalReturn: 25.8,
            maxDrawdown: 18.6,
            trades: 89,
            description: '基于价格动量和成交量放大的动量策略，捕捉短期爆发机会',
            aiScore: 65,
            riskLevel: 'high',
            sharpeRatio: 0.9,
            sortinoRatio: 1.1,
            calmarRatio: 1.4,
            alpha: 0.1,
            beta: 1.3,
            volatility: 25.6,
            drawdownDuration: 60,
            avgWin: 6.5,
            avgLoss: 3.2,
            profitFactor: 1.3,
            winLossRatio: 2.0,
            recentPerformance: [4.2, -2.1, 3.5, -1.8, 5.2],
            marketCorrelation: 0.85
        },
        {
            id: '4',
            name: 'AI自适应策略',
            type: 'ai_adaptive',
            status: 'running',
            winRate: 72,
            totalReturn: 41.2,
            maxDrawdown: 10.8,
            trades: 124,
            description: '基于机器学习的自适应策略，自动调整参数以适应市场变化',
            aiScore: 90,
            lastOptimized: new Date(),
            riskLevel: 'medium',
            sharpeRatio: 1.5,
            sortinoRatio: 1.8,
            calmarRatio: 3.8,
            alpha: 0.12,
            beta: 0.9,
            volatility: 15.2,
            drawdownDuration: 35,
            avgWin: 4.8,
            avgLoss: 2.0,
            profitFactor: 2.1,
            winLossRatio: 2.4,
            recentPerformance: [3.1, 2.5, 1.8, 2.9, 3.5],
            marketCorrelation: 0.7
        }
    ]);
    const [optimizingId, setOptimizingId] = useState(null);
    const [showOptimizationModal, setShowOptimizationModal] = useState(false);
    const [selectedStrategy, setSelectedStrategy] = useState(null);
    const getTypeTag = (type) => {
        const typeMap = {
            trend: { color: 'blue', text: '趋势跟踪', icon: _jsx(WarningOutlined, {}) },
            mean: { color: 'purple', text: '均值回归', icon: _jsx(DingdingOutlined, {}) },
            momentum: { color: 'orange', text: '动量策略', icon: _jsx(RocketOutlined, {}) },
            value: { color: 'green', text: '价值投资', icon: _jsx(TagOutlined, {}) },
            ai_adaptive: { color: 'cyan', text: 'AI自适应', icon: _jsx(BankOutlined, {}) }
        };
        return typeMap[type] || typeMap.trend;
    };
    const getStatusTag = (status) => {
        const statusMap = {
            running: { color: 'green', text: '运行中', icon: _jsx(PlayCircleOutlined, {}) },
            stopped: { color: 'default', text: '已停止', icon: _jsx(PauseCircleOutlined, {}) },
            testing: { color: 'gold', text: '回测中', icon: _jsx(ReloadOutlined, {}) },
            optimizing: { color: 'blue', text: '优化中', icon: _jsx(ApiOutlined, {}) }
        };
        return statusMap[status] || statusMap.stopped;
    };
    const getRiskTag = (riskLevel) => {
        const riskMap = {
            low: { color: 'green', text: '低风险' },
            medium: { color: 'orange', text: '中风险' },
            high: { color: 'red', text: '高风险' }
        };
        return riskMap[riskLevel] || riskMap.medium;
    };
    const toggleStrategyStatus = (id) => {
        message.success('策略状态已更新');
    };
    const handleOptimizeStrategy = useCallback((strategy) => {
        setSelectedStrategy(strategy);
        setOptimizingId(strategy.id);
        setShowOptimizationModal(true);
        // 模拟优化过程
        setTimeout(() => {
            setOptimizingId(null);
            message.success(`策略 ${strategy.name} 优化完成！`);
        }, 3000);
    }, []);
    const strategyListTab = {
        key: '1',
        label: _jsxs("span", { children: [_jsx(RobotOutlined, {}), "\u7B56\u7565\u5217\u8868"] }),
        children: (_jsxs("div", { children: [_jsxs(Row, { gutter: [2, 2], style: { marginBottom: '2px' }, children: [_jsx(Col, { xs: 12, sm: 6, children: _jsx(Card, { size: "small", style: { margin: '2px' }, children: _jsx(Statistic, { title: "\u8FD0\u884C\u4E2D\u7B56\u7565", value: strategies.filter(s => s.status === 'running').length, valueStyle: { color: '#3f8600' }, prefix: _jsx(PlayCircleOutlined, {}) }) }) }), _jsx(Col, { xs: 12, sm: 6, children: _jsx(Card, { size: "small", style: { margin: '2px' }, children: _jsx(Statistic, { title: "\u603B\u7B56\u7565\u6570", value: strategies.length, prefix: _jsx(RobotOutlined, {}) }) }) }), _jsx(Col, { xs: 12, sm: 6, children: _jsx(Card, { size: "small", style: { margin: '2px' }, children: _jsx(Statistic, { title: "\u5E73\u5747\u80DC\u7387", value: (strategies.reduce((sum, s) => sum + s.winRate, 0) / strategies.length).toFixed(1), suffix: "%", valueStyle: { color: '#1890ff' } }) }) }), _jsx(Col, { xs: 12, sm: 6, children: _jsx(Card, { size: "small", style: { margin: '2px' }, children: _jsx(Statistic, { title: "\u603B\u6536\u76CA\u7387", value: strategies.reduce((sum, s) => sum + s.totalReturn, 0).toFixed(1), suffix: "%", valueStyle: { color: '#faad14' } }) }) })] }), _jsx(List, { dataSource: strategies, renderItem: (item) => {
                        const typeTag = getTypeTag(item.type);
                        const statusTag = getStatusTag(item.status);
                        const riskTag = getRiskTag(item.riskLevel);
                        return (_jsx(List.Item, { children: _jsx(Card, { size: "small", style: { width: '100%', margin: '2px' }, children: _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }, children: [_jsxs("div", { style: { flex: 1 }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }, children: [_jsx("span", { style: { fontWeight: 'bold', fontSize: '16px' }, children: item.name }), _jsx(Tag, { color: typeTag.color, icon: typeTag.icon, children: typeTag.text }), _jsx(Tag, { color: statusTag.color, icon: statusTag.icon, children: statusTag.text }), _jsx(Tag, { color: riskTag.color, children: riskTag.text }), _jsx(Badge, { count: item.aiScore, showZero: true, color: item.aiScore >= 80 ? 'green' : item.aiScore >= 60 ? 'blue' : 'orange', children: _jsx(Tooltip, { title: "AI\u8BC4\u5206", children: _jsx("span", { style: { cursor: 'pointer' }, children: _jsx(BankOutlined, {}) }) }) })] }), _jsxs(Row, { gutter: [16, 8], style: { marginBottom: '8px' }, children: [_jsx(Col, { xs: 12, sm: 6, children: _jsxs("div", { children: [_jsx("span", { style: { color: '#666' }, children: "\u80DC\u7387\uFF1A" }), _jsx(Progress, { percent: item.winRate, size: "small", style: { width: '80px', display: 'inline-block', verticalAlign: 'middle' } })] }) }), _jsx(Col, { xs: 12, sm: 6, children: _jsxs("div", { children: [_jsx("span", { style: { color: '#666' }, children: "\u6536\u76CA\u7387\uFF1A" }), _jsxs("span", { style: { color: item.totalReturn >= 0 ? '#3f8600' : '#cf1322', fontWeight: 'bold' }, children: [item.totalReturn >= 0 ? '+' : '', item.totalReturn, "%"] })] }) }), _jsx(Col, { xs: 12, sm: 6, children: _jsxs("div", { children: [_jsx("span", { style: { color: '#666' }, children: "\u6700\u5927\u56DE\u64A4\uFF1A" }), _jsxs("span", { style: { color: '#cf1322', fontWeight: 'bold' }, children: ["-", item.maxDrawdown, "%"] })] }) }), _jsx(Col, { xs: 12, sm: 6, children: _jsxs("div", { children: [_jsx("span", { style: { color: '#666' }, children: "\u4EA4\u6613\u6B21\u6570\uFF1A" }), _jsx("span", { style: { fontWeight: 'bold' }, children: item.trades })] }) })] }), _jsxs(Row, { gutter: [16, 8], style: { marginBottom: '8px' }, children: [_jsx(Col, { xs: 12, sm: 4, children: _jsxs("div", { children: [_jsx("span", { style: { color: '#666' }, children: "\u590F\u666E\u6BD4\u7387\uFF1A" }), _jsx("span", { style: { fontWeight: 'bold' }, children: item.sharpeRatio.toFixed(2) })] }) }), _jsx(Col, { xs: 12, sm: 4, children: _jsxs("div", { children: [_jsx("span", { style: { color: '#666' }, children: "\u7D22\u63D0\u8BFA\u6BD4\u7387\uFF1A" }), _jsx("span", { style: { fontWeight: 'bold' }, children: item.sortinoRatio.toFixed(2) })] }) }), _jsx(Col, { xs: 12, sm: 4, children: _jsxs("div", { children: [_jsx("span", { style: { color: '#666' }, children: "\u5361\u739B\u6BD4\u7387\uFF1A" }), _jsx("span", { style: { fontWeight: 'bold' }, children: item.calmarRatio.toFixed(2) })] }) }), _jsx(Col, { xs: 12, sm: 4, children: _jsxs("div", { children: [_jsx("span", { style: { color: '#666' }, children: "\u963F\u5C14\u6CD5\uFF1A" }), _jsxs("span", { style: { fontWeight: 'bold' }, children: [(item.alpha * 100).toFixed(2), "%"] })] }) }), _jsx(Col, { xs: 12, sm: 4, children: _jsxs("div", { children: [_jsx("span", { style: { color: '#666' }, children: "\u8D1D\u5854\uFF1A" }), _jsx("span", { style: { fontWeight: 'bold' }, children: item.beta.toFixed(2) })] }) }), _jsx(Col, { xs: 12, sm: 4, children: _jsxs("div", { children: [_jsx("span", { style: { color: '#666' }, children: "\u6CE2\u52A8\u7387\uFF1A" }), _jsxs("span", { style: { fontWeight: 'bold' }, children: [item.volatility.toFixed(2), "%"] })] }) })] }), _jsxs(Row, { gutter: [16, 8], style: { marginBottom: '8px' }, children: [_jsx(Col, { xs: 12, sm: 4, children: _jsxs("div", { children: [_jsx("span", { style: { color: '#666' }, children: "\u5E73\u5747\u76C8\u5229\uFF1A" }), _jsxs("span", { style: { color: '#3f8600', fontWeight: 'bold' }, children: ["+", item.avgWin.toFixed(2), "%"] })] }) }), _jsx(Col, { xs: 12, sm: 4, children: _jsxs("div", { children: [_jsx("span", { style: { color: '#666' }, children: "\u5E73\u5747\u4E8F\u635F\uFF1A" }), _jsxs("span", { style: { color: '#cf1322', fontWeight: 'bold' }, children: ["-", item.avgLoss.toFixed(2), "%"] })] }) }), _jsx(Col, { xs: 12, sm: 4, children: _jsxs("div", { children: [_jsx("span", { style: { color: '#666' }, children: "\u76C8\u5229\u56E0\u5B50\uFF1A" }), _jsx("span", { style: { fontWeight: 'bold' }, children: item.profitFactor.toFixed(2) })] }) }), _jsx(Col, { xs: 12, sm: 4, children: _jsxs("div", { children: [_jsx("span", { style: { color: '#666' }, children: "\u76C8\u4E8F\u6BD4\uFF1A" }), _jsx("span", { style: { fontWeight: 'bold' }, children: item.winLossRatio.toFixed(2) })] }) }), _jsx(Col, { xs: 12, sm: 4, children: _jsxs("div", { children: [_jsx("span", { style: { color: '#666' }, children: "\u56DE\u64A4\u65F6\u957F\uFF1A" }), _jsxs("span", { style: { fontWeight: 'bold' }, children: [item.drawdownDuration, "\u5929"] })] }) }), _jsx(Col, { xs: 12, sm: 4, children: _jsxs("div", { children: [_jsx("span", { style: { color: '#666' }, children: "\u5E02\u573A\u76F8\u5173\u6027\uFF1A" }), _jsxs("span", { style: { fontWeight: 'bold' }, children: [(item.marketCorrelation * 100).toFixed(0), "%"] })] }) })] }), _jsx("div", { style: { fontSize: '12px', color: '#666', marginBottom: '8px' }, children: item.description }), _jsxs("div", { style: { marginBottom: '8px' }, children: [_jsx(Text, { type: "secondary", style: { fontSize: '12px' }, children: "\u8FD1\u671F\u8868\u73B0\uFF1A" }), _jsx("div", { style: { display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }, children: item.recentPerformance.map((value, index) => (_jsxs("div", { style: { width: '20px', height: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '10px', fontWeight: 'bold', color: value >= 0 ? '#3f8600' : '#cf1322', backgroundColor: value >= 0 ? '#f6ffed' : '#fff1f0', borderRadius: '2px' }, children: [value >= 0 ? '+' : '', value.toFixed(1)] }, index))) })] }), item.lastOptimized && (_jsxs("div", { style: { fontSize: '11px', color: '#999' }, children: ["\u6700\u8FD1\u4F18\u5316\uFF1A", item.lastOptimized.toLocaleString()] }))] }), _jsxs(Space, { direction: "vertical", style: { marginLeft: '16px' }, children: [_jsx(Button, { type: item.status === 'running' ? 'default' : 'primary', size: "small", icon: item.status === 'running' ? _jsx(PauseCircleOutlined, {}) : _jsx(PlayCircleOutlined, {}), onClick: () => toggleStrategyStatus(item.id), children: item.status === 'running' ? '停止' : '启动' }), _jsx(Button, { size: "small", icon: _jsx(BarChartOutlined, {}), children: "\u56DE\u6D4B" }), _jsx(Button, { size: "small", icon: _jsx(ApiOutlined, {}), onClick: () => handleOptimizeStrategy(item), loading: optimizingId === item.id, children: optimizingId === item.id ? '优化中' : 'AI优化' })] })] }) }) }));
                    } })] }))
    };
    const strategyConfigTab = {
        key: '2',
        label: _jsxs("span", { children: [_jsx(SettingOutlined, {}), "\u7B56\u7565\u914D\u7F6E"] }),
        children: (_jsx(Card, { title: "AI\u7B56\u7565\u914D\u7F6E", style: { margin: '2px' }, children: _jsxs(Form, { layout: "vertical", size: "small", children: [_jsxs(Row, { gutter: [2, 2], children: [_jsx(Col, { xs: 24, sm: 12, children: _jsx(Form.Item, { label: "\u9ED8\u8BA4\u7B56\u7565", children: _jsxs(Select, { defaultValue: "trend", style: { width: '100%' }, children: [_jsx(Option, { value: "trend", children: "\u8D8B\u52BF\u8DDF\u8E2A\u7B56\u7565" }), _jsx(Option, { value: "mean", children: "\u5747\u503C\u56DE\u5F52\u7B56\u7565" }), _jsx(Option, { value: "momentum", children: "\u52A8\u91CF\u7B56\u7565" }), _jsx(Option, { value: "value", children: "\u4EF7\u503C\u6295\u8D44\u7B56\u7565" }), _jsx(Option, { value: "ai_adaptive", children: "AI\u81EA\u9002\u5E94\u7B56\u7565" })] }) }) }), _jsx(Col, { xs: 24, sm: 12, children: _jsx(Form.Item, { label: "\u98CE\u9669\u7B49\u7EA7", children: _jsxs(Select, { defaultValue: "medium", style: { width: '100%' }, children: [_jsx(Option, { value: "low", children: "\u4F4E\u98CE\u9669" }), _jsx(Option, { value: "medium", children: "\u4E2D\u98CE\u9669" }), _jsx(Option, { value: "high", children: "\u9AD8\u98CE\u9669" })] }) }) })] }), _jsxs(Row, { gutter: [2, 2], children: [_jsx(Col, { xs: 24, sm: 12, children: _jsx(Form.Item, { label: "\u5355\u80A1\u6700\u5927\u4ED3\u4F4D", children: _jsx(InputNumber, { min: 5, max: 50, defaultValue: 20, addonAfter: "%", style: { width: '100%' } }) }) }), _jsx(Col, { xs: 24, sm: 12, children: _jsx(Form.Item, { label: "\u6B62\u635F\u6BD4\u4F8B", children: _jsx(InputNumber, { min: 1, max: 20, defaultValue: 8, addonAfter: "%", style: { width: '100%' } }) }) })] }), _jsxs(Row, { gutter: [2, 2], children: [_jsx(Col, { xs: 24, sm: 12, children: _jsx(Form.Item, { label: "\u81EA\u52A8\u8C03\u4ED3", valuePropName: "checked", children: _jsx(Switch, { checkedChildren: "\u5F00\u542F", unCheckedChildren: "\u5173\u95ED" }) }) }), _jsx(Col, { xs: 24, sm: 12, children: _jsx(Form.Item, { label: "AI\u4F18\u5316", valuePropName: "checked", children: _jsx(Switch, { checkedChildren: "\u5F00\u542F", unCheckedChildren: "\u5173\u95ED", defaultChecked: true }) }) })] }), _jsx(Divider, { style: { margin: '16px 0' } }), _jsx("h4", { style: { margin: '0 0 12px 0' }, children: "AI\u7B56\u7565\u53C2\u6570" }), _jsx(Row, { gutter: [2, 2], children: _jsx(Col, { xs: 24, children: _jsx(Form.Item, { label: "AI\u5B66\u4E60\u9891\u7387", children: _jsxs(Select, { defaultValue: "daily", style: { width: '100%' }, children: [_jsx(Option, { value: "hourly", children: "\u6BCF\u5C0F\u65F6" }), _jsx(Option, { value: "daily", children: "\u6BCF\u5929" }), _jsx(Option, { value: "weekly", children: "\u6BCF\u5468" })] }) }) }) }), _jsx(Row, { gutter: [2, 2], children: _jsx(Col, { xs: 24, children: _jsx(Form.Item, { label: "\u6A21\u578B\u590D\u6742\u5EA6", children: _jsx(Slider, { min: 1, max: 10, defaultValue: 5, marks: { 1: '简单', 5: '中等', 10: '复杂' } }) }) }) }), _jsx(Row, { gutter: [2, 2], children: _jsx(Col, { xs: 24, children: _jsx(Form.Item, { label: "\u9884\u6D4B\u5468\u671F", children: _jsxs(Select, { defaultValue: "short", style: { width: '100%' }, children: [_jsx(Option, { value: "short", children: "\u77ED\u671F (1-3\u5929)" }), _jsx(Option, { value: "medium", children: "\u4E2D\u671F (1-2\u5468)" }), _jsx(Option, { value: "long", children: "\u957F\u671F (1-3\u6708)" })] }) }) }) }), _jsx(Form.Item, { children: _jsxs(Space, { children: [_jsx(Button, { type: "primary", children: "\u4FDD\u5B58\u914D\u7F6E" }), _jsx(Button, { children: "\u91CD\u7F6E\u9ED8\u8BA4" })] }) })] }) }))
    };
    const backtestTab = {
        key: '3',
        label: _jsxs("span", { children: [_jsx(HistoryOutlined, {}), "\u7B56\u7565\u56DE\u6D4B"] }),
        children: (_jsxs(Card, { title: "\u7B56\u7565\u56DE\u6D4B", style: { margin: '2px' }, children: [_jsx(Alert, { message: "\u56DE\u6D4B\u8BF4\u660E", description: "\u9009\u62E9\u56DE\u6D4B\u5468\u671F\u548C\u53C2\u6570\uFF0C\u7CFB\u7EDF\u5C06\u57FA\u4E8E\u5386\u53F2\u6570\u636E\u6A21\u62DF\u7B56\u7565\u8868\u73B0\u3002\u56DE\u6D4B\u7ED3\u679C\u4EC5\u4F9B\u53C2\u8003\uFF0C\u4E0D\u4EE3\u8868\u672A\u6765\u6536\u76CA\u3002", type: "info", showIcon: true, style: { marginBottom: '2px' } }), _jsxs(Form, { layout: "vertical", size: "small", children: [_jsxs(Row, { gutter: [2, 2], children: [_jsx(Col, { xs: 24, sm: 8, children: _jsx(Form.Item, { label: "\u9009\u62E9\u7B56\u7565", children: _jsx(Select, { placeholder: "\u8BF7\u9009\u62E9\u7B56\u7565", style: { width: '100%' }, children: strategies.map(s => (_jsx(Option, { value: s.id, children: s.name }, s.id))) }) }) }), _jsx(Col, { xs: 24, sm: 8, children: _jsx(Form.Item, { label: "\u56DE\u6D4B\u5468\u671F", children: _jsxs(Select, { defaultValue: "90", style: { width: '100%' }, children: [_jsx(Option, { value: "30", children: "\u6700\u8FD130\u5929" }), _jsx(Option, { value: "90", children: "\u6700\u8FD190\u5929" }), _jsx(Option, { value: "180", children: "\u6700\u8FD1180\u5929" }), _jsx(Option, { value: "365", children: "\u6700\u8FD11\u5E74" }), _jsx(Option, { value: "730", children: "\u6700\u8FD12\u5E74" })] }) }) }), _jsx(Col, { xs: 24, sm: 8, children: _jsx(Form.Item, { label: "\u521D\u59CB\u8D44\u91D1", children: _jsx(InputNumber, { min: 10000, defaultValue: 100000, addonAfter: "\u5143", style: { width: '100%' } }) }) })] }), _jsxs(Row, { gutter: [2, 2], children: [_jsx(Col, { xs: 24, sm: 8, children: _jsx(Form.Item, { label: "\u56DE\u6D4B\u7C7B\u578B", children: _jsxs(Select, { defaultValue: "normal", style: { width: '100%' }, children: [_jsx(Option, { value: "normal", children: "\u666E\u901A\u56DE\u6D4B" }), _jsx(Option, { value: "monte_carlo", children: "\u8499\u7279\u5361\u6D1B\u6A21\u62DF" }), _jsx(Option, { value: "walk_forward", children: "\u6EDA\u52A8\u56DE\u6D4B" })] }) }) }), _jsx(Col, { xs: 24, sm: 8, children: _jsx(Form.Item, { label: "\u4EA4\u6613\u6210\u672C", children: _jsx(InputNumber, { min: 0, max: 1, defaultValue: 0.001, addonAfter: "%", style: { width: '100%' } }) }) }), _jsx(Col, { xs: 24, sm: 8, children: _jsx(Form.Item, { label: "AI\u4F18\u5316\u56DE\u6D4B", valuePropName: "checked", children: _jsx(Switch, { checkedChildren: "\u5F00\u542F", unCheckedChildren: "\u5173\u95ED", defaultChecked: true }) }) })] }), _jsx(Form.Item, { children: _jsxs(Space, { children: [_jsx(Button, { type: "primary", icon: _jsx(PlayCircleOutlined, {}), children: "\u5F00\u59CB\u56DE\u6D4B" }), _jsx(Button, { icon: _jsx(ReloadOutlined, {}), children: "\u91CD\u7F6E\u53C2\u6570" })] }) })] })] }))
    };
    // 策略优化模态框
    const optimizationModal = (_jsx(Modal, { title: "AI\u7B56\u7565\u4F18\u5316", open: showOptimizationModal, onCancel: () => setShowOptimizationModal(false), footer: [
            _jsx(Button, { onClick: () => setShowOptimizationModal(false), children: "\u53D6\u6D88" }, "cancel"),
            _jsx(Button, { type: "primary", onClick: () => setShowOptimizationModal(false), children: "\u786E\u5B9A" }, "confirm")
        ], children: selectedStrategy && (_jsxs("div", { children: [_jsxs("div", { style: { marginBottom: '16px' }, children: [_jsx("h3", { children: selectedStrategy.name }), _jsx("p", { style: { color: '#666' }, children: selectedStrategy.description })] }), _jsxs("div", { style: { marginBottom: '16px' }, children: [_jsx("h4", { children: "\u4F18\u5316\u53C2\u6570" }), _jsxs(Form, { layout: "vertical", size: "small", children: [_jsx(Row, { gutter: [2, 2], children: _jsx(Col, { xs: 24, children: _jsx(Form.Item, { label: "\u4F18\u5316\u76EE\u6807", children: _jsxs(Select, { defaultValue: "return", style: { width: '100%' }, children: [_jsx(Option, { value: "return", children: "\u6700\u5927\u5316\u6536\u76CA\u7387" }), _jsx(Option, { value: "sharpe", children: "\u6700\u5927\u5316\u590F\u666E\u6BD4\u7387" }), _jsx(Option, { value: "win_rate", children: "\u6700\u5927\u5316\u80DC\u7387" }), _jsx(Option, { value: "drawdown", children: "\u6700\u5C0F\u5316\u6700\u5927\u56DE\u64A4" })] }) }) }) }), _jsx(Row, { gutter: [2, 2], children: _jsx(Col, { xs: 24, children: _jsx(Form.Item, { label: "\u4F18\u5316\u7B97\u6CD5", children: _jsxs(Select, { defaultValue: "genetic", style: { width: '100%' }, children: [_jsx(Option, { value: "genetic", children: "\u9057\u4F20\u7B97\u6CD5" }), _jsx(Option, { value: "grid", children: "\u7F51\u683C\u641C\u7D22" }), _jsx(Option, { value: "bayesian", children: "\u8D1D\u53F6\u65AF\u4F18\u5316" })] }) }) }) }), _jsx(Row, { gutter: [2, 2], children: _jsx(Col, { xs: 24, children: _jsx(Form.Item, { label: "\u4F18\u5316\u8FED\u4EE3\u6B21\u6570", children: _jsx(InputNumber, { min: 10, max: 1000, defaultValue: 100, style: { width: '100%' } }) }) }) })] })] }), optimizingId === selectedStrategy.id && (_jsxs("div", { style: { textAlign: 'center', padding: '20px' }, children: [_jsx(Alert, { message: "AI\u6B63\u5728\u4F18\u5316\u7B56\u7565\u53C2\u6570...", type: "info", showIcon: true }), _jsxs("div", { style: { marginTop: '20px' }, children: [_jsx(Progress, { percent: 65, status: "active" }), _jsx("p", { style: { marginTop: '8px', color: '#666' }, children: "\u9884\u8BA1\u5B8C\u6210\u65F6\u95F4\uFF1A30\u79D2" })] })] }))] })) }));
    return (_jsxs("div", { className: "ai-strategy-page", children: [_jsx(Tabs, { defaultActiveKey: "1", size: "small", items: [strategyListTab, strategyConfigTab, backtestTab] }), optimizationModal] }));
};
export default AIStrategy;
