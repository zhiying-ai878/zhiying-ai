import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Card, Form, Input, Button, Checkbox, message, Tabs } from 'antd';
import { UserOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone, MailOutlined } from '@ant-design/icons';
import './Login.css';
const { TabPane } = Tabs;
const Login = ({ onLogin }) => {
    const [form] = Form.useForm();
    const [registerForm] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [registerLoading, setRegisterLoading] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [registerPasswordVisible, setRegisterPasswordVisible] = useState(false);
    const [activeTab, setActiveTab] = useState('login');
    const handleLoginFinish = async (values) => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const savedUsers = JSON.parse(localStorage.getItem('users') || '[]');
            const user = savedUsers.find((u) => u.username === values.username && u.password === values.password);
            if (user || (values.username === 'admin' && values.password === 'admin123')) {
                message.success('登录成功！');
                onLogin(values.username, values.password);
            }
            else {
                message.error('账号或密码错误');
            }
        }
        catch (error) {
            message.error('登录失败，请检查账号密码');
        }
        finally {
            setLoading(false);
        }
    };
    const handleRegisterFinish = async (values) => {
        setRegisterLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const savedUsers = JSON.parse(localStorage.getItem('users') || '[]');
            const userExists = savedUsers.some((u) => u.username === values.username);
            if (userExists) {
                message.error('该用户名已被注册');
                return;
            }
            if (values.password !== values.confirmPassword) {
                message.error('两次输入的密码不一致');
                return;
            }
            const newUser = {
                username: values.username,
                password: values.password,
                email: values.email,
                createdAt: new Date().toISOString()
            };
            savedUsers.push(newUser);
            localStorage.setItem('users', JSON.stringify(savedUsers));
            message.success('注册成功！正在跳转到登录页面...');
            registerForm.resetFields();
            setTimeout(() => {
                setActiveTab('login');
            }, 1000);
        }
        catch (error) {
            message.error('注册失败，请重试');
        }
        finally {
            setRegisterLoading(false);
        }
    };
    return (_jsx("div", { className: "login-container", children: _jsx(Card, { className: "login-card", title: "\u667A\u76C8AI", children: _jsxs(Tabs, { activeKey: activeTab, onChange: setActiveTab, centered: true, children: [_jsx(TabPane, { tab: "\u767B\u5F55", children: _jsxs(Form, { form: form, onFinish: handleLoginFinish, layout: "vertical", children: [_jsx(Form.Item, { name: "username", label: "\u8D26\u53F7", rules: [{ required: true, message: '请输入账号' }], children: _jsx(Input, { prefix: _jsx(UserOutlined, { className: "site-form-item-icon" }), placeholder: "\u8BF7\u8F93\u5165\u8D26\u53F7\uFF08\u6D4B\u8BD5\u8D26\u53F7\uFF1Aadmin\uFF09", size: "large" }) }), _jsx(Form.Item, { name: "password", label: "\u5BC6\u7801", rules: [{ required: true, message: '请输入密码' }], children: _jsx(Input.Password, { prefix: _jsx(LockOutlined, { className: "site-form-item-icon" }), placeholder: "\u8BF7\u8F93\u5165\u5BC6\u7801\uFF08\u6D4B\u8BD5\u5BC6\u7801\uFF1Aadmin123\uFF09", size: "large", visibilityToggle: {
                                            visible: passwordVisible,
                                            onVisibleChange: setPasswordVisible
                                        }, iconRender: visible => (visible ? _jsx(EyeTwoTone, {}) : _jsx(EyeInvisibleOutlined, {})) }) }), _jsx(Form.Item, { name: "remember", valuePropName: "checked", noStyle: true, children: _jsx(Checkbox, { children: "\u8BB0\u4F4F\u6211" }) }), _jsx(Form.Item, { children: _jsx(Button, { type: "primary", htmlType: "submit", className: "login-btn", size: "large", loading: loading, block: true, children: "\u767B\u5F55" }) })] }) }, "login"), _jsx(TabPane, { tab: "\u6CE8\u518C", children: _jsxs(Form, { form: registerForm, onFinish: handleRegisterFinish, layout: "vertical", children: [_jsx(Form.Item, { name: "username", label: "\u7528\u6237\u540D", rules: [
                                        { required: true, message: '请输入用户名' },
                                        { min: 3, message: '用户名至少3个字符' }
                                    ], children: _jsx(Input, { prefix: _jsx(UserOutlined, { className: "site-form-item-icon" }), placeholder: "\u8BF7\u8F93\u5165\u7528\u6237\u540D", size: "large" }) }), _jsx(Form.Item, { name: "email", label: "\u90AE\u7BB1", rules: [
                                        { required: true, message: '请输入邮箱' },
                                        { type: 'email', message: '请输入有效的邮箱地址' }
                                    ], children: _jsx(Input, { prefix: _jsx(MailOutlined, { className: "site-form-item-icon" }), placeholder: "\u8BF7\u8F93\u5165\u90AE\u7BB1", size: "large" }) }), _jsx(Form.Item, { name: "password", label: "\u5BC6\u7801", rules: [
                                        { required: true, message: '请输入密码' },
                                        { min: 6, message: '密码至少6个字符' }
                                    ], children: _jsx(Input.Password, { prefix: _jsx(LockOutlined, { className: "site-form-item-icon" }), placeholder: "\u8BF7\u8F93\u5165\u5BC6\u7801\uFF08\u81F3\u5C116\u4E2A\u5B57\u7B26\uFF09", size: "large", visibilityToggle: {
                                            visible: registerPasswordVisible,
                                            onVisibleChange: setRegisterPasswordVisible
                                        }, iconRender: visible => (visible ? _jsx(EyeTwoTone, {}) : _jsx(EyeInvisibleOutlined, {})) }) }), _jsx(Form.Item, { name: "confirmPassword", label: "\u786E\u8BA4\u5BC6\u7801", dependencies: ['password'], rules: [
                                        { required: true, message: '请确认密码' },
                                        ({ getFieldValue }) => ({
                                            validator(_, value) {
                                                if (!value || getFieldValue('password') === value) {
                                                    return Promise.resolve();
                                                }
                                                return Promise.reject(new Error('两次输入的密码不一致'));
                                            },
                                        }),
                                    ], children: _jsx(Input.Password, { prefix: _jsx(LockOutlined, { className: "site-form-item-icon" }), placeholder: "\u8BF7\u518D\u6B21\u8F93\u5165\u5BC6\u7801", size: "large" }) }), _jsx(Form.Item, { children: _jsx(Button, { type: "primary", htmlType: "submit", className: "login-btn", size: "large", loading: registerLoading, block: true, children: "\u6CE8\u518C" }) })] }) }, "register")] }) }) }));
};
export default Login;
