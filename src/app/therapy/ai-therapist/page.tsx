'use client';

import EnhancedAITherapistComplete from '@/components/EnhancedAITherapistComplete';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    Brain,
    Globe,
    Heart,
    Languages,
    MessageSquare,
    Moon,
    Play,
    Shield,
    Sun,
    Target,
    TrendingUp,
    Zap
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

const AITherapistDemo: React.FC = () => {
  const [showDemo, setShowDemo] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeScenario, setActiveScenario] = useState<number | null>(null);

  // Dark mode detection and toggle
  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(darkModeMediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    darkModeMediaQuery.addEventListener('change', handler);
    
    return () => darkModeMediaQuery.removeEventListener('change', handler);
  }, []);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const features = [
    {
      id: 'multilingual',
      title: 'Multilingual Support',
      description: 'Native therapy in 7+ languages with cultural adaptation',
      icon: <Languages className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-500',
      darkColor: 'from-blue-400 to-cyan-400',
      count: '7+'
    },
    {
      id: 'safety',
      title: 'Crisis Detection',
      description: 'Real-time crisis monitoring with instant intervention',
      icon: <Shield className="w-6 h-6" />,
      color: 'from-red-500 to-pink-500',
      darkColor: 'from-red-400 to-pink-400',
      count: '24/7'
    },
    {
      id: 'cbt',
      title: 'CBT Techniques',
      description: 'Evidence-based cognitive behavioral therapy methods',
      icon: <Brain className="w-6 h-6" />,
      color: 'from-purple-500 to-indigo-500',
      darkColor: 'from-purple-400 to-indigo-400',
      count: '15+'
    },
    {
      id: 'analytics',
      title: 'AI Analytics',
      description: 'Advanced emotion analysis and progress tracking',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'from-emerald-500 to-teal-500',
      darkColor: 'from-emerald-400 to-teal-400',
      count: '95%'
    }
  ];

  const demoScenarios = [
    {
      title: 'Crisis Support',
      description: 'Multilingual crisis intervention with cultural sensitivity',
      emotions: ['crisis', 'despair'],
      intensity: 9,
      color: 'from-red-500 to-pink-500',
      darkColor: 'from-red-400 to-pink-400',
      icon: <Shield className="w-5 h-5" />
    },
    {
      title: 'Anxiety Management',
      description: 'Cultural adaptation for family-oriented stress patterns',
      emotions: ['anxiety', 'pressure'],
      intensity: 7,
      color: 'from-yellow-500 to-orange-500',
      darkColor: 'from-yellow-400 to-orange-400',
      icon: <Heart className="w-5 h-5" />
    },
    {
      title: 'Depression Support',
      description: 'Cross-cultural approaches to isolation and self-worth',
      emotions: ['depression', 'isolation'],
      intensity: 6,
      color: 'from-blue-500 to-purple-500',
      darkColor: 'from-blue-400 to-purple-400',
      icon: <Brain className="w-5 h-5" />
    },
    {
      title: 'Relationship Issues',
      description: 'Global resources for anger management and communication',
      emotions: ['anger', 'conflict'],
      intensity: 8,
      color: 'from-purple-500 to-pink-500',
      darkColor: 'from-purple-400 to-pink-400',
      icon: <MessageSquare className="w-5 h-5" />
    }
  ];

  if (showDemo) {
    return <EnhancedAITherapistComplete isDarkMode={isDarkMode} />;
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-black text-white' 
        : 'bg-gradient-to-br from-indigo-50 via-white to-cyan-50 text-gray-900'
    }`}>
      
      {/* Floating Dark Mode Toggle */}
      <motion.button
        onClick={toggleDarkMode}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={`fixed top-6 right-6 z-50 p-3 rounded-full ${
          isDarkMode 
            ? 'bg-yellow-500 text-gray-900' 
            : 'bg-gray-800 text-yellow-400'
        } shadow-lg transition-all duration-300`}
      >
        {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </motion.button>

      {/* Animated Background Pattern */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div className={`absolute inset-0 ${
          isDarkMode 
            ? 'bg-[radial-gradient(circle_at_30%_40%,rgba(59,130,246,0.15),transparent_70%)]' 
            : 'bg-[radial-gradient(circle_at_30%_40%,rgba(99,102,241,0.1),transparent_70%)]'
        }`} />
        <div className={`absolute inset-0 ${
          isDarkMode 
            ? 'bg-[radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.15),transparent_70%)]' 
            : 'bg-[radial-gradient(circle_at_70%_80%,rgba(236,72,153,0.1),transparent_70%)]'
        }`} />
      </div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* AI Badge */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`inline-flex items-center space-x-3 px-6 py-3 rounded-full mb-8 ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30' 
                  : 'bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-200'
              } backdrop-blur-sm`}
            >
              <div className="relative">
                <Zap className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <div className="absolute inset-0 animate-ping">
                  <Zap className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} opacity-75`} />
                </div>
              </div>
              <span className={`font-semibold ${
                isDarkMode ? 'text-blue-300' : 'text-blue-700'
              }`}>
                Enhanced AI Therapist
              </span>
              <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                isDarkMode 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-green-100 text-green-700'
              }`}>
                LIVE
              </div>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight"
            >
              <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                Multilingual AI Therapist
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Cultural Adaptation
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className={`text-xl md:text-2xl mb-8 max-w-4xl mx-auto leading-relaxed ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}
            >
              Culturally-sensitive mental health support in your language
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            >
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowDemo(true)}
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center space-x-3"
              >
                <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Start Therapy Session</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className={`px-8 py-4 rounded-2xl font-bold border-2 transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-gray-800/50 border-gray-600 text-gray-200 hover:bg-gray-700/50' 
                    : 'bg-white/80 border-gray-300 text-gray-700 hover:bg-white'
                } backdrop-blur-sm`}
              >
                Explore Features
              </motion.button>
            </motion.div>

            {/* Stats Row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto"
            >
              {[
                { label: 'Languages', value: '7+', icon: <Globe className="w-4 h-4" /> },
                { label: 'Accuracy', value: '95%', icon: <Target className="w-4 h-4" /> },
                { label: 'Response', value: '<1s', icon: <Zap className="w-4 h-4" /> },
                { label: 'Uptime', value: '24/7', icon: <Shield className="w-4 h-4" /> }
              ].map((stat, index) => (
                <div key={stat.label} className="text-center">
                  <div className={`inline-flex items-center space-x-1 mb-2 ${
                    isDarkMode ? 'text-blue-400' : 'text-blue-600'
                  }`}>
                    {stat.icon}
                    <span className="text-2xl font-bold">{stat.value}</span>
                  </div>
                  <div className={`text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Revolutionary Features
            </h2>
            <p className={`text-xl max-w-3xl mx-auto ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Advanced AI technology meets evidence-based therapy with cultural intelligence
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className={`group relative p-8 rounded-3xl transition-all duration-300 cursor-pointer ${
                  isDarkMode 
                    ? 'bg-gray-800/50 border border-gray-700/50 hover:bg-gray-800/70' 
                    : 'bg-white/80 border border-gray-200/50 hover:bg-white'
                } backdrop-blur-md shadow-xl hover:shadow-2xl`}
              >
                {/* Background Glow */}
                <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r ${
                  isDarkMode ? feature.darkColor : feature.color
                } blur-xl -z-10`} />
                
                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-r ${
                  isDarkMode ? feature.darkColor : feature.color
                } text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                
                {/* Count Badge */}
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${
                  isDarkMode 
                    ? 'bg-blue-500/20 text-blue-400' 
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {feature.count}
                </div>
                
                {/* Content */}
                <h3 className={`text-xl font-bold mb-4 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {feature.title}
                </h3>
                
                <p className={`leading-relaxed ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Scenarios */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Experience Real Scenarios
            </h2>
            <p className={`text-xl max-w-3xl mx-auto ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              See how our AI adapts to different cultural contexts and emotional states
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {demoScenarios.map((scenario, index) => (
              <motion.div
                key={scenario.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                onHoverStart={() => setActiveScenario(index)}
                onHoverEnd={() => setActiveScenario(null)}
                className={`relative p-8 rounded-3xl transition-all duration-300 overflow-hidden ${
                  isDarkMode 
                    ? 'bg-gray-800/50 border border-gray-700/50' 
                    : 'bg-white/80 border border-gray-200/50'
                } backdrop-blur-md shadow-xl hover:shadow-2xl`}
              >
                {/* Animated Background */}
                <motion.div
                  animate={{
                    opacity: activeScenario === index ? 0.1 : 0,
                    scale: activeScenario === index ? 1.5 : 1
                  }}
                  className={`absolute inset-0 bg-gradient-to-br ${
                    isDarkMode ? scenario.darkColor : scenario.color
                  } blur-3xl`}
                />
                
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-gradient-to-r ${
                  isDarkMode ? scenario.darkColor : scenario.color
                } text-white relative z-10`}>
                  {scenario.icon}
                </div>
                
                {/* Content */}
                <div className="relative z-10">
                  <h3 className={`text-2xl font-bold mb-4 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {scenario.title}
                  </h3>
                  
                  <p className={`mb-6 leading-relaxed ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {scenario.description}
                  </p>
                  
                  {/* Emotions */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {scenario.emotions.map((emotion) => (
                      <span 
                        key={emotion} 
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          isDarkMode 
                            ? 'bg-gray-700 text-gray-300' 
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {emotion}
                      </span>
                    ))}
                  </div>
                  
                  {/* Intensity Bar */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-medium ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Intensity Level
                      </span>
                      <span className={`text-sm font-bold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {scenario.intensity}/10
                      </span>
                    </div>
                    <div className={`w-full h-3 rounded-full ${
                      isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                    }`}>
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${scenario.intensity * 10}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.2 + 0.5, duration: 1 }}
                        className={`h-full rounded-full bg-gradient-to-r ${
                          isDarkMode ? scenario.darkColor : scenario.color
                        }`}
                      />
                    </div>
                  </div>
                  
                  {/* Try Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowDemo(true)}
                    className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 bg-gradient-to-r ${
                      isDarkMode ? scenario.darkColor : scenario.color
                    } text-white hover:shadow-lg flex items-center justify-center space-x-2`}
                  >
                    <Play className="w-4 h-4" />
                    <span>Try This Scenario</span>
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`p-12 rounded-3xl ${
              isDarkMode 
                ? 'bg-gradient-to-r from-gray-800/80 to-gray-900/80 border border-gray-700/50' 
                : 'bg-gradient-to-r from-white/80 to-gray-50/80 border border-gray-200/50'
            } backdrop-blur-md shadow-2xl`}
          >
            <Brain className={`w-16 h-16 mx-auto mb-6 ${
              isDarkMode ? 'text-blue-400' : 'text-blue-600'
            }`} />
            
            <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Ready to Begin Your Journey?
            </h2>
            
            <p className={`text-xl mb-8 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Experience personalized, culturally-sensitive AI therapy in your language
            </p>
            
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowDemo(true)}
              className="px-12 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center space-x-3 mx-auto"
            >
              <Zap className="w-5 h-5" />
              <span>Start Your Session Now</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AITherapistDemo;
