import React, { useState, useCallback, useEffect } from 'react';
import { Card, Button, Input, Divider, List, Typography, Spin, Space, Popconfirm, message, Select, Tag, Badge, Tooltip } from 'antd';
import { RobotOutlined, SendOutlined, RiseOutlined, FallOutlined, BarChartOutlined, FundOutlined, ThunderboltOutlined, DollarOutlined, SaveOutlined, ClearOutlined, StockOutlined, AlertOutlined, MessageOutlined, GlobalOutlined, WarningOutlined } from '@ant-design/icons';
import { getLLM } from '../../utils/llmIntegration';

const { Text, Paragraph } = Typography;

interface Message {
  id: string;
  content: string;
  type: 'user' | 'ai';
  timestamp: Date;
  tags?: string[];
}

interface QuickQuestion {
  key: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

const quickQuestions: QuickQuestion[] = [
  { key: 'market', label: '市场分析', icon: <BarChartOutlined />, color: 'blue', description: '分析当前市场走势和热点' },
  { key: 'hot', label: '热点板块', icon: <ThunderboltOutlined />, color: 'orange', description: '识别当前热点行业和板块' },
  { key: 'strategy', label: '投资策略', icon: <FundOutlined />, color: 'green', description: '根据市场环境提供投资策略' },
  { key: 'risk', label: '风险控制', icon: <DollarOutlined />, color: 'red', description: '评估投资风险并提供风险控制建议' },
  { key: 'tech', label: '技术分析', icon: <BarChartOutlined />, color: 'purple', description: '基于技术指标分析股票走势' },
  { key: 'recommend', label: '股票推荐', icon: <RiseOutlined />, color: 'cyan', description: '推荐潜在的投资机会' },
  { key: 'stock', label: '个股分析', icon: <StockOutlined />, color: 'magenta', description: '分析特定股票的基本面和技术面' },
  { key: 'news', label: '新闻分析', icon: <AlertOutlined />, color: 'gold', description: '分析重要财经新闻对市场的影响' },
  { key: 'portfolio', label: '投资组合', icon: <FundOutlined />, color: 'lime', description: '投资组合优化建议' },
  { key: 'trend', label: '趋势预测', icon: <WarningOutlined />, color: 'teal', description: '预测市场未来趋势' },
  { key: 'sector', label: '行业分析', icon: <BarChartOutlined />, color: 'indigo', description: '分析特定行业的发展趋势' },
  { key: 'fundamental', label: '基本面分析', icon: <FundOutlined />, color: 'amber', description: '分析公司基本面数据' },
  { key: 'technical', label: '技术指标', icon: <BarChartOutlined />, color: 'pink', description: '解读技术指标和形态' },
  { key: 'market_sentiment', label: '市场情绪', icon: <ThunderboltOutlined />, color: 'blue', description: '分析当前市场情绪' },
];

// 智能提示类型
const aiTips = [
  '💡 提示：您可以输入股票代码获取详细分析，例如 "分析 600036"',
  '💡 提示：尝试输入 "今日热点板块" 获取最新市场热点',
  '💡 提示：输入 "投资策略建议" 获取基于当前市场的策略',
  '💡 提示：您可以询问特定行业的分析，例如 "新能源行业分析"',
  '💡 提示：输入 "风险评估" 了解当前市场风险水平',
];

// 模拟实时市场数据
const mockMarketData = {
  indices: {
    '上证指数': { current: 3125.38, change: 0.25, changePercent: 0.01 },
    '深证成指': { current: 10234.56, change: -12.34, changePercent: -0.12 },
    '创业板指': { current: 2056.78, change: 8.92, changePercent: 0.44 },
  },
  hotSectors: [
    { name: '新能源', change: 2.35, stocks: ['宁德时代', '比亚迪', '隆基绿能'] },
    { name: '人工智能', change: 1.87, stocks: ['科大讯飞', '寒武纪', '海康威视'] },
    { name: '半导体', change: 1.56, stocks: ['中芯国际', '韦尔股份', '北方华创'] },
  ],
  marketSentiment: '中性偏乐观',
  volatility: '低',
};

const languages = [
  { value: 'zh-CN', label: '中文' },
  { value: 'en-US', label: 'English' },
];

const stockPattern = /([a-zA-Z]{1,4}:[a-zA-Z0-9]{1,5}|[0-9]{6})/g;

const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: '您好！我是智盈AI投资助手，有什么可以帮助您的吗？\n\n📊 我可以为您提供：\n• 实时市场分析\n• 热点板块追踪\n• 投资策略建议\n• 技术指标解读\n• 风险评估提示\n• 个股基本面分析\n• 财经新闻解读\n• 行业发展趋势分析\n• 投资组合优化\n\n点击下方快捷问题或直接输入您的问题！\n\n💡 提示：您可以直接输入股票代码获取分析，例如："分析 600036" 或 "分析 AAPL:US"',
      type: 'ai',
      timestamp: new Date(),
      tags: ['welcome']
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('zh-CN');
  const [conversationId, setConversationId] = useState(Date.now().toString());
  const [currentTip, setCurrentTip] = useState(aiTips[Math.floor(Math.random() * aiTips.length)]);
  const [marketData, setMarketData] = useState(mockMarketData);

