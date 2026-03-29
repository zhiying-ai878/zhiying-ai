import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useCallback } from 'react';
const initialState = {
    engineRunning: false,
    engineStatus: 'stopped',
    updateInterval: 60000,
    errors: [],
    tasks: [],
    notifications: [],
    soundEnabled: true,
    desktopNotificationsEnabled: false,
};
const AutoEngineContext = createContext(undefined);
export const AutoEngineProvider = ({ children }) => {
    const [state, setState] = useState(initialState);
    const addTask = useCallback((task) => {
        const newTask = {
            ...task,
            id: Date.now().toString(),
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        setState(prev => ({
            ...prev,
            tasks: [...prev.tasks, newTask],
        }));
    }, []);
    const updateTask = useCallback((id, updates) => {
        setState(prev => ({
            ...prev,
            tasks: prev.tasks.map(task => task.id === id
                ? { ...task, ...updates, updatedAt: new Date() }
                : task),
        }));
    }, []);
    const removeTask = useCallback((id) => {
        setState(prev => ({
            ...prev,
            tasks: prev.tasks.filter(task => task.id !== id),
        }));
    }, []);
    const registerTask = useCallback((task) => {
        const newTask = {
            ...task,
            id: Date.now().toString(),
            status: 'pending',
            progress: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        setState(prev => ({
            ...prev,
            tasks: [...prev.tasks, newTask],
        }));
    }, []);
    const unregisterTask = useCallback((id) => {
        setState(prev => ({
            ...prev,
            tasks: prev.tasks.filter(task => task.id !== id),
        }));
    }, []);
    const runTaskNow = useCallback((id) => {
        setState(prev => ({
            ...prev,
            tasks: prev.tasks.map(task => task.id === id
                ? { ...task, status: 'running', progress: 0, updatedAt: new Date() }
                : task),
            lastUpdate: new Date(),
        }));
    }, []);
    const addNotification = useCallback((notification) => {
        const newNotification = {
            ...notification,
            id: Date.now().toString(),
            read: false,
            timestamp: new Date(),
        };
        setState(prev => ({
            ...prev,
            notifications: [newNotification, ...prev.notifications],
        }));
    }, []);
    const markNotificationAsRead = useCallback((id) => {
        setState(prev => ({
            ...prev,
            notifications: prev.notifications.map(notification => notification.id === id
                ? { ...notification, read: true }
                : notification),
        }));
    }, []);
    const markAllNotificationsAsRead = useCallback(() => {
        setState(prev => ({
            ...prev,
            notifications: prev.notifications.map(notification => ({
                ...notification,
                read: true,
            })),
        }));
    }, []);
    const clearNotifications = useCallback(() => {
        setState(prev => ({
            ...prev,
            notifications: [],
        }));
    }, []);
    const startEngine = useCallback(() => {
        setState(prev => ({
            ...prev,
            engineRunning: true,
            engineStatus: 'starting',
            lastUpdate: new Date(),
        }));
    }, []);
    const stopEngine = useCallback(() => {
        setState(prev => ({
            ...prev,
            engineRunning: false,
            engineStatus: 'stopping',
            lastUpdate: new Date(),
        }));
    }, []);
    const setUpdateInterval = useCallback((interval) => {
        setState(prev => ({
            ...prev,
            updateInterval: interval,
        }));
    }, []);
    const clearErrors = useCallback(() => {
        setState(prev => ({
            ...prev,
            errors: [],
        }));
    }, []);
    const toggleSound = useCallback(() => {
        setState(prev => ({
            ...prev,
            soundEnabled: !prev.soundEnabled,
        }));
    }, []);
    const toggleDesktopNotifications = useCallback(() => {
        setState(prev => ({
            ...prev,
            desktopNotificationsEnabled: !prev.desktopNotificationsEnabled,
        }));
    }, []);
    const contextValue = {
        state,
        addTask,
        updateTask,
        removeTask,
        registerTask,
        unregisterTask,
        runTaskNow,
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotifications,
        startEngine,
        stopEngine,
        setUpdateInterval,
        clearErrors,
        toggleSound,
        toggleDesktopNotifications,
    };
    return (_jsx(AutoEngineContext.Provider, { value: contextValue, children: children }));
};
export const useAutoEngine = () => {
    const context = useContext(AutoEngineContext);
    if (context === undefined) {
        throw new Error('useAutoEngine must be used within an AutoEngineProvider');
    }
    return context;
};
export const useAutoEngineState = () => {
    return useAutoEngine().state;
};
export const useAutoEngineControls = () => {
    const { addTask, updateTask, removeTask, registerTask, unregisterTask, runTaskNow, addNotification, markNotificationAsRead, markAllNotificationsAsRead, clearNotifications, startEngine, stopEngine, setUpdateInterval, clearErrors, toggleSound, toggleDesktopNotifications, } = useAutoEngine();
    return {
        addTask,
        updateTask,
        removeTask,
        registerTask,
        unregisterTask,
        runTaskNow,
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotifications,
        startEngine,
        stopEngine,
        setUpdateInterval,
        clearErrors,
        toggleSound,
        toggleDesktopNotifications,
    };
};
