# 智盈AI - 实现计划

## [x] Task 1: 优化界面布局 - 统一间距和规范
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 修改Layout.css文件，设置content的margin为74px 10px 10px 150px（顶部header高度64px + 10px间距）
  - 确保所有页面的根容器padding: 0
  - 统一使用Card size="small"、bordered={false}
  - 统一元素间距marginBottom: 10px
  - 统一Row gutter: [8, 8]
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-3
- **Test Requirements**:
  - `human-judgment` TR-1.1: 验证content的margin-top为74px
  - `human-judgment` TR-1.2: 验证content的margin-left为150px（紧靠侧边栏）
  - `human-judgment` TR-1.3: 验证所有元素间距为10px
  - `human-judgment` TR-1.4: 验证所有页面padding: 0
- **Notes**: 确保所有页面符合统一的间距规范

## [x] Task 2: 品牌名称统一
- **Priority**: P0
- **Depends On**: None
- **Description**:
  - 修改README.md中的标题和项目名称
  - 修改Login.tsx中的登录页面标题
  - 修改Layout.tsx中的header标题
  - 修改所有文档中的品牌名称
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `human-judgment` TR-2.1: 验证README.md显示"智盈AI"
  - `human-judgment` TR-2.2: 验证登录页面显示"智盈AI登录"
  - `human-judgment` TR-2.3: 验证header显示"智盈AI投资系统"
- **Notes**: 确保所有显示品牌名称的地方都已更新

## [x] Task 3: 首页仪表盘功能完善
- **Priority**: P0
- **Depends On**: Task 1
- **Description**:
  - 确保Dashboard页面显示市场概览
  - 确保实时行情数据展示正常
  - 确保AI推荐和主力资金监控功能
- **Acceptance Criteria Addressed**: AC-5
- **Test Requirements**:
  - `human-judgment` TR-3.1: 验证仪表盘数据展示
  - `human-judgment` TR-3.2: 验证图表显示
- **Notes**: 使用模拟数据验证

## [x] Task 4: 股票详情页面功能完善
- **Priority**: P0
- **Depends On**: Task 1
- **Description**:
  - 确保K线图、分时图显示正常
  - 确保五档买卖数据展示
  - 确保技术指标图表正常
- **Acceptance Criteria Addressed**: AC-6
- **Test Requirements**:
  - `human-judgment` TR-4.1: 验证K线图显示
  - `human-judgment` TR-4.2: 验证分时图显示
  - `human-judgment` TR-4.3: 验证五档买卖数据
- **Notes**: 使用ECharts验证图表功能

## [x] Task 5: 交易管理功能完善
- **Priority**: P0
- **Depends On**: Task 1
- **Description**:
  - 确保手动交易功能正常
  - 确保AI自动交易开关
  - 确保交易历史记录展示
  - 确保策略管理功能
- **Acceptance Criteria Addressed**: AC-7
- **Test Requirements**:
  - `programmatic` TR-5.1: 验证交易记录生成
  - `human-judgment` TR-5.2: 验证交易界面交互
- **Notes**: 模拟交易测试

## [x] Task 6: AI助手功能完善
- **Priority**: P1
- **Depends On**: Task 1
- **Description**:
  - 确保聊天对话功能
  - 确保技术分析展示
  - 确保投资建议生成
- **Acceptance Criteria Addressed**: AC-8
- **Test Requirements**:
  - `human-judgment` TR-6.1: 验证对话交互
  - `human-judgment` TR-6.2: 验证分析结果展示
- **Notes**: 使用模拟AI响应

## [x] Task 7: 主力追踪功能完善
- **Priority**: P1
- **Depends On**: Task 1
- **Description**:
  - 确保主力资金流向图表
  - 确保预警配置功能
  - 确保实时数据更新
- **Acceptance Criteria Addressed**: AC-9
- **Test Requirements**:
  - `human-judgment` TR-7.1: 验证主力资金图表
  - `human-judgment` TR-7.2: 验证预警配置
- **Notes**: 使用模拟数据

## [x] Task 8: 信号提醒功能完善
- **Priority**: P1
- **Depends On**: Task 1
- **Description**:
  - 确保买卖信号展示
  - 确保优先级排序
  - 确保置信度评分
- **Acceptance Criteria Addressed**: AC-10
- **Test Requirements**:
  - `human-judgment` TR-8.1: 验证信号列表
  - `human-judgment` TR-8.2: 验证置信度显示
- **Notes**: 使用模拟信号数据

## [x] Task 9: 涨跌预测功能完善
- **Priority**: P1
- **Depends On**: Task 1
- **Description**:
  - 确保AI预测结果展示
  - 确保技术指标分析
  - 确保历史预测记录
- **Acceptance Criteria Addressed**: AC-11
- **Test Requirements**:
  - `human-judgment` TR-9.1: 验证预测结果
  - `human-judgment` TR-9.2: 验证技术指标分析
- **Notes**: 使用模拟预测数据

## [x] Task 10: 组合分析功能完善
- **Priority**: P1
- **Depends On**: Task 1
- **Description**:
  - 确保持仓明细展示
  - 确保资产配置分析
  - 确保收益统计
- **Acceptance Criteria Addressed**: AC-12
- **Test Requirements**:
  - `human-judgment` TR-10.1: 验证持仓明细
  - `human-judgment` TR-10.2: 验证资产配置
- **Notes**: 使用模拟组合数据

## [x] Task 11: 数据源管理功能完善
- **Priority**: P1
- **Depends On**: Task 1
- **Description**:
  - 确保多数据源切换
  - 确保数据预览
  - 确保API配置
- **Acceptance Criteria Addressed**: AC-13
- **Test Requirements**:
  - `human-judgment` TR-11.1: 验证数据源切换
  - `human-judgment` TR-11.2: 验证数据预览
- **Notes**: 使用模拟数据源

## [x] Task 12: 系统设置功能完善
- **Priority**: P1
- **Depends On**: Task 1
- **Description**:
  - 确保账户管理
  - 确保交易设置
  - 确保AI设置
  - 确保通知配置
- **Acceptance Criteria Addressed**: AC-14
- **Test Requirements**:
  - `programmatic` TR-12.1: 验证设置保存
  - `human-judgment` TR-12.2: 验证设置界面
- **Notes**: 使用localStorage模拟

## [x] Task 13: 清理临时文件和诊断错误
- **Priority**: P2
- **Depends On**: All previous tasks
- **Description**:
  - 删除所有临时.cjs脚本文件
  - 删除test-*.ts测试文件
  - 确保无诊断错误
- **Acceptance Criteria Addressed**: NFR-4
- **Test Requirements**:
  - `programmatic` TR-13.1: 验证无临时文件
  - `programmatic` TR-13.2: 验证无诊断错误
- **Notes**: 清理所有临时生成的文件
