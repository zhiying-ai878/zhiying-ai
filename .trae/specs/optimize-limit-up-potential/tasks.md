# 智盈AI - 涨停潜力优化和移动端卡片设计 - 实现计划

## [ ] Task 1: 优化涨停潜力判断逻辑
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 修改`optimizedSignalManager.ts`文件中的`generateSignal`函数
  - 调整涨停潜力评分的计算逻辑，确保主力资金为负值时也能获得相应评分
  - 确保涨停潜力达到60%以上的股票被标记为`isLimitUpPotential: true`
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `programmatic` TR-1.1: 涨停潜力达到60%以上的股票被正确标记为涨停潜力股票
  - `programmatic` TR-1.2: 主力资金为负值但涨停潜力达到60%以上的股票也被标记为涨停潜力股票
- **Notes**: 需要修改主力资金强度的计算逻辑，使用绝对值进行评分

## [ ] Task 2: 优化移动端页面卡片设计
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 修改`Signal.css`文件，添加移动端响应式样式
  - 优化卡片间距、字体大小、按钮大小等
  - 确保移动端页面显示紧凑美观
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `human-judgment` TR-2.1: 移动端页面卡片显示紧凑，布局合理
  - `human-judgment` TR-2.2: 移动端页面操作流畅，易于使用
- **Notes**: 需要使用媒体查询（@media）针对不同屏幕尺寸进行优化

## [ ] Task 3: 构建和部署系统
- **Priority**: P1
- **Depends On**: Task 1, Task 2
- **Description**: 
  - 重新构建项目
  - 部署到GitHub Pages和Netlify
  - 确保系统正常运行
- **Acceptance Criteria Addressed**: AC-1, AC-2
- **Test Requirements**:
  - `programmatic` TR-3.1: 系统构建成功，无错误
  - `programmatic` TR-3.2: 系统部署成功，可正常访问
- **Notes**: 构建和部署过程需要确保所有修改都被正确应用

## [ ] Task 4: 测试和验证
- **Priority**: P1
- **Depends On**: Task 3
- **Description**: 
  - 测试系统是否能够正确识别涨停潜力股票
  - 测试移动端页面卡片设计是否紧凑美观
  - 验证所有功能是否正常运行
- **Acceptance Criteria Addressed**: AC-1, AC-2
- **Test Requirements**:
  - `programmatic` TR-4.1: 系统能够正确识别涨停潜力达到60%以上的股票
  - `human-judgment` TR-4.2: 移动端页面卡片设计紧凑美观，易于操作
- **Notes**: 需要在不同设备上测试移动端页面的显示效果