'use client';

import {
    ArrowLeft,
    Pause,
    Play,
    RotateCcw,
    Volume2,
    VolumeX
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface EnhancedMeditationSessionProps {
  sessionId: string;
  sessionName: string;
  duration: number;
  description: string;
  color: string;
  onBack: () => void;
  onComplete?: (sessionId: string, actualDuration: number) => void;
  videoUrl?: string;
}

const EnhancedMeditationSession: React.FC<EnhancedMeditationSessionProps> = ({
  sessionId,
  sessionName,
  duration,
  description,
  color,
  onBack,
  onComplete,
  videoUrl
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(duration * 60);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleComplete = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    const actualDuration = duration - (timeRemaining / 60);
    onComplete?.(sessionId, actualDuration);
  }, [duration, timeRemaining, onComplete, sessionId]);

  useEffect(() => {
    if (isPlaying && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, timeRemaining, handleComplete]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setTimeRemaining(duration * 60);
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const progress = ((duration * 60 - timeRemaining) / (duration * 60)) * 100;

  return (
    <div className={`relative ${color} rounded-2xl overflow-hidden`}>
      <div className="absolute inset-0 w-full h-full">
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-cover"
            loop
            playsInline
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${color}`} />
        )}
      </div>

      <div className="relative z-10 h-full flex flex-col">
        <div className="flex items-center justify-between p-6">
          <button
            onClick={onBack}
            className="p-2 rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/30 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-1">{sessionName}</h2>
            <p className="text-white/60 text-sm">{description}</p>
          </div>
          
          <div className="w-10 h-10" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="relative mb-8">
            <svg width="200" height="200" className="transform -rotate-90">
              <circle
                cx="100"
                cy="100"
                r="90"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="4"
                fill="none"
              />
              <circle
                cx="100"
                cy="100"
                r="90"
                stroke="white"
                strokeWidth="4"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 90}`}
                strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-6xl font-bold text-white mb-2">
                {formatTime(timeRemaining)}
              </div>
              <div className="text-white/60 text-sm">remaining</div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-center space-x-6 mb-6">
            <button
              onClick={handleRestart}
              className="p-3 rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/30 transition-colors"
            >
              <RotateCcw className="w-6 h-6 text-white" />
            </button>
            
            <button
              onClick={handlePlayPause}
              className="p-4 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 text-white" />
              ) : (
                <Play className="w-8 h-8 text-white ml-1" />
              )}
            </button>
            
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-3 rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/30 transition-colors"
            >
              {isMuted ? (
                <VolumeX className="w-6 h-6 text-white" />
              ) : (
                <Volume2 className="w-6 h-6 text-white" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-center space-x-4">
            <Volume2 className="w-4 h-4 text-white/60" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-32 h-2 bg-white/20 rounded-lg"
            />
            <span className="text-white/60 text-sm w-8">
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedMeditationSession;
