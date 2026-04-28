/**
 * 智盈AI Service Worker
 * 提供后台运行支持和离线缓存功能
 */

const CACHE_NAME = 'zhiying-ai-cache-v1';
const APP_SHELL = [
    '/',
    '/index.html'
];

// 安装 Service Worker
self.addEventListener('install', (event) => {
    console.log('[Service Worker] 正在安装...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] 缓存应用壳');
                return cache.addAll(APP_SHELL);
            })
            .then(() => {
                console.log('[Service Worker] 安装完成');
                return self.skipWaiting();
            })
    );
});

// 激活 Service Worker
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] 正在激活...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('[Service Worker] 删除旧缓存:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[Service Worker] 激活完成');
                return self.clients.claim();
            })
    );
});

// 拦截网络请求
self.addEventListener('fetch', (event) => {
    // 只缓存 GET 请求
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // 如果有缓存，直接返回缓存
                if (cachedResponse) {
                    return cachedResponse;
                }

                // 否则从网络获取
                return fetch(event.request)
                    .then((response) => {
                        // 检查是否有效响应
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // 克隆响应以便缓存
                        const responseToCache = response.clone();
                        
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(() => {
                        // 如果网络请求失败，返回默认页面
                        return caches.match('/index.html');
                    });
            })
    );
});

// 处理后台同步
self.addEventListener('sync', (event) => {
    console.log('[Service Worker] 后台同步:', event.tag);
    
    if (event.tag === 'zhiying-ai-sync') {
        event.waitUntil(
            // 这里可以添加数据同步逻辑
            Promise.resolve()
        );
    }
});

// 处理定时同步
self.addEventListener('periodicsync', (event) => {
    console.log('[Service Worker] 定时同步:', event.tag);
    
    if (event.tag === 'zhiying-ai-heartbeat') {
        event.waitUntil(
            // 发送心跳或同步数据
            Promise.resolve()
        );
    }
});

// 处理推送通知
self.addEventListener('push', (event) => {
    console.log('[Service Worker] 收到推送:', event);
    
    const data = event.data?.json() || { title: '智盈AI', body: '有新消息' };
    
    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png'
        })
    );
});

// 处理通知点击
self.addEventListener('notificationclick', (event) => {
    console.log('[Service Worker] 通知被点击');
    
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow('/')
    );
});

// 处理消息
self.addEventListener('message', (event) => {
    console.log('[Service Worker] 收到消息:', event.data);
    
    if (event.data && event.data.type === 'KEEP_ALIVE') {
        // 保持 Service Worker 活跃
        console.log('[Service Worker] 收到保活消息');
    }
});

console.log('[Service Worker] 智盈AI Service Worker 已加载');
