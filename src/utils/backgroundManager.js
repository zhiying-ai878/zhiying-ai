/**
 * 后台运行管理器
 * 确保智盈AI在窗口最小化后所有功能正常运行
 */

import { Logger } from './stockData';

const logger = Logger.getInstance();

class BackgroundManager {
    constructor() {
        this.isInitialized = false;
        this.backgroundTasks = new Map();
        this.heartbeatTimer = null;
        this.lastHeartbeat = Date.now();
        this.visibilityState = 'visible';
        this.performanceMetrics = [];
    }

    /**
     * 初始化后台运行管理器
     */
    init() {
        if (this.isInitialized) {
            logger.warn('后台运行管理器已初始化');
            return;
        }

        logger.info('正在初始化后台运行管理器...');
        
        this.setupVisibilityChangeListener();
        this.setupPerformanceMonitor();
        this.startHeartbeat();
        
        this.isInitialized = true;
        logger.info('后台运行管理器初始化完成');
    }

    /**
     * 设置可见性变化监听器
     */
    setupVisibilityChangeListener() {
        if (typeof document !== 'undefined' && document.addEventListener) {
            document.addEventListener('visibilitychange', () => {
                this.handleVisibilityChange();
            });
            
            // 也监听窗口焦点变化
            window.addEventListener('blur', () => {
                logger.info('窗口失去焦点');
            });
            
            window.addEventListener('focus', () => {
                logger.info('窗口获得焦点');
            });
        }
    }

    /**
     * 处理可见性变化
     */
    handleVisibilityChange() {
        if (typeof document === 'undefined') return;

        const newState = document.hidden ? 'hidden' : 'visible';
        
        if (newState !== this.visibilityState) {
            logger.info(`页面可见性状态变化: ${this.visibilityState} -> ${newState}`);
            
            if (newState === 'hidden') {
                this.onEnterBackground();
            } else {
                this.onLeaveBackground();
            }
            
            this.visibilityState = newState;
        }
    }

    /**
     * 进入后台时执行
     */
    onEnterBackground() {
        logger.info('进入后台运行模式');
        this.logPerformance('enter_background');
        
        // 确保所有关键任务继续运行
        this.ensureTasksContinue();
    }

    /**
     * 离开后台时执行
     */
    onLeaveBackground() {
        logger.info('离开后台运行模式');
        this.logPerformance('leave_background');
    }

    /**
     * 确保后台任务继续运行
     */
    ensureTasksContinue() {
        logger.info('确保后台任务检查...');
        
        // 使用 Web Audio API 保持活跃（可选）
        this.keepAliveWithAudio();
        
        // 使用 BroadcastChannel 通信
        this.setupBroadcastChannel();
    }

