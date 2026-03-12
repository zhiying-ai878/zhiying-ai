import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Card, Button, Input, Select, Form, Table, Tag, Space, message, Modal, Alert, Radio } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, PlayCircleOutlined, PauseCircleOutlined } from '@ant-design/icons';
import { backtestStrategy } from '../../utils/advancedAIAnalysis';
import { getStrategyExecutionEngine, startStrategyEngine, stopStrategyEngine, addStrategyToEngine, removeStrategyFromEngine } from '../../utils/strategyExecutionEngine';
import { getKLineData } from '../../utils/stockData';
import { calculateMA, calculateMACD, calculateRSI, calculateBollingerBands } from '../../utils/aiAnalysis';
const { Option } = Select;
const { TextArea } = Input;
const StrategyManager = () => {
    const [strategies, setStrategies] = useState([]);
    const [engineStatus, setEngineStatus] = useState('idle');
    const [executionHistory, setExecutionHistory] = useState([]);
    const [activeTrades, setActiveTrades] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentStrategy, setCurrentStrategy] = useState(null);
    const [form] = Form.useForm();
    const [backtestResult, setBacktestResult] = useState(null);
    const [isBacktesting, setIsBacktesting] = useState(false);
    const strategyEngine = getStrategyExecutionEngine();
    useEffect(() => {
        loadStrategies();
        updateEngineStatus();
    }, []);
    useEffect(() => {
        if (engineStatus === 'running') {
            const interval = setInterval(() => {
                updateExecutionHistory();
                updateActiveTrades();
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [engineStatus]);
    const loadStrategies = () => {
        setStrategies(strategyEngine.getStrategies());
    };
    const updateEngineStatus = () => {
        setEngineStatus(strategyEngine.getStatus());
    };
    const updateExecutionHistory = () => {
        setExecutionHistory(strategyEngine.getExecutionHistory());
    };
    const updateActiveTrades = () => {
        setActiveTrades(strategyEngine.getActiveTrades());
    };
    const handleAddStrategy = () => {
        setIsEditing(false);
        setCurrentStrategy(null);
        form.resetFields();
        setIsModalVisible(true);
    };
    const handleEditStrategy = (strategy) => {
        setIsEditing(true);
        setCurrentStrategy(strategy);
        form.setFieldsValue({
            name: strategy.name,
            description: strategy.description,
            indicators: strategy.indicators,
            riskLevel: strategy.riskLevel,
            parameters: JSON.stringify(strategy.parameters, null, 2),
            rules: strategy.rules
        });
        setIsModalVisible(true);
    };
    const handleDeleteStrategy = (strategyId) => {
        removeStrategyFromEngine(strategyId);
        loadStrategies();
        message.success('策略已删除');
    };
    const handleStartEngine = () => {
        startStrategyEngine();
        updateEngineStatus();
        message.success('策略执行引擎已启动');
    };
    const handleStopEngine = () => {
        stopStrategyEngine();
        updateEngineStatus();
        message.success('策略执行引擎已停止');
    };
    const handleBacktest = async () => {
        try {
            setIsBacktesting(true);
            // 获取测试数据
            const kLineData = await getKLineData('002594', 'day', 180);
            if (!kLineData || kLineData.length < 60) {
                message.error('获取测试数据失败');
                return;
            }
            // 计算技术指标
            const prices = kLineData.map(item => item.close);
            const volumes = kLineData.map(item => item.volume);
            const ma5 = calculateMA(prices, 5);
            const ma10 = calculateMA(prices, 10);
            const rsi = calculateRSI(prices, 14);
            const { macd } = calculateMACD(prices);
            const { upper, lower } = calculateBollingerBands(prices, 20, 2);
            // 准备回测数据
            const backtestData = {
                prices,
                volumes,
                ma5,
                ma10,
                rsi,
                macd,
                upperBand: upper,
                lowerBand: lower
            };
            // 从表单获取策略
            const values = await form.validateFields();
            const strategy = {
                id: currentStrategy?.id || Date.now().toString(),
                name: values.name,
                description: values.description,
                indicators: values.indicators,
                parameters: values.parameters ? JSON.parse(values.parameters) : {},
                rules: values.rules,
                riskLevel: values.riskLevel
            };
            // 执行回测
            const result = backtestStrategy(backtestData, strategy);
            setBacktestResult(result);
            message.success('回测完成');
        }
        catch (error) {
            message.error('回测失败: ' + error.message);
        }
        finally {
            setIsBacktesting(false);
        }
    };
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const strategy = {
                id: currentStrategy?.id || Date.now().toString(),
                name: values.name,
                description: values.description,
                indicators: values.indicators,
                parameters: values.parameters ? JSON.parse(values.parameters) : {},
                rules: values.rules,
                riskLevel: values.riskLevel
            };
            if (isEditing && currentStrategy) {
                // 更新策略
                removeStrategyFromEngine(currentStrategy.id);
                addStrategyToEngine(strategy);
                message.success('策略已更新');
            }
            else {
                // 添加新策略
                addStrategyToEngine(strategy);
                message.success('策略已添加');
            }
            loadStrategies();
            setIsModalVisible(false);
        }
        catch (error) {
            console.error('提交失败:', error);
        }
    };
    const columns = [
        {
            title: '策略名称',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: '描述',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
        },
        {
            title: '指标',
            dataIndex: 'indicators',
            key: 'indicators',
            render: (indicators) => (_jsx(Space, { wrap: true, children: indicators.map(indicator => (_jsx(Tag, { children: indicator }, indicator))) })),
        },
        {
            title: '风险等级',
            dataIndex: 'riskLevel',
            key: 'riskLevel',
            render: (riskLevel) => {
                const colorMap = {
                    low: 'green',
                    medium: 'blue',
                    high: 'red'
                };
                const textMap = {
                    low: '低风险',
                    medium: '中风险',
                    high: '高风险'
                };
                return _jsx(Tag, { color: colorMap[riskLevel], children: textMap[riskLevel] });
            },
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (_jsxs(Space, { size: "middle", children: [_jsx(Button, { type: "link", icon: _jsx(EditOutlined, {}), onClick: () => handleEditStrategy(record), children: "\u7F16\u8F91" }), _jsx(Button, { type: "link", danger: true, icon: _jsx(DeleteOutlined, {}), onClick: () => handleDeleteStrategy(record.id), children: "\u5220\u9664" })] })),
        },
    ];
    const historyColumns = [
        {
            title: '策略',
            dataIndex: 'strategyId',
            key: 'strategyId',
        },
        {
            title: '股票',
            dataIndex: 'stockCode',
            key: 'stockCode',
        },
        {
            title: '信号',
            dataIndex: 'signal',
            key: 'signal',
            render: (signal) => {
                const colorMap = {
                    buy: 'green',
                    sell: 'red',
                    hold: 'blue'
                };
                const textMap = {
                    buy: '买入',
                    sell: '卖出',
                    hold: '持有'
                };
                return _jsx(Tag, { color: colorMap[signal], children: textMap[signal] });
            },
        },
        {
            title: '价格',
            dataIndex: 'price',
            key: 'price',
            render: (price) => price.toFixed(2),
        },
        {
            title: '时间',
            dataIndex: 'timestamp',
            key: 'timestamp',
            render: (timestamp) => new Date(timestamp).toLocaleString(),
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                return _jsx(Tag, { color: status === 'success' ? 'green' : 'red', children: status === 'success' ? '成功' : '失败' });
            },
        },
    ];
    const tradeColumns = [
        {
            title: '股票',
            dataIndex: 'stockCode',
            key: 'stockCode',
        },
        {
            title: '类型',
            dataIndex: 'type',
            key: 'type',
            render: (type) => {
                return _jsx(Tag, { color: type === 'buy' ? 'green' : 'red', children: type === 'buy' ? '买入' : '卖出' });
            },
        },
        {
            title: '价格',
            dataIndex: 'price',
            key: 'price',
            render: (price) => price.toFixed(2),
        },
        {
            title: '数量',
            dataIndex: 'volume',
            key: 'volume',
        },
        {
            title: '时间',
            dataIndex: 'timestamp',
            key: 'timestamp',
            render: (timestamp) => new Date(timestamp).toLocaleString(),
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                return _jsx(Tag, { color: status === 'executed' ? 'green' : 'blue', children: status === 'executed' ? '已执行' : status === 'pending' ? '待执行' : '已取消' });
            },
        },
    ];
    return (_jsxs("div", { style: { padding: 0 }, children: [_jsxs("div", { style: { marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsx("h2", { style: { margin: 0 }, children: "\u7B56\u7565\u7BA1\u7406" }), _jsxs(Space, { children: [_jsx(Button, { type: engineStatus === 'running' ? 'default' : 'primary', icon: engineStatus === 'running' ? _jsx(PauseCircleOutlined, {}) : _jsx(PlayCircleOutlined, {}), onClick: engineStatus === 'running' ? handleStopEngine : handleStartEngine, disabled: engineStatus === 'error', children: engineStatus === 'running' ? '停止引擎' : '启动引擎' }), _jsx(Button, { type: "primary", icon: _jsx(PlusOutlined, {}), onClick: handleAddStrategy, children: "\u6DFB\u52A0\u7B56\u7565" })] })] }), _jsx(Alert, { message: `策略执行引擎状态: ${engineStatus === 'idle' ? '空闲' : engineStatus === 'running' ? '运行中' : engineStatus === 'paused' ? '暂停' : '错误'}`, type: engineStatus === 'running' ? 'success' : engineStatus === 'error' ? 'error' : 'info', showIcon: true, style: { marginBottom: '16px' } }), _jsx(Card, { size: "small", title: "\u7B56\u7565\u5217\u8868", style: { marginBottom: '16px' }, children: _jsx(Table, { columns: columns, dataSource: strategies, rowKey: "id", size: "small", pagination: { pageSize: 5 } }) }), _jsx(Card, { size: "small", title: "\u6267\u884C\u5386\u53F2", style: { marginBottom: '16px' }, children: _jsx(Table, { columns: historyColumns, dataSource: executionHistory, rowKey: "id", size: "small", pagination: { pageSize: 5 } }) }), _jsx(Card, { size: "small", title: "\u6D3B\u8DC3\u4EA4\u6613", children: _jsx(Table, { columns: tradeColumns, dataSource: activeTrades, rowKey: "id", size: "small", pagination: { pageSize: 5 } }) }), _jsxs(Modal, { title: isEditing ? '编辑策略' : '添加策略', open: isModalVisible, onOk: handleSubmit, onCancel: () => setIsModalVisible(false), width: 800, footer: [
                    _jsx(Button, { onClick: () => setIsModalVisible(false), children: "\u53D6\u6D88" }, "back"),
                    _jsx(Button, { type: "default", onClick: handleBacktest, loading: isBacktesting, children: "\u56DE\u6D4B" }, "backtest"),
                    _jsx(Button, { type: "primary", onClick: handleSubmit, children: isEditing ? '更新' : '添加' }, "submit"),
                ], children: [_jsxs(Form, { form: form, layout: "vertical", children: [_jsx(Form.Item, { name: "name", label: "\u7B56\u7565\u540D\u79F0", rules: [{ required: true, message: '请输入策略名称' }], children: _jsx(Input, { placeholder: "\u8BF7\u8F93\u5165\u7B56\u7565\u540D\u79F0" }) }), _jsx(Form.Item, { name: "description", label: "\u7B56\u7565\u63CF\u8FF0", rules: [{ required: true, message: '请输入策略描述' }], children: _jsx(TextArea, { rows: 3, placeholder: "\u8BF7\u8F93\u5165\u7B56\u7565\u63CF\u8FF0" }) }), _jsx(Form.Item, { name: "indicators", label: "\u6280\u672F\u6307\u6807", rules: [{ required: true, message: '请选择技术指标' }], children: _jsxs(Select, { mode: "multiple", placeholder: "\u8BF7\u9009\u62E9\u6280\u672F\u6307\u6807", style: { width: '100%' }, children: [_jsx(Option, { value: "MA", children: "\u79FB\u52A8\u5E73\u5747\u7EBF" }), _jsx(Option, { value: "RSI", children: "\u76F8\u5BF9\u5F3A\u5F31\u6307\u6807" }), _jsx(Option, { value: "MACD", children: "\u5E73\u6ED1\u5F02\u540C\u79FB\u52A8\u5E73\u5747\u7EBF" }), _jsx(Option, { value: "KDJ", children: "\u968F\u673A\u6307\u6807" }), _jsx(Option, { value: "CCI", children: "\u987A\u52BF\u6307\u6807" }), _jsx(Option, { value: "Bollinger", children: "\u5E03\u6797\u5E26" })] }) }), _jsx(Form.Item, { name: "riskLevel", label: "\u98CE\u9669\u7B49\u7EA7", rules: [{ required: true, message: '请选择风险等级' }], children: _jsxs(Radio.Group, { children: [_jsx(Radio, { value: "low", children: "\u4F4E\u98CE\u9669" }), _jsx(Radio, { value: "medium", children: "\u4E2D\u98CE\u9669" }), _jsx(Radio, { value: "high", children: "\u9AD8\u98CE\u9669" })] }) }), _jsx(Form.Item, { name: "parameters", label: "\u7B56\u7565\u53C2\u6570", tooltip: "JSON\u683C\u5F0F\u7684\u7B56\u7565\u53C2\u6570", children: _jsx(TextArea, { rows: 4, placeholder: "\u8BF7\u8F93\u5165JSON\u683C\u5F0F\u7684\u7B56\u7565\u53C2\u6570\uFF0C\u4F8B\u5982: {maPeriod: 5, rsiPeriod: 14}" }) }), _jsx(Form.Item, { name: "rules", label: "\u7B56\u7565\u89C4\u5219", rules: [{ required: true, message: '请输入策略规则' }], children: _jsx(TextArea, { rows: 4, placeholder: "\u8BF7\u8F93\u5165\u7B56\u7565\u89C4\u5219\u63CF\u8FF0" }) })] }), backtestResult && (_jsxs("div", { style: { marginTop: '20px', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '4px' }, children: [_jsx("h4", { children: "\u56DE\u6D4B\u7ED3\u679C" }), _jsxs(Space, { direction: "vertical", style: { width: '100%' }, children: [_jsxs("div", { children: ["\u603B\u6536\u76CA\u7387: ", backtestResult.totalReturn.toFixed(2), "%"] }), _jsxs("div", { children: ["\u5E74\u5316\u6536\u76CA\u7387: ", backtestResult.annualizedReturn.toFixed(2), "%"] }), _jsxs("div", { children: ["\u6700\u5927\u56DE\u64A4: ", backtestResult.maxDrawdown.toFixed(2), "%"] }), _jsxs("div", { children: ["\u80DC\u7387: ", backtestResult.winRate.toFixed(2), "%"] }), _jsxs("div", { children: ["\u603B\u4EA4\u6613\u6B21\u6570: ", backtestResult.totalTrades] }), _jsxs("div", { children: ["\u76C8\u5229\u4EA4\u6613: ", backtestResult.winningTrades] }), _jsxs("div", { children: ["\u4E8F\u635F\u4EA4\u6613: ", backtestResult.losingTrades] }), _jsxs("div", { children: ["\u590F\u666E\u6BD4\u7387: ", backtestResult.sharpeRatio.toFixed(2)] })] })] }))] })] }));
};
export default StrategyManager;
