'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Palette, RotateCcw, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface ZenColorFlowGameProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (xp: number) => void;
  isDarkMode?: boolean;
}

interface ColorArea {
  id: string;
  path: string;
  color: string;
  isColored: boolean;
}

export default function ZenColorFlowGame({ isOpen, onClose, onComplete, isDarkMode = false }: ZenColorFlowGameProps) {
  const [selectedColor, setSelectedColor] = useState('#3B82F6');
  const [colorAreas, setColorAreas] = useState<ColorArea[]>([]);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [currentPattern, setCurrentPattern] = useState('mandala');
  const [sessionTime, setSessionTime] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const colorPalette = [
    '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1',
    '#14B8A6', '#F472B6', '#A855F7', '#22C55E', '#FB923C'
  ];

  const patterns = {
    mandala: {
      name: 'Sacred Mandala',
      areas: [
        { id: 'center', path: 'M 50 20 L 80 50 L 50 80 L 20 50 Z', color: '#ffffff' },
        { id: 'ring1', path: 'M 50 10 L 90 50 L 50 90 L 10 50 Z M 50 20 L 80 50 L 50 80 L 20 50 Z', color: '#ffffff' },
        { id: 'ring2', path: 'M 50 5 L 95 50 L 50 95 L 5 50 Z M 50 10 L 90 50 L 50 90 L 10 50 Z', color: '#ffffff' },
        { id: 'petal1', path: 'M 50 5 L 60 25 L 50 20 L 40 25 Z', color: '#ffffff' },
        { id: 'petal2', path: 'M 95 50 L 75 40 L 80 50 L 75 60 Z', color: '#ffffff' },
        { id: 'petal3', path: 'M 50 95 L 40 75 L 50 80 L 60 75 Z', color: '#ffffff' },
        { id: 'petal4', path: 'M 5 50 L 25 60 L 20 50 L 25 40 Z', color: '#ffffff' }
      ]
    },
    flower: {
      name: 'Zen Flower',
      areas: [
        { id: 'center', path: 'M 50 45 A 5 5 0 1 1 50 55 A 5 5 0 1 1 50 45', color: '#ffffff' },
        { id: 'petal1', path: 'M 50 50 Q 50 30 60 40 Q 50 35 40 40 Q 50 30 50 50', color: '#ffffff' },
        { id: 'petal2', path: 'M 50 50 Q 70 50 60 60 Q 65 50 60 40 Q 70 50 50 50', color: '#ffffff' },
        { id: 'petal3', path: 'M 50 50 Q 50 70 40 60 Q 50 65 60 60 Q 50 70 50 50', color: '#ffffff' },
        { id: 'petal4', path: 'M 50 50 Q 30 50 40 40 Q 35 50 40 60 Q 30 50 50 50', color: '#ffffff' },
        { id: 'leaf1', path: 'M 65 35 Q 75 25 85 35 Q 75 30 75 40 Q 75 35 65 35', color: '#ffffff' },
        { id: 'leaf2', path: 'M 35 65 Q 25 75 15 65 Q 25 70 25 60 Q 25 65 35 65', color: '#ffffff' }
      ]
    },
    geometric: {
      name: 'Sacred Geometry',
      areas: [
        { id: 'triangle1', path: 'M 50 20 L 35 45 L 65 45 Z', color: '#ffffff' },
        { id: 'triangle2', path: 'M 50 80 L 35 55 L 65 55 Z', color: '#ffffff' },
        { id: 'circle1', path: 'M 30 30 A 8 8 0 1 1 30 46 A 8 8 0 1 1 30 30', color: '#ffffff' },
        { id: 'circle2', path: 'M 70 30 A 8 8 0 1 1 70 46 A 8 8 0 1 1 70 30', color: '#ffffff' },
        { id: 'circle3', path: 'M 30 54 A 8 8 0 1 1 30 70 A 8 8 0 1 1 30 54', color: '#ffffff' },
        { id: 'circle4', path: 'M 70 54 A 8 8 0 1 1 70 70 A 8 8 0 1 1 70 54', color: '#ffffff' },
        { id: 'center', path: 'M 50 45 A 10 10 0 1 1 50 55 A 10 10 0 1 1 50 45', color: '#ffffff' }
      ]
    }
  };

  const initializePattern = () => {
    const pattern = patterns[currentPattern as keyof typeof patterns];
    const areas = pattern.areas.map(area => ({
      ...area,
      isColored: false
    }));
    setColorAreas(areas);
    setCompletionPercentage(0);
    setIsCompleted(false);
    startTimeRef.current = Date.now();
    
    // Start timer
    timerRef.current = setInterval(() => {
      setSessionTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
  };

  const colorArea = (areaId: string) => {
    setColorAreas(prev => {
      const updated = prev.map(area => 
        area.id === areaId 
          ? { ...area, color: selectedColor, isColored: true }
          : area
      );
      
      const coloredCount = updated.filter(area => area.isColored).length;
      const percentage = Math.round((coloredCount / updated.length) * 100);
      setCompletionPercentage(percentage);
      
      if (percentage === 100 && !isCompleted) {
        setIsCompleted(true);
        const earnedXP = 15 + Math.floor(sessionTime / 30) * 5; // Base 15 XP + bonus for time spent
        onComplete(earnedXP);
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      }
      
      return updated;
    });
  };

  const resetPattern = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setSessionTime(0);
    setIsCompleted(false);
    initializePattern();
  };

  const changePattern = (patternKey: string) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setCurrentPattern(patternKey);
    setSessionTime(0);
    setIsCompleted(false);
  };

  useEffect(() => {
    if (isOpen) {
      initializePattern();
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isOpen, currentPattern]);

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
          className={`relative w-full max-w-2xl rounded-2xl p-6 ${
            isDarkMode 
              ? 'bg-slate-800 border border-slate-700' 
              : 'bg-white border border-gray-200'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Zen Color Flow 🎨
              </h2>
              <div className="flex items-center space-x-4 mt-1">
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {Math.floor(sessionTime / 60)}:{(sessionTime % 60).toString().padStart(2, '0')}
                </span>
                <span className={`text-sm ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                  {completionPercentage}% complete
                </span>
                <span className={`text-sm font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                  {15 + Math.floor(sessionTime / 30) * 5} XP
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

          <div className="grid md:grid-cols-2 gap-6">
            {/* Controls */}
            <div>
              {/* Pattern Selection */}
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Choose Pattern:
                </label>
                <div className="space-y-2">
                  {Object.entries(patterns).map(([key, pattern]) => (
                    <button
                      key={key}
                      onClick={() => changePattern(key)}
                      className={`w-full p-2 rounded-lg text-left transition-colors ${
                        currentPattern === key
                          ? (isDarkMode ? 'bg-purple-900/50 text-purple-300 border border-purple-700' : 'bg-purple-100 text-purple-700 border border-purple-300')
                          : (isDarkMode ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
                      }`}
                    >
                      {pattern.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Palette */}
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <Palette className="w-4 h-4 inline mr-1" />
                  Color Palette:
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {colorPalette.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-lg border-2 transition-all ${
                        selectedColor === color 
                          ? 'border-gray-800 dark:border-white scale-110' 
                          : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                
                {/* Custom Color Input */}
                <div className="mt-2">
                  <input
                    type="color"
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="w-full h-8 rounded border border-gray-300 dark:border-gray-600"
                  />
                </div>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Progress
                  </span>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {completionPercentage}%
                  </span>
                </div>
                <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2`}>
                  <motion.div
                    className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${completionPercentage}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Controls */}
              <div className="space-y-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={resetPattern}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-lg font-medium flex items-center justify-center space-x-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset Pattern</span>
                </motion.button>
              </div>
            </div>

            {/* Coloring Canvas */}
            <div className="flex flex-col items-center">
              <div className={`p-4 rounded-xl border-2 ${
                isDarkMode ? 'border-slate-600 bg-slate-900/50' : 'border-gray-200 bg-gray-50'
              }`}>
                <svg
                  width="240"
                  height="240"
                  viewBox="0 0 100 100"
                  className="cursor-pointer"
                >
                  {/* Background */}
                  <rect width="100" height="100" fill={isDarkMode ? '#1e293b' : '#f8fafc'} />
                  
                  {/* Render pattern areas */}
                  {colorAreas.map((area) => (
                    <motion.path
                      key={area.id}
                      d={area.path}
                      fill={area.color}
                      stroke={isDarkMode ? '#64748b' : '#94a3b8'}
                      strokeWidth="0.5"
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => colorArea(area.id)}
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    />
                  ))}
                </svg>
              </div>
              
              <p className={`text-xs text-center mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Click areas to color them with your selected color
              </p>
            </div>
          </div>

          {/* Completion Message */}
          {isCompleted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-6 p-4 rounded-xl text-center ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-pink-900/30 to-purple-900/30 border border-pink-700' 
                  : 'bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200'
              }`}
            >
              <h4 className={`font-bold text-lg ${isDarkMode ? 'text-pink-400' : 'text-pink-700'}`}>
                Masterpiece Complete! 🎨✨
              </h4>
              <p className={`text-sm ${isDarkMode ? 'text-pink-300' : 'text-pink-600'}`}>
                You created a beautiful zen artwork in {Math.floor(sessionTime / 60)}:{(sessionTime % 60).toString().padStart(2, '0')}
              </p>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                {15 + Math.floor(sessionTime / 30) * 5} XP earned for your creativity!
              </p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