  useEffect(() => {
    localStorage.setItem('ai_assistant_history', JSON.stringify(messages));
  }, [messages]);

  const llm = getLLM();

  // 从本地存储加载历史记录
  useEffect(() => {
    const savedHistory = localStorage.getItem('ai_assistant_history');
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        if (Array.isArray(parsedHistory) && parsedHistory.length > 0) {
          setMessages(parsedHistory);
        }
      } catch (error) {
        console.error('加载历史记录失败:', error);
      }
    }
  }, []);

  const handleSend = useCallback(async () => {
    if (!inputValue.trim()) return;

    // 识别股票代码
    const stockMatches = inputValue.match(stockPattern);
    const tags: string[] = [];
    if (stockMatches) {
      tags.push('stock');
      stockMatches.forEach(stock => tags.push(stock));
    }

    // 识别消息类型
    if (inputValue.includes('分析') || inputValue.includes('analyze')) {
      tags.push('analysis');
    }
    if (inputValue.includes('推荐') || inputValue.includes('recommend')) {
      tags.push('recommendation');
    }
    if (inputValue.includes('策略') || inputValue.includes('strategy')) {
      tags.push('strategy');
    }
    if (inputValue.includes('风险') || inputValue.includes('risk')) {
      tags.push('risk');
    }
    if (inputValue.includes('新闻') || inputValue.includes('news')) {
      tags.push('news');
    }
    if (inputValue.includes('组合') || inputValue.includes('portfolio')) {
      tags.push('portfolio');
    }
    if (inputValue.includes('行业') || inputValue.includes('sector')) {
      tags.push('sector');
    }
    if (inputValue.includes('基本面') || inputValue.includes('fundamental')) {
      tags.push('fundamental');
    }
    if (inputValue.includes('技术') || inputValue.includes('technical')) {
      tags.push('technical');
    }
    if (inputValue.includes('市场') || inputValue.includes('market')) {
      tags.push('market');
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      type: 'user',
      timestamp: new Date(),
      tags
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      // 构建增强的提示
      let enhancedPrompt = inputValue;
      
      // 添加股票代码分析指令
      if (stockMatches) {
        enhancedPrompt += `\n\n请针对以下股票代码进行详细分析：${stockMatches.join(', ')}`;
        enhancedPrompt += '\n分析内容应包括：\n1. 最新价格和近期走势\n2. 基本面分析（财务状况、行业地位等）\n3. 技术面分析（主要技术指标、支撑阻力位等）\n4. 投资建议和风险提示\n5. 与同行业股票的对比分析\n6. 未来发展前景预测';
      }

      // 添加市场分析指令
      if (tags.includes('market')) {
        enhancedPrompt += `\n\n当前市场数据：\n`;
        enhancedPrompt += `上证指数: ${marketData.indices['上证指数'].current} (${marketData.indices['上证指数'].changePercent > 0 ? '+' : ''}${marketData.indices['上证指数'].changePercent}%)\n`;
        enhancedPrompt += `深证成指: ${marketData.indices['深证成指'].current} (${marketData.indices['深证成指'].changePercent > 0 ? '+' : ''}${marketData.indices['深证成指'].changePercent}%)\n`;
        enhancedPrompt += `创业板指: ${marketData.indices['创业板指'].current} (${marketData.indices['创业板指'].changePercent > 0 ? '+' : ''}${marketData.indices['创业板指'].changePercent}%)\n`;
        enhancedPrompt += `热点板块: ${marketData.hotSectors.map(s => s.name).join(', ')}\n`;
        enhancedPrompt += `市场情绪: ${marketData.marketSentiment}\n`;
        enhancedPrompt += `市场波动性: ${marketData.volatility}\n`;
        enhancedPrompt += '\n请基于以上数据提供详细的市场分析和投资建议。';
      }

      // 添加行业分析指令
      if (tags.includes('sector')) {
        enhancedPrompt += '\n\n请提供详细的行业分析，包括：\n1. 行业当前发展状况\n2. 主要驱动因素\n3. 领先企业分析\n4. 未来发展趋势\n5. 投资机会和风险';
      }

      // 添加其他类型的分析指令
      if (tags.includes('news')) {
        enhancedPrompt += '\n\n请分析相关新闻对市场和个股的影响，包括短期和长期影响，并提供投资建议。';
      }

      if (tags.includes('portfolio')) {
        enhancedPrompt += '\n\n请提供投资组合优化建议，包括资产配置、风险分散和收益最大化策略。';
      }

      if (tags.includes('strategy')) {
        enhancedPrompt += '\n\n请提供详细的投资策略，包括入场时机、止损止盈设置、资金管理等。';
      }

      // 添加语言指令
      if (language === 'zh-CN') {
        enhancedPrompt += '\n\n请用中文回复，回答要详细、专业、客观，并提供具体的数据和分析依据。';
      } else {
        enhancedPrompt += '\n\nPlease respond in English with detailed, professional, and objective analysis, providing specific data and evidence. ';
      }

      // 添加用户消息到LLM
      llm.addUserMessage(enhancedPrompt);
      // 获取LLM响应
      const response = await llm.getResponse();
      
      // 处理AI响应，添加相关标签
      const aiTags: string[] = [];
      if (stockMatches) aiTags.push('stock_analysis');
      if (response.content.includes('建议') || response.content.includes('recommend')) aiTags.push('recommendation');
      if (response.content.includes('风险') || response.content.includes('risk')) aiTags.push('risk');
      if (response.content.includes('策略') || response.content.includes('strategy')) aiTags.push('strategy');
      if (response.content.includes('新闻') || response.content.includes('news')) aiTags.push('news');
      if (response.content.includes('组合') || response.content.includes('portfolio')) aiTags.push('portfolio');
      if (response.content.includes('行业') || response.content.includes('sector')) aiTags.push('sector');
      if (response.content.includes('市场') || response.content.includes('market')) aiTags.push('market');

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.content,
        type: 'ai',
        timestamp: new Date(),
        tags: aiTags
      };
      setMessages(prev => [...prev, aiMessage]);
      
      // 更新智能提示
      setCurrentTip(aiTips[Math.floor(Math.random() * aiTips.length)]);
    } catch (error) {
      console.error('LLM响应失败:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: language === 'zh-CN' ? '抱歉，AI助手暂时无法响应，请稍后再试。' : 'Sorry, the AI assistant is temporarily unavailable. Please try again later.',
        type: 'ai',
        timestamp: new Date(),
        tags: ['error']
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }, [inputValue, language, marketData]);

  const handleClearHistory = useCallback(() => {
    // 生成新的对话ID
    setConversationId(Date.now().toString());
    
    setMessages([
      {
        id: '1',
        content: language === 'zh-CN' ? '您好！我是智盈AI投资助手，有什么可以帮助您的吗？\n\n📊 我可以为您提供：\n• 实时市场分析\n• 热点板块追踪\n• 投资策略建议\n• 技术指标解读\n• 风险评估提示\n• 个股基本面分析\n• 财经新闻解读\n\n点击下方快捷问题或直接输入您的问题！\n\n💡 提示：您可以直接输入股票代码获取分析，例如："分析 600036" 或 "分析 AAPL:US"' : 'Hello! I am the Zhiying AI Investment Assistant. How can I help you today?\n\n📊 I can provide you with:\n• Real-time market analysis\n• Hot sector tracking\n• Investment strategy recommendations\n• Technical indicator interpretation\n• Risk assessment tips\n• Individual stock fundamental analysis\n• Financial news interpretation\n\nClick on the quick questions below or enter your question directly!\n\n💡 Tip: You can directly enter stock codes for analysis, for example: "Analyze 600036" or "Analyze AAPL:US"',
        type: 'ai',
        timestamp: new Date(),
        tags: ['welcome']
      }
    ]);
    message.success(language === 'zh-CN' ? '对话历史已清空' : 'Conversation history cleared');
  }, [language]);

  const handleSaveHistory = useCallback(() => {
    const dataStr = JSON.stringify(messages, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai_assistant_${conversationId}_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    message.success(language === 'zh-CN' ? '对话历史已保存' : 'Conversation history saved');
  }, [messages, conversationId, language]);

  const handleQuickQuestion = useCallback((question: string) => {
    setInputValue(question);
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div style={{ padding: '0' }}>
      <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>智盈AI投资助手</h2>
        <Space size="small">
          <Select
            defaultValue="zh-CN"
            style={{ width: 100 }}
            onChange={setLanguage}
            options={languages}
            prefix={<GlobalOutlined />}
            size="small"
          />
          <Button 
            type="default" 
            size="small" 
            icon={<SaveOutlined />} 
            onClick={handleSaveHistory}
          >
            {language === 'zh-CN' ? '保存对话' : 'Save'}
          </Button>
          <Popconfirm
            title={language === 'zh-CN' ? '确定要清空对话历史吗？' : 'Are you sure you want to clear the conversation history?'}
            onConfirm={handleClearHistory}
            okText={language === 'zh-CN' ? '确定' : 'Yes'}
            cancelText={language === 'zh-CN' ? '取消' : 'No'}
          >
            <Button 
              type="default" 
              size="small" 
              danger
              icon={<ClearOutlined />} 
            >
              {language === 'zh-CN' ? '清空历史' : 'Clear'}
            </Button>
          </Popconfirm>
        </Space>
      </div>
      
      {/* 实时市场数据 */}
      <Card size="small" bordered={false} style={{ marginBottom: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          {Object.entries(marketData.indices).map(([name, data]) => (
            <div key={name} style={{ margin: '4px', padding: '8px 12px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
              <Text style={{ fontSize: '12px' }}>{name}</Text>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: data.changePercent >= 0 ? '#52c41a' : '#ff4d4f' }}>
                {data.current} ({data.changePercent >= 0 ? '+' : ''}{data.changePercent}%)
              </div>
            </div>
          ))}
        </div>
        <Divider style={{ margin: '8px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Text type="secondary" style={{ fontSize: '12px' }}>{language === 'zh-CN' ? '热点板块：' : 'Hot Sectors:'}</Text>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
              {marketData.hotSectors.map(sector => (
                <Tag key={sector.name} color="blue" style={{ fontSize: '11px' }}>
                  {sector.name} +{sector.change}%
                </Tag>
              ))}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>{language === 'zh-CN' ? '市场情绪：' : 'Market Sentiment:'}</Text>
            <div style={{ fontSize: '12px', marginTop: '4px' }}>{marketData.marketSentiment}</div>
          </div>
        </div>
      </Card>
      
      <Card size="small" bordered={false} style={{ height: '600px', display: 'flex', flexDirection: 'column', margin: '2px' }}>
        <div style={{ marginBottom: '12px' }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>{language === 'zh-CN' ? '快捷问题：' : 'Quick Questions:'}</Text>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
            {quickQuestions.map(q => (
              <Tooltip key={q.key} title={language === 'zh-CN' ? q.description : q.description}>
                <Button
                  key={q.key}
                  type="dashed"
                  size="small"
                  icon={q.icon}
                  onClick={() => handleQuickQuestion(q.label)}
                  style={{ borderColor: q.color, color: q.color }}
                >
                  {q.label}
                </Button>
              </Tooltip>
            ))}
          </div>
        </div>

        <Divider style={{ margin: '8px 0' }} />
        
        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '16px' }}>
          <List
            dataSource={messages}
            renderItem={(item) => (
              <List.Item style={{ padding: '12px 0' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ fontSize: '20px', marginTop: '2px' }}>
                    {item.type === 'ai' ? (
                      <Badge dot={item.tags?.includes('stock_analysis')}>
                        <RobotOutlined style={{ color: '#1890ff' }} />
                      </Badge>
                    ) : (
                      <span style={{ color: '#52c41a' }}>👤</span>
                    )}
                  </div>
                  <div style={{ flex: 1, maxWidth: '100%' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '4px' }}>
                      {item.tags?.map(tag => (
                        <Tag key={tag} color={tag === 'stock' ? 'blue' : tag === 'analysis' ? 'green' : tag === 'recommendation' ? 'orange' : tag === 'risk' ? 'red' : 'default'}>
                          {tag}
                        </Tag>
                      ))}
                    </div>
                    <Paragraph
                      style={{
                        margin: 0,
                        padding: '12px 16px',
                        borderRadius: '12px',
                        backgroundColor: item.type === 'ai' ? '#f0f5ff' : '#f6ffed',
                        whiteSpace: 'pre-wrap',
                        lineHeight: '1.8',
                        fontSize: '14px'
                      }}
                    >
                      {item.content}
                    </Paragraph>
                    <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginTop: '6px', marginLeft: '4px' }}>
                      {item.timestamp.toLocaleTimeString(language === 'zh-CN' ? 'zh-CN' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </div>
                </div>
              </List.Item>
            )}
          />
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
              <Spin size="small" tip={language === 'zh-CN' ? 'AI正在分析中...' : 'AI is analyzing...'} />
            </div>
          )}
        </div>
        <Divider style={{ margin: '8px 0' }} />
        <div style={{ marginBottom: '8px' }}>
          <Text type="secondary" style={{ fontSize: '11px', fontStyle: 'italic' }}>{currentTip}</Text>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Input
            placeholder={language === 'zh-CN' ? '输入您的问题，例如：分析当前市场走势、今日热点板块...' : 'Enter your question, e.g.: Analyze current market trends, today\'s hot sectors...'}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            size="small"
            onPressEnter={handleSend}
          />
          <Button type="primary" icon={<SendOutlined />} onClick={handleSend} loading={loading} size="small">
            {language === 'zh-CN' ? '发送' : 'Send'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AIAssistant;
