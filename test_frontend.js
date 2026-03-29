
// 测试前端页面访问
import axios from 'axios';

async function testFrontend() {
  console.log('=== 测试前端页面访问 ===');
  
  try {
    const response = await axios.get('http://localhost:4105/zhiying-ai/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });
    console.log('前端页面访问成功:', response.status);
    console.log('页面内容长度:', response.data.length);
    console.log('页面内容预览:', response.data.substring(0, 300) + '...');
  } catch (error) {
    console.error('前端页面访问失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
  }
  
  console.log('\n=== 测试完成 ===');
}

testFrontend();

