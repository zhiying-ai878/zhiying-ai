import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Layout as AntLayout, Menu, Button, Drawer, Select, Avatar } from 'antd';
import { DashboardOutlined, StockOutlined, TransactionOutlined, NotificationOutlined, ThunderboltOutlined, LineChartOutlined, MessageOutlined, RiseOutlined, PieChartOutlined, DatabaseOutlined, SettingOutlined, LogoutOutlined, MenuOutlined, BellOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
const { Header, Sider, Content } = AntLayout;
const Layout = React.memo(({ children, onLogout, language, onLanguageChange, currentUser, onUserSwitch, onManageAuthorization }) => {
    const { t } = useTranslation();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const checkMobile = useCallback(() => {
        setIsMobile(window.innerWidth < 768);
    }, []);
    // 响应式断点
    const [isTablet, setIsTablet] = useState(false);
    const checkTablet = useCallback(() => {
        setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    }, []);
    useEffect(() => {
        checkMobile();
        checkTablet();
        window.addEventListener('resize', checkMobile);
        window.addEventListener('resize', checkTablet);
        return () => {
            window.removeEventListener('resize', checkMobile);
            window.removeEventListener('resize', checkTablet);
        };
    }, [checkMobile, checkTablet]);
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
        return !isMobile ? (collapsed ? 80 : (isTablet ? 120 : 150)) : 0;
    }, [isMobile, collapsed, isTablet]);
    return (_jsxs(AntLayout, { style: { minHeight: '100vh' }, children: [!isMobile && (_jsxs(Sider, { width: isTablet ? 120 : 150, collapsed: collapsed, style: {
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
                        }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'center' }, children: [!collapsed && (_jsx(Button, { type: "text", icon: _jsx(LeftOutlined, { style: { color: 'white' } }), onClick: () => setCollapsed(true), style: { padding: '4px', position: 'absolute', left: '8px' } })), _jsx(RiseOutlined, { style: { fontSize: '32px', marginBottom: collapsed ? '0' : '6px' } }), collapsed && (_jsx(Button, { type: "text", icon: _jsx(RightOutlined, { style: { color: 'white' } }), onClick: () => setCollapsed(false), style: { padding: '4px', position: 'absolute', right: '8px' } }))] }), !collapsed && _jsx("h1", { style: { margin: '6px 0 0 0', fontSize: isTablet ? '16px' : '18px', fontWeight: 'bold' }, children: "\u667A\u76C8AI" })] }), _jsx("div", { style: {
                            padding: '8px 0',
                            minHeight: 'calc(100% - 160px)'
                        }, children: menu }), _jsx("div", { style: {
                            padding: '12px',
                            position: 'sticky',
                            bottom: 0,
                            background: '#fff',
                            borderTop: '1px solid #f0f0f0',
                            width: '100%'
                        }, children: _jsx(Button, { type: "primary", danger: true, block: true, icon: _jsx(LogoutOutlined, {}), onClick: onLogout, size: "small", children: !collapsed && t('navigation.logout') }) })] })), isMobile && (_jsxs(Drawer, { title: _jsxs("div", { style: { display: 'flex', alignItems: 'center' }, children: [_jsx(RiseOutlined, { style: { color: '#ff0000', fontSize: '20px', marginRight: '8px' } }), _jsx("span", { children: "\u667A\u76C8AI" })] }), placement: "left", onClose: () => setMobileMenuOpen(false), open: mobileMenuOpen, width: 240, bodyStyle: { padding: 0 }, children: [_jsx("div", { style: { padding: '16px 0' }, children: menu }), _jsx("div", { style: { padding: '16px', borderTop: '1px solid #f0f0f0' }, children: _jsx(Button, { type: "primary", danger: true, block: true, icon: _jsx(LogoutOutlined, {}), onClick: onLogout, children: t('navigation.logout') }) })] })), _jsxs(AntLayout, { style: { marginLeft: headerLeft, transition: 'margin-left 0.3s', minHeight: '100vh', position: 'relative' }, children: [_jsxs(Header, { style: {
                            background: 'linear-gradient(135deg, #ff0000 0%, #cc0000 100%)',
                            padding: '0 16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            height: isMobile ? '56px' : '48px',
                            lineHeight: isMobile ? '56px' : '48px',
                            margin: 0,
                            position: 'fixed',
                            top: 0,
                            right: 0,
                            left: headerLeft,
                            zIndex: 100,
                            transition: 'left 0.3s',
                        }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center' }, children: [isMobile && (_jsx(Button, { type: "text", icon: _jsx(MenuOutlined, { style: { color: 'white', fontSize: '20px' } }), onClick: () => setMobileMenuOpen(true), style: { marginRight: '12px', padding: '4px' } })), _jsx("h1", { style: { margin: 0, color: 'white', fontSize: isMobile ? '18px' : isTablet ? '16px' : '20px', fontWeight: 'bold' }, children: "\u667A\u80FD\u51B3\u7B56" })] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', flexWrap: 'wrap' }, children: [_jsx(Select, { value: language, onChange: onLanguageChange, style: { width: 100, marginRight: '12px', color: 'white' }, options: [
                                            { value: 'zh-CN', label: '中文' },
                                            { value: 'en-US', label: 'English' },
                                        ], dropdownStyle: { minWidth: 100 }, size: isMobile ? 'small' : 'middle' }), _jsx(BellOutlined, { style: { color: 'white', fontSize: isMobile ? '16px' : '18px', marginRight: '12px' } }), currentUser.username === 'admin' && onManageAuthorization && (_jsx(Button, { type: "text", style: { marginRight: '12px', color: 'white' }, onClick: onManageAuthorization, size: isMobile ? 'small' : 'middle', children: isMobile ? '授权' : '授权管理' })), _jsxs("div", { style: { display: 'flex', alignItems: 'center', marginRight: '8px', cursor: 'pointer' }, onClick: onUserSwitch, children: [_jsx(Avatar, { src: currentUser.avatar, style: { marginRight: '8px', backgroundColor: currentUser.isAuthorized ? '#52c41a' : '#d9d9d9' }, size: isMobile ? 'small' : 'default' }), !isMobile && _jsx("span", { style: { color: 'white', fontSize: '14px' }, children: currentUser.username })] })] })] }), _jsx(Content, { style: {
                            margin: '0',
                            padding: isMobile ? '8px' : '10px',
                            background: '#f5f5f5',
                            minHeight: '100vh',
                            paddingTop: isMobile ? '76px' : '68px',
                            overflow: 'auto',
                        }, children: children })] })] }));
});
Layout.displayName = 'Layout';
export default Layout;
