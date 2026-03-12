# 智盈AI - 产品需求文档

## Overview
- **Summary**: 一个基于AI的股票交易软件，实现实时监控主力动向、AI辅助分析、信号提醒、涨跌预测、组合管理等功能，具有美观统一的界面布局。
- **Purpose**: 为投资者提供智能的股票分析工具，帮助用户实时监控市场动态，利用AI技术辅助投资决策，提升投资效率和体验。
- **Target Users**: 股票投资者、量化交易爱好者、需要AI辅助决策的投资用户。

## Goals
- 优化界面布局，统一卡片间距为10px，Row gutter为[8, 8]
- 完善11个核心功能页面：首页、股票详情、交易、设置、AI助手、AI策略、数据源、主力追踪、组合分析、信号提醒、涨跌预测
- 实现品牌统一：所有显示"AI投资软件"的地方改为"智盈AI"
- 确保页面内容到顶部的间距始终保持10px
- 确保内容区域紧靠侧边栏，无遮挡

## Non-Goals (Out of Scope)
- 不支持真实股票交易（仅模拟交易）
- 不提供后端服务器部署
- 不包含移动端原生应用开发
- 不涉及真实资金操作

## Background & Context
- 现有项目已完成基础功能开发，包含11个核心页面
- 技术栈：React + TypeScript + Vite + Ant Design + ECharts
- 界面已优化：统一使用Card size="small"、bordered={false}、padding: 0
- 间距规范：元素间距marginBottom: 10px，Row gutter: [8, 8]

## Functional Requirements
- **FR-1**: 界面布局优化 - 统一所有页面的卡片和元素间距
- **FR-2**: 首页仪表盘 - 市场概览、实时行情、主力资金监控
- **FR-3**: 股票详情 - K线图、技术指标、分时图、五档买卖
- **FR-4**: 交易管理 - 手动交易、AI自动交易、交易历史、策略管理
- **FR-5**: AI助手 - 聊天对话、技术分析、投资建议
- **FR-6**: AI策略 - 自定义策略、模型训练、策略回测
- **FR-7**: 主力追踪 - 实时监控主力资金流向、预警配置
- **FR-8**: 信号提醒 - 买卖信号、预警通知、置信度评分
- **FR-9**: 涨跌预测 - AI预测、技术指标分析、历史预测记录
- **FR-10**: 组合分析 - 持仓管理、资产配置、收益分析
- **FR-11**: 数据源管理 - 多数据源切换、数据预览、API配置
- **FR-12**: 系统设置 - 账户管理、交易设置、AI设置、通知配置
- **FR-13**: 品牌统一 - 所有显示"AI投资软件"改为"智盈AI"

## Non-Functional Requirements
- **NFR-1**: 响应式设计 - 适配不同屏幕尺寸
- **NFR-2**: 性能优化 - 页面加载快速，图表渲染流畅
- **NFR-3**: 安全性 - 账户信息加密存储（模拟）
- **NFR-4**: 用户体验 - 界面美观、操作流畅、间距统一
- **NFR-5**: 可访问性 - 合理的颜色对比、清晰的文字

## Constraints
- **Technical**: React + TypeScript + Vite + Ant Design + ECharts
- **Business**: 模拟交易系统，学习和研究用途
- **Dependencies**: 所有依赖已配置，无需额外安装

## Assumptions
- 用户已安装Node.js环境
- 项目依赖已正确配置
- 使用模拟数据进行功能展示
- 用户使用现代浏览器访问

## Acceptance Criteria

### AC-1: 界面布局优化
- **Given**: 用户打开智盈AI
- **When**: 浏览各个页面
- **Then**: 所有元素间距为10px，Row gutter为[8, 8]，Card使用size="small"和bordered={false}
- **Verification**: `human-judgment`
- **Notes**: 验证所有页面的布局是否符合统一规范

