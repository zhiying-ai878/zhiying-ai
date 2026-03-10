import { jsx as _jsx } from "react/jsx-runtime";
import { Tabs } from 'antd';
import DataSourceManager from '../../components/DataSourceManager/DataSourceManager';
import BrokerConfig from '../../components/BrokerConfig/BrokerConfig';
const DataSource = () => {
    const tabs = [
        {
            key: '1',
            label: '数据源管理',
            children: _jsx(DataSourceManager, {})
        },
        {
            key: '2',
            label: '券商配置',
            children: _jsx(BrokerConfig, {})
        }
    ];
    return (_jsx("div", { style: { padding: '0' }, children: _jsx(Tabs, { defaultActiveKey: "1", items: tabs }) }));
};
export default DataSource;
