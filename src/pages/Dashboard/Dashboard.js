import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Row, Col, Card, Button, Input, Statistic, List, Tag, Space, message, Skeleton, Badge, Progress } from 'antd';
import { ReloadOutlined, SearchOutlined, StarOutlined, ShareAltOutlined, AppstoreOutlined, RiseOutlined, FallOutlined, ArrowUpOutlined, ArrowDownOutlined, FireOutlined, LikeOutlined, WarningOutlined, LineChartOutlined, BellOutlined } from '@ant-design/icons';
import * as echarts from 'echarts';
import { getRealtimeQuote, getStockDataSource } from '../../utils/stockData';
import { getPersonalizedRecommendation } from '../../utils/personalizedRecommendation';
import { startMockRealTimeData } from '../../utils/realtimeData';
import { debounce } from '../../utils/performance';
import * as SignalManager from '../../utils/optimizedSignalManager';
import { getMainForceTracker } from '../../utils/mainForceTracker';
import { getRiskManager } from '../../utils/riskManagement';
import './Dashboard.css';
const Dashboard = React.memo(() => {
    const [searchCode, setSearchCode] = useState('002594');
    const [loading, setLoading] = useState(false);
    const [autoUpdate, setAutoUpdate] = useState(true);
    const [lastUpdateTime, setLastUpdateTime] = useState(null);
    const [loadingStocks, setLoadingStocks] = useState(true);
    const [loadingMainForce, setLoadingMainForce] = useState(false);
    const [mainForceData, setMainForceData] = useState([]);
    const [unreadSignalCount, setUnreadSignalCount] = useState(0);
    const intervalRef = useRef(null);
    const mainForceIntervalRef = useRef(null);
    const [stocks, setStocks] = useState([
        { code: '002594', name: '比亚迪', price: 185.6, change: 3.2, changePercent: 1.75 },
        { code: '300750', name: '宁德时代', price: 210.8, change: -1.5, changePercent: -0.71 },
        { code: '600519', name: '贵州茅台', price: 1856.0, change: 0.8, changePercent: 0.04 },
        { code: '000001', name: '平安银行', price: 17.5, change: 0.3, changePercent: 1.74 },
        { code: '601318', name: '中国平安', price: 48.2, change: -0.8, changePercent: -1.63 },
    ]);
    const [marketData, setMarketData] = useState([
        { name: '上证指数', value: 3152.67, change: 12.34, changePercent: 0.39 },
        { name: '深证成指', value: 10567.89, change: -23.45, changePercent: -0.22 },
        { name: '创业板指', value: 2189.56, change: 8.76, changePercent: 0.40 },
    ]);
    const [recommendations, setRecommendations] = useState([]);
    const [loadingRecommendations, setLoadingRecommendations] = useState(true);
    const [hotspotData, setHotspotData] = useState([]);
    const [loadingHotspot, setLoadingHotspot] = useState(true);
    const [latestSignals, setLatestSignals] = useState([]);
    const [mainForceFlow, setMainForceFlow] = useState({ total: 0, buy: 0, sell: 0 });
    const [dataSourceHealth, setDataSourceHealth] = useState([]);
    const [loadingDataSource, setLoadingDataSource] = useState(true);
    const [riskAssessments, setRiskAssessments] = useState([]);
    const [riskAlerts, setRiskAlerts] = useState([]);
    const [portfolioRisk, setPortfolioRisk] = useState(null);
    const [loadingRisk, setLoadingRisk] = useState(true);
    const [initialLoading, setInitialLoading] = useState(true);
    // 图表引用
    const mainForceChartRef = useRef(null);
    const hotspotChartRef = useRef(null);
    // 图表实例
    const mainForceChart = useRef(null);
    const hotspotChart = useRef(null);
    const signalManager = SignalManager.getOptimizedSignalManager();
    const mainForceTracker = getMainForceTracker();
    const stockDataSource = getStockDataSource();
    const riskManager = getRiskManager();
    // 实时更新数据
    const updateRealtimeData = useCallback(async () => {
        try {
            // 更新自选股数据
            if (stocks.length > 0) {
                const codes = stocks.map(stock => stock.code);
                const results = await getRealtimeQuote(codes);
                if (results && results.length > 0) {
                    const updatedStocks = results.map(result => ({
                        code: result.code,
                        name: result.name,
                        price: result.price,
                        change: result.change,
                        changePercent: result.changePercent
                    }));
                    // 使用批量更新，减少渲染次数
                    setStocks(updatedStocks);
                }
            }
            // 模拟更新市场数据
            setMarketData(prev => prev.map(item => ({
                ...item,
                value: item.value + (Math.random() - 0.5) * 10,
                change: (Math.random() - 0.5) * 20,
                changePercent: (Math.random() - 0.5) * 1
            })));
            setLastUpdateTime(new Date());
            setLoadingStocks(false);
        }
        catch (error) {
            console.error('更新实时数据失败:', error);
            setLoadingStocks(false);
            message.error('数据更新失败，请稍后重试');
        }
    }, [stocks.length]);
    // 获取主力资金数据并处理信号
    const updateMainForceData = useCallback(async () => {
        try {
            setLoadingMainForce(true);
            const codes = stocks.map(stock => stock.code);
            if (codes.length > 0) {
                // 使用同花顺数据源获取主力资金数据
                const source = getStockDataSource('ths');
                const mainForceResults = await source.getMainForceData(codes);
                if (mainForceResults && mainForceResults.length > 0) {
                    setMainForceData(mainForceResults);
                    // 处理主力资金数据，生成信号
                    for (const data of mainForceResults) {
                        // 确保数据格式正确
                        if (data && data.stockCode) {
                            signalManager.processMainForceData(data);
                            mainForceTracker.updateMainForceData(data);
                        }
                    }
                    // 更新未读信号计数
                    const signalHistory = signalManager.getSignalHistory();
                    const unreadCount = signalHistory.filter(s => !s.isRead).length;
                    setUnreadSignalCount(unreadCount);
                }
            }
        }
        catch (error) {
            console.error('获取主力资金数据失败:', error);
        }
        finally {
            setLoadingMainForce(false);
        }
    }, [stocks, signalManager, mainForceTracker]);
    // 集成实时数据监听
    useEffect(() => {
        // 启动模拟实时数据（实际项目中会使用真实的WebSocket连接）
        const mockTimer = startMockRealTimeData((data) => {
            // 处理实时数据更新
            setStocks(prevStocks => {
                const updatedStocks = [...prevStocks];
                const index = updatedStocks.findIndex(stock => stock.code === data.stockCode);
                if (index >= 0) {
                    updatedStocks[index] = {
                        code: data.stockCode,
                        name: updatedStocks[index].name,
                        price: data.price,
                        change: data.change,
                        changePercent: data.changePercent
                    };
                }
                return updatedStocks;
            });
        }, 3000); // 每3秒更新一次
        // 启动主力资金监控
        const mainForceTimer = setInterval(() => {
            updateMainForceData();
        }, 5000); // 每5秒更新一次主力资金数据
        return () => {
            if (mockTimer) {
                clearInterval(mockTimer);
            }
            if (mainForceTimer) {
                clearInterval(mainForceTimer);
            }
        };
    }, [updateMainForceData]);
    // 自动更新
    useEffect(() => {
        if (autoUpdate) {
            intervalRef.current = setInterval(() => {
                updateRealtimeData();
            }, 5000); // 每5秒更新一次
        }
        else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [autoUpdate, updateRealtimeData]);
    // 加载个性化推荐
    const loadRecommendations = useCallback(async () => {
        setLoadingRecommendations(true);
        try {
            const recommendationService = getPersonalizedRecommendation();
            const recs = recommendationService.generateRecommendations();
            setRecommendations(recs);
        }
        catch (error) {
            console.error('加载推荐失败:', error);
        }
        finally {
            setLoadingRecommendations(false);
        }
    }, []);
    // 加载市场热点数据
    const loadHotspotData = useCallback(async () => {
        setLoadingHotspot(true);
        try {
            // 模拟市场热点数据
            const mockHotspotData = [
                { industry: '人工智能', rank: 1, change: 5.2, stocks: 156, popularity: 95 },
                { industry: '半导体', rank: 2, change: 4.8, stocks: 124, popularity: 90 },
                { industry: '新能源', rank: 3, change: 3.5, stocks: 187, popularity: 85 },
                { industry: '医药', rank: 4, change: 2.1, stocks: 213, popularity: 75 },
                { industry: '金融', rank: 5, change: 1.8, stocks: 145, popularity: 70 },
            ];
            setHotspotData(mockHotspotData);
        }
        catch (error) {
            console.error('加载热点数据失败:', error);
        }
        finally {
            setLoadingHotspot(false);
        }
    }, []);
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
    // 计算主力资金流向
    const calculateMainForceFlow = useCallback(() => {
        try {
            const totalFlow = mainForceData.reduce((sum, data) => sum + data.mainForceNetFlow, 0);
            const buyFlow = mainForceData.filter(data => data.mainForceNetFlow > 0).reduce((sum, data) => sum + data.mainForceNetFlow, 0);
            const sellFlow = mainForceData.filter(data => data.mainForceNetFlow < 0).reduce((sum, data) => sum + Math.abs(data.mainForceNetFlow), 0);
            setMainForceFlow({ total: totalFlow, buy: buyFlow, sell: sellFlow });
        }
        catch (error) {
            console.error('计算主力资金流向失败:', error);
        }
    }, [mainForceData]);
    // 加载数据源健康状态
    const loadDataSourceHealth = useCallback(() => {
        setLoadingDataSource(true);
        try {
            const healthStatus = stockDataSource.getHealthStatus();
            let healthArray = [];
            // 检查 healthStatus 是否为 Map
            if (healthStatus instanceof Map) {
                healthArray = Array.from(healthStatus.entries()).map(([source, health]) => ({
                    source,
                    status: health.status,
                    successRate: health.successCount / (health.successCount + health.errorCount || 1),
                    responseTime: health.responseTime,
                    lastCheck: health.lastCheck
                }));
            }
            else {
                // 如果是单个对象，转换为数组
                healthArray = [{
                        source: healthStatus.source,
                        status: healthStatus.status,
                        successRate: healthStatus.successCount / (healthStatus.successCount + healthStatus.errorCount || 1),
                        responseTime: healthStatus.responseTime,
                        lastCheck: healthStatus.lastCheck
                    }];
            }
            setDataSourceHealth(healthArray);
        }
        catch (error) {
            console.error('加载数据源健康状态失败:', error);
        }
        finally {
            setLoadingDataSource(false);
        }
    }, [stockDataSource]);
    // 加载风险评估
    const loadRiskAssessments = useCallback(() => {
        setLoadingRisk(true);
        try {
            const assessments = riskManager.getRiskAssessments();
            if (assessments.length === 0) {
                // 为当前股票生成风险评估
                stocks.forEach(stock => {
                    riskManager.assessStockRisk(stock.code, stock.name);
                });
            }
            const updatedAssessments = riskManager.getRiskAssessments();
            setRiskAssessments(updatedAssessments);
        }
        catch (error) {
            console.error('加载风险评估失败:', error);
        }
        finally {
            setLoadingRisk(false);
        }
    }, [stocks, riskManager]);
    // 加载风险预警
    const loadRiskAlerts = useCallback(() => {
        try {
            const alerts = riskManager.generateRiskAlerts(stocks.map(stock => ({ code: stock.code, name: stock.name, price: stock.price })));
            setRiskAlerts(riskManager.getRiskAlerts());
        }
        catch (error) {
            console.error('加载风险预警失败:', error);
        }
    }, [stocks, riskManager]);
    // 分析投资组合风险
    const analyzePortfolioRisk = useCallback(() => {
        try {
            const portfolio = riskManager.analyzePortfolio(stocks.map((stock, index) => ({
                code: stock.code,
                name: stock.name,
                weight: 1 / stocks.length,
                price: stock.price
            })));
            setPortfolioRisk(portfolio);
        }
        catch (error) {
            console.error('分析投资组合风险失败:', error);
        }
    }, [stocks, riskManager]);
    // 初始化主力资金流向图表
    const initMainForceChart = useCallback(() => {
        if (mainForceChartRef.current) {
            mainForceChart.current = echarts.init(mainForceChartRef.current);
            updateMainForceChart();
        }
    }, []);
    // 更新主力资金流向图表
    const updateMainForceChart = useCallback(() => {
        if (mainForceChart.current) {
            const option = {
                title: {
                    text: '主力资金流向',
                    left: 'center',
                    textStyle: {
                        fontSize: 14
                    }
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    }
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: ['资金流入', '资金流出'],
                    axisLabel: {
                        fontSize: 12
                    }
                },
                yAxis: {
                    type: 'value',
                    axisLabel: {
                        fontSize: 12,
                        formatter: (value) => (value / 100000000).toFixed(2) + '亿'
                    }
                },
                series: [
                    {
                        name: '资金流向',
                        type: 'bar',
                        data: [
                            { value: mainForceFlow.buy, itemStyle: { color: '#cf1322' } },
                            { value: mainForceFlow.sell, itemStyle: { color: '#3f8600' } }
                        ],
                        label: {
                            show: true,
                            position: 'top',
                            formatter: (params) => (params.value / 100000000).toFixed(2) + '亿'
                        }
                    }
                ]
            };
            mainForceChart.current.setOption(option);
        }
    }, [mainForceFlow]);
    // 初始化市场热点图表
    const initHotspotChart = useCallback(() => {
        if (hotspotChartRef.current) {
            hotspotChart.current = echarts.init(hotspotChartRef.current);
            updateHotspotChart();
        }
    }, []);
    // 更新市场热点图表
    const updateHotspotChart = useCallback(() => {
        if (hotspotChart.current && hotspotData.length > 0) {
            const industries = hotspotData.map(item => item.industry);
            const changes = hotspotData.map(item => item.change);
            const popularities = hotspotData.map(item => item.popularity);
            const option = {
                title: {
                    text: '市场热点分析',
                    left: 'center',
                    textStyle: {
                        fontSize: 14
                    }
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    }
                },
                legend: {
                    data: ['涨跌幅', '人气'],
                    bottom: 0
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '15%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: industries,
                    axisLabel: {
                        fontSize: 11,
                        rotate: 30
                    }
                },
                yAxis: [
                    {
                        type: 'value',
                        name: '涨跌幅(%)',
                        position: 'left',
                        axisLabel: {
                            formatter: '{value}%'
                        }
                    },
                    {
                        type: 'value',
                        name: '人气',
                        position: 'right',
                        max: 100,
                        axisLabel: {
                            formatter: '{value}'
                        }
                    }
                ],
                series: [
                    {
                        name: '涨跌幅',
                        type: 'bar',
                        data: changes,
                        itemStyle: {
                            color: (params) => params.value >= 0 ? '#cf1322' : '#3f8600'
                        }
                    },
                    {
                        name: '人气',
                        type: 'line',
                        yAxisIndex: 1,
                        data: popularities,
                        itemStyle: {
                            color: '#1890ff'
                        },
                        lineStyle: {
                            width: 2
                        }
                    }
                ]
            };
            hotspotChart.current.setOption(option);
        }
    }, [hotspotData]);
    // 监控全市场股票的主力资金数据
    const monitorMarketMainForceData = useCallback(async () => {
        try {
            // 获取全市场股票列表（这里使用模拟数据，实际项目中需要从API获取）
            const marketStocks = [
                '000001', '600519', '002594', '300750', '601318',
                '000858', '000333', '601888', '600036', '601988'
            ];
            // 使用同花顺数据源获取主力资金数据
            const source = getStockDataSource('ths');
            const mainForceResults = await source.getMainForceData(marketStocks);
            if (mainForceResults && mainForceResults.length > 0) {
                // 处理主力资金数据，生成信号
                for (const data of mainForceResults) {
                    // 确保数据格式正确
                    if (data && data.stockCode) {
                        signalManager.processMainForceData(data);
                        mainForceTracker.updateMainForceData(data);
                    }
                }
                // 更新未读信号计数
                const signalHistory = signalManager.getSignalHistory();
                const unreadCount = signalHistory.filter(s => !s.isRead).length;
                setUnreadSignalCount(unreadCount);
            }
        }
        catch (error) {
            console.error('监控全市场主力资金数据失败:', error);
        }
    }, [signalManager, mainForceTracker]);
    // 初始加载数据
    useEffect(() => {
        const loadAllData = async () => {
            try {
                // 并行加载数据，提升加载速度
                await Promise.all([
                    updateRealtimeData(),
                    loadRecommendations(),
                    loadHotspotData(),
                    loadLatestSignals(),
                    loadDataSourceHealth(),
                    loadRiskAssessments(),
                    loadRiskAlerts(),
                    analyzePortfolioRisk(),
                    updateMainForceData(),
                    monitorMarketMainForceData()
                ]);
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
    }, [updateRealtimeData, loadRecommendations, loadHotspotData, loadLatestSignals, loadDataSourceHealth, loadRiskAssessments, loadRiskAlerts, analyzePortfolioRisk, updateMainForceData, monitorMarketMainForceData]);
    // 当主力资金数据更新时，计算资金流向
    useEffect(() => {
        calculateMainForceFlow();
    }, [mainForceData, calculateMainForceFlow]);
    // 初始化图表
    useEffect(() => {
        initMainForceChart();
        initHotspotChart();
        // 监听窗口大小变化，调整图表大小
        const handleResize = () => {
            mainForceChart.current?.resize();
            hotspotChart.current?.resize();
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            mainForceChart.current?.dispose();
            hotspotChart.current?.dispose();
        };
    }, [initMainForceChart, initHotspotChart]);
    // 当主力资金流向数据更新时，更新图表
    useEffect(() => {
        updateMainForceChart();
    }, [mainForceFlow, updateMainForceChart]);
    // 当市场热点数据更新时，更新图表
    useEffect(() => {
        updateHotspotChart();
    }, [hotspotData, updateHotspotChart]);
    // 当股票列表更新时，重新计算风险评估
    useEffect(() => {
        if (stocks.length > 0) {
            loadRiskAssessments();
            loadRiskAlerts();
            analyzePortfolioRisk();
        }
    }, [stocks, loadRiskAssessments, loadRiskAlerts, analyzePortfolioRisk]);
    // 定期监控全市场
    useEffect(() => {
        // 每10秒监控一次全市场
        const marketMonitorTimer = setInterval(() => {
            monitorMarketMainForceData();
            loadLatestSignals();
        }, 10000);
        // 每30秒更新一次热点数据和数据源健康状态
        const hotspotTimer = setInterval(() => {
            loadHotspotData();
            loadDataSourceHealth();
        }, 30000);
        return () => {
            if (marketMonitorTimer) {
                clearInterval(marketMonitorTimer);
            }
            if (hotspotTimer) {
                clearInterval(hotspotTimer);
            }
        };
    }, [monitorMarketMainForceData, loadLatestSignals, loadHotspotData, loadDataSourceHealth]);
    const handleToggleAutoUpdate = useCallback(() => {
        setAutoUpdate(!autoUpdate);
        message.success(autoUpdate ? '自动更新已关闭' : '自动更新已开启');
    }, [autoUpdate]);
    const handleManualUpdate = useCallback(() => {
        setLoadingStocks(true);
        updateRealtimeData();
        message.success('数据已更新');
    }, [updateRealtimeData]);
    // 防抖搜索
    const debouncedSearch = useMemo(() => {
        return debounce(async () => {
            if (!searchCode) {
                message.error('请输入股票代码');
                return;
            }
            setLoading(true);
            try {
                const results = await getRealtimeQuote([searchCode]);
                if (results && results.length > 0) {
                    const stock = results[0];
                    // 检查是否已在列表中
                    const existingIndex = stocks.findIndex(s => s.code === stock.code);
                    if (existingIndex >= 0) {
                        // 更新现有股票
                        const updatedStocks = [...stocks];
                        updatedStocks[existingIndex] = {
                            code: stock.code,
                            name: stock.name,
                            price: stock.price,
                            change: stock.change,
                            changePercent: stock.changePercent
                        };
                        setStocks(updatedStocks);
                        message.success(`已更新股票：${stock.name}(${stock.code})`);
                    }
                    else {
                        // 添加新股票
                        setStocks(prevStocks => [...prevStocks, {
                                code: stock.code,
                                name: stock.name,
                                price: stock.price,
                                change: stock.change,
                                changePercent: stock.changePercent
                            }]);
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
    const handleRecommendationClick = useCallback((recommendation) => {
        const recommendationService = getPersonalizedRecommendation();
        recommendationService.recordRecommendationInteraction(recommendation.stockCode, recommendation.stockName, 'analyze');
        setSearchCode(recommendation.stockCode);
        debouncedSearch();
    }, [debouncedSearch]);
    // 计算市场数据的样式
    const marketDataItems = useMemo(() => {
        if (loadingStocks) {
            return Array(3).fill(0).map((_, index) => (_jsx(Col, { xs: 24, sm: 12, md: 8, children: _jsx(Card, { size: "small", style: { margin: '2px' }, children: _jsx(Skeleton, { active: true, paragraph: { rows: 1 }, title: false }) }) }, index)));
        }
        return marketData.map((market, index) => (_jsx(Col, { xs: 24, sm: 12, md: 8, children: _jsx(Card, { size: "small", style: { margin: '2px' }, children: _jsx(Statistic, { title: market.name, value: market.value, precision: 2, valueStyle: { color: market.change >= 0 ? '#cf1322' : '#3f8600', fontSize: '16px' }, prefix: market.change >= 0 ? _jsx(ArrowUpOutlined, {}) : _jsx(ArrowDownOutlined, {}), suffix: _jsxs("span", { style: { fontSize: '10px' }, children: ["(", market.change >= 0 ? '+' : '', market.change.toFixed(2), ", ", market.changePercent >= 0 ? '+' : '', market.changePercent.toFixed(2), "%)"] }) }) }) }, index)));
    }, [marketData, loadingStocks]);
    // 计算推荐股票的样式
    const recommendationItems = useMemo(() => {
        if (loadingRecommendations) {
            return Array(5).fill(0).map((_, index) => (_jsx(List.Item, { children: _jsx(Skeleton, { active: true, paragraph: { rows: 2 } }) }, index)));
        }
        return recommendations.map((recommendation) => (_jsx(List.Item, { onClick: () => handleRecommendationClick(recommendation), style: { cursor: 'pointer', borderRadius: '4px', padding: '8px 0' }, children: _jsxs("div", { style: { display: 'flex', flexDirection: 'column', width: '100%' }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }, children: [_jsxs("div", { style: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px' }, children: [_jsx("span", { style: { fontWeight: 'bold', fontSize: '14px' }, children: recommendation.stockName }), _jsx("span", { style: { color: '#666', fontSize: '12px' }, children: recommendation.stockCode }), _jsxs(Tag, { color: recommendation.category === 'trending' ? 'red' : recommendation.category === 'similar' ? 'blue' : recommendation.category === 'technical' ? 'green' : 'purple', style: { fontSize: '12px', padding: '2px 8px' }, children: [recommendation.category === 'trending' ? _jsx(FireOutlined, {}) : recommendation.category === 'similar' ? _jsx(LikeOutlined, {}) : recommendation.category === 'technical' ? _jsx(LineChartOutlined, {}) : _jsx(WarningOutlined, {}), recommendation.category === 'trending' ? '热门' : recommendation.category === 'similar' ? '相似' : recommendation.category === 'technical' ? '技术' : '历史'] })] }), _jsx("div", { style: { textAlign: 'right' }, children: _jsxs("div", { style: { fontSize: '12px', fontWeight: 'bold', color: '#1890ff' }, children: ["\u5339\u914D\u5EA6 ", Math.round(recommendation.score * 100), "%"] }) })] }), _jsx("div", { style: { marginTop: '4px', fontSize: '11px', color: '#666', lineHeight: '1.4' }, children: recommendation.reasons.map((reason, index) => (_jsxs("span", { style: { marginRight: '8px' }, children: ["\u2022 ", reason] }, index))) })] }) }, recommendation.stockCode)));
    }, [recommendations, loadingRecommendations, handleRecommendationClick]);
    return (_jsx("div", { className: "dashboard", style: { padding: 0, margin: 0 }, children: initialLoading ? (_jsx("div", { style: { padding: '20px' }, children: _jsx(Skeleton, { active: true, paragraph: { rows: 10 } }) })) : (_jsxs(_Fragment, { children: [_jsx(Card, { style: { marginBottom: '2px', borderRadius: '4px', margin: '2px' }, size: "small", children: _jsxs(Row, { gutter: [2, 2], align: "middle", children: [_jsx(Col, { xs: 20, sm: 8, md: 6, children: _jsx(Input, { value: searchCode, onChange: (e) => setSearchCode(e.target.value), placeholder: "\u8F93\u5165\u80A1\u7968\u4EE3\u7801", size: "small", prefix: _jsx(SearchOutlined, {}), suffix: _jsx(ReloadOutlined, { style: { cursor: 'pointer' }, onClick: handleManualUpdate }) }) }), _jsx(Col, { xs: 4, sm: 2, md: 2, children: _jsx(Button, { type: "primary", size: "small", icon: _jsx(SearchOutlined, {}), onClick: handleSearch, loading: loading, children: "\u641C\u7D22" }) }), _jsx(Col, { xs: 24, sm: 12, md: 14, style: { marginTop: '8px' }, children: _jsxs("div", { style: { display: 'flex', justifyContent: 'flex-end', gap: '8px', alignItems: 'center' }, children: [_jsx(Button, { size: "small", icon: _jsx(StarOutlined, {}), onClick: () => message.info('收藏功能开发中') }), _jsx(Button, { size: "small", icon: _jsx(AppstoreOutlined, {}), onClick: () => message.info('应用商店功能开发中') }), _jsx(Button, { size: "small", icon: _jsx(ShareAltOutlined, {}), onClick: () => message.info('分享功能开发中') }), _jsx(Button, { size: "small", icon: _jsx(Badge, { count: unreadSignalCount, showZero: false, children: _jsx(BellOutlined, {}) }), onClick: () => {
                                                // 跳转到信号页面
                                                window.location.href = '/signal';
                                            } }), _jsx(Button, { size: "small", type: autoUpdate ? 'default' : 'primary', onClick: handleToggleAutoUpdate, children: autoUpdate ? '关闭' : '开启' })] }) }), _jsx(Col, { xs: 24, sm: 8, md: 8, style: { marginTop: '8px' }, children: _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }, children: [_jsxs("span", { style: { fontSize: '12px', color: '#666' }, children: ["\u81EA\u52A8\u66F4\u65B0: ", autoUpdate ? '开启' : '关闭'] }), _jsxs("span", { style: { fontSize: '12px', color: '#666' }, children: ["\u6700\u540E\u66F4\u65B0: ", formatLastUpdate()] })] }) })] }) }), _jsx(Row, { gutter: [2, 2], style: { marginBottom: '2px' }, children: marketDataItems }), _jsx(Card, { size: "small", title: "\u81EA\u9009\u80A1", style: { margin: '2px' }, children: loadingStocks ? (_jsx("div", { children: Array(5).fill(0).map((_, index) => (_jsx(List.Item, { children: _jsx(Skeleton, { active: true, paragraph: { rows: 1 }, title: false }) }, index))) })) : (_jsx(List, { dataSource: stocks, renderItem: (stock) => (_jsx(List.Item, { children: _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }, children: [_jsx("div", { children: _jsxs(Space, { children: [_jsx("span", { style: { fontWeight: 'bold' }, children: stock.name }), _jsx("span", { style: { color: '#666' }, children: stock.code })] }) }), _jsxs("div", { style: { textAlign: 'right' }, children: [_jsx("div", { style: { fontSize: '16px', fontWeight: 'bold', color: stock.change >= 0 ? '#cf1322' : '#3f8600' }, children: stock.price.toFixed(2) }), _jsxs(Tag, { color: stock.change >= 0 ? 'red' : 'green', children: [stock.change >= 0 ? '+' : '', stock.change.toFixed(2), " (", stock.changePercent >= 0 ? '+' : '', stock.changePercent.toFixed(2), "%)"] })] })] }) })) })) }), _jsx(Card, { size: "small", title: "\u4E2A\u6027\u5316\u63A8\u8350", style: { margin: '2px' }, children: _jsx(List, { dataSource: recommendations, renderItem: () => null, locale: { emptyText: '暂无推荐股票' }, children: recommendationItems }) }), _jsxs(Row, { gutter: [2, 2], style: { marginTop: '2px' }, children: [_jsx(Col, { xs: 24, md: 12, children: _jsx(Card, { size: "small", title: "\u5E02\u573A\u70ED\u70B9\u5206\u6790", style: { margin: '2px' }, children: loadingHotspot ? (_jsx(Skeleton, { active: true, paragraph: { rows: 5 } })) : (_jsxs(_Fragment, { children: [_jsx("div", { ref: hotspotChartRef, style: { width: '100%', height: '200px', marginBottom: '16px' } }), _jsx(List, { dataSource: hotspotData, renderItem: (item, index) => (_jsx(List.Item, { style: { padding: '6px 0' }, children: _jsxs("div", { style: { display: 'flex', flexDirection: 'column', width: '100%' }, children: [_jsx("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }, children: _jsxs("div", { style: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px' }, children: [_jsx(Tag, { color: "orange", style: { fontSize: '12px', padding: '2px 8px' }, children: item.rank }), _jsx("span", { style: { fontWeight: 'bold', fontSize: '14px' }, children: item.industry }), _jsxs(Tag, { color: item.change >= 0 ? 'red' : 'green', style: { fontSize: '12px', padding: '2px 8px' }, children: [item.change >= 0 ? '+' : '', item.change.toFixed(2), "%"] })] }) }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#666' }, children: [_jsxs("span", { children: [item.stocks, "\u53EA\u80A1\u7968"] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center' }, children: [_jsx(FireOutlined, { style: { color: '#ff4d4f', fontSize: '12px', marginRight: '2px' } }), _jsxs("span", { children: ["\u4EBA\u6C14 ", item.popularity] })] })] })] }) }, index)), locale: { emptyText: '暂无热点数据' } })] })) }) }), _jsx(Col, { xs: 24, md: 12, children: _jsx(Card, { size: "small", title: "\u6700\u65B0\u4FE1\u53F7\u5206\u6790", style: { margin: '2px' }, children: _jsx(List, { dataSource: latestSignals, renderItem: (signal, index) => (_jsx(List.Item, { style: { padding: '6px 0' }, children: _jsxs("div", { style: { display: 'flex', flexDirection: 'column', width: '100%' }, children: [_jsxs("div", { style: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px', marginBottom: '2px' }, children: [_jsxs(Tag, { color: signal.type === 'buy' ? 'red' : 'green', style: { fontSize: '12px', padding: '2px 8px' }, children: [signal.type === 'buy' ? _jsx(RiseOutlined, {}) : _jsx(FallOutlined, {}), signal.type === 'buy' ? '买入' : '卖出'] }), _jsx("span", { style: { fontWeight: 'bold', fontSize: '14px' }, children: signal.stockName }), _jsx("span", { style: { color: '#666', fontSize: '12px' }, children: signal.stockCode })] }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#666', marginTop: '2px' }, children: [_jsx("div", { style: { flex: 1, marginRight: '8px' }, children: signal.reason }), _jsxs("div", { style: { textAlign: 'right', minWidth: '80px' }, children: [_jsxs("div", { style: { fontWeight: 'bold', color: '#1890ff' }, children: ["\u4FE1\u5FC3 ", signal.confidence, "%"] }), _jsx("div", { style: { marginTop: '2px' }, children: new Date(signal.timestamp).toLocaleTimeString() })] })] })] }) }, index)), locale: { emptyText: '暂无信号' } }) }) })] }), _jsxs(Row, { gutter: [2, 2], style: { marginTop: '2px' }, children: [_jsx(Col, { xs: 24, md: 12, children: _jsxs(Card, { size: "small", title: "\u4E3B\u529B\u8D44\u91D1\u6D41\u5411", style: { margin: '2px' }, children: [_jsx("div", { style: { marginBottom: '16px' }, children: _jsx(Statistic, { title: "\u603B\u4F53\u8D44\u91D1\u6D41\u5411", value: mainForceFlow.total / 100000000, precision: 2, suffix: "\u4EBF\u5143", valueStyle: { color: mainForceFlow.total >= 0 ? '#cf1322' : '#3f8600' }, prefix: mainForceFlow.total >= 0 ? _jsx(ArrowUpOutlined, {}) : _jsx(ArrowDownOutlined, {}) }) }), _jsx("div", { ref: mainForceChartRef, style: { width: '100%', height: '200px', marginBottom: '16px' } }), _jsxs(Row, { gutter: [2, 2], children: [_jsx(Col, { span: 12, children: _jsx(Card, { size: "small", style: { margin: '2px' }, children: _jsx(Statistic, { title: "\u8D44\u91D1\u6D41\u5165", value: mainForceFlow.buy / 100000000, precision: 2, suffix: "\u4EBF\u5143", valueStyle: { color: '#cf1322' }, prefix: _jsx(ArrowUpOutlined, {}) }) }) }), _jsx(Col, { span: 12, children: _jsx(Card, { size: "small", style: { margin: '2px' }, children: _jsx(Statistic, { title: "\u8D44\u91D1\u6D41\u51FA", value: mainForceFlow.sell / 100000000, precision: 2, suffix: "\u4EBF\u5143", valueStyle: { color: '#3f8600' }, prefix: _jsx(ArrowDownOutlined, {}) }) }) })] })] }) }), _jsx(Col, { xs: 24, md: 12, children: _jsx(Card, { size: "small", title: "\u6570\u636E\u6E90\u5065\u5EB7\u72B6\u6001", style: { margin: '2px' }, children: _jsx(List, { dataSource: dataSourceHealth, renderItem: (item, index) => (_jsx(List.Item, { style: { padding: '6px 0' }, children: _jsxs("div", { style: { display: 'flex', flexDirection: 'column', width: '100%' }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }, children: [_jsxs("div", { style: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px' }, children: [_jsx("span", { style: { fontWeight: 'bold', fontSize: '14px' }, children: item.source }), _jsx(Tag, { color: item.status === 'healthy' ? 'green' : item.status === 'degraded' ? 'orange' : 'red', style: { fontSize: '12px', padding: '2px 8px' }, children: item.status === 'healthy' ? '健康' : item.status === 'degraded' ? '降级' : '不健康' })] }), item.responseTime && (_jsxs("span", { style: { fontSize: '11px', color: '#666' }, children: [item.responseTime, "ms"] }))] }), _jsxs("div", { style: { marginTop: '4px' }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#666', marginBottom: '2px' }, children: [_jsx("span", { children: "\u6210\u529F\u7387" }), _jsxs("span", { children: [Math.round(item.successRate * 100), "%"] })] }), _jsx(Progress, { percent: Math.round(item.successRate * 100), size: "small" })] })] }) }, index)), locale: { emptyText: '暂无数据源健康状态' } }) }) })] }), _jsxs(Row, { gutter: [2, 2], style: { marginTop: '2px' }, children: [_jsx(Col, { xs: 24, md: 12, children: _jsx(Card, { size: "small", title: "\u80A1\u7968\u98CE\u9669\u8BC4\u4F30", style: { margin: '2px' }, children: loadingRisk ? (_jsx(Skeleton, { active: true, paragraph: { rows: 5 } })) : (_jsx(List, { dataSource: riskAssessments, renderItem: (assessment, index) => (_jsx(List.Item, { style: { padding: '6px 0' }, children: _jsxs("div", { style: { display: 'flex', flexDirection: 'column', width: '100%' }, children: [_jsxs("div", { style: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px', marginBottom: '4px' }, children: [_jsx("span", { style: { fontWeight: 'bold', fontSize: '14px' }, children: assessment.stockName }), _jsx("span", { style: { color: '#666', fontSize: '12px' }, children: assessment.stockCode }), _jsx(Tag, { color: assessment.riskLevel === 'low' ? 'green' :
                                                                assessment.riskLevel === 'medium' ? 'blue' :
                                                                    assessment.riskLevel === 'high' ? 'orange' : 'red', style: { fontSize: '12px', padding: '2px 8px' }, children: assessment.riskLevel === 'low' ? '低风险' :
                                                                assessment.riskLevel === 'medium' ? '中风险' :
                                                                    assessment.riskLevel === 'high' ? '高风险' : '极高风险' })] }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#666' }, children: [_jsxs("div", { children: ["\u98CE\u9669\u8BC4\u5206: ", assessment.riskScore, "/100 | \u6CE2\u52A8\u7387: ", (assessment.volatility * 100).toFixed(2), "%"] }), _jsxs("div", { style: { textAlign: 'right' }, children: [_jsxs("div", { style: { fontWeight: 'bold', color: '#1890ff' }, children: ["\u590F\u666E: ", assessment.sharpeRatio.toFixed(2)] }), _jsxs("div", { style: { marginTop: '2px' }, children: ["\u6700\u5927\u56DE\u64A4: ", (assessment.maxDrawdown * 100).toFixed(2), "%"] })] })] })] }) }, index)), locale: { emptyText: '暂无风险评估数据' } })) }) }), _jsx(Col, { xs: 24, md: 12, children: _jsx(Card, { size: "small", title: "\u98CE\u9669\u9884\u8B66", style: { margin: '2px' }, children: _jsx(List, { dataSource: riskAlerts, renderItem: (alert, index) => (_jsx(List.Item, { style: { padding: '6px 0' }, children: _jsxs("div", { style: { display: 'flex', flexDirection: 'column', width: '100%' }, children: [_jsxs("div", { style: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px', marginBottom: '4px' }, children: [_jsxs(Tag, { color: alert.severity === 'low' ? 'green' :
                                                                alert.severity === 'medium' ? 'orange' : 'red', style: { fontSize: '12px', padding: '2px 8px' }, children: [alert.severity === 'low' ? '低' :
                                                                    alert.severity === 'medium' ? '中' : '高', "\u98CE\u9669"] }), _jsx("span", { style: { fontWeight: 'bold', fontSize: '14px' }, children: alert.stockName }), _jsx("span", { style: { color: '#666', fontSize: '12px' }, children: alert.stockCode })] }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#666' }, children: [_jsx("div", { style: { flex: 1, marginRight: '8px' }, children: alert.message }), _jsx("div", { style: { textAlign: 'right', minWidth: '80px' }, children: new Date(alert.timestamp).toLocaleTimeString() })] })] }) }, index)), locale: { emptyText: '暂无风险预警' } }) }) })] }), _jsx(Row, { gutter: [2, 2], style: { marginTop: '2px' }, children: _jsx(Col, { xs: 24, children: _jsx(Card, { size: "small", title: "\u6295\u8D44\u7EC4\u5408\u98CE\u9669\u5206\u6790", style: { margin: '2px' }, children: portfolioRisk ? (_jsxs("div", { children: [_jsxs(Row, { gutter: [2, 2], children: [_jsx(Col, { xs: 24, sm: 8, children: _jsxs(Card, { size: "small", style: { margin: '2px' }, children: [_jsx(Statistic, { title: "\u603B\u4F53\u98CE\u9669\u8BC4\u5206", value: portfolioRisk.totalRiskScore, precision: 0, suffix: "/100", valueStyle: { color: portfolioRisk.riskLevel === 'low' ? '#52c41a' :
                                                                    portfolioRisk.riskLevel === 'medium' ? '#1890ff' :
                                                                        portfolioRisk.riskLevel === 'high' ? '#faad14' : '#ff4d4f'
                                                            } }), _jsx("div", { style: { marginTop: '8px', textAlign: 'center' }, children: _jsx(Tag, { color: portfolioRisk.riskLevel === 'low' ? 'green' :
                                                                    portfolioRisk.riskLevel === 'medium' ? 'blue' :
                                                                        portfolioRisk.riskLevel === 'high' ? 'orange' : 'red', children: portfolioRisk.riskLevel === 'low' ? '低风险' :
                                                                    portfolioRisk.riskLevel === 'medium' ? '中风险' :
                                                                        portfolioRisk.riskLevel === 'high' ? '高风险' : '极高风险' }) })] }) }), _jsx(Col, { xs: 24, sm: 8, style: { marginTop: '2px' }, children: _jsxs(Card, { size: "small", style: { margin: '2px' }, children: [_jsx(Statistic, { title: "\u6295\u8D44\u7EC4\u5408\u4EF7\u503C", value: portfolioRisk.totalValue, precision: 2, suffix: "\u5143", valueStyle: { color: '#1890ff' } }), _jsx("div", { style: { marginTop: '8px', textAlign: 'center' }, children: _jsxs("span", { style: { fontSize: '12px', color: '#666' }, children: ["\u590F\u666E\u6BD4\u7387: ", portfolioRisk.sharpeRatio.toFixed(2)] }) })] }) }), _jsx(Col, { xs: 24, sm: 8, style: { marginTop: '2px' }, children: _jsxs(Card, { size: "small", style: { margin: '2px' }, children: [_jsx(Statistic, { title: "\u98CE\u9669\u4EF7\u503C (VaR)", value: portfolioRisk.VaR, precision: 2, suffix: "\u5143", valueStyle: { color: '#faad14' } }), _jsx("div", { style: { marginTop: '8px', textAlign: 'center' }, children: _jsxs("span", { style: { fontSize: '12px', color: '#666' }, children: ["\u6700\u5927\u56DE\u64A4: ", (portfolioRisk.maxDrawdown * 100).toFixed(2), "%"] }) })] }) })] }), _jsxs("div", { style: { marginTop: '16px' }, children: [_jsx("h4", { style: { marginBottom: '8px', fontSize: '14px' }, children: "\u884C\u4E1A\u5206\u5E03" }), _jsx("div", { style: { display: 'flex', flexWrap: 'wrap', gap: '6px' }, children: Object.entries(portfolioRisk.sectorDistribution).map(([sector, percentage]) => (_jsxs(Tag, { color: "blue", style: { margin: '2px 0', fontSize: '12px', padding: '2px 8px' }, children: [sector, ": ", String(percentage), "%"] }, sector))) })] }), _jsxs("div", { style: { marginTop: '16px' }, children: [_jsx("h4", { style: { marginBottom: '8px', fontSize: '14px' }, children: "\u98CE\u9669\u5EFA\u8BAE" }), _jsx(List, { dataSource: portfolioRisk.recommendations, renderItem: (recommendation, index) => (_jsx(List.Item, { style: { padding: '4px 0' }, children: _jsxs("div", { style: { display: 'flex', alignItems: 'center', fontSize: '13px' }, children: [_jsx(WarningOutlined, { style: { color: '#faad14', marginRight: '6px', fontSize: '14px' } }), _jsx("span", { children: String(recommendation) })] }) }, index)), locale: { emptyText: '暂无风险建议' } })] })] })) : (_jsx(Skeleton, { active: true, paragraph: { rows: 8 } })) }) }) })] })) }));
});
export default Dashboard;
