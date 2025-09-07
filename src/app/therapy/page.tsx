'use client';

import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Brain,
    Heart,
    Moon,
    Sparkles,
    Star,
    Sun,
    Target,
    Users,
    Zap
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function TherapyPage() {
  const [selectedTherapy, setSelectedTherapy] = useState<string | null>(null);

  const therapyModules = [
    {
      id: 'ai-therapist',
      title: 'AI Therapist Pro',
      description: 'Advanced AI therapist with CBT, DBT, and mindfulness protocols',
      icon: Brain,
      color: 'from-purple-500 to-pink-500',
      sessions: 'Unlimited',
      duration: 'As needed',
      href: '/therapy/ai-therapist',
      featured: true
    },
    {
      id: 'cbt',
      title: 'Cognitive Behavioral Therapy',
      description: 'AI-guided CBT sessions to help reframe negative thought patterns',
      icon: Brain,
      color: 'from-blue-400 to-purple-600',
      sessions: 12,
      duration: '30-45 min'
    },
    {
      id: 'mindfulness',
      title: 'Mindfulness & Meditation',
      description: 'Guided meditation sessions tailored to your emotional state',
      icon: Sun,
      color: 'from-yellow-400 to-orange-500',
      sessions: 8,
      duration: '15-30 min'
    },
    {
      id: 'stress',
      title: 'Stress Management',
      description: 'Learn effective techniques to manage and reduce stress',
      icon: Target,
      color: 'from-green-400 to-teal-500',
      sessions: 10,
      duration: '20-40 min'
    },
    {
      id: 'sleep',
      title: 'Sleep Therapy',
      description: 'Improve your sleep quality with personalized sleep hygiene',
      icon: Moon,
      color: 'from-indigo-400 to-purple-600',
      sessions: 6,
      duration: '25-35 min'
    },
    {
      id: 'anxiety',
      title: 'Anxiety Relief',
      description: 'Specialized techniques for managing anxiety and panic',
      icon: Heart,
      color: 'from-pink-400 to-rose-500',
      sessions: 14,
      duration: '30-50 min'
    },
    {
      id: 'group',
      title: 'Group Therapy',
      description: 'Connect with others in supportive group sessions',
      icon: Users,
      color: 'from-cyan-400 to-blue-500',
      sessions: 'Ongoing',
      duration: '60 min'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-50 flex items-center justify-between p-6 backdrop-blur-xl bg-white/30 border-b border-white/20"
      >
        <Link href="/" className="flex items-center space-x-3 group">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 360 }}
            transition={{ duration: 0.6 }}
            className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
          >
            <Brain className="w-7 h-7 text-white" />
          </motion.div>
          <div>
            <span className="text-2xl font-bold text-gray-800">MindScope</span>
            <div className="text-xs text-gray-500">AI Mental Health</div>
          </div>
        </Link>

        <Link
          href="/"
          className="flex items-center space-x-2 px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-300"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </motion.header>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto px-6 py-20 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 150 }}
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-200/50 mb-8"
          >
            <Sparkles className="w-5 h-5 text-blue-600" />
            <span className="text-blue-700 font-medium">AI-Powered Therapy Sessions</span>
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-gray-800 via-blue-800 to-purple-800 bg-clip-text text-transparent">
              Personalized
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Therapy
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Experience evidence-based therapy modules powered by AI that adapt to your unique needs, 
            emotional state, and progress in real-time.
          </p>
        </motion.div>
      </div>

      {/* Therapy Modules Grid */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-center mb-4"
        >
          Choose Your Therapy Path
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-gray-600 text-center mb-16"
        >
          Our AI analyzes your emotional patterns to recommend the most effective therapy modules
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {therapyModules.map((module, index) => {
            const Icon = module.icon;
            const ModuleCard = (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ 
                  y: -10,
                  transition: { duration: 0.3 }
                }}
                className="group cursor-pointer"
                onClick={() => !module.href && setSelectedTherapy(module.id)}
              >
                <div className="relative overflow-hidden rounded-3xl bg-white/60 backdrop-blur-sm border border-white/20 p-8 h-full shadow-lg hover:shadow-2xl transition-all duration-500">
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${module.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                  
                  {/* Featured Badge */}
                  {module.featured && (
                    <div className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold rounded-full">
                      NEW
                    </div>
                  )}
                  
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${module.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold mb-3 group-hover:text-gray-900 transition-colors">
                    {module.title}
                  </h3>
                  <p className="text-gray-600 mb-6 line-clamp-3">
                    {module.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4" />
                      <span>{module.sessions} sessions</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Zap className="w-4 h-4" />
                      <span>{module.duration}</span>
                    </div>
                  </div>

                  {/* Hover Effect */}
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                  />
                </div>
              </motion.div>
            );

            // Wrap with Link if href is provided
            if (module.href) {
              return (
                <Link key={module.id} href={module.href}>
                  {ModuleCard}
                </Link>
              );
            }

            return ModuleCard;
          })}
        </div>
      </div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="max-w-4xl mx-auto px-6 py-20 text-center"
      >
        <div className="rounded-3xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-white/20 p-12">
          <h3 className="text-3xl font-bold mb-4">
            Ready to Start Your Healing Journey?
          </h3>
          <p className="text-gray-600 mb-8">
            Our AI will create a personalized therapy plan based on your unique needs and emotional patterns.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/onboarding">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Start Free Assessment
              </motion.button>
            </Link>
            <Link href="/dashboard">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white/40 backdrop-blur-sm border border-white/20 rounded-2xl font-semibold hover:bg-white/60 transition-all duration-300"
              >
                View Dashboard
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
