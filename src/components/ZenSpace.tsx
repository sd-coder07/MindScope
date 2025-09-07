'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  Clock,
  Heart,
  Leaf,
  Moon,
  Mountain,
  Play,
  Sparkles,
  Star,
  Sun,
  TreePine,
  Waves,
  Wind
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import EnhancedMeditationSession from './EnhancedMeditationSession';
interface MeditationSession {
  id: string;
  name: string;
  duration: number;
  category: string;
  description: string;
  backgroundImage: string;
  color: string;
  icon: React.ReactNode;
  instructor: string;
  audioUrl?: string;
  videoUrl?: string;
}

interface ZenSpaceProps {
  onSessionComplete?: (sessionId: string, duration: number) => void;
  isDarkMode?: boolean;
}

export default function ZenSpace({ onSessionComplete, isDarkMode = false }: ZenSpaceProps) {
  const [currentSession, setCurrentSession] = useState<MeditationSession | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathCount, setBreathCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const breathingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Auto-dismiss error messages after 5 seconds
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const meditationSessions: MeditationSession[] = [
    {
      id: 'morning-mindfulness',
      name: 'Morning Mindfulness',
      duration: 10,
      category: 'mindfulness',
      description: 'Start your day with clarity and intention',
      backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'from-purple-500 to-indigo-600',
      icon: <Sun className="w-6 h-6" />,
      instructor: 'Sarah Chen',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    },
    {
      id: 'breath-awareness',
      name: 'Breath Awareness',
      duration: 5,
      category: 'breathing',
      description: 'Focus on your natural breathing rhythm',
      backgroundImage: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
      color: 'from-blue-500 to-cyan-600',
      icon: <Wind className="w-6 h-6" />,
      instructor: 'Marcus Thompson',
      videoUrl: 'https://youtu.be/RzVvThhjAKw?si=8Jazg_kMnmpfBLDo'
    },
    {
      id: 'stress-relief',
      name: 'Stress Relief',
      duration: 15,
      category: 'stress',
      description: 'Release tension and find inner peace',
      backgroundImage: 'linear-gradient(135deg, #fd79a8 0%, #e84393 100%)',
      color: 'from-pink-500 to-rose-600',
      icon: <Heart className="w-6 h-6" />,
      instructor: 'Luna Rodriguez',
      videoUrl: 'https://youtu.be/SN3xlcjbvUo?si=sdgv0D_SB91WNqKk'
    },
    {
      id: 'forest-sounds',
      name: 'Forest Sanctuary',
      duration: 20,
      category: 'focus',
      description: 'Immerse yourself in nature sounds',
      backgroundImage: 'linear-gradient(135deg, #00b894 0%, #00cec9 100%)',
      color: 'from-green-500 to-emerald-600',
      icon: <TreePine className="w-6 h-6" />,
      instructor: 'River Stone',
      videoUrl: 'https://youtu.be/es4x5R-rV9s?si=1m_cQ7Nt8Cqw3Bv_'
    },
    {
      id: 'evening-wind-down',
      name: 'Evening Wind Down',
      duration: 12,
      category: 'sleep',
      description: 'Prepare your mind for restful sleep',
      backgroundImage: 'linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%)',
      color: 'from-indigo-500 to-purple-600',
      icon: <Moon className="w-6 h-6" />,
      instructor: 'Dream Walker',
      videoUrl: 'https://youtu.be/ynLpZGegiJE?si=jdREHTGWX9rrmzBP'
    },
    {
      id: 'ocean-waves',
      name: 'Ocean Meditation',
      duration: 25,
      category: 'mindfulness',
      description: 'Let the waves wash away your worries',
      backgroundImage: 'linear-gradient(135deg, #0984e3 0%, #74b9ff 100%)',
      color: 'from-cyan-500 to-blue-600',
      icon: <Waves className="w-6 h-6" />,
      instructor: 'Ocean Spirit',
      videoUrl: 'https://youtu.be/i-UMV1cFqFU?si=1To89MywtdtrfaR0'
    },
    {
      id: 'mountain-meditation',
      name: 'Mountain Peak',
      duration: 30,
      category: 'focus',
      description: 'Find stability and strength like a mountain',
      backgroundImage: 'linear-gradient(135deg, #636e72 0%, #2d3436 100%)',
      color: 'from-slate-500 to-gray-700',
      icon: <Mountain className="w-6 h-6" />,
      instructor: 'Stone Master',
      videoUrl: 'https://youtu.be/nZmO8B9rRik?si=C0Z0u6Y0Z90fI-Iz'

    },
    {
      id: 'gratitude-practice',
      name: 'Gratitude Practice',
      duration: 8,
      category: 'mindfulness',
      description: 'Cultivate appreciation and joy',
      backgroundImage: 'linear-gradient(135deg, #fdcb6e 0%, #e17055 100%)',
      color: 'from-yellow-500 to-orange-600',
      icon: <Star className="w-6 h-6" />,
      instructor: 'Joy Keeper',
      videoUrl: 'https://youtu.be/1jpEeJLnH_A?si=9HOpPxg3H8slyswD'

    }
  ];

  const categories = [
    { id: 'all', name: 'All Sessions', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'breathing', name: 'Breathing', icon: <Wind className="w-5 h-5" /> },
    { id: 'mindfulness', name: 'Mindfulness', icon: <Leaf className="w-5 h-5" /> },
    { id: 'sleep', name: 'Sleep', icon: <Moon className="w-5 h-5" /> },
    { id: 'focus', name: 'Focus', icon: <Mountain className="w-5 h-5" /> },
    { id: 'stress', name: 'Stress Relief', icon: <Heart className="w-5 h-5" /> }
  ];

  const filteredSessions = selectedCategory === 'all' 
    ? meditationSessions 
    : meditationSessions.filter(session => session.category === selectedCategory);

  const startSession = (session: MeditationSession) => {
    try {
      setErrorMessage(null); // Clear any previous errors
      setCurrentSession(session);
      setTotalTime(session.duration * 60); // Convert to seconds
      setTimeRemaining(session.duration * 60);
      setIsPlaying(false);
      setBreathCount(0);
      console.log(`🧘 Starting meditation session: ${session.name}`);
    } catch (error) {
      console.error('Error starting session:', error);
      setErrorMessage('Failed to start meditation session. Please try again.');
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    
    // Handle video playback
    if (videoRef.current) {
      if (!isPlaying) {
        videoRef.current.play().catch(console.error);
      } else {
        videoRef.current.pause();
      }
    }
  };

  const resetSession = () => {
    setIsPlaying(false);
    setTimeRemaining(totalTime);
    setBreathCount(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Reset video
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const endSession = () => {
    setCurrentSession(null);
    setIsPlaying(false);
    setTimeRemaining(0);
    setTotalTime(0);
    
    // Stop and reset video
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-3xl p-8 text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <TreePine className="w-8 h-8" />
                Zen Space
              </h1>
              <p className="text-white/80 text-lg">Your sanctuary for meditation and mindfulness</p>
            </div>
            {currentSession && (
              <div className="text-right">
                <div className="text-2xl font-bold">{formatTime(timeRemaining)}</div>
                <div className="text-white/80">Time remaining</div>
              </div>
            )}
          </div>
          
          {!currentSession && (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="text-center">
                <div className="text-4xl mb-4">🧘‍♀️</div>
                <div className="text-xl font-medium mb-2">Find Your Inner Peace</div>
                <div className="text-white/80">Choose a meditation session to begin your journey</div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Active Session */}
      <AnimatePresence>
        {currentSession && (
          <EnhancedMeditationSession
            sessionId={currentSession.id}
            sessionName={currentSession.name}
            duration={currentSession.duration}
            description={currentSession.description}
            color={currentSession.color}
            videoUrl={currentSession.videoUrl}
            isDarkMode={isDarkMode}
            onBack={endSession}
            onComplete={(sessionId, actualDuration) => {
              console.log(`Session ${sessionId} completed in ${actualDuration} minutes`);
              onSessionComplete?.(sessionId, actualDuration);
              endSession();
            }}
          />
        )}
      </AnimatePresence>

      {/* Session Categories */}
      {!currentSession && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`rounded-2xl p-6 shadow-lg border ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-100'
          }`}
        >
          <h3 className={`text-xl font-bold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>Categories</h3>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-green-500 text-white'
                    : isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.icon}
                {category.name}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Session Grid */}
      {!currentSession && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredSessions.map((session, index) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => startSession(session)}
              className="relative rounded-2xl p-6 cursor-pointer group hover:shadow-xl transition-all duration-300 overflow-hidden text-white"
              style={{ background: session.backgroundImage }}
            >
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm group-hover:scale-110 transition-transform">
                    {session.icon}
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Clock className="w-4 h-4" />
                    {session.duration}m
                  </div>
                </div>
                
                <h3 className="text-xl font-bold mb-2">{session.name}</h3>
                <p className="text-white/80 text-sm mb-4">{session.description}</p>
                
                {session.instructor && (
                  <p className="text-white/60 text-xs">Guided by {session.instructor}</p>
                )}

                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/60 uppercase tracking-wide">
                      {session.category}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                      <Play className="w-4 h-4 ml-0.5" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Error Message */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
              isDarkMode 
                ? 'bg-red-600 text-white' 
                : 'bg-red-500 text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMessage}</span>
              <button 
                onClick={() => setErrorMessage(null)}
                className="ml-2 text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
