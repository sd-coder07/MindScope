'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  onComplete?: () => void;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 2,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
  onComplete
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const controls = useAnimation();
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) => 
    parseFloat(latest.toFixed(decimals))
  );

  useEffect(() => {
    const animation = controls.start({
      from: displayValue,
      to: value,
      transition: {
        duration,
        ease: "easeOut"
      }
    });

    const unsubscribe = motionValue.onChange((latest) => {
      setDisplayValue(latest);
    });

    motionValue.set(value);

    animation.then(() => {
      onComplete?.();
    });

    return () => {
      unsubscribe();
    };
  }, [value, duration, controls, motionValue, displayValue, onComplete]);

  return (
    <motion.span
      className={className}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {prefix}
      <motion.span>{displayValue.toFixed(decimals)}</motion.span>
      {suffix}
    </motion.span>
  );
};

interface RealTimeMetricProps {
  title: string;
  value: number;
  previousValue?: number;
  unit?: string;
  icon?: React.ComponentType<any>;
  color?: string;
  isDarkMode?: boolean;
  showTrend?: boolean;
  decimals?: number;
  animate?: boolean;
}

export const RealTimeMetric: React.FC<RealTimeMetricProps> = ({
  title,
  value,
  previousValue,
  unit = '',
  icon: Icon,
  color = 'blue',
  isDarkMode = false,
  showTrend = true,
  decimals = 1,
  animate = true
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const prevValueRef = useRef(value);

  const trend = previousValue !== undefined 
    ? ((value - previousValue) / previousValue) * 100 
    : 0;

  const getTrendColor = () => {
    if (Math.abs(trend) < 1) return 'text-gray-500';
    return trend > 0 ? 'text-green-500' : 'text-red-500';
  };

  const getTrendIcon = () => {
    if (Math.abs(trend) < 1) return '→';
    return trend > 0 ? '↗' : '↘';
  };

  useEffect(() => {
    if (prevValueRef.current !== value) {
      setIsUpdating(true);
      const timer = setTimeout(() => setIsUpdating(false), 1000);
      prevValueRef.current = value;
      return () => clearTimeout(timer);
    }
  }, [value]);

  const colorClasses = {
    blue: 'from-blue-500 to-cyan-500',
    green: 'from-green-500 to-emerald-500',
    purple: 'from-purple-500 to-pink-500',
    red: 'from-red-500 to-orange-500',
    yellow: 'from-yellow-500 to-amber-500'
  };

  return (
    <motion.div
      layout
      className={`relative overflow-hidden backdrop-blur-md rounded-xl p-6 border transition-all duration-300 ${
        isDarkMode 
          ? 'bg-slate-800/50 border-slate-700' 
          : 'bg-white/60 border-gray-200'
      } ${isUpdating ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Background Animation */}
      {isUpdating && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        />
      )}

      <div className="relative z-10 flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            {Icon && (
              <div className={`w-10 h-10 bg-gradient-to-r ${colorClasses[color as keyof typeof colorClasses]} rounded-xl flex items-center justify-center`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
            )}
            <div>
              <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {title}
              </h3>
              {showTrend && previousValue !== undefined && (
                <div className={`text-xs flex items-center ${getTrendColor()}`}>
                  <span className="mr-1">{getTrendIcon()}</span>
                  {Math.abs(trend).toFixed(1)}%
                </div>
              )}
            </div>
          </div>

          <div className="flex items-baseline space-x-2">
            {animate ? (
              <AnimatedCounter
                value={value}
                decimals={decimals}
                className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}
                duration={1.5}
              />
            ) : (
              <span className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                {value.toFixed(decimals)}
              </span>
            )}
            {unit && (
              <span className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {unit}
              </span>
            )}
          </div>
        </div>

        {/* Pulse Animation */}
        {isUpdating && (
          <motion.div
            className={`w-3 h-3 bg-gradient-to-r ${colorClasses[color as keyof typeof colorClasses]} rounded-full`}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [1, 0.7, 1]
            }}
            transition={{
              duration: 1,
              repeat: 2,
              ease: "easeInOut"
            }}
          />
        )}
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className={`w-full h-2 rounded-full overflow-hidden ${
          isDarkMode ? 'bg-slate-700' : 'bg-gray-200'
        }`}>
          <motion.div
            className={`h-full bg-gradient-to-r ${colorClasses[color as keyof typeof colorClasses]}`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (value / 10) * 100)}%` }}
            transition={{ duration: 2, ease: "easeOut" }}
          />
        </div>
      </div>
    </motion.div>
  );
};

interface MetricsDashboardProps {
  isDarkMode?: boolean;
}

export const MetricsDashboard: React.FC<MetricsDashboardProps> = ({ isDarkMode = false }) => {
  const [metrics, setMetrics] = useState({
    mood: { current: 7.2, previous: 6.8 },
    stress: { current: 4.1, previous: 4.5 },
    energy: { current: 6.8, previous: 6.2 },
    focus: { current: 5.9, previous: 5.5 },
    heartRate: { current: 72, previous: 75 },
    sleepScore: { current: 8.1, previous: 7.9 }
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => {
        const newMetrics = { ...prev };
        
        Object.keys(newMetrics).forEach(key => {
          const metric = newMetrics[key as keyof typeof newMetrics];
          const variation = (Math.random() - 0.5) * 0.5;
          const newValue = Math.max(0, Math.min(10, metric.current + variation));
          
          newMetrics[key as keyof typeof newMetrics] = {
            previous: metric.current,
            current: key === 'heartRate' 
              ? Math.max(60, Math.min(100, metric.current + variation * 5))
              : newValue
          };
        });
        
        return newMetrics;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const metricConfigs = [
    {
      key: 'mood',
      title: 'Mood Score',
      icon: 'Heart',
      color: 'blue',
      unit: '/10'
    },
    {
      key: 'stress',
      title: 'Stress Level',
      icon: 'Activity',
      color: 'red',
      unit: '/10'
    },
    {
      key: 'energy',
      title: 'Energy Level',
      icon: 'Zap',
      color: 'green',
      unit: '/10'
    },
    {
      key: 'focus',
      title: 'Focus Score',
      icon: 'Brain',
      color: 'purple',
      unit: '/10'
    },
    {
      key: 'heartRate',
      title: 'Heart Rate',
      icon: 'Heart',
      color: 'red',
      unit: 'bpm',
      decimals: 0
    },
    {
      key: 'sleepScore',
      title: 'Sleep Quality',
      icon: 'Moon',
      color: 'blue',
      unit: '/10'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {metricConfigs.map((config, index) => {
        const metric = metrics[config.key as keyof typeof metrics];
        return (
          <motion.div
            key={config.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <RealTimeMetric
              title={config.title}
              value={metric.current}
              previousValue={metric.previous}
              unit={config.unit}
              color={config.color}
              isDarkMode={isDarkMode}
              decimals={config.decimals || 1}
            />
          </motion.div>
        );
      })}
    </div>
  );
};

export default RealTimeMetric;
