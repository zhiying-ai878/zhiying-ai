import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Card, Form, Input, InputNumber, Switch, Button, Alert, message, Select, Space, Tag } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { getStockDataSource } from '../../utils/stockData';
const { Option } = Select;
const BrokerConfig = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [brokerStatus, setBrokerStatus] = useState({ huatai: { enabled: false, tradingEnabled: false },
        gtja: { enabled: false, tradingEnabled: false },
        haitong: { enabled: false, tradingEnabled: false },
        cicc: { enabled: false, tradingEnabled: false },
        cmbc: { enabled: false, tradingEnabled: false }
    });
    const dataSource = getStockDataSource();
    useEffect(() => {
        loadBrokerStatus();
    }, []);
    const loadBrokerStatus = () => {
        const brokers = ['huatai', 'gtja', 'haitong', 'cicc', 'cmbc'];
        const status = {};
        brokers.forEach(broker => {
            const config = dataSource.getAPIConfig(broker);
            if (config) {
                status[broker] = {
                    enabled: config.enabled || false,
                    tradingEnabled: config.tradingEnabled || false
                };
            }
            else {
                status[broker] = { enabled: false, tradingEnabled: false };
            }
        });
        setBrokerStatus(status);
    };
    const getBrokerName = (broker) => {
        const map = {
            huatai: '华泰证券',
            gtja: '国泰君安',
            haitong: '海通证券',
            cicc: '中金公司',
            cmbc: '民生证券'
        };
        return map[broker];
    };
    const handleBrokerToggle = (broker, field, checked) => {
        setBrokerStatus(prev => ({
            ...prev,
            [broker]: {
                ...prev[broker],
                [field]: checked
            }
        }));
    };
    const handleSaveConfig = async (broker, values) => {
        setLoading(true);
        try {
            const config = {
                enabled: brokerStatus[broker].enabled,
                tradingEnabled: brokerStatus[broker].tradingEnabled,
                apiKey: values.apiKey,
                secretKey: values.secretKey,
                accountId: values.accountId,
                password: values.password,
                rateLimit: values.rateLimit || 1,
                timeout: values.timeout || 10000
            };
            dataSource.setAPIConfig(broker, config);
            message.success(`${getBrokerName(broker)}配置保存成功`);
        }
        catch (error) {
            message.error('配置保存失败');
        }
        finally {
            setLoading(false);
        }
    };
    const brokers = ['huatai', 'gtja', 'haitong', 'cicc', 'cmbc'];
    return (_jsxs("div", { style: { padding: '0px' }, children: [_jsx("div", { style: { marginBottom: '10px' }, children: _jsx("h2", { style: { margin: 0 }, children: "\u5238\u5546\u914D\u7F6E" }) }), _jsx(Alert, { message: "\u5238\u5546API\u914D\u7F6E\u8BF4\u660E", description: "\u914D\u7F6E\u5238\u5546API\u9700\u8981\u83B7\u53D6\u5BF9\u5E94\u7684API\u5BC6\u94A5\u548C\u8BA4\u8BC1\u4FE1\u606F\u3002\u8BF7\u5728\u5404\u5238\u5546\u5B98\u7F51\u7533\u8BF7API\u6743\u9650\u540E\u586B\u5199\u4EE5\u4E0B\u914D\u7F6E\u3002", type: "info", style: { marginBottom: '16px' } }), _jsx("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }, children: brokers.map(broker => (_jsx(Card, { size: "small", title: getBrokerName(broker), children: _jsxs(Form, { form: form, layout: "vertical", onFinish: (values) => handleSaveConfig(broker, values), initialValues: {
                            apiKey: '',
                            secretKey: '',
                            accountId: '',
                            password: '',
                            rateLimit: 1,
                            timeout: 10000
                        }, children: [_jsx(Form.Item, { label: "\u542F\u7528\u72B6\u6001", children: _jsxs(Space, { children: [_jsx(Switch, { checked: brokerStatus[broker].enabled, onChange: (checked) => handleBrokerToggle(broker, 'enabled', checked) }), _jsx(Tag, { color: brokerStatus[broker].enabled ? 'green' : 'red', children: brokerStatus[broker].enabled ? '已启用' : '未启用' })] }) }), _jsx(Form.Item, { label: "\u4EA4\u6613\u529F\u80FD", children: _jsxs(Space, { children: [_jsx(Switch, { checked: brokerStatus[broker].tradingEnabled, onChange: (checked) => handleBrokerToggle(broker, 'tradingEnabled', checked), disabled: !brokerStatus[broker].enabled }), _jsx(Tag, { color: brokerStatus[broker].tradingEnabled ? 'green' : 'red', children: brokerStatus[broker].tradingEnabled ? '已开启' : '已关闭' })] }) }), _jsx(Form.Item, { name: "apiKey", label: "API Key", children: _jsx(Input, { size: "small", placeholder: "\u8BF7\u8F93\u5165API Key" }) }), _jsx(Form.Item, { name: "secretKey", label: "Secret Key", children: _jsx(Input.Password, { size: "small", placeholder: "\u8BF7\u8F93\u5165Secret Key" }) }), _jsx(Form.Item, { name: "accountId", label: "\u8D26\u6237ID", children: _jsx(Input, { size: "small", placeholder: "\u8BF7\u8F93\u5165\u8D26\u6237ID" }) }), _jsx(Form.Item, { name: "password", label: "\u4EA4\u6613\u5BC6\u7801", children: _jsx(Input.Password, { size: "small", placeholder: "\u8BF7\u8F93\u5165\u4EA4\u6613\u5BC6\u7801" }) }), _jsx(Form.Item, { name: "rateLimit", label: "\u8BF7\u6C42\u901F\u7387\u9650\u5236 (\u79D2)", children: _jsx(InputNumber, { min: 1, max: 60, size: "small" }) }), _jsx(Form.Item, { name: "timeout", label: "\u8D85\u65F6\u65F6\u95F4 (\u6BEB\u79D2)", children: _jsx(InputNumber, { min: 1000, max: 30000, size: "small" }) }), _jsx(Form.Item, { children: _jsx(Button, { type: "primary", htmlType: "submit", icon: _jsx(SettingOutlined, {}), loading: loading, block: true, children: "\u4FDD\u5B58\u914D\u7F6E" }) })] }) }, broker))) }), _jsx(Alert, { message: "\u5B89\u5168\u63D0\u793A", description: "\u8BF7\u59A5\u5584\u4FDD\u7BA1\u60A8\u7684API\u5BC6\u94A5\u548C\u8D26\u6237\u4FE1\u606F\uFF0C\u4E0D\u8981\u5728\u516C\u5171\u573A\u5408\u5C55\u793A\u6216\u5206\u4EAB\u8FD9\u4E9B\u4FE1\u606F\u3002", type: "warning", style: { marginTop: '16px' } })] }));
};
export default BrokerConfig;
