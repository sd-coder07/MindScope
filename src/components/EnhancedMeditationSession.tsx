'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  Maximize,
  Minimize,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MeditationAudioService } from '../lib/meditationAudio';

interface EnhancedMeditationSessionProps {
  sessionId: string;
  sessionName: string;
  duration: number;
  description: string;
  color: string;
  onBack: () => void;
  onComplete?: (sessionId: string, actualDuration: number) => void;
  videoUrl?: string;
  isDarkMode?: boolean;
}

// Initialize real meditation audio service
const meditationAudioService = new MeditationAudioService();

const EnhancedMeditationSession: React.FC<EnhancedMeditationSessionProps> = ({
  sessionId,
  sessionName,
  duration,
  description,
  color,
  onBack,
  onComplete,
  videoUrl,
  isDarkMode = false
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(duration * 60);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load meditation session on mount
  useEffect(() => {
    const loadSession = async () => {
      try {
        setIsLoading(true);
        setLoadingError(null);
        console.log(`🚀 Loading meditation session: ${sessionId}`);
        
        if (videoUrl) {
          console.log(`✅ Video URL provided: ${videoUrl}`);
        } else {
          await meditationAudioService.loadSession(sessionId);
          console.log(`✅ Successfully loaded meditation session: ${sessionId}`);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.warn('⚠️  Some meditation assets failed to load, but session will continue:', error);
        setIsLoading(false);
      }
    };

    loadSession();

    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
      meditationAudioService.cleanup();
      if (timerRef.current) clearInterval(timerRef.current);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [sessionId, videoUrl]);

  const handleComplete = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    meditationAudioService.stopSession();
    setIsPlaying(false);
    const actualDuration = duration - (timeRemaining / 60);
    onComplete?.(sessionId, actualDuration);
  }, [duration, timeRemaining, onComplete, sessionId]);

  // Timer logic
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

  // Volume control
  useEffect(() => {
    meditationAudioService.setVolume(isMuted ? 0 : volume);
    
    if (videoRef.current && !isYouTubeUrl(videoUrl || '')) {
      videoRef.current.volume = isMuted ? 0 : volume;
      videoRef.current.muted = isMuted;
    } else if (isYouTubeUrl(videoUrl || '') && iframeRef.current) {
      // Control YouTube video volume through API
      const volumePercent = isMuted ? 0 : Math.round(volume * 100);
      iframeRef.current.contentWindow?.postMessage(`{"event":"command","func":"setVolume","args":[${volumePercent}]}`, '*');
      if (isMuted) {
        iframeRef.current.contentWindow?.postMessage('{"event":"command","func":"mute","args":""}', '*');
      } else {
        iframeRef.current.contentWindow?.postMessage('{"event":"command","func":"unMute","args":""}', '*');
      }
    }
  }, [volume, isMuted, videoUrl]);

  // Set initial video volume when video loads
  useEffect(() => {
    if (videoRef.current && videoUrl) {
      const videoElement = videoRef.current;
      
      const handleLoadedData = () => {
        videoElement.volume = isMuted ? 0 : volume;
        videoElement.muted = isMuted;
        // Force re-render to ensure volume display is correct
        setVolume(volume);
      };
      
      const handleVolumeChange = () => {
        // Sync volume display with actual video volume (if it changes externally)
        if (!isMuted && videoElement.volume !== volume) {
          setVolume(videoElement.volume);
        }
      };
      
      videoElement.addEventListener('loadeddata', handleLoadedData);
      videoElement.addEventListener('volumechange', handleVolumeChange);
      
      return () => {
        videoElement.removeEventListener('loadeddata', handleLoadedData);
        videoElement.removeEventListener('volumechange', handleVolumeChange);
      };
    }
  }, [videoUrl, volume, isMuted]);

  // Auto-hide controls in fullscreen
  useEffect(() => {
    if (isFullscreen) {
      const hideControls = () => {
        setShowControls(false);
      };

      const showControlsTemp = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(hideControls, 3000);
      };

      document.addEventListener('mousemove', showControlsTemp);
      return () => {
        document.removeEventListener('mousemove', showControlsTemp);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      };
    }
  }, [isFullscreen]);

  // Sync isFullscreen state with browser fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNowFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isNowFullscreen);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handlePlayPause = async () => {
    if (isLoading) return;

    try {
      if (isPlaying) {
        if (videoRef.current && !isYouTubeUrl(videoUrl || '')) {
          videoRef.current.pause();
        } else if (isYouTubeUrl(videoUrl || '') && iframeRef.current) {
          // Pause YouTube video using YouTube API
          iframeRef.current.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
        }
        
        meditationAudioService.pauseSession();
        setIsPlaying(false);
        console.log('⏸️  Meditation session paused');
      } else {
        console.log('▶️  Starting meditation session...');
        
        if (videoRef.current && !isYouTubeUrl(videoUrl || '')) {
          await videoRef.current.play();
        } else if (isYouTubeUrl(videoUrl || '') && iframeRef.current) {
          // Play YouTube video using YouTube API instead of reloading iframe
          iframeRef.current.contentWindow?.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
        }
        
        await meditationAudioService.playSession();
        setIsPlaying(true);
        console.log('✅ Meditation session started');
      }
    } catch (error) {
      console.warn('⚠️  Media playback issue, continuing with visual meditation:', error);
      setIsPlaying(!isPlaying);
    }
  };

  const handleRestart = () => {
    if (videoRef.current && !isYouTubeUrl(videoUrl || '')) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    } else if (isYouTubeUrl(videoUrl || '') && iframeRef.current) {
      // For YouTube videos, seek to start using YouTube API
      iframeRef.current.contentWindow?.postMessage('{"event":"command","func":"seekTo","args":[0, true]}', '*');
      iframeRef.current.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
    }
    
    meditationAudioService.stopSession();
    setIsPlaying(false);
    setTimeRemaining(duration * 60);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current) {
        if (containerRef.current.requestFullscreen) {
          containerRef.current.requestFullscreen();
        }
      }
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getYouTubeEmbedUrl = (url: string, autoplay: boolean = false): string | null => {
    const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(youtubeRegex);
    if (match) {
      const autoplayParam = autoplay ? '1' : '0';
      const muteParam = '0'; // Always unmuted so users can hear the meditation audio
      return `https://www.youtube.com/embed/${match[1]}?autoplay=${autoplayParam}&mute=${muteParam}&controls=1&loop=1&playlist=${match[1]}&enablejsapi=1&rel=0&modestbranding=1&iv_load_policy=3`;
    }
    return null;
  };

  const isYouTubeUrl = (url: string): boolean => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const progress = ((duration * 60 - timeRemaining) / (duration * 60)) * 100;

  return (
    <div 
      ref={containerRef} 
      className={`${isFullscreen ? 'fixed inset-0 z-50' : 'relative'} w-full h-screen overflow-hidden ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-100'
      }`} 
      style={{ 
        background: videoUrl 
          ? `linear-gradient(135deg, ${color}20, ${isDarkMode ? '#000' : '#1f2937'})` 
          : isDarkMode 
            ? `linear-gradient(135deg, ${color}30, #111827)` 
            : `linear-gradient(135deg, ${color}20, #f3f4f6)` 
      }}
    >
      {/* Video Background Container */}
      <div className="absolute inset-0 w-full h-full">
        {videoUrl ? (
          isYouTubeUrl(videoUrl) ? (
            <div className="w-full h-full relative">
              {!isPlaying && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10 pointer-events-none">
                  <div className="text-white text-center">
                    <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mb-4 mx-auto">
                      <Play className="w-8 h-8 ml-1" />
                    </div>
                    <div className="text-lg">Click Play to Start Video</div>
                  </div>
                </div>
              )}
              <iframe
                ref={iframeRef}
                src={getYouTubeEmbedUrl(videoUrl, false) || ''}
                className="w-full h-full object-cover"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                title="Meditation Video"
                onLoad={() => {
                  console.log('YouTube iframe loaded, setting up API communication');
                  // Set up message listener for YouTube API responses
                  const handleMessage = (event: MessageEvent) => {
                    if (event.origin !== 'https://www.youtube.com') return;
                    try {
                      const data = JSON.parse(event.data);
                      if (data.event === 'video-progress') {
                        // Handle video progress if needed
                      } else if (data.info && data.info.playerState !== undefined) {
                        // Handle player state changes
                        const state = data.info.playerState;
                        // 1 = playing, 2 = paused, 0 = ended, -1 = unstarted
                        if (state === 1 && !isPlaying) {
                          setIsPlaying(true);
                        } else if (state === 2 && isPlaying) {
                          setIsPlaying(false);
                        }
                      }
                    } catch (e) {
                      // Ignore non-JSON messages
                    }
                  };
                  
                  window.addEventListener('message', handleMessage);
                  
                  // Request to receive state change events
                  setTimeout(() => {
                    if (iframeRef.current) {
                      iframeRef.current.contentWindow?.postMessage('{"event":"listening","id":"meditation-player"}', '*');
                    }
                  }, 1000);
                }}
              />
            </div>
          ) : (
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-full object-cover"
              loop
              playsInline
              onError={(e) => {
                console.warn('Video failed to load:', e);
                setLoadingError('Video failed to load, but you can still enjoy the meditation session.');
              }}
              onLoadStart={() => console.log('Video loading started')}
              onCanPlay={() => console.log('Video can play')}
            />
          )
        ) : (
          <div 
            className="absolute inset-0 bg-gradient-to-br opacity-80" 
            style={{ 
              background: isDarkMode 
                ? `linear-gradient(135deg, ${color}, #000)` 
                : `linear-gradient(135deg, ${color}, #374151)` 
            }} 
          />
        )}
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 h-full min-h-[600px] flex flex-col">
        {/* Header */}
        <AnimatePresence>
          {(showControls || !isFullscreen) && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex items-center justify-between p-6 backdrop-blur-sm ${
                isDarkMode ? 'bg-black/20' : 'bg-white/20'
              }`}
            >
              <button
                onClick={onBack}
                className={`flex items-center space-x-2 transition-colors ${
                  isDarkMode 
                    ? 'text-white/80 hover:text-white' 
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
              
              <h2 className={`text-xl font-bold text-center flex-1 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {sessionName}
              </h2>
              
              <button
                onClick={toggleFullscreen}
                className={`transition-colors ${
                  isDarkMode 
                    ? 'text-white/80 hover:text-white' 
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          {/* Session Info */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <h3 className={`text-2xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>{sessionName}</h3>
            <p className={`text-lg max-w-md mx-auto ${
              isDarkMode ? 'text-white/80' : 'text-gray-700'
            }`}>{description}</p>
          </motion.div>

          {/* Timer Circle */}
          <div className="relative mb-8">
            <svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke={isDarkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"}
                strokeWidth="2"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke={isDarkMode ? "white" : "#374151"}
                strokeWidth="2"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className={`text-4xl font-bold mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {formatTime(timeRemaining)}
              </div>
              <div className={`text-sm ${
                isDarkMode ? 'text-white/60' : 'text-gray-600'
              }`}>remaining</div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="mb-8 text-center">
              <div className={`animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4 ${
                isDarkMode ? 'border-white' : 'border-gray-900'
              }`}></div>
              <p className={isDarkMode ? 'text-white/80' : 'text-gray-700'}>Streaming meditation content...</p>
              <p className={`text-sm mt-2 ${
                isDarkMode ? 'text-white/60' : 'text-gray-600'
              }`}>Loading audio & video from online sources</p>
            </div>
          )}

          {/* Online Streaming Indicator */}
          {!isLoading && !loadingError && (
            <div className="mb-4 text-center">
              <div className={`inline-flex items-center space-x-2 rounded-full px-3 py-1 ${
                isDarkMode 
                  ? 'bg-green-500/20 border border-green-500/30' 
                  : 'bg-green-100 border border-green-300'
              }`}>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className={`text-xs ${
                  isDarkMode ? 'text-green-200' : 'text-green-700'
                }`}>Ready</span>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <AnimatePresence>
          {(showControls || !isFullscreen) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className={`p-6 backdrop-blur-sm ${
                isDarkMode ? 'bg-black/20' : 'bg-white/20'
              }`}
            >
              {/* Main Controls */}
              <div className="flex items-center justify-center space-x-6 mb-6">
                <button
                  onClick={handleRestart}
                  disabled={isLoading}
                  className={`p-3 rounded-full transition-colors disabled:opacity-50 ${
                    isDarkMode 
                      ? 'bg-white/20 hover:bg-white/30' 
                      : 'bg-gray-700/20 hover:bg-gray-700/30'
                  }`}
                >
                  <RotateCcw className={`w-6 h-6 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`} />
                </button>
                
                <button
                  onClick={handlePlayPause}
                  disabled={isLoading}
                  className={`p-4 rounded-full transition-colors disabled:opacity-50 ${
                    isDarkMode 
                      ? 'bg-white/30 hover:bg-white/40' 
                      : 'bg-gray-700/30 hover:bg-gray-700/40'
                  }`}
                >
                  {isPlaying ? (
                    <Pause className={`w-8 h-8 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`} />
                  ) : (
                    <Play className={`w-8 h-8 ml-1 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`} />
                  )}
                </button>
                
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-3 rounded-full transition-colors ${
                    isDarkMode 
                      ? 'bg-white/20 hover:bg-white/30' 
                      : 'bg-gray-700/20 hover:bg-gray-700/30'
                  }`}
                >
                  {isMuted ? (
                    <VolumeX className={`w-6 h-6 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`} />
                  ) : (
                    <Volume2 className={`w-6 h-6 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`} />
                  )}
                </button>
              </div>

              {/* Volume Slider */}
              <div className="flex items-center justify-center space-x-4">
                <Volume2 className={`w-4 h-4 ${
                  isDarkMode ? 'text-white/60' : 'text-gray-600'
                }`} />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className={`w-32 h-2 rounded-lg appearance-none cursor-pointer slider ${
                    isDarkMode ? 'bg-white/20' : 'bg-gray-600/20'
                  }`}
                />
                <span className={`text-sm w-8 ${
                  isDarkMode ? 'text-white/60' : 'text-gray-600'
                }`}>
                  {Math.round(volume * 100)}%
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Custom Slider Styles - Using CSS Module approach */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .slider::-webkit-slider-thumb {
            appearance: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: ${isDarkMode ? 'white' : '#374151'};
            cursor: pointer;
            border: 2px solid ${isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(55,65,81,0.3)'};
          }
          
          .slider::-moz-range-thumb {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: ${isDarkMode ? 'white' : '#374151'};
            cursor: pointer;
            border: 2px solid ${isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(55,65,81,0.3)'};
          }
        `
      }} />
    </div>
  );
};

export default EnhancedMeditationSession;
