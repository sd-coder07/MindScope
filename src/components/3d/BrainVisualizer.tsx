'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface BrainVisualizerProps {
  moodLevel: number;
  stressLevel: number;
  energyLevel: number;
  isActive?: boolean;
}

export default function BrainVisualizer({ moodLevel, stressLevel, energyLevel, isActive = true }: BrainVisualizerProps) {
  const [activeRegions, setActiveRegions] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    const regions = [];
    if (moodLevel > 7) regions.push('happiness');
    if (stressLevel > 6) regions.push('stress');
    if (energyLevel > 8) regions.push('energy');
    setActiveRegions(regions);
  }, [moodLevel, stressLevel, energyLevel]);

  if (!isMounted) {
    return (
      <div className="w-full h-96 bg-gray-900 rounded-2xl flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading Brain Visualization...</p>
        </div>
      </div>
    );
  }

  const getBrainColor = () => {
    if (stressLevel > 7) return 'from-red-500 to-orange-500';
    if (moodLevel > 7) return 'from-green-500 to-blue-500';
    if (energyLevel > 7) return 'from-yellow-500 to-orange-500';
    return 'from-purple-500 to-pink-500';
  };

  const getActivityLevel = () => {
    const average = (moodLevel + energyLevel + (10 - stressLevel)) / 3;
    return Math.round(average * 10);
  };

  return (
    <div className="w-full h-96 bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-blue-500/10 to-transparent animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl animate-bounce"></div>
      </div>

      <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-white text-xl font-bold mb-2">Neural Activity Visualization</h3>
          <p className="text-gray-400 text-sm">Real-time brain state analysis</p>
        </div>

        {/* Brain visualization */}
        <div className="flex-1 flex items-center justify-center">
          <div className="relative">
            {/* Main brain shape */}
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, 2, -2, 0]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className={`w-48 h-32 bg-gradient-to-r ${getBrainColor()} rounded-full relative overflow-hidden`}
              style={{
                clipPath: 'ellipse(45% 60% at 50% 50%)',
                filter: `brightness(${1 + (energyLevel / 20)})`
              }}
            >
              {/* Neural activity patterns */}
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-white/60 rounded-full"
                  animate={{
                    opacity: [0.3, 1, 0.3],
                    scale: [0.8, 1.2, 0.8],
                    x: [0, Math.random() * 20 - 10],
                    y: [0, Math.random() * 20 - 10]
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                  style={{
                    left: `${20 + Math.random() * 60}%`,
                    top: `${20 + Math.random() * 60}%`
                  }}
                />
              ))}

              {/* Active regions highlights */}
              {activeRegions.includes('happiness') && (
                <motion.div
                  className="absolute top-2 left-8 w-4 h-4 bg-green-400 rounded-full"
                  animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
              {activeRegions.includes('stress') && (
                <motion.div
                  className="absolute top-4 right-6 w-3 h-3 bg-red-400 rounded-full"
                  animate={{ opacity: [0.7, 1, 0.7], scale: [1, 1.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
              {activeRegions.includes('energy') && (
                <motion.div
                  className="absolute bottom-3 left-12 w-3 h-3 bg-yellow-400 rounded-full"
                  animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.4, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
              )}
            </motion.div>

            {/* Neural connections */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <svg className="w-full h-full" viewBox="0 0 200 150">
                {Array.from({ length: 8 }).map((_, i) => (
                  <motion.line
                    key={i}
                    x1={50 + Math.random() * 100}
                    y1={40 + Math.random() * 70}
                    x2={50 + Math.random() * 100}
                    y2={40 + Math.random() * 70}
                    stroke="#60a5fa"
                    strokeWidth="1"
                    opacity="0.4"
                    animate={{
                      opacity: [0.2, 0.8, 0.2],
                      strokeWidth: [1, 2, 1]
                    }}
                    transition={{
                      duration: 1.5 + Math.random(),
                      repeat: Infinity,
                      delay: i * 0.3
                    }}
                  />
                ))}
              </svg>
            </motion.div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{moodLevel}/10</div>
            <div className="text-xs text-gray-400">Mood</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{energyLevel}/10</div>
            <div className="text-xs text-gray-400">Energy</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">{stressLevel}/10</div>
            <div className="text-xs text-gray-400">Stress</div>
          </div>
        </div>

        {/* Activity indicator */}
        <div className="mt-4 flex items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-500'}`}></div>
            <span>Neural Activity: {getActivityLevel()}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
