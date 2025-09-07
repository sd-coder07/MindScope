'use client';

import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Brain,
    Heart,
    MessageCircle,
    Shield,
    Sparkles,
    Star,
    Users,
    UserPlus,
    Globe,
    Lock,
    Zap
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState('groups');

  const communityGroups = [
    {
      id: 'anxiety-support',
      name: 'Anxiety Support Circle',
      members: 1247,
      description: 'A safe space for sharing experiences and coping strategies for anxiety management.',
      category: 'Mental Health',
      isPrivate: true,
      activeNow: 23
    },
    {
      id: 'mindfulness-journey',
      name: 'Mindfulness Journey',
      members: 892,
      description: 'Daily mindfulness practices and meditation discussions.',
      category: 'Wellness',
      isPrivate: false,
      activeNow: 15
    },
    {
      id: 'stress-free-living',
      name: 'Stress-Free Living',
      members: 2156,
      description: 'Tips, techniques, and support for managing daily stress.',
      category: 'Lifestyle',
      isPrivate: false,
      activeNow: 31
    },
    {
      id: 'sleep-wellness',
      name: 'Sleep Wellness Hub',
      members: 645,
      description: 'Improving sleep quality and addressing sleep-related concerns.',
      category: 'Health',
      isPrivate: true,
      activeNow: 8
    },
    {
      id: 'young-adults',
      name: 'Young Adults (18-25)',
      members: 1834,
      description: 'Mental health support specifically for young adults navigating life transitions.',
      category: 'Age Group',
      isPrivate: true,
      activeNow: 42
    },
    {
      id: 'creative-therapy',
      name: 'Creative Therapy',
      members: 567,
      description: 'Using art, music, and writing as therapeutic tools.',
      category: 'Creative',
      isPrivate: false,
      activeNow: 12
    }
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: 'Weekly Mindfulness Session',
      time: 'Today, 7:00 PM',
      participants: 45,
      type: 'Virtual'
    },
    {
      id: 2,
      title: 'Anxiety Coping Workshop',
      time: 'Tomorrow, 2:00 PM',
      participants: 28,
      type: 'Interactive'
    },
    {
      id: 3,
      title: 'Sleep Hygiene Masterclass',
      time: 'Friday, 6:00 PM',
      participants: 67,
      type: 'Educational'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-100">
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
            className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center"
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
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-200/50 mb-8"
          >
            <Shield className="w-5 h-5 text-purple-600" />
            <span className="text-purple-700 font-medium">Anonymous & Secure</span>
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-gray-800 via-purple-800 to-pink-800 bg-clip-text text-transparent">
              Safe
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-rose-500 bg-clip-text text-transparent">
              Community
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Connect with others on similar journeys in a supportive, anonymous environment. 
            Share experiences, find understanding, and grow together.
          </p>

          <div className="flex items-center justify-center space-x-8 text-gray-500">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>8,342 Members</span>
            </div>
            <div className="flex items-center space-x-2">
              <Globe className="w-5 h-5" />
              <span>24/7 Support</span>
            </div>
            <div className="flex items-center space-x-2">
              <Lock className="w-5 h-5" />
              <span>Anonymous</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-center mb-12">
          <div className="flex bg-white/40 backdrop-blur-sm rounded-2xl p-2 border border-white/20">
            {[
              { id: 'groups', label: 'Support Groups', icon: Users },
              { id: 'events', label: 'Events', icon: Sparkles },
              { id: 'resources', label: 'Resources', icon: Heart }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        {activeTab === 'groups' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {communityGroups.map((group, index) => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="group cursor-pointer"
                >
                  <div className="bg-white/60 backdrop-blur-sm border border-white/20 rounded-3xl p-6 h-full hover:shadow-xl transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800 group-hover:text-purple-600 transition-colors">
                            {group.name}
                          </h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <span>{group.members.toLocaleString()} members</span>
                            {group.isPrivate && <Lock className="w-3 h-3" />}
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {group.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-sm text-gray-500">{group.activeNow} online</span>
                      </div>
                      <div className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-xs font-medium">
                        {group.category}
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full mt-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium opacity-0 group-hover:opacity-100 transition-all duration-300"
                    >
                      Join Group
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'events' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {upcomingEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/60 backdrop-blur-sm border border-white/20 rounded-3xl p-6 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{event.title}</h3>
                      <p className="text-gray-600">{event.time}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2">
                        <span>{event.participants} participants</span>
                        <span className="px-2 py-1 bg-purple-100 text-purple-600 rounded-full">
                          {event.type}
                        </span>
                      </div>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium"
                  >
                    Join Event
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeTab === 'resources' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            <div className="bg-white/60 backdrop-blur-sm border border-white/20 rounded-3xl p-8">
              <Heart className="w-12 h-12 text-purple-500 mb-4" />
              <h3 className="text-2xl font-bold mb-4">Crisis Support</h3>
              <p className="text-gray-600 mb-6">
                24/7 crisis support resources and immediate help connections for urgent situations.
              </p>
              <button className="w-full py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors">
                Get Help Now
              </button>
            </div>

            <div className="bg-white/60 backdrop-blur-sm border border-white/20 rounded-3xl p-8">
              <MessageCircle className="w-12 h-12 text-purple-500 mb-4" />
              <h3 className="text-2xl font-bold mb-4">Peer Support</h3>
              <p className="text-gray-600 mb-6">
                Connect with trained peer supporters who understand your journey and can offer guidance.
              </p>
              <button className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium">
                Find a Peer Supporter
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Join CTA */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="max-w-4xl mx-auto px-6 py-20 text-center"
      >
        <div className="rounded-3xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-rose-500/10 backdrop-blur-sm border border-white/20 p-12">
          <h3 className="text-3xl font-bold mb-4">
            Ready to Join Our Community?
          </h3>
          <p className="text-gray-600 mb-8">
            Take the first step towards connection and support. Your mental health journey doesn&apos;t have to be alone.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/onboarding">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <UserPlus className="w-5 h-5" />
                <span>Join Community</span>
              </motion.button>
            </Link>
            <Link href="/dashboard">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white/40 backdrop-blur-sm border border-white/20 rounded-2xl font-semibold hover:bg-white/60 transition-all duration-300"
              >
                Explore Features
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
