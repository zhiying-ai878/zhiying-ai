# 智盈AI - AI股票交易软件 - 产品需求文档

## Overview
- **Summary**: 基于AI的股票交易软件，实现实时监控主力动向、自动量化交易、价格预测等功能
- **Purpose**: 为投资者提供智能化的股票分析和交易辅助工具，帮助用户做出更明智的投资决策
- **Target Users**: 个人投资者、股票交易爱好者、量化交易从业者

## Goals
- 完善真实数据源集成，确保数据实时性和准确性
- 集成真实AI模型，实现准确的价格预测
- 接入大语言模型，提供智能投资建议
- 修复安全问题，改进敏感信息存储机制
- 实现策略执行引擎，支持策略自动执行

## Non-Goals (Out of Scope)
- 实盘交易功能（合规限制）
- 移动端原生App开发
- 社交交易/社区功能
- 期货/外汇等其他市场支持

## Background & Context
- 项目已完成基础架构搭建，包含9个核心功能模块
- 总体功能完整性评分89.6%，处于优秀水平
- 所有语法错误已修复，项目可正常编译运行
- 当前主要问题：数据真实性、安全性、真实AI模型集成

## Functional Requirements
- **FR-1**: 实现多数据源（新浪财经、腾讯财经、东方财富）的稳定集成
- **FR-2**: 集成机器学习预测模型（LSTM/Prophet）实现价格预测
- **FR-3**: 接入大语言模型（GPT/Claude）实现智能助手功能
- **FR-4**: 实现策略自动执行引擎
- **FR-5**: 改进安全机制，使用AES-256加密存储敏感信息
- **FR-6**: 实现用户登录认证和权限控制

## Non-Functional Requirements
- **NFR-1**: 数据更新频率不低于每分钟一次
- **NFR-2**: 页面响应时间不超过2秒
- **NFR-3**: 支持HTTPS协议加密传输
- **NFR-4**: 系统可用性达到99.9%
- **NFR-5**: 支持多语言（中文/英文）

## Constraints
- **Technical**: React + TypeScript技术栈，Node.js后端，MongoDB数据存储
- **Business**: 不提供实盘交易功能，仅作为投资参考工具
- **Dependencies**: 第三方股票行情API（新浪、腾讯、东方财富）

## Assumptions
- 用户具备基本的股票投资知识
- 用户网络环境稳定，能够访问互联网
- 第三方API服务正常可用

## Acceptance Criteria

### AC-1: 真实数据源集成
- **Given**: 系统已配置数据源API
- **When**: 用户访问Dashboard页面
- **Then**: 显示真实的实时股票行情数据
- **Verification**: `programmatic`

### AC-2: AI价格预测
- **Given**: 用户选择某只股票
- **When**: 用户查看预测页面
- **Then**: 显示基于真实AI模型的价格预测结果及置信度
- **Verification**: `programmatic`

### AC-3: AI助手对话
- **Given**: 用户打开AI助手
- **When**: 用户提问投资相关问题
- **Then**: 显示基于大语言模型的智能回答
- **Verification**: `human-judgment`

### AC-4: 策略自动执行
- **Given**: 用户创建并启用交易策略
- **When**: 满足策略触发条件
- **Then**: 系统自动生成交易信号并通知用户
- **Verification**: `programmatic`

### AC-5: 安全加密存储
- **Given**: 用户设置交易账户密码
- **When**: 系统存储密码
- **Then**: 使用AES-256加密算法存储，非明文或base64编码
- **Verification**: `programmatic`

### AC-6: 用户认证
- **Given**: 用户访问系统
- **When**: 用户输入正确的用户名和密码
- **Then**: 成功登录系统并获得相应权限
- **Verification**: `programmatic`

## Open Questions
- [ ] 需要接入哪个大语言模型？(OpenAI GPT / Claude / 国内大模型)
- [ ] 数据源API是否需要付费？预算多少？
- [ ] 是否需要支持多券商账户？
