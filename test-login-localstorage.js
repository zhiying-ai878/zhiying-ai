// 测试本地存储和登录功能
console.log('测试本地存储和登录功能...');

// 测试本地存储是否可用
try {
  localStorage.setItem('test', 'test value');
  const testValue = localStorage.getItem('test');
  console.log('本地存储测试:', testValue === 'test value' ? '通过' : '失败');
  localStorage.removeItem('test');
} catch (error) {
  console.log('本地存储测试失败:', error.message);
}

// 测试用户存储
try {
  // 模拟用户数据
  const testUsers = [
    { username: 'admin', password: 'admin123', isAuthorized: true },
    { username: 'test', password: 'test123', isAuthorized: true }
  ];
  
  localStorage.setItem('users', JSON.stringify(testUsers));
  const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
  console.log('用户存储测试:', storedUsers.length > 0 ? '通过' : '失败');
  console.log('存储的用户:', storedUsers);
} catch (error) {
  console.log('用户存储测试失败:', error.message);
}

// 测试当前用户存储
try {
  const currentUser = { username: 'admin', id: '1' };
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  const storedCurrentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
  console.log('当前用户存储测试:', storedCurrentUser ? '通过' : '失败');
  console.log('存储的当前用户:', storedCurrentUser);
} catch (error) {
  console.log('当前用户存储测试失败:', error.message);
}

console.log('测试完成！');
