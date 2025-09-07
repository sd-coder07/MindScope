'use client';

import { BreathingSession, dataPersistence } from '@/lib/dataPersistence';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Activity,
    Bookmark,
    Calendar,
    CheckCircle,
    Clock,
    Heart,
    Pause,
    Play,
    RotateCcw,
    Settings,
    Star,
    TrendingUp,
    Wind,
    Zap
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface BreathingStats {
  totalSessions: number;
  totalMinutes: number;
  longestSession: number;
  currentStreak: number;
  averageHeartRateImprovement: number;
  favoritePattern: string;
}

interface RealBreathingExerciseProps {
  isDarkMode?: boolean;
}

export default function RealBreathingExercise({ isDarkMode = false }: RealBreathingExerciseProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<'inhale' | 'hold' | 'exhale' | 'pause'>('inhale');
  const [phaseTime, setPhaseTime] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  const [selectedPattern, setSelectedPattern] = useState('4-7-8');
  const [heartRateBefore, setHeartRateBefore] = useState<number | null>(null);
  const [heartRateAfter, setHeartRateAfter] = useState<number | null>(null);
  const [stats, setStats] = useState<BreathingStats>({
    totalSessions: 0,
    totalMinutes: 0,
    longestSession: 0,
    currentStreak: 0,
    averageHeartRateImprovement: 0,
    favoritePattern: '4-7-8'
  });
  const [showCompletion, setShowCompletion] = useState(false);
  const [sessionGoal, setSessionGoal] = useState(5); // minutes

  const patterns = {
    '4-7-8': { inhale: 4, hold: 7, exhale: 8, pause: 0, name: 'Relaxing Breath', description: 'Deep relaxation and stress relief' },
    '4-4-4-4': { inhale: 4, hold: 4, exhale: 4, pause: 4, name: 'Box Breathing', description: 'Balance and focus' },
    '6-2-6-2': { inhale: 6, hold: 2, exhale: 6, pause: 2, name: 'Calm Flow', description: 'Gentle calming rhythm' },
    '4-0-4-0': { inhale: 4, hold: 0, exhale: 4, pause: 0, name: 'Simple Breath', description: 'Basic mindful breathing' },
    '5-5-5-0': { inhale: 5, hold: 5, exhale: 5, pause: 0, name: 'Triangle Breath', description: 'Energizing and centering' }
  };

  const currentPattern = patterns[selectedPattern as keyof typeof patterns];

  useEffect(() => {
    loadStats();
    
    // Add voice command event listener
    const handleVoiceCommand = (event: CustomEvent) => {
      if (event.type === 'startBreathingExercise') {
        if (!isActive) {
          startSession();
          // Show voice activation feedback
          if (typeof window !== 'undefined') {
            const notification = document.createElement('div');
            notification.className = 'fixed top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
            notification.innerHTML = '🎤 Voice Command: Breathing exercise started!';
            document.body.appendChild(notification);
            setTimeout(() => {
              if (document.body.contains(notification)) {
                document.body.removeChild(notification);
              }
            }, 3000);
          }
        }
      }
    };

    window.addEventListener('startBreathingExercise', handleVoiceCommand as EventListener);
    
    return () => {
      window.removeEventListener('startBreathingExercise', handleVoiceCommand as EventListener);
    };
  }, [isActive]);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setPhaseTime(prev => {
        const newTime = prev + 0.1;
        const currentPhaseDuration = currentPattern[currentPhase];
        
        if (newTime >= currentPhaseDuration) {
          // Move to next phase
          if (currentPhase === 'inhale') {
            setCurrentPhase(currentPattern.hold > 0 ? 'hold' : 'exhale');
          } else if (currentPhase === 'hold') {
            setCurrentPhase('exhale');
          } else if (currentPhase === 'exhale') {
            setCurrentPhase(currentPattern.pause > 0 ? 'pause' : 'inhale');
          } else if (currentPhase === 'pause') {
            setCurrentPhase('inhale');
          }
          return 0;
        }
        return newTime;
      });

      setSessionTime(prev => prev + 0.1);
    }, 100);

    return () => clearInterval(interval);
  }, [isActive, currentPhase, currentPattern]);

  const loadStats = () => {
    const sessions = dataPersistence.getBreathingSessions(30); // Last 30 days
    
    if (sessions.length === 0) {
      setStats({
        totalSessions: 0,
        totalMinutes: 0,
        longestSession: 0,
        currentStreak: 0,
        averageHeartRateImprovement: 0,
        favoritePattern: '4-7-8'
      });
      return;
    }

    const totalMinutes = sessions.reduce((sum, session) => sum + session.duration, 0);
    const longestSession = Math.max(...sessions.map(s => s.duration));
    
    // Calculate streak
    let currentStreak = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      
      const hasSession = sessions.some(session => 
        new Date(session.timestamp).toDateString() === dateStr
      );
      
      if (hasSession) {
        currentStreak++;
      } else if (i > 0) {
        break;
      }
    }

    // Calculate average heart rate improvement
    const sessionsWithHR = sessions.filter(s => s.heartRateBefore && s.heartRateAfter);
    const averageHeartRateImprovement = sessionsWithHR.length > 0
      ? sessionsWithHR.reduce((sum, s) => sum + (s.heartRateBefore! - s.heartRateAfter!), 0) / sessionsWithHR.length
      : 0;

    // Find favorite pattern
    const patternCounts = sessions.reduce((acc, session) => {
      acc[session.pattern] = (acc[session.pattern] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const favoritePattern = Object.entries(patternCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '4-7-8';

    setStats({
      totalSessions: sessions.length,
      totalMinutes: Math.round(totalMinutes),
      longestSession: Math.round(longestSession),
      currentStreak,
      averageHeartRateImprovement: Math.round(averageHeartRateImprovement),
      favoritePattern
    });
  };

  const startSession = () => {
    setIsActive(true);
    setCurrentPhase('inhale');
    setPhaseTime(0);
    setSessionTime(0);
  };

  const pauseSession = () => {
    setIsActive(false);
  };

  const stopSession = () => {
    if (sessionTime >= 60) { // At least 1 minute
      saveSession();
    }
    
    setIsActive(false);
    setCurrentPhase('inhale');
    setPhaseTime(0);
    setSessionTime(0);
  };

  const checkBreathingAchievements = useCallback(() => {
    const sessions = dataPersistence.getBreathingSessions(365);
    const achievements = dataPersistence.getAchievements();
    const existingIds = achievements.map(a => a.id);

    // First breathing session
    if (sessions.length === 1 && !existingIds.includes('first_breath')) {
      const achievement = {
        id: 'first_breath',
        userId: 'current_user',
        title: 'First Breath',
        description: 'Completed your first breathing session',
        points: 25,
        unlockedAt: new Date().toISOString(),
        rarity: 'common' as const
      };
      dataPersistence.saveAchievement(achievement);
      
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('achievementUnlocked', { detail: achievement });
        window.dispatchEvent(event);
      }
    }

    // Breathing streak achievements
    if (stats.currentStreak >= 7 && !existingIds.includes('breathing_week')) {
      const achievement = {
        id: 'breathing_week',
        userId: 'current_user',
        title: 'Breathing Week',
        description: 'Completed breathing exercises for 7 days straight',
        points: 100,
        unlockedAt: new Date().toISOString(),
        rarity: 'rare' as const
      };
      dataPersistence.saveAchievement(achievement);
      
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('achievementUnlocked', { detail: achievement });
        window.dispatchEvent(event);
      }
    }
  }, [stats.currentStreak]);

  const saveSession = useCallback(() => {
    const session: BreathingSession = {
      id: `breathing_${Date.now()}`,
      userId: 'current_user',
      pattern: selectedPattern,
      duration: sessionTime / 60, // Convert to minutes
      completed: sessionTime >= (sessionGoal * 60),
      heartRateBefore: heartRateBefore || undefined,
      heartRateAfter: heartRateAfter || undefined,
      timestamp: new Date().toISOString()
    };

    dataPersistence.saveBreathingSession(session);
    
    // Show completion animation
    setShowCompletion(true);
    setTimeout(() => setShowCompletion(false), 3000);
    
    // Reload stats
    loadStats();

    // Dispatch event for achievement system
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('breathingSessionCompleted', { detail: session });
      window.dispatchEvent(event);
    }

    // Check for achievements
    checkBreathingAchievements();
  }, [sessionTime, selectedPattern, sessionGoal, heartRateBefore, heartRateAfter, checkBreathingAchievements]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseInstruction = () => {
    switch (currentPhase) {
      case 'inhale': return 'Breathe In';
      case 'hold': return 'Hold';
      case 'exhale': return 'Breathe Out';
      case 'pause': return 'Pause';
    }
  };

  const getPhaseColor = () => {
    switch (currentPhase) {
      case 'inhale': return 'from-blue-400 to-cyan-500';
      case 'hold': return 'from-yellow-400 to-orange-500';
      case 'exhale': return 'from-green-400 to-emerald-500';
      case 'pause': return 'from-purple-400 to-pink-500';
    }
  };

  const progress = phaseTime / currentPattern[currentPhase];
  const sessionProgress = sessionTime / (sessionGoal * 60);

  return (
    <div className={`min-h-screen p-4 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-cyan-50'
    }`}>
      {/* Completion Animation */}
      <AnimatePresence>
        {showCompletion && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -50 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-6 rounded-2xl shadow-2xl"
          >
            <div className="flex items-center space-x-4">
              <CheckCircle className="w-8 h-8" />
              <div>
                <h3 className="text-lg font-bold">Session Complete! 🌟</h3>
                <p className="text-green-100">Great job on your breathing practice</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto mb-8"
      >
        <div className={`backdrop-blur-xl rounded-3xl p-6 shadow-2xl border ${
          isDarkMode 
            ? 'bg-slate-800/70 border-slate-700/30' 
            : 'bg-white/70 border-white/30'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Mindful Breathing
              </h1>
              <p className={`mt-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Transform your day with conscious breathing</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                Level {Math.floor(stats.totalMinutes / 60) + 1}
              </div>
              <button className={`p-3 rounded-full transition-colors ${
                isDarkMode 
                  ? 'bg-slate-700 hover:bg-slate-600' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}>
                <Settings className={`w-5 h-5 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="max-w-7xl mx-auto mb-8"
      >
        <div className="grid md:grid-cols-4 gap-6">
          <motion.div className={`group backdrop-blur-xl rounded-2xl p-6 shadow-xl border hover:scale-105 transition-transform cursor-pointer ${
            isDarkMode 
              ? 'bg-slate-800/70 border-slate-700/30' 
              : 'bg-white/70 border-white/30'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-3 rounded-xl group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div className={`text-3xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>{stats.totalSessions}</div>
            <div className={`text-sm mb-3 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>Total Sessions</div>
            <div className={`rounded-full h-2 overflow-hidden ${
              isDarkMode ? 'bg-slate-700' : 'bg-blue-100'
            }`}>
              <motion.div 
                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((stats.totalSessions / 100) * 100, 100)}%` }}
                transition={{ duration: 1.5, delay: 0.5 }}
              />
            </div>
          </motion.div>

          <motion.div className={`group backdrop-blur-xl rounded-2xl p-6 shadow-xl border hover:scale-105 transition-transform cursor-pointer ${
            isDarkMode 
              ? 'bg-slate-800/70 border-slate-700/30' 
              : 'bg-white/70 border-white/30'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-br from-emerald-500 to-green-500 p-3 rounded-xl group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <Star className="w-5 h-5 text-yellow-500" />
            </div>
            <div className={`text-3xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>{stats.totalMinutes}</div>
            <div className={`text-sm mb-3 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>Minutes Practiced</div>
            <div className={`rounded-full h-2 overflow-hidden ${
              isDarkMode ? 'bg-slate-700' : 'bg-green-100'
            }`}>
              <motion.div 
                className="bg-gradient-to-r from-emerald-500 to-green-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((stats.totalMinutes / 500) * 100, 100)}%` }}
                transition={{ duration: 1.5, delay: 0.7 }}
              />
            </div>
          </motion.div>

          <motion.div className={`group backdrop-blur-xl rounded-2xl p-6 shadow-xl border hover:scale-105 transition-transform cursor-pointer ${
            isDarkMode 
              ? 'bg-slate-800/70 border-slate-700/30' 
              : 'bg-white/70 border-white/30'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-xl group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <Activity className="w-5 h-5 text-purple-500" />
            </div>
            <div className={`text-3xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>{stats.currentStreak}</div>
            <div className={`text-sm mb-3 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>Day Streak</div>
            <div className={`rounded-full h-2 overflow-hidden ${
              isDarkMode ? 'bg-slate-700' : 'bg-purple-100'
            }`}>
              <motion.div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((stats.currentStreak / 30) * 100, 100)}%` }}
                transition={{ duration: 1.5, delay: 0.9 }}
              />
            </div>
          </motion.div>

          <motion.div className={`group backdrop-blur-xl rounded-2xl p-6 shadow-xl border hover:scale-105 transition-transform cursor-pointer ${
            isDarkMode 
              ? 'bg-slate-800/70 border-slate-700/30' 
              : 'bg-white/70 border-white/30'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-br from-red-500 to-rose-500 p-3 rounded-xl group-hover:scale-110 transition-transform">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div className={`text-3xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>{stats.averageHeartRateImprovement}</div>
            <div className={`text-sm mb-3 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>Avg HR Drop</div>
            <div className={`rounded-full h-2 overflow-hidden ${
              isDarkMode ? 'bg-slate-700' : 'bg-red-100'
            }`}>
              <motion.div 
                className="bg-gradient-to-r from-red-500 to-rose-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((stats.averageHeartRateImprovement / 20) * 100, 100)}%` }}
                transition={{ duration: 1.5, delay: 1.1 }}
              />
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Enhanced Breathing Pattern Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-7xl mx-auto mb-8"
      >
        <div className={`backdrop-blur-xl rounded-3xl p-8 shadow-2xl border ${
          isDarkMode 
            ? 'bg-slate-800/70 border-slate-700/30' 
            : 'bg-white/70 border-white/30'
        }`}>
          <div className="flex items-center space-x-3 mb-6">
            <Wind className="w-6 h-6 text-indigo-600" />
            <h2 className={`text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>Choose Your Breathing Journey</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {Object.entries(patterns).map(([key, pattern]) => (
              <motion.button
                key={key}
                onClick={() => !isActive && setSelectedPattern(key)}
                disabled={isActive}
                whileHover={{ scale: isActive ? 1 : 1.02 }}
                whileTap={{ scale: isActive ? 1 : 0.98 }}
                className={`group relative p-6 rounded-2xl border-2 transition-all text-left overflow-hidden ${
                  selectedPattern === key
                    ? isDarkMode
                      ? 'border-indigo-400 bg-gradient-to-br from-slate-700/50 to-slate-600/50 shadow-lg'
                      : 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg'
                    : isDarkMode
                      ? 'border-slate-600 hover:border-indigo-400 bg-slate-800/50 hover:bg-slate-700/50'
                      : 'border-gray-200 hover:border-indigo-300 bg-white hover:bg-gray-50'
                } ${isActive ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {selectedPattern === key && (
                  <motion.div
                    layoutId="selectedPattern"
                    className={`absolute inset-0 rounded-2xl ${
                      isDarkMode 
                        ? 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20'
                        : 'bg-gradient-to-br from-indigo-500/10 to-purple-500/10'
                    }`}
                  />
                )}
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`font-bold text-lg ${
                      isDarkMode ? 'text-white' : 'text-gray-800'
                    }`}>{pattern.name}</h3>
                    {selectedPattern === key && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="bg-indigo-500 text-white rounded-full p-1"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </motion.div>
                    )}
                  </div>
                  <p className={`mb-4 text-sm leading-relaxed ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>{pattern.description}</p>
                  <div className="flex items-center space-x-2">
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      isDarkMode 
                        ? 'bg-blue-900/50 text-blue-300' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {pattern.inhale}s inhale
                    </div>
                    {pattern.hold > 0 && (
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        isDarkMode 
                          ? 'bg-yellow-900/50 text-yellow-300' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {pattern.hold}s hold
                      </div>
                    )}
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      isDarkMode 
                        ? 'bg-green-900/50 text-green-300' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {pattern.exhale}s exhale
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8">
        {/* Main Breathing Interface */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`backdrop-blur-xl rounded-3xl p-8 shadow-2xl border h-fit ${
              isDarkMode 
                ? 'bg-slate-800/70 border-slate-700/30' 
                : 'bg-white/70 border-white/30'
            }`}
          >
            <div className="text-center space-y-8">
              {/* Revolutionary Breathing Orb */}
              <div className="relative mx-auto w-96 h-96">
                {/* Outer Energy Ring */}
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 blur-xl"
                />
                
                {/* Main Breathing Orb */}
                <motion.div
                  animate={{
                    scale: currentPhase === 'inhale' ? 1.3 : 
                           currentPhase === 'hold' ? 1.3 : 
                           currentPhase === 'exhale' ? 0.7 : 1,
                  }}
                  transition={{ 
                    duration: currentPattern[currentPhase], 
                    ease: "easeInOut"
                  }}
                  className={`relative w-full h-full rounded-full bg-gradient-to-br ${getPhaseColor()} shadow-2xl`}
                >
                  {/* Inner Glow */}
                  <div className="absolute inset-4 rounded-full bg-white/30 backdrop-blur-sm" />
                  
                  {/* Pulsing Center */}
                  <motion.div
                    animate={{
                      scale: [0.8, 1.2, 0.8],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute inset-8 rounded-full bg-white/50"
                  />
                </motion.div>

                {/* Floating Particles */}
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-white/70 rounded-full"
                    style={{
                      left: `${50 + 45 * Math.cos((i * 30 * Math.PI) / 180)}%`,
                      top: `${50 + 45 * Math.sin((i * 30 * Math.PI) / 180)}%`,
                    }}
                    animate={{
                      scale: [0.5, 1.5, 0.5],
                      opacity: [0.3, 1, 0.3],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: "easeInOut"
                    }}
                  />
                ))}

                {/* Center Content */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <motion.h2 
                      key={currentPhase}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-4xl font-bold mb-2"
                    >
                      {getPhaseInstruction()}
                    </motion.h2>
                    <motion.div 
                      key={`${currentPhase}-${Math.ceil(currentPattern[currentPhase] - phaseTime)}`}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-7xl font-bold"
                    >
                      {Math.ceil(currentPattern[currentPhase] - phaseTime)}
                    </motion.div>
                    <div className="text-lg mt-2 opacity-90">
                      {currentPattern.name}
                    </div>
                  </div>
                </div>

                {/* Progress Ring */}
                <div className="absolute inset-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="48"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="2"
                      fill="none"
                    />
                    <motion.circle
                      cx="50"
                      cy="50"
                      r="48"
                      stroke="white"
                      strokeWidth="3"
                      fill="none"
                      strokeDasharray={`${progress * 301.6} 301.6`}
                      className="drop-shadow-lg"
                      initial={{ strokeDasharray: "0 301.6" }}
                      animate={{ strokeDasharray: `${progress * 301.6} 301.6` }}
                      transition={{ duration: 0.3 }}
                    />
                  </svg>
                </div>
              </div>

              {/* Enhanced Controls */}
              <div className="space-y-6">
                <div className="flex justify-center space-x-6">
                  {!isActive ? (
                    <motion.button
                      onClick={startSession}
                      data-action="start-breathing"
                      data-testid="breathing-start-button"
                      aria-label="Start breathing exercise"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="group flex items-center space-x-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all"
                    >
                      <Play className="w-6 h-6 group-hover:scale-110 transition-transform" />
                      <span>Begin Journey</span>
                    </motion.button>
                  ) : (
                    <div className="flex space-x-4">
                      <motion.button
                        onClick={pauseSession}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                      >
                        <Pause className="w-5 h-5" />
                        <span>Pause</span>
                      </motion.button>
                      <motion.button
                        onClick={stopSession}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-rose-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                      >
                        <RotateCcw className="w-5 h-5" />
                        <span>Complete</span>
                      </motion.button>
                    </div>
                  )}
                </div>

                {/* Session Goal Selector */}
                {!isActive && (
                  <div className="flex justify-center items-center space-x-4">
                    <span className={`font-medium ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Session Goal:</span>
                    <div className="flex space-x-2">
                      {[3, 5, 10, 15, 20].map(minutes => (
                        <motion.button
                          key={minutes}
                          onClick={() => setSessionGoal(minutes)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                            sessionGoal === minutes
                              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                              : isDarkMode
                                ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {minutes}min
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Session Insights Panel */}
        <div className="space-y-6">
          {/* Session Progress */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className={`backdrop-blur-xl rounded-2xl p-6 shadow-xl border ${
              isDarkMode 
                ? 'bg-slate-800/70 border-slate-700/30' 
                : 'bg-white/70 border-white/30'
            }`}
          >
            <h3 className={`text-lg font-bold mb-4 flex items-center ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>
              <Activity className="w-5 h-5 mr-2 text-indigo-600" />
              Session Progress
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>Time</span>
                  <span className={`text-lg font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}>{formatTime(sessionTime)}</span>
                </div>
                <div className={`rounded-full h-2 ${
                  isDarkMode ? 'bg-slate-700' : 'bg-gray-200'
                }`}>
                  <motion.div
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(sessionProgress * 100, 100)}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>Goal Progress</span>
                  <span className={`text-lg font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}>{Math.round(sessionProgress * 100)}%</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>Target</span>
                  <span className={`text-lg font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}>{sessionGoal}min</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Heart Rate Tracking */}
          {!isActive && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className={`rounded-2xl p-6 border shadow-xl ${
                isDarkMode 
                  ? 'bg-gradient-to-br from-slate-800/70 to-slate-700/70 border-red-600/30' 
                  : 'bg-gradient-to-br from-red-50 to-pink-50 border-red-200/50'
              }`}
            >
              <h3 className={`text-lg font-bold mb-4 flex items-center ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>
                <Heart className="w-5 h-5 mr-2 text-red-500" />
                Heart Rate Tracking
              </h3>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Before Session (BPM)
                  </label>
                  <input
                    type="number"
                    value={heartRateBefore || ''}
                    onChange={(e) => setHeartRateBefore(Number(e.target.value) || null)}
                    placeholder="Enter heart rate"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent backdrop-blur-sm ${
                      isDarkMode 
                        ? 'bg-slate-700/50 border-slate-600 text-white placeholder-gray-400' 
                        : 'bg-white/80 border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    After Session (BPM)
                  </label>
                  <input
                    type="number"
                    value={heartRateAfter || ''}
                    onChange={(e) => setHeartRateAfter(Number(e.target.value) || null)}
                    placeholder="Enter heart rate"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent backdrop-blur-sm ${
                      isDarkMode 
                        ? 'bg-slate-700/50 border-slate-600 text-white placeholder-gray-400' 
                        : 'bg-white/80 border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Quick Insights */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className={`backdrop-blur-xl rounded-2xl p-6 shadow-xl border ${
              isDarkMode 
                ? 'bg-slate-800/70 border-slate-700/30' 
                : 'bg-white/70 border-white/30'
            }`}
          >
            <h3 className={`text-lg font-bold mb-4 flex items-center ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>
              <Bookmark className="w-5 h-5 mr-2 text-purple-600" />
              Quick Insights
            </h3>
            <div className="space-y-3">
              <div className={`flex items-center justify-between p-3 rounded-xl ${
                isDarkMode 
                  ? 'bg-blue-900/30' 
                  : 'bg-blue-50'
              }`}>
                <span className={`text-sm ${
                  isDarkMode ? 'text-blue-300' : 'text-blue-800'
                }`}>Longest Session</span>
                <span className={`font-bold ${
                  isDarkMode ? 'text-blue-200' : 'text-blue-900'
                }`}>{stats.longestSession}min</span>
              </div>
              <div className={`flex items-center justify-between p-3 rounded-xl ${
                isDarkMode 
                  ? 'bg-green-900/30' 
                  : 'bg-green-50'
              }`}>
                <span className={`text-sm ${
                  isDarkMode ? 'text-green-300' : 'text-green-800'
                }`}>Favorite Pattern</span>
                <span className={`font-bold ${
                  isDarkMode ? 'text-green-200' : 'text-green-900'
                }`}>{stats.favoritePattern}</span>
              </div>
              <div className={`flex items-center justify-between p-3 rounded-xl ${
                isDarkMode 
                  ? 'bg-purple-900/30' 
                  : 'bg-purple-50'
              }`}>
                <span className={`text-sm ${
                  isDarkMode ? 'text-purple-300' : 'text-purple-800'
                }`}>Current Level</span>
                <span className={`font-bold ${
                  isDarkMode ? 'text-purple-200' : 'text-purple-900'
                }`}>Level {Math.floor(stats.totalMinutes / 60) + 1}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
