import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Layout as AntLayout, Menu, Button, Drawer, Select } from 'antd';
import { DashboardOutlined, StockOutlined, TransactionOutlined, NotificationOutlined, ThunderboltOutlined, LineChartOutlined, MessageOutlined, RiseOutlined, PieChartOutlined, DatabaseOutlined, SettingOutlined, LogoutOutlined, MenuOutlined, BellOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
const { Header, Sider, Content } = AntLayout;
const Layout = React.memo(({ children, onLogout, language, onLanguageChange }) => {
    const { t } = useTranslation();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const checkMobile = useCallback(() => {
        setIsMobile(window.innerWidth < 768);
    }, []);
    useEffect(() => {
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, [checkMobile]);
    const menuItems = useMemo(() => [
        { key: '/', icon: _jsx(DashboardOutlined, {}), label: t('navigation.dashboard') },
        { key: '/stock', icon: _jsx(StockOutlined, {}), label: t('navigation.stock') },
        { key: '/trade', icon: _jsx(TransactionOutlined, {}), label: t('navigation.trade') },
        { key: '/signal', icon: _jsx(NotificationOutlined, {}), label: t('navigation.signal') },
        { key: '/mainforce', icon: _jsx(ThunderboltOutlined, {}), label: t('navigation.mainforce') },
        { key: '/chippeak', icon: _jsx(LineChartOutlined, {}), label: t('navigation.chippeak') },
        { key: '/prediction', icon: _jsx(RiseOutlined, {}), label: t('navigation.prediction') },
        { key: '/aiassistant', icon: _jsx(MessageOutlined, {}), label: t('navigation.aiassistant') },
        { key: '/aistrategy', icon: _jsx(RiseOutlined, {}), label: t('navigation.aistrategy') },
        { key: '/portfolio', icon: _jsx(PieChartOutlined, {}), label: t('navigation.portfolio') },
        { key: '/datasource', icon: _jsx(DatabaseOutlined, {}), label: t('navigation.datasource') },
        { key: '/settings', icon: _jsx(SettingOutlined, {}), label: t('navigation.settings') },
    ], [t]);
    const handleMenuClick = useCallback(({ key }) => {
        navigate(key);
        if (isMobile)
            setMobileMenuOpen(false);
    }, [navigate, isMobile]);
    const menu = useMemo(() => (_jsx(Menu, { mode: isMobile ? 'vertical' : 'inline', selectedKeys: [location.pathname], onClick: handleMenuClick, items: menuItems, theme: "light" })), [isMobile, location.pathname, handleMenuClick, menuItems]);
    const headerLeft = useMemo(() => {
        return !isMobile ? (collapsed ? 80 : 150) : 0;
    }, [isMobile, collapsed]);
    return (_jsxs(AntLayout, { style: { minHeight: '100vh' }, children: [!isMobile && (_jsxs(Sider, { width: 150, collapsed: collapsed, style: {
                    background: '#fff',
                    boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
                    overflow: 'auto',
                    height: '100vh',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    zIndex: 10,
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    WebkitOverflowScrolling: 'touch'
                }, trigger: null, children: [_jsxs("div", { style: {
                            padding: '12px 8px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            background: 'linear-gradient(135deg, #ff0000 0%, #cc0000 100%)',
                            color: 'white',
                            position: 'sticky',
                            top: 0,
                            zIndex: 100,
                            width: '100%'
                        }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'center' }, children: [!collapsed && (_jsx(Button, { type: "text", icon: _jsx(LeftOutlined, { style: { color: 'white' } }), onClick: () => setCollapsed(true), style: { padding: '4px', position: 'absolute', left: '8px' } })), _jsx(RiseOutlined, { style: { fontSize: '32px', marginBottom: collapsed ? '0' : '6px' } }), collapsed && (_jsx(Button, { type: "text", icon: _jsx(RightOutlined, { style: { color: 'white' } }), onClick: () => setCollapsed(false), style: { padding: '4px', position: 'absolute', right: '8px' } }))] }), !collapsed && _jsx("h1", { style: { margin: '6px 0 0 0', fontSize: '18px', fontWeight: 'bold' }, children: "\u667A\u76C8AI" })] }), _jsx("div", { style: {
                            padding: '8px 0',
                            minHeight: 'calc(100% - 160px)'
                        }, children: menu }), _jsx("div", { style: {
                            padding: '12px',
                            position: 'sticky',
                            bottom: 0,
                            background: '#fff',
                            borderTop: '1px solid #f0f0f0',
                            width: '100%'
                        }, children: _jsx(Button, { type: "primary", danger: true, block: true, icon: _jsx(LogoutOutlined, {}), onClick: onLogout, size: "small", children: !collapsed && t('navigation.logout') }) })] })), isMobile && (_jsxs(Drawer, { title: "\u83DC\u5355", placement: "left", onClose: () => setMobileMenuOpen(false), open: mobileMenuOpen, width: 200, children: [menu, _jsx("div", { style: { padding: '12px', marginTop: '20px' }, children: _jsx(Button, { type: "primary", danger: true, block: true, icon: _jsx(LogoutOutlined, {}), onClick: onLogout, size: "small", children: t('navigation.logout') }) })] })), _jsxs(AntLayout, { style: { marginLeft: headerLeft, transition: 'margin-left 0.3s', minHeight: '100vh', position: 'relative' }, children: [_jsxs(Header, { style: {
                            background: 'linear-gradient(135deg, #ff0000 0%, #cc0000 100%)',
                            padding: '0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            height: '48px',
                            lineHeight: '48px',
                            margin: 0,
                            position: 'fixed',
                            top: 0,
                            right: 0,
                            left: headerLeft,
                            zIndex: 100,
                            transition: 'left 0.3s',
                        }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center' }, children: [isMobile && (_jsx(Button, { type: "text", icon: _jsx(MenuOutlined, { style: { color: 'white', fontSize: '18px' } }), onClick: () => setMobileMenuOpen(true), style: { marginRight: '12px', padding: '4px' } })), _jsx("h1", { style: { margin: 0, color: 'white', fontSize: isMobile ? '16px' : '20px', fontWeight: 'bold' }, children: "\u667A\u80FD\u6295\u8D44\u51B3\u7B56\u5E73\u53F0" })] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center' }, children: [_jsx(Select, { value: language, onChange: onLanguageChange, style: { width: 100, marginRight: '16px', color: 'white' }, options: [
                                            { value: 'zh-CN', label: '中文' },
                                            { value: 'en-US', label: 'English' },
                                        ], dropdownStyle: { minWidth: 100 } }), _jsx(BellOutlined, { style: { color: 'white', fontSize: '18px', marginRight: '16px' } })] })] }), _jsx(Content, { style: {
                            margin: '0',
                            padding: '10px',
                            background: '#f5f5f5',
                            minHeight: '100vh',
                            paddingTop: '68px',
                            overflow: 'auto',
                        }, children: children })] })] }));
});
Layout.displayName = 'Layout';
export default Layout;
