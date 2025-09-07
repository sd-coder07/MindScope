import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

interface TestProps {
  sessionId: string;
  sessionName: string;
  duration: number;
  description: string;
  color: string;
  onBack: () => void;
  onComplete?: (sessionId: string, actualDuration: number) => void;
  videoUrl?: string;
}

const TestMeditationSession: React.FC<TestProps> = ({
  sessionId,
  sessionName,
  duration,
  description,
  color,
  onBack,
  onComplete
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isPlaying && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsPlaying(false);
            onComplete?.(sessionId, duration * 60 - prev);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPlaying, timeLeft, sessionId, duration, onComplete]);

  const handlePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setTimeLeft(duration * 60);
  }, [duration]);

  const handleVolumeToggle = useCallback(() => {
    setIsMuted(!isMuted);
  }, [isMuted]);

  const progress = ((duration * 60 - timeLeft) / (duration * 60)) * 100;

  return (
    <div 
      className="relative w-full h-screen bg-black overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${color}20, #000)` }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-30" />

      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10"
          >
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/50 to-transparent">
              <div className="flex items-center justify-between text-white">
                <button
                  onClick={onBack}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Back</span>
                </button>
              </div>
            </div>

            {/* Center Content */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white space-y-8">
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl font-light mb-4"
                >
                  {sessionName}
                </motion.h1>
                
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xl opacity-80 max-w-md mx-auto"
                >
                  {description}
                </motion.p>

                {/* Timer Display */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-6xl font-light tracking-wider"
                >
                  {formatTime(timeLeft)}
                </motion.div>

                {/* Progress Ring */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 }}
                  className="relative w-32 h-32 mx-auto"
                >
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="2"
                      fill="none"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke={color}
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 45}`}
                      strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                </motion.div>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/50 to-transparent">
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={handleReset}
                  className="p-3 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white"
                >
                  <RotateCcw className="w-6 h-6" />
                </button>

                <button
                  onClick={handlePlayPause}
                  className="p-4 rounded-full bg-white/30 hover:bg-white/40 transition-colors text-white"
                >
                  {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                </button>

                <button
                  onClick={handleVolumeToggle}
                  className="p-3 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white"
                >
                  {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TestMeditationSession;
