'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Brain, Eye, Heart, Moon, Palette, Sun, Zap } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface AdaptiveThemeProps {
  userId?: string;
  onThemeChange?: (theme: ThemeConfig) => void;
}

interface ThemeConfig {
  mode: 'light' | 'dark' | 'auto';
  colorScheme: 'default' | 'calm' | 'energetic' | 'warm' | 'cool';
  emotionAdaptive: boolean;
  circadianSync: boolean;
  accessibility: {
    highContrast: boolean;
    reducedMotion: boolean;
    colorBlindFriendly: boolean;
  };
  customization: {
    primaryColor: string;
    accentColor: string;
    backgroundStyle: 'gradient' | 'solid' | 'pattern';
  };
}

interface EmotionTheme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  animations: {
    speed: number;
    intensity: number;
  };
  effects: {
    blur: number;
    saturation: number;
    brightness: number;
  };
}

const EMOTION_THEMES: Record<string, EmotionTheme> = {
  happy: {
    colors: {
      primary: '#FFD700',
      secondary: '#FFA500',
      background: 'linear-gradient(135deg, #FFE5B4 0%, #FFD700 100%)',
      text: '#8B4513'
    },
    animations: { speed: 1.5, intensity: 1.2 },
    effects: { blur: 0, saturation: 1.3, brightness: 1.1 }
  },
  calm: {
    colors: {
      primary: '#A8DADC',
      secondary: '#457B9D',
      background: 'linear-gradient(135deg, #F1FAEE 0%, #A8DADC 100%)',
      text: '#1D3557'
    },
    animations: { speed: 0.7, intensity: 0.8 },
    effects: { blur: 1, saturation: 0.9, brightness: 0.95 }
  },
  anxious: {
    colors: {
      primary: '#E63946',
      secondary: '#F77F00',
      background: 'linear-gradient(135deg, #F8F8FF 0%, #E6E6FA 100%)',
      text: '#2F1B69'
    },
    animations: { speed: 0.5, intensity: 0.6 },
    effects: { blur: 0.5, saturation: 0.8, brightness: 0.9 }
  },
  energetic: {
    colors: {
      primary: '#FF6B6B',
      secondary: '#4ECDC4',
      background: 'linear-gradient(135deg, #FFCCCB 0%, #87CEEB 100%)',
      text: '#2C3E50'
    },
    animations: { speed: 2, intensity: 1.5 },
    effects: { blur: 0, saturation: 1.4, brightness: 1.2 }
  },
  sad: {
    colors: {
      primary: '#6C757D',
      secondary: '#495057',
      background: 'linear-gradient(135deg, #F8F9FA 0%, #DEE2E6 100%)',
      text: '#212529'
    },
    animations: { speed: 0.4, intensity: 0.5 },
    effects: { blur: 2, saturation: 0.7, brightness: 0.8 }
  }
};

const COLOR_SCHEMES = {
  default: {
    name: 'Default Therapy',
    colors: ['#B5A7E6', '#A8DADC', '#457B9D', '#1D3557']
  },
  calm: {
    name: 'Ocean Calm',
    colors: ['#A8DADC', '#457B9D', '#1D3557', '#F1FAEE']
  },
  energetic: {
    name: 'Sunrise Energy',
    colors: ['#FFD60A', '#FF8500', '#FF6B35', '#F72585']
  },
  warm: {
    name: 'Warm Embrace',
    colors: ['#FFBE0B', '#FB8500', '#FF006E', '#8338EC']
  },
  cool: {
    name: 'Forest Serenity',
    colors: ['#52B788', '#40916C', '#2D6A4F', '#1B4332']
  }
};

