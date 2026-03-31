import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { Card, Input, Button, List, message, Typography, Avatar } from 'antd';
import { SendOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons';
import * as SignalManager from '../../utils/optimizedSignalManager';
import { getAIAssistant } from '../../utils/advancedAIAnalysis';
import './AIAssistant.css';
const { Text, Title } = Typography;
const AIAssistant = () => {
    const [messages, setMessages] = useState([
        {
            id: '1',
            content: '您好！我是智盈AI助手，很高兴为您服务。请问有什么可以帮助您的吗？',
            sender: 'ai',
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const messageEndRef = useRef(null);
    const signalManager = SignalManager.getOptimizedSignalManager();
    const aiAssistant = getAIAssistant();
    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    const scrollToBottom = () => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    const handleSend = async () => {
        if (!inputValue.trim()) {
            return;
        }
        const userMessage = {
            id: Date.now().toString(),
            content: inputValue,
            sender: 'user',
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setLoading(true);
        try {
            // 使用AI助手解析命令并生成响应
            const command = aiAssistant.parseCommand(inputValue);
            const response = aiAssistant.generateResponse(inputValue, command, signalManager);
            const aiMessage = {
                id: (Date.now() + 1).toString(),
                content: response.response,
                sender: 'ai',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMessage]);
            // 如果需要执行命令
            if (response.requiresExecution) {
                const executionResult = await aiAssistant.executeCommand(command, signalManager);
                if (executionResult.success) {
                    message.success(executionResult.message);
                }
                else {
                    message.error(executionResult.message);
                }
            }
        }
        catch (error) {
            message.error('AI助手处理请求时发生错误');
            console.error('AI助手错误:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !loading) {
            handleSend();
        }
    };
    return (_jsx("div", { className: "ai-assistant-container", children: _jsxs(Card, { title: _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' }, children: [_jsx(RobotOutlined, {}), "\u667A\u76C8AI\u52A9\u624B"] }), style: { marginBottom: '16px' }, children: [_jsxs("div", { className: "chat-container", style: { height: '500px', overflowY: 'auto', marginBottom: '16px' }, children: [_jsx(List, { dataSource: messages, renderItem: (item) => (_jsx(List.Item, { children: _jsxs("div", { style: { display: 'flex', alignItems: 'flex-start', gap: '12px' }, children: [_jsx(Avatar, { icon: item.sender === 'ai' ? _jsx(RobotOutlined, {}) : _jsx(UserOutlined, {}), style: {
                                                backgroundColor: item.sender === 'ai' ? '#1890ff' : '#52c41a'
                                            } }), _jsxs("div", { style: { flex: 1 }, children: [_jsxs("div", { style: { fontSize: '12px', color: '#999', marginBottom: '4px' }, children: [item.sender === 'ai' ? 'AI助手' : '您', " \u00B7 ", item.timestamp.toLocaleString()] }), _jsx("div", { style: {
                                                        padding: '8px 12px',
                                                        borderRadius: '8px',
                                                        backgroundColor: item.sender === 'ai' ? '#f0f2f5' : '#e6f7ff',
                                                        maxWidth: '80%'
                                                    }, children: item.content })] })] }) })) }), _jsx("div", { ref: messageEndRef })] }), _jsxs("div", { style: { display: 'flex', gap: '8px' }, children: [_jsx(Input, { placeholder: "\u8BF7\u8F93\u5165\u60A8\u7684\u95EE\u9898\uFF0C\u4F8B\u5982\uFF1A\u6709\u4E70\u5165\u4FE1\u53F7\u5417\uFF1F", value: inputValue, onChange: (e) => setInputValue(e.target.value), onKeyPress: handleKeyPress, disabled: loading }), _jsx(Button, { type: "primary", icon: _jsx(SendOutlined, {}), onClick: handleSend, loading: loading, children: "\u53D1\u9001" })] }), _jsx("div", { style: { marginTop: '16px', fontSize: '12px', color: '#999' }, children: _jsxs(Text, { type: "secondary", children: ["\u793A\u4F8B\u95EE\u9898\uFF1A", _jsx("br", {}), "\u2022 \u7CFB\u7EDF\u662F\u5426\u5728\u76D1\u63A7\u5E02\u573A\uFF1F", _jsx("br", {}), "\u2022 \u6709\u4E70\u5165\u4FE1\u53F7\u5417\uFF1F", _jsx("br", {}), "\u2022 \u6709\u5356\u51FA\u4FE1\u53F7\u5417\uFF1F", _jsx("br", {}), "\u2022 \u5206\u6790\u80A1\u7968600000", _jsx("br", {}), "\u2022 \u5F53\u524D\u5E02\u573A\u72B6\u6001\u5982\u4F55\uFF1F"] }) })] }) }));
};
export default AIAssistant;
