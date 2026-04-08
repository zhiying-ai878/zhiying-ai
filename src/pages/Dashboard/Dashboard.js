import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Row, Col, Card, Button, Input, Statistic, List, Tag, Space, message, Skeleton, Switch, Progress, Modal } from 'antd';
import { ReloadOutlined, SearchOutlined, RiseOutlined, FallOutlined, ArrowUpOutlined, ArrowDownOutlined, CloseCircleOutlined, PlayCircleOutlined, PauseCircleOutlined, SyncOutlined, LineChartOutlined } from '@ant-design/icons';
import { getRealtimeQuote, getStockDataSource } from '../../utils/stockData';
import { debounce } from '../../utils/performance';
import * as SignalManager from '../../utils/optimizedSignalManager';
import { getWatchlist, saveWatchlist } from '../../utils/storage';
import { startMarketMonitoring, stopMarketMonitoring, scanMarketNow, getMarketMonitor } from '../../utils/marketMonitorManager';
import { PredictionVisualization } from '../../components/PredictionVisualization/PredictionVisualization';
import './Dashboard.css';
const Dashboard = React.memo(() => {
    const [searchCode, setSearchCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [autoUpdate, setAutoUpdate] = useState(true);
    const [lastUpdateTime, setLastUpdateTime] = useState(null);
    const [loadingStocks, setLoadingStocks] = useState(true);
    const [unreadSignalCount, setUnreadSignalCount] = useState(0);
    const intervalRef = useRef(null);
    // 全市场监控状态
    const [marketMonitoring, setMarketMonitoring] = useState(false);
    const [monitoringLoading, setMonitoringLoading] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [scanStatus, setScanStatus] = useState('就绪');
    const marketMonitor = getMarketMonitor();
    // 从本地存储读取自选股
    const [stocks, setStocks] = useState(() => {
        const savedStocks = getWatchlist();
        if (savedStocks && savedStocks.length > 0) {
            // 使用类型断言确保类型安全
            return savedStocks.map(stock => ({
                code: stock.code,
                name: stock.name,
                price: 0,
                change: 0,
                changePercent: 0
            }));
        }
        // 如果本地存储没有数据，使用默认股票数据
        const defaultStocks = [
            { code: 'sh600519', name: '贵州茅台', price: 0, change: 0, changePercent: 0 },
            { code: 'sz000858', name: '五粮液', price: 0, change: 0, changePercent: 0 },
            { code: 'sz300750', name: '宁德时代', price: 0, change: 0, changePercent: 0 },
            { code: 'sh601318', name: '中国平安', price: 0, change: 0, changePercent: 0 },
            { code: 'sh600276', name: '恒瑞医药', price: 0, change: 0, changePercent: 0 }
        ];
        // 保存默认股票到本地存储
        saveWatchlist(defaultStocks);
        return defaultStocks;
    });
    const [marketData, setMarketData] = useState([
        { name: '上证指数', value: 0, change: 0, changePercent: 0 },
        { name: '深证成指', value: 0, change: 0, changePercent: 0 },
        { name: '创业板指', value: 0, change: 0, changePercent: 0 },
        { name: '科创50', value: 0, change: 0, changePercent: 0 },
    ]);
    const [latestSignals, setLatestSignals] = useState([]);
    const [initialLoading, setInitialLoading] = useState(true);
    // 预测模态框状态
    const [predictionModalVisible, setPredictionModalVisible] = useState(false);
    const [selectedStock, setSelectedStock] = useState(null);
    const signalManager = SignalManager.getOptimizedSignalManager();
    const stockDataSource = getStockDataSource();
    // 实时更新数据
    const updateRealtimeData = useCallback(async () => {
        try {
            console.log('=== 开始更新实时数据 ===');
            // 更新自选股数据
            if (stocks.length > 0) {
                const codes = stocks.map(stock => stock.code);
                console.log('自选股代码:', codes);
                const results = await getRealtimeQuote(codes);
                console.log('获取到的自选股数据:', JSON.stringify(results, null, 2));
                if (results && results.length > 0) {
                    console.log('成功获取到', results.length, '个自选股数据');
                    // 创建代码到数据的映射，确保数据匹配（支持带前缀和不带前缀的代码）
                    const resultMap = new Map();
                    results.forEach(r => {
                        // 同时保存带前缀和不带前缀的代码映射
                        resultMap.set(r.code, r);
                        if (r.code.startsWith('sh') || r.code.startsWith('sz')) {
                            resultMap.set(r.code.substring(2), r);
                        }
                        else {
                            const prefixedCode = r.code.startsWith('6') ? `sh${r.code}` : `sz${r.code}`;
                            resultMap.set(prefixedCode, r);
                        }
                    });
                    // 先获取最新的本地存储数据，确保用户的删除/添加操作优先
                    const currentStoredStocks = getWatchlist();
                    if (currentStoredStocks) {
                        console.log('本地存储中的自选股:', currentStoredStocks.map(s => s.code));
                        // 检查本地存储和当前状态的代码集合是否一致
                        const storedCodes = new Set(currentStoredStocks.map(s => s.code));
                        const currentCodes = new Set(stocks.map(s => s.code));
                        // 如果代码集合不匹配，使用本地存储的数据，保留用户的删除/添加操作
                        const codesMatch = storedCodes.size === currentCodes.size &&
                            Array.from(storedCodes).every(code => currentCodes.has(code));
                        if (!codesMatch) {
                            // 使用本地存储的数据来更新状态，确保用户操作不被覆盖
                            console.log('检测到本地存储与当前状态不一致，使用本地存储数据');
                            const storedDataMap = new Map();
                            results.forEach(r => {
                                storedDataMap.set(r.code, r);
                                if (r.code.startsWith('sh') || r.code.startsWith('sz')) {
                                    storedDataMap.set(r.code.substring(2), r);
                                }
                                else {
                                    const prefixedCode = r.code.startsWith('6') ? `sh${r.code}` : `sz${r.code}`;
                                    storedDataMap.set(prefixedCode, r);
                                }
                            });
                            const finalStocks = currentStoredStocks.map(stock => {
                                let result = storedDataMap.get(stock.code);
                                if (!result && !stock.code.startsWith('sh') && !stock.code.startsWith('sz')) {
                                    const prefixedCode = stock.code.startsWith('6') ? `sh${stock.code}` : `sz${stock.code}`;
                                    result = storedDataMap.get(prefixedCode);
                                }
                                return result ? {
                                    code: stock.code, // 保持原始代码格式，不要使用result.code
                                    name: result.name,
                                    price: result.price,
                                    change: result.change,
                                    changePercent: result.changePercent
                                } : {
                                    code: stock.code,
                                    name: stock.name,
                                    price: 0,
                                    change: 0,
                                    changePercent: 0
                                };
                            });
                            setStocks(finalStocks);
                            console.log('使用本地存储数据更新状态，保留用户操作');
                            return; // 不保存，避免覆盖用户操作
                        }
                    }
                    // 代码集合匹配，只更新价格等数据，不改变股票列表
                    const updatedStocks = stocks.map(stock => {
                        // 尝试匹配多种代码格式
                        let result = resultMap.get(stock.code);
                        // 如果没找到，尝试带前缀的格式
                        if (!result && !stock.code.startsWith('sh') && !stock.code.startsWith('sz')) {
                            const prefixedCode = stock.code.startsWith('6') ? `sh${stock.code}` : `sz${stock.code}`;
                            result = resultMap.get(prefixedCode);
                        }
                        console.log(`匹配代码: ${stock.code}, 找到数据: ${!!result}`);
                        return result ? {
                            code: stock.code, // 保持原始代码格式，避免代码格式变化
                            name: result.name,
                            price: result.price,
                            change: result.change,
                            changePercent: result.changePercent
                        } : stock;
                    });
                    console.log('准备更新自选股数据:', JSON.stringify(updatedStocks, null, 2));
                    // 只更新状态，不保存到本地存储（避免覆盖用户操作）
                    setStocks(updatedStocks);
                    console.log('自选股数据已更新，保留用户的删除/添加操作');
                }
                else {
                    console.warn('未获取到自选股数据，继续使用当前数据');
                }
            }
            // 更新市场指数数据
            const indexCodes = ['sh000001', 'sz399001', 'sz399006', 'sh000688'];
            console.log('开始获取指数数据，代码:', indexCodes);
            console.log('时间戳:', Date.now());
            try {
                const indexResults = await getRealtimeQuote(indexCodes);
                console.log('获取到的指数数据:', JSON.stringify(indexResults, null, 2));
                if (indexResults && indexResults.length > 0) {
                    console.log('成功获取到', indexResults.length, '个指数数据');
                    console.log('指数数据详情:', JSON.stringify(indexResults, null, 2));
                    // 详细检查每个指数的数据
                    indexResults.forEach(quote => {
                        console.log(`详细检查 ${quote.name}: 代码=${quote.code}, 价格=${quote.price}, 涨跌幅=${quote.changePercent}%`);
                        if (quote.price < 100 && (quote.code === 'sh000001' || quote.code === 'sh000688')) {
                            console.log(`⚠️  ${quote.name} 数据异常: 价格 ${quote.price} 过低`);
                        }
                    });
                    // 创建代码到数据的映射（支持带前缀和不带前缀的代码）
                    const indexMap = new Map();
                    indexResults.forEach(r => {
                        // 同时保存带前缀和不带前缀的代码映射
                        indexMap.set(r.code, r);
                        if (r.code.startsWith('sh') || r.code.startsWith('sz')) {
                            indexMap.set(r.code.substring(2), r);
                        }
                        else {
                            const prefixedCode = r.code.startsWith('6') || r.code.startsWith('000') ? `sh${r.code}` : `sz${r.code}`;
                            indexMap.set(prefixedCode, r);
                        }
                    });
                    console.log('指数映射:', Array.from(indexMap.keys()));
                    const updatedMarketData = [
                        { name: '上证指数', value: indexMap.get('sh000001')?.price || indexMap.get('000001')?.price || 0, change: indexMap.get('sh000001')?.change || indexMap.get('000001')?.change || 0, changePercent: indexMap.get('sh000001')?.changePercent || indexMap.get('000001')?.changePercent || 0 },
                        { name: '深证成指', value: indexMap.get('sz399001')?.price || indexMap.get('399001')?.price || 0, change: indexMap.get('sz399001')?.change || indexMap.get('399001')?.change || 0, changePercent: indexMap.get('sz399001')?.changePercent || indexMap.get('399001')?.changePercent || 0 },
                        { name: '创业板指', value: indexMap.get('sz399006')?.price || indexMap.get('399006')?.price || 0, change: indexMap.get('sz399006')?.change || indexMap.get('399006')?.change || 0, changePercent: indexMap.get('sz399006')?.changePercent || indexMap.get('399006')?.changePercent || 0 },
                        { name: '科创综指', value: indexMap.get('sh000688')?.price || indexMap.get('000688')?.price || 0, change: indexMap.get('sh000688')?.change || indexMap.get('000688')?.change || 0, changePercent: indexMap.get('sh000688')?.changePercent || indexMap.get('000688')?.changePercent || 0 },
                    ];
                    console.log('准备更新市场数据:', JSON.stringify(updatedMarketData, null, 2));
                    setMarketData(updatedMarketData);
                    console.log('市场数据已更新为真实数据');
                }
                else {
                    console.warn('未获取到指数数据，继续使用当前数据');
                }
            }
            catch (error) {
                console.error('获取指数数据失败:', error);
                console.error('错误详情:', JSON.stringify(error, null, 2));
            }
            setLastUpdateTime(new Date());
            setLoadingStocks(false);
            console.log('=== 实时数据更新完成 ===');
        }
        catch (error) {
            console.error('更新实时数据失败:', error);
            console.error('错误详情:', JSON.stringify(error, null, 2));
            setLoadingStocks(false);
            message.error('数据更新失败，请稍后重试');
        }
    }, [stocks]);
    // 集成实时数据监听 - 已移除模拟数据，只使用真实API数据
    // 自动更新
    useEffect(() => {
        console.log('autoUpdate状态:', autoUpdate);
        if (autoUpdate) {
            console.log('启动自动更新定时器，每5秒更新一次');
            intervalRef.current = setInterval(() => {
                console.log('定时器触发，调用updateRealtimeData()');
                updateRealtimeData();
            }, 5000); // 每5秒更新一次
        }
        else {
            console.log('关闭自动更新定时器');
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }
        return () => {
            if (intervalRef.current) {
                console.log('清理定时器');
                clearInterval(intervalRef.current);
            }
        };
    }, [autoUpdate, updateRealtimeData]);
    // 加载最新信号
    const loadLatestSignals = useCallback(() => {
        try {
            const signalHistory = signalManager.getSignalHistory();
            const latest = signalHistory.slice(0, 5);
            setLatestSignals(latest);
        }
        catch (error) {
            console.error('加载信号失败:', error);
        }
    }, [signalManager]);
    // 初始加载数据
    useEffect(() => {
        console.log('开始初始加载数据...');
        const loadAllData = async () => {
            try {
                console.log('正在调用updateRealtimeData()...');
                // 并行加载数据，提升加载速度
                await Promise.all([
                    updateRealtimeData(),
                    loadLatestSignals()
                ]);
                console.log('初始数据加载完成');
            }
            catch (error) {
                console.error('加载数据失败:', error);
            }
            finally {
                // 所有数据加载完成后设置初始加载为false
                setInitialLoading(false);
            }
        };
        loadAllData();
    }, [updateRealtimeData, loadLatestSignals]);
    // 定期更新信号
    useEffect(() => {
        // 每10秒更新一次信号
        const signalTimer = setInterval(() => {
            loadLatestSignals();
        }, 10000);
        return () => {
            if (signalTimer) {
                clearInterval(signalTimer);
            }
        };
    }, [loadLatestSignals]);
    const handleToggleAutoUpdate = useCallback(() => {
        setAutoUpdate(!autoUpdate);
        message.success(autoUpdate ? '自动更新已关闭' : '自动更新已开启');
    }, [autoUpdate]);
    const handleManualUpdate = useCallback(() => {
        setLoadingStocks(true);
        updateRealtimeData();
        message.success('数据已更新');
    }, [updateRealtimeData]);
    // 全市场监控控制函数
    const handleToggleMarketMonitoring = useCallback(() => {
        if (marketMonitoring) {
            stopMarketMonitoring();
            setMarketMonitoring(false);
            message.success('全市场监控已停止');
        }
        else {
            startMarketMonitoring();
            setMarketMonitoring(true);
            message.success('全市场监控已启动');
        }
    }, [marketMonitoring]);
    const handleScanMarketNow = useCallback(async () => {
        if (monitoringLoading)
            return;
        setMonitoringLoading(true);
        setScanStatus('正在扫描全市场...');
        setScanProgress(10);
        try {
            await scanMarketNow();
            setScanProgress(100);
            setScanStatus('扫描完成');
            message.success('全市场扫描已完成');
            // 延迟重置进度条
            setTimeout(() => {
                setScanProgress(0);
                setScanStatus('就绪');
            }, 2000);
        }
        catch (error) {
            message.error('扫描失败，请稍后重试');
            setScanStatus('扫描失败');
            setScanProgress(0);
        }
        finally {
            setMonitoringLoading(false);
        }
    }, [monitoringLoading]);
    // 监听监控状态变化
    useEffect(() => {
        const checkMonitoringStatus = () => {
            const isMonitoring = marketMonitor.isMonitoring();
            if (isMonitoring !== marketMonitoring) {
                setMarketMonitoring(isMonitoring);
            }
        };
        // 初始检查
        checkMonitoringStatus();
        // 定期检查状态
        const statusCheckInterval = setInterval(checkMonitoringStatus, 5000);
        return () => clearInterval(statusCheckInterval);
    }, [marketMonitoring, marketMonitor]);
    // 删除自选股
    const handleRemoveStock = useCallback((code, name) => {
        console.log('开始删除股票:', code, name);
        // 先更新界面状态，确保立即生效
        setStocks(prevStocks => {
            const filteredStocks = prevStocks.filter(stock => {
                // 处理代码格式匹配问题
                const stockCodeNoPrefix = stock.code.startsWith('sh') || stock.code.startsWith('sz') ? stock.code.substring(2) : stock.code;
                const targetCodeNoPrefix = code.startsWith('sh') || code.startsWith('sz') ? code.substring(2) : code;
                const shouldRemove = stock.code === code || stockCodeNoPrefix === targetCodeNoPrefix;
                console.log(`检查股票: ${stock.code}, 是否删除: ${shouldRemove}`);
                return !shouldRemove;
            });
            console.log('删除后的股票列表:', filteredStocks.map(s => s.code));
            // 保存到本地存储
            saveWatchlist(filteredStocks);
            console.log('已保存到本地存储');
            return filteredStocks;
        });
        message.success(`已删除股票：${name}(${code})`);
    }, []);
    // 查看预测分析
    const handleViewPrediction = useCallback((stock) => {
        setSelectedStock({ code: stock.code, name: stock.name });
        setPredictionModalVisible(true);
    }, []);
    // 关闭预测模态框
    const handleClosePrediction = useCallback(() => {
        setPredictionModalVisible(false);
        setSelectedStock(null);
    }, []);
    // 防抖搜索
    const debouncedSearch = useMemo(() => {
        return debounce(async () => {
            if (!searchCode) {
                message.error('请输入股票代码');
                return;
            }
            // 自动添加市场前缀
            let formattedCode = searchCode;
            if (!searchCode.startsWith('sh') && !searchCode.startsWith('sz')) {
                if (searchCode.startsWith('6')) {
                    formattedCode = `sh${searchCode}`;
                }
                else {
                    formattedCode = `sz${searchCode}`;
                }
            }
            setLoading(true);
            try {
                const results = await getRealtimeQuote([formattedCode]);
                if (results && results.length > 0) {
                    const stock = results[0];
                    console.log('搜索结果:', stock);
                    // 检查是否已在列表中（处理代码格式匹配问题）
                    let existingIndex = -1;
                    for (let i = 0; i < stocks.length; i++) {
                        const s = stocks[i];
                        // 完全匹配
                        if (s.code === stock.code) {
                            existingIndex = i;
                            break;
                        }
                        // 处理带前缀和不带前缀的情况
                        const sCodeNoPrefix = s.code.startsWith('sh') || s.code.startsWith('sz') ? s.code.substring(2) : s.code;
                        const stockCodeNoPrefix = stock.code.startsWith('sh') || stock.code.startsWith('sz') ? stock.code.substring(2) : stock.code;
                        if (sCodeNoPrefix === stockCodeNoPrefix) {
                            existingIndex = i;
                            break;
                        }
                    }
                    console.log('是否已存在:', existingIndex >= 0);
                    if (existingIndex >= 0) {
                        // 更新现有股票
                        const updatedStocks = [...stocks];
                        updatedStocks[existingIndex] = {
                            code: stocks[existingIndex].code, // 保持原有代码格式
                            name: stock.name,
                            price: stock.price,
                            change: stock.change,
                            changePercent: stock.changePercent
                        };
                        console.log('更新后的股票列表:', updatedStocks.map(s => s.code));
                        setStocks(updatedStocks);
                        saveWatchlist(updatedStocks);
                        message.success(`已更新股票：${stock.name}(${stock.code})`);
                    }
                    else {
                        // 添加新股票
                        const newStock = {
                            code: stock.code,
                            name: stock.name,
                            price: stock.price,
                            change: stock.change,
                            changePercent: stock.changePercent
                        };
                        setStocks(prevStocks => {
                            const updatedStocks = [...prevStocks, newStock];
                            console.log('添加后的股票列表:', updatedStocks.map(s => s.code));
                            // 保存到本地存储
                            saveWatchlist(updatedStocks);
                            console.log('已保存到本地存储');
                            return updatedStocks;
                        });
                        message.success(`已添加股票：${stock.name}(${stock.code})`);
                    }
                }
                else {
                    message.error('未找到该股票');
                }
            }
            catch (error) {
                message.error('搜索失败，请稍后重试');
                console.error('搜索失败:', error);
            }
            finally {
                setLoading(false);
            }
        }, 300); // 减少防抖时间，提升响应速度
    }, [searchCode, stocks]);
    const handleSearch = useCallback(() => {
        debouncedSearch();
    }, [debouncedSearch]);
    const formatLastUpdate = useCallback(() => {
        if (!lastUpdateTime)
            return '尚未更新';
        return lastUpdateTime.toLocaleTimeString('zh-CN');
    }, [lastUpdateTime]);
    // 计算市场数据的样式
    const marketDataItems = useMemo(() => {
        if (loadingStocks) {
            return Array(4).fill(0).map((_, index) => (_jsx(Col, { xs: 24, sm: 12, md: 8, children: _jsx(Card, { size: "small", style: { margin: '2px' }, children: _jsx(Skeleton, { active: true, paragraph: { rows: 1 }, title: false }) }) }, index)));
        }
        return marketData.map((market, index) => (_jsx(Col, { xs: 24, sm: 12, md: 8, children: _jsx(Card, { size: "small", style: { margin: '2px' }, children: _jsx(Statistic, { title: market.name, value: market.value, precision: 2, valueStyle: { color: market.change >= 0 ? '#cf1322' : '#3f8600', fontSize: '16px' }, prefix: market.change >= 0 ? _jsx(ArrowUpOutlined, {}) : _jsx(ArrowDownOutlined, {}), suffix: _jsxs("span", { style: { fontSize: '10px' }, children: ["(", market.change >= 0 ? '+' : '', market.change.toFixed(2), ", ", market.changePercent >= 0 ? '+' : '', market.changePercent.toFixed(2), "%)"] }) }) }) }, index)));
    }, [marketData, loadingStocks]);
    return (_jsx("div", { className: "dashboard", style: { padding: 0, margin: 0 }, children: initialLoading ? (_jsx("div", { style: { padding: '20px' }, children: _jsx(Skeleton, { active: true, paragraph: { rows: 10 } }) })) : (_jsxs(_Fragment, { children: [_jsx(Card, { style: { marginBottom: '2px', borderRadius: '4px', margin: '2px' }, size: "small", children: _jsxs(Row, { gutter: [2, 2], align: "middle", children: [_jsx(Col, { xs: 20, sm: 8, md: 6, children: _jsx(Input, { value: searchCode, onChange: (e) => setSearchCode(e.target.value), placeholder: "\u8F93\u5165\u80A1\u7968\u4EE3\u7801", size: "small", prefix: _jsx(SearchOutlined, {}), suffix: _jsx(ReloadOutlined, { style: { cursor: 'pointer' }, onClick: handleManualUpdate }) }) }), _jsx(Col, { xs: 4, sm: 2, md: 2, children: _jsx(Button, { type: "primary", size: "small", icon: _jsx(SearchOutlined, {}), onClick: handleSearch, loading: loading, children: "\u641C\u7D22" }) }), _jsx(Col, { xs: 24, sm: 12, md: 14, style: { marginTop: '8px' }, children: _jsx("div", { style: { display: 'flex', justifyContent: 'flex-end', gap: '8px', alignItems: 'center' } }) }), _jsx(Col, { xs: 24, sm: 8, md: 8, style: { marginTop: '8px' }, children: _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }, children: [_jsxs("span", { style: { fontSize: '12px', color: '#666' }, children: ["\u81EA\u52A8\u66F4\u65B0: ", autoUpdate ? '开启' : '关闭'] }), _jsxs("span", { style: { fontSize: '12px', color: '#666' }, children: ["\u6700\u540E\u66F4\u65B0: ", formatLastUpdate()] })] }) })] }) }), _jsx(Card, { style: { marginBottom: '2px', borderRadius: '4px', margin: '2px' }, size: "small", children: _jsxs(Row, { gutter: [2, 2], align: "middle", children: [_jsx(Col, { xs: 24, sm: 12, md: 6, children: _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' }, children: [_jsx("span", { style: { fontSize: '12px', color: '#666' }, children: "\u5168\u5E02\u573A\u76D1\u63A7:" }), _jsx(Switch, { checked: marketMonitoring, onChange: handleToggleMarketMonitoring, checkedChildren: _jsx(PlayCircleOutlined, {}), unCheckedChildren: _jsx(PauseCircleOutlined, {}) })] }) }), _jsx(Col, { xs: 24, sm: 12, md: 6, children: _jsx(Button, { type: "primary", size: "small", icon: _jsx(SyncOutlined, {}), onClick: handleScanMarketNow, loading: monitoringLoading, disabled: monitoringLoading, children: "\u7ACB\u5373\u626B\u63CF" }) }), _jsx(Col, { xs: 24, sm: 24, md: 12, style: { marginTop: '8px' }, children: _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }, children: [_jsxs("span", { style: { color: '#666' }, children: ["\u72B6\u6001: ", scanStatus] }), _jsx(Progress, { percent: scanProgress, size: "small", style: { flex: 1 }, status: scanStatus === '扫描失败' ? 'exception' : scanStatus === '扫描完成' ? 'success' : 'active' })] }) })] }) }), _jsx(Row, { gutter: [2, 2], style: { marginBottom: '2px' }, children: marketDataItems }), _jsx(Card, { size: "small", title: "\u81EA\u9009\u80A1", style: { margin: '2px' }, children: loadingStocks ? (_jsx("div", { children: Array(5).fill(0).map((_, index) => (_jsx(List.Item, { children: _jsx(Skeleton, { active: true, paragraph: { rows: 1 }, title: false }) }, index))) })) : (_jsx(List, { dataSource: stocks, renderItem: (stock) => (_jsx(List.Item, { actions: [
                                _jsx(Button, { type: "text", size: "small", icon: _jsx(LineChartOutlined, {}), onClick: () => handleViewPrediction(stock), style: { color: '#1890ff' }, children: "\u9884\u6D4B" }),
                                _jsx(Button, { type: "text", danger: true, size: "small", icon: _jsx(CloseCircleOutlined, {}), onClick: () => handleRemoveStock(stock.code, stock.name), children: "\u5220\u9664" })
                            ], children: _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }, children: [_jsx("div", { children: _jsxs(Space, { children: [_jsx("span", { style: { fontWeight: 'bold' }, children: stock.name }), _jsx("span", { style: { color: '#666' }, children: stock.code })] }) }), _jsxs("div", { style: { textAlign: 'right' }, children: [_jsx("div", { style: { fontSize: '16px', fontWeight: 'bold', color: stock.change >= 0 ? '#cf1322' : '#3f8600' }, children: stock.price.toFixed(2) }), _jsxs(Tag, { color: stock.change >= 0 ? 'red' : 'green', children: [stock.change >= 0 ? '+' : '', stock.change.toFixed(2), " (", stock.changePercent >= 0 ? '+' : '', stock.changePercent.toFixed(2), "%)"] })] })] }) })) })) }), _jsx(Card, { size: "small", title: "\u6700\u65B0\u4FE1\u53F7\u5206\u6790", style: { margin: '2px' }, children: _jsx(List, { dataSource: latestSignals, renderItem: (signal, index) => (_jsx(List.Item, { style: { padding: '6px 0' }, children: _jsxs("div", { style: { display: 'flex', flexDirection: 'column', width: '100%' }, children: [_jsxs("div", { style: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px', marginBottom: '2px' }, children: [_jsxs(Tag, { color: signal.type === 'buy' ? 'red' : 'green', style: { fontSize: '12px', padding: '2px 8px' }, children: [signal.type === 'buy' ? _jsx(RiseOutlined, {}) : _jsx(FallOutlined, {}), signal.type === 'buy' ? '买入' : '卖出'] }), _jsx("span", { style: { fontWeight: 'bold', fontSize: '14px' }, children: signal.stockName }), _jsx("span", { style: { color: '#666', fontSize: '12px' }, children: signal.stockCode })] }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#666', marginTop: '2px' }, children: [_jsx("div", { style: { flex: 1, marginRight: '8px' }, children: signal.reason }), _jsxs("div", { style: { textAlign: 'right', minWidth: '80px' }, children: [_jsxs("div", { style: { fontWeight: 'bold', color: '#1890ff' }, children: ["\u4FE1\u5FC3 ", signal.confidence, "%"] }), _jsx("div", { style: { marginTop: '2px' }, children: new Date(signal.timestamp).toLocaleTimeString() })] })] })] }) }, index)), locale: { emptyText: '暂无信号' } }) }), _jsx(Modal, { title: "AI\u667A\u80FD\u9884\u6D4B\u5206\u6790", open: predictionModalVisible, onCancel: handleClosePrediction, footer: null, width: 1200, destroyOnClose: true, children: selectedStock && (_jsx(PredictionVisualization, { stockCode: selectedStock.code, stockName: selectedStock.name })) })] })) }));
});
export default Dashboard;
