'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface TherapeuticEnvironmentProps {
  theme: 'ocean' | 'forest' | 'space' | 'zen';
  ambientSoundLevel: number;
  interactivity: boolean;
  userId?: string;
}

export default function TherapeuticEnvironment({ 
  theme, 
  ambientSoundLevel, 
  interactivity,
  userId 
}: TherapeuticEnvironmentProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    if (ambientSoundLevel > 0) {
      // Simulated ambient sound management
      console.log(`Playing ${theme} ambient sounds at ${ambientSoundLevel}% volume`);
    }
  }, [theme, ambientSoundLevel]);

  if (!isMounted) {
    return (
      <div className="w-full h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading VR Environment...</p>
        </div>
      </div>
    );
  }

  const getEnvironmentStyles = () => {
    switch (theme) {
      case 'ocean':
        return {
          background: 'linear-gradient(to bottom, #1e3a8a, #1e40af, #2563eb, #3b82f6)',
          particles: '🌊',
          description: 'Peaceful Ocean Waves'
        };
      case 'forest':
        return {
          background: 'linear-gradient(to bottom, #166534, #15803d, #16a34a, #22c55e)',
          particles: '🌿',
          description: 'Tranquil Forest Sounds'
        };
      case 'space':
        return {
          background: 'linear-gradient(to bottom, #0f172a, #1e1b4b, #312e81, #3730a3)',
          particles: '⭐',
          description: 'Cosmic Meditation'
        };
      case 'zen':
        return {
          background: 'linear-gradient(to bottom, #7c2d12, #a16207, #ca8a04, #eab308)',
          particles: '🧘',
          description: 'Zen Garden Serenity'
        };
      default:
        return {
          background: 'linear-gradient(to bottom, #1e3a8a, #1e40af, #2563eb, #3b82f6)',
          particles: '🌊',
          description: 'Peaceful Ocean Waves'
        };
    }
  };

  const environment = getEnvironmentStyles();

  return (
    <div 
      className="w-full h-screen relative overflow-hidden transition-all duration-1000"
      style={{ background: environment.background }}
    >
      {/* Animated particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-4xl opacity-30"
            initial={{ 
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000), 
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 600),
              scale: 0 
            }}
            animate={{ 
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000), 
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 600),
              scale: [0, 1, 0.5, 1],
              rotate: [0, 180, 360]
            }}
            transition={{ 
              duration: 10 + Math.random() * 10, 
              repeat: Infinity, 
              ease: "linear",
              delay: i * 0.5
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
          >
            {environment.particles}
          </motion.div>
        ))}
      </div>

      {/* Overlay effects */}
      <div className="absolute inset-0">
        <motion.div 
          className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-2xl animate-bounce"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex items-center justify-center h-full text-white">
        <div className="text-center max-w-md">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1 }}
            className="mb-8"
          >
            <div className="w-32 h-32 mx-auto mb-6 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-white/50 rounded-full animate-pulse"></div>
              <div className="absolute inset-2 bg-black/30 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="text-6xl">{environment.particles}</span>
              </div>
            </div>
          </motion.div>
          
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold mb-4"
          >
            {environment.description}
          </motion.h2>
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-white/80 mb-6"
          >
            Experience therapeutic environments designed to promote relaxation and mindfulness
          </motion.p>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="space-y-4"
          >
            <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Ambient Level</span>
                <span className="text-sm">{ambientSoundLevel}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <motion.div
                  className="h-2 bg-white/70 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${ambientSoundLevel}%` }}
                  transition={{ duration: 1, delay: 1 }}
                />
              </div>
            </div>
            
            {interactivity && (
              <div className="flex items-center justify-center gap-4 text-sm text-white/70">
                <span>🎧 Immersive Audio</span>
                <span>👀 Visual Therapy</span>
                <span>🧠 Mindfulness</span>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
