import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, Spin, Modal, Button, List, Avatar, Typography, Divider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import Layout from './components/Layout/Layout';
import './i18n';
import i18n from './i18n';
// 懒加载组件 - 带预加载策略
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
const Login = lazy(() => import('./pages/Login/Login'));
// 预加载策略
const preloadComponents = () => {
    // 预加载核心组件
    setTimeout(() => {
        import('./pages/Dashboard/Dashboard');
        import('./pages/AIAssistant/AIAssistant');
    }, 1000);
    // 预加载常用组件
    setTimeout(() => {
        import('./pages/StockDetail/StockDetail');
        import('./pages/Trade/Trade');
        import('./pages/Signal/Signal');
    }, 3000);
};
// 代码分割配置
const withErrorBoundary = (Component) => {
    return (props) => {
        try {
            return _jsx(Component, { ...props });
        }
        catch (error) {
            console.error('Component error:', error);
            return _jsx("div", { style: { padding: '20px', textAlign: 'center' }, children: "\u7EC4\u4EF6\u52A0\u8F7D\u5931\u8D25\uFF0C\u8BF7\u5237\u65B0\u9875\u9762\u91CD\u8BD5" });
        }
    };
};
const { Text, Title } = Typography;
const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [language, setLanguage] = useState(i18n.language);
    const [showUserSwitcher, setShowUserSwitcher] = useState(false);
    const [showAuthorizationModal, setShowAuthorizationModal] = useState(false);
    const [selectedUserForAuth, setSelectedUserForAuth] = useState(null);
    const [showAuthorizationManagement, setShowAuthorizationManagement] = useState(false);
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme || 'light';
    });
    // 组件挂载时预加载
    useEffect(() => {
        preloadComponents();
    }, []);
    // 模拟用户列表
    const [users, setUsers] = useState([
        { id: '1', username: 'admin', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Admin', isAuthorized: true, authorizedBy: 'system', authorizedAt: Date.now() },
        { id: '2', username: 'user1', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=User1', isAuthorized: false },
        { id: '3', username: 'user2', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=User2', isAuthorized: false },
    ]);
    const handleLogout = () => {
        setIsLoggedIn(false);
        setCurrentUser(null);
        // 清除本地存储中的当前用户信息
        localStorage.removeItem('currentUser');
    };
    const handleLogin = (username, password) => {
        // 从本地存储读取用户信息
        const savedUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const savedUser = savedUsers.find((u) => u.username === username);
        // 找到对应的用户
        let user = users.find(u => u.username === username) || users[0];
        // 如果用户在本地存储中，更新用户信息
        if (savedUser) {
            user = {
                ...user,
                isAuthorized: savedUser.isAuthorized || false
            };
        }
        if (!user.isAuthorized && user.username !== 'admin') {
            // 如果用户未授权且不是admin，显示授权提示
            setSelectedUserForAuth(user);
            setShowAuthorizationModal(true);
            return;
        }
        setIsLoggedIn(true);
        setCurrentUser(user);
        // 将当前用户信息存储到本地存储
        localStorage.setItem('currentUser', JSON.stringify({
            username: user.username,
            id: user.id
        }));
    };
    const handleUserSwitch = (user) => {
        if (!user.isAuthorized) {
            // 如果用户未授权，显示授权提示
            setSelectedUserForAuth(user);
            setShowAuthorizationModal(true);
        }
        else {
            setCurrentUser(user);
            setShowUserSwitcher(false);
        }
    };
    const handleAuthorizeUser = (user) => {
        if (!currentUser)
            return;
        const updatedUsers = users.map(u => u.id === user.id
            ? { ...u, isAuthorized: true, authorizedBy: currentUser.username, authorizedAt: Date.now() }
            : u);
        setUsers(updatedUsers);
        // 更新本地存储中的用户授权状态
        const savedUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const updatedSavedUsers = savedUsers.map((u) => u.username === user.username
            ? { ...u, isAuthorized: true, authorizedBy: currentUser.username, authorizedAt: Date.now() }
            : u);
        localStorage.setItem('users', JSON.stringify(updatedSavedUsers));
        setShowAuthorizationModal(false);
        setSelectedUserForAuth(null);
    };
    const handleCancelAuthorization = () => {
        setShowAuthorizationModal(false);
        setSelectedUserForAuth(null);
    };
    const handleManageAuthorization = () => {
        setShowAuthorizationManagement(true);
    };
    const handleCancelAuthorizationManagement = () => {
        setShowAuthorizationManagement(false);
    };
    const handleToggleAuthorization = (user) => {
        if (!currentUser)
            return;
        const updatedUsers = users.map(u => u.id === user.id
            ? {
                ...u,
                isAuthorized: !u.isAuthorized,
                authorizedBy: !u.isAuthorized ? currentUser.username : undefined,
                authorizedAt: !u.isAuthorized ? Date.now() : undefined
            }
            : u);
        setUsers(updatedUsers);
        // 更新本地存储中的用户授权状态
        const savedUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const updatedSavedUsers = savedUsers.map((u) => u.username === user.username
            ? {
                ...u,
                isAuthorized: !user.isAuthorized,
                authorizedBy: !user.isAuthorized ? currentUser.username : undefined,
                authorizedAt: !user.isAuthorized ? Date.now() : undefined
            }
            : u);
        localStorage.setItem('users', JSON.stringify(updatedSavedUsers));
    };
    const handleLanguageChange = (lang) => {
        setLanguage(lang);
        i18n.changeLanguage(lang);
    };
    const handleThemeChange = (newTheme) => {
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
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
    return (_jsx(ConfigProvider, { locale: getAntdLocale(), children: _jsx(Router, { children: isLoggedIn && currentUser ? (_jsxs(_Fragment, { children: [_jsx(Layout, { onLogout: handleLogout, language: language, onLanguageChange: handleLanguageChange, currentUser: currentUser, onUserSwitch: () => setShowUserSwitcher(true), onManageAuthorization: handleManageAuthorization, theme: theme, onThemeChange: handleThemeChange, children: _jsx(Suspense, { fallback: _jsx("div", { style: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }, children: _jsx(Spin, { size: "large" }) }), children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Dashboard, {}) }), _jsx(Route, { path: "/stock", element: _jsx(StockDetail, {}) }), _jsx(Route, { path: "/trade", element: _jsx(Trade, {}) }), _jsx(Route, { path: "/signal", element: _jsx(Signal, {}) }), _jsx(Route, { path: "/mainforce", element: _jsx(MainForce, {}) }), _jsx(Route, { path: "/chippeak", element: _jsx(ChipPeak, {}) }), _jsx(Route, { path: "/prediction", element: _jsx(Prediction, {}) }), _jsx(Route, { path: "/aiassistant", element: _jsx(AIAssistant, {}) }), _jsx(Route, { path: "/aistrategy", element: _jsx(AIStrategy, {}) }), _jsx(Route, { path: "/portfolio", element: _jsx(Portfolio, {}) }), _jsx(Route, { path: "/datasource", element: _jsx(DataSource, {}) }), _jsx(Route, { path: "/settings", element: _jsx(Settings, {}) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] }) }) }), _jsxs(Modal, { title: "\u5207\u6362\u7528\u6237", open: showUserSwitcher, onCancel: () => setShowUserSwitcher(false), footer: [
                            _jsx(Button, { onClick: () => setShowUserSwitcher(false), children: "\u53D6\u6D88" }, "cancel")
                        ], width: 400, children: [_jsx(List, { itemLayout: "horizontal", dataSource: users, renderItem: (user) => (_jsx(List.Item, { actions: [
                                        _jsx(Button, { type: user.id === currentUser.id ? 'primary' : 'default', onClick: () => handleUserSwitch(user), disabled: !user.isAuthorized && user.id !== currentUser.id, children: user.id === currentUser.id ? '当前用户' : user.isAuthorized ? '切换' : '未授权' })
                                    ], children: _jsx(List.Item.Meta, { avatar: _jsx(Avatar, { src: user.avatar, style: { backgroundColor: user.isAuthorized ? '#52c41a' : '#d9d9d9' } }), title: _jsx(Text, { strong: true, children: user.username }), description: user.id === currentUser.id
                                            ? '当前登录用户'
                                            : user.isAuthorized
                                                ? `已授权 (${new Date(user.authorizedAt || 0).toLocaleString()})`
                                                : '未授权 - 需要管理员授权' }) }, user.id)) }), _jsx(Divider, {}), _jsx(Button, { type: "dashed", block: true, onClick: handleLogout, children: "\u9000\u51FA\u767B\u5F55" })] }), _jsx(Modal, { title: "\u7528\u6237\u6388\u6743", open: showAuthorizationModal, onCancel: handleCancelAuthorization, footer: [
                            _jsx(Button, { onClick: handleCancelAuthorization, children: "\u53D6\u6D88" }, "cancel"),
                            _jsx(Button, { type: "primary", onClick: () => selectedUserForAuth && handleAuthorizeUser(selectedUserForAuth), children: "\u6388\u6743" }, "authorize")
                        ], width: 400, children: selectedUserForAuth && (_jsxs("div", { children: [_jsxs("p", { children: ["\u7528\u6237 ", _jsx(Text, { strong: true, children: selectedUserForAuth.username }), " \u5C1A\u672A\u83B7\u5F97\u6388\u6743\uFF0C\u65E0\u6CD5\u4F7F\u7528\u667A\u76C8AI\u8F6F\u4EF6\u3002"] }), _jsx("p", { style: { marginTop: '16px' }, children: "\u4F5C\u4E3A\u7BA1\u7406\u5458\uFF0C\u60A8\u53EF\u4EE5\u6388\u6743\u6B64\u7528\u6237\u4F7F\u7528\u672C\u8F6F\u4EF6\u3002" }), _jsx("p", { style: { marginTop: '16px', color: '#666' }, children: "\u6388\u6743\u540E\uFF0C\u8BE5\u7528\u6237\u5C06\u80FD\u591F\u8BBF\u95EE\u6240\u6709\u529F\u80FD\u3002" })] })) }), _jsxs(Modal, { title: "\u6388\u6743\u7BA1\u7406", open: showAuthorizationManagement, onCancel: handleCancelAuthorizationManagement, footer: [
                            _jsx(Button, { onClick: handleCancelAuthorizationManagement, children: "\u5173\u95ED" }, "cancel")
                        ], width: 600, children: [_jsx(List, { itemLayout: "horizontal", dataSource: users, renderItem: (user) => (_jsx(List.Item, { actions: [
                                        _jsx(Button, { type: user.isAuthorized ? 'default' : 'primary', onClick: () => handleToggleAuthorization(user), disabled: user.username === 'admin', children: user.isAuthorized ? '取消授权' : '授权' })
                                    ], children: _jsx(List.Item.Meta, { avatar: _jsx(Avatar, { src: user.avatar, style: { backgroundColor: user.isAuthorized ? '#52c41a' : '#d9d9d9' } }), title: _jsx(Text, { strong: true, children: user.username }), description: user.username === 'admin'
                                            ? '系统管理员 (默认授权)'
                                            : user.isAuthorized
                                                ? `已授权 - 授权人: ${user.authorizedBy} (${new Date(user.authorizedAt || 0).toLocaleString()})`
                                                : '未授权' }) }, user.id)) }), _jsxs("div", { style: { marginTop: '24px', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '4px' }, children: [_jsx("p", { style: { margin: 0, color: '#666' }, children: "\u7BA1\u7406\u5458\u53EF\u4EE5\u6388\u6743\u6216\u53D6\u6D88\u6388\u6743\u7528\u6237\u4F7F\u7528\u667A\u76C8AI\u8F6F\u4EF6\u3002" }), _jsx("p", { style: { margin: '8px 0 0 0', color: '#666' }, children: "\u672A\u6388\u6743\u7684\u7528\u6237\u5C06\u65E0\u6CD5\u767B\u5F55\u548C\u4F7F\u7528\u672C\u8F6F\u4EF6\u3002" })] })] })] })) : (_jsx(Suspense, { fallback: _jsx("div", { style: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }, children: _jsx(Spin, { size: "large" }) }), children: _jsx(Login, { onLogin: handleLogin }) })) }) }));
};
export default App;
