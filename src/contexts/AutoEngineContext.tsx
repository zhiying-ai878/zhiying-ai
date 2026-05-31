import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface Task {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  timestamp: Date;
  link?: string;
}

export interface AutoEngineState {
  engineRunning: boolean;
  engineStatus: 'stopped' | 'starting' | 'running' | 'stopping' | 'error';
  updateInterval: number;
  lastUpdate?: Date;
  errors: string[];
  tasks: Task[];
  notifications: Notification[];
  soundEnabled: boolean;
  desktopNotificationsEnabled: boolean;
}

export interface AutoEngineContextType {
  state: AutoEngineState;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  removeTask: (id: string) => void;
  registerTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'progress'>) => void;
  unregisterTask: (id: string) => void;
  runTaskNow: (id: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'timestamp'>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;
  startEngine: () => void;
  stopEngine: () => void;
  setUpdateInterval: (interval: number) => void;
  clearErrors: () => void;
  toggleSound: () => void;
  toggleDesktopNotifications: () => void;
}

const initialState: AutoEngineState = {
  engineRunning: false,
  engineStatus: 'stopped',
  updateInterval: 60000,
  errors: [],
  tasks: [],
  notifications: [],
  soundEnabled: true,
  desktopNotificationsEnabled: false,
};

const AutoEngineContext = createContext<AutoEngineContextType | undefined>(undefined);

interface AutoEngineProviderProps {
  children: ReactNode;
}

export const AutoEngineProvider: React.FC<AutoEngineProviderProps> = ({ children }) => {
  const [state, setState] = useState<AutoEngineState>(initialState);

  const addTask = useCallback((task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
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

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(task =>
        task.id === id
          ? { ...task, ...updates, updatedAt: new Date() }
          : task
      ),
    }));
  }, []);

  const removeTask = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.filter(task => task.id !== id),
    }));
  }, []);

  const registerTask = useCallback((task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'progress'>) => {
    const newTask: Task = {
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

  const unregisterTask = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.filter(task => task.id !== id),
    }));
  }, []);

  const runTaskNow = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(task =>
        task.id === id
          ? { ...task, status: 'running', progress: 0, updatedAt: new Date() }
          : task
      ),
      lastUpdate: new Date(),
    }));
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'read' | 'timestamp'>) => {
    const newNotification: Notification = {
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

  const markNotificationAsRead = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      ),
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

  const setUpdateInterval = useCallback((interval: number) => {
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

  const contextValue: AutoEngineContextType = {
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

  return (
    <AutoEngineContext.Provider value={contextValue}>
      {children}
    </AutoEngineContext.Provider>
  );
};

export const useAutoEngine = (): AutoEngineContextType => {
  const context = useContext(AutoEngineContext);
  if (context === undefined) {
    throw new Error('useAutoEngine must be used within an AutoEngineProvider');
  }
  return context;
};

export const useAutoEngineState = (): AutoEngineState => {
  return useAutoEngine().state;
};

export const useAutoEngineControls = () => {
  const {
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
  } = useAutoEngine();

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
