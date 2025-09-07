'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Brain, 
  Calendar, 
  Clock, 
  Target,
  AlertTriangle,
  CheckCircle,
  Info,
  BarChart3,
  LineChart,
  Activity
} from 'lucide-react';

interface Prediction {
  id: string;
  type: 'mood' | 'stress' | 'energy' | 'focus';
  metric: string;
  currentValue: number;
  predictedValue: number;
  timeframe: string;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
  insights: string[];
  recommendations: string[];
}

interface PredictiveAnalyticsProps {
  isDarkMode?: boolean;
  historicalData?: {
    mood: number[];
    stress: number[];
    energy: number[];
    focus: number[];
  };
}

const PredictiveAnalytics: React.FC<PredictiveAnalyticsProps> = ({
  isDarkMode = false,
  historicalData = {
    mood: [6, 7, 5, 8, 6, 7, 8],
    stress: [4, 3, 6, 2, 5, 3, 4],
    energy: [7, 6, 5, 8, 7, 6, 7],
    focus: [8, 7, 9, 6, 8, 9, 8]
  }
}) => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');

  const timeframes = [
    { id: '24h', label: '24 Hours', days: 1 },
    { id: '3d', label: '3 Days', days: 3 },
    { id: '1w', label: '1 Week', days: 7 },
    { id: '1m', label: '1 Month', days: 30 }
  ];

  // Simulate predictive analytics based on historical data
  const generatePredictions = useCallback(() => {
    setIsAnalyzing(true);
    
    setTimeout(() => {
      const newPredictions: Prediction[] = [];

      // Mood Prediction
      const moodTrend = getMoodTrend(historicalData.mood);
      const moodPrediction = predictNextValue(historicalData.mood, selectedTimeframe);
      
      newPredictions.push({
        id: 'mood-pred',
        type: 'mood',
        metric: 'Mood Score',
        currentValue: historicalData.mood[historicalData.mood.length - 1],
        predictedValue: moodPrediction.value,
        timeframe: selectedTimeframe,
        confidence: moodPrediction.confidence,
        trend: moodTrend,
        insights: [
          `Your mood shows a ${moodTrend} trend over the past week`,
          `Typical mood variations occur in the afternoon hours`,
          `Weekend patterns differ from weekday patterns by 12%`
        ],
        recommendations: [
          'Schedule important tasks during predicted high-mood periods',
          'Plan relaxation activities before predicted dips',
          'Consider mood-tracking notifications for pattern awareness'
        ]
      });

      // Stress Prediction
      const stressTrend = getStressTrend(historicalData.stress);
      const stressPrediction = predictNextValue(historicalData.stress, selectedTimeframe);
      
      newPredictions.push({
        id: 'stress-pred',
        type: 'stress',
        metric: 'Stress Level',
        currentValue: historicalData.stress[historicalData.stress.length - 1],
        predictedValue: stressPrediction.value,
        timeframe: selectedTimeframe,
        confidence: stressPrediction.confidence,
        trend: stressTrend === 'up' ? 'down' : 'up', // Inverted for stress
        insights: [
          `Stress levels typically peak during midweek periods`,
          `Morning stress is 23% lower than evening stress`,
          `Exercise correlates with 31% stress reduction`
        ],
        recommendations: [
          'Schedule breathing exercises before predicted stress peaks',
          'Block calendar for stress-relief activities',
          'Enable proactive stress management notifications'
        ]
      });

      // Energy Prediction
      const energyTrend = getEnergyTrend(historicalData.energy);
      const energyPrediction = predictNextValue(historicalData.energy, selectedTimeframe);
      
      newPredictions.push({
        id: 'energy-pred',
        type: 'energy',
        metric: 'Energy Level',
        currentValue: historicalData.energy[historicalData.energy.length - 1],
        predictedValue: energyPrediction.value,
        timeframe: selectedTimeframe,
        confidence: energyPrediction.confidence,
        trend: energyTrend,
        insights: [
          `Your energy follows a consistent circadian rhythm`,
          `Highest energy periods occur at 10 AM and 3 PM`,
          `Post-meal energy dips are predictable and manageable`
        ],
        recommendations: [
          'Schedule high-focus tasks during predicted energy peaks',
          'Plan light activities during predicted energy dips',
          'Use energy-boosting techniques proactively'
        ]
      });

      // Focus Prediction
      const focusTrend = getFocusTrend(historicalData.focus);
      const focusPrediction = predictNextValue(historicalData.focus, selectedTimeframe);
      
      newPredictions.push({
        id: 'focus-pred',
        type: 'focus',
        metric: 'Focus Score',
        currentValue: historicalData.focus[historicalData.focus.length - 1],
        predictedValue: focusPrediction.value,
        timeframe: selectedTimeframe,
        confidence: focusPrediction.confidence,
        trend: focusTrend,
        insights: [
          `Focus performance shows strong correlation with sleep quality`,
          `Optimal focus windows: 9-11 AM and 2-4 PM`,
          `Environment changes impact focus by 18%`
        ],
        recommendations: [
          'Block deep work sessions during predicted focus peaks',
          'Minimize distractions during optimal focus windows',
          'Use focus-enhancement techniques proactively'
        ]
      });

      setPredictions(newPredictions);
      setIsAnalyzing(false);
    }, 2000);
  }, [selectedTimeframe, historicalData]);

  // Helper functions for trend analysis
  const getMoodTrend = (data: number[]) => {
    const recent = data.slice(-3);
    const earlier = data.slice(-6, -3);
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length;
    
    if (recentAvg > earlierAvg + 0.5) return 'up';
    if (recentAvg < earlierAvg - 0.5) return 'down';
    return 'stable';
  };

  const getStressTrend = (data: number[]) => getMoodTrend(data);
  const getEnergyTrend = (data: number[]) => getMoodTrend(data);
  const getFocusTrend = (data: number[]) => getMoodTrend(data);

  const predictNextValue = (data: number[], timeframe: string) => {
    const recent = data.slice(-3);
    const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const variance = recent.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / recent.length;
    
    // Simple prediction with some randomness
    const trend = (recent[2] - recent[0]) / 2;
    const prediction = Math.max(1, Math.min(10, avg + trend + (Math.random() - 0.5)));
    const confidence = Math.max(0.6, 1 - variance / 10);
    
    return { value: Math.round(prediction * 10) / 10, confidence };
  };

  useEffect(() => {
    generatePredictions();
  }, [selectedTimeframe, generatePredictions]);

  const getMetricIcon = (type: Prediction['type']) => {
    switch (type) {
      case 'mood': return Brain;
      case 'stress': return AlertTriangle;
      case 'energy': return Activity;
      case 'focus': return Target;
      default: return BarChart3;
    }
  };

  const getMetricColor = (type: Prediction['type']) => {
    switch (type) {
      case 'mood': return 'from-purple-500 to-pink-500';
      case 'stress': return 'from-red-500 to-orange-500';
      case 'energy': return 'from-green-500 to-emerald-500';
      case 'focus': return 'from-blue-500 to-cyan-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  const getTrendIcon = (trend: Prediction['trend']) => {
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      default: return BarChart3;
    }
  };

  const getTrendColor = (trend: Prediction['trend'], type: Prediction['type']) => {
    if (type === 'stress') {
      // For stress, down is good, up is bad
      return trend === 'down' ? 'text-green-500' : trend === 'up' ? 'text-red-500' : 'text-gray-500';
    }
    // For other metrics, up is good, down is bad
    return trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600">
            <LineChart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Predictive Analytics
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              AI-powered wellness forecasting
            </p>
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center space-x-2">
          {timeframes.map(tf => (
            <motion.button
              key={tf.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedTimeframe(tf.id)}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-all duration-300 ${
                selectedTimeframe === tf.id
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                  : isDarkMode
                    ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tf.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-6 rounded-xl border ${
              isDarkMode ? 'bg-slate-800/50 border-slate-600' : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-center justify-center space-x-3">
              <div className="w-8 h-8 border-3 border-cyan-600 border-t-transparent rounded-full animate-spin" />
              <span className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                AI is analyzing patterns and generating predictions...
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Predictions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatePresence>
          {predictions.map((prediction, index) => {
            const IconComponent = getMetricIcon(prediction.type);
            const TrendIcon = getTrendIcon(prediction.trend);
            const gradient = getMetricColor(prediction.type);
            const trendColor = getTrendColor(prediction.trend, prediction.type);

            return (
              <motion.div
                key={prediction.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 rounded-xl border backdrop-blur-sm ${
                  isDarkMode ? 'bg-slate-800/50 border-slate-600' : 'bg-white/80 border-gray-200'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${gradient}`}>
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        {prediction.metric}
                      </h4>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Prediction for next {prediction.timeframe}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <TrendIcon className={`w-5 h-5 ${trendColor}`} />
                    <span className={`text-sm font-medium ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {Math.round(prediction.confidence * 100)}%
                    </span>
                  </div>
                </div>

                {/* Values */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Current
                    </p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      {prediction.currentValue}
                    </p>
                  </div>
                  
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-center"
                  >
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Predicted
                    </p>
                    <p className={`text-2xl font-bold ${trendColor}`}>
                      {prediction.predictedValue}
                    </p>
                  </motion.div>
                </div>

                {/* Insights */}
                <div className="space-y-3">
                  <div>
                    <h5 className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Key Insights
                    </h5>
                    <div className="space-y-1">
                      {prediction.insights.slice(0, 2).map((insight, idx) => (
                        <div key={idx} className="flex items-start space-x-2">
                          <Info className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {insight}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Recommendations
                    </h5>
                    <div className="space-y-1">
                      {prediction.recommendations.slice(0, 2).map((rec, idx) => (
                        <div key={idx} className="flex items-start space-x-2">
                          <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {rec}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PredictiveAnalytics;
