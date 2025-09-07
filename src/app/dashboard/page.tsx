'use client';

import { motion } from 'framer-motion';
import {
    ArrowRight,
    Bot,
    Brain,
    Camera,
    Eye,
    Heart,
    Layout,
    MessageSquare,
    Mic,
    Monitor,
    Moon,
    Phone,
    Shield,
    Sun,
    Target,
    TreePine,
    Trophy,
    Wind,
    Zap
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';

import { MetricsDashboard } from '@/components/AnimatedMetrics';
import EnhancedErrorBoundary from '@/components/EnhancedErrorBoundary';
import { SkeletonDashboard } from '@/components/Skeleton';
import { SuspenseWrapper } from '@/components/SuspenseWrapper';
import TopNavigation from '@/components/TopNavigation';
import WellnessAnalytics from '@/components/WellnessAnalytics';

// BUNCH 4: Advanced Features Integration
import {
    LayoutControlPanel,
    LayoutProvider
} from '@/components/CustomizableLayout';
import KeyboardShortcuts from '@/components/KeyboardShortcuts';
import {
    NotificationContainer,
    NotificationProvider,
    useNotificationHelpers
} from '@/components/NotificationSystem';

// Import components directly to avoid React.lazy issues
import ChatSupportModal from '@/components/ChatSupportModal';
import RealBreathingExercise from '@/components/RealBreathingExercise';
import RealGamificationSystem from '@/components/RealGamificationSystem';
import VoiceControls from '@/components/VoiceControls';
import WellnessHub from '@/components/WellnessHub';
import ZenSpace from '@/components/ZenSpace';

// BUNCH 5: AI Innovation Features
import AIRecommendations from '@/components/AIRecommendations';
import PredictiveAnalytics from '@/components/PredictiveAnalytics';
import RealTimeCollaboration from '@/components/RealTimeCollaboration';
import VoiceCommands from '@/components/VoiceCommands';

// Import 3D components with error boundaries
import BrainVisualizer from '@/components/3d/BrainVisualizer';
import TherapeuticEnvironment from '@/components/3d/TherapeuticEnvironment';

// Live Chat Support Widget Component
const LiveChatSupportWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeFeature, setActiveFeature] = useState<number | null>(null);

  // Detect dark mode from system or user preference
  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(darkModeMediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    darkModeMediaQuery.addEventListener('change', handler);
    
    return () => darkModeMediaQuery.removeEventListener('change', handler);
  }, []);

  const features = [
    {
      icon: MessageSquare,
      title: 'Live Chat',
      description: 'Instant messaging with experts',
      color: 'from-cyan-400 to-blue-600',
      bgGradient: 'from-cyan-50 to-blue-50 dark:from-cyan-950/50 to-blue-950/50',
      iconColor: 'text-cyan-500 dark:text-cyan-400',
      borderColor: 'border-cyan-200 dark:border-cyan-800'
    },
    {
      icon: Phone,
      title: 'Voice Calls',
      description: 'Talk to counselors directly',
      color: 'from-violet-400 to-purple-600',
      bgGradient: 'from-violet-50 to-purple-50 dark:from-violet-950/50 to-purple-950/50',
      iconColor: 'text-violet-500 dark:text-violet-400',
      borderColor: 'border-violet-200 dark:border-violet-800'
    },
    {
      icon: Bot,
      title: 'AI Assistant',
      description: '24/7 intelligent support',
      color: 'from-emerald-400 to-green-600',
      bgGradient: 'from-emerald-50 to-green-50 dark:from-emerald-950/50 to-green-950/50',
      iconColor: 'text-emerald-500 dark:text-emerald-400',
      borderColor: 'border-emerald-200 dark:border-emerald-800'
    }
  ];

  return (
    <div className="relative p-8 bg-gradient-to-br from-white via-slate-50 to-gray-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30 dark:opacity-20">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 animate-pulse"></div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 space-y-8"
      >
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="relative"
          >
            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <MessageSquare className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            </div>
          </motion.div>
          
          <div className="space-y-3">
            <motion.h3 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent"
            >
              24/7 Mental Health Support
            </motion.h3>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600 dark:text-gray-300 max-w-lg mx-auto leading-relaxed"
            >
              Connect instantly with qualified mental health professionals and AI-powered support assistants
            </motion.p>
          </div>
        </div>

        {/* Feature Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                onMouseEnter={() => setActiveFeature(index)}
                onMouseLeave={() => setActiveFeature(null)}
                className={`
                  relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300
                  bg-gradient-to-br ${feature.bgGradient}
                  ${feature.borderColor}
                  ${activeFeature === index ? 'scale-105 shadow-2xl' : 'shadow-lg hover:shadow-xl'}
                  backdrop-blur-sm
                `}
              >
                <div className="text-center space-y-4">
                  <motion.div
                    animate={{
                      scale: activeFeature === index ? 1.1 : 1,
                      rotate: activeFeature === index ? 5 : 0
                    }}
                    transition={{ duration: 0.2 }}
                    className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center shadow-lg`}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </motion.div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-lg">
                      {feature.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
                
                {/* Hover Effect */}
                {activeFeature === index && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border-2 border-blue-300 dark:border-blue-600"
                  />
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTA Button */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center"
        >
          <motion.button
            onClick={() => setIsOpen(true)}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="group relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white px-10 py-4 rounded-2xl font-bold shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 flex items-center space-x-3 mx-auto overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <MessageSquare className="w-5 h-5 z-10 group-hover:animate-bounce" />
            <span className="z-10 text-lg">Start Live Chat</span>
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] skew-x-12 group-hover:translate-x-[100%] transition-transform duration-700"></div>
          </motion.button>
        </motion.div>

        {/* Status Indicators */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex items-center justify-center space-x-8 text-sm"
        >
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
            <div className="relative">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping opacity-75"></div>
            </div>
            <span className="font-medium">Available 24/7</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
            <Shield className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            <span className="font-medium">Confidential & Secure</span>
          </div>
        </motion.div>
      </motion.div>

      <ChatSupportModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        isDarkMode={isDarkMode} 
      />
    </div>
  );
};

