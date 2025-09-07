'use client';

import { dataPersistence, MoodEntry } from '@/lib/dataPersistence';
import { motion } from 'framer-motion';
import {
    Activity,
    AlertCircle,
    Award,
    BarChart3,
    Calendar,
    Heart,
    Smile,
    Target,
    TrendingDown,
    TrendingUp
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function RealMoodAnalytics() {
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [analytics, setAnalytics] = useState({
    averageScore: 0,
    totalEntries: 0,
    streak: 0,
    trend: 'stable' as 'improving' | 'declining' | 'stable',
    mostCommonMood: '',
    topTriggers: [] as string[],
    weeklyData: [] as { day: string; score: number }[]
  });

  useEffect(() => {
    loadAnalytics();
    
    // Listen for new mood entries
    const handleMoodUpdate = () => loadAnalytics();
    window.addEventListener('moodEntryAdded', handleMoodUpdate);
    
    return () => window.removeEventListener('moodEntryAdded', handleMoodUpdate);
  }, []);

  const loadAnalytics = () => {
    const entries = dataPersistence.getMoodEntries(30); // Last 30 days
    setMoodEntries(entries);
    
    if (entries.length === 0) {
      setAnalytics({
        averageScore: 0,
        totalEntries: 0,
        streak: 0,
        trend: 'stable',
        mostCommonMood: '',
        topTriggers: [],
        weeklyData: []
      });
      return;
    }

    // Calculate analytics
    const totalScore = entries.reduce((sum, entry) => sum + entry.score, 0);
    const averageScore = totalScore / entries.length;
    
    // Calculate streak (consecutive days with entries)
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      
      const hasEntry = entries.some(entry => 
        new Date(entry.timestamp).toDateString() === dateStr
      );
      
      if (hasEntry) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    // Calculate trend
    const recentEntries = entries.slice(-7);
    const olderEntries = entries.slice(-14, -7);
    
    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    if (recentEntries.length > 0 && olderEntries.length > 0) {
      const recentAvg = recentEntries.reduce((sum, entry) => sum + entry.score, 0) / recentEntries.length;
      const olderAvg = olderEntries.reduce((sum, entry) => sum + entry.score, 0) / olderEntries.length;
      
      if (recentAvg > olderAvg + 0.5) trend = 'improving';
      else if (recentAvg < olderAvg - 0.5) trend = 'declining';
    }

    // Most common mood
    const moodCounts = entries.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostCommonMood = Object.entries(moodCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '';

    // Top triggers
    const allTriggers = entries.flatMap(entry => entry.triggers || []);
    const triggerCounts = allTriggers.reduce((acc, trigger) => {
      acc[trigger] = (acc[trigger] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topTriggers = Object.entries(triggerCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([trigger]) => trigger);

    // Weekly data for mini chart
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayEntries = entries.filter(entry => 
        new Date(entry.timestamp).toDateString() === date.toDateString()
      );
      
      const dayScore = dayEntries.length > 0 
        ? dayEntries.reduce((sum, entry) => sum + entry.score, 0) / dayEntries.length
        : 0;
      
      weeklyData.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        score: Math.round(dayScore * 10) / 10
      });
    }

    setAnalytics({
      averageScore: Math.round(averageScore * 10) / 10,
      totalEntries: entries.length,
      streak,
      trend,
      mostCommonMood,
      topTriggers,
      weeklyData
    });
  };

  const moodEmojis = {
    happy: '😊',
    calm: '😌',
    energetic: '⚡',
    content: '😊',
    peaceful: '☮️',
    sad: '😢',
    anxious: '😰',
    stressed: '😤',
    tired: '😴',
    angry: '😠'
  };

  const getTrendIcon = () => {
    switch (analytics.trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'declining': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendColor = () => {
    switch (analytics.trend) {
      case 'improving': return 'text-green-600 bg-green-50';
      case 'declining': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-50';
    if (score >= 6) return 'text-yellow-600 bg-yellow-50';
    if (score >= 4) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  if (analytics.totalEntries === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6 text-center"
      >
        <Heart className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Start Your Mood Journey</h3>
        <p className="text-gray-500 mb-4">Track your emotions to unlock insights about your mental wellness</p>
        <button className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all">
          Log Your First Mood
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Average Score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`bg-white rounded-xl shadow-lg p-4 border-l-4 border-blue-500`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Mood</p>
              <p className={`text-2xl font-bold ${getScoreColor(analytics.averageScore)}`}>
                {analytics.averageScore}/10
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-500" />
          </div>
        </motion.div>

        {/* Streak */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-green-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Daily Streak</p>
              <p className="text-2xl font-bold text-green-600">{analytics.streak} days</p>
            </div>
            <Calendar className="w-8 h-8 text-green-500" />
          </div>
        </motion.div>

        {/* Trend */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-purple-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Trend</p>
              <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-sm font-medium ${getTrendColor()}`}>
                {getTrendIcon()}
                <span className="capitalize">{analytics.trend}</span>
              </div>
            </div>
            <Target className="w-8 h-8 text-purple-500" />
          </div>
        </motion.div>

        {/* Most Common Mood */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-rose-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Common Mood</p>
              <div className="flex items-center space-x-2">
                <span className="text-xl">
                  {moodEmojis[analytics.mostCommonMood as keyof typeof moodEmojis] || '😊'}
                </span>
                <span className="text-lg font-semibold capitalize">{analytics.mostCommonMood}</span>
              </div>
            </div>
            <Smile className="w-8 h-8 text-rose-500" />
          </div>
        </motion.div>
      </div>

      {/* Weekly Mood Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Weekly Mood Trend</h3>
          <BarChart3 className="w-5 h-5 text-gray-500" />
        </div>
        
        <div className="flex items-end justify-between space-x-2 h-32">
          {analytics.weeklyData.map((day, index) => (
            <div key={day.day} className="flex flex-col items-center flex-1">
              <div 
                className={`w-full rounded-t-lg mb-2 transition-all hover:opacity-80 ${
                  day.score >= 8 ? 'bg-green-500' :
                  day.score >= 6 ? 'bg-yellow-500' :
                  day.score >= 4 ? 'bg-orange-500' :
                  day.score > 0 ? 'bg-red-500' : 'bg-gray-300'
                }`}
                style={{ height: `${Math.max((day.score / 10) * 100, 8)}%` }}
                title={`${day.day}: ${day.score}/10`}
              />
              <span className="text-xs text-gray-600">{day.day}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Top Triggers */}
      {analytics.topTriggers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center space-x-2 mb-4">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            <h3 className="text-lg font-semibold text-gray-800">Common Triggers</h3>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {analytics.topTriggers.map((trigger, index) => (
              <motion.div
                key={trigger}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium"
              >
                {trigger}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Achievement */}
      {analytics.streak >= 7 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl shadow-lg p-6 text-white"
        >
          <div className="flex items-center space-x-3">
            <Award className="w-8 h-8" />
            <div>
              <h3 className="text-lg font-semibold">Weekly Warrior! 🏆</h3>
              <p className="text-yellow-100">
                You&apos;ve been tracking your mood for {analytics.streak} days straight. Keep it up!
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
