'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Lightbulb, 
  Target, 
  Zap, 
  Star, 
  TrendingUp,
  Clock,
  Activity,
  Heart,
  CheckCircle,
  X,
  Sparkles
} from 'lucide-react';

interface Recommendation {
  id: string;
  type: 'wellness' | 'productivity' | 'mood' | 'learning';
  title: string;
  description: string;
  confidence: number;
  action?: string;
  timeEstimate?: string;
  icon?: React.ComponentType<any>;
  priority: 'high' | 'medium' | 'low';
}

interface AIRecommendationsProps {
  isDarkMode?: boolean;
  userStats?: {
    moodScore: number;
    stressLevel: number;
    energyLevel: number;
    focusScore: number;
  };
}

const AIRecommendations: React.FC<AIRecommendationsProps> = ({
  isDarkMode = false,
  userStats = { moodScore: 7, stressLevel: 4, energyLevel: 6, focusScore: 8 }
}) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate AI recommendations based on user stats
  const generateRecommendations = () => {
    setIsGenerating(true);
    
    // Simulate AI processing
    setTimeout(() => {
      const newRecommendations: Recommendation[] = [];

      // Mood-based recommendations
      if (userStats.moodScore < 6) {
        newRecommendations.push({
          id: 'mood-boost-1',
          type: 'mood',
          title: 'Guided Mood Enhancement',
          description: 'Your mood score suggests you could benefit from a 10-minute guided meditation session.',
          confidence: 0.92,
          action: 'Start Session',
          timeEstimate: '10 min',
          icon: Heart,
          priority: 'high'
        });
      }

      // Stress-based recommendations
      if (userStats.stressLevel > 6) {
        newRecommendations.push({
          id: 'stress-relief-1',
          type: 'wellness',
          title: 'Breathing Exercise',
          description: 'Elevated stress levels detected. Try our 4-7-8 breathing technique to reduce cortisol.',
          confidence: 0.88,
          action: 'Start Breathing',
          timeEstimate: '5 min',
          icon: Activity,
          priority: 'high'
        });
      }

      // Energy-based recommendations
      if (userStats.energyLevel < 5) {
        newRecommendations.push({
          id: 'energy-boost-1',
          type: 'productivity',
          title: 'Energizing Break',
          description: 'Low energy detected. A quick 2-minute movement break can boost your energy by 23%.',
          confidence: 0.85,
          action: 'Take Break',
          timeEstimate: '2 min',
          icon: Zap,
          priority: 'medium'
        });
      }

      // Focus-based recommendations
      if (userStats.focusScore > 8) {
        newRecommendations.push({
          id: 'focus-optimize-1',
          type: 'learning',
          title: 'Peak Focus Opportunity',
          description: 'Your focus score is excellent! Perfect time for complex cognitive tasks or learning.',
          confidence: 0.94,
          action: 'Optimize Now',
          timeEstimate: '15-30 min',
          icon: Target,
          priority: 'medium'
        });
      }

      // Always include a general wellness tip
      newRecommendations.push({
        id: 'wellness-tip-1',
        type: 'wellness',
        title: 'Hydration Reminder',
        description: 'AI analysis suggests optimal hydration timing. Drinking water now can improve cognitive performance.',
        confidence: 0.76,
        action: 'Set Reminder',
        timeEstimate: '1 min',
        icon: Star,
        priority: 'low'
      });

      setRecommendations(newRecommendations);
      setIsGenerating(false);
    }, 1500);
  };

  useEffect(() => {
    generateRecommendations();
  }, []); // Add empty dependency array to run only once

  const dismissRecommendation = (id: string) => {
    setDismissedIds(prev => new Set([...prev, id]));
  };

  const getTypeConfig = (type: Recommendation['type']) => {
    const configs = {
      wellness: {
        gradient: 'from-green-500 to-emerald-500',
        bg: isDarkMode ? 'bg-green-900/20 border-green-700/50' : 'bg-green-50 border-green-200',
        text: isDarkMode ? 'text-green-300' : 'text-green-800'
      },
      productivity: {
        gradient: 'from-blue-500 to-cyan-500',
        bg: isDarkMode ? 'bg-blue-900/20 border-blue-700/50' : 'bg-blue-50 border-blue-200',
        text: isDarkMode ? 'text-blue-300' : 'text-blue-800'
      },
      mood: {
        gradient: 'from-purple-500 to-pink-500',
        bg: isDarkMode ? 'bg-purple-900/20 border-purple-700/50' : 'bg-purple-50 border-purple-200',
        text: isDarkMode ? 'text-purple-300' : 'text-purple-800'
      },
      learning: {
        gradient: 'from-orange-500 to-amber-500',
        bg: isDarkMode ? 'bg-orange-900/20 border-orange-700/50' : 'bg-orange-50 border-orange-200',
        text: isDarkMode ? 'text-orange-300' : 'text-orange-800'
      }
    };
    return configs[type];
  };

  const visibleRecommendations = recommendations.filter(rec => !dismissedIds.has(rec.id));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600`}>
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              AI Recommendations
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Personalized insights based on your wellness data
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={generateRecommendations}
          disabled={isGenerating}
          className={`p-2 rounded-lg transition-all duration-300 ${
            isDarkMode
              ? 'bg-slate-700 text-slate-200 hover:bg-slate-600'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          } ${isGenerating ? 'animate-pulse' : ''}`}
        >
          <Sparkles className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Loading State */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-xl border ${
              isDarkMode ? 'bg-slate-800/50 border-slate-600' : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                AI is analyzing your wellness patterns...
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recommendations */}
      <div className="space-y-3">
        <AnimatePresence>
          {visibleRecommendations.map((recommendation, index) => {
            const config = getTypeConfig(recommendation.type);
            const IconComponent = recommendation.icon || Lightbulb;

            return (
              <motion.div
                key={recommendation.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                className={`relative p-4 rounded-xl border ${config.bg} backdrop-blur-sm`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${config.gradient}`}>
                      <IconComponent className="w-4 h-4 text-white" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className={`font-semibold ${config.text}`}>
                          {recommendation.title}
                        </h4>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          recommendation.priority === 'high' 
                            ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                            : recommendation.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                          {recommendation.priority}
                        </span>
                      </div>

                      <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {recommendation.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <TrendingUp className="w-3 h-3 text-green-500" />
                            <span className="text-xs text-green-500 font-medium">
                              {Math.round(recommendation.confidence * 100)}% confidence
                            </span>
                          </div>
                          {recommendation.timeEstimate && (
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3 text-gray-400" />
                              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {recommendation.timeEstimate}
                              </span>
                            </div>
                          )}
                        </div>

                        {recommendation.action && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`px-3 py-1 text-xs font-medium rounded-lg bg-gradient-to-r ${config.gradient} text-white hover:opacity-90 transition-opacity`}
                          >
                            {recommendation.action}
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => dismissRecommendation(recommendation.id)}
                    className={`p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
                      isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <X className="w-3 h-3" />
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {visibleRecommendations.length === 0 && !isGenerating && (
        <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No new recommendations at this time.</p>
          <p className="text-xs mt-1">Check back later for personalized insights!</p>
        </div>
      )}
    </div>
  );
};

export default AIRecommendations;
