'use client';

import { conversationStorage, type SessionAnalytics } from '@/lib/conversationStorage';
import { motion } from 'framer-motion';
import {
    BarChart3,
    Brain,
    Calendar,
    Clock,
    Heart,
    MessageSquare,
    TrendingUp
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface TherapyAnalyticsDashboardProps {
  isDarkMode?: boolean;
}

export default function TherapyAnalyticsDashboard({ isDarkMode = false }: TherapyAnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<SessionAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      await conversationStorage.initialize();
      const data = await conversationStorage.generateAnalytics();
      setAnalytics(data);
      setError(null);
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError('Unable to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`w-full h-[400px] rounded-2xl p-6 flex items-center justify-center ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } border`}>
        <div className="text-center space-y-3">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto" />
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Loading therapy insights...
          </p>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className={`w-full h-[400px] rounded-2xl p-6 flex items-center justify-center ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } border`}>
        <div className="text-center space-y-3">
          <Brain className={`w-12 h-12 mx-auto ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            No Therapy Data Yet
          </h3>
          <p className={`text-sm max-w-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Start a conversation with your AI Therapist to see personalized insights and progress tracking.
          </p>
        </div>
      </div>
    );
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.round(seconds / 60);
    return minutes < 60 ? `${minutes}m` : `${Math.round(minutes / 60)}h ${minutes % 60}m`;
  };

  const getProgressColor = (value: number) => {
    if (value >= 0.7) return 'text-green-500';
    if (value >= 0.4) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getProgressBg = (value: number) => {
    if (value >= 0.7) return 'bg-green-500';
    if (value >= 0.4) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className={`w-full rounded-2xl p-6 ${
      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    } border space-y-6`}>
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Therapy Analytics
            </h2>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Your mental health journey insights
            </p>
          </div>
        </div>
        
        <button
          onClick={loadAnalytics}
          className={`px-3 py-1 rounded-lg text-xs transition-colors ${
            isDarkMode 
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Refresh
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl ${
            isDarkMode ? 'bg-gray-700/50' : 'bg-blue-50'
          }`}
        >
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Sessions
            </span>
          </div>
          <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {analytics.totalSessions}
          </p>
          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Total conversations
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`p-4 rounded-xl ${
            isDarkMode ? 'bg-gray-700/50' : 'bg-green-50'
          }`}
        >
          <div className="flex items-center space-x-2 mb-2">
            <MessageSquare className="w-4 h-4 text-green-500" />
            <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Messages
            </span>
          </div>
          <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {analytics.totalMessages}
          </p>
          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Total exchanges
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`p-4 rounded-xl ${
            isDarkMode ? 'bg-gray-700/50' : 'bg-purple-50'
          }`}
        >
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-4 h-4 text-purple-500" />
            <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Avg Session
            </span>
          </div>
          <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {formatDuration(analytics.averageSessionLength)}
          </p>
          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Duration per session
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`p-4 rounded-xl ${
            isDarkMode ? 'bg-gray-700/50' : 'bg-orange-50'
          }`}
        >
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-4 h-4 text-orange-500" />
            <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Engagement
            </span>
          </div>
          <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {Math.round(analytics.progressMetrics.engagementLevel * 100)}%
          </p>
          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Participation level
          </p>
        </motion.div>
      </div>

      {/* Progress Metrics */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className={`p-4 rounded-xl ${
            isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
          }`}
        >
          <h3 className={`text-sm font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Progress Indicators
          </h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Weekly Improvement
                </span>
                <span className={`text-xs font-medium ${getProgressColor(Math.abs(analytics.progressMetrics.weeklyImprovement))}`}>
                  {analytics.progressMetrics.weeklyImprovement >= 0 ? '+' : ''}
                  {Math.round(analytics.progressMetrics.weeklyImprovement * 100)}%
                </span>
              </div>
              <div className={`w-full h-2 rounded-full ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressBg(Math.abs(analytics.progressMetrics.weeklyImprovement))}`}
                  style={{ width: `${Math.min(Math.abs(analytics.progressMetrics.weeklyImprovement) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Consistency Score
                </span>
                <span className={`text-xs font-medium ${getProgressColor(analytics.progressMetrics.consistencyScore)}`}>
                  {Math.round(analytics.progressMetrics.consistencyScore * 100)}%
                </span>
              </div>
              <div className={`w-full h-2 rounded-full ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressBg(analytics.progressMetrics.consistencyScore)}`}
                  style={{ width: `${analytics.progressMetrics.consistencyScore * 100}%` }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className={`p-4 rounded-xl ${
            isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
          }`}
        >
          <h3 className={`text-sm font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Therapeutic Insights
          </h3>
          
          <div className="space-y-3">
            <div>
              <p className={`text-xs font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Most Effective Techniques
              </p>
              <div className="space-y-1">
                {analytics.therapeuticInsights.mostEffectiveTechniques.slice(0, 3).map((technique, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Heart className="w-3 h-3 text-pink-500" />
                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {technique.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className={`text-xs font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Common Emotional Themes
              </p>
              <div className="space-y-1">
                {analytics.therapeuticInsights.commonTriggers.slice(0, 3).map((trigger, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Brain className="w-3 h-3 text-blue-500" />
                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {trigger.charAt(0).toUpperCase() + trigger.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Emotional Trends */}
      {analytics.emotionalTrends.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className={`p-4 rounded-xl ${
            isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
          }`}
        >
          <h3 className={`text-sm font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Recent Emotional Trends (Last 30 Days)
          </h3>
          
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {analytics.emotionalTrends.slice(-10).map((trend, index) => (
              <div
                key={index}
                className={`flex-shrink-0 p-2 rounded-lg text-center min-w-[60px] ${
                  isDarkMode ? 'bg-gray-600' : 'bg-white'
                }`}
              >
                <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${
                  trend.intensity > 0.6 ? 'bg-red-400' : 
                  trend.intensity > 0.3 ? 'bg-yellow-400' : 'bg-green-400'
                }`} />
                <p className={`text-xs font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {trend.emotion}
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {new Date(trend.date).getDate()}/{new Date(trend.date).getMonth() + 1}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Privacy Notice */}
      <div className={`text-xs text-center ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
        All data is stored locally on your device and never shared with third parties
      </div>
    </div>
  );
}
