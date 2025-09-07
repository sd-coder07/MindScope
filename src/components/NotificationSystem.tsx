'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  AlertCircle, 
  Info, 
  X, 
  XCircle,
  Bell,
  Sparkles,
  Heart,
  Zap,
  Trophy,
  Target,
  Brain
} from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'achievement' | 'mood' | 'reminder';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
    style?: 'primary' | 'secondary';
  }>;
  icon?: React.ComponentType<any>;
  timestamp?: Date;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => string;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
  maxNotifications?: number;
  defaultDuration?: number;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  maxNotifications = 5,
  defaultDuration = 5000
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const addNotification = useCallback((
    notification: Omit<Notification, 'id' | 'timestamp'>
  ): string => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: new Date(),
      duration: notification.duration ?? defaultDuration
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      return updated.slice(0, maxNotifications);
    });

    // Auto remove non-persistent notifications
    if (!notification.persistent && newNotification.duration) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, newNotification.duration);
    }

    return id;
  }, [defaultDuration, maxNotifications]);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      clearAll
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

interface NotificationItemProps {
  notification: Notification;
  onRemove: (id: string) => void;
  isDarkMode?: boolean;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onRemove,
  isDarkMode = false
}) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!notification.persistent && notification.duration) {
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev - (100 / (notification.duration! / 100));
          return Math.max(0, newProgress);
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [notification.duration, notification.persistent]);

  const getTypeConfig = () => {
    const configs = {
      success: {
        icon: CheckCircle,
        colors: 'from-green-500 to-emerald-500',
        bgColor: isDarkMode ? 'bg-green-900/20 border-green-700/50' : 'bg-green-50 border-green-200',
        textColor: isDarkMode ? 'text-green-300' : 'text-green-800'
      },
      error: {
        icon: XCircle,
        colors: 'from-red-500 to-rose-500',
        bgColor: isDarkMode ? 'bg-red-900/20 border-red-700/50' : 'bg-red-50 border-red-200',
        textColor: isDarkMode ? 'text-red-300' : 'text-red-800'
      },
      warning: {
        icon: AlertCircle,
        colors: 'from-yellow-500 to-amber-500',
        bgColor: isDarkMode ? 'bg-yellow-900/20 border-yellow-700/50' : 'bg-yellow-50 border-yellow-200',
        textColor: isDarkMode ? 'text-yellow-300' : 'text-yellow-800'
      },
      info: {
        icon: Info,
        colors: 'from-blue-500 to-cyan-500',
        bgColor: isDarkMode ? 'bg-blue-900/20 border-blue-700/50' : 'bg-blue-50 border-blue-200',
        textColor: isDarkMode ? 'text-blue-300' : 'text-blue-800'
      },
      achievement: {
        icon: Trophy,
        colors: 'from-purple-500 to-pink-500',
        bgColor: isDarkMode ? 'bg-purple-900/20 border-purple-700/50' : 'bg-purple-50 border-purple-200',
        textColor: isDarkMode ? 'text-purple-300' : 'text-purple-800'
      },
      mood: {
        icon: Heart,
        colors: 'from-pink-500 to-rose-500',
        bgColor: isDarkMode ? 'bg-pink-900/20 border-pink-700/50' : 'bg-pink-50 border-pink-200',
        textColor: isDarkMode ? 'text-pink-300' : 'text-pink-800'
      },
      reminder: {
        icon: Bell,
        colors: 'from-indigo-500 to-blue-500',
        bgColor: isDarkMode ? 'bg-indigo-900/20 border-indigo-700/50' : 'bg-indigo-50 border-indigo-200',
        textColor: isDarkMode ? 'text-indigo-300' : 'text-indigo-800'
      }
    };

    return configs[notification.type];
  };

  const config = getTypeConfig();
  const IconComponent = notification.icon || config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 300, scale: 0.3 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.5 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`relative overflow-hidden backdrop-blur-md rounded-xl p-4 border shadow-lg ${config.bgColor} max-w-sm`}
    >
      {/* Progress bar */}
      {!notification.persistent && notification.duration && (
        <div className="absolute top-0 left-0 right-0 h-1">
          <motion.div
            className={`h-full bg-gradient-to-r ${config.colors}`}
            initial={{ width: '100%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
      )}

      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div className={`flex-shrink-0 w-10 h-10 bg-gradient-to-r ${config.colors} rounded-xl flex items-center justify-center`}>
          <IconComponent className="w-5 h-5 text-white" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className={`text-sm font-semibold ${config.textColor}`}>
                {notification.title}
              </h4>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {notification.message}
              </p>
              {notification.timestamp && (
                <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  {notification.timestamp.toLocaleTimeString()}
                </p>
              )}
            </div>

            {/* Close button */}
            <button
              onClick={() => onRemove(notification.id)}
              className={`flex-shrink-0 ml-2 p-1 rounded-lg transition-colors ${
                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Actions */}
          {notification.actions && notification.actions.length > 0 && (
            <div className="flex space-x-2 mt-3">
              {notification.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                    action.style === 'primary'
                      ? `bg-gradient-to-r ${config.colors} text-white hover:opacity-90`
                      : isDarkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

interface NotificationContainerProps {
  isDarkMode?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export const NotificationContainer: React.FC<NotificationContainerProps> = ({
  isDarkMode = false,
  position = 'top-right'
}) => {
  const { notifications, removeNotification, clearAll } = useNotifications();

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50 space-y-4 max-w-sm`}>
      {/* Clear all button */}
      {notifications.length > 1 && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={clearAll}
          className={`w-full px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
            isDarkMode
              ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Clear All ({notifications.length})
        </motion.button>
      )}

      {/* Notifications */}
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onRemove={removeNotification}
            isDarkMode={isDarkMode}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

// Convenience hooks for different notification types
export const useNotificationHelpers = () => {
  const { addNotification } = useNotifications();

  return {
    success: (title: string, message: string, actions?: Notification['actions']) =>
      addNotification({ type: 'success', title, message, actions }),
    
    error: (title: string, message: string, actions?: Notification['actions']) =>
      addNotification({ type: 'error', title, message, actions }),
    
    warning: (title: string, message: string, actions?: Notification['actions']) =>
      addNotification({ type: 'warning', title, message, actions }),
    
    info: (title: string, message: string, actions?: Notification['actions']) =>
      addNotification({ type: 'info', title, message, actions }),
    
    achievement: (title: string, message: string, actions?: Notification['actions']) =>
      addNotification({ type: 'achievement', title, message, actions, icon: Trophy }),
    
    mood: (title: string, message: string, actions?: Notification['actions']) =>
      addNotification({ type: 'mood', title, message, actions, icon: Heart }),
    
    reminder: (title: string, message: string, actions?: Notification['actions']) =>
      addNotification({ type: 'reminder', title, message, actions, icon: Bell })
  };
};

export default NotificationProvider;