// Component renderer without suspense (using direct imports now)
const ComponentRenderer = ({ component, title }: { component: React.ReactNode; title: string }) => (
  <div className="w-full h-full">
    {component}
  </div>
);

// AI Therapist Suite Component
const AITherapistSuite = ({ isDarkMode = false }: { isDarkMode?: boolean }) => {
  const router = useRouter();
  
  const startTherapy = () => {
    router.push('/therapy/ai-therapist');
  };

  return (
    <div className="p-8 space-y-12">
      {/* Multilingual AI Therapist Hero */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl mb-6">
          <Bot className="w-10 h-10 text-white" />
        </div>
        <h2 className={`text-4xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          Multilingual AI Therapist with Cultural Adaptation
        </h2>
        <h3 className={`text-2xl font-semibold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent`}>
          Global Mental Health In Your Language
        </h3>
        <p className={`text-lg max-w-4xl mx-auto leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Advanced AI therapist with comprehensive multilingual support, cultural sensitivity, and safety 
          systems. Get personalized therapeutic interventions in 7+ languages with culturally adapted 
          approaches, real-time crisis detection, and localized emergency resources.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className={`backdrop-blur-sm rounded-2xl p-6 border ${
          isDarkMode 
            ? 'bg-gradient-to-br from-purple-600/20 to-blue-600/20 border-purple-500/30' 
            : 'bg-gradient-to-br from-purple-100/80 to-blue-100/80 border-purple-200'
        }`}>
          <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Advanced AI Recognition</h3>
          <p className={`leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Revolutionary 7-point emotion detection with 95%+ accuracy using cutting-edge facial analysis algorithms.</p>
        </div>
        
        <div className={`backdrop-blur-sm rounded-2xl p-6 border ${
          isDarkMode 
            ? 'bg-gradient-to-br from-pink-600/20 to-rose-600/20 border-pink-500/30' 
            : 'bg-gradient-to-br from-pink-100/80 to-rose-100/80 border-pink-200'
        }`}>
          <div className="w-14 h-14 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mb-6">
            <Heart className="w-7 h-7 text-white" />
          </div>
          <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Real-Time Emotional Insights</h3>
          <p className={`leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Continuous monitoring of micro-expressions, authenticity markers, and emotional intensity fluctuations.</p>
        </div>
        
        <div className={`backdrop-blur-sm rounded-2xl p-6 border ${
          isDarkMode 
            ? 'bg-gradient-to-br from-green-600/20 to-emerald-600/20 border-green-500/30' 
            : 'bg-gradient-to-br from-green-100/80 to-emerald-100/80 border-green-200'
        }`}>
          <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6">
            <Target className="w-7 h-7 text-white" />
          </div>
          <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Personalized Questioning</h3>
          <p className={`leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Adaptive therapeutic questions that respond intelligently to your current emotional state and patterns.</p>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="text-center">
        <h3 className={`text-2xl font-bold mb-8 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>How It Works</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Camera className="w-8 h-8 text-white" />
            </div>
            <h4 className={`font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Camera Activation</h4>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Secure camera access for real-time analysis</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Eye className="w-8 h-8 text-white" />
            </div>
            <h4 className={`font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Face Detection</h4>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Advanced AI identifies facial landmarks</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h4 className={`font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Emotion Analysis</h4>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>7-point emotion classification in real-time</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <h4 className={`font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Adaptive Questions</h4>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Personalized therapeutic guidance</p>
          </div>
        </div>
      </div>

      {/* Start Live Analysis Button */}
      <div className="text-center">
        <motion.button
          onClick={startTherapy}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-12 py-4 rounded-2xl shadow-xl transition-all duration-300 inline-flex items-center space-x-3 text-lg"
        >
          <span>Start Live Analysis</span>
          <ArrowRight className="w-6 h-6" />
        </motion.button>
      </div>
    </div>
  );
};

// Voice Assistant Suite Component
const VoiceAssistantSuite = ({ isDarkMode = false, onVoiceCommand }: { isDarkMode?: boolean; onVoiceCommand?: (command: string, action: string) => void }) => (
  <div className="space-y-6">
    <div className={`backdrop-blur-sm rounded-2xl p-4 ${
      isDarkMode ? 'bg-slate-800/50' : 'bg-white/10'
    }`}>
      <h3 className={`text-lg font-semibold mb-4 ${
        isDarkMode ? 'text-white' : 'text-white'
      }`}>Voice Interface</h3>
      <VoiceControls />
    </div>
    <div className={`backdrop-blur-sm rounded-2xl p-4 ${
      isDarkMode ? 'bg-slate-800/50' : 'bg-white/10'
    }`}>
      <h3 className={`text-lg font-semibold mb-4 ${
        isDarkMode ? 'text-white' : 'text-white'
      }`}>Voice Commands</h3>
      <VoiceCommands isDarkMode={isDarkMode} onCommand={onVoiceCommand} />
    </div>
  </div>
);

// Main Assessment Component
const WellnessAssessment = ({ userStats, isDarkMode }: { userStats: any; isDarkMode: boolean }) => {
  const [selectedAssessment, setSelectedAssessment] = useState('emotion');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute for the assessment overview
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Create component factory function for emotion detection
  const createEmotionDetectionComponent = (isDarkMode: boolean) => (
    <div className="p-8 space-y-12">
      {/* Revolutionary Emotion Analysis Hero */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl mb-6">
          <Brain className="w-10 h-10 text-white" />
        </div>
        <h2 className={`text-4xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          Revolutionary Emotion Analysis
        </h2>
        <p className={`text-lg max-w-4xl mx-auto leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Experience the most advanced real-time facial emotion detection system. Gain deep 
          insights into your emotional patterns with AI-powered analysis and personalized 
          therapeutic guidance.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className={`backdrop-blur-sm rounded-2xl p-6 border ${
          isDarkMode 
            ? 'bg-gradient-to-br from-purple-600/20 to-blue-600/20 border-purple-500/30' 
            : 'bg-gradient-to-br from-purple-100/80 to-blue-100/80 border-purple-200'
        }`}>
          <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Advanced AI Recognition</h3>
          <p className={`leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Revolutionary 7-point emotion detection with 95%+ accuracy using cutting-edge facial analysis algorithms.</p>
        </div>
        
        <div className={`backdrop-blur-sm rounded-2xl p-6 border ${
          isDarkMode 
            ? 'bg-gradient-to-br from-pink-600/20 to-rose-600/20 border-pink-500/30' 
            : 'bg-gradient-to-br from-pink-100/80 to-rose-100/80 border-pink-200'
        }`}>
          <div className="w-14 h-14 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mb-6">
            <Heart className="w-7 h-7 text-white" />
          </div>
          <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Real-Time Emotional Insights</h3>
          <p className={`leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Continuous monitoring of micro-expressions, authenticity markers, and emotional intensity fluctuations.</p>
        </div>
        
        <div className={`backdrop-blur-sm rounded-2xl p-6 border ${
          isDarkMode 
            ? 'bg-gradient-to-br from-green-600/20 to-emerald-600/20 border-green-500/30' 
            : 'bg-gradient-to-br from-green-100/80 to-emerald-100/80 border-green-200'
        }`}>
          <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6">
            <Target className="w-7 h-7 text-white" />
          </div>
          <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Personalized Questioning</h3>
          <p className={`leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Adaptive therapeutic questions that respond intelligently to your current emotional state and patterns.</p>
        </div>
      </div>

      {/* How It Works */}
      <div>
        <h3 className={`text-3xl font-bold mb-10 text-center ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>How It Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl flex items-center justify-center bg-gradient-to-r from-purple-600 to-blue-600">
              <Camera className="w-9 h-9 text-white" />
            </div>
            <h4 className={`text-lg font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Camera Activation</h4>
            <p className={`leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Secure camera access for real-time analysis</p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl flex items-center justify-center bg-gradient-to-r from-purple-600 to-blue-600">
              <Eye className="w-9 h-9 text-white" />
            </div>
            <h4 className={`text-lg font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Face Detection</h4>
            <p className={`leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Advanced AI identifies facial landmarks</p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl flex items-center justify-center bg-gradient-to-r from-purple-600 to-blue-600">
              <Brain className="w-9 h-9 text-white" />
            </div>
            <h4 className={`text-lg font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Emotion Analysis</h4>
            <p className={`leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>7-point emotion classification in real-time</p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl flex items-center justify-center bg-gradient-to-r from-purple-600 to-blue-600">
              <MessageSquare className="w-9 h-9 text-white" />
            </div>
            <h4 className={`text-lg font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Adaptive Questions</h4>
            <p className={`leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Personalized therapeutic guidance</p>
          </div>
        </div>
      </div>
      
      <div className="text-center pt-8">
        <a href="/emotion-analysis" className="inline-flex items-center bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-8 rounded-xl shadow-2xl transition-all duration-300 hover:scale-105">
          <span>Start Live Analysis</span>
          <ArrowRight className="w-6 h-6 ml-2" />
        </a>
      </div>
    </div>
  );

  const assessments = [
    {
      id: 'emotion',
      title: 'Emotion Detection',
      icon: Eye,
      description: 'AI-powered facial emotion analysis',
      gradient: 'from-purple-500 to-pink-500',
      component: createEmotionDetectionComponent(isDarkMode)
    },
    {
      id: 'ai-therapist',
      title: 'AI Therapist',
      icon: Bot,
      description: 'Multilingual AI therapist with cultural adaptation',
      gradient: 'from-blue-500 to-purple-500',
      component: <AITherapistSuite />
    },
    {
      id: 'chat-support',
      title: 'Live Chat Support',
      icon: MessageSquare,
      description: 'Get instant help from our mental health experts',
      gradient: 'from-blue-500 to-purple-500',
      component: <LiveChatSupportWidget />
    },
    {
      id: 'brain',
      title: 'Neural Activity',
      icon: Brain,
      description: 'Brain visualization and neural patterns',
      gradient: 'from-blue-500 to-indigo-500',
      component: <BrainVisualizer moodLevel={userStats.moodScore} stressLevel={userStats.stressLevel} energyLevel={userStats.energyLevel} />
    }
    
  ];

  const renderAssessmentContent = () => {
    const selectedItem = assessments.find(a => a.id === selectedAssessment);
    
    if (!selectedItem) {
      return (
        <div className={`p-8 text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          <div className="w-16 h-16 mx-auto mb-4 opacity-50">🧠</div>
          <p>Select an assessment to begin analyzing your wellness</p>
        </div>
      );
    }

    // Return the component directly - it already has isDarkMode baked in
    return selectedItem.component || (
      <div className={`p-8 text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        <div className="w-16 h-16 mx-auto mb-4 opacity-50">🧠</div>
        <p>Component not available</p>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Today's Wellness Overview - Only in Assessment Tab */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`backdrop-blur-md rounded-2xl p-6 ${
          isDarkMode ? 'bg-slate-800/50 border-slate-600' : 'bg-white/40 border-white/20'
        } border shadow-xl`}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Today&apos;s Wellness Overview
            </h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className={`text-right ${isDarkMode ? 'text-gray-200' : 'text-gray-600'}`}>
            <div className="text-3xl font-bold">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
        
        {/* Enhanced Animated Wellness Score Cards */}
        <div className="mt-6">
          <MetricsDashboard isDarkMode={isDarkMode} />
        </div>
      </motion.div>

      {/* Assessment Content */}
      <div className="p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h1 
              className="text-3xl font-bold"
              style={{ color: isDarkMode ? '#ffffff' : '#1f2937' }}
            >
              Wellness Assessment
            </h1>
          </div>
        <p 
          className="text-lg"
          style={{ color: isDarkMode ? '#ffffff' : '#4b5563' }}
        >
          Comprehensive analysis of your mental and physical wellness
        </p>
      </motion.div>

      {/* Assessment Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {assessments.map((assessment, index) => (
          <motion.button
            key={assessment.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => setSelectedAssessment(assessment.id)}
            className={`p-6 rounded-2xl transition-all duration-300 flex flex-col items-center justify-center min-h-[140px] ${
              selectedAssessment === assessment.id
                ? `bg-gradient-to-r ${assessment.gradient} text-white shadow-lg scale-105`
                : isDarkMode
                  ? 'bg-slate-800/50 text-gray-300 hover:bg-slate-700/50 border border-slate-700'
                  : 'bg-white text-gray-600 hover:bg-gray-50 shadow-md border border-gray-200'
            }`}
          >
            <assessment.icon className="w-8 h-8 mb-3" />
            <div className="text-sm font-medium text-center leading-tight">
              {assessment.title}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Selected Assessment Content */}
      <motion.div
        key={selectedAssessment}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className={`p-4 rounded-2xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-white'} shadow-xl border ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}
      >
        <ComponentRenderer 
          component={renderAssessmentContent()} 
          title={assessments.find(a => a.id === selectedAssessment)?.title || 'Assessment'} 
        />
      </motion.div>
      </div>
    </div>
  );
};

// Main Interventions Component  
const WellnessInterventions = ({ isDarkMode = false, onVoiceCommand }: { isDarkMode?: boolean; onVoiceCommand?: (command: string, action: string) => void }) => {
  const [selectedIntervention, setSelectedIntervention] = useState('breathing');

  const userStats = {
    moodScore: 7,
    stressLevel: 4,
    energyLevel: 6,
    focusScore: 8
  };

  const interventions = [
    {
      id: 'breathing',
      title: 'Breathing Exercises',
      icon: Wind,
      description: 'Guided breathing techniques for relaxation and stress relief',
      gradient: 'from-teal-500 to-green-500',
      component: <RealBreathingExercise />
    },
    {
      id: 'meditation',
      title: 'Zen Space',
      icon: TreePine,
      description: 'Peaceful meditation environment with ambient sounds',
      gradient: 'from-indigo-500 to-purple-500',
      component: <ZenSpace />
    },
    {
      id: 'mood-suite',
      title: 'AI Therapist Suite',
      icon: Bot,
      description: 'Complete AI therapy: voice chat, mood tracking, and therapeutic insights',
      gradient: 'from-blue-500 to-purple-500',
      component: <AITherapistSuite />
    },
    {
      id: 'therapy',
      title: 'VR Therapy',
      icon: Monitor,
      description: 'Immersive therapeutic environments for mental wellness',
      gradient: 'from-violet-500 to-purple-500',
      component: <TherapeuticEnvironment theme="zen" ambientSoundLevel={0.5} interactivity={true} />
    },
    {
      id: 'voice-assistant',
      title: 'Voice Assistant',
      icon: Mic,
      description: 'Comprehensive voice controls and commands for hands-free wellness',
      gradient: 'from-blue-500 to-cyan-500',
      component: <VoiceAssistantSuite isDarkMode={isDarkMode} onVoiceCommand={onVoiceCommand} />
    },
    {
      id: 'gamification',
      title: 'Wellness Games',
      icon: Trophy,
      description: 'Gamified wellness activities and achievements',
      gradient: 'from-yellow-500 to-orange-500',
      component: <RealGamificationSystem />
    },
    {
      id: 'wellness-hub',
      title: 'Wellness Hub',
      icon: Heart,
      description: 'Comprehensive wellness dashboard with all your metrics',
      gradient: 'from-emerald-500 to-teal-500',
      component: <WellnessHub />
    }
  ];

  const renderInterventionContent = () => {
    const selectedItem = interventions.find(i => i.id === selectedIntervention);
    
    if (!selectedItem) {
      return (
        <div className={`p-8 text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          <div className="w-16 h-16 mx-auto mb-4 opacity-50">⚡</div>
          <p>Select an intervention to begin your wellness journey</p>
        </div>
      );
    }

    // Clone the component and inject dark mode props
    const componentWithProps = selectedItem.component ? 
      React.cloneElement(selectedItem.component as React.ReactElement, { isDarkMode }) 
      : null;

    return componentWithProps || (
      <div className={`p-8 text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        <div className="w-16 h-16 mx-auto mb-4 opacity-50">⚡</div>
        <p>Component not available</p>
      </div>
    );
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-50'
    }`}>
      {/* Animated Background Pattern */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(120,119,198,0.1),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,119,198,0.1),transparent_70%)]" />
      </div>

      <div className="relative z-10 p-6 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative text-center mb-12 overflow-hidden"
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className={`absolute top-0 left-1/4 w-32 h-32 rounded-full ${
            isDarkMode ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gradient-to-r from-blue-400 to-purple-400'
          } animate-pulse`} />
          <div className={`absolute bottom-0 right-1/4 w-24 h-24 rounded-full ${
            isDarkMode ? 'bg-gradient-to-r from-cyan-500 to-blue-500' : 'bg-gradient-to-r from-green-400 to-cyan-400'
          } animate-pulse delay-700`} />
        </div>

        <div className="relative z-10">
          {/* Enhanced Header Icon */}
          <div className="inline-flex items-center justify-center mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className={`w-16 h-16 rounded-2xl flex items-center justify-center relative ${
                isDarkMode 
                  ? 'bg-gradient-to-br from-green-500 via-blue-500 to-purple-500' 
                  : 'bg-gradient-to-br from-green-400 via-blue-400 to-purple-400'
              } shadow-2xl`}
            >
              <Zap className="w-8 h-8 text-white relative z-10" />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent" />
            </motion.div>
          </div>

          {/* Enhanced Typography */}
          <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${
            isDarkMode 
              ? 'bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent' 
              : 'bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent'
          }`}>
            Wellness Interventions
          </h1>
          
          <p className={`text-lg md:text-xl max-w-2xl mx-auto leading-relaxed ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Personalized tools and techniques for your{' '}
            <span className={`font-semibold ${
              isDarkMode ? 'text-purple-300' : 'text-purple-600'
            }`}>
              wellness journey
            </span>
          </p>

          {/* Quick Stats */}
          <div className="flex items-center justify-center space-x-8 mt-8">
            {[
              { label: 'Active Tools', value: interventions.length, icon: '🛠️' },
              { label: 'Success Rate', value: '94%', icon: '📈' },
              { label: 'Users Helped', value: '12K+', icon: '👥' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className={`text-center p-3 rounded-xl ${
                  isDarkMode 
                    ? 'bg-slate-800/50 border border-slate-700/50' 
                    : 'bg-white/60 border border-gray-200/50'
                } backdrop-blur-sm`}
              >
                <div className="text-lg mb-1">{stat.icon}</div>
                <div className={`text-lg font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {stat.value}
                </div>
                <div className={`text-xs ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Intervention Navigation - Enhanced UI */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 mb-8">
        {interventions.map((intervention, index) => (
          <motion.button
            key={intervention.id}
            data-intervention={intervention.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => setSelectedIntervention(intervention.id)}
            className={`group relative overflow-hidden p-6 rounded-3xl transition-all duration-500 flex flex-col items-center justify-center min-h-[140px] transform hover:scale-105 ${
              selectedIntervention === intervention.id
                ? `bg-gradient-to-br ${intervention.gradient} text-white shadow-2xl shadow-blue-500/25 scale-105`
                : isDarkMode
                  ? 'bg-gradient-to-br from-slate-800/80 via-slate-700/60 to-slate-800/80 text-gray-300 hover:from-slate-700/80 hover:via-slate-600/60 hover:to-slate-700/80 border border-slate-600/50 backdrop-blur-sm'
                  : 'bg-gradient-to-br from-white/90 via-gray-50/70 to-white/90 text-gray-600 hover:from-gray-50/90 hover:via-white/70 hover:to-gray-50/90 shadow-xl border border-gray-200/50 backdrop-blur-sm'
            }`}
          >
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className={`absolute inset-0 bg-gradient-to-br ${intervention.gradient} ${
                selectedIntervention === intervention.id ? 'opacity-20' : 'opacity-0 group-hover:opacity-10'
              } transition-opacity duration-500`} />
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-white/20 to-transparent rounded-bl-full" />
            </div>

            {/* Floating Icon with Glow */}
            <div className={`relative z-10 p-4 rounded-2xl mb-3 transition-all duration-300 ${
              selectedIntervention === intervention.id
                ? 'bg-white/20 shadow-lg backdrop-blur-sm'
                : isDarkMode
                  ? 'bg-slate-700/50 group-hover:bg-slate-600/50'
                  : 'bg-gray-100/70 group-hover:bg-white/80'
            }`}>
              <intervention.icon className={`w-7 h-7 transition-all duration-300 ${
                selectedIntervention === intervention.id
                  ? 'text-white transform scale-110'
                  : isDarkMode
                    ? 'text-gray-300 group-hover:text-white'
                    : 'text-gray-600 group-hover:text-gray-800'
              }`} />
              
              {/* Pulse effect for selected item */}
              {selectedIntervention === intervention.id && (
                <div className="absolute inset-0 rounded-2xl bg-white/20 animate-pulse" />
              )}
            </div>

            {/* Enhanced Typography */}
            <div className="relative z-10 text-center">
              <div className={`text-sm font-bold leading-tight mb-1 transition-all duration-300 ${
                selectedIntervention === intervention.id
                  ? 'text-white'
                  : isDarkMode
                    ? 'text-gray-200 group-hover:text-white'
                    : 'text-gray-800 group-hover:text-gray-900'
              }`}>
                {intervention.title}
              </div>
              <div className={`text-xs leading-tight transition-all duration-300 ${
                selectedIntervention === intervention.id
                  ? 'text-white/80'
                  : isDarkMode
                    ? 'text-gray-400 group-hover:text-gray-300'
                    : 'text-gray-500 group-hover:text-gray-600'
              }`}>
                {intervention.description}
              </div>
            </div>

            {/* Selection Indicator */}
            {selectedIntervention === intervention.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-3 right-3 w-3 h-3 bg-white rounded-full shadow-lg"
              />
            )}

            {/* Hover Glow Effect */}
            <div className={`absolute inset-0 rounded-3xl transition-all duration-500 ${
              selectedIntervention === intervention.id
                ? `shadow-2xl shadow-blue-500/20`
                : 'group-hover:shadow-xl group-hover:shadow-purple-500/10'
            }`} />
          </motion.button>
        ))}
      </div>

      {/* Selected Intervention Content - Enhanced Container */}
      <motion.div
        key={selectedIntervention}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className={`relative overflow-hidden rounded-3xl border backdrop-blur-md ${
          isDarkMode 
            ? 'bg-gradient-to-br from-slate-900/90 via-slate-800/60 to-slate-900/90 border-slate-700/50 shadow-2xl' 
            : 'bg-gradient-to-br from-white/95 via-gray-50/80 to-white/95 border-gray-200/50 shadow-xl'
        }`}
      >
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 animate-pulse" />
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,rgba(120,119,198,0.3),transparent_50%)]" />
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_70%,rgba(255,119,198,0.2),transparent_50%)]" />
        </div>

        {/* Content Header */}
        <div className={`relative z-10 p-6 border-b ${
          isDarkMode ? 'border-slate-700/50' : 'border-gray-200/50'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {(() => {
                const selectedItem = interventions.find(i => i.id === selectedIntervention);
                const IconComponent = selectedItem?.icon || Zap;
                return (
                  <>
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${
                      selectedItem?.gradient || 'from-gray-500 to-gray-600'
                    } shadow-lg`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {selectedItem?.title || 'Wellness Tool'}
                      </h3>
                      <p className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {selectedItem?.description || 'Enhance your wellness journey'}
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>
            
            {/* Status Indicator */}
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${
              isDarkMode 
                ? 'bg-green-900/30 text-green-300 border border-green-700/50' 
                : 'bg-green-100 text-green-700 border border-green-200'
            }`}>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>Active</span>
            </div>
          </div>
        </div>

        {/* Enhanced Content Area */}
        <div className="relative z-10 p-6">
          <ComponentRenderer 
            component={renderInterventionContent()} 
            title={interventions.find(i => i.id === selectedIntervention)?.title || 'Intervention'} 
          />
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-full" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-500/5 to-transparent rounded-tr-full" />
      </motion.div>
      </div>
    </div>
  );
};

// Enhanced Dashboard Component with Advanced Features
function DashboardContent() {
  const [activeFeature, setActiveFeature] = useState('assessment');
  const [activeTab, setActiveTab] = useState('assessment');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMounted, setIsMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const router = useRouter();
  const [isMinimized, setIsMinimized] = useState(false);
  const [userStats, setUserStats] = useState({
    moodScore: 7.2,
    stressLevel: 4.1,
    energyLevel: 6.8,
    focusScore: 5.9,
    dailyMood: 72,
    weeklyGoals: 85,
    overallWellness: 68,
    streakDays: 12
  });

  // Notification helpers for user interactions
  const notifications = useNotificationHelpers();

  const getOverallWellnessScore = () => {
    const scores = [
      userStats.moodScore,
      10 - userStats.stressLevel,
      userStats.energyLevel,
      userStats.focusScore
    ];
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setActiveFeature(tab);
    // Remove tab change notifications to prevent spam
  };

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    console.log('Dark mode toggled:', newMode); // Debug log
    
    // Smart notification for theme toggle (only once per session)
    const themeNotificationKey = 'theme-notification-shown';
    if (!sessionStorage.getItem(themeNotificationKey)) {
      notifications.info(
        'Theme Updated',
        `Switched to ${newMode ? 'dark' : 'light'} mode`
      );
      sessionStorage.setItem(themeNotificationKey, 'true');
    }
  };

  // Voice command handler
  const handleVoiceCommand = useCallback((command: string, action: string) => {
    console.log(`Dashboard received voice command: ${command} -> ${action}`);
    
    // Handle navigation commands in the dashboard context
    switch (action) {
      case 'navigate_dashboard':
        setActiveTab('assessment');
        setActiveFeature('assessment');
        notifications.success('Dashboard', 'Navigated to main dashboard');
        break;
      case 'navigate_mood':
        setActiveTab('mood');
        setActiveFeature('mood');
        notifications.success('Mood Tracker', 'Switched to mood tracking');
        break;
      case 'navigate_therapy':
        notifications.success('Therapy', 'Navigating to therapy session...');
        router.push('/therapy');
        break;
      case 'navigate_community':
        notifications.success('Community', 'Opening community page...');
        router.push('/community');
        break;
      case 'navigate_vr':
        notifications.success('VR Experience', 'Launching virtual reality...');
        router.push('/vr');
        break;
      case 'navigate_emotion':
        notifications.success('Emotion Analysis', 'Opening emotion detection...');
        router.push('/emotion-analysis');
        break;
      case 'navigate_demo':
        notifications.success('Demo', 'Opening demo page...');
        router.push('/demo');
        break;
      case 'navigate_onboarding':
        notifications.success('Onboarding', 'Starting onboarding process...');
        router.push('/onboarding');
        break;
      case 'navigate_breathing':
        setActiveTab('breathing');
        setActiveFeature('breathing');
        notifications.success('Breathing Exercise', 'Starting breathing session');
        break;
      case 'start_breathing':
        setActiveTab('breathing');
        setActiveFeature('breathing');
        notifications.success('Breathing', 'Starting guided breathing exercise');
        break;
      case 'toggle_theme':
        toggleDarkMode();
        break;
      default:
        console.log('Unhandled voice command action:', action);
    }
  }, [router, notifications, toggleDarkMode]);

  useEffect(() => {
    setIsMounted(true);
    
    // Check localStorage first, then auto-detect based on time
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode !== null) {
      setIsDarkMode(savedMode === 'true');
    } else {
      const hour = new Date().getHours();
      const autoMode = hour < 8 || hour > 20;
      setIsDarkMode(autoMode);
      localStorage.setItem('darkMode', autoMode.toString());
    }
    
    const clockTimer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // Welcome notification (only once per session)
    const hasShownWelcome = sessionStorage.getItem('mindscope-welcome-shown');
    if (!hasShownWelcome) {
      setTimeout(() => {
        notifications.achievement(
          'Welcome to MindScope Pro!',
          'Advanced dashboard features active. Press Ctrl+/ for shortcuts.'
        );
        sessionStorage.setItem('mindscope-welcome-shown', 'true');
      }, 2000);
    }

    // Chat Support Resource Event Listeners
    const handleSelfCareToolkit = () => {
      setActiveTab('interventions');
      setActiveFeature('interventions');
      // Use a timeout to ensure the tab switch completes before scrolling
      setTimeout(() => {
        const breathingBtn = document.querySelector('[data-intervention="breathing"]') as HTMLButtonElement;
        breathingBtn?.click();
      }, 100);
      notifications.info('Self-Care Toolkit', 'Opening breathing exercises and wellness tools');
    };

    const handleGuidedMeditations = () => {
      setActiveTab('interventions');
      setActiveFeature('interventions');
      setTimeout(() => {
        const meditationBtn = document.querySelector('[data-intervention="meditation"]') as HTMLButtonElement;
        meditationBtn?.click();
      }, 100);
      notifications.info('Guided Meditations', 'Opening Zen Space for meditation');
    };

    const handleBreathingExercises = () => {
      setActiveTab('interventions');
      setActiveFeature('interventions');
      setTimeout(() => {
        const breathingBtn = document.querySelector('[data-intervention="breathing"]') as HTMLButtonElement;
        breathingBtn?.click();
      }, 100);
      notifications.info('Breathing Exercises', 'Opening guided breathing techniques');
    };

    // Add event listeners
    window.addEventListener('openSelfCareToolkit', handleSelfCareToolkit);
    window.addEventListener('openGuidedMeditations', handleGuidedMeditations);
    window.addEventListener('openBreathingExercises', handleBreathingExercises);
    
    return () => {
      clearInterval(clockTimer);
      // Cleanup event listeners
      window.removeEventListener('openSelfCareToolkit', handleSelfCareToolkit);
      window.removeEventListener('openGuidedMeditations', handleGuidedMeditations);
      window.removeEventListener('openBreathingExercises', handleBreathingExercises);
    };
  }, [notifications]);

  type WellnessFeature = {
    id: string;
    title: string;
    icon: React.ComponentType<any>;
    description: string;
    gradient: string;
    color: string;
    href?: string;
  };

  // Legacy feature structure - keeping for compatibility but not displaying
  const wellnessFeatures: WellnessFeature[] = [];

  const renderActiveContent = () => {
    switch (activeTab) {
      case 'assessment':
        return <WellnessAssessment userStats={userStats} isDarkMode={isDarkMode} />;
      case 'interventions':
        return <WellnessInterventions isDarkMode={isDarkMode} onVoiceCommand={handleVoiceCommand} />;
      case 'analytics':
        return (
          <SuspenseWrapper 
            isDarkMode={isDarkMode}
            loadingMessage="Loading analytics dashboard..."
            showProgress={true}
          >
            <WellnessAnalytics isDarkMode={isDarkMode} />
          </SuspenseWrapper>
        );
      case 'insights':
        return (
          <div className="space-y-6">
            <AIRecommendations isDarkMode={isDarkMode} userStats={userStats} />
            <PredictiveAnalytics isDarkMode={isDarkMode} historicalData={{
              mood: [6, 7, 5, 8, 6, 7, 8],
              stress: [4, 3, 6, 2, 5, 3, 4],
              energy: [7, 6, 5, 8, 7, 6, 7],
              focus: [8, 7, 9, 6, 8, 9, 8]
            }} />
          </div>
        );
      case 'innovation':
        return (
          <div className="space-y-6">
            <VoiceCommands isDarkMode={isDarkMode} onCommand={handleVoiceCommand} />
            <RealTimeCollaboration isDarkMode={isDarkMode} currentUser={{
              id: 'user-1',
              name: 'You',
              avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
            }} />
          </div>
        );
      default:
        return <WellnessAssessment userStats={userStats} isDarkMode={isDarkMode} />;
    }
  };

  if (!isMounted) {
    return (
      <SuspenseWrapper 
        isDarkMode={isDarkMode}
        loadingMessage="Initializing your personalized dashboard..."
        showProgress={true}
      >
        <SkeletonDashboard isDarkMode={isDarkMode} />
      </SuspenseWrapper>
    );
  }

  return (
    <EnhancedErrorBoundary
      isDarkMode={isDarkMode}
      onError={(error: Error, errorInfo: any) => {
        console.error('Dashboard Error:', error, errorInfo);
        notifications.error(
          'Dashboard Error',
          'An unexpected error occurred. The issue has been logged and will be resolved.',
          [{
            label: 'Retry',
            action: () => window.location.reload(),
            style: 'primary' as const
          }]
        );
      }}
    >
      <div className={`min-h-screen transition-colors duration-500 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
          : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
      }`}>
        {/* Keyboard Shortcuts System */}
        <KeyboardShortcuts 
          isDarkMode={isDarkMode}
          onToggleTheme={toggleDarkMode}
          onNavigate={(tab) => handleTabChange(tab)}
        />

        {/* Notification System */}
        <NotificationContainer 
          isDarkMode={isDarkMode}
          position="bottom-right"
        />

        {/* Layout Control Panel */}
        <div className="relative">
          <LayoutControlPanel isDarkMode={isDarkMode} />
        </div>

        {/* Floating Action Buttons - Right Side */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-3">
          {/* Layout Control Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              // Trigger layout panel
              const layoutBtn = document.querySelector('[title="Layout Controls"]') as HTMLButtonElement;
              layoutBtn?.click();
            }}
            className={`p-3 rounded-full shadow-xl transition-all duration-300 ${
              isDarkMode 
                ? 'bg-slate-700 text-slate-200 hover:bg-slate-600 shadow-slate-700/20 border border-slate-600' 
                : 'bg-white text-gray-700 hover:bg-gray-50 shadow-gray-300/20 border border-gray-200'
            }`}
            title="Layout Controls"
          >
            <Layout className="w-5 h-5" />
          </motion.button>

          {/* Dark Mode Toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              console.log('Floating toggle clicked, current mode:', isDarkMode);
              const newMode = !isDarkMode;
              setIsDarkMode(newMode);
              console.log('New mode set to:', newMode);
              
              // Force state update and re-render
              localStorage.setItem('darkMode', newMode.toString());
              
              // Smart notification for theme toggle (only once per session)
              const themeNotificationKey = 'theme-notification-shown';
              if (!sessionStorage.getItem(themeNotificationKey)) {
                notifications.info(
                  'Theme Updated',
                  `Switched to ${newMode ? 'dark' : 'light'} mode`
                );
                sessionStorage.setItem(themeNotificationKey, 'true');
              }
            }}
            className={`p-3 rounded-full shadow-xl transition-all duration-300 ${
              isDarkMode 
                ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-300 shadow-yellow-400/20' 
                : 'bg-gray-800 text-yellow-400 hover:bg-gray-700 shadow-gray-800/20'
            }`}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </motion.button>
        </div>

        {/* Top Navigation */}
        <TopNavigation 
          activeTab={activeTab}
          onTabChange={handleTabChange}
          isDarkMode={isDarkMode}
        />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto p-6">
          {/* Active Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`backdrop-blur-md rounded-2xl ${
              isDarkMode ? 'bg-slate-800/30 border-slate-700' : 'bg-white/40 border-white/20'
            } border shadow-xl`}
          >
            {renderActiveContent()}
          </motion.div>
        </div>
      </div>
    </EnhancedErrorBoundary>
  );
}

// Main Dashboard Component with Provider Wrappers
export default function Dashboard() {
  return (
    <NotificationProvider>
      <LayoutProvider>
        <DashboardContent />
      </LayoutProvider>
    </NotificationProvider>
  );
}
