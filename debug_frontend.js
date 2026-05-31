const axios = require('axios');
const cheerio = require('cheerio');

async function debugFrontend() {
  console.log('=== 前端页面调试 ===');
  
  try {
    // 访问前端页面
    const response = await axios.get('http://localhost:4105/zhiying-ai/', {
      timeout: 5000
    });
    
    console.log('前端页面访问成功');
    console.log('状态码:', response.status);
    
    // 解析HTML内容
    const $ = cheerio.load(response.data);
    
    // 检查页面标题
    const title = $('title').text();
    console.log('页面标题:', title);
    
    // 检查是否有登录表单
    const loginForm = $('form').length;
    console.log('登录表单数量:', loginForm);
    
    // 检查是否有错误信息
    const errorMessages = $('.error-message, .ant-alert-error').text();
    if (errorMessages) {
      console.log('错误信息:', errorMessages);
    }
    
    // 检查Dashboard组件是否渲染
    const dashboard = $('.dashboard-container').length;
    console.log('Dashboard组件渲染数量:', dashboard);
    
    // 检查数据表格
    const dataTable = $('.stock-table').length;
    console.log('数据表格数量:', dataTable);
    
    // 检查骨架屏（加载状态）
    const skeleton = $('.ant-skeleton').length;
    console.log('骨架屏组件数量:', skeleton);
    
    // 检查是否显示"请登录"等提示
    const loginPrompt = $('body').text().includes('登录') || $('body').text().includes('请登录');
    console.log('是否显示登录提示:', loginPrompt);
    
    console.log('=== 调试完成 ===');
    
  } catch (error) {
    console.error('前端页面访问失败:', error.message);
    console.error('错误详情:', error);
  }
}

debugFrontend();
