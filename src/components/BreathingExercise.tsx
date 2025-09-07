'use client';

import { motion } from 'framer-motion';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';

interface BreathingExerciseProps {
  pattern?: number[];
  duration?: number;
  onComplete?: () => void;
}

export default function BreathingExercise({ 
  pattern = [4, 4, 4, 4], 
  duration = 60,
  onComplete 
}: BreathingExerciseProps) {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState(0); // 0: inhale, 1: hold, 2: exhale, 3: hold
  const [timeLeft, setTimeLeft] = useState(duration);
  const [cycleProgress, setCycleProgress] = useState(0);

  const phaseNames = ['Inhale', 'Hold', 'Exhale', 'Hold'];
  const phaseColors = ['serenity-400', 'healing-400', 'ocean-400', 'warm-400'];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && timeLeft > 0) {
      const totalCycleTime = pattern.reduce((a, b) => a + b, 0);
      
      interval = setInterval(() => {
        setCycleProgress(prev => {
          const newProgress = prev + (1 / totalCycleTime);
          
          if (newProgress >= 1) {
            setPhase(0);
            return 0;
          }
          
          // Calculate which phase we're in
          let cumulativeTime = 0;
          for (let i = 0; i < pattern.length; i++) {
            cumulativeTime += pattern[i] / totalCycleTime;
            if (newProgress <= cumulativeTime) {
              setPhase(i);
              break;
            }
          }
          
          return newProgress;
        });
        
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }
    
    if (timeLeft === 0) {
      setIsActive(false);
      onComplete?.();
    }
    
    return () => clearInterval(interval);
  }, [isActive, timeLeft, pattern, onComplete]);

  const handleStart = () => {
    setIsActive(true);
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setTimeLeft(duration);
    setCycleProgress(0);
    setPhase(0);
  };

  const getCircleScale = () => {
    const phaseProgress = (cycleProgress * pattern.reduce((a, b) => a + b, 0)) % 1;
    
    if (phase === 0) { // Inhale
      return 1 + phaseProgress * 0.5;
    } else if (phase === 2) { // Exhale
      return 1.5 - phaseProgress * 0.5;
    }
    return phase === 1 ? 1.5 : 1; // Hold phases
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-serenity-50 to-healing-50 rounded-2xl">
      <div className="relative mb-8">
        <motion.div
          animate={{ 
            scale: getCircleScale(),
            backgroundColor: `var(--${phaseColors[phase]})`
          }}
          transition={{ 
            duration: pattern[phase],
            ease: "easeInOut"
          }}
          className={`w-64 h-64 rounded-full bg-${phaseColors[phase]} flex items-center justify-center shadow-2xl`}
        >
          <motion.div
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-white text-2xl font-semibold text-center"
          >
            <div className="text-4xl mb-2">{phaseNames[phase]}</div>
            <div className="text-lg opacity-80">{pattern[phase]}s</div>
          </motion.div>
        </motion.div>
        
        {/* Progress ring */}
        <svg 
          className="absolute inset-0 w-64 h-64 transform -rotate-90"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="2"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: cycleProgress }}
            style={{
              pathLength: cycleProgress,
              strokeDasharray: "1 1"
            }}
          />
        </svg>
      </div>

      <div className="text-center mb-6">
        <div className="text-3xl font-bold text-gray-800 mb-2">
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </div>
        <div className="text-gray-600">
          Pattern: {pattern.join('-')}
        </div>
      </div>

      <div className="flex space-x-4">
        {!isActive ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStart}
            className="flex items-center space-x-2 px-6 py-3 bg-serenity-500 text-white rounded-full hover:bg-serenity-600 transition-colors"
          >
            <Play className="w-5 h-5" />
            <span>Start</span>
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePause}
            className="flex items-center space-x-2 px-6 py-3 bg-ocean-500 text-white rounded-full hover:bg-ocean-600 transition-colors"
          >
            <Pause className="w-5 h-5" />
            <span>Pause</span>
          </motion.button>
        )}
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleReset}
          className="flex items-center space-x-2 px-6 py-3 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Reset</span>
        </motion.button>
      </div>

      <div className="mt-6 text-center text-gray-600 max-w-md">
        <p className="text-sm">
          Follow the breathing pattern by watching the circle expand and contract. 
          Focus on the rhythm and let your breath naturally sync with the visual guide.
        </p>
      </div>
    </div>
  );
}
