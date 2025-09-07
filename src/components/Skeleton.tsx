'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'shimmer';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
  animation = 'shimmer'
}) => {
  const baseClasses = 'bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700';
  
  const variantClasses = {
    text: 'rounded-md',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-lg'
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-pulse',
    shimmer: 'bg-shimmer animate-shimmer'
  };

  const style = {
    width: width || (variant === 'text' ? '100%' : '40px'),
    height: height || (variant === 'text' ? '1rem' : variant === 'circular' ? '40px' : '20px')
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
    />
  );
};

interface SkeletonCardProps {
  isDarkMode?: boolean;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ isDarkMode = false }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className={`p-6 rounded-2xl ${
      isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white/60 border-gray-200'
    } border backdrop-blur-sm`}
  >
    <div className="flex items-center space-x-4 mb-4">
      <Skeleton variant="circular" width="48px" height="48px" />
      <div className="flex-1">
        <Skeleton width="60%" height="1.25rem" className="mb-2" />
        <Skeleton width="40%" height="1rem" />
      </div>
    </div>
    <Skeleton width="100%" height="4rem" className="mb-3" />
    <div className="space-y-2">
      <Skeleton width="90%" />
      <Skeleton width="75%" />
      <Skeleton width="60%" />
    </div>
  </motion.div>
);

export const SkeletonMetric: React.FC<SkeletonCardProps> = ({ isDarkMode = false }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className={`p-4 rounded-xl ${
      isDarkMode ? 'bg-slate-700/60' : 'bg-white/60'
    } backdrop-blur-sm`}
  >
    <Skeleton width="60%" height="2rem" className="mb-2" />
    <Skeleton width="40%" height="0.875rem" className="mb-3" />
    <Skeleton width="100%" height="8px" className="rounded-full" />
  </motion.div>
);

export const SkeletonNavigation: React.FC<SkeletonCardProps> = ({ isDarkMode = false }) => (
  <div className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-all duration-300 ${
    isDarkMode 
      ? 'bg-slate-900/80 border-slate-700/50' 
      : 'bg-white/80 border-gray-200/50'
  }`}>
    <div className="px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Skeleton variant="circular" width="40px" height="40px" />
          <div>
            <Skeleton width="120px" height="1.25rem" className="mb-1" />
            <Skeleton width="80px" height="0.75rem" />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} width="100px" height="40px" className="rounded-xl" />
          ))}
        </div>
        
        <div className="flex items-center space-x-4">
          <Skeleton width="240px" height="40px" className="rounded-xl" />
          <Skeleton variant="circular" width="44px" height="44px" />
          <Skeleton variant="circular" width="44px" height="44px" />
        </div>
      </div>
    </div>
  </div>
);

interface SkeletonGridProps {
  items?: number;
  isDarkMode?: boolean;
}

export const SkeletonGrid: React.FC<SkeletonGridProps> = ({ items = 6, isDarkMode = false }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(items)].map((_, index) => (
      <SkeletonCard key={index} isDarkMode={isDarkMode} />
    ))}
  </div>
);

export const SkeletonDashboard: React.FC<SkeletonCardProps> = ({ isDarkMode = false }) => (
  <div className={`min-h-screen transition-colors duration-500 ${
    isDarkMode 
      ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
      : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
  }`}>
    <SkeletonNavigation isDarkMode={isDarkMode} />
    
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Stats Overview Skeleton */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`backdrop-blur-md rounded-2xl p-6 ${
          isDarkMode ? 'bg-slate-800/50 border-slate-600' : 'bg-white/40 border-white/20'
        } border shadow-xl`}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <Skeleton width="280px" height="2rem" className="mb-2" />
            <Skeleton width="200px" height="1rem" />
          </div>
          <Skeleton width="100px" height="1.5rem" />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => (
            <SkeletonMetric key={index} isDarkMode={isDarkMode} />
          ))}
        </div>
      </motion.div>
      
      {/* Main Content Skeleton */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`backdrop-blur-md rounded-2xl p-8 ${
          isDarkMode ? 'bg-slate-800/30 border-slate-700' : 'bg-white/40 border-white/20'
        } border shadow-xl`}
      >
        <div className="space-y-8">
          <div className="text-center">
            <Skeleton variant="circular" width="80px" height="80px" className="mx-auto mb-4" />
            <Skeleton width="300px" height="2rem" className="mx-auto mb-4" />
            <Skeleton width="400px" height="1rem" className="mx-auto" />
          </div>
          
          <SkeletonGrid items={6} isDarkMode={isDarkMode} />
        </div>
      </motion.div>
    </div>
  </div>
);

export default Skeleton;
