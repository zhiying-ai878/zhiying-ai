import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Layout as AntLayout, Menu, Button, Drawer, Select } from 'antd';
import { DashboardOutlined, StockOutlined, TransactionOutlined, NotificationOutlined, ThunderboltOutlined, LineChartOutlined, MessageOutlined, RiseOutlined, PieChartOutlined, DatabaseOutlined, SettingOutlined, LogoutOutlined, MenuOutlined, BellOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const { Header, Sider, Content } = AntLayout;

interface LayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
  language: string;
  onLanguageChange: (lang: string) => void;
}

const Layout: React.FC<LayoutProps> = React.memo(({ children, onLogout, language, onLanguageChange }) => {
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
    { key: '/', icon: <DashboardOutlined />, label: t('navigation.dashboard') },
    { key: '/stock', icon: <StockOutlined />, label: t('navigation.stock') },
    { key: '/trade', icon: <TransactionOutlined />, label: t('navigation.trade') },
    { key: '/signal', icon: <NotificationOutlined />, label: t('navigation.signal') },
    { key: '/mainforce', icon: <ThunderboltOutlined />, label: t('navigation.mainforce') },
    { key: '/chippeak', icon: <LineChartOutlined />, label: t('navigation.chippeak') },
    { key: '/prediction', icon: <RiseOutlined />, label: t('navigation.prediction') },
    { key: '/aiassistant', icon: <MessageOutlined />, label: t('navigation.aiassistant') },
    { key: '/aistrategy', icon: <RiseOutlined />, label: t('navigation.aistrategy') },
    { key: '/portfolio', icon: <PieChartOutlined />, label: t('navigation.portfolio') },
    { key: '/datasource', icon: <DatabaseOutlined />, label: t('navigation.datasource') },
    { key: '/settings', icon: <SettingOutlined />, label: t('navigation.settings') },
  ], [t]);

  const handleMenuClick = useCallback(({ key }: { key: string }) => {
    navigate(key);
    if (isMobile) setMobileMenuOpen(false);
  }, [navigate, isMobile]);

  const menu = useMemo(() => (
    <Menu
      mode={isMobile ? 'vertical' : 'inline'}
      selectedKeys={[location.pathname]}
      onClick={handleMenuClick}
      items={menuItems}
      theme="light"
    />
  ), [isMobile, location.pathname, handleMenuClick, menuItems]);

  const headerLeft = useMemo(() => {
    return !isMobile ? (collapsed ? 80 : 150) : 0;
  }, [isMobile, collapsed]);

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      {!isMobile && (
        <Sider
          width={150}
          collapsed={collapsed}
          style={{
            background: '#fff',
            boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
            overflow: 'auto',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            zIndex: 10,
            scrollbarWidth: 'none' as any,
            msOverflowStyle: 'none' as any,
            WebkitOverflowScrolling: 'touch' as any
          }}
          trigger={null}
        >
          {/* 顶格行 - 固定显示 */}
          <div
            style={{
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
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'center' }}>
              {!collapsed && (
                <Button
                  type="text"
                  icon={<LeftOutlined style={{ color: 'white' }} />}
                  onClick={() => setCollapsed(true)}
                  style={{ padding: '4px', position: 'absolute', left: '8px' }}
                />
              )}
              <RiseOutlined style={{ fontSize: '32px', marginBottom: collapsed ? '0' : '6px' }} />
              {collapsed && (
                <Button
                  type="text"
                  icon={<RightOutlined style={{ color: 'white' }} />}
                  onClick={() => setCollapsed(false)}
                  style={{ padding: '4px', position: 'absolute', right: '8px' }}
                />
              )}
            </div>
            {!collapsed && <h1 style={{ margin: '6px 0 0 0', fontSize: '18px', fontWeight: 'bold' }}>智盈AI</h1>}
          </div>
          
          {/* 菜单区域 - 可滚动 */}
          <div style={{
            padding: '8px 0',
            minHeight: 'calc(100% - 160px)'
          }}>
            {menu}
          </div>
          
          {/* 底部区域 - 固定显示 */}
          <div style={{ 
            padding: '12px', 
            position: 'sticky', 
            bottom: 0, 
            background: '#fff',
            borderTop: '1px solid #f0f0f0',
            width: '100%'
          }}>
            <Button type="primary" danger block icon={<LogoutOutlined />} onClick={onLogout} size="small">
              {!collapsed && t('navigation.logout')}
            </Button>
          </div>
        </Sider>
      )}

      {isMobile && (
        <Drawer title="菜单" placement="left" onClose={() => setMobileMenuOpen(false)} open={mobileMenuOpen} width={200}>
          {menu}
          <div style={{ padding: '12px', marginTop: '20px' }}>
            <Button type="primary" danger block icon={<LogoutOutlined />} onClick={onLogout} size="small">
              {t('navigation.logout')}
            </Button>
          </div>
        </Drawer>
      )}

      <AntLayout style={{ marginLeft: headerLeft, transition: 'margin-left 0.3s', minHeight: '100vh', position: 'relative' }}>
        <Header
          style={{
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
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {isMobile && (
              <Button
                type="text"
                icon={<MenuOutlined style={{ color: 'white', fontSize: '18px' }} />}
                onClick={() => setMobileMenuOpen(true)}
                style={{ marginRight: '12px', padding: '4px' }}
              />
            )}
            <h1 style={{ margin: 0, color: 'white', fontSize: isMobile ? '16px' : '20px', fontWeight: 'bold' }}>
              智能投资决策平台
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Select
              value={language}
              onChange={onLanguageChange}
              style={{ width: 100, marginRight: '16px', color: 'white' }}
              options={[
                { value: 'zh-CN', label: '中文' },
                { value: 'en-US', label: 'English' },
              ]}
              dropdownStyle={{ minWidth: 100 }}
            />
            <BellOutlined style={{ color: 'white', fontSize: '18px', marginRight: '16px' }} />
          </div>
        </Header>
        <Content
          style={{
            margin: '0',
            padding: '10px',
            background: '#f5f5f5',
            minHeight: '100vh',
            paddingTop: '68px',
            overflow: 'auto',
          }}
        >
          {children}
        </Content>
      </AntLayout>
    </AntLayout>
  );
});

Layout.displayName = 'Layout';

export default Layout;