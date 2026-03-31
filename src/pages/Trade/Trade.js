import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Card, Form, Input, Select, Button, Table, message, Modal } from 'antd';
import './Trade.css';
import { getStockDataSource } from '../../utils/stockData';
import { getStorageItem, setStorageItem } from '../../utils/storage';
const { Option } = Select;
const Trade = () => {
    // 从本地存储读取持仓数据
    const [portfolio, setPortfolio] = useState(() => {
        const savedPortfolio = getStorageItem('portfolio');
        return savedPortfolio || [];
    });
    const [showAddPortfolioModal, setShowAddPortfolioModal] = useState(false);
    const [addPortfolioForm] = Form.useForm();
    const [loading, setLoading] = useState(false);
    // 初始化股票数据源
    const stockDataSource = getStockDataSource('eastmoney');
    // 处理股票代码变化，自动获取股票名称
    const handleStockCodeChange = async (value) => {
        if (value && value.length >= 6) {
            setLoading(true);
            try {
                const quote = await stockDataSource.getRealtimeQuote([value]);
                if (quote && quote.length > 0) {
                    addPortfolioForm.setFieldsValue({
                        stockName: quote[0].name
                    });
                }
            }
            catch (error) {
                console.error('获取股票名称失败:', error);
                message.error('获取股票名称失败，请手动输入');
            }
            finally {
                setLoading(false);
            }
        }
    };
    // 添加股票到持仓列表
    const addToPortfolio = (code, name, price, volume) => {
        const totalAmount = price * volume;
        const existingItem = portfolio.find(item => item.code === code);
        if (existingItem) {
            // 更新已有持仓
            setPortfolio(prev => {
                const updatedPortfolio = prev.map(item => item.code === code
                    ? {
                        ...item,
                        volume: item.volume + volume,
                        totalAmount: item.totalAmount + totalAmount
                    }
                    : item);
                // 保存到本地存储
                setStorageItem('portfolio', updatedPortfolio);
                return updatedPortfolio;
            });
            message.success(`${name}(${code})持仓已更新`);
        }
        else {
            // 添加新持仓
            setPortfolio(prev => {
                const updatedPortfolio = [...prev, {
                        code,
                        name,
                        price,
                        volume,
                        totalAmount
                    }];
                // 保存到本地存储
                setStorageItem('portfolio', updatedPortfolio);
                return updatedPortfolio;
            });
            message.success(`${name}(${code})已添加到持仓列表，开始监控卖出信号`);
        }
    };
    // 手动添加持仓
    const handleManualAddPortfolio = (values) => {
        try {
            const price = parseFloat(values.price);
            const volume = parseInt(values.volume);
            if (isNaN(price) || isNaN(volume)) {
                message.error('请输入有效的价格和数量');
                return;
            }
            addToPortfolio(values.stockCode, values.stockName, price, volume);
            setShowAddPortfolioModal(false);
            addPortfolioForm.resetFields();
        }
        catch (error) {
            console.error('添加持仓失败:', error);
            message.error('添加持仓失败，请重试');
        }
    };
    // 卖出持仓
    const handleSellPortfolio = (item) => {
        setPortfolio(prev => {
            const updatedPortfolio = prev.filter(p => p.code !== item.code);
            // 保存到本地存储
            setStorageItem('portfolio', updatedPortfolio);
            return updatedPortfolio;
        });
        message.success(`${item.name}(${item.code})已从持仓列表移除`);
    };
    // 更新持仓价格
    const updatePortfolioPrices = async () => {
        const codes = portfolio.map(item => item.code);
        if (codes.length === 0)
            return;
        try {
            const quotes = await stockDataSource.getRealtimeQuote(codes);
            setPortfolio(prev => prev.map(item => {
                const quote = quotes.find(q => q.code === item.code);
                if (quote) {
                    const currentPrice = quote.price;
                    const profit = (currentPrice - item.price) * item.volume;
                    const profitPercent = ((currentPrice - item.price) / item.price) * 100;
                    return {
                        ...item,
                        currentPrice,
                        profit,
                        profitPercent
                    };
                }
                return item;
            }));
        }
        catch (error) {
            console.error('更新持仓价格失败:', error);
        }
    };
    // 定期更新持仓价格
    useEffect(() => {
        const timer = setInterval(() => {
            updatePortfolioPrices();
        }, 5000);
        return () => clearInterval(timer);
    }, [portfolio]);
    // 持仓列表列定义
    const portfolioColumns = [
        { title: '股票代码', dataIndex: 'code', key: 'code' },
        { title: '股票名称', dataIndex: 'name', key: 'name' },
        { title: '持仓价格', dataIndex: 'price', key: 'price', render: (price) => price.toFixed(2) },
        { title: '当前价格', dataIndex: 'currentPrice', key: 'currentPrice', render: (price) => price ? price.toFixed(2) : '--' },
        { title: '持仓数量', dataIndex: 'volume', key: 'volume' },
        { title: '持仓金额', dataIndex: 'totalAmount', key: 'totalAmount', render: (amount) => amount.toFixed(2) },
        {
            title: '盈亏',
            dataIndex: 'profit',
            key: 'profit',
            render: (profit) => (_jsx("span", { style: { color: profit >= 0 ? '#ff4d4f' : '#52c41a', fontWeight: 'bold' }, children: profit ? (profit >= 0 ? '+' : '') + profit.toFixed(2) : '--' }))
        },
        {
            title: '盈亏比例',
            dataIndex: 'profitPercent',
            key: 'profitPercent',
            render: (percent) => (_jsx("span", { style: { color: percent >= 0 ? '#ff4d4f' : '#52c41a', fontWeight: 'bold' }, children: percent ? (percent >= 0 ? '+' : '') + percent.toFixed(2) + '%' : '--' }))
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (_jsx(Button, { type: "text", danger: true, onClick: () => handleSellPortfolio(record), size: "small", children: "\u79FB\u9664" }))
        }
    ];
    return (_jsxs("div", { className: "trade", style: { padding: '0' }, children: [_jsx("div", { className: "trade-header", style: { marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: _jsx("h2", { style: { margin: 0 }, children: "\u6301\u4ED3\u7BA1\u7406" }) }), _jsxs(Card, { size: "small", style: { margin: '2px' }, children: [_jsx("div", { style: { marginBottom: '16px' }, children: _jsx(Button, { type: "primary", size: "small", onClick: () => setShowAddPortfolioModal(true), children: "\u624B\u52A8\u6DFB\u52A0\u6301\u4ED3" }) }), _jsx(Table, { columns: portfolioColumns, dataSource: portfolio, rowKey: "code", pagination: { pageSize: 10 }, size: "small", locale: { emptyText: '暂无持仓，请添加已买入的股票' } })] }), _jsx(Modal, { title: "\u624B\u52A8\u6DFB\u52A0\u6301\u4ED3", open: showAddPortfolioModal, onCancel: () => setShowAddPortfolioModal(false), footer: [
                    _jsx(Button, { onClick: () => setShowAddPortfolioModal(false), size: "small", children: "\u53D6\u6D88" }, "cancel")
                ], width: 500, children: _jsxs(Form, { form: addPortfolioForm, layout: "vertical", onFinish: handleManualAddPortfolio, initialValues: {
                        stockCode: '',
                        stockName: '',
                        price: '',
                        volume: ''
                    }, children: [_jsx(Form.Item, { name: "stockCode", label: "\u80A1\u7968\u4EE3\u7801", rules: [{ required: true, message: '请输入股票代码' }], children: _jsx(Input, { placeholder: "\u8BF7\u8F93\u5165\u80A1\u7968\u4EE3\u7801", size: "small", onChange: (e) => handleStockCodeChange(e.target.value), disabled: loading }) }), _jsx(Form.Item, { name: "stockName", label: "\u80A1\u7968\u540D\u79F0", rules: [{ required: true, message: '请输入股票名称' }], children: _jsx(Input, { placeholder: "\u8F93\u5165\u80A1\u7968\u4EE3\u7801\u540E\u81EA\u52A8\u586B\u5145", size: "small", disabled: loading }) }), _jsx(Form.Item, { name: "price", label: "\u6301\u4ED3\u4EF7\u683C", rules: [{ required: true, message: '请输入持仓价格' }], children: _jsx(Input, { type: "number", placeholder: "\u8BF7\u8F93\u5165\u6301\u4ED3\u4EF7\u683C", size: "small" }) }), _jsx(Form.Item, { name: "volume", label: "\u6301\u4ED3\u6570\u91CF", rules: [{ required: true, message: '请输入持仓数量' }], children: _jsx(Input, { type: "number", placeholder: "\u8BF7\u8F93\u5165\u6301\u4ED3\u6570\u91CF", size: "small" }) }), _jsx(Form.Item, { style: { marginBottom: 0, textAlign: 'right' }, children: _jsx(Button, { type: "primary", htmlType: "submit", size: "small", children: "\u6DFB\u52A0\u6301\u4ED3" }) })] }) })] }));
};
export default Trade;
