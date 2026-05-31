import React, { useState, useEffect } from 'react';
import { getBackgroundManager } from '../utils/backgroundManager';

/**
 * 后台运行状态组件
 * 显示智盈AI在后台运行的状态
 */
const BackgroundStatus = () => {
    const [status, setStatus] = useState(null);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const backgroundManager = getBackgroundManager();
        
        // 定期更新状态
        const updateStatus = () => {
            const currentStatus = backgroundManager.getStatus();
            setStatus(currentStatus);
        };

        updateStatus();
        const interval = setInterval(updateStatus, 5000);

        return () => clearInterval(interval);
    }, []);

    if (!isVisible) {
        return (
            <div 
                className="fixed bottom-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full cursor-pointer text-sm z-50"
                onClick={() => setIsVisible(true)}
            >
                后台运行中...
            </div>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-xl p-4 max-w-sm z-50 border border-gray-200">
            <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-gray-800">后台运行状态</h3>
                <button 
                    onClick={() => setIsVisible(false)}
                    className="text-gray-400 hover:text-gray-600"
                >
                    ✕
                </button>
            </div>

            {status && (
                <div className="space-y-2 text-sm">
                    {/* 运行状态 */}
                    <div className="flex items-center">
                        <span className={`w-2 h-2 rounded-full mr-2 ${status.isBackground ? 'bg-yellow-400' : 'bg-green-400'}`}></span>
                        <span className="text-gray-600">
                            {status.isBackground ? '后台运行中' : '前台运行中'}
                        </span>
                    </div>

                    {/* 任务数量 */}
                    <div className="flex justify-between">
                        <span className="text-gray-500">活跃任务:</span>
                        <span className="text-gray-700 font-medium">{status.taskCount}</span>
                    </div>

                    {/* 上次心跳 */}
                    <div className="flex justify-between">
                        <span className="text-gray-500">上次心跳:</span>
                        <span className="text-gray-700">
                            {status.lastHeartbeat ? new Date(status.lastHeartbeat).toLocaleTimeString() : '-'}
                        </span>
                    </div>

                    {/* 任务列表 */}
                    {status.tasks && status.tasks.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-gray-500 mb-2 text-xs">运行中的任务:</p>
                            <div className="space-y-1">
                                {status.tasks.map(task => (
                                    <div key={task.id} className="flex justify-between text-xs">
                                        <span className="text-gray-600">{task.id}</span>
                                        <span className="text-gray-500">
                                            {task.runCount} 次运行
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 状态指示 */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center text-xs">
                            <div className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse"></div>
                            <span className="text-green-600">系统运行正常</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BackgroundStatus;
