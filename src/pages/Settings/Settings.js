import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, Tabs, Empty } from 'antd';
import { UserOutlined, BellOutlined, SettingOutlined, InfoCircleOutlined } from '@ant-design/icons';
const Settings = () => {
    const tabItems = [
        {
            key: '1',
            label: _jsxs("span", { children: [_jsx(UserOutlined, {}), "\u8D26\u6237\u8BBE\u7F6E"] }),
            children: _jsx(Card, { style: { margin: '2px' }, children: _jsx(Empty, { description: "\u8D26\u6237\u8BBE\u7F6E\u9875\u9762" }) })
        },
        {
            key: '2',
            label: _jsxs("span", { children: [_jsx(BellOutlined, {}), "\u901A\u77E5\u8BBE\u7F6E"] }),
            children: _jsx(Card, { style: { margin: '2px' }, children: _jsx(Empty, { description: "\u901A\u77E5\u8BBE\u7F6E\u9875\u9762" }) })
        },
        {
            key: '3',
            label: _jsxs("span", { children: [_jsx(SettingOutlined, {}), "\u7CFB\u7EDF\u8BBE\u7F6E"] }),
            children: _jsx(Card, { style: { margin: '2px' }, children: _jsx(Empty, { description: "\u7CFB\u7EDF\u8BBE\u7F6E\u9875\u9762" }) })
        },
        {
            key: '4',
            label: _jsxs("span", { children: [_jsx(InfoCircleOutlined, {}), "\u5173\u4E8E"] }),
            children: (_jsx(Card, { title: "\u5173\u4E8E\u667A\u76C8AI", style: { margin: '2px' }, children: _jsx("div", { style: { padding: '20px', textAlign: 'center' }, children: _jsxs("p", { style: { color: '#999' }, children: ["\u7248\u672C\uFF1A1.0.0", _jsx("br", {}), "\u57FA\u4E8EAI\u7684\u80A1\u7968\u6295\u8D44\u5206\u6790\u5DE5\u5177"] }) }) }))
        }
    ];
    return _jsx("div", { className: "settings-page", children: _jsx(Tabs, { defaultActiveKey: "1", size: "small", items: tabItems }) });
};
export default Settings;
