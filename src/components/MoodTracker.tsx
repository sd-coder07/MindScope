'use client';

import { generateMoodData } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Calendar, Heart, TrendingUp, Zap } from 'lucide-react';
import { useState } from 'react';
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function MoodTracker() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [moodData] = useState(() => generateMoodData(selectedPeriod === 'week' ? 7 : selectedPeriod === 'month' ? 30 : 365));

  const periods = [
    { key: 'week', label: '7 Days', icon: Calendar },
    { key: 'month', label: '30 Days', icon: TrendingUp },
    { key: 'year', label: '1 Year', icon: Heart }
  ];

  const getAverageScore = (metric: 'mood' | 'stress' | 'energy') => {
    const sum = moodData.reduce((acc, day) => acc + day[metric], 0);
    return (sum / moodData.length).toFixed(1);
  };

  const getTrend = (metric: 'mood' | 'stress' | 'energy') => {
    const firstHalf = moodData.slice(0, Math.floor(moodData.length / 2));
    const secondHalf = moodData.slice(Math.floor(moodData.length / 2));
    
    const firstAvg = firstHalf.reduce((acc, day) => acc + day[metric], 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((acc, day) => acc + day[metric], 0) / secondHalf.length;
    
    return secondAvg > firstAvg ? 'up' : 'down';
  };

  const metrics = [
    {
      key: 'mood',
      label: 'Mood',
      color: '#B5A7E6',
      icon: Heart,
      average: getAverageScore('mood'),
      trend: getTrend('mood')
    },
    {
      key: 'stress',
      label: 'Stress Level',
      color: '#457B9D',
      icon: Zap,
      average: getAverageScore('stress'),
      trend: getTrend('stress')
    },
    {
      key: 'energy',
      label: 'Energy',
      color: '#A8DADC',
      icon: TrendingUp,
      average: getAverageScore('energy'),
      trend: getTrend('energy')
    }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Mood Analytics</h2>
          
          <div className="flex space-x-2">
            {periods.map((period) => (
              <motion.button
                key={period.key}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedPeriod(period.key as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  selectedPeriod === period.key
                    ? 'bg-serenity-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <period.icon className="w-4 h-4" />
                <span>{period.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: metric.color }}
                  >
                    <metric.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{metric.label}</h3>
                    <p className="text-sm text-gray-600">Average Score</p>
                  </div>
                </div>
                
                <motion.div
                  animate={{ 
                    rotate: metric.trend === 'up' ? 0 : 180,
                    color: metric.trend === 'up' ? '#10B981' : '#EF4444'
                  }}
                  className="text-2xl"
                >
                  ↗
                </motion.div>
              </div>
              
              <div className="text-3xl font-bold text-gray-800 mb-2">
                {metric.average}
                <span className="text-lg text-gray-500">/10</span>
              </div>
              
              <div className="text-sm text-gray-600">
                {metric.trend === 'up' ? 'Improving' : 'Declining'} trend
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Mood Trend Chart */}
          <div className="bg-gradient-to-br from-serenity-50 to-healing-50 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Mood Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={moodData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6B7280"
                  fontSize={12}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis stroke="#6B7280" fontSize={12} domain={[0, 10]} />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value: any, name: string) => [value.toFixed(1), name.charAt(0).toUpperCase() + name.slice(1)]}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="mood" 
                  stroke="#B5A7E6" 
                  fill="#B5A7E6" 
                  fillOpacity={0.3}
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Multi-Metric Comparison */}
          <div className="bg-gradient-to-br from-ocean-50 to-sunset-50 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">All Metrics</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={moodData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6B7280"
                  fontSize={12}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis stroke="#6B7280" fontSize={12} domain={[0, 10]} />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value: any, name: string) => [value.toFixed(1), name.charAt(0).toUpperCase() + name.slice(1)]}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="mood" 
                  stroke="#B5A7E6" 
                  strokeWidth={3}
                  dot={{ fill: '#B5A7E6', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="stress" 
                  stroke="#457B9D" 
                  strokeWidth={3}
                  dot={{ fill: '#457B9D', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="energy" 
                  stroke="#A8DADC" 
                  strokeWidth={3}
                  dot={{ fill: '#A8DADC', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-gradient-to-r from-healing-50 to-warm-50 rounded-xl p-6"
        >
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Insights & Recommendations</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-700">Patterns Detected</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-serenity-400 rounded-full"></div>
                  <span>Your mood tends to be higher in the morning</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-ocean-400 rounded-full"></div>
                  <span>Stress levels correlate with workday patterns</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-healing-400 rounded-full"></div>
                  <span>Energy improves with consistent sleep schedule</span>
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-700">Recommended Actions</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-sunset-400 rounded-full"></div>
                  <span>Try morning meditation to maintain mood peaks</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-warm-400 rounded-full"></div>
                  <span>Schedule break reminders during work hours</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-serenity-400 rounded-full"></div>
                  <span>Consider sleep hygiene improvements</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
