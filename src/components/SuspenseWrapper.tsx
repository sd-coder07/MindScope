'use client';

import { AnimatePresence, motion } from 'framer-motion';
import React, { ComponentType, Suspense, lazy } from 'react';
import EnhancedErrorBoundary from './EnhancedErrorBoundary';
import { SkeletonDashboard } from './Skeleton';

interface SuspenseWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  isDarkMode?: boolean;
  loadingMessage?: string;
  showProgress?: boolean;
}

interface LoadingSpinnerProps {
  message?: string;
  isDarkMode?: boolean;
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton';
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Loading...",
  isDarkMode = false,
  variant = 'spinner',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="flex space-x-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-bounce-loading`}
                style={{ animationDelay: `${i * 0.16}s` }}
              />
            ))}
          </div>
        );
      
      case 'pulse':
        return (
          <div className={`${sizeClasses[size]} bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-enhanced-pulse`} />
        );
      
      case 'skeleton':
        return <SkeletonDashboard isDarkMode={isDarkMode} />;
      
      default:
        return (
          <div className={`${sizeClasses[size]} border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin`} />
        );
    }
  };

  if (variant === 'skeleton') {
    return <SkeletonDashboard isDarkMode={isDarkMode} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex flex-col items-center justify-center p-8 space-y-4"
    >
      {renderSpinner()}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`text-center font-medium ${
          isDarkMode ? 'text-gray-300' : 'text-gray-600'
        }`}
      >
        {message}
      </motion.p>
    </motion.div>
  );
};

export const ProgressiveLoader: React.FC<{
  progress: number;
  isDarkMode?: boolean;
  message?: string;
}> = ({ progress, isDarkMode = false, message = "Loading..." }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center p-8 space-y-6"
  >
    <div className="w-64">
      <div className={`h-2 rounded-full overflow-hidden ${
        isDarkMode ? 'bg-slate-700' : 'bg-gray-200'
      }`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
        />
      </div>
      <div className="flex justify-between mt-2">
        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {message}
        </span>
        <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  </motion.div>
);

export const SuspenseWrapper: React.FC<SuspenseWrapperProps> = ({
  children,
  fallback,
  errorFallback,
  isDarkMode = false,
  loadingMessage = "Loading amazing features...",
  showProgress = false
}) => {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    if (showProgress) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval);
            return 95;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      return () => clearInterval(interval);
    }
  }, [showProgress]);

  const defaultFallback = showProgress ? (
    <ProgressiveLoader 
      progress={progress} 
      isDarkMode={isDarkMode} 
      message={loadingMessage}
    />
  ) : (
    <LoadingSpinner 
      message={loadingMessage} 
      isDarkMode={isDarkMode}
      variant="spinner"
      size="lg"
    />
  );

  return (
    <EnhancedErrorBoundary 
      isDarkMode={isDarkMode}
      onError={(error: Error, errorInfo: any) => {
        console.error('Component error:', error, errorInfo);
      }}
    >
      <Suspense fallback={fallback || defaultFallback}>
        <AnimatePresence mode="wait">
          {children}
        </AnimatePresence>
      </Suspense>
    </EnhancedErrorBoundary>
  );
};

// Higher Order Component for lazy loading with enhanced suspense
export const withSuspense = <P extends object>(
  Component: ComponentType<P>,
  options?: {
    fallback?: React.ReactNode;
    errorFallback?: React.ReactNode;
    loadingMessage?: string;
    showProgress?: boolean;
  }
) => {
  const SuspendedComponent = (props: P & { isDarkMode?: boolean }) => (
    <SuspenseWrapper
      fallback={options?.fallback}
      errorFallback={options?.errorFallback}
      isDarkMode={props.isDarkMode}
      loadingMessage={options?.loadingMessage}
      showProgress={options?.showProgress}
    >
      <Component {...(props as P)} />
    </SuspenseWrapper>
  );

  SuspendedComponent.displayName = `withSuspense(${Component.displayName || Component.name})`;
  return SuspendedComponent;
};

// Utility for creating lazy components with built-in suspense
export const createLazyComponent = <P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options?: Parameters<typeof withSuspense>[1]
) => {
  const LazyComponent = lazy(importFn);
  return withSuspense(LazyComponent, options);
};

// Component for showing loading states during data fetching
export const DataLoader: React.FC<{
  isLoading: boolean;
  error?: Error | null;
  children: React.ReactNode;
  skeleton?: React.ReactNode;
  isDarkMode?: boolean;
  retryFn?: () => void;
}> = ({
  isLoading,
  error,
  children,
  skeleton,
  isDarkMode = false,
  retryFn
}) => {
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`p-6 rounded-xl border text-center ${
          isDarkMode 
            ? 'bg-red-900/20 border-red-700/50 text-red-300' 
            : 'bg-red-50 border-red-200 text-red-700'
        }`}
      >
        <p className="mb-4">Failed to load data: {error.message}</p>
        {retryFn && (
          <button
            onClick={retryFn}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isDarkMode
                ? 'bg-red-700 hover:bg-red-600 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            Try Again
          </button>
        )}
      </motion.div>
    );
  }

  if (isLoading) {
    return skeleton || <LoadingSpinner isDarkMode={isDarkMode} />;
  }

  return <>{children}</>;
};

export default SuspenseWrapper;
