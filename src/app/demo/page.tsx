'use client';

import BreathingExercise from '@/components/BreathingExercise';
import CameraErrorBoundary from '@/components/CameraErrorBoundary';
import ErrorBoundary from '@/components/ErrorBoundary';
import EmotionAnalysisWidget from '@/components/EmotionAnalysisWidget';
import TensorFlowErrorBoundary from '@/components/TensorFlowErrorBoundary';
import { motion } from 'framer-motion';
import { Activity, ArrowRight, Brain, Eye, Heart, Play } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function DemoPage() {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);

  const demos = [
    {
      id: 'breathing',
      title: 'Breathing Exercise',
      description: 'Experience our interactive breathing guidance with real-time biofeedback',
      icon: Activity,
      color: 'serenity',
      component: BreathingExercise
    },
    {
      id: 'emotion',
      title: 'Emotion Detection',
      description: 'Try our advanced facial emotion analysis technology',
      icon: Eye,
      color: 'ocean',
      component: EmotionAnalysisWidget
    },
    {
      id: 'mood',
      title: 'Mood Analytics',
      description: 'See how we track and analyze your mental health patterns',
      icon: Heart,
      color: 'healing',
      component: () => <MoodAnalyticsDemo />
    },
    {
      id: 'ai',
      title: 'AI Wellness Coach',
      description: 'Chat with our AI-powered mental health companion',
      icon: Brain,
      color: 'sunset',
      component: () => <AICoachDemo />
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-serenity-50 via-healing-50 to-warm-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-serenity-400 to-healing-400 rounded-full flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-800">MindScope</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link href="/onboarding" className="text-gray-600 hover:text-gray-800 transition-colors">
                Get Started
              </Link>
              <Link href="/dashboard" className="px-4 py-2 bg-serenity-500 text-white rounded-lg hover:bg-serenity-600 transition-colors">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            Experience the Future of 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-serenity-400 to-healing-400">
              {" "}Mental Health
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Try our revolutionary features and see how MindScope can transform your mental wellness journey. 
            No account needed - just pure innovation at your fingertips.
          </p>
        </motion.div>

        {activeDemo ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl p-8"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-800">
                {demos.find(d => d.id === activeDemo)?.title}
              </h2>
              <button
                onClick={() => setActiveDemo(null)}
                className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
              >
                ← Back to Demos
              </button>
            </div>
            
            <div className="demo-container">
              {activeDemo === 'breathing' && (
                <ErrorBoundary>
                  <BreathingExercise 
                    pattern={[4, 4, 4, 4]} 
                    duration={120}
                    onComplete={() => console.log('Demo completed!')}
                  />
                </ErrorBoundary>
              )}
              {activeDemo === 'emotion' && (
                <TensorFlowErrorBoundary>
                  <CameraErrorBoundary>
                    <EmotionAnalysisWidget />
                  </CameraErrorBoundary>
                </TensorFlowErrorBoundary>
              )}
              {activeDemo === 'mood' && (
                <ErrorBoundary>
                  <MoodAnalyticsDemo />
                </ErrorBoundary>
              )}
              {activeDemo === 'ai' && (
                <ErrorBoundary>
                  <AICoachDemo />
                </ErrorBoundary>
              )}
            </div>
          </motion.div>
        ) : (
          <>
            {/* Demo Grid */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {demos.map((demo, index) => (
                <motion.div
                  key={demo.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.15 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="bg-white rounded-3xl shadow-xl p-8 cursor-pointer group"
                  onClick={() => setActiveDemo(demo.id)}
                >
                  <div className={`w-16 h-16 bg-gradient-to-r from-${demo.color}-400 to-${demo.color}-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <demo.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">
                    {demo.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {demo.description}
                  </p>
                  
                  <div className="flex items-center text-gray-700 group-hover:text-serenity-600 transition-colors">
                    <Play className="w-5 h-5 mr-2" />
                    <span className="font-medium">Try Demo</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Features Showcase */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-r from-serenity-400 to-healing-400 rounded-3xl p-12 text-white text-center"
            >
              <h2 className="text-4xl font-bold mb-6">
                Ready to Start Your Journey?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Join thousands who have transformed their mental health with MindScope
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/onboarding">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-white text-serenity-600 rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    Complete Onboarding
                  </motion.button>
                </Link>
                <Link href="/dashboard">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-white/20 text-white rounded-xl font-semibold hover:bg-white/30 transition-all"
                  >
                    Explore Dashboard
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}

function MoodAnalyticsDemo() {
  const mockData = [
    { date: '2024-01-01', mood: 7.2, stress: 3.1, energy: 8.5 },
    { date: '2024-01-02', mood: 6.8, stress: 4.2, energy: 7.1 },
    { date: '2024-01-03', mood: 8.1, stress: 2.5, energy: 9.2 },
    { date: '2024-01-04', mood: 7.5, stress: 3.8, energy: 8.0 },
    { date: '2024-01-05', mood: 8.9, stress: 1.9, energy: 9.5 },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">
          Your Mental Health Analytics
        </h3>
        <p className="text-gray-600">
          This demo shows how MindScope tracks and analyzes your mental health patterns over time
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {[
          { label: 'Average Mood', value: '7.5/10', color: 'serenity', trend: '+12%' },
          { label: 'Stress Level', value: '3.1/10', color: 'ocean', trend: '-8%' },
          { label: 'Energy Level', value: '8.5/10', color: 'healing', trend: '+15%' }
        ].map((metric, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.2 }}
            className={`bg-gradient-to-br from-${metric.color}-50 to-${metric.color}-100 rounded-2xl p-6 text-center`}
          >
            <div className="text-3xl font-bold text-gray-800 mb-2">
              {metric.value}
            </div>
            <div className="text-gray-600 mb-2">{metric.label}</div>
            <div className="text-green-600 text-sm font-medium">
              {metric.trend} this week
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-serenity-50 to-healing-50 rounded-2xl p-6">
        <h4 className="text-xl font-semibold text-gray-800 mb-4">AI Insights</h4>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-serenity-400 rounded-full mt-2"></div>
            <p className="text-gray-700">Your mood has been consistently improving over the past week</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-healing-400 rounded-full mt-2"></div>
            <p className="text-gray-700">Your energy levels peak between 9-11 AM - ideal for important tasks</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-ocean-400 rounded-full mt-2"></div>
            <p className="text-gray-700">Stress tends to increase on Mondays - consider starting with breathing exercises</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AICoachDemo() {
  const [messages, setMessages] = useState([
    {
      type: 'ai',
      content: "Hello! I'm your AI wellness coach. I'm here to support your mental health journey. How are you feeling today?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const responses = [
    "That's understandable. Many people experience stress during busy periods. Have you tried our 4-7-8 breathing technique?",
    "I'm glad to hear you're feeling better! What activities have been helping you maintain this positive mood?",
    "It sounds like you're going through a challenging time. Remember, it's okay to feel this way. Would you like to try a grounding exercise?",
    "Your awareness of your emotions is a great first step. Let's explore some coping strategies that might help.",
    "That's wonderful progress! Celebrating small wins is important for your mental health journey."
  ];

  const sendMessage = () => {
    if (!inputMessage.trim()) return;

    const newUserMessage = {
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    const aiResponse = {
      type: 'ai',
      content: responses[Math.floor(Math.random() * responses.length)],
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage, aiResponse]);
    setInputMessage('');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gradient-to-r from-serenity-50 to-healing-50 rounded-2xl p-6 mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          AI Wellness Coach Demo
        </h3>
        <p className="text-gray-600 text-center">
          Experience how our AI companion provides personalized mental health support
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="h-96 overflow-y-auto mb-4 space-y-4">
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                message.type === 'user' 
                  ? 'bg-serenity-500 text-white' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                <p className="text-sm">{message.content}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex space-x-3">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Share how you're feeling..."
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-serenity-400"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={sendMessage}
            className="px-6 py-3 bg-serenity-500 text-white rounded-xl hover:bg-serenity-600 transition-colors"
          >
            Send
          </motion.button>
        </div>

        <div className="mt-4 text-center text-sm text-gray-500">
          💡 This is a simplified demo. The full AI coach learns from your patterns and provides personalized insights.
        </div>
      </div>
    </div>
  );
}
