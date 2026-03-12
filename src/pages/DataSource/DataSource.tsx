import React from 'react';
import { Tabs, Card } from 'antd';
import DataSourceManager from '../../components/DataSourceManager/DataSourceManager';
import BrokerConfig from '../../components/BrokerConfig/BrokerConfig';

const DataSource: React.FC = () => {
  const tabs = [
    {
      key: '1',
      label: '数据源管理',
      children: <DataSourceManager />
    },
    {
      key: '2',
      label: '券商配置',
      children: <BrokerConfig />
    }
  ];

  return (
    <div style={{ padding: '0' }}>
      <Tabs defaultActiveKey="1" items={tabs} />
    </div>
  );
};

export default DataSource;