/**
 * Service Worker 注册工具
 * 提供 PWA 功能和更好的后台运行支持
 */

import { Logger } from './stockData';

const logger = Logger.getInstance();

class ServiceWorkerManager {
    constructor() {
        this.registration = null;
        this.isRegistered = false;
        this.subscription = null;
    }

    /**
     * 注册 Service Worker
     */
    async register() {
        if (!('serviceWorker' in navigator)) {
            logger.warn('浏览器不支持 Service Worker');
            return false;
        }

        try {
            logger.info('正在注册 Service Worker...');
            
            this.registration = await navigator.serviceWorker.register('/service-worker.js');
            
            this.isRegistered = true;
            logger.info('Service Worker 注册成功:', this.registration.scope);

            // 监听 Service Worker 更新
            this.registration.addEventListener('updatefound', () => {
                const newWorker = this.registration.installing;
                logger.info('发现 Service Worker 更新');

                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed') {
                        if (navigator.serviceWorker.controller) {
                            logger.info('有新版本可用，请刷新页面');
                        }
                    }
                });
            });

            // 请求通知权限
            this.requestNotificationPermission();

            // 注册后台同步
            this.registerBackgroundSync();

            // 注册定期同步（如果支持）
            this.registerPeriodicSync();

            return true;
        } catch (error) {
            logger.error('Service Worker 注册失败:', error);
            return false;
        }
    }

    /**
     * 请求通知权限
     */
    async requestNotificationPermission() {
        if (!('Notification' in window)) {
            logger.warn('浏览器不支持通知');
            return;
        }

        try {
            const permission = await Notification.requestPermission();
            logger.info('通知权限:', permission);
        } catch (error) {
            logger.warn('请求通知权限失败:', error);
        }
    }

    /**
     * 显示通知
     */
    showNotification(title, options = {}) {
        if (!('Notification' in window) || Notification.permission !== 'granted') {
            logger.warn('无法显示通知');
            return;
        }

        try {
            const notification = new Notification(title, {
                body: options.body || '',
                icon: '/icon-192x192.png',
                badge: '/badge-72x72.png',
                ...options
            });

            logger.info('显示通知:', title);
            return notification;
        } catch (error) {
            logger.warn('显示通知失败:', error);
        }
    }

    /**
     * 注册后台同步
     */
    async registerBackgroundSync() {
        if (!('SyncManager' in window)) {
            logger.warn('浏览器不支持后台同步');
            return;
        }

        try {
            if (this.registration && this.registration.sync) {
                await this.registration.sync.register('zhiying-ai-sync');
                logger.info('后台同步已注册');
            }
        } catch (error) {
            logger.warn('注册后台同步失败:', error);
        }
    }

    /**
     * 注册定期同步
     */
    async registerPeriodicSync() {
        if (!('periodicSync' in this.registration)) {
            logger.warn('浏览器不支持定期同步');
            return;
        }

        try {
            // 检查权限
            const status = await navigator.permissions.query({
                name: 'periodic-background-sync'
            });

            if (status.state === 'granted') {
                // 每15分钟同步一次
                await this.registration.periodicSync.register('zhiying-ai-heartbeat', {
                    minInterval: 15 * 60 * 1000 // 15分钟
                });
                logger.info('定期同步已注册');
            }
        } catch (error) {
            logger.warn('注册定期同步失败:', error);
        }
    }

    /**
     * 发送消息给 Service Worker
     */
    sendMessage(message) {
        if (!this.registration || !this.registration.active) {
            logger.warn('Service Worker 未激活');
            return;
        }

        this.registration.active.postMessage(message);
    }

    /**
     * 发送保活消息
     */
    sendKeepAlive() {
        this.sendMessage({
            type: 'KEEP_ALIVE',
            timestamp: Date.now()
        });
    }

    /**
     * 注销 Service Worker
     */
    async unregister() {
        if (!this.registration) {
            return;
        }

        try {
            await this.registration.unregister();
            this.isRegistered = false;
            logger.info('Service Worker 已注销');
        } catch (error) {
            logger.error('注销 Service Worker 失败:', error);
        }
    }

    /**
     * 获取 Service Worker 状态
     */
    getStatus() {
        return {
            supported: 'serviceWorker' in navigator,
            registered: this.isRegistered,
            scope: this.registration?.scope,
            notificationPermission: 'Notification' in window ? Notification.permission : 'unsupported'
        };
    }
}

// 创建单例
let swManagerInstance = null;

export function getServiceWorkerManager() {
    if (!swManagerInstance) {
        swManagerInstance = new ServiceWorkerManager();
    }
    return swManagerInstance;
}

export default ServiceWorkerManager;
