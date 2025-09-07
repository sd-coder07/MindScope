'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  User, 
  Settings, 
  Target, 
  Trophy, 
  Shield, 
  Bell, 
  Palette, 
  Edit,
  Calendar,
  TrendingUp,
  Heart,
  Brain,
  Activity,
  Star,
  Award,
  Zap,
  Clock,
  CheckCircle,
  Lock,
  Eye,
  Download
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose, isDarkMode }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [editMode, setEditMode] = useState(false);
  const [userData, setUserData] = useState({
    name: 'Alex Thompson',
    email: 'alex.thompson@email.com',
    joinDate: 'March 2024',
    streak: 24,
    totalSessions: 186,
    favoriteExercise: 'Mindful Breathing'
  });

  const [wellnessGoals, setWellnessGoals] = useState([
    { id: 1, title: 'Daily Meditation', target: 7, current: 5, unit: 'days/week', progress: 71 },
    { id: 2, title: 'Mood Check-ins', target: 2, current: 2, unit: 'times/day', progress: 100 },
    { id: 3, title: 'Sleep Quality', target: 8, current: 7.2, unit: 'hours', progress: 90 },
    { id: 4, title: 'Stress Level', target: 3, current: 2.1, unit: 'scale 1-5', progress: 82 }
  ]);

  const achievements = [
    { id: 1, title: 'Mindfulness Master', description: '30 consecutive meditation sessions', icon: Brain, earned: true, date: '2024-08-15' },
    { id: 2, title: 'Wellness Warrior', description: 'Completed 100 wellness activities', icon: Trophy, earned: true, date: '2024-08-10' },
    { id: 3, title: 'Stress Buster', description: 'Reduced stress by 50%', icon: Zap, earned: true, date: '2024-08-05' },
    { id: 4, title: 'Sleep Champion', description: '21 days of optimal sleep', icon: Clock, earned: false, progress: 67 },
    { id: 5, title: 'Mood Tracker Pro', description: '60 days of mood logging', icon: Heart, earned: false, progress: 45 },
    { id: 6, title: 'Community Helper', description: 'Helped 10 community members', icon: Star, earned: false, progress: 30 }
  ];

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: User },
    { id: 'goals', label: 'Wellness Goals', icon: Target },
    { id: 'achievements', label: 'Achievements', icon: Trophy },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const recentActivity = [
    { action: 'Completed breathing exercise', time: '2 hours ago', type: 'exercise' },
    { action: 'Logged mood as "Calm"', time: '4 hours ago', type: 'mood' },
    { action: 'Joined community discussion', time: '1 day ago', type: 'community' },
    { action: 'Achieved 7-day streak', time: '2 days ago', type: 'achievement' }
  ];

  if (!isOpen) return null;

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-gradient-to-r from-purple-50 to-blue-50'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {userData.name}
              </h3>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {userData.email}
              </p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                Member since {userData.joinDate}
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setEditMode(!editMode)}
            className={`p-2 rounded-lg ${isDarkMode ? 'bg-slate-700 text-gray-300' : 'bg-white text-gray-600'}`}
          >
            <Edit className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Current Streak', value: userData.streak, unit: 'days', icon: Calendar, color: 'from-green-500 to-emerald-500' },
          { label: 'Total Sessions', value: userData.totalSessions, unit: 'sessions', icon: Activity, color: 'from-blue-500 to-cyan-500' },
          { label: 'Wellness Score', value: 8.7, unit: '/10', icon: TrendingUp, color: 'from-purple-500 to-pink-500' },
          { label: 'Achievements', value: achievements.filter(a => a.earned).length, unit: 'earned', icon: Award, color: 'from-yellow-500 to-orange-500' }
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-white'} border ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}
          >
            <div className={`w-10 h-10 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {stat.value}
            </p>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-white'} border ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
        <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Recent Activity
        </h4>
        <div className="space-y-3">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className={`w-2 h-2 rounded-full ${
                activity.type === 'exercise' ? 'bg-green-500' :
                activity.type === 'mood' ? 'bg-blue-500' :
                activity.type === 'community' ? 'bg-purple-500' : 'bg-yellow-500'
              }`} />
              <div className="flex-1">
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {activity.action}
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderGoals = () => (
    <div className="space-y-4">
      {wellnessGoals.map((goal) => (
        <motion.div
          key={goal.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-white'} border ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {goal.title}
            </h4>
            <span className={`text-sm px-2 py-1 rounded-full ${
              goal.progress >= 80 ? 'bg-green-100 text-green-800' :
              goal.progress >= 60 ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {goal.progress}%
            </span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {goal.current} / {goal.target} {goal.unit}
            </span>
          </div>
          <div className={`w-full h-2 rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${goal.progress}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
            />
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderAchievements = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {achievements.map((achievement) => (
        <motion.div
          key={achievement.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-4 rounded-xl border-2 ${
            achievement.earned
              ? isDarkMode 
                ? 'bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border-yellow-500/30' 
                : 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300'
              : isDarkMode
                ? 'bg-slate-800 border-slate-600'
                : 'bg-gray-50 border-gray-200'
          }`}
        >
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-lg ${
              achievement.earned 
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                : isDarkMode ? 'bg-slate-700 text-gray-400' : 'bg-gray-200 text-gray-500'
            }`}>
              <achievement.icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {achievement.title}
              </h4>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {achievement.description}
              </p>
              {achievement.earned ? (
                <p className="text-xs text-yellow-600 mt-1">
                  Earned on {achievement.date}
                </p>
              ) : (
                <div className="mt-2">
                  <div className={`w-full h-1 rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
                    <div 
                      className="h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                      style={{ width: `${achievement.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {achievement.progress}% complete
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      {/* Privacy Settings */}
      <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-white'} border ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
        <h4 className={`font-semibold mb-4 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <Shield className="w-5 h-5 mr-2" />
          Privacy & Security
        </h4>
        <div className="space-y-3">
          {[
            { label: 'Data Encryption', enabled: true },
            { label: 'Anonymous Analytics', enabled: false },
            { label: 'Share Progress with Therapist', enabled: true },
            { label: 'Community Visibility', enabled: false }
          ].map((setting, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {setting.label}
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className={`w-12 h-6 rounded-full transition-colors ${
                  setting.enabled ? 'bg-green-500' : isDarkMode ? 'bg-slate-600' : 'bg-gray-300'
                }`}
              >
                <motion.div
                  animate={{ x: setting.enabled ? 24 : 0 }}
                  className="w-6 h-6 bg-white rounded-full shadow-md"
                />
              </motion.button>
            </div>
          ))}
        </div>
      </div>

      {/* Notification Settings */}
      <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-white'} border ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
        <h4 className={`font-semibold mb-4 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <Bell className="w-5 h-5 mr-2" />
          Notifications
        </h4>
        <div className="space-y-3">
          {[
            { label: 'Daily Mood Reminders', enabled: true },
            { label: 'Exercise Suggestions', enabled: true },
            { label: 'Achievement Alerts', enabled: false },
            { label: 'Community Updates', enabled: false }
          ].map((setting, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {setting.label}
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className={`w-12 h-6 rounded-full transition-colors ${
                  setting.enabled ? 'bg-blue-500' : isDarkMode ? 'bg-slate-600' : 'bg-gray-300'
                }`}
              >
                <motion.div
                  animate={{ x: setting.enabled ? 24 : 0 }}
                  className="w-6 h-6 bg-white rounded-full shadow-md"
                />
              </motion.button>
            </div>
          ))}
        </div>
      </div>

      {/* Data Export */}
      <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-white'} border ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
        <h4 className={`font-semibold mb-4 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <Download className="w-5 h-5 mr-2" />
          Data Management
        </h4>
        <div className="space-y-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            className={`w-full p-3 rounded-lg border-2 border-dashed transition-colors ${
              isDarkMode 
                ? 'border-slate-600 hover:border-blue-500 text-gray-300 hover:text-white' 
                : 'border-gray-300 hover:border-blue-500 text-gray-600 hover:text-gray-900'
            }`}
          >
            Export My Wellness Data
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            className={`w-full p-3 rounded-lg border-2 border-dashed transition-colors ${
              isDarkMode 
                ? 'border-red-600/50 hover:border-red-500 text-red-400 hover:text-red-300' 
                : 'border-red-300 hover:border-red-500 text-red-600 hover:text-red-700'
            }`}
          >
            Delete Account
          </motion.button>
        </div>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 50 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className={`w-full max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden ${
            isDarkMode ? 'bg-slate-900' : 'bg-white'
          } shadow-2xl`}
        >
          {/* Header */}
          <div className={`p-6 border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                User Profile
              </h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}
              >
                <X className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              </motion.button>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 mt-4">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                      : isDarkMode
                        ? 'text-gray-400 hover:text-white hover:bg-slate-800'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'goals' && renderGoals()}
            {activeTab === 'achievements' && renderAchievements()}
            {activeTab === 'settings' && renderSettings()}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UserProfileModal;
