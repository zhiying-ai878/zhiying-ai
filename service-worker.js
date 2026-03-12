// Service Worker for 智盈AI PWA

// 缓存名称
const CACHE_NAME = 'zhiying-ai-cache-v1';

// 需要缓存的资源
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png'
];

// 安装事件 - 缓存静态资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('打开缓存');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('删除旧缓存:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 拦截请求 - 优先从缓存获取资源
self.addEventListener('fetch', (event) => {
  // 跳过非GET请求
  if (event.request.method !== 'GET') return;
  
  // 跳过Chrome扩展和DevTools的请求
  if (event.request.url.includes('chrome-extension://') || event.request.url.includes('devtools://')) return;
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 如果缓存中有资源，直接返回
        if (response) {
          return response;
        }
        
        // 否则从网络获取
        return fetch(event.request)
          .then((networkResponse) => {
            // 仅缓存成功的响应
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
              // 克隆响应，因为响应流只能使用一次
              const responseToCache = networkResponse.clone();
              
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
            }
            
            return networkResponse;
          })
          .catch(() => {
            // 网络请求失败时的回退方案
            if (event.request.mode === 'navigate') {
              return caches.match('/');
            }
          });
      })
  );
});

// 后台同步事件 - 用于离线数据同步
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-trades') {
    event.waitUntil(syncTrades());
  }
});

// 推送通知事件
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: {
      url: data.url || '/'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || '智盈AI', options)
  );
});

// 通知点击事件
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        // 如果已经有打开的窗口，聚焦到该窗口
        for (const client of clientList) {
          if (client.url === event.notification.data.url && 'focus' in client) {
            return client.focus();
          }
        }
        // 否则打开新窗口
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data.url);
        }
      })
  );
});

// 同步交易数据的函数
async function syncTrades() {
  try {
    // 从IndexedDB获取待同步的交易数据
    // 这里需要根据实际的IndexedDB结构实现
    console.log('同步交易数据...');
  } catch (error) {
    console.error('同步交易数据失败:', error);
  }
}

// 后台消息处理
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
