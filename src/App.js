import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, Spin } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import Layout from './components/Layout/Layout';
import './i18n';
import i18n from './i18n';
// 懒加载组件
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const StockDetail = lazy(() => import('./pages/StockDetail/StockDetail'));
const Trade = lazy(() => import('./pages/Trade/Trade'));
const AIAssistant = lazy(() => import('./pages/AIAssistant/AIAssistant'));
const Portfolio = lazy(() => import('./pages/Portfolio/Portfolio'));
const DataSource = lazy(() => import('./pages/DataSource/DataSource'));
const Settings = lazy(() => import('./pages/Settings/Settings'));
const MainForce = lazy(() => import('./pages/MainForce/MainForce'));
const ChipPeak = lazy(() => import('./pages/ChipPeak/ChipPeak'));
const Signal = lazy(() => import('./pages/Signal/Signal'));
const Prediction = lazy(() => import('./pages/Prediction/Prediction'));
const AIStrategy = lazy(() => import('./pages/AIStrategy/AIStrategy'));
const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(true);
    const [language, setLanguage] = useState(i18n.language);
    const handleLogout = () => {
        setIsLoggedIn(false);
    };
    const handleLanguageChange = (lang) => {
        setLanguage(lang);
        i18n.changeLanguage(lang);
    };
    useEffect(() => {
        const handleLanguageChange = () => {
            setLanguage(i18n.language);
        };
        i18n.on('languageChanged', handleLanguageChange);
        return () => {
            i18n.off('languageChanged', handleLanguageChange);
        };
    }, []);
    const getAntdLocale = () => {
        return language === 'zh-CN' ? zhCN : enUS;
    };
    return (_jsx(ConfigProvider, { locale: getAntdLocale(), children: _jsx(Router, { children: _jsx(Layout, { onLogout: handleLogout, language: language, onLanguageChange: handleLanguageChange, children: _jsx(Suspense, { fallback: _jsx("div", { style: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }, children: _jsx(Spin, { size: "large" }) }), children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Dashboard, {}) }), _jsx(Route, { path: "/stock", element: _jsx(StockDetail, {}) }), _jsx(Route, { path: "/trade", element: _jsx(Trade, {}) }), _jsx(Route, { path: "/signal", element: _jsx(Signal, {}) }), _jsx(Route, { path: "/mainforce", element: _jsx(MainForce, {}) }), _jsx(Route, { path: "/chippeak", element: _jsx(ChipPeak, {}) }), _jsx(Route, { path: "/prediction", element: _jsx(Prediction, {}) }), _jsx(Route, { path: "/aiassistant", element: _jsx(AIAssistant, {}) }), _jsx(Route, { path: "/aistrategy", element: _jsx(AIStrategy, {}) }), _jsx(Route, { path: "/portfolio", element: _jsx(Portfolio, {}) }), _jsx(Route, { path: "/datasource", element: _jsx(DataSource, {}) }), _jsx(Route, { path: "/settings", element: _jsx(Settings, {}) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] }) }) }) }) }));
};
export default App;
