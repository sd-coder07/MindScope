'use client';

import { Maximize2, Pause, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface YouTubePlayerProps {
  videoUrl: string;
  autoplay?: boolean;
  muted?: boolean;
  controls?: boolean;
  loop?: boolean;
  className?: string;
  onReady?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnd?: () => void;
}

export default function YouTubePlayer({
  videoUrl,
  autoplay = false,
  muted = true,
  controls = true,
  loop = false,
  className = '',
  onReady,
  onPlay,
  onPause,
  onEnd
}: YouTubePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(muted);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Extract video ID from YouTube URL
  const extractVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const videoId = extractVideoId(videoUrl);

  useEffect(() => {
    if (!videoId) {
      setError('Invalid YouTube URL');
      return;
    }

    // Load YouTube IFrame API
    if (!window.YT) {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      document.body.appendChild(script);

      window.onYouTubeIframeAPIReady = initializePlayer;
    } else {
      initializePlayer();
    }

    function initializePlayer() {
      if (!containerRef.current) return;

      try {
        playerRef.current = new window.YT.Player(containerRef.current, {
          videoId: videoId,
          playerVars: {
            autoplay: autoplay ? 1 : 0,
            mute: muted ? 1 : 0,
            controls: controls ? 1 : 0,
            loop: loop ? 1 : 0,
            playlist: loop ? videoId : undefined,
            rel: 0,
            showinfo: 0,
            modestbranding: 1,
            iv_load_policy: 3,
            enablejsapi: 1,
            origin: window.location.origin
          },
          events: {
            onReady: (event: any) => {
              setIsLoading(false);
              onReady?.();
            },
            onStateChange: (event: any) => {
              const state = event.data;
              if (state === window.YT.PlayerState.PLAYING) {
                setIsPlaying(true);
                onPlay?.();
              } else if (state === window.YT.PlayerState.PAUSED) {
                setIsPlaying(false);
                onPause?.();
              } else if (state === window.YT.PlayerState.ENDED) {
                setIsPlaying(false);
                onEnd?.();
              }
            },
            onError: (event: any) => {
              setError(`Video error: ${event.data}`);
              setIsLoading(false);
            }
          }
        });
      } catch (err) {
        setError('Failed to initialize YouTube player');
        setIsLoading(false);
      }
    }

    return () => {
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
      }
    };
  }, [videoId, autoplay, muted, controls, loop]);

  const togglePlayPause = () => {
    if (!playerRef.current) return;

    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const toggleMute = () => {
    if (!playerRef.current) return;

    if (isMuted) {
      playerRef.current.unMute();
      setIsMuted(false);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  };

  const restartVideo = () => {
    if (!playerRef.current) return;
    playerRef.current.seekTo(0);
    playerRef.current.playVideo();
  };

  const toggleFullscreen = () => {
    if (!playerRef.current) return;
    
    const iframe = playerRef.current.getIframe();
    if (iframe.requestFullscreen) {
      iframe.requestFullscreen();
    }
  };

  if (error) {
    return (
      <div className={`relative bg-gray-900 rounded-lg overflow-hidden ${className}`}>
        <div className="flex items-center justify-center h-64 text-red-400">
          <div className="text-center">
            <p className="text-sm font-medium">Failed to load video</p>
            <p className="text-xs mt-1 opacity-75">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`relative bg-gray-900 rounded-lg overflow-hidden group ${className}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* YouTube Player Container */}
      <div 
        ref={containerRef}
        className="w-full h-64 md:h-80 lg:h-96"
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Custom Controls Overlay */}
      {controls && showControls && !isLoading && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={togglePlayPause}
                className="flex items-center justify-center w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-white" />
                ) : (
                  <Play className="w-5 h-5 text-white ml-1" />
                )}
              </button>

              <button
                onClick={restartVideo}
                className="flex items-center justify-center w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
              >
                <RotateCcw className="w-4 h-4 text-white" />
              </button>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={toggleMute}
                className="flex items-center justify-center w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-white" />
                ) : (
                  <Volume2 className="w-4 h-4 text-white" />
                )}
              </button>

              <button
                onClick={toggleFullscreen}
                className="flex items-center justify-center w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
              >
                <Maximize2 className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Extend Window interface for YouTube API
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}
