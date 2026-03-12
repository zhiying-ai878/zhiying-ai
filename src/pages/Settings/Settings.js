import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Card, Tabs, Empty, Form, Input, Button, message } from 'antd';
import { UserOutlined, BellOutlined, SettingOutlined, InfoCircleOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
const Settings = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const handlePasswordChange = async (values) => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const savedUsers = JSON.parse(localStorage.getItem('users') || '[]');
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            // 验证旧密码
            const user = savedUsers.find((u) => u.username === currentUser.username && u.password === values.oldPassword);
            if (!user) {
                message.error('旧密码错误');
                return;
            }
            // 更新密码
            const updatedUsers = savedUsers.map((u) => u.username === currentUser.username
                ? { ...u, password: values.newPassword }
                : u);
            localStorage.setItem('users', JSON.stringify(updatedUsers));
            message.success('密码修改成功！');
            form.resetFields();
        }
        catch (error) {
            message.error('密码修改失败，请重试');
        }
        finally {
            setLoading(false);
        }
    };
    const tabItems = [
        {
            key: '1',
            label: _jsxs("span", { children: [_jsx(UserOutlined, {}), "\u8D26\u6237\u8BBE\u7F6E"] }),
            children: (_jsx(Card, { title: "\u4FEE\u6539\u5BC6\u7801", style: { margin: '2px' }, children: _jsxs(Form, { form: form, onFinish: handlePasswordChange, layout: "vertical", style: { maxWidth: 400 }, children: [_jsx(Form.Item, { name: "oldPassword", label: "\u65E7\u5BC6\u7801", rules: [{ required: true, message: '请输入旧密码' }], children: _jsx(Input.Password, { prefix: _jsx(LockOutlined, { className: "site-form-item-icon" }), placeholder: "\u8BF7\u8F93\u5165\u65E7\u5BC6\u7801", size: "large", visibilityToggle: {
                                    visible: passwordVisible,
                                    onVisibleChange: setPasswordVisible
                                }, iconRender: visible => (visible ? _jsx(EyeTwoTone, {}) : _jsx(EyeInvisibleOutlined, {})) }) }), _jsx(Form.Item, { name: "newPassword", label: "\u65B0\u5BC6\u7801", rules: [
                                { required: true, message: '请输入新密码' },
                                { min: 8, message: '密码至少8个字符' },
                                {
                                    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                                    message: '密码必须包含大小写字母、数字和特殊字符'
                                }
                            ], children: _jsx(Input.Password, { prefix: _jsx(LockOutlined, { className: "site-form-item-icon" }), placeholder: "\u8BF7\u8F93\u5165\u65B0\u5BC6\u7801\uFF08\u81F3\u5C118\u4E2A\u5B57\u7B26\uFF0C\u5305\u542B\u5927\u5C0F\u5199\u5B57\u6BCD\u3001\u6570\u5B57\u548C\u7279\u6B8A\u5B57\u7B26\uFF09", size: "large", visibilityToggle: {
                                    visible: passwordVisible,
                                    onVisibleChange: setPasswordVisible
                                }, iconRender: visible => (visible ? _jsx(EyeTwoTone, {}) : _jsx(EyeInvisibleOutlined, {})) }) }), _jsx(Form.Item, { name: "confirmPassword", label: "\u786E\u8BA4\u65B0\u5BC6\u7801", dependencies: ['newPassword'], rules: [
                                { required: true, message: '请确认新密码' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('newPassword') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('两次输入的密码不一致'));
                                    },
                                }),
                            ], children: _jsx(Input.Password, { prefix: _jsx(LockOutlined, { className: "site-form-item-icon" }), placeholder: "\u8BF7\u518D\u6B21\u8F93\u5165\u65B0\u5BC6\u7801", size: "large", visibilityToggle: {
                                    visible: passwordVisible,
                                    onVisibleChange: setPasswordVisible
                                }, iconRender: visible => (visible ? _jsx(EyeTwoTone, {}) : _jsx(EyeInvisibleOutlined, {})) }) }), _jsx(Form.Item, { children: _jsx(Button, { type: "primary", htmlType: "submit", size: "large", loading: loading, block: true, children: "\u786E\u8BA4\u4FEE\u6539" }) })] }) }))
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