    /**
     * 使用 Web Audio API 保持页面活跃
     */
    keepAliveWithAudio() {
        try {
            // 创建一个静音的音频上下文来保持活跃
            if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
                const AudioContextClass = AudioContext || webkitAudioContext;
                const audioContext = new AudioContextClass();
                
                // 创建一个静音的振荡器
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                gainNode.gain.value = 0; // 静音
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                // 短时间播放然后停止，避免持续消耗资源
                oscillator.start();
                setTimeout(() => {
                    oscillator.stop();
                }, 100);
                
                logger.info('Web Audio 保活机制已启动');
            }
        } catch (error) {
            logger.warn('Web Audio 保活机制启动失败:', error);
        }
    }

    /**
     * 设置 BroadcastChannel
     */
    setupBroadcastChannel() {
        try {
            if (typeof BroadcastChannel !== 'undefined') {
                const channel = new BroadcastChannel('zhiying_ai_keepalive');
                
                channel.onmessage = (event) => {
                    logger.debug('收到保活消息:', event.data);
                };
                
                // 定期发送保活消息
                setInterval(() => {
                    channel.postMessage({
                    type: 'keepalive',
                    timestamp: Date.now()
                });
            }, 30000); // 每30秒发送一次
            }
        } catch (error) {
            logger.warn('BroadcastChannel 设置失败:', error);
        }
    }

    /**
     * 设置性能监控
     */
    setupPerformanceMonitor() {
        // 监控页面性能
        setInterval(() => {
            this.monitorPerformance();
        }, 60000); // 每分钟监控一次
    }

    /**
     * 监控性能
     */
    monitorPerformance() {
        try {
            const now = Date.now();
            const metrics = {
                timestamp: now,
                isBackground: this.visibilityState === 'hidden',
                memory: this.getMemoryUsage(),
                cpu: this.getCPUUsage(),
                tasks: Array.from(this.backgroundTasks.keys())
            };

            this.performanceMetrics.push(metrics);

            // 只保留最近100条记录
            if (this.performanceMetrics.length > 100) {
                this.performanceMetrics.shift();
            }

            logger.debug('性能监控:', metrics);
        } catch (error) {
            logger.warn('性能监控失败:', error);
        }
    }

    /**
     * 获取内存使用情况
     */
    getMemoryUsage() {
        try {
            if (performance && performance.memory) {
                return {
                    used: performance.memory.usedJSHeapSize,
                    total: performance.memory.totalJSHeapSize,
                    limit: performance.memory.jsHeapSizeLimit
                };
            }
        } catch (error) {
            // 忽略错误
        }
        return null;
    }

    /**
     * 获取 CPU 使用情况（估算）
     */
    getCPUUsage() {
        // 简单的 CPU 使用估算
        try {
            if (performance && performance.now) {
                return {
                    estimated: 'available'
                };
            }
        } catch (error) {
            // 忽略错误
        }
        return null;
    }

    /**
     * 记录性能事件
     */
    logPerformance(eventType, data = {}) {
        const entry = {
            type: eventType,
            timestamp: Date.now(),
            visibilityState: this.visibilityState,
            ...data
        };

        logger.info(`[性能] ${eventType}`, entry);
    }

    /**
     * 启动心跳定时器
     */
    startHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
        }

        // 使用更可靠的心跳机制
        this.heartbeatTimer = setInterval(() => {
            this.sendHeartbeat();
        }, 10000); // 每10秒心跳一次

        logger.info('心跳机制已启动');
    }

    /**
     * 发送心跳
     */
    sendHeartbeat() {
        this.lastHeartbeat = Date.now();
        
        // 记录心跳
        this.logPerformance('heartbeat', {
            isBackground: this.visibilityState === 'hidden'
        });
    }

    /**
     * 注册后台任务
     */
    registerTask(taskId, taskFn, interval = 5000) {
        if (this.backgroundTasks.has(taskId)) {
            logger.warn(`任务 ${taskId} 已存在`);
            return;
        }

        const task = {
            id: taskId,
            fn: taskFn,
            interval: interval,
            timer: null,
            lastRun: 0,
            runCount: 0
        };

        // 使用递归 setTimeout 代替 setInterval，更可靠
        const runTask = async () => {
            try {
                task.lastRun = Date.now();
                task.runCount++;
                await task.fn();
            } catch (error) {
                logger.error(`任务 ${taskId} 执行失败:`, error);
            }

            // 继续下一次执行
            if (this.backgroundTasks.has(taskId)) {
                task.timer = setTimeout(runTask, task.interval);
            }
        };

        // 立即执行一次
        task.timer = setTimeout(runTask, 0);
        
        this.backgroundTasks.set(taskId, task);
        logger.info(`后台任务 ${taskId} 已注册，间隔 ${interval}ms`);
    }

    /**
     * 取消注册后台任务
     */
    unregisterTask(taskId) {
        const task = this.backgroundTasks.get(taskId);
        if (task) {
            if (task.timer) {
                clearTimeout(task.timer);
            }
            this.backgroundTasks.delete(taskId);
            logger.info(`后台任务 ${taskId} 已取消注册`);
        }
    }

    /**
     * 获取所有后台任务状态
     */
    getTaskStatus() {
        const status = [];
        this.backgroundTasks.forEach((task, taskId) => {
            status.push({
                id: taskId,
                lastRun: task.lastRun,
                runCount: task.runCount,
                interval: task.interval
            });
        });
        return status;
    }

    /**
     * 获取后台运行管理器状态
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            visibilityState: this.visibilityState,
            isBackground: this.visibilityState === 'hidden',
            lastHeartbeat: this.lastHeartbeat,
            taskCount: this.backgroundTasks.size,
            tasks: this.getTaskStatus(),
            performanceMetrics: this.performanceMetrics.slice(-10) // 最近10条性能数据
        };
    }

    /**
     * 清理资源
     */
    destroy() {
        logger.info('正在清理后台运行管理器...');

        // 清理所有任务定时器
        this.backgroundTasks.forEach((task) => {
            if (task.timer) {
                clearTimeout(task.timer);
            }
        });
        this.backgroundTasks.clear();

        // 清理心跳定时器
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }

        this.isInitialized = false;
        logger.info('后台运行管理器已清理');
    }
}

// 创建单例实例
let backgroundManagerInstance = null;

export function getBackgroundManager() {
    if (!backgroundManagerInstance) {
        backgroundManagerInstance = new BackgroundManager();
    }
    return backgroundManagerInstance;
}

export default BackgroundManager;
