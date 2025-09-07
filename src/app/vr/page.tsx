'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Eye, Headset, Maximize, RotateCcw, Volume2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

// Dynamically import 3D component to avoid SSR issues with very specific loading configuration
const TherapeuticEnvironment = dynamic(
  () => import('@/components/3d/TherapeuticEnvironment').catch(() => {
    // Fallback if 3D component fails to load
    return {
      default: () => (
        <div className="w-full h-screen bg-gradient-to-b from-blue-900 to-purple-900 flex items-center justify-center text-white">
          <div className="text-center">
            <Headset className="w-24 h-24 mx-auto mb-4 opacity-50" />
            <h3 className="text-2xl font-bold mb-2">VR Environment Loading...</h3>
            <p className="text-blue-200">Preparing immersive experience</p>
          </div>
        </div>
      )
    };
  }), 
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading VR Environment...</p>
        </div>
      </div>
    )
  }
);

export default function VRARExperience() {
  const [isVRMode, setIsVRMode] = useState(false);
  const [currentEnvironment, setCurrentEnvironment] = useState<'ocean' | 'forest' | 'space' | 'zen'>('ocean');
  const [ambientVolume, setAmbientVolume] = useState(50);
  const [immersionLevel, setImmersionLevel] = useState<'basic' | 'medium' | 'full'>('medium');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [deviceMotion, setDeviceMotion] = useState({ alpha: 0, beta: 0, gamma: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const vrFrameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Request device motion permissions for mobile VR
    if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
      const handleDeviceMotion = (event: DeviceMotionEvent) => {
        setDeviceMotion({
          alpha: event.rotationRate?.alpha || 0,
          beta: event.rotationRate?.beta || 0,
          gamma: event.rotationRate?.gamma || 0
        });
      };

      if (isVRMode) {
        window.addEventListener('devicemotion', handleDeviceMotion);
      }

      return () => {
        window.removeEventListener('devicemotion', handleDeviceMotion);
      };
    }
  }, [isVRMode]);

  useEffect(() => {
    // Auto-hide controls in VR mode
    if (isVRMode) {
      const timer = setTimeout(() => setShowControls(false), 3000);
      return () => clearTimeout(timer);
    } else {
      setShowControls(true);
    }
  }, [isVRMode]);

  const enterVRMode = async () => {
    try {
      // Request fullscreen
      if (containerRef.current && containerRef.current.requestFullscreen) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
      
      // Lock screen orientation for VR
      if ('screen' in window && 'orientation' in window.screen) {
        try {
          await (window.screen.orientation as any).lock('landscape');
        } catch (error) {
          console.log('Screen orientation lock not supported');
        }
      }
      
      setIsVRMode(true);
      setImmersionLevel('full');
    } catch (error) {
      console.error('Failed to enter VR mode:', error);
      // Fallback to non-fullscreen VR
      setIsVRMode(true);
    }
  };

  const exitVRMode = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    setIsVRMode(false);
    setIsFullscreen(false);
    setImmersionLevel('medium');
  };

  const switchEnvironment = (env: typeof currentEnvironment) => {
    setCurrentEnvironment(env);
  };

  const toggleFullscreen = async () => {
    if (!isFullscreen && containerRef.current) {
      try {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } catch (error) {
        console.error('Fullscreen failed:', error);
      }
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const resetView = () => {
    // Reset camera position and orientation
    setDeviceMotion({ alpha: 0, beta: 0, gamma: 0 });
  };

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* VR Container */}
      <div 
        ref={containerRef}
        className={`w-full h-screen relative ${isVRMode ? 'cursor-none' : ''}`}
        onMouseMove={() => isVRMode && setShowControls(true)}
      >
        {/* VR Frame */}
        <div 
          ref={vrFrameRef}
          className={`w-full h-full transition-all duration-500 ${
            isVRMode ? 'transform scale-105' : ''
          }`}
          style={{
            transform: isVRMode 
              ? `rotateX(${deviceMotion.beta * 0.1}deg) rotateY(${deviceMotion.alpha * 0.1}deg) rotateZ(${deviceMotion.gamma * 0.1}deg)`
              : 'none'
          }}
        >
          <TherapeuticEnvironment 
            theme={currentEnvironment}
            ambientSoundLevel={ambientVolume}
            interactivity={true}
            userId="vr-user"
          />
        </div>

        {/* VR Overlay */}
        {isVRMode && (
          <div className="absolute inset-0 pointer-events-none">
            {/* VR Splitscreen Effect */}
            <div className="absolute inset-0 flex">
              <div className="w-1/2 h-full border-r-2 border-white/10" />
              <div className="w-1/2 h-full" />
            </div>
            
            {/* VR Lens Effect */}
            <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/20" />
            
            {/* Crosshair */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-white/50 rounded-full" />
            </div>
          </div>
        )}

        {/* Navigation Header - Hidden in VR */}
        <AnimatePresence>
          {!isVRMode && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="absolute top-0 left-0 right-0 bg-black/20 backdrop-blur-md z-20 p-6"
            >
              <div className="flex items-center justify-between max-w-7xl mx-auto">
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => window.history.back()}
                    className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-all"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <h1 className="text-2xl font-bold text-white">VR/AR Therapeutic Experience</h1>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={toggleFullscreen}
                    className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-all"
                  >
                    <Maximize className="w-5 h-5" />
                  </button>
                  
                  <motion.button
                    onClick={enterVRMode}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Headset className="w-5 h-5 inline mr-2" />
                    Enter VR Mode
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Control Panel */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0, x: -300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              className={`absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/80 backdrop-blur-md rounded-2xl p-6 space-y-6 z-30 ${
                isVRMode ? 'pointer-events-auto' : ''
              }`}
            >
              {/* VR Mode Toggle */}
              {isVRMode ? (
                <button
                  onClick={exitVRMode}
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-medium transition-all"
                >
                  Exit VR Mode
                </button>
              ) : (
                <button
                  onClick={enterVRMode}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-medium transition-all"
                >
                  <Headset className="w-5 h-5 inline mr-2" />
                  Enter VR
                </button>
              )}

              {/* Environment Selection */}
              <div>
                <label className="block text-white font-medium mb-3">Environment</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'ocean', name: 'Ocean', emoji: '🌊' },
                    { id: 'forest', name: 'Forest', emoji: '🌲' },
                    { id: 'space', name: 'Space', emoji: '🌌' },
                    { id: 'zen', name: 'Zen', emoji: '🧘' }
                  ].map((env) => (
                    <button
                      key={env.id}
                      onClick={() => switchEnvironment(env.id as any)}
                      className={`p-3 rounded-lg text-sm font-medium transition-all ${
                        currentEnvironment === env.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      <div className="text-lg mb-1">{env.emoji}</div>
                      {env.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Audio Controls */}
              <div>
                <label className="block text-white font-medium mb-3">
                  <Volume2 className="w-4 h-4 inline mr-2" />
                  Ambient Volume
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={ambientVolume}
                  onChange={(e) => setAmbientVolume(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
                <div className="text-white/70 text-sm mt-1">{ambientVolume}%</div>
              </div>

              {/* Immersion Level */}
              <div>
                <label className="block text-white font-medium mb-3">
                  <Eye className="w-4 h-4 inline mr-2" />
                  Immersion Level
                </label>
                <select
                  value={immersionLevel}
                  onChange={(e) => setImmersionLevel(e.target.value as any)}
                  className="w-full bg-white/10 text-white border border-white/20 rounded-lg p-2"
                >
                  <option value="basic" className="bg-gray-800">Basic</option>
                  <option value="medium" className="bg-gray-800">Medium</option>
                  <option value="full" className="bg-gray-800">Full VR</option>
                </select>
              </div>

              {/* VR Controls */}
              {isVRMode && (
                <div className="space-y-3">
                  <button
                    onClick={resetView}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-all"
                  >
                    <RotateCcw className="w-4 h-4 inline mr-2" />
                    Reset View
                  </button>
                  
                  <div className="text-white/70 text-xs">
                    <div>Motion: α{deviceMotion.alpha.toFixed(1)}° β{deviceMotion.beta.toFixed(1)}° γ{deviceMotion.gamma.toFixed(1)}°</div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* VR Instructions */}
        {isVRMode && showControls && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-md rounded-xl p-4 text-center z-30"
          >
            <div className="text-white font-medium mb-2">VR Mode Active</div>
            <div className="text-white/70 text-sm space-y-1">
              <div>• Move your device to look around</div>
              <div>• Tap screen to interact</div>
              <div>• Controls auto-hide in 3 seconds</div>
            </div>
          </motion.div>
        )}

        {/* Mobile VR Notice */}
        {typeof window !== 'undefined' && /Mobi|Android/i.test(navigator.userAgent) && !isVRMode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute bottom-4 right-4 bg-blue-600/90 backdrop-blur-md rounded-xl p-4 max-w-xs z-30"
          >
            <div className="text-white font-medium mb-2">📱 Mobile VR Ready</div>
            <div className="text-white/90 text-sm">
              Insert your phone into a VR headset for the best experience!
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
