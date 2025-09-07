'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import {
    Activity,
    ArrowRight,
    Brain,
    CheckCircle,
    Eye,
    Heart,
    Moon,
    Play,
    Shield,
    Sparkles,
    Star,
    Sun,
    TrendingUp,
    Users,
    Zap
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export default function HomePage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState('calm');
  const [isDark, setIsDark] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

  useEffect(() => {
    setIsLoaded(true);
    // Simulate real-time emotion detection
    const emotions = ['calm', 'happy', 'focused', 'peaceful', 'energized'];
    const interval = setInterval(() => {
      setCurrentEmotion(emotions[Math.floor(Math.random() * emotions.length)]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const getEmotionalColors = () => {
    const colors = {
      calm: { primary: '#667eea', secondary: '#764ba2', accent: '#f093fb' },
      happy: { primary: '#ffecd2', secondary: '#fcb69f', accent: '#ff6b6b' },
      focused: { primary: '#4facfe', secondary: '#00f2fe', accent: '#43e97b' },
      peaceful: { primary: '#a8edea', secondary: '#fed6e3', accent: '#d299c2' },
      energized: { primary: '#fad0c4', secondary: '#ffd1ff', accent: '#ff6b6b' },
    };
    return colors[currentEmotion as keyof typeof colors] || colors.calm;
  };

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Neural Analysis",
      description: "Advanced neural networks analyze micro-expressions and biometric data to provide unprecedented insights into your mental state",
      color: "#667eea",
      delay: 0
    },
    {
      icon: Eye,
      title: "Real-Time Emotion Detection",
      description: "Computer vision technology tracks facial landmarks and voice patterns for instant emotional awareness and feedback",
      color: "#4facfe",
      delay: 0.1
    },
    {
      icon: Heart,
      title: "Personalized Therapy Modules",
      description: "Evidence-based therapeutic interventions adapted to your unique psychological profile and current emotional state",
      color: "#ff6b6b",
      delay: 0.2
    },
    {
      icon: Shield,
      title: "Blockchain Privacy Vault",
      description: "Revolutionary zero-knowledge encryption ensures your mental health data remains completely private and secure",
      color: "#43e97b",
      delay: 0.3
    },
    {
      icon: Users,
      title: "Anonymous Peer Support",
      description: "Connect with others on similar journeys through AI-matched support groups while maintaining complete anonymity",
      color: "#f093fb",
      delay: 0.4
    },
    {
      icon: Zap,
      title: "Crisis Prevention AI",
      description: "Predictive algorithms detect early warning signs and automatically deploy personalized intervention strategies",
      color: "#ffd93d",
      delay: 0.5
    }
  ];

  const stats = [
    { number: "99.9%", label: "Privacy Protection", color: "#43e97b", icon: Shield },
    { number: "92%", label: "Stress Reduction", color: "#4facfe", icon: TrendingUp },
    { number: "24/7", label: "AI Support", color: "#667eea", icon: Activity },
    { number: "150K+", label: "Lives Transformed", color: "#ff6b6b", icon: Heart }
  ];

  const testimonials = [
    {
      name: "Sarah M.",
      role: "Anxiety Recovery",
      content: "MindScope's AI detected my panic attacks before I even realized they were happening. The personalized interventions have been life-changing.",
      rating: 5,
      avatar: "🌸"
    },
    {
      name: "David K.",
      role: "Depression Support",
      content: "The anonymous community feature helped me connect with others without fear of judgment. I finally feel understood.",
      rating: 5,
      avatar: "🌱"
    },
    {
      name: "Maria L.",
      role: "Stress Management",
      content: "The real-time emotion detection helps me catch stress before it becomes overwhelming. It's like having a therapist in my pocket.",
      rating: 5,
      avatar: "⭐"
    }
  ];

  const currentColors = getEmotionalColors();

  return (
    <div 
      ref={containerRef}
      className={`min-h-screen transition-all duration-1000 ${
        isDark 
          ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900' 
          : 'bg-gradient-to-br from-white via-blue-50 to-purple-50'
      }`}
      style={{
        background: isDark 
          ? `linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)`
          : `linear-gradient(135deg, ${currentColors.primary}20 0%, ${currentColors.secondary}10 50%, ${currentColors.accent}15 100%)`
      }}
    >
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: mousePosition.x * 0.02,
            y: mousePosition.y * 0.02,
          }}
          transition={{ type: "spring", stiffness: 100, damping: 10 }}
          className="absolute -top-40 -left-40 w-80 h-80 rounded-full opacity-20"
          style={{
            background: `radial-gradient(circle, ${currentColors.primary} 0%, transparent 70%)`
          }}
        />
        <motion.div
          animate={{
            x: mousePosition.x * -0.01,
            y: mousePosition.y * -0.01,
          }}
          transition={{ type: "spring", stiffness: 50, damping: 10 }}
          className="absolute -top-20 -right-20 w-60 h-60 rounded-full opacity-15"
          style={{
            background: `radial-gradient(circle, ${currentColors.secondary} 0%, transparent 70%)`
          }}
        />
        <motion.div
          animate={{
            x: mousePosition.x * 0.015,
            y: mousePosition.y * 0.015,
          }}
          transition={{ type: "spring", stiffness: 75, damping: 10 }}
          className="absolute bottom-0 left-1/3 w-40 h-40 rounded-full opacity-25"
          style={{
            background: `radial-gradient(circle, ${currentColors.accent} 0%, transparent 70%)`
          }}
        />
      </div>
      {/* Modern Navigation */}
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative z-50 flex items-center justify-between p-6 ${
          isDark 
            ? 'backdrop-blur-xl bg-black/20 border-b border-white/10' 
            : 'backdrop-blur-xl bg-white/30 border-b border-white/20'
        }`}
      >
        <Link href="/" className="flex items-center space-x-3 group">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 360 }}
            transition={{ duration: 0.6 }}
            className="relative w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${currentColors.primary} 0%, ${currentColors.secondary} 100%)`
            }}
          >
            <Brain className="w-7 h-7 text-white" />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-2xl border-2 border-white/30"
            />
          </motion.div>
          <div>
            <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              MindScope
            </span>
            <div className="text-xs text-gray-500">AI Mental Health</div>
          </div>
        </Link>
        
        <div className="hidden md:flex items-center space-x-8">
          {[
            { href: '/dashboard', label: 'Dashboard' },
            { href: '/demo', label: 'AI Demo' },
            { href: '/therapy', label: 'Therapy' },
            { href: '/community', label: 'Community' }
          ].map((link, index) => (
            <Link key={link.href} href={link.href}>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`px-4 py-2 rounded-full transition-all duration-300 hover:scale-105 ${
                  isDark 
                    ? 'text-white/80 hover:text-white hover:bg-white/10' 
                    : 'text-gray-700 hover:text-gray-900 hover:bg-white/20'
                }`}
              >
                {link.label}
              </motion.div>
            </Link>
          ))}
        </div>
        
        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsDark(!isDark)}
            className={`p-3 rounded-full transition-all duration-300 ${
              isDark 
                ? 'bg-white/10 hover:bg-white/20 text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </motion.button>
          
          <Link href="/auth/signin">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                isDark 
                  ? 'text-white border border-white/20 hover:bg-white/10' 
                  : 'text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              Sign In
            </motion.button>
          </Link>
          
          <Link href="/auth/signup">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
              style={{
                background: `linear-gradient(135deg, ${currentColors.primary} 0%, ${currentColors.secondary} 100%)`,
                color: 'white'
              }}
            >
              Get Started
            </motion.button>
          </Link>
        </div>
      </motion.nav>

      {/* Revolutionary Hero Section */}
      <section className="relative px-6 py-20 text-center overflow-hidden">
        <motion.div
          style={{ y }}
          className="max-w-7xl mx-auto relative z-10"
        >
          {/* Emotion Status Indicator */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 flex justify-center"
          >
            <motion.div
              animate={{ 
                borderColor: [currentColors.primary, currentColors.secondary, currentColors.accent, currentColors.primary],
                scale: [1, 1.05, 1]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className={`px-6 py-3 rounded-full border-2 ${
                isDark ? 'bg-black/20' : 'bg-white/20'
              } backdrop-blur-sm flex items-center space-x-3`}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: currentColors.primary }}
              />
              <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-700'}`}>
                AI detecting emotion: <span className="capitalize font-bold">{currentEmotion}</span>
              </span>
              <Sparkles className="w-4 h-4 text-yellow-400" />
            </motion.div>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 50 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className={`text-6xl md:text-8xl lg:text-9xl font-bold mb-8 leading-tight ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}
          >
            Transform Your
            <br />
            <motion.span
              animate={{ 
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ duration: 5, repeat: Infinity }}
              className="bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 bg-clip-text text-transparent bg-[length:200%_auto]"
              style={{
                backgroundImage: `linear-gradient(90deg, ${currentColors.primary}, ${currentColors.secondary}, ${currentColors.accent}, ${currentColors.primary})`
              }}
            >
              Mental Health
            </motion.span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className={`text-xl md:text-2xl lg:text-3xl mb-12 max-w-4xl mx-auto leading-relaxed ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            Experience the future of mental wellness with 
            <span className="font-semibold text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(135deg, ${currentColors.primary}, ${currentColors.secondary})` }}>
              {' '}AI-powered insights{' '}
            </span>
            that understand your emotions in real-time, providing personalized therapy and connecting you with a supportive community.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
          >
            <Link href="/auth/signup">
              <motion.button
                whileHover={{ 
                  scale: 1.05, 
                  boxShadow: `0 20px 40px ${currentColors.primary}40` 
                }}
                whileTap={{ scale: 0.95 }}
                onHoverStart={() => setIsHovering(true)}
                onHoverEnd={() => setIsHovering(false)}
                className="group px-8 py-4 rounded-2xl font-semibold text-lg text-white shadow-2xl transition-all duration-300 flex items-center space-x-3"
                style={{
                  background: `linear-gradient(135deg, ${currentColors.primary} 0%, ${currentColors.secondary} 100%)`
                }}
              >
                <span>Start Your Journey</span>
                <motion.div
                  animate={{ x: isHovering ? 5 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              </motion.button>
            </Link>
            
            <Link href="/demo">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 flex items-center space-x-3 ${
                  isDark 
                    ? 'bg-white/10 text-white border-2 border-white/20 hover:bg-white/20' 
                    : 'bg-white/50 text-gray-700 border-2 border-gray-200 hover:bg-white/80'
                }`}
              >
                <Play className="w-5 h-5" />
                <span>Try AI Demo</span>
              </motion.button>
            </Link>
          </motion.div>

          {/* Demo Video Section */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="relative max-w-4xl mx-auto"
          >
            <div className={`rounded-3xl overflow-hidden shadow-2xl ${
              isDark ? 'bg-black/20' : 'bg-white/30'
            } backdrop-blur-xl border border-white/20`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    <span className={`text-sm font-medium ml-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      MindScope AI in Action
                    </span>
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      LIVE
                    </span>
                  </motion.div>
                </div>
                
                <div className="aspect-video rounded-2xl overflow-hidden relative bg-gradient-to-br from-gray-900 to-gray-800">
                  {/* Video placeholder with play button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="group relative"
                    >
                      <motion.div
                        animate={{ 
                          boxShadow: [
                            "0 0 0 0px rgba(255, 255, 255, 0.4)",
                            "0 0 0 20px rgba(255, 255, 255, 0)",
                          ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:bg-white transition-all duration-300"
                      >
                        <Play className="w-8 h-8 text-gray-800 ml-1" fill="currentColor" />
                      </motion.div>
                    </motion.button>
                  </div>
                  
                  {/* Video overlay content */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  
                  {/* Demo features showcase */}
                  <div className="absolute top-4 left-4 right-4">
                    <div className={`rounded-lg p-3 ${isDark ? 'bg-black/40' : 'bg-white/20'} backdrop-blur-sm`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-100'}`}>
                          Real-time Emotion Detection
                        </span>
                        <motion.div
                          animate={{ 
                            backgroundColor: [currentColors.primary, currentColors.secondary, currentColors.accent, currentColors.primary]
                          }}
                          transition={{ duration: 3, repeat: Infinity }}
                          className="w-3 h-3 rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Bottom info bar */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className={`rounded-lg p-3 ${isDark ? 'bg-black/40' : 'bg-white/20'} backdrop-blur-sm`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Brain className="w-4 h-4 text-blue-400" />
                            <span className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-100'}`}>
                              AI Analysis Active
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Heart className="w-4 h-4 text-red-400" />
                            <span className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-100'}`}>
                              Heart Rate: 72 BPM
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <motion.div
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-2 h-2 rounded-full bg-green-400"
                          />
                          <span className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-100'}`}>
                            Processing...
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Demo preview thumbnails */}
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 space-y-2">
                    {['😊', '😢', '😰', '😴'].map((emoji, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.5 + index * 0.2 }}
                        className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-sm backdrop-blur-sm"
                      >
                        {emoji}
                      </motion.div>
                    ))}
                  </div>
                </div>
                
                {/* Video description */}
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Watch MindScope AI Demo
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      See how our AI detects emotions and provides real-time mental health insights
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                        isDark 
                          ? 'bg-white/10 text-white hover:bg-white/20' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Play className="w-4 h-4 mr-2 inline" />
                      Watch Demo
                    </motion.button>
                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      3:24
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Enhanced Stats Section */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`text-3xl md:text-4xl font-bold text-center mb-16 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}
          >
            Trusted by Mental Health Professionals Worldwide
          </motion.h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30, scale: 0.8 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ 
                  scale: 1.05,
                  rotateY: 5,
                }}
                className={`relative group cursor-pointer rounded-3xl p-8 text-center transition-all duration-300 ${
                  isDark 
                    ? 'bg-white/5 hover:bg-white/10 border border-white/10' 
                    : 'bg-white/50 hover:bg-white/80 border border-white/20'
                } backdrop-blur-xl shadow-xl hover:shadow-2xl`}
              >
                <motion.div
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity,
                    delay: index * 0.5
                  }}
                  className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                  style={{ 
                    background: `linear-gradient(135deg, ${stat.color}20, ${stat.color}40)`,
                    border: `2px solid ${stat.color}30`
                  }}
                >
                  <stat.icon 
                    className="w-8 h-8" 
                    style={{ color: stat.color }}
                  />
                </motion.div>
                
                <motion.div 
                  className="text-4xl md:text-5xl font-bold mb-2"
                  style={{ color: stat.color }}
                  whileHover={{ scale: 1.1 }}
                >
                  {stat.number}
                </motion.div>
                
                <div className={`text-sm font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {stat.label}
                </div>

                {/* Hover effect overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  className="absolute inset-0 rounded-3xl"
                  style={{
                    background: `linear-gradient(135deg, ${stat.color}10, transparent)`
                  }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Revolutionary Features Section */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className={`text-4xl md:text-6xl font-bold mb-6 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Revolutionary AI Features
            </h2>
            <p className={`text-xl max-w-3xl mx-auto ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Cutting-edge technology meets compassionate care in our comprehensive mental health platform
            </p>
          </motion.div>
          
          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: feature.delay, duration: 0.8 }}
                whileHover={{ 
                  scale: 1.02,
                  rotateY: 2,
                  z: 50
                }}
                className={`group feature-card-${index + 1} relative rounded-3xl p-8 transition-all duration-500 cursor-pointer ${
                  isDark 
                    ? 'bg-white/5 hover:bg-white/10 border border-white/10' 
                    : 'bg-white/60 hover:bg-white/90 border border-white/20'
                } backdrop-blur-xl shadow-xl hover:shadow-2xl overflow-hidden`}
              >
                {/* Background gradient overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  className="absolute inset-0 rounded-3xl transition-opacity duration-500"
                  style={{
                    background: `linear-gradient(135deg, ${feature.color}10, transparent 70%)`
                  }}
                />

                <div className="relative z-10">
                  <motion.div
                    whileHover={{ 
                      rotate: [0, -10, 10, 0],
                      scale: 1.1
                    }}
                    transition={{ duration: 0.6 }}
                    className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${feature.color}, ${feature.color}CC)`
                    }}
                  >
                    <feature.icon className="w-10 h-10 text-white" />
                  </motion.div>
                  
                  <h3 className={`text-2xl font-bold mb-4 feature-title transition-all duration-300 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {feature.title}
                  </h3>
                  
                  <p className={`leading-relaxed ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {feature.description}
                  </p>

                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    whileHover={{ opacity: 1, x: 0 }}
                    className="mt-6 flex items-center space-x-2 text-sm font-semibold"
                    style={{ color: feature.color }}
                  >
                    <span>Learn more</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.div>
                </div>

                {/* Animated border */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1, opacity: 1 }}
                  className="absolute inset-0 rounded-3xl border-2 transition-all duration-300"
                  style={{ borderColor: feature.color }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Life-Changing Results
            </h2>
            <p className={`text-xl max-w-3xl mx-auto ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Real stories from people who transformed their mental health journey with MindScope
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className={`rounded-3xl p-8 transition-all duration-300 ${
                  isDark 
                    ? 'bg-white/5 border border-white/10' 
                    : 'bg-white/70 border border-white/20'
                } backdrop-blur-xl shadow-xl hover:shadow-2xl`}
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                
                <p className={`text-lg leading-relaxed mb-6 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  &ldquo;{testimonial.content}&rdquo;
                </p>
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-purple-400 to-blue-500 flex items-center justify-center text-2xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {testimonial.name}
                    </div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className={`relative rounded-3xl p-12 text-center overflow-hidden ${
              isDark 
                ? 'bg-white/5 border border-white/10' 
                : 'bg-white/50 border border-white/20'
            } backdrop-blur-xl shadow-2xl`}
            style={{
              background: isDark 
                ? `linear-gradient(135deg, ${currentColors.primary}20, ${currentColors.secondary}20)`
                : `linear-gradient(135deg, ${currentColors.primary}10, ${currentColors.secondary}10)`
            }}
          >
            {/* Background decoration */}
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 20, repeat: Infinity }}
              className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-10"
              style={{ background: currentColors.accent }}
            />
            <motion.div
              animate={{ 
                rotate: [360, 0],
                scale: [1.1, 1, 1.1]
              }}
              transition={{ duration: 15, repeat: Infinity }}
              className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full opacity-10"
              style={{ background: currentColors.primary }}
            />

            <div className="relative z-10">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-20 h-20 mx-auto mb-8 rounded-3xl flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${currentColors.primary}, ${currentColors.secondary})`
                }}
              >
                <Sparkles className="w-10 h-10 text-white" />
              </motion.div>

              <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Ready to Transform Your Mental Health?
              </h2>
              
              <p className={`text-xl mb-10 max-w-2xl mx-auto ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Join over 150,000 people who have already started their journey to better mental wellness with our AI-powered platform.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Link href="/auth/signup">
                  <motion.button
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: `0 20px 40px ${currentColors.primary}40`
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="px-10 py-4 rounded-2xl font-bold text-lg text-white shadow-2xl transition-all duration-300 flex items-center space-x-3"
                    style={{
                      background: `linear-gradient(135deg, ${currentColors.primary}, ${currentColors.secondary})`
                    }}
                  >
                    <span>Get Started Today</span>
                    <CheckCircle className="w-5 h-5" />
                  </motion.button>
                </Link>
                
                <Link href="/demo">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-10 py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
                      isDark 
                        ? 'bg-white/10 text-white border-2 border-white/20' 
                        : 'bg-white/60 text-gray-700 border-2 border-gray-200'
                    }`}
                  >
                    Try Free Demo
                  </motion.button>
                </Link>
              </div>

              <div className="mt-8 flex items-center justify-center space-x-8 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                    No credit card required
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                    100% Private & Secure
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className={`px-6 py-12 border-t ${
        isDark ? 'border-white/10' : 'border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${currentColors.primary}, ${currentColors.secondary})`
                }}
              >
                <Brain className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  MindScope
                </span>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  AI Mental Health Platform
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-8">
              <Link href="/privacy" className={`text-sm hover:underline ${
                isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}>
                Privacy Policy
              </Link>
              <Link href="/terms" className={`text-sm hover:underline ${
                isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}>
                Terms of Service
              </Link>
              <Link href="/contact" className={`text-sm hover:underline ${
                isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}>
                Contact
              </Link>
            </div>
          </div>
          
          <div className={`mt-8 pt-8 border-t text-center text-sm ${
            isDark ? 'border-white/10 text-gray-400' : 'border-gray-200 text-gray-500'
          }`}>
            <p>&copy; 2025 MindScope. Revolutionizing mental health with AI, one mind at a time.</p>
            <p className="mt-2">Built with ❤️ for better mental wellness</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
