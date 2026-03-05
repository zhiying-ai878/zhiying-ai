﻿import { useState, lazy, Suspense, useEffect } from 'react';
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

  const handleLanguageChange = (lang: string) => {
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

  return (
    <ConfigProvider locale={getAntdLocale()}>
      <Router>
        <Layout onLogout={handleLogout} language={language} onLanguageChange={handleLanguageChange}>
          <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><Spin size="large" /></div>}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/stock" element={<StockDetail />} />
              <Route path="/trade" element={<Trade />} />
              <Route path="/signal" element={<Signal />} />
              <Route path="/mainforce" element={<MainForce />} />
              <Route path="/chippeak" element={<ChipPeak />} />
              <Route path="/prediction" element={<Prediction />} />
              <Route path="/aiassistant" element={<AIAssistant />} />
              <Route path="/aistrategy" element={<AIStrategy />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/datasource" element={<DataSource />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Layout>
      </Router>
    </ConfigProvider>
  );
};

export default App;