# 智盈AI - 问题修复与优化 实施计划

## [ ] Task 1: 验证和确保预览正常显示
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 验证App.tsx中默认登录状态设置为true
  - 验证Dashboard.tsx能正常显示内容
  - 确保路由配置正确指向Dashboard
- **Acceptance Criteria Addressed**: AC-1, AC-5
- **Test Requirements**:
  - `human-judgment` TR-1.1: 验证预览页面显示Dashboard内容而非空白
  - `human-judgment` TR-1.2: 验证标题"智盈AI - 智能投资决策平台"正常显示
  - `human-judgment` TR-1.3: 验证市场概览数据正常显示
- **Notes**: 核心功能必须首先确保正常

## [ ] Task 2: 验证和优化响应式设计
- **Priority**: P0
- **Depends On**: Task 1
- **Description**:
  - 验证Layout.tsx中的移动端检测逻辑（<768px）
  - 验证抽屉菜单在移动端正常工作
  - 验证Content区域margin在移动端为左右10px，桌面端左边为150px
  - 确保Header的left位置正确
- **Acceptance Criteria Addressed**: AC-2, AC-5
- **Test Requirements**:
  - `human-judgment` TR-2.1: 验证移动端汉堡菜单按钮显示
  - `human-judgment` TR-2.2: 验证点击汉堡菜单打开抽屉
  - `human-judgment` TR-2.3: 验证移动端内容不被侧边框遮挡
  - `human-judgment` TR-2.4: 验证桌面端侧边栏正常显示，内容紧靠侧边栏
- **Notes**: 使用浏览器开发者工具的移动设备模拟器测试

## [ ] Task 3: 修复OptimizedSignalDisplay.tsx语法错误
- **Priority**: P0
- **Depends On**: None
- **Description**:
  - 修复OptimizedSignalDisplay.tsx中的语法错误
  - 重点修复第257行、第419行、第494行、第572行、第734行、第1062行的语法问题
  - 确保所有括号、引号、函数调用正确
- **Acceptance Criteria Addressed**: AC-3, AC-4
- **Test Requirements**:
  - `programmatic` TR-3.1: 验证文件语法检查通过
  - `programmatic` TR-3.2: 验证TypeScript类型检查无错误
- **Notes**: 这是导致245个错误的主要文件之一

## [ ] Task 4: 检查并修复其他有问题的组件文件
- **Priority**: P0
- **Depends On**: Task 3
- **Description**:
  - 检查src/components/目录下的其他组件文件
  - 检查src/pages/目录下的页面文件
  - 检查src/utils/目录下的工具文件
  - 逐个修复发现的语法错误和类型错误
- **Acceptance Criteria Addressed**: AC-3, AC-4
- **Test Requirements**:
  - `programmatic` TR-4.1: 运行npx tsc --noEmit检查所有TypeScript错误
  - `programmatic` TR-4.2: 确保错误数量逐步减少到0
- **Notes**: 可能需要逐个文件检查和修复

## [ ] Task 5: 全面验证和测试
- **Priority**: P1
- **Depends On**: Task 1, Task 2, Task 3, Task 4
- **Description**:
  - 运行完整的TypeScript类型检查
  - 启动开发服务器验证应用正常运行
  - 在桌面端和移动端分别测试
  - 验证所有核心功能正常
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-3, AC-4, AC-5
- **Test Requirements**:
  - `programmatic` TR-5.1: npx tsc --noEmit返回0个错误
  - `human-judgment` TR-5.2: 开发服务器正常启动，无运行时错误
  - `human-judgment` TR-5.3: 桌面端和移动端都能正常浏览
  - `human-judgment` TR-5.4: 所有核心功能正常工作
- **Notes**: 这是最终验证步骤
