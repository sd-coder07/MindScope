'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bell,
  Brain,
  Command,
  Home,
  Lightbulb,
  LogOut,
  Search,
  Sparkles,
  User
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

// Import the new modal components
import UserProfileModal from './UserProfileModal';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  isActive?: boolean;
  badge?: number;
}

interface TopNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isDarkMode: boolean;
}

const TopNavigation: React.FC<TopNavigationProps> = ({
  activeTab,
  onTabChange,
  isDarkMode
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [notifications] = useState([
    { id: 1, message: 'Daily mood check completed', time: '2 mins ago', type: 'success' },
    { id: 2, message: 'New breathing exercise available', time: '1 hour ago', type: 'info' },
    { id: 3, message: 'Weekly wellness report ready', time: '3 hours ago', type: 'achievement' }
  ]);

  // Ensure component is mounted before using portals
  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems: NavItem[] = [
    { id: 'assessment', label: 'Assessment', icon: Brain, isActive: activeTab === 'assessment' },
    { id: 'interventions', label: 'Interventions', icon: Activity, isActive: activeTab === 'interventions' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, isActive: activeTab === 'analytics' },
    { id: 'insights', label: 'AI Insights', icon: Lightbulb, isActive: activeTab === 'insights' },
    { id: 'innovation', label: 'Innovation Hub', icon: Sparkles, isActive: activeTab === 'innovation' }
  ];

  const breadcrumbs = [
    { label: 'Home', icon: Home, href: '/' },
    { label: 'Dashboard', icon: Brain, href: '/dashboard' },
    { label: navItems.find(item => item.isActive)?.label || 'Assessment', icon: null }
  ];

  return (
    <div className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-all duration-300 ${
      isDarkMode 
        ? 'bg-slate-900/80 border-slate-700/50' 
        : 'bg-white/80 border-gray-200/50'
    }`}>
      {/* Main Navigation */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-3"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  MindScope
                </h1>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Mental Wellness Platform
                </p>
              </div>
            </motion.div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-2">
            {navItems.map((item, index) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => onTabChange(item.id)}
                className={`relative px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 ${
                  item.isActive
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                    : isDarkMode
                      ? 'text-gray-300 hover:text-white hover:bg-slate-700/50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="hidden md:inline">{item.label}</span>
                {item.badge && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </motion.button>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Advanced Search */}
            <div className="relative">
              <motion.div
                animate={{ width: isSearchFocused ? 320 : 240 }}
                className="relative"
              >
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="text"
                  placeholder="Search features, insights, exercises..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className={`w-full pl-10 pr-12 py-2.5 rounded-xl border transition-all duration-300 ${
                    isDarkMode
                      ? 'bg-slate-800 border-slate-600 text-white placeholder-gray-400 focus:border-purple-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                />
                <div className={`absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <Command className="w-3 h-3" />
                  <span className="text-xs">K</span>
                </div>
              </motion.div>
            </div>

            {/* Notifications */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-3 rounded-xl transition-all duration-300 ${
                  isDarkMode
                    ? 'bg-slate-800 text-gray-300 hover:text-white hover:bg-slate-700'
                    : 'bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                }`}
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </motion.button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className={`absolute right-0 top-full mt-2 w-80 rounded-xl shadow-xl border z-50 ${
                      isDarkMode
                        ? 'bg-slate-800 border-slate-600'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="p-4">
                      <h3 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Notifications
                      </h3>
                      <div className="space-y-3">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-3 rounded-lg ${
                              isDarkMode ? 'bg-slate-700/50' : 'bg-gray-50'
                            }`}
                          >
                            <p className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                              {notification.message}
                            </p>
                            <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {notification.time}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Menu */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowUserProfile(true)}
              className={`p-3 rounded-xl transition-all duration-300 ${
                isDarkMode
                  ? 'bg-slate-800 text-gray-300 hover:text-white hover:bg-slate-700'
                  : 'bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              }`}
              title="User Profile & Settings"
            >
              <User className="w-5 h-5" />
            </motion.button>

            {/* Logout Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                console.log('Logout clicked');
                // Add logout functionality here
                if (confirm('Are you sure you want to logout?')) {
                  // For now, redirect to home page
                  window.location.href = '/';
                }
              }}
              className={`p-3 rounded-xl transition-all duration-300 ${
                isDarkMode
                  ? 'bg-red-900/30 text-red-400 hover:text-red-300 hover:bg-red-900/50 border border-red-800/50'
                  : 'bg-red-50 text-red-600 hover:text-red-700 hover:bg-red-100 border border-red-200'
              }`}
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Breadcrumbs */}
        <div className="mt-4 flex items-center space-x-2">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              <div className="flex items-center space-x-2">
                {crumb.icon && <crumb.icon className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />}
                <span className={`text-sm ${
                  index === breadcrumbs.length - 1
                    ? isDarkMode ? 'text-white font-medium' : 'text-gray-900 font-medium'
                    : isDarkMode ? 'text-gray-400 hover:text-white cursor-pointer' : 'text-gray-500 hover:text-gray-900 cursor-pointer'
                }`}>
                  {crumb.label}
                </span>
              </div>
              {index < breadcrumbs.length - 1 && (
                <ArrowRight className={`w-3 h-3 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Modals */}
      {mounted && showUserProfile && createPortal(
        <UserProfileModal 
          isOpen={showUserProfile}
          onClose={() => setShowUserProfile(false)}
          isDarkMode={isDarkMode}
        />,
        document.body
      )}
    </div>
  );
};

export default TopNavigation;
