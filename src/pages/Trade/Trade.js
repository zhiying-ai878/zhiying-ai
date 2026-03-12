import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Card, Form, Input, Select, Button, Table, Tabs, Switch, message, Modal, Space, Badge, Row, Col, Statistic } from 'antd';
import { ShoppingCartOutlined, ShoppingOutlined, SyncOutlined, SaveOutlined, SearchOutlined, EyeOutlined } from '@ant-design/icons';
import './Trade.css';
const { Option } = Select;
const Trade = () => {
    const [form] = Form.useForm();
    const [tradeType, setTradeType] = useState('buy');
    const [autoTrade, setAutoTrade] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedTrade, setSelectedTrade] = useState(null);
    const [showTradeDetail, setShowTradeDetail] = useState(false);
    const [tradeHistory] = useState([
        { key: '1', time: '2026-02-25 14:30:25', code: '000001', name: '平安银行', type: 'buy', price: 17.50, volume: 1000, amount: 17500 },
        { key: '2', time: '2026-02-25 10:15:42', code: '600519', name: '贵州茅台', type: 'sell', price: 1850.00, volume: 10, amount: 18500 },
        { key: '3', time: '2026-02-24 15:00:00', code: '000858', name: '五粮液', type: 'buy', price: 165.20, volume: 200, amount: 33040 },
    ]);
    const [aiStrategies] = useState([
        { key: '1', name: '趋势跟踪策略', status: 'running', profit: 12.5 },
        { key: '2', name: '均值回归策略', status: 'stopped', profit: -2.3 },
        { key: '3', name: '动量策略', status: 'running', profit: 8.7 },
    ]);
    const onFinish = async (values) => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            message.success(`${tradeType === 'buy' ? '买入' : '卖出'}成功！`);
            form.resetFields();
        }
        catch (error) {
            message.error('交易失败，请重试');
        }
        finally {
            setLoading(false);
        }
    };
    const handleAutoTradeChange = (checked) => {
        setAutoTrade(checked);
        message.info(checked ? 'AI自动交易已开启' : 'AI自动交易已关闭');
    };
    const tradeColumns = [
        { title: '时间', dataIndex: 'time', key: 'time' },
        { title: '代码', dataIndex: 'code', key: 'code' },
        { title: '名称', dataIndex: 'name', key: 'name' },
        {
            title: '类型',
            dataIndex: 'type',
            key: 'type',
            render: (type) => (_jsx("span", { style: { color: type === 'buy' ? '#ff4d4f' : '#52c41a', fontWeight: 'bold' }, children: type === 'buy' ? '买入' : '卖出' }))
        },
        { title: '价格', dataIndex: 'price', key: 'price', render: (price) => price.toFixed(2) },
        { title: '数量', dataIndex: 'volume', key: 'volume' },
        { title: '金额', dataIndex: 'amount', key: 'amount', render: (amount) => amount.toFixed(2) },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (_jsx(Button, { type: "text", icon: _jsx(EyeOutlined, {}), onClick: () => { setSelectedTrade(record); setShowTradeDetail(true); }, size: "small", children: "\u8BE6\u60C5" }))
        }
    ];
    const strategyColumns = [
        { title: '策略名称', dataIndex: 'name', key: 'name' },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (_jsx(Badge, { status: status === 'running' ? 'success' : 'default', text: status === 'running' ? '运行中' : '已停止' }))
        },
        {
            title: '收益率',
            dataIndex: 'profit',
            key: 'profit',
            render: (profit) => (_jsxs("span", { style: { color: profit >= 0 ? '#ff4d4f' : '#52c41a', fontWeight: 'bold' }, children: [profit >= 0 ? '+' : '', profit.toFixed(1), "%"] }))
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (_jsx(Button, { type: record.status === 'running' ? 'default' : 'primary', size: "small", children: record.status === 'running' ? '停止' : '启动' }))
        }
    ];
    const tradeHistoryTab = {
        key: '1',
        label: '交易历史',
        children: (_jsxs(Card, { size: "small", style: { margin: '2px' }, children: [_jsxs(Space, { size: "small", style: { marginBottom: '2px' }, children: [_jsx(Input, { placeholder: "\u641C\u7D22\u80A1\u7968\u4EE3\u7801\u6216\u540D\u79F0", prefix: _jsx(SearchOutlined, {}), style: { width: 200 }, size: "small" }), _jsx(Select, { defaultValue: "all", style: { width: 100 }, size: "small", options: [{ value: 'all', label: '全部类型' }, { value: 'buy', label: '买入' }, { value: 'sell', label: '卖出' }] }), _jsx(Button, { type: "default", icon: _jsx(SyncOutlined, {}), size: "small", onClick: () => message.info('刷新成功'), children: "\u5237\u65B0" })] }), _jsx(Table, { columns: tradeColumns, dataSource: tradeHistory, pagination: { pageSize: 10, size: 'small' }, rowKey: "key", size: "small" })] }))
    };
    const aiStrategyTab = {
        key: '2',
        label: 'AI策略',
        children: (_jsxs(Card, { size: "small", style: { margin: '2px' }, children: [_jsx(Table, { columns: strategyColumns, dataSource: aiStrategies, pagination: false, rowKey: "key", size: "small" }), _jsxs("div", { style: { marginTop: '2px', display: 'flex', gap: '8px' }, children: [_jsx(Button, { type: "primary", icon: _jsx(SyncOutlined, {}), size: "small", onClick: () => message.info('策略同步成功'), children: "\u540C\u6B65\u7B56\u7565" }), _jsx(Button, { size: "small", onClick: () => message.info('添加策略功能开发中'), children: "\u6DFB\u52A0\u7B56\u7565" })] })] }))
    };
    const tradeSettingsTab = {
        key: '3',
        label: '交易设置',
        children: (_jsx(Card, { size: "small", style: { margin: '2px' }, children: _jsxs(Form, { layout: "vertical", size: "small", children: [_jsxs(Row, { gutter: [2, 2], children: [_jsx(Col, { xs: 24, sm: 12, children: _jsx(Form.Item, { label: "\u6BCF\u7B14\u6700\u5927\u4EA4\u6613\u91D1\u989D", children: _jsx(Input, { type: "number", placeholder: "\u8BF7\u8F93\u5165\u6BCF\u7B14\u6700\u5927\u4EA4\u6613\u91D1\u989D", size: "small" }) }) }), _jsx(Col, { xs: 24, sm: 12, children: _jsx(Form.Item, { label: "\u6B62\u635F\u6BD4\u4F8B", children: _jsx(Input, { type: "number", placeholder: "\u8BF7\u8F93\u5165\u6B62\u635F\u6BD4\u4F8B(%)", size: "small" }) }) })] }), _jsxs(Row, { gutter: [2, 2], children: [_jsx(Col, { xs: 24, sm: 12, children: _jsx(Form.Item, { label: "\u6B62\u76C8\u6BD4\u4F8B", children: _jsx(Input, { type: "number", placeholder: "\u8BF7\u8F93\u5165\u6B62\u76C8\u6BD4\u4F8B(%)", size: "small" }) }) }), _jsx(Col, { xs: 24, sm: 12, children: _jsx(Form.Item, { label: "\u4EA4\u6613\u9891\u7387", children: _jsxs(Select, { size: "small", placeholder: "\u8BF7\u9009\u62E9\u4EA4\u6613\u9891\u7387", children: [_jsx(Option, { value: "high", children: "\u9AD8\u9891\u4EA4\u6613" }), _jsx(Option, { value: "medium", children: "\u4E2D\u9891\u4EA4\u6613" }), _jsx(Option, { value: "low", children: "\u4F4E\u9891\u4EA4\u6613" })] }) }) })] }), _jsx(Form.Item, { style: { marginBottom: 0 }, children: _jsxs(Space, { children: [_jsx(Button, { type: "primary", size: "small", icon: _jsx(SaveOutlined, {}), children: "\u4FDD\u5B58\u8BBE\u7F6E" }), _jsx(Button, { size: "small", icon: _jsx(SyncOutlined, {}), children: "\u52A0\u8F7D\u8BBE\u7F6E" })] }) })] }) }))
    };
    return (_jsxs("div", { className: "trade", style: { padding: '0' }, children: [_jsxs("div", { className: "trade-header", style: { marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsx("h2", { style: { margin: 0 }, children: "\u4EA4\u6613\u7BA1\u7406" }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '12px' }, children: [_jsx("span", { children: "AI\u81EA\u52A8\u4EA4\u6613" }), _jsx(Switch, { checked: autoTrade, onChange: handleAutoTradeChange, checkedChildren: "\u5F00\u542F", unCheckedChildren: "\u5173\u95ED" })] })] }), _jsxs(Row, { gutter: [2, 2], style: { marginBottom: '2px' }, children: [_jsx(Col, { xs: 24, lg: 8, children: _jsx(Card, { size: "small", style: { margin: '2px' }, children: _jsxs(Form, { form: form, onFinish: onFinish, layout: "vertical", children: [_jsxs("div", { style: { display: 'flex', gap: '8px', marginBottom: '2px' }, children: [_jsx(Button, { type: tradeType === 'buy' ? 'primary' : 'default', icon: _jsx(ShoppingCartOutlined, {}), onClick: () => setTradeType('buy'), block: true, children: "\u4E70\u5165" }), _jsx(Button, { type: tradeType === 'sell' ? 'primary' : 'default', icon: _jsx(ShoppingOutlined, {}), onClick: () => setTradeType('sell'), block: true, children: "\u5356\u51FA" })] }), _jsx(Form.Item, { name: "stockCode", label: "\u80A1\u7968\u4EE3\u7801", rules: [{ required: true, message: '请输入股票代码' }], children: _jsx(Input, { placeholder: "\u8BF7\u8F93\u5165\u80A1\u7968\u4EE3\u7801", size: "small" }) }), _jsx(Form.Item, { name: "stockName", label: "\u80A1\u7968\u540D\u79F0", children: _jsx(Input, { placeholder: "\u8BF7\u8F93\u5165\u80A1\u7968\u540D\u79F0", size: "small" }) }), _jsx(Form.Item, { name: "price", label: "\u4EA4\u6613\u4EF7\u683C", rules: [{ required: true, message: '请输入交易价格' }], children: _jsx(Input, { type: "number", placeholder: "\u8BF7\u8F93\u5165\u4EA4\u6613\u4EF7\u683C", size: "small" }) }), _jsx(Form.Item, { name: "volume", label: "\u4EA4\u6613\u6570\u91CF", rules: [{ required: true, message: '请输入交易数量' }], children: _jsx(Input, { type: "number", placeholder: "\u8BF7\u8F93\u5165\u4EA4\u6613\u6570\u91CF", size: "small" }) }), _jsx(Form.Item, { style: { marginBottom: 0 }, children: _jsx(Button, { type: "primary", htmlType: "submit", block: true, size: "small", loading: loading, children: tradeType === 'buy' ? '买入' : '卖出' }) })] }) }) }), _jsx(Col, { xs: 24, lg: 16, children: _jsx(Card, { size: "small", title: "\u4EA4\u6613\u7EDF\u8BA1", style: { margin: '2px' }, children: _jsxs(Row, { gutter: [2, 2], children: [_jsx(Col, { xs: 12, sm: 6, children: _jsx(Statistic, { title: "\u4ECA\u65E5\u4EA4\u6613", value: 12, valueStyle: { color: '#1890ff', fontSize: '20px' } }) }), _jsx(Col, { xs: 12, sm: 6, children: _jsx(Statistic, { title: "\u76C8\u5229\u6B21\u6570", value: 8, valueStyle: { color: '#ff4d4f', fontSize: '20px' } }) }), _jsx(Col, { xs: 12, sm: 6, children: _jsx(Statistic, { title: "\u4E8F\u635F\u6B21\u6570", value: 4, valueStyle: { color: '#52c41a', fontSize: '20px' } }) }), _jsx(Col, { xs: 12, sm: 6, children: _jsx(Statistic, { title: "\u76C8\u4E8F\u6BD4", value: 2.5, suffix: ":1", valueStyle: { color: '#722ed1', fontSize: '20px' } }) })] }) }) })] }), _jsx(Tabs, { defaultActiveKey: "1", size: "small", items: [tradeHistoryTab, aiStrategyTab, tradeSettingsTab] }), _jsx(Modal, { title: "\u4EA4\u6613\u8BE6\u60C5", open: showTradeDetail, onCancel: () => setShowTradeDetail(false), footer: [_jsx(Button, { onClick: () => setShowTradeDetail(false), size: "small", children: "\u5173\u95ED" }, "close")], width: 500, children: selectedTrade && (_jsx("div", { children: _jsxs(Row, { gutter: [2, 2], children: [_jsxs(Col, { span: 12, children: [_jsxs("p", { children: [_jsx("strong", { children: "\u4EA4\u6613\u65F6\u95F4:" }), " ", selectedTrade.time] }), _jsxs("p", { children: [_jsx("strong", { children: "\u80A1\u7968\u4EE3\u7801:" }), " ", selectedTrade.code] }), _jsxs("p", { children: [_jsx("strong", { children: "\u80A1\u7968\u540D\u79F0:" }), " ", selectedTrade.name] }), _jsxs("p", { children: [_jsx("strong", { children: "\u4EA4\u6613\u7C7B\u578B:" }), " ", _jsx(Badge, { status: selectedTrade.type === 'buy' ? 'success' : 'error', text: selectedTrade.type === 'buy' ? '买入' : '卖出' })] })] }), _jsxs(Col, { span: 12, children: [_jsxs("p", { children: [_jsx("strong", { children: "\u4EA4\u6613\u4EF7\u683C:" }), " \u00A5", selectedTrade.price.toFixed(2)] }), _jsxs("p", { children: [_jsx("strong", { children: "\u4EA4\u6613\u6570\u91CF:" }), " ", selectedTrade.volume, "\u80A1"] }), _jsxs("p", { children: [_jsx("strong", { children: "\u4EA4\u6613\u91D1\u989D:" }), " \u00A5", selectedTrade.amount.toFixed(2)] }), _jsxs("p", { children: [_jsx("strong", { children: "\u4EA4\u6613\u72B6\u6001:" }), " ", _jsx(Badge, { status: "success", text: "\u5DF2\u5B8C\u6210" })] })] })] }) })) })] }));
};
export default Trade;
