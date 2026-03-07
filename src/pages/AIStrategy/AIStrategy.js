import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Card, Tabs, Row, Col, Statistic, Button, List, Tag, Space, Progress, Select, Switch, Form, InputNumber, message, Alert } from 'antd';
import { RobotOutlined, PlayCircleOutlined, PauseCircleOutlined, ReloadOutlined, BarChartOutlined, HistoryOutlined, SettingOutlined } from '@ant-design/icons';
const { Option } = Select;
const AIStrategy = () => {
    const [strategies] = useState([
        { id: '1', name: '趋势跟踪策略', type: 'trend', status: 'running', winRate: 68, totalReturn: 32.5, maxDrawdown: 12.3, trades: 156, description: '基于均线突破和MACD金叉的趋势跟踪策略，适合强势市场' },
        { id: '2', name: '均值回归策略', type: 'mean', status: 'stopped', winRate: 62, totalReturn: 18.2, maxDrawdown: 8.5, trades: 203, description: '基于布林带和RSI超买超卖的均值回归策略，适合震荡市场' },
        { id: '3', name: '动量策略', type: 'momentum', status: 'testing', winRate: 55, totalReturn: 25.8, maxDrawdown: 18.6, trades: 89, description: '基于价格动量和成交量放大的动量策略，捕捉短期爆发机会' }
    ]);
    const getTypeTag = (type) => {
        const typeMap = {
            trend: { color: 'blue', text: '趋势跟踪' },
            mean: { color: 'purple', text: '均值回归' },
            momentum: { color: 'orange', text: '动量策略' },
            value: { color: 'green', text: '价值投资' }
        };
        return typeMap[type] || typeMap.trend;
    };
    const getStatusTag = (status) => {
        const statusMap = {
            running: { color: 'green', text: '运行中', icon: _jsx(PlayCircleOutlined, {}) },
            stopped: { color: 'default', text: '已停止', icon: _jsx(PauseCircleOutlined, {}) },
            testing: { color: 'gold', text: '回测中', icon: _jsx(ReloadOutlined, {}) }
        };
        return statusMap[status] || statusMap.stopped;
    };
    const toggleStrategyStatus = (id) => {
        message.success('策略状态已更新');
    };
    const strategyListTab = {
        key: '1',
        label: _jsxs("span", { children: [_jsx(RobotOutlined, {}), "\u7B56\u7565\u5217\u8868"] }),
        children: (_jsxs("div", { children: [_jsxs(Row, { gutter: [2, 2], style: { marginBottom: '2px' }, children: [_jsx(Col, { xs: 12, sm: 6, children: _jsx(Card, { size: "small", style: { margin: '2px' }, children: _jsx(Statistic, { title: "\u8FD0\u884C\u4E2D\u7B56\u7565", value: strategies.filter(s => s.status === 'running').length, valueStyle: { color: '#3f8600' }, prefix: _jsx(PlayCircleOutlined, {}) }) }) }), _jsx(Col, { xs: 12, sm: 6, children: _jsx(Card, { size: "small", style: { margin: '2px' }, children: _jsx(Statistic, { title: "\u603B\u7B56\u7565\u6570", value: strategies.length, prefix: _jsx(RobotOutlined, {}) }) }) }), _jsx(Col, { xs: 12, sm: 6, children: _jsx(Card, { size: "small", style: { margin: '2px' }, children: _jsx(Statistic, { title: "\u5E73\u5747\u80DC\u7387", value: (strategies.reduce((sum, s) => sum + s.winRate, 0) / strategies.length).toFixed(1), suffix: "%", valueStyle: { color: '#1890ff' } }) }) }), _jsx(Col, { xs: 12, sm: 6, children: _jsx(Card, { size: "small", style: { margin: '2px' }, children: _jsx(Statistic, { title: "\u603B\u6536\u76CA\u7387", value: strategies.reduce((sum, s) => sum + s.totalReturn, 0).toFixed(1), suffix: "%", valueStyle: { color: '#faad14' } }) }) })] }), _jsx(List, { dataSource: strategies, renderItem: (item) => {
                        const typeTag = getTypeTag(item.type);
                        const statusTag = getStatusTag(item.status);
                        return (_jsx(List.Item, { children: _jsx(Card, { size: "small", style: { width: '100%', margin: '2px' }, children: _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }, children: [_jsxs("div", { style: { flex: 1 }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }, children: [_jsx("span", { style: { fontWeight: 'bold', fontSize: '16px' }, children: item.name }), _jsx(Tag, { color: typeTag.color, children: typeTag.text }), _jsx(Tag, { color: statusTag.color, icon: statusTag.icon, children: statusTag.text })] }), _jsxs(Row, { gutter: [16, 8], style: { marginBottom: '8px' }, children: [_jsx(Col, { xs: 12, sm: 6, children: _jsxs("div", { children: [_jsx("span", { style: { color: '#666' }, children: "\u80DC\u7387\uFF1A" }), _jsx(Progress, { percent: item.winRate, size: "small", style: { width: '80px', display: 'inline-block', verticalAlign: 'middle' } })] }) }), _jsx(Col, { xs: 12, sm: 6, children: _jsxs("div", { children: [_jsx("span", { style: { color: '#666' }, children: "\u6536\u76CA\u7387\uFF1A" }), _jsxs("span", { style: { color: item.totalReturn >= 0 ? '#3f8600' : '#cf1322', fontWeight: 'bold' }, children: [item.totalReturn >= 0 ? '+' : '', item.totalReturn, "%"] })] }) }), _jsx(Col, { xs: 12, sm: 6, children: _jsxs("div", { children: [_jsx("span", { style: { color: '#666' }, children: "\u6700\u5927\u56DE\u64A4\uFF1A" }), _jsxs("span", { style: { color: '#cf1322', fontWeight: 'bold' }, children: ["-", item.maxDrawdown, "%"] })] }) }), _jsx(Col, { xs: 12, sm: 6, children: _jsxs("div", { children: [_jsx("span", { style: { color: '#666' }, children: "\u4EA4\u6613\u6B21\u6570\uFF1A" }), _jsx("span", { style: { fontWeight: 'bold' }, children: item.trades })] }) })] }), _jsx("div", { style: { fontSize: '12px', color: '#666' }, children: item.description })] }), _jsxs(Space, { direction: "vertical", style: { marginLeft: '16px' }, children: [_jsx(Button, { type: item.status === 'running' ? 'default' : 'primary', size: "small", icon: item.status === 'running' ? _jsx(PauseCircleOutlined, {}) : _jsx(PlayCircleOutlined, {}), onClick: () => toggleStrategyStatus(item.id), children: item.status === 'running' ? '停止' : '启动' }), _jsx(Button, { size: "small", icon: _jsx(BarChartOutlined, {}), children: "\u56DE\u6D4B" })] })] }) }) }));
                    } })] }))
    };
    const strategyConfigTab = {
        key: '2',
        label: _jsxs("span", { children: [_jsx(SettingOutlined, {}), "\u7B56\u7565\u914D\u7F6E"] }),
        children: (_jsx(Card, { title: "AI\u7B56\u7565\u914D\u7F6E", style: { margin: '2px' }, children: _jsxs(Form, { layout: "vertical", size: "small", children: [_jsxs(Row, { gutter: [2, 2], children: [_jsx(Col, { xs: 24, sm: 12, children: _jsx(Form.Item, { label: "\u9ED8\u8BA4\u7B56\u7565", children: _jsxs(Select, { defaultValue: "trend", style: { width: '100%' }, children: [_jsx(Option, { value: "trend", children: "\u8D8B\u52BF\u8DDF\u8E2A\u7B56\u7565" }), _jsx(Option, { value: "mean", children: "\u5747\u503C\u56DE\u5F52\u7B56\u7565" }), _jsx(Option, { value: "momentum", children: "\u52A8\u91CF\u7B56\u7565" }), _jsx(Option, { value: "value", children: "\u4EF7\u503C\u6295\u8D44\u7B56\u7565" })] }) }) }), _jsx(Col, { xs: 24, sm: 12, children: _jsx(Form.Item, { label: "\u98CE\u9669\u7B49\u7EA7", children: _jsxs(Select, { defaultValue: "medium", style: { width: '100%' }, children: [_jsx(Option, { value: "low", children: "\u4F4E\u98CE\u9669" }), _jsx(Option, { value: "medium", children: "\u4E2D\u98CE\u9669" }), _jsx(Option, { value: "high", children: "\u9AD8\u98CE\u9669" })] }) }) })] }), _jsxs(Row, { gutter: [2, 2], children: [_jsx(Col, { xs: 24, sm: 12, children: _jsx(Form.Item, { label: "\u5355\u80A1\u6700\u5927\u4ED3\u4F4D", children: _jsx(InputNumber, { min: 5, max: 50, defaultValue: 20, addonAfter: "%", style: { width: '100%' } }) }) }), _jsx(Col, { xs: 24, sm: 12, children: _jsx(Form.Item, { label: "\u6B62\u635F\u6BD4\u4F8B", children: _jsx(InputNumber, { min: 1, max: 20, defaultValue: 8, addonAfter: "%", style: { width: '100%' } }) }) })] }), _jsxs(Row, { gutter: [2, 2], children: [_jsx(Col, { xs: 24, sm: 12, children: _jsx(Form.Item, { label: "\u81EA\u52A8\u8C03\u4ED3", valuePropName: "checked", children: _jsx(Switch, { checkedChildren: "\u5F00\u542F", unCheckedChildren: "\u5173\u95ED" }) }) }), _jsx(Col, { xs: 24, sm: 12, children: _jsx(Form.Item, { label: "AI\u4F18\u5316", valuePropName: "checked", children: _jsx(Switch, { checkedChildren: "\u5F00\u542F", unCheckedChildren: "\u5173\u95ED", defaultChecked: true }) }) })] }), _jsx(Form.Item, { children: _jsxs(Space, { children: [_jsx(Button, { type: "primary", children: "\u4FDD\u5B58\u914D\u7F6E" }), _jsx(Button, { children: "\u91CD\u7F6E\u9ED8\u8BA4" })] }) })] }) }))
    };
    const backtestTab = {
        key: '3',
        label: _jsxs("span", { children: [_jsx(HistoryOutlined, {}), "\u7B56\u7565\u56DE\u6D4B"] }),
        children: (_jsxs(Card, { title: "\u7B56\u7565\u56DE\u6D4B", style: { margin: '2px' }, children: [_jsx(Alert, { message: "\u56DE\u6D4B\u8BF4\u660E", description: "\u9009\u62E9\u56DE\u6D4B\u5468\u671F\u548C\u53C2\u6570\uFF0C\u7CFB\u7EDF\u5C06\u57FA\u4E8E\u5386\u53F2\u6570\u636E\u6A21\u62DF\u7B56\u7565\u8868\u73B0\u3002\u56DE\u6D4B\u7ED3\u679C\u4EC5\u4F9B\u53C2\u8003\uFF0C\u4E0D\u4EE3\u8868\u672A\u6765\u6536\u76CA\u3002", type: "info", showIcon: true, style: { marginBottom: '2px' } }), _jsxs(Form, { layout: "vertical", size: "small", children: [_jsxs(Row, { gutter: [2, 2], children: [_jsx(Col, { xs: 24, sm: 8, children: _jsx(Form.Item, { label: "\u9009\u62E9\u7B56\u7565", children: _jsx(Select, { placeholder: "\u8BF7\u9009\u62E9\u7B56\u7565", style: { width: '100%' }, children: strategies.map(s => (_jsx(Option, { value: s.id, children: s.name }, s.id))) }) }) }), _jsx(Col, { xs: 24, sm: 8, children: _jsx(Form.Item, { label: "\u56DE\u6D4B\u5468\u671F", children: _jsxs(Select, { defaultValue: "90", style: { width: '100%' }, children: [_jsx(Option, { value: "30", children: "\u6700\u8FD130\u5929" }), _jsx(Option, { value: "90", children: "\u6700\u8FD190\u5929" }), _jsx(Option, { value: "180", children: "\u6700\u8FD1180\u5929" }), _jsx(Option, { value: "365", children: "\u6700\u8FD11\u5E74" })] }) }) }), _jsx(Col, { xs: 24, sm: 8, children: _jsx(Form.Item, { label: "\u521D\u59CB\u8D44\u91D1", children: _jsx(InputNumber, { min: 10000, defaultValue: 100000, addonAfter: "\u5143", style: { width: '100%' } }) }) })] }), _jsx(Form.Item, { children: _jsxs(Space, { children: [_jsx(Button, { type: "primary", icon: _jsx(PlayCircleOutlined, {}), children: "\u5F00\u59CB\u56DE\u6D4B" }), _jsx(Button, { icon: _jsx(ReloadOutlined, {}), children: "\u91CD\u7F6E\u53C2\u6570" })] }) })] })] }))
    };
    return _jsx("div", { className: "ai-strategy-page", children: _jsx(Tabs, { defaultActiveKey: "1", size: "small", items: [strategyListTab, strategyConfigTab, backtestTab] }) });
};
export default AIStrategy;
