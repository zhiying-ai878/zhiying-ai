
// 详细测试前端页面
import axios from 'axios';

async function testFrontendDetailed() {
  console.log('=== 详细测试前端页面 ===');
  
  try {
    console.log('测试开发服务器状态...');
    const serverResponse = await axios.get('http://localhost:4105/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 5000
    });
    console.log('开发服务器响应成功:', serverResponse.status);
    
    console.log('\n测试前端页面...');
    const frontendResponse = await axios.get('http://localhost:4105/zhiying-ai/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });
    console.log('前端页面响应成功:', frontendResponse.status);
    console.log('页面内容长度:', frontendResponse.data.length);
    
    // 检查页面是否包含关键元素
    const hasLoginForm = frontendResponse.data.includes('登录');
    const hasDashboard = frontendResponse.data.includes('Dashboard');
    const hasSkeleton = frontendResponse.data.includes('Skeleton');
    
    console.log('页面包含登录表单:', hasLoginForm);
    console.log('页面包含Dashboard:', hasDashboard);
    console.log('页面包含骨架屏:', hasSkeleton);
    
    if (hasLoginForm) {
      console.log('\n问题诊断：用户需要登录才能访问数据');
    } else if (hasSkeleton) {
      console.log('\n问题诊断：页面正在加载中，显示骨架屏');
    } else if (hasDashboard) {
      console.log('\n问题诊断：页面已加载，但数据可能未显示');
    }
    
  } catch (error) {
    console.error('前端页面访问失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    } else if (error.request) {
      console.error('请求发送成功但未收到响应:', error.request);
    }
  }
  
  console.log('\n=== 测试完成 ===');
}

testFrontendDetailed();

