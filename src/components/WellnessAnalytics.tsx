'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Heart, 
  Brain, 
  Zap,
  BarChart3,
  PieChart,
  LineChart,
  Target
} from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  Filler
);

interface ChartContainerProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<any>;
  isDarkMode?: boolean;
  value?: string | number;
  change?: number;
  className?: string;
}

const ChartContainer: React.FC<ChartContainerProps> = ({
  children,
  title,
  subtitle,
  icon: Icon,
  isDarkMode = false,
  value,
  change,
  className = ''
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`backdrop-blur-md rounded-2xl p-6 border shadow-xl ${
      isDarkMode 
        ? 'bg-slate-800/50 border-slate-700' 
        : 'bg-white/60 border-gray-200'
    } ${className}`}
  >
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-3">
        {Icon && (
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
            <Icon className="w-5 h-5 text-white" />
          </div>
        )}
        <div>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            {title}
          </h3>
          {subtitle && (
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {(value !== undefined || change !== undefined) && (
        <div className="text-right">
          {value !== undefined && (
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              {value}
            </div>
          )}
          {change !== undefined && (
            <div className={`flex items-center text-sm ${
              change >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {change >= 0 ? (
                <TrendingUp className="w-4 h-4 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1" />
              )}
              {Math.abs(change)}%
            </div>
          )}
        </div>
      )}
    </div>
    <div className="h-64">
      {children}
    </div>
  </motion.div>
);

interface WellnessAnalyticsProps {
  isDarkMode?: boolean;
}

const WellnessAnalytics: React.FC<WellnessAnalyticsProps> = ({ isDarkMode = false }) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [realTimeData, setRealTimeData] = useState({
    mood: 7.2,
    stress: 4.1,
    energy: 6.8,
    focus: 5.9
  });

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(prev => ({
        mood: Math.max(1, Math.min(10, prev.mood + (Math.random() - 0.5) * 0.5)),
        stress: Math.max(1, Math.min(10, prev.stress + (Math.random() - 0.5) * 0.3)),
        energy: Math.max(1, Math.min(10, prev.energy + (Math.random() - 0.5) * 0.4)),
        focus: Math.max(1, Math.min(10, prev.focus + (Math.random() - 0.5) * 0.3))
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Generate sample data based on time range
  const generateTimeSeriesData = (days: number) => {
    const labels = [];
    const moodData = [];
    const stressData = [];
    const energyData = [];
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      
      // Generate realistic wellness data with trends
      const trend = Math.sin(i * 0.1) * 2;
      moodData.push(Math.max(1, Math.min(10, 6.5 + trend + (Math.random() - 0.5) * 2)));
      stressData.push(Math.max(1, Math.min(10, 4 - trend * 0.5 + (Math.random() - 0.5) * 2)));
      energyData.push(Math.max(1, Math.min(10, 7 + trend * 0.7 + (Math.random() - 0.5) * 1.5)));
    }
    
    return { labels, moodData, stressData, energyData };
  };

  const timeRanges = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
    '1y': 365
  };

  const { labels, moodData, stressData, energyData } = generateTimeSeriesData(timeRanges[timeRange]);

  // Chart configurations
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: isDarkMode ? '#e5e7eb' : '#374151',
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
        titleColor: isDarkMode ? '#e5e7eb' : '#111827',
        bodyColor: isDarkMode ? '#d1d5db' : '#374151',
        borderColor: isDarkMode ? '#374151' : '#d1d5db',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12
      }
    },
    scales: {
      x: {
        grid: {
          color: isDarkMode ? '#374151' : '#f3f4f6',
          drawBorder: false
        },
        ticks: {
          color: isDarkMode ? '#9ca3af' : '#6b7280'
        }
      },
      y: {
        grid: {
          color: isDarkMode ? '#374151' : '#f3f4f6',
          drawBorder: false
        },
        ticks: {
          color: isDarkMode ? '#9ca3af' : '#6b7280'
        },
        beginAtZero: true,
        max: 10
      }
    }
  };

  const moodTrendData = {
    labels,
    datasets: [
      {
        label: 'Mood Score',
        data: moodData,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2
      },
      {
        label: 'Stress Level',
        data: stressData,
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(239, 68, 68)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2
      },
      {
        label: 'Energy Level',
        data: energyData,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(34, 197, 94)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2
      }
    ]
  };

  const weeklyActivityData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Meditation (min)',
        data: [20, 25, 15, 30, 22, 35, 18],
        backgroundColor: 'rgba(147, 51, 234, 0.8)',
        borderColor: 'rgba(147, 51, 234, 1)',
        borderWidth: 2,
        borderRadius: 6
      },
      {
        label: 'Exercise (min)',
        data: [45, 30, 60, 40, 55, 70, 25],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        borderRadius: 6
      },
      {
        label: 'Journaling (min)',
        data: [10, 15, 8, 12, 10, 20, 15],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 2,
        borderRadius: 6
      }
    ]
  };

  const moodDistributionData = {
    labels: ['Very Happy', 'Happy', 'Neutral', 'Sad', 'Very Sad'],
    datasets: [
      {
        data: [25, 35, 20, 15, 5],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(156, 163, 175, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(156, 163, 175, 1)',
          'rgba(249, 115, 22, 1)',
          'rgba(239, 68, 68, 1)'
        ],
        borderWidth: 2
      }
    ]
  };

  const wellnessRadarData = {
    labels: ['Mood', 'Energy', 'Focus', 'Sleep', 'Social', 'Physical'],
    datasets: [
      {
        label: 'Current Week',
        data: [7.2, 6.8, 5.9, 7.5, 6.3, 7.1],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(59, 130, 246, 1)'
      },
      {
        label: 'Previous Week',
        data: [6.8, 6.2, 5.5, 6.9, 6.0, 6.7],
        backgroundColor: 'rgba(147, 51, 234, 0.2)',
        borderColor: 'rgba(147, 51, 234, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(147, 51, 234, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(147, 51, 234, 1)'
      }
    ]
  };

  return (
    <div className="space-y-8 p-6">
      {/* Header with Time Range Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Analytics Dashboard
          </h2>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Comprehensive insights into your wellness journey
          </p>
        </div>
        <div className="flex space-x-2">
          {Object.keys(timeRanges).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range as keyof typeof timeRanges)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                timeRange === range
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                  : isDarkMode
                    ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Mood', value: realTimeData.mood.toFixed(1), icon: Heart, color: 'blue' },
          { label: 'Stress', value: realTimeData.stress.toFixed(1), icon: Activity, color: 'red' },
          { label: 'Energy', value: realTimeData.energy.toFixed(1), icon: Zap, color: 'green' },
          { label: 'Focus', value: realTimeData.focus.toFixed(1), icon: Brain, color: 'purple' }
        ].map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`backdrop-blur-md rounded-xl p-4 border ${
              isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white/60 border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {metric.label}
                </p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {metric.value}
                </p>
              </div>
              <metric.icon className={`w-8 h-8 text-${metric.color}-500`} />
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className={`bg-${metric.color}-500 h-2 rounded-full transition-all duration-1000`}
                style={{ width: `${(parseFloat(metric.value) / 10) * 100}%` }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Mood Trends */}
        <ChartContainer
          title="Wellness Trends"
          subtitle={`Last ${timeRange}`}
          icon={LineChart}
          isDarkMode={isDarkMode}
          change={12.5}
        >
          <Line data={moodTrendData} options={chartOptions} />
        </ChartContainer>

        {/* Weekly Activity */}
        <ChartContainer
          title="Weekly Activities"
          subtitle="Minutes per day"
          icon={BarChart3}
          isDarkMode={isDarkMode}
          value="5.2h"
        >
          <Bar data={weeklyActivityData} options={chartOptions} />
        </ChartContainer>

        {/* Mood Distribution */}
        <ChartContainer
          title="Mood Distribution"
          subtitle="Last 30 days"
          icon={PieChart}
          isDarkMode={isDarkMode}
        >
          <Doughnut
            data={moodDistributionData}
            options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                legend: {
                  ...chartOptions.plugins.legend,
                  position: 'bottom'
                }
              }
            }}
          />
        </ChartContainer>

        {/* Wellness Radar */}
        <ChartContainer
          title="Wellness Overview"
          subtitle="Multi-dimensional analysis"
          icon={Target}
          isDarkMode={isDarkMode}
        >
          <Radar
            data={wellnessRadarData}
            options={{
              ...chartOptions,
              scales: {
                r: {
                  angleLines: {
                    color: isDarkMode ? '#374151' : '#f3f4f6'
                  },
                  grid: {
                    color: isDarkMode ? '#374151' : '#f3f4f6'
                  },
                  pointLabels: {
                    color: isDarkMode ? '#9ca3af' : '#6b7280'
                  },
                  ticks: {
                    color: isDarkMode ? '#9ca3af' : '#6b7280',
                    backdropColor: 'transparent'
                  },
                  beginAtZero: true,
                  max: 10
                }
              }
            }}
          />
        </ChartContainer>
      </div>
    </div>
  );
};

export default WellnessAnalytics;
