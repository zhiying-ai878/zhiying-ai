// Service Worker for 智盈AI

const CACHE_NAME = 'ai-investment-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// 安装 Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: 缓存静态资源');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// 激活 Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Service Worker: 清除旧缓存');
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// 拦截网络请求
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 如果缓存中存在，直接返回缓存
        if (response) {
          return response;
        }

        // 否则，发起网络请求
        return fetch(event.request)
          .then((networkResponse) => {
            // 如果请求成功，缓存响应
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
            }
            return networkResponse;
          })
          .catch(() => {
            // 网络请求失败时的 fallback
            if (event.request.mode === 'navigate') {
              return caches.match('/');
            }
            return new Response('网络连接失败，请检查网络连接', {
              status: 408,
              headers: {
                'Content-Type': 'text/plain'
              }
            });
          });
      })
  );
});

// 后台同步
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

// 推送通知
self.addEventListener('push', (event) => {
  const data = event.data.json();
  const options = {
    body: data.message,
    icon: 'https://cdn.jsdelivr.net/npm/antd@5.12.8/dist/favicon.ico',
    badge: 'https://cdn.jsdelivr.net/npm/antd@5.12.8/dist/favicon.ico',
    data: {
      url: data.url
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// 通知点击
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        // 如果已有窗口，聚焦到该窗口
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

// 同步数据的函数
async function syncData() {
  try {
    // 这里可以添加数据同步逻辑
    console.log('Service Worker: 同步数据');
  } catch (error) {
    console.error('Service Worker: 同步数据失败', error);
  }
}