export default function AdaptiveTheme({ userId, onThemeChange }: AdaptiveThemeProps) {
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>({
    mode: 'auto',
    colorScheme: 'default',
    emotionAdaptive: true,
    circadianSync: true,
    accessibility: {
      highContrast: false,
      reducedMotion: false,
      colorBlindFriendly: false
    },
    customization: {
      primaryColor: '#B5A7E6',
      accentColor: '#A8DADC',
      backgroundStyle: 'gradient'
    }
  });

  const [currentEmotion, setCurrentEmotion] = useState('calm');
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('morning');
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [appliedTheme, setAppliedTheme] = useState<EmotionTheme>(EMOTION_THEMES.calm);

  useEffect(() => {
    // Detect time of day for circadian sync
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setTimeOfDay('morning');
    else if (hour >= 12 && hour < 17) setTimeOfDay('afternoon');
    else if (hour >= 17 && hour < 21) setTimeOfDay('evening');
    else setTimeOfDay('night');
  }, []);

  useEffect(() => {
    // Apply emotion-adaptive theme
    if (themeConfig.emotionAdaptive && EMOTION_THEMES[currentEmotion]) {
      setAppliedTheme(EMOTION_THEMES[currentEmotion]);
    }
  }, [currentEmotion, themeConfig.emotionAdaptive]);

  useEffect(() => {
    // Apply circadian rhythm adjustments
    if (themeConfig.circadianSync) {
      const circadianAdjustments = getCircadianAdjustments(timeOfDay);
      applyCircadianTheme(circadianAdjustments);
    }
  }, [timeOfDay, themeConfig.circadianSync]);

  useEffect(() => {
    // Apply circadian rhythm adjustments
    if (themeConfig.circadianSync) {
      const circadianAdjustments = getCircadianAdjustments(timeOfDay);
      applyCircadianTheme(circadianAdjustments);
    }
  }, [timeOfDay, themeConfig.circadianSync]);

  const getCircadianAdjustments = (time: string) => {
    switch (time) {
      case 'morning':
        return { brightness: 1.1, saturation: 1.2, warmth: 0.9 };
      case 'afternoon':
        return { brightness: 1.0, saturation: 1.0, warmth: 1.0 };
      case 'evening':
        return { brightness: 0.9, saturation: 0.9, warmth: 1.1 };
      case 'night':
        return { brightness: 0.7, saturation: 0.8, warmth: 1.3 };
      default:
        return { brightness: 1.0, saturation: 1.0, warmth: 1.0 };
    }
  };

  const applyCircadianTheme = (adjustments: any) => {
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--circadian-brightness', adjustments.brightness.toString());
      document.documentElement.style.setProperty('--circadian-saturation', adjustments.saturation.toString());
      document.documentElement.style.setProperty('--circadian-warmth', adjustments.warmth.toString());
    }
  };

  const applyThemeToDocument = useCallback(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      
      // Apply color variables
      root.style.setProperty('--theme-primary', appliedTheme.colors.primary);
      root.style.setProperty('--theme-secondary', appliedTheme.colors.secondary);
      root.style.setProperty('--theme-background', appliedTheme.colors.background);
      root.style.setProperty('--theme-text', appliedTheme.colors.text);
      
      // Apply animation variables
      root.style.setProperty('--animation-speed', appliedTheme.animations.speed.toString());
      root.style.setProperty('--animation-intensity', appliedTheme.animations.intensity.toString());
      
      // Apply effect variables
      root.style.setProperty('--effect-blur', `${appliedTheme.effects.blur}px`);
      root.style.setProperty('--effect-saturation', appliedTheme.effects.saturation.toString());
      root.style.setProperty('--effect-brightness', appliedTheme.effects.brightness.toString());
      
      // Apply accessibility settings
      if (themeConfig.accessibility.reducedMotion) {
        root.style.setProperty('--animation-duration', '0s');
      }
      
      if (themeConfig.accessibility.highContrast) {
        root.style.setProperty('--contrast-multiplier', '1.5');
      }
    }
  }, [appliedTheme, themeConfig.accessibility]);

  useEffect(() => {
    // Notify parent component of theme changes
    onThemeChange?.(themeConfig);
    
    // Apply theme to document root
    applyThemeToDocument();
  }, [themeConfig, appliedTheme, onThemeChange, applyThemeToDocument]);

  const updateThemeConfig = (updates: Partial<ThemeConfig>) => {
    setThemeConfig(prev => ({ ...prev, ...updates }));
  };

  const simulateEmotionDetection = (emotion: string) => {
    setCurrentEmotion(emotion);
  };

  return (
    <div className="fixed top-4 left-4 z-50">
      {/* Theme Control Button */}
      <motion.button
        onClick={() => setShowCustomizer(!showCustomizer)}
        className="bg-white/90 backdrop-blur-md rounded-full p-3 shadow-lg hover:shadow-xl transition-all"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Palette className="w-5 h-5 text-gray-700" />
      </motion.button>

      {/* Theme Customizer Panel */}
      <AnimatePresence>
        {showCustomizer && (
          <motion.div
            initial={{ opacity: 0, x: -300, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -300, scale: 0.9 }}
            className="absolute top-16 left-0 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 w-80 max-h-96 overflow-y-auto"
          >
            <h3 className="text-lg font-bold text-gray-800 mb-4">Adaptive Theme</h3>
            
            {/* Mode Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Theme Mode</label>
              <div className="grid grid-cols-3 gap-2">
                {['light', 'dark', 'auto'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => updateThemeConfig({ mode: mode as any })}
                    className={`p-2 rounded-lg text-xs font-medium transition-all ${
                      themeConfig.mode === mode
                        ? 'bg-serenity-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {mode === 'light' && <Sun className="w-4 h-4 mx-auto mb-1" />}
                    {mode === 'dark' && <Moon className="w-4 h-4 mx-auto mb-1" />}
                    {mode === 'auto' && <Eye className="w-4 h-4 mx-auto mb-1" />}
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Scheme */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Color Scheme</label>
              <div className="space-y-2">
                {Object.entries(COLOR_SCHEMES).map(([key, scheme]) => (
                  <button
                    key={key}
                    onClick={() => updateThemeConfig({ colorScheme: key as any })}
                    className={`w-full p-3 rounded-lg text-left transition-all ${
                      themeConfig.colorScheme === key
                        ? 'bg-serenity-100 border-2 border-serenity-500'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex space-x-1">
                        {scheme.colors.map((color, idx) => (
                          <div
                            key={idx}
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium">{scheme.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Adaptive Features */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Adaptive Features</label>
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={themeConfig.emotionAdaptive}
                    onChange={(e) => updateThemeConfig({ emotionAdaptive: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <Brain className="w-4 h-4 text-purple-600" />
                  <span className="text-sm">Emotion-Adaptive Colors</span>
                </label>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={themeConfig.circadianSync}
                    onChange={(e) => updateThemeConfig({ circadianSync: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <Sun className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm">Circadian Rhythm Sync</span>
                </label>
              </div>
            </div>

            {/* Accessibility */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Accessibility</label>
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={themeConfig.accessibility.highContrast}
                    onChange={(e) => updateThemeConfig({
                      accessibility: { ...themeConfig.accessibility, highContrast: e.target.checked }
                    })}
                    className="rounded border-gray-300"
                  />
                  <Eye className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">High Contrast</span>
                </label>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={themeConfig.accessibility.reducedMotion}
                    onChange={(e) => updateThemeConfig({
                      accessibility: { ...themeConfig.accessibility, reducedMotion: e.target.checked }
                    })}
                    className="rounded border-gray-300"
                  />
                  <Zap className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Reduced Motion</span>
                </label>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={themeConfig.accessibility.colorBlindFriendly}
                    onChange={(e) => updateThemeConfig({
                      accessibility: { ...themeConfig.accessibility, colorBlindFriendly: e.target.checked }
                    })}
                    className="rounded border-gray-300"
                  />
                  <Heart className="w-4 h-4 text-red-600" />
                  <span className="text-sm">Color Blind Friendly</span>
                </label>
              </div>
            </div>

            {/* Emotion Simulation (for demo) */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Emotion</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(EMOTION_THEMES).map((emotion) => (
                  <button
                    key={emotion}
                    onClick={() => simulateEmotionDetection(emotion)}
                    className={`p-2 rounded-lg text-xs font-medium transition-all ${
                      currentEmotion === emotion
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Current Status */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-600 space-y-1">
                <div>Mode: {themeConfig.mode}</div>
                <div>Emotion: {currentEmotion}</div>
                <div>Time: {timeOfDay}</div>
                <div>Adaptive: {themeConfig.emotionAdaptive ? 'On' : 'Off'}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Theme Preview */}
      <motion.div
        className="absolute top-20 left-0 w-16 h-16 rounded-lg shadow-lg"
        style={{
          background: appliedTheme.colors.background,
          filter: `brightness(${appliedTheme.effects.brightness}) saturate(${appliedTheme.effects.saturation}) blur(${appliedTheme.effects.blur}px)`
        }}
        animate={{
          scale: [1, 1.05, 1],
          transition: {
            duration: 2 / appliedTheme.animations.speed,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
      />
    </div>
  );
}
