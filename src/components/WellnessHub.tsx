'use client';

import { motion } from 'framer-motion';
import {
    Brain,
    Crown,
    Eye,
    Heart,
    Mic,
    Shield,
    Sparkles,
    TreePine,
    Users,
    Wind,
    Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface WellnessMetrics {
  dailyMood: number;
  breathingMinutes: number;
  emotionAccuracy: number;
  streakDays: number;
  mindfulnessScore: number;
  socialConnections: number;
  privacyLevel: number;
  adaptationScore: number;
}

interface WellnessHubProps {
  onNavigateToFeature?: (feature: string) => void;
  isDarkMode?: boolean;
  userStats?: {
    dailyMood: number;
    breathingMinutes: number;
    emotionAccuracy: number;
    mindfulnessScore: number;
    privacyLevel: number;
    adaptationScore: number;
    streakDays: number;
  };
}

export default function WellnessHub({ onNavigateToFeature, isDarkMode = false, userStats }: WellnessHubProps) {
  const [metrics, setMetrics] = useState<WellnessMetrics>({
    dailyMood: userStats?.dailyMood || 75,
    breathingMinutes: userStats?.breathingMinutes || 12,
    emotionAccuracy: userStats?.emotionAccuracy || 89,
    streakDays: userStats?.streakDays || 7,
    mindfulnessScore: userStats?.mindfulnessScore || 68,
    socialConnections: 5,
    privacyLevel: userStats?.privacyLevel || 95,
    adaptationScore: userStats?.adaptationScore || 82
  });

  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const wellnessFeatures = [
    {
      id: 'mood-journey',
      title: 'Mood Journey',
      icon: <Heart className="w-6 h-6" />,
      description: 'Track your emotional patterns and insights',
      progress: metrics.dailyMood,
      color: 'from-pink-500 to-rose-500',
      bgColor: 'from-pink-50 to-rose-50',
      metric: `${metrics.dailyMood}% positive`,
      status: 'active'
    },
    {
      id: 'breathe-easy',
      title: 'Breathe Easy',
      icon: <Wind className="w-6 h-6" />,
      description: 'Guided breathing exercises for relaxation',
      progress: (metrics.breathingMinutes / 20) * 100,
      color: 'from-cyan-500 to-blue-500',
      bgColor: 'from-cyan-50 to-blue-50',
      metric: `${metrics.breathingMinutes} min today`,
      status: 'active'
    },
    {
      id: 'emotion-sense',
      title: 'Emotion Sense',
      icon: <Eye className="w-6 h-6" />,
      description: 'AI-powered emotion detection and analysis',
      progress: metrics.emotionAccuracy,
      color: 'from-violet-500 to-purple-500',
      bgColor: 'from-violet-50 to-purple-50',
      metric: `${metrics.emotionAccuracy}% accuracy`,
      status: 'live'
    },
    {
      id: 'neural-view',
      title: 'Neural View',
      icon: <Brain className="w-6 h-6" />,
      description: '3D brain visualization and cognitive insights',
      progress: 85,
      color: 'from-indigo-500 to-blue-600',
      bgColor: 'from-indigo-50 to-blue-50',
      metric: 'Neural activity',
      status: 'processing'
    },
    {
      id: 'zen-space',
      title: 'Zen Space',
      icon: <TreePine className="w-6 h-6" />,
      description: 'Meditation and mindfulness sanctuary',
      progress: metrics.mindfulnessScore,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-50 to-emerald-50',
      metric: `${metrics.mindfulnessScore}% mindful`,
      status: 'peaceful'
    },
    {
      id: 'voice-guide',
      title: 'Voice Guide',
      icon: <Mic className="w-6 h-6" />,
      description: 'Voice-activated wellness companion',
      progress: 92,
      color: 'from-orange-500 to-red-500',
      bgColor: 'from-orange-50 to-red-50',
      metric: 'Voice ready',
      status: 'listening'
    },
    {
      id: 'progress-quest',
      title: 'Progress Quest',
      icon: <Crown className="w-6 h-6" />,
      description: 'Achievements and wellness milestones',
      progress: 78,
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'from-yellow-50 to-orange-50',
      metric: `${metrics.streakDays} day streak`,
      status: 'champion'
    },
    {
      id: 'privacy-shield',
      title: 'Privacy Shield',
      icon: <Shield className="w-6 h-6" />,
      description: 'Advanced privacy and security controls',
      progress: metrics.privacyLevel,
      color: 'from-slate-500 to-gray-600',
      bgColor: 'from-slate-50 to-gray-50',
      metric: `${metrics.privacyLevel}% secure`,
      status: 'protected'
    },
    {
      id: 'adaptive-ui',
      title: 'Adaptive UI',
      icon: <Sparkles className="w-6 h-6" />,
      description: 'Personalized interface that adapts to you',
      progress: metrics.adaptationScore,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'from-purple-50 to-pink-50',
      metric: `${metrics.adaptationScore}% adapted`,
      status: 'evolving'
    },
    {
      id: 'wellness-circle',
      title: 'Wellness Circle',
      icon: <Users className="w-6 h-6" />,
      description: 'Connect with your wellness community',
      progress: (metrics.socialConnections / 10) * 100,
      color: 'from-teal-500 to-cyan-500',
      bgColor: 'from-teal-50 to-cyan-50',
      metric: `${metrics.socialConnections} connections`,
      status: 'social'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500';
      case 'live': return 'text-red-500 animate-pulse';
      case 'processing': return 'text-blue-500';
      case 'peaceful': return 'text-emerald-500';
      case 'listening': return 'text-orange-500';
      case 'champion': return 'text-yellow-500';
      case 'protected': return 'text-slate-500';
      case 'evolving': return 'text-purple-500';
      case 'social': return 'text-teal-500';
      default: return 'text-gray-500';
    }
  };

  const getOverallWellnessScore = () => {
    const scores = [
      metrics.dailyMood,
      (metrics.breathingMinutes / 20) * 100,
      metrics.emotionAccuracy,
      metrics.mindfulnessScore,
      metrics.privacyLevel,
      metrics.adaptationScore
    ];
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  const getWellnessMessage = (score: number) => {
    if (score >= 90) return { message: "Exceptional wellness! You're thriving!", emoji: "🌟" };
    if (score >= 80) return { message: "Great progress on your wellness journey!", emoji: "🚀" };
    if (score >= 70) return { message: "Good momentum, keep it up!", emoji: "💪" };
    if (score >= 60) return { message: "You're on the right path!", emoji: "🌱" };
    return { message: "Every step counts on your wellness journey!", emoji: "🌈" };
  };

  const handleFeatureClick = (featureId: string) => {
    setSelectedFeature(featureId);
    onNavigateToFeature?.(featureId);
  };

  const overallScore = getOverallWellnessScore();
  const wellnessMessage = getWellnessMessage(overallScore);

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-8">
      {/* Wellness Hub Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 rounded-3xl p-8 text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Wellness Hub</h1>
              <p className="text-white/80 text-lg">Your daily wellness overview</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              <div className="text-white/80">{currentTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}</div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-4xl font-bold mb-2">{overallScore}%</div>
                <div className="text-white/90">Overall Wellness Score</div>
              </div>
              <div className="text-right">
                <div className="text-3xl mb-2">{wellnessMessage.emoji}</div>
                <div className="text-white/90">{wellnessMessage.message}</div>
              </div>
            </div>
            
            <div className="mt-4 bg-white/20 rounded-full h-3 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${overallScore}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-white to-white/80 rounded-full"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Wellness Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {wellnessFeatures.map((feature, index) => (
          <motion.div
            key={feature.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => handleFeatureClick(feature.id)}
            className={`bg-gradient-to-br ${feature.bgColor} rounded-2xl p-6 cursor-pointer group hover:shadow-xl transition-all duration-300 border border-white/50 hover:border-white/80 hover:-translate-y-2`}
          >
            <div className="space-y-4">
              {/* Feature Icon & Status */}
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.color} text-white group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <div className={`text-xs font-medium ${getStatusColor(feature.status)} flex items-center gap-1`}>
                  <div className="w-2 h-2 rounded-full bg-current animate-pulse"></div>
                  {feature.status}
                </div>
              </div>

              {/* Feature Title & Description */}
              <div>
                <h3 className="font-bold text-gray-800 mb-1 group-hover:text-gray-900 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Progress & Metric */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium text-gray-800">{Math.round(feature.progress)}%</span>
                </div>
                <div className="bg-white/60 rounded-full h-2 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${feature.progress}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className={`h-full bg-gradient-to-r ${feature.color} rounded-full`}
                  />
                </div>
                <div className="text-xs text-gray-600 font-medium">
                  {feature.metric}
                </div>
              </div>
            </div>

            {/* Hover Effect Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className={`rounded-2xl p-6 shadow-lg border ${
          isDarkMode 
            ? 'bg-slate-800/90 border-slate-700' 
            : 'bg-white border-gray-100'
        }`}
      >
        <h3 className={`text-xl font-bold mb-4 ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`}>Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { id: 'quick-breathing', title: 'Quick Breathing', icon: <Wind className="w-5 h-5" />, color: 'from-cyan-500 to-blue-500' },
            { id: 'mood-check', title: 'Mood Check-in', icon: <Heart className="w-5 h-5" />, color: 'from-pink-500 to-rose-500' },
            { id: 'zen-moment', title: 'Zen Moment', icon: <TreePine className="w-5 h-5" />, color: 'from-green-500 to-emerald-500' },
            { id: 'voice-session', title: 'Voice Session', icon: <Mic className="w-5 h-5" />, color: 'from-orange-500 to-red-500' }
          ].map((action) => (
            <motion.button
              key={action.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleFeatureClick(action.id)}
              className={`bg-gradient-to-r ${action.color} text-white rounded-xl p-4 flex flex-col items-center gap-2 hover:shadow-lg transition-all duration-300`}
            >
              {action.icon}
              <span className="text-sm font-medium">{action.title}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Today's Insights */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className={`rounded-2xl p-6 border ${
          isDarkMode 
            ? 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-slate-700/50' 
            : 'bg-gradient-to-br from-slate-50 to-blue-50 border-slate-200/50'
        }`}
      >
        <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`}>
          <Zap className="w-6 h-6 text-yellow-500" />
          Today&apos;s Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`rounded-xl p-4 ${
            isDarkMode ? 'bg-slate-700/50' : 'bg-white/70'
          }`}>
            <div className="text-2xl font-bold text-blue-600">{metrics.streakDays}</div>
            <div className={`text-sm ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>Day streak maintained</div>
          </div>
          <div className={`rounded-xl p-4 ${
            isDarkMode ? 'bg-slate-700/50' : 'bg-white/70'
          }`}>
            <div className="text-2xl font-bold text-green-600">{metrics.breathingMinutes}m</div>
            <div className={`text-sm ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>Breathing exercises completed</div>
          </div>
          <div className={`rounded-xl p-4 ${
            isDarkMode ? 'bg-slate-700/50' : 'bg-white/70'
          }`}>
            <div className="text-2xl font-bold text-purple-600">{metrics.emotionAccuracy}%</div>
            <div className={`text-sm ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>Emotion detection accuracy</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
