'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
    BookOpen,
    Bot,
    Brain,
    ExternalLink,
    Headphones,
    Heart,
    Mic,
    Play,
    Sparkles,
    Star,
    Youtube,
    Zap
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface AIWellnessAssistantProps {
  currentMood?: string;
  recentActivities?: string[];
  isDarkMode?: boolean;
}

interface ContentRecommendation {
  id: string;
  title: string;
  type: 'youtube' | 'podcast' | 'article' | 'meditation' | 'exercise';
  url: string;
  duration: string;
  description: string;
  mood: string[];
  rating: number;
  thumbnail?: string;
  creator: string;
  category: string;
}

const AIWellnessAssistant: React.FC<AIWellnessAssistantProps> = ({
  currentMood = 'neutral',
  recentActivities = [],
  isDarkMode = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [personalizedContent, setPersonalizedContent] = useState<ContentRecommendation[]>([]);
  const [isListening, setIsListening] = useState(false);

  // Comprehensive content database
  const contentDatabase: ContentRecommendation[] = [
    // Anxiety Content
    {
      id: 'yt-1',
      title: '10-Minute Anxiety Relief Guided Meditation',
      type: 'youtube',
      url: 'https://www.youtube.com/results?search_query=10+minute+anxiety+relief+guided+meditation',
      duration: '10 min',
      description: 'Calm your mind with this gentle guided meditation specifically designed for anxiety relief',
      mood: ['anxious', 'stressed', 'overwhelmed'],
      rating: 4.8,
      creator: 'Headspace',
      category: 'Meditation'
    },
    {
      id: 'pod-1',
      title: 'The Anxiety Guy Podcast - Managing Daily Stress',
      type: 'podcast',
      url: 'https://open.spotify.com/search/anxiety%20guy%20podcast',
      duration: '35 min',
      description: 'Practical strategies for managing anxiety in daily life from Dennis Simsek',
      mood: ['anxious', 'stressed'],
      rating: 4.6,
      creator: 'Dennis Simsek',
      category: 'Mental Health'
    },
    {
      id: 'yt-2',
      title: 'Breathing Exercises for Panic Attacks',
      type: 'youtube',
      url: 'https://www.youtube.com/results?search_query=breathing+exercises+panic+attacks+relief',
      duration: '8 min',
      description: 'Learn 4-7-8 breathing and box breathing techniques to manage panic attacks',
      mood: ['anxious', 'panicky'],
      rating: 4.9,
      creator: 'Therapy in a Nutshell',
      category: 'Breathing'
    },

    // Depression Content
    {
      id: 'yt-3',
      title: 'Morning Motivation for Depression Recovery',
      type: 'youtube',
      url: 'https://www.youtube.com/results?search_query=morning+motivation+depression+recovery+positive',
      duration: '15 min',
      description: 'Start your day with hope and positivity - uplifting content for difficult mornings',
      mood: ['sad', 'depressed', 'low energy'],
      rating: 4.7,
      creator: 'Motivation2Study',
      category: 'Motivation'
    },
    {
      id: 'pod-2',
      title: 'Mental Health Happy Hour - Depression Stories',
      type: 'podcast',
      url: 'https://open.spotify.com/search/mental%20health%20happy%20hour',
      duration: '60 min',
      description: 'Paul Gilmartin shares honest conversations about depression with humor and hope',
      mood: ['sad', 'depressed', 'lonely'],
      rating: 4.5,
      creator: 'Paul Gilmartin',
      category: 'Mental Health'
    },
    {
      id: 'art-1',
      title: 'Understanding Depression: A Complete Guide',
      type: 'article',
      url: 'https://www.healthline.com/health/depression',
      duration: '12 min read',
      description: 'Comprehensive guide to understanding depression symptoms, causes, and treatments',
      mood: ['sad', 'depressed'],
      rating: 4.4,
      creator: 'Healthline',
      category: 'Education'
    },

    // Sleep & Relaxation
    {
      id: 'yt-4',
      title: '8 Hour Rain Sounds for Deep Sleep',
      type: 'youtube',
      url: 'https://www.youtube.com/results?search_query=8+hour+rain+sounds+deep+sleep+relaxation',
      duration: '8 hours',
      description: 'Natural rain sounds to help you fall asleep and stay asleep all night',
      mood: ['tired', 'restless', 'insomniac'],
      rating: 4.8,
      creator: 'Nature Sounds',
      category: 'Sleep'
    },
    {
      id: 'pod-3',
      title: 'Sleep With Me - Boring Bedtime Stories',
      type: 'podcast',
      url: 'https://open.spotify.com/search/sleep%20with%20me%20podcast',
      duration: '60 min',
      description: 'Intentionally boring stories designed to help you fall asleep',
      mood: ['tired', 'restless'],
      rating: 4.3,
      creator: 'Sleep With Me',
      category: 'Sleep'
    },

    // Stress Relief
    {
      id: 'yt-5',
      title: '5-Minute Office Stress Relief Meditation',
      type: 'youtube',
      url: 'https://www.youtube.com/results?search_query=5+minute+office+stress+relief+meditation',
      duration: '5 min',
      description: 'Quick meditation you can do at your desk to reduce work stress',
      mood: ['stressed', 'overwhelmed', 'work stress'],
      rating: 4.6,
      creator: 'Calm',
      category: 'Meditation'
    },
    {
      id: 'ex-1',
      title: 'Progressive Muscle Relaxation Exercise',
      type: 'exercise',
      url: 'https://www.youtube.com/results?search_query=progressive+muscle+relaxation+guided+exercise',
      duration: '20 min',
      description: 'Full body relaxation technique to release physical tension and stress',
      mood: ['stressed', 'tense', 'overwhelmed'],
      rating: 4.7,
      creator: 'Mindfulness Guide',
      category: 'Exercise'
    },

    // Motivation & Inspiration
    {
      id: 'yt-6',
      title: 'Mental Health Recovery Motivation',
      type: 'youtube',
      url: 'https://www.youtube.com/results?search_query=mental+health+recovery+motivation+inspiration',
      duration: '12 min',
      description: 'Inspiring stories and motivation for mental health recovery journey',
      mood: ['hopeless', 'unmotivated', 'lost'],
      rating: 4.8,
      creator: 'Ben Lionel Scott',
      category: 'Motivation'
    },
    {
      id: 'pod-4',
      title: 'The Tim Ferriss Show - Mental Performance',
      type: 'podcast',
      url: 'https://open.spotify.com/search/tim%20ferriss%20show',
      duration: '90 min',
      description: 'High performers share their mental health strategies and tools',
      mood: ['unmotivated', 'seeking growth'],
      rating: 4.9,
      creator: 'Tim Ferriss',
      category: 'Self-Improvement'
    },

    // Focus & Productivity
    {
      id: 'yt-7',
      title: 'Focus Music - Deep Work Concentration',
      type: 'youtube',
      url: 'https://www.youtube.com/results?search_query=focus+music+deep+work+concentration+study',
      duration: '2 hours',
      description: 'Instrumental music designed to enhance focus and productivity',
      mood: ['distracted', 'unfocused', 'procrastinating'],
      rating: 4.5,
      creator: 'Brain.fm',
      category: 'Focus'
    },

    // Mindfulness & Meditation
    {
      id: 'yt-8',
      title: 'Mindfulness for Beginners - Complete Guide',
      type: 'youtube',
      url: 'https://www.youtube.com/results?search_query=mindfulness+for+beginners+complete+guide',
      duration: '25 min',
      description: 'Learn the basics of mindfulness meditation and daily practice',
      mood: ['curious', 'beginner', 'seeking peace'],
      rating: 4.7,
      creator: 'Mindful',
      category: 'Meditation'
    },
    {
      id: 'pod-5',
      title: 'On Being - Mindfulness and Spirituality',
      type: 'podcast',
      url: 'https://open.spotify.com/search/on%20being%20podcast',
      duration: '50 min',
      description: 'Krista Tippett explores mindfulness, spirituality, and human meaning',
      mood: ['seeking meaning', 'spiritual', 'reflective'],
      rating: 4.6,
      creator: 'Krista Tippett',
      category: 'Spirituality'
    }
  ];

  const categories = [
    { id: 'all', label: 'All', icon: Sparkles },
    { id: 'youtube', label: 'Videos', icon: Youtube },
    { id: 'podcast', label: 'Podcasts', icon: Headphones },
    { id: 'meditation', label: 'Meditation', icon: Brain },
    { id: 'exercise', label: 'Exercises', icon: Heart },
    { id: 'article', label: 'Articles', icon: BookOpen }
  ];

  useEffect(() => {
    generatePersonalizedContent();
  }, [currentMood, recentActivities, activeCategory]);

  const generatePersonalizedContent = () => {
    let filtered = contentDatabase;

    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter(content => content.type === activeCategory);
    }

    // Filter by mood
    if (currentMood && currentMood !== 'neutral') {
      filtered = filtered.filter(content => 
        content.mood.some(mood => mood.includes(currentMood.toLowerCase()))
      );
    }

    // Sort by rating and relevance
    filtered = filtered.sort((a, b) => b.rating - a.rating);

    setPersonalizedContent(filtered.slice(0, 6));
  };

  const openContent = (url: string) => {
    window.open(url, '_blank', 'width=1200,height=800');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'youtube': return <Youtube className="w-4 h-4" />;
      case 'podcast': return <Headphones className="w-4 h-4" />;
      case 'article': return <BookOpen className="w-4 h-4" />;
      case 'meditation': return <Brain className="w-4 h-4" />;
      case 'exercise': return <Heart className="w-4 h-4" />;
      default: return <Play className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'youtube': return 'bg-red-500';
      case 'podcast': return 'bg-purple-500';
      case 'article': return 'bg-blue-500';
      case 'meditation': return 'bg-green-500';
      case 'exercise': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getMoodEmoji = (mood: string) => {
    switch (mood.toLowerCase()) {
      case 'anxious': return '😰';
      case 'sad': return '😢';
      case 'stressed': return '😤';
      case 'happy': return '😊';
      case 'calm': return '😌';
      case 'motivated': return '💪';
      case 'tired': return '😴';
      default: return '😐';
    }
  };

  return (
    <div className={`relative ${isDarkMode ? 'bg-slate-900' : 'bg-white'} rounded-2xl border ${isDarkMode ? 'border-slate-700' : 'border-gray-200'} shadow-xl overflow-hidden`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                AI Wellness Assistant
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Personalized content for your {getMoodEmoji(currentMood)} {currentMood} mood
              </p>
            </div>
          </div>
          <motion.button
            onClick={() => setIsExpanded(!isExpanded)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-700'} hover:bg-opacity-80 transition-colors`}
          >
            {isExpanded ? 'Minimize' : 'Explore'}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Quick Actions */}
            <div className="p-6 border-b border-gray-200 dark:border-slate-700">
              <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Quick Actions
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <motion.button
                  onClick={() => openContent('https://www.youtube.com/results?search_query=5+minute+breathing+exercise+anxiety')}
                  whileHover={{ scale: 1.02 }}
                  className="flex flex-col items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors text-center"
                >
                  <Brain className="w-8 h-8 text-blue-600 mb-2" />
                  <span className="text-sm font-medium text-blue-800">Quick Calm</span>
                </motion.button>
                
                <motion.button
                  onClick={() => openContent('https://www.youtube.com/results?search_query=motivational+video+mental+health')}
                  whileHover={{ scale: 1.02 }}
                  className="flex flex-col items-center p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors text-center"
                >
                  <Zap className="w-8 h-8 text-green-600 mb-2" />
                  <span className="text-sm font-medium text-green-800">Motivation</span>
                </motion.button>
                
                <motion.button
                  onClick={() => openContent('https://open.spotify.com/search/meditation%20podcast')}
                  whileHover={{ scale: 1.02 }}
                  className="flex flex-col items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors text-center"
                >
                  <Headphones className="w-8 h-8 text-purple-600 mb-2" />
                  <span className="text-sm font-medium text-purple-800">Podcasts</span>
                </motion.button>
                
                <motion.button
                  onClick={() => openContent('https://www.youtube.com/results?search_query=sleep+sounds+relaxation')}
                  whileHover={{ scale: 1.02 }}
                  className="flex flex-col items-center p-4 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors text-center"
                >
                  <Heart className="w-8 h-8 text-indigo-600 mb-2" />
                  <span className="text-sm font-medium text-indigo-800">Sleep Aid</span>
                </motion.button>
              </div>
            </div>

            {/* Category Filter */}
            <div className="p-6 border-b border-gray-200 dark:border-slate-700">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <motion.button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
                        activeCategory === category.id
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                          : isDarkMode 
                            ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{category.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Personalized Content */}
            <div className="p-6">
              <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Recommended for You
              </h4>
              <div className="grid md:grid-cols-2 gap-4">
                {personalizedContent.map((content) => (
                  <motion.div
                    key={content.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => openContent(content.url)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-lg ${
                      isDarkMode 
                        ? 'bg-slate-800 border-slate-700 hover:border-slate-600' 
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className={`w-8 h-8 ${getTypeColor(content.type)} rounded-lg flex items-center justify-center text-white`}>
                          {getTypeIcon(content.type)}
                        </div>
                        <div className="flex-1">
                          <h5 className={`font-semibold text-sm leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {content.title}
                          </h5>
                          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {content.creator} • {content.duration}
                          </p>
                        </div>
                      </div>
                      <ExternalLink className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    </div>
                    
                    <p className={`text-sm mb-3 leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {content.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {content.rating}
                          </span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${isDarkMode ? 'bg-slate-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                          {content.category}
                        </span>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="text-purple-500 hover:text-purple-600"
                      >
                        <Play className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Voice Assistant Trigger */}
              <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-1">
                      Voice Assistant
                    </h5>
                    <p className="text-sm text-gray-600">
                      Say &quot;recommend videos for my mood&quot; or &quot;find calming podcasts&quot;
                    </p>
                  </div>
                  <motion.button
                    onClick={() => setIsListening(!isListening)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      isListening 
                        ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white animate-pulse' 
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    }`}
                  >
                    <Mic className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIWellnessAssistant;
