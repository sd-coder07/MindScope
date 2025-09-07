'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Pause, Play, RotateCcw, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface BreathingRhythmGameProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (xp: number) => void;
  isDarkMode?: boolean;
}

export default function BreathingRhythmGame({ isOpen, onClose, onComplete, isDarkMode = false }: BreathingRhythmGameProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'pause'>('inhale');
  const [cycle, setCycle] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [breathPattern, setBreathPattern] = useState({ inhale: 4, hold: 4, exhale: 4, pause: 2 });
  const [selectedPattern, setSelectedPattern] = useState('balanced');
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const breathPatterns = {
    balanced: { inhale: 4, hold: 4, exhale: 4, pause: 2, name: '4-4-4-2 Balanced' },
    calming: { inhale: 4, hold: 7, exhale: 8, pause: 2, name: '4-7-8 Calming' },
    energizing: { inhale: 6, hold: 2, exhale: 4, pause: 1, name: '6-2-4-1 Energizing' },
    deep: { inhale: 6, hold: 6, exhale: 6, pause: 3, name: '6-6-6-3 Deep' }
  };

  const startBreathing = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      startTimeRef.current = Date.now();
      runBreathCycle();
    } else {
      pauseBreathing();
    }
  };

  const pauseBreathing = () => {
    setIsPlaying(false);
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
    }
  };

  const stopBreathing = () => {
    pauseBreathing();
    setCycle(0);
    setPhase('inhale');
    const sessionTime = Math.floor(totalTime / 60);
    const earnedXP = Math.max(sessionTime * 5, 5); // 5 XP per minute, minimum 5 XP
    setXpEarned(earnedXP);
    onComplete(earnedXP);
  };

  const runBreathCycle = () => {
    const pattern = breathPatterns[selectedPattern as keyof typeof breathPatterns];
    
    const phases = [
      { name: 'inhale', duration: pattern.inhale * 1000 },
      { name: 'hold', duration: pattern.hold * 1000 },
      { name: 'exhale', duration: pattern.exhale * 1000 },
      { name: 'pause', duration: pattern.pause * 1000 }
    ];

    let currentPhaseIndex = 0;

    const nextPhase = () => {
      if (!isPlaying) return;

      const currentPhase = phases[currentPhaseIndex];
      setPhase(currentPhase.name as any);

      intervalRef.current = setTimeout(() => {
        currentPhaseIndex = (currentPhaseIndex + 1) % phases.length;
        
        if (currentPhaseIndex === 0) {
          setCycle(prev => prev + 1);
          setTotalTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
        }
        
        nextPhase();
      }, currentPhase.duration);
    };

    nextPhase();
  };

  const getPhaseInstructions = () => {
    switch (phase) {
      case 'inhale':
        return 'Breathe In';
      case 'hold':
        return 'Hold';
      case 'exhale':
        return 'Breathe Out';
      case 'pause':
        return 'Pause';
      default:
        return 'Ready';
    }
  };

  const getCircleScale = () => {
    switch (phase) {
      case 'inhale':
        return 1.2; // Reduced from 1.4 to prevent overflow
      case 'hold':
        return 1.2; // Reduced from 1.4 to prevent overflow
      case 'exhale':
        return 0.9; // Slightly increased from 0.8 for smoother transition
      case 'pause':
        return 0.9; // Slightly increased from 0.8 for smoother transition
      default:
        return 1;
    }
  };

  const getCircleColor = () => {
    switch (phase) {
      case 'inhale':
        return 'from-blue-400 to-cyan-500';
      case 'hold':
        return 'from-purple-400 to-blue-500';
      case 'exhale':
        return 'from-green-400 to-teal-500';
      case 'pause':
        return 'from-gray-400 to-gray-500';
      default:
        return 'from-blue-400 to-purple-500';
    }
  };

  useEffect(() => {
    const updateTimer = setInterval(() => {
      if (isPlaying) {
        setTotalTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }
    }, 1000);

    return () => clearInterval(updateTimer);
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={`relative w-full max-w-lg rounded-2xl p-6 ${
            isDarkMode 
              ? 'bg-slate-800 border border-slate-700' 
              : 'bg-white border border-gray-200'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Breathing Rhythm 🌊
              </h2>
              <div className="flex items-center space-x-4 mt-1">
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {Math.floor(totalTime / 60)}:{(totalTime % 60).toString().padStart(2, '0')}
                </span>
                <span className={`text-sm ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                  {cycle} cycles
                </span>
                <span className={`text-sm font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                  {Math.floor(totalTime / 60) * 5} XP
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-full transition-colors ${
                isDarkMode 
                  ? 'hover:bg-slate-700 text-gray-400 hover:text-white' 
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Breathing Pattern Selection */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Choose Breathing Pattern:
            </label>
            <select
              value={selectedPattern}
              onChange={(e) => setSelectedPattern(e.target.value)}
              disabled={isPlaying}
              className={`w-full p-2 rounded-lg border ${
                isDarkMode 
                  ? 'bg-slate-700 border-slate-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } ${isPlaying ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {Object.entries(breathPatterns).map(([key, pattern]) => (
                <option key={key} value={key}>
                  {pattern.name}
                </option>
              ))}
            </select>
          </div>

          {/* Breathing Circle */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-40 h-40 flex items-center justify-center mb-4 overflow-hidden">
              <motion.div
                animate={{
                  scale: getCircleScale()
                }}
                transition={{
                  duration: breathPatterns[selectedPattern as keyof typeof breathPatterns][phase],
                  ease: "easeInOut"
                }}
                className={`w-28 h-28 rounded-full bg-gradient-to-br ${getCircleColor()} shadow-2xl flex items-center justify-center`}
              >
                <motion.div
                  animate={{ rotate: isPlaying ? 360 : 0 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-sm"
                />
              </motion.div>
              
              {/* Breathing rings */}
              {[1, 2, 3].map((ring) => (
                <motion.div
                  key={ring}
                  animate={{
                    scale: isPlaying ? [1, 1.3, 1] : 1,
                    opacity: isPlaying ? [0.3, 0, 0.3] : 0.1
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    delay: ring * 0.5
                  }}
                  className={`absolute w-40 h-40 rounded-full border-2 ${
                    isDarkMode ? 'border-white/20' : 'border-blue-200'
                  }`}
                />
              ))}
            </div>

            {/* Phase Instructions */}
            <motion.h3
              key={phase}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-2xl font-bold text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
            >
              {getPhaseInstructions()}
            </motion.h3>
            
            <p className={`text-center mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {isPlaying ? 'Follow the circle rhythm' : 'Click play to start breathing'}
            </p>
          </div>

          {/* Controls */}
          <div className="flex space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startBreathing}
              className={`flex-1 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 ${
                isPlaying 
                  ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              <span>{isPlaying ? 'Pause' : 'Start'}</span>
            </motion.button>
            
            {(cycle > 0 || totalTime > 0) && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={stopBreathing}
                className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Finish</span>
              </motion.button>
            )}
          </div>

          {/* Session Summary */}
          {xpEarned > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-6 p-4 rounded-xl text-center ${
                isDarkMode 
                  ? 'bg-green-900/30 border border-green-700' 
                  : 'bg-green-50 border border-green-200'
              }`}
            >
              <h4 className={`font-bold text-lg ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>
                Session Complete! 🏆
              </h4>
              <p className={`text-sm ${isDarkMode ? 'text-green-300' : 'text-green-600'}`}>
                {cycle} breathing cycles • {Math.floor(totalTime / 60)} minutes • {xpEarned} XP earned
              </p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
