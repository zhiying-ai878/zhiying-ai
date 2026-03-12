import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Select, Form, Table, Tag, Space, message, Modal, Alert, Switch, Radio, InputNumber, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, PlayCircleOutlined, PauseCircleOutlined, HistoryOutlined, ReloadOutlined } from '@ant-design/icons';
import { CustomStrategy, BacktestResult, backtestStrategy, BacktestData, defaultBacktestConfig } from '../../utils/advancedAIAnalysis';
import { getStrategyExecutionEngine, startStrategyEngine, stopStrategyEngine, addStrategyToEngine, removeStrategyFromEngine, getEngineStatus, getEngineExecutionHistory, getEngineActiveTrades, EngineStatus } from '../../utils/strategyExecutionEngine';
import { getKLineData } from '../../utils/stockData';
import { calculateMA, calculateMACD, calculateRSI, calculateBollingerBands } from '../../utils/aiAnalysis';

const { Option } = Select;
const { TextArea } = Input;

const StrategyManager: React.FC = () => {
  const [strategies, setStrategies] = useState<CustomStrategy[]>([]);
  const [engineStatus, setEngineStatus] = useState<EngineStatus>('idle');
  const [executionHistory, setExecutionHistory] = useState<any[]>([]);
  const [activeTrades, setActiveTrades] = useState<any[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentStrategy, setCurrentStrategy] = useState<CustomStrategy | null>(null);
  const [form] = Form.useForm();
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null);
  const [isBacktesting, setIsBacktesting] = useState(false);

  const strategyEngine = getStrategyExecutionEngine();

  useEffect(() => {
    loadStrategies();
    updateEngineStatus();
  }, []);

  useEffect(() => {
    if (engineStatus === 'running') {
      const interval = setInterval(() => {
        updateExecutionHistory();
        updateActiveTrades();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [engineStatus]);

  const loadStrategies = () => {
    setStrategies(strategyEngine.getStrategies());
  };

  const updateEngineStatus = () => {
    setEngineStatus(strategyEngine.getStatus());
  };

  const updateExecutionHistory = () => {
    setExecutionHistory(strategyEngine.getExecutionHistory());
  };

  const updateActiveTrades = () => {
    setActiveTrades(strategyEngine.getActiveTrades());
  };

  const handleAddStrategy = () => {
    setIsEditing(false);
    setCurrentStrategy(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditStrategy = (strategy: CustomStrategy) => {
    setIsEditing(true);
    setCurrentStrategy(strategy);
    form.setFieldsValue({
      name: strategy.name,
      description: strategy.description,
      indicators: strategy.indicators,
      riskLevel: strategy.riskLevel,
      parameters: JSON.stringify(strategy.parameters, null, 2),
      rules: strategy.rules
    });
    setIsModalVisible(true);
  };

  const handleDeleteStrategy = (strategyId: string) => {
    removeStrategyFromEngine(strategyId);
    loadStrategies();
    message.success('策略已删除');
  };

  const handleStartEngine = () => {
    startStrategyEngine();
    updateEngineStatus();
    message.success('策略执行引擎已启动');
  };

  const handleStopEngine = () => {
    stopStrategyEngine();
    updateEngineStatus();
    message.success('策略执行引擎已停止');
  };

  const handleBacktest = async () => {
    try {
      setIsBacktesting(true);
      
      // 获取测试数据
      const kLineData = await getKLineData('002594', 'day', 180);
      if (!kLineData || kLineData.length < 60) {
        message.error('获取测试数据失败');
        return;
      }

      // 计算技术指标
      const prices = kLineData.map(item => item.close);
      const volumes = kLineData.map(item => item.volume);
      const ma5 = calculateMA(prices, 5);
      const ma10 = calculateMA(prices, 10);
      const rsi = calculateRSI(prices, 14);
      const { macd } = calculateMACD(prices);
      const { upper, lower } = calculateBollingerBands(prices, 20, 2);

      // 准备回测数据
      const backtestData: BacktestData = {
        prices,
        volumes,
        ma5,
        ma10,
        rsi,
        macd,
        upperBand: upper,
        lowerBand: lower
      };

      // 从表单获取策略
      const values = await form.validateFields();
      const strategy: CustomStrategy = {
        id: currentStrategy?.id || Date.now().toString(),
        name: values.name,
        description: values.description,
        indicators: values.indicators,
        parameters: values.parameters ? JSON.parse(values.parameters) : {},
        rules: values.rules,
        riskLevel: values.riskLevel
      };

      // 执行回测
      const result = backtestStrategy(backtestData, strategy);
      setBacktestResult(result);
      message.success('回测完成');
    } catch (error) {
      message.error('回测失败: ' + (error as Error).message);
    } finally {
      setIsBacktesting(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const strategy: CustomStrategy = {
        id: currentStrategy?.id || Date.now().toString(),
        name: values.name,
        description: values.description,
        indicators: values.indicators,
        parameters: values.parameters ? JSON.parse(values.parameters) : {},
        rules: values.rules,
        riskLevel: values.riskLevel
      };

      if (isEditing && currentStrategy) {
        // 更新策略
        removeStrategyFromEngine(currentStrategy.id);
        addStrategyToEngine(strategy);
        message.success('策略已更新');
      } else {
        // 添加新策略
        addStrategyToEngine(strategy);
        message.success('策略已添加');
      }

      loadStrategies();
      setIsModalVisible(false);
    } catch (error) {
      console.error('提交失败:', error);
    }
  };

  const columns = [
    {
      title: '策略名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '指标',
      dataIndex: 'indicators',
      key: 'indicators',
      render: (indicators: string[]) => (
        <Space wrap>
          {indicators.map(indicator => (
            <Tag key={indicator}>{indicator}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '风险等级',
      dataIndex: 'riskLevel',
      key: 'riskLevel',
      render: (riskLevel: string) => {
        const colorMap = {
          low: 'green',
          medium: 'blue',
          high: 'red'
        };
        const textMap = {
          low: '低风险',
          medium: '中风险',
          high: '高风险'
        };
        return <Tag color={colorMap[riskLevel as keyof typeof colorMap]}>{textMap[riskLevel as keyof typeof textMap]}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: CustomStrategy) => (
        <Space size="middle">
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEditStrategy(record)}>
            编辑
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDeleteStrategy(record.id)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const historyColumns = [
    {
      title: '策略',
      dataIndex: 'strategyId',
      key: 'strategyId',
    },
    {
      title: '股票',
      dataIndex: 'stockCode',
      key: 'stockCode',
    },
    {
      title: '信号',
      dataIndex: 'signal',
      key: 'signal',
      render: (signal: string) => {
        const colorMap = {
          buy: 'green',
          sell: 'red',
          hold: 'blue'
        };
        const textMap = {
          buy: '买入',
          sell: '卖出',
          hold: '持有'
        };
        return <Tag color={colorMap[signal as keyof typeof colorMap]}>{textMap[signal as keyof typeof textMap]}</Tag>;
      },
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => price.toFixed(2),
    },
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp: number) => new Date(timestamp).toLocaleString(),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        return <Tag color={status === 'success' ? 'green' : 'red'}>{status === 'success' ? '成功' : '失败'}</Tag>;
      },
    },
  ];

  const tradeColumns = [
    {
      title: '股票',
      dataIndex: 'stockCode',
      key: 'stockCode',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        return <Tag color={type === 'buy' ? 'green' : 'red'}>{type === 'buy' ? '买入' : '卖出'}</Tag>;
      },
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => price.toFixed(2),
    },
    {
      title: '数量',
      dataIndex: 'volume',
      key: 'volume',
    },
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp: number) => new Date(timestamp).toLocaleString(),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        return <Tag color={status === 'executed' ? 'green' : 'blue'}>{status === 'executed' ? '已执行' : status === 'pending' ? '待执行' : '已取消'}</Tag>;
      },
    },
  ];

  return (
    <div style={{ padding: 0 }}>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>策略管理</h2>
        <Space>
          <Button 
            type={engineStatus === 'running' ? 'default' : 'primary'}
            icon={engineStatus === 'running' ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
            onClick={engineStatus === 'running' ? handleStopEngine : handleStartEngine}
            disabled={engineStatus === 'error'}
          >
            {engineStatus === 'running' ? '停止引擎' : '启动引擎'}
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddStrategy}>
            添加策略
          </Button>
        </Space>
      </div>

      <Alert
        message={`策略执行引擎状态: ${engineStatus === 'idle' ? '空闲' : engineStatus === 'running' ? '运行中' : engineStatus === 'paused' ? '暂停' : '错误'}`}
        type={engineStatus === 'running' ? 'success' : engineStatus === 'error' ? 'error' : 'info'}
        showIcon
        style={{ marginBottom: '16px' }}
      />

      <Card size="small" title="策略列表" style={{ marginBottom: '16px' }}>
        <Table 
          columns={columns} 
          dataSource={strategies} 
          rowKey="id" 
          size="small"
          pagination={{ pageSize: 5 }}
        />
      </Card>

      <Card size="small" title="执行历史" style={{ marginBottom: '16px' }}>
        <Table 
          columns={historyColumns} 
          dataSource={executionHistory} 
          rowKey="id" 
          size="small"
          pagination={{ pageSize: 5 }}
        />
      </Card>

      <Card size="small" title="活跃交易">
        <Table 
          columns={tradeColumns} 
          dataSource={activeTrades} 
          rowKey="id" 
          size="small"
          pagination={{ pageSize: 5 }}
        />
      </Card>

      <Modal
        title={isEditing ? '编辑策略' : '添加策略'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
        width={800}
        footer={[
          <Button key="back" onClick={() => setIsModalVisible(false)}>
            取消
          </Button>,
          <Button key="backtest" type="default" onClick={handleBacktest} loading={isBacktesting}>
            回测
          </Button>,
          <Button key="submit" type="primary" onClick={handleSubmit}>
            {isEditing ? '更新' : '添加'}
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="策略名称"
            rules={[{ required: true, message: '请输入策略名称' }]}
          >
            <Input placeholder="请输入策略名称" />
          </Form.Item>

          <Form.Item
            name="description"
            label="策略描述"
            rules={[{ required: true, message: '请输入策略描述' }]}
          >
            <TextArea rows={3} placeholder="请输入策略描述" />
          </Form.Item>

          <Form.Item
            name="indicators"
            label="技术指标"
            rules={[{ required: true, message: '请选择技术指标' }]}
          >
            <Select
              mode="multiple"
              placeholder="请选择技术指标"
              style={{ width: '100%' }}
            >
              <Option value="MA">移动平均线</Option>
              <Option value="RSI">相对强弱指标</Option>
              <Option value="MACD">平滑异同移动平均线</Option>
              <Option value="KDJ">随机指标</Option>
              <Option value="CCI">顺势指标</Option>
              <Option value="Bollinger">布林带</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="riskLevel"
            label="风险等级"
            rules={[{ required: true, message: '请选择风险等级' }]}
          >
            <Radio.Group>
              <Radio value="low">低风险</Radio>
              <Radio value="medium">中风险</Radio>
              <Radio value="high">高风险</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="parameters"
            label="策略参数"
            tooltip="JSON格式的策略参数"
          >
            <TextArea rows={4} placeholder="请输入JSON格式的策略参数，例如: {maPeriod: 5, rsiPeriod: 14}" />
          </Form.Item>

          <Form.Item
            name="rules"
            label="策略规则"
            rules={[{ required: true, message: '请输入策略规则' }]}
          >
            <TextArea rows={4} placeholder="请输入策略规则描述" />
          </Form.Item>
        </Form>

        {backtestResult && (
          <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
            <h4>回测结果</h4>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>总收益率: {backtestResult.totalReturn.toFixed(2)}%</div>
              <div>年化收益率: {backtestResult.annualizedReturn.toFixed(2)}%</div>
              <div>最大回撤: {backtestResult.maxDrawdown.toFixed(2)}%</div>
              <div>胜率: {backtestResult.winRate.toFixed(2)}%</div>
              <div>总交易次数: {backtestResult.totalTrades}</div>
              <div>盈利交易: {backtestResult.winningTrades}</div>
              <div>亏损交易: {backtestResult.losingTrades}</div>
              <div>夏普比率: {backtestResult.sharpeRatio.toFixed(2)}</div>
            </Space>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StrategyManager;
