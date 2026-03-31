# 智盈AI - 删除历史提示信号信息功能 - 实现计划

## [x] Task 1: 查看当前Signal.tsx文件结构
- **Priority**: P0
- **Depends On**: None
- **Description**:
  - 查看现有的Signal.tsx文件，了解其结构和组件布局
  - 确认需要添加清空历史按钮的位置
- **Acceptance Criteria Addressed**: AC-1, AC-2
- **Test Requirements**:
  - `human-judgement` TR-1.1: 确认Signal.tsx文件的结构和布局
  - `human-judgement` TR-1.2: 确认需要添加按钮的具体位置
- **Notes**: 了解现有代码结构是实现功能的基础

## [x] Task 2: 添加清空历史按钮到实时信号页面
- **Priority**: P0
- **Depends On**: Task 1
- **Description**:
  - 在实时信号页面的底部卡片中添加"清空历史"按钮
  - 按钮使用红色，带有删除图标
  - 按钮位于"刷新信号"按钮下方
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `human-judgement` TR-2.1: 确认按钮在实时信号页面正确显示
  - `human-judgement` TR-2.2: 确认按钮样式符合系统风格
- **Notes**: 按钮位置应与现有"刷新信号"按钮保持一致的布局

## [x] Task 3: 添加清空历史按钮到信号历史页面
- **Priority**: P0
- **Depends On**: Task 1
- **Description**:
  - 在信号历史页面的顶部添加"清空历史"按钮
  - 按钮使用红色，带有删除图标
  - 按钮位于信号列表上方，右侧对齐
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `human-judgement` TR-3.1: 确认按钮在信号历史页面正确显示
  - `human-judgement` TR-3.2: 确认按钮样式符合系统风格
- **Notes**: 按钮位置应与信号列表保持良好的视觉层次

## [x] Task 4: 实现确认模态框功能
- **Priority**: P0
- **Depends On**: Task 2, Task 3
- **Description**:
  - 添加确认模态框组件
  - 模态框标题为"确认清空历史"
  - 模态框内容为"确定要清空所有历史信号吗？此操作不可恢复。"
  - 模态框包含"确认"和"取消"按钮
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `human-judgement` TR-4.1: 确认点击按钮后弹出模态框
  - `human-judgement` TR-4.2: 确认模态框内容正确
- **Notes**: 使用Ant Design的Modal组件实现

## [x] Task 5: 实现清空历史信号的逻辑
- **Priority**: P0
- **Depends On**: Task 4
- **Description**:
  - 添加 `handleClearHistory` 方法处理按钮点击事件
  - 添加 `confirmClearHistory` 方法处理确认操作
  - 在 `confirmClearHistory` 方法中调用 `signalManager.clearSignalHistory()`
  - 清空后调用 `loadSignals()` 方法更新界面
  - 显示成功提示信息
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `programmatic` TR-5.1: 确认调用 `clearSignalHistory()` 方法
  - `programmatic` TR-5.2: 确认清空后调用 `loadSignals()` 方法
- **Notes**: 确保清空操作的逻辑正确无误

## [x] Task 6: 测试清空功能
- **Priority**: P1
- **Depends On**: Task 5
- **Description**:
  - 测试实时信号页面的清空功能
  - 测试信号历史页面的清空功能
  - 验证清空后界面是否正确更新
  - 验证成功提示是否显示
- **Acceptance Criteria Addressed**: AC-5
- **Test Requirements**:
  - `human-judgement` TR-6.1: 确认清空后界面显示"暂无历史信号"
  - `human-judgement` TR-6.2: 确认成功提示正确显示
- **Notes**: 测试时确保有足够的历史信号数据

## [x] Task 7: 构建和部署
- **Priority**: P1
- **Depends On**: Task 6
- **Description**:
  - 运行 `npm run build` 构建项目
  - 运行 `npm run preview` 启动预览服务器
  - 验证功能在预览环境中正常工作
- **Acceptance Criteria Addressed**: All
- **Test Requirements**:
  - `human-judgement` TR-7.1: 确认构建过程无错误
  - `human-judgement` TR-7.2: 确认预览环境中功能正常
- **Notes**: 确保构建和部署过程顺利完成