### AC-2: 顶部间距规范
- **Given**: 用户打开任意页面
- **When**: 查看页面顶部
- **Then**: 页面内容到顶部的间距为10px（header高度64px + 10px = 74px）
- **Verification**: `human-judgment`
- **Notes**: 确保content的margin-top为74px

### AC-3: 侧边栏无遮挡
- **Given**: 用户打开任意页面
- **When**: 查看左侧内容
- **Then**: 内容区域紧靠侧边栏，左侧margin为150px（与侧边栏宽度一致）
- **Verification**: `human-judgment`
- **Notes**: 确保无内容被侧边栏遮挡

### AC-4: 品牌名称统一
- **Given**: 用户浏览整个应用
- **When**: 查看所有显示品牌名称的位置
- **Then**: 所有地方显示"智盈AI"而非"AI投资软件"
- **Verification**: `human-judgment`
- **Notes**: 包括登录页面、header标题、文档等

### AC-5: 首页仪表盘功能
- **Given**: 用户登录后进入首页
- **When**: 查看仪表盘
- **Then**: 显示市场概览、实时行情、AI推荐、主力资金监控
- **Verification**: `human-judgment`
- **Notes**: 验证数据展示和交互功能

### AC-6: 股票详情页面
- **Given**: 用户进入股票详情页面
- **When**: 查看K线图、分时图、五档买卖
- **Then**: 图表显示清晰，数据更新，支持不同周期切换
- **Verification**: `human-judgment`
- **Notes**: 使用模拟数据验证功能

### AC-7: 交易管理功能
- **Given**: 用户进入交易页面
- **When**: 进行手动交易或开启AI自动交易
- **Then**: 交易记录正确生成，策略管理正常
- **Verification**: `programmatic`
- **Notes**: 使用模拟交易测试

### AC-8: AI助手功能
- **Given**: 用户进入AI助手页面
- **When**: 与AI对话询问投资建议
- **Then**: AI返回分析结果、技术指标、交易建议
- **Verification**: `human-judgment`
- **Notes**: 验证对话交互和分析结果

### AC-9: 主力追踪功能
- **Given**: 用户进入主力追踪页面
- **When**: 查看主力资金流向
- **Then**: 图表显示实时资金数据，支持预警配置
- **Verification**: `human-judgment`
- **Notes**: 验证数据可视化和预警功能

### AC-10: 信号提醒功能
- **Given**: 用户进入信号提醒页面
- **When**: 查看买卖信号
- **Then**: 信号按优先级排序，显示置信度和理由
- **Verification**: `human-judgment`
- **Notes**: 验证信号展示和评分系统

### AC-11: 涨跌预测功能
- **Given**: 用户进入涨跌预测页面
- **When**: 查看AI预测结果
- **Then**: 显示预测价格、置信度、技术指标分析
- **Verification**: `human-judgment`
- **Notes**: 验证预测准确性展示

### AC-12: 组合分析功能
- **Given**: 用户进入组合分析页面
- **When**: 查看投资组合
- **Then**: 显示持仓明细、资产配置、收益分析
- **Verification**: `human-judgment`
- **Notes**: 验证组合管理功能

### AC-13: 数据源管理功能
- **Given**: 用户进入数据源页面
- **When**: 切换数据源
- **Then**: 支持多种数据源切换，数据预览正常
- **Verification**: `human-judgment`
- **Notes**: 验证数据源切换功能

### AC-14: 系统设置功能
- **Given**: 用户进入设置页面
- **When**: 配置账户和参数
- **Then**: 设置正确保存，可用于模拟交易
- **Verification**: `programmatic`
- **Notes**: 验证设置保存和读取

## Open Questions
- [ ] 是否需要添加更多AI交易策略？
- [ ] 是否需要支持更多技术指标分析？
- [ ] 是否需要添加实时行情API接入（需解决CORS问题）？
- [ ] 是否需要支持用户自定义图表样式？
