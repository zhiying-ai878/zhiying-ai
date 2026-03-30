import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { Card, Tabs, List, Tag, Button, Space, Statistic, Row, Col, Progress, Switch, Form, Select, InputNumber, message, Alert, Badge, Modal } from 'antd';
import { NotificationOutlined, BellOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined, SettingOutlined, FilterOutlined, ReloadOutlined, DeleteOutlined } from '@ant-design/icons';
import * as SignalManager from '../../utils/optimizedSignalManager';
import { getMarketMonitor } from '../../utils/marketMonitorManager';
const { getOptimizedSignalManager } = SignalManager;
const { Option } = Select;
const Signal = () => {
    const [signals, setSignals] = useState([]);
    const [signalConfig, setSignalConfig] = useState(() => {
        // 从localStorage加载配置，如果没有则使用默认值
        const savedConfig = localStorage.getItem('signalConfig');
        return savedConfig ? JSON.parse(savedConfig) : { buyEnabled: true, sellEnabled: true, holdEnabled: false, minConfidence: 60, scanInterval: 5 };
    });
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [marketMonitorStatus, setMarketMonitorStatus] = useState(null);
    const signalManager = getOptimizedSignalManager();
    const signalTimerRef = useRef(null);
    const lastStockUsed = useRef('');
    const lastSignalTime = useRef(0);
    const marketStatusTimerRef = useRef(null);
    useEffect(() => {
        loadSignals();
        startSignalGeneration();
        startMarketStatusMonitor().catch(console.error);
        return () => {
            if (signalTimerRef.current) {
                clearInterval(signalTimerRef.current);
            }
            if (marketStatusTimerRef.current) {
                clearInterval(marketStatusTimerRef.current);
            }
        };
    }, []);
    const loadSignals = () => {
        const history = signalManager.getSignalHistory();
        // 按时间戳降序排序，最新的信号排在前面
        const sortedHistory = history.sort((a, b) => b.timestamp - a.timestamp);
        setSignals(sortedHistory);
        const unread = sortedHistory.filter((s) => !s.isRead).length;
        setUnreadCount(unread);
    };
    const startSignalGeneration = () => {
        generateRealTimeSignals();
        signalTimerRef.current = setInterval(() => {
            generateRealTimeSignals();
        }, 3000); // 优化刷新间隔为3秒，与市场监控保持一致
    };
    const generateRealTimeSignals = async () => {
        try {
            // 使用市场监控管理器获取全市场数据，而不是固定的股票列表
            const marketMonitor = getMarketMonitor();
            const marketStatus = await marketMonitor.getStatus();
            // 如果市场监控正在运行，等待其完成扫描
            if (marketStatus.isScanning) {
                console.log('市场监控正在扫描中...');
                loadSignals();
                return;
            }
            // 如果市场监控未运行，手动触发一次扫描
            await marketMonitor.performScan();
            // 重新加载信号
            loadSignals();
        }
        catch (error) {
            console.error('获取实时数据失败:', error);
        }
    };
    const getMarketMonitorStatus = async () => {
        const marketMonitor = getMarketMonitor();
        const status = await marketMonitor.getStatus();
        setMarketMonitorStatus(status);
    };
    const startMarketStatusMonitor = async () => {
        // 启动市场监控器
        const marketMonitor = getMarketMonitor();
        marketMonitor.startMonitoring();
        await getMarketMonitorStatus();
        marketStatusTimerRef.current = setInterval(async () => {
            await getMarketMonitorStatus();
        }, 3000); // 每3秒更新一次市场监控状态
    };
    const handleSignalAction = (signal, action) => {
        signalManager.markSignalAsRead(signal.id);
        if (action === 'execute') {
            message.success(`已执行${signal.type === 'buy' ? '买入' : '卖出'}操作：${signal.stockName}`);
        }
        else {
            message.info('已忽略该信号');
        }
        setUnreadCount(prev => Math.max(0, prev - 1));
        loadSignals();
    };
    const getSignalTag = (type) => {
        const tagMap = {
            buy: { color: 'green', text: '买入', icon: _jsx(CheckCircleOutlined, {}) },
            sell: { color: 'red', text: '卖出', icon: _jsx(CloseCircleOutlined, {}) },
            hold: { color: 'gold', text: '持有', icon: _jsx(ExclamationCircleOutlined, {}) }
        };
        return tagMap[type] || tagMap.hold;
    };
    // 添加删除历史信号的方法
    const handleClearHistory = () => {
        setModalVisible(true);
    };
    const confirmClearHistory = () => {
        signalManager.clearSignalHistory();
        setModalVisible(false);
        loadSignals();
        message.success('历史信号已清空');
    };
    const realtimeSignalsTab = {
        key: '1',
        label: _jsx("span", { children: _jsxs(Badge, { count: unreadCount, children: [_jsx(NotificationOutlined, {}), "\u5B9E\u65F6\u4FE1\u53F7"] }) }),
        children: (_jsxs("div", { children: [_jsxs(Row, { gutter: [2, 2], style: { marginBottom: '2px' }, children: [_jsx(Col, { xs: 12, sm: 6, children: _jsx(Card, { size: "small", style: { margin: '2px' }, children: _jsx(Statistic, { title: "\u4E70\u5165\u4FE1\u53F7", value: signals.filter(s => s.type === 'buy').length, valueStyle: { color: '#3f8600' }, prefix: _jsx(CheckCircleOutlined, {}) }) }) }), _jsx(Col, { xs: 12, sm: 6, children: _jsx(Card, { size: "small", style: { margin: '2px' }, children: _jsx(Statistic, { title: "\u5356\u51FA\u4FE1\u53F7", value: signals.filter(s => s.type === 'sell').length, valueStyle: { color: '#cf1322' }, prefix: _jsx(CloseCircleOutlined, {}) }) }) }), _jsx(Col, { xs: 12, sm: 6, children: _jsx(Card, { size: "small", style: { margin: '2px' }, children: _jsx(Statistic, { title: "\u672A\u8BFB\u4FE1\u53F7", value: unreadCount, valueStyle: { color: '#1890ff' }, prefix: _jsx(BellOutlined, {}) }) }) }), _jsx(Col, { xs: 12, sm: 6, children: _jsx(Card, { size: "small", style: { margin: '2px' }, children: _jsxs(Space, { direction: "vertical", style: { width: '100%' }, children: [_jsx(Button, { type: "primary", icon: _jsx(ReloadOutlined, {}), onClick: async () => {
                                                setLoading(true);
                                                await generateRealTimeSignals();
                                                setLoading(false);
                                            }, loading: loading, block: true, children: "\u5237\u65B0\u4FE1\u53F7" }), _jsx(Button, { danger: true, icon: _jsx(DeleteOutlined, {}), onClick: handleClearHistory, block: true, children: "\u6E05\u7A7A\u5386\u53F2" })] }) }) })] }), marketMonitorStatus && (_jsx(Card, { size: "small", style: { margin: '2px 2px 8px 2px' }, children: _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' }, children: [_jsx("span", { style: { color: '#666', fontSize: '12px' }, children: "\u5E02\u573A\u72B6\u6001:" }), _jsx(Tag, { color: marketMonitorStatus.marketStatus === 'open' ? 'green' : marketMonitorStatus.marketStatus === 'auction' ? 'orange' : 'default', children: marketMonitorStatus.marketStatus === 'open' ? '开盘' : marketMonitorStatus.marketStatus === 'auction' ? '集合竞价' : '收盘' })] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' }, children: [_jsx("span", { style: { color: '#666', fontSize: '12px' }, children: "\u76D1\u63A7\u80A1\u7968:" }), _jsx("span", { style: { fontWeight: 'bold' }, children: marketMonitorStatus.stockCount }), _jsx("span", { style: { color: '#666', fontSize: '12px' }, children: "\u53EA" })] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' }, children: [_jsx("span", { style: { color: '#666', fontSize: '12px' }, children: "\u626B\u63CF\u72B6\u6001:" }), _jsx(Tag, { color: marketMonitorStatus.isScanning ? 'blue' : marketMonitorStatus.scanStatus === 'completed' ? 'green' : 'default', children: marketMonitorStatus.isScanning ? '扫描中' : marketMonitorStatus.scanStatus === 'completed' ? '已完成' : '空闲' })] }), marketMonitorStatus.lastScanTime && (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' }, children: [_jsx("span", { style: { color: '#666', fontSize: '12px' }, children: "\u6700\u540E\u626B\u63CF:" }), _jsx("span", { style: { fontSize: '11px', color: '#999' }, children: new Date(marketMonitorStatus.lastScanTime).toLocaleTimeString('zh-CN') })] })), marketMonitorStatus.activeScans > 0 && (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' }, children: [_jsx("span", { style: { color: '#666', fontSize: '12px' }, children: "\u6D3B\u8DC3\u626B\u63CF:" }), _jsx("span", { style: { fontWeight: 'bold', color: '#1890ff' }, children: marketMonitorStatus.activeScans })] }))] }) })), signals.length === 0 ? (_jsx(Alert, { message: "\u6B63\u5728\u76D1\u63A7\u5E02\u573A...", description: "AI\u6B63\u5728\u5B9E\u65F6\u76D1\u63A7\u5E02\u573A\uFF0C\u4E00\u65E6\u53D1\u73B0\u4EA4\u6613\u673A\u4F1A\u5C06\u7ACB\u5373\u53D1\u51FA\u4FE1\u53F7\u3002\u8BF7\u7A0D\u5019...", type: "info", showIcon: true })) : (_jsx(List, { dataSource: signals, renderItem: (item) => {
                        const tagInfo = getSignalTag(item.type);
                        return (_jsx(List.Item, { children: _jsx(Card, { size: "small", style: { width: '100%', margin: '2px' }, children: _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }, children: [_jsxs("div", { style: { flex: 1 }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }, children: [_jsx("span", { style: { fontWeight: 'bold', fontSize: '16px' }, children: item.stockName }), _jsx("span", { style: { color: '#666' }, children: item.stockCode }), _jsx(Tag, { color: tagInfo.color, icon: tagInfo.icon, children: tagInfo.text }), !item.isRead && _jsx(Tag, { color: "blue", children: "\u65B0" })] }), _jsxs("div", { style: { display: 'flex', gap: '16px', marginBottom: '8px', flexWrap: 'wrap' }, children: [item.price && _jsxs("span", { children: ["\u4EF7\u683C\uFF1A", _jsx("strong", { children: item.price.toFixed(2) })] }), item.targetPrice && _jsxs("span", { children: ["\u76EE\u6807\uFF1A", _jsx("strong", { children: item.targetPrice.toFixed(2) })] }), item.buyPriceRange && (_jsxs("span", { children: ["\u4E70\u5165\u533A\u95F4\uFF1A", _jsxs("strong", { style: { color: '#3f8600' }, children: [item.buyPriceRange.lower.toFixed(2), "-", item.buyPriceRange.upper.toFixed(2)] })] })), item.sellPriceRange && (_jsxs("span", { children: ["\u5356\u51FA\u533A\u95F4\uFF1A", _jsxs("strong", { style: { color: '#cf1322' }, children: [item.sellPriceRange.lower.toFixed(2), "-", item.sellPriceRange.upper.toFixed(2)] })] })), _jsx("span", { children: "\u7F6E\u4FE1\u5EA6\uFF1A" }), _jsx(Progress, { percent: item.confidence, size: "small", style: { width: '80px' } }), _jsxs("span", { children: ["\u8BC4\u5206\uFF1A", _jsx("strong", { children: item.score.toFixed(2) })] }), item.mainForceFlow && (_jsxs("span", { children: ["\u4E3B\u529B\u8D44\u91D1\uFF1A", _jsxs("strong", { style: { color: item.mainForceFlow >= 0 ? '#3f8600' : '#cf1322' }, children: [(item.mainForceFlow / 100000000).toFixed(2), "\u4EBF"] })] }))] }), _jsx("div", { style: { fontSize: '12px', color: '#666', marginBottom: '4px' }, children: item.reason }), _jsxs("div", { style: { fontSize: '11px', color: '#999' }, children: [_jsx(ClockCircleOutlined, {}), " ", new Date(item.timestamp).toLocaleString('zh-CN')] })] }), !item.isRead && (_jsxs(Space, { direction: "vertical", children: [_jsx(Button, { type: "primary", size: "small", onClick: () => handleSignalAction(item, 'execute'), children: "\u6267\u884C" }), _jsx(Button, { size: "small", onClick: () => handleSignalAction(item, 'ignore'), children: "\u5FFD\u7565" })] }))] }) }) }));
                    } }))] }))
    };
    const signalHistoryTab = {
        key: '2',
        label: _jsxs("span", { children: [_jsx(ClockCircleOutlined, {}), "\u4FE1\u53F7\u5386\u53F2"] }),
        children: (_jsxs(Card, { style: { margin: '2px' }, children: [_jsx("div", { style: { display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }, children: _jsx(Button, { danger: true, icon: _jsx(DeleteOutlined, {}), onClick: handleClearHistory, children: "\u6E05\u7A7A\u5386\u53F2" }) }), signals.length === 0 ? (_jsx(Alert, { message: "\u6682\u65E0\u5386\u53F2\u4FE1\u53F7", description: "\u4FE1\u53F7\u5386\u53F2\u5C06\u5728\u6536\u5230\u65B0\u4FE1\u53F7\u540E\u81EA\u52A8\u8BB0\u5F55\u3002", type: "info", showIcon: true })) : (_jsx(List, { dataSource: signals, renderItem: (item) => {
                        const tagInfo = getSignalTag(item.type);
                        return (_jsx(List.Item, { children: _jsx("div", { style: { display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }, children: _jsxs("div", { style: { flex: 1 }, children: [_jsxs(Space, { children: [_jsx(Tag, { color: tagInfo.color, children: tagInfo.text }), _jsx("span", { style: { fontWeight: 'bold' }, children: item.stockName }), _jsx("span", { style: { color: '#666' }, children: item.stockCode }), item.isRead && _jsx(Tag, { color: "default", children: "\u5DF2\u8BFB" })] }), _jsxs("div", { style: { fontSize: '12px', color: '#666', marginTop: '4px' }, children: [_jsx(ClockCircleOutlined, {}), " ", new Date(item.timestamp).toLocaleString('zh-CN'), " | ", item.reason] }), _jsxs("div", { style: { fontSize: '11px', color: '#999', marginTop: '2px' }, children: ["\u7F6E\u4FE1\u5EA6: ", item.confidence.toFixed(2), "% | \u8BC4\u5206: ", item.score.toFixed(2), item.price && ` | 价格: ${item.price.toFixed(2)}`, item.targetPrice && ` | 目标: ${item.targetPrice.toFixed(2)}`] })] }) }) }));
                    } }))] }))
    };
    const signalConfigTab = {
        key: '3',
        label: _jsxs("span", { children: [_jsx(SettingOutlined, {}), "\u4FE1\u53F7\u914D\u7F6E"] }),
        children: (_jsx(Card, { title: "\u4FE1\u53F7\u63D0\u9192\u8BBE\u7F6E", style: { margin: '2px' }, children: _jsxs(Form, { layout: "vertical", size: "small", children: [_jsxs(Row, { gutter: [2, 2], children: [_jsx(Col, { xs: 24, sm: 8, children: _jsx(Form.Item, { label: "\u4E70\u5165\u4FE1\u53F7", children: _jsx(Switch, { checked: signalConfig.buyEnabled, checkedChildren: "\u5F00\u542F", unCheckedChildren: "\u5173\u95ED", onChange: (checked) => setSignalConfig((prev) => ({ ...prev, buyEnabled: checked })) }) }) }), _jsx(Col, { xs: 24, sm: 8, children: _jsx(Form.Item, { label: "\u5356\u51FA\u4FE1\u53F7", children: _jsx(Switch, { checked: signalConfig.sellEnabled, checkedChildren: "\u5F00\u542F", unCheckedChildren: "\u5173\u95ED", onChange: (checked) => setSignalConfig((prev) => ({ ...prev, sellEnabled: checked })) }) }) }), _jsx(Col, { xs: 24, sm: 8, children: _jsx(Form.Item, { label: "\u6301\u6709\u4FE1\u53F7", children: _jsx(Switch, { checked: signalConfig.holdEnabled, checkedChildren: "\u5F00\u542F", unCheckedChildren: "\u5173\u95ED", onChange: (checked) => setSignalConfig((prev) => ({ ...prev, holdEnabled: checked })) }) }) })] }), _jsxs(Row, { gutter: [2, 2], children: [_jsx(Col, { xs: 24, sm: 12, children: _jsx(Form.Item, { label: "\u6700\u4F4E\u7F6E\u4FE1\u5EA6", children: _jsx(InputNumber, { min: 50, max: 95, value: signalConfig.minConfidence, addonAfter: "%", style: { width: '100%' }, onChange: (value) => setSignalConfig((prev) => ({ ...prev, minConfidence: value || 60 })) }) }) }), _jsx(Col, { xs: 24, sm: 12, children: _jsx(Form.Item, { label: "\u626B\u63CF\u95F4\u9694", children: _jsxs(Select, { value: signalConfig.scanInterval, style: { width: '100%' }, onChange: (value) => setSignalConfig((prev) => ({ ...prev, scanInterval: value })), children: [_jsx(Option, { value: 1, children: "1\u79D2" }), _jsx(Option, { value: 5, children: "5\u79D2" }), _jsx(Option, { value: 10, children: "10\u79D2" }), _jsx(Option, { value: 30, children: "30\u79D2" }), _jsx(Option, { value: 60, children: "1\u5206\u949F" })] }) }) })] }), _jsx(Form.Item, { children: _jsxs(Space, { children: [_jsx(Button, { type: "primary", icon: _jsx(FilterOutlined, {}), onClick: () => {
                                        // 保存配置到localStorage
                                        localStorage.setItem('signalConfig', JSON.stringify(signalConfig));
                                        message.success('配置已保存');
                                    }, children: "\u5E94\u7528\u914D\u7F6E" }), _jsx(Button, { onClick: () => {
                                        const defaultConfig = { buyEnabled: true, sellEnabled: true, holdEnabled: false, minConfidence: 60, scanInterval: 5 };
                                        setSignalConfig(defaultConfig);
                                        localStorage.setItem('signalConfig', JSON.stringify(defaultConfig));
                                        message.success('已重置为默认配置');
                                    }, children: "\u91CD\u7F6E\u9ED8\u8BA4" })] }) })] }) }))
    };
    return (_jsxs("div", { className: "signal-page", children: [_jsx(Tabs, { defaultActiveKey: "1", size: "small", items: [realtimeSignalsTab, signalHistoryTab, signalConfigTab] }), _jsx(Modal, { title: "\u786E\u8BA4\u6E05\u7A7A\u5386\u53F2", open: modalVisible, onOk: confirmClearHistory, onCancel: () => setModalVisible(false), children: _jsx("p", { children: "\u786E\u5B9A\u8981\u6E05\u7A7A\u6240\u6709\u5386\u53F2\u4FE1\u53F7\u5417\uFF1F\u6B64\u64CD\u4F5C\u4E0D\u53EF\u6062\u590D\u3002" }) })] }));
};
export default Signal;
