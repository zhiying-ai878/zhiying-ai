import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback, useEffect } from 'react';
import { Card, Button, Input, Divider, List, Typography, Spin, Space, Popconfirm, message } from 'antd';
import { RobotOutlined, SendOutlined, RiseOutlined, BarChartOutlined, FundOutlined, ThunderboltOutlined, DollarOutlined, SaveOutlined, ClearOutlined } from '@ant-design/icons';
import { getLLM } from '../../utils/llmIntegration';
const { Text, Paragraph } = Typography;
const quickQuestions = [
    { key: 'market', label: '市场分析', icon: _jsx(BarChartOutlined, {}), color: 'blue' },
    { key: 'hot', label: '热点板块', icon: _jsx(ThunderboltOutlined, {}), color: 'orange' },
    { key: 'strategy', label: '投资策略', icon: _jsx(FundOutlined, {}), color: 'green' },
    { key: 'risk', label: '风险控制', icon: _jsx(DollarOutlined, {}), color: 'red' },
    { key: 'tech', label: '技术分析', icon: _jsx(BarChartOutlined, {}), color: 'purple' },
    { key: 'recommend', label: '股票推荐', icon: _jsx(RiseOutlined, {}), color: 'cyan' },
];
const AIAssistant = () => {
    const [messages, setMessages] = useState([
        {
            id: '1',
            content: '您好！我是智盈AI投资助手，有什么可以帮助您的吗？\n\n📊 我可以为您提供：\n• 实时市场分析\n• 热点板块追踪\n• 投资策略建议\n• 技术指标解读\n• 风险评估提示\n\n点击下方快捷问题或直接输入您的问题！',
            type: 'ai',
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        localStorage.setItem('ai_assistant_history', JSON.stringify(messages));
    }, [messages]);
    const llm = getLLM();
    const handleSend = useCallback(async () => {
        if (!inputValue.trim())
            return;
        const userMessage = {
            id: Date.now().toString(),
            content: inputValue,
            type: 'user',
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setLoading(true);
        try {
            // 添加用户消息到LLM
            llm.addUserMessage(inputValue);
            // 获取LLM响应
            const response = await llm.getResponse();
            const aiMessage = {
                id: (Date.now() + 1).toString(),
                content: response.content,
                type: 'ai',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMessage]);
        }
        catch (error) {
            console.error('LLM响应失败:', error);
            const errorMessage = {
                id: (Date.now() + 1).toString(),
                content: '抱歉，AI助手暂时无法响应，请稍后再试。',
                type: 'ai',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        }
        finally {
            setLoading(false);
        }
    }, [inputValue]);
    const handleClearHistory = useCallback(() => {
        setMessages([
            {
                id: '1',
                content: '您好！我是智盈AI投资助手，有什么可以帮助您的吗？\n\n📊 我可以为您提供：\n• 实时市场分析\n• 热点板块追踪\n• 投资策略建议\n• 技术指标解读\n• 风险评估提示\n\n点击下方快捷问题或直接输入您的问题！',
                type: 'ai',
                timestamp: new Date()
            }
        ]);
        message.success('对话历史已清空');
    }, []);
    const handleSaveHistory = useCallback(() => {
        const dataStr = JSON.stringify(messages, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ai_assistant_${new Date().toISOString().slice(0, 10)}.json`;
        link.click();
        URL.revokeObjectURL(url);
        message.success('对话历史已保存');
    }, [messages]);
    const handleQuickQuestion = useCallback((question) => {
        setInputValue(question);
    }, []);
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };
    return (_jsxs("div", { style: { padding: '0' }, children: [_jsxs("div", { style: { marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsx("h2", { style: { margin: 0 }, children: "\u667A\u76C8AI\u6295\u8D44\u52A9\u624B" }), _jsxs(Space, { size: "small", children: [_jsx(Button, { type: "default", size: "small", icon: _jsx(SaveOutlined, {}), onClick: handleSaveHistory, children: "\u4FDD\u5B58\u5BF9\u8BDD" }), _jsx(Popconfirm, { title: "\u786E\u5B9A\u8981\u6E05\u7A7A\u5BF9\u8BDD\u5386\u53F2\u5417\uFF1F", onConfirm: handleClearHistory, okText: "\u786E\u5B9A", cancelText: "\u53D6\u6D88", children: _jsx(Button, { type: "default", size: "small", danger: true, icon: _jsx(ClearOutlined, {}), children: "\u6E05\u7A7A\u5386\u53F2" }) })] })] }), _jsxs(Card, { size: "small", bordered: false, style: { height: '650px', display: 'flex', flexDirection: 'column', margin: '2px' }, children: [_jsxs("div", { style: { marginBottom: '12px' }, children: [_jsx(Text, { type: "secondary", style: { fontSize: '12px' }, children: "\u5FEB\u6377\u95EE\u9898\uFF1A" }), _jsx("div", { style: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }, children: quickQuestions.map(q => (_jsx(Button, { type: "dashed", size: "small", icon: q.icon, onClick: () => handleQuickQuestion(q.label), style: { borderColor: q.color, color: q.color }, children: q.label }, q.key))) })] }), _jsx(Divider, { style: { margin: '8px 0' } }), _jsxs("div", { style: { flex: 1, overflowY: 'auto', marginBottom: '16px' }, children: [_jsx(List, { dataSource: messages, renderItem: (item) => (_jsx(List.Item, { style: { padding: '12px 0' }, children: _jsxs("div", { style: { display: 'flex', alignItems: 'flex-start', gap: '12px' }, children: [_jsx("div", { style: { fontSize: '20px', marginTop: '2px' }, children: item.type === 'ai' ? (_jsx(RobotOutlined, { style: { color: '#1890ff' } })) : (_jsx("span", { style: { color: '#52c41a' }, children: "\uD83D\uDC64" })) }), _jsxs("div", { style: { flex: 1, maxWidth: '100%' }, children: [_jsx(Paragraph, { style: {
                                                            margin: 0,
                                                            padding: '12px 16px',
                                                            borderRadius: '12px',
                                                            backgroundColor: item.type === 'ai' ? '#f0f5ff' : '#f6ffed',
                                                            whiteSpace: 'pre-wrap',
                                                            lineHeight: '1.8',
                                                            fontSize: '14px'
                                                        }, children: item.content }), _jsx(Text, { type: "secondary", style: { fontSize: '11px', display: 'block', marginTop: '6px', marginLeft: '4px' }, children: item.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) })] })] }) })) }), loading && (_jsx("div", { style: { display: 'flex', justifyContent: 'center', padding: '20px' }, children: _jsx(Spin, { size: "small", tip: "AI\u6B63\u5728\u5206\u6790\u4E2D..." }) }))] }), _jsx(Divider, { style: { margin: '8px 0' } }), _jsxs("div", { style: { display: 'flex', gap: '8px' }, children: [_jsx(Input, { placeholder: "\u8F93\u5165\u60A8\u7684\u95EE\u9898\uFF0C\u4F8B\u5982\uFF1A\u5206\u6790\u5F53\u524D\u5E02\u573A\u8D70\u52BF\u3001\u4ECA\u65E5\u70ED\u70B9\u677F\u5757...", value: inputValue, onChange: (e) => setInputValue(e.target.value), onKeyPress: handleKeyPress, size: "small", onPressEnter: handleSend }), _jsx(Button, { type: "primary", icon: _jsx(SendOutlined, {}), onClick: handleSend, loading: loading, size: "small", children: "\u53D1\u9001" })] })] })] }));
};
export default AIAssistant;
