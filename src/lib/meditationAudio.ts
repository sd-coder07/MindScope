import { fallbackAudioGenerator } from './fallbackAudio';
import { BACKUP_AUDIO_SOURCES, BACKUP_VIDEO_SOURCES, ONLINE_MEDITATION_SOURCES } from './onlineMediaSources';

interface AudioTrack {
  id: string;
  name: string;
  url: string;
  volume: number;
  loop: boolean;
}

interface VideoBackground {
  id: string;
  name: string;
  url: string;
  loop: boolean;
}

interface MeditationMedia {
  sessionId: string;
  audioTracks: AudioTrack[];
  videoBackground?: VideoBackground;
  description: string;
}

export class MeditationAudioService {
  private audioElements: Map<string, HTMLAudioElement> = new Map();
  private videoElement: HTMLVideoElement | null = null;
  private currentSession: string | null = null;
  private masterVolume: number = 0.7;
  private usingFallbackAudio: boolean = false;

  constructor() {
    // Initialize audio context for better browser compatibility
    if (typeof window !== 'undefined') {
      this.initializeAudioContext();
    }
  }

  private initializeAudioContext() {
    // Create audio context for Web Audio API
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContext) {
      const audioContext = new AudioContext();
      // Resume audio context if suspended (required by some browsers)
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
    }
  }

  async loadSession(sessionId: string): Promise<void> {
    const mediaConfig = this.getMediaConfig(sessionId);
    if (!mediaConfig) {
      console.warn(`No media configuration found for session: ${sessionId}`);
      return;
    }

    this.currentSession = sessionId;
    
    // Load audio tracks with error handling
    const audioPromises = mediaConfig.audioTracks.map(async (track) => {
      try {
        await this.loadAudioTrack(track);
        console.log(`Successfully loaded audio track: ${track.name}`);
      } catch (error) {
        console.warn(`Failed to load audio track "${track.name}":`, error);
        // Continue without this track
      }
    });

    await Promise.allSettled(audioPromises);

    // Load video background if available
    if (mediaConfig.videoBackground) {
      try {
        await this.loadVideoBackground(mediaConfig.videoBackground);
        console.log(`Successfully loaded video: ${mediaConfig.videoBackground.name}`);
      } catch (error) {
        console.warn(`Failed to load video "${mediaConfig.videoBackground.name}":`, error);
        // Continue without video background
      }
    }
  }

  private async loadAudioTrack(track: AudioTrack): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.crossOrigin = 'anonymous'; // Enable CORS for online sources
      audio.preload = 'auto';
      audio.loop = track.loop;
      audio.volume = track.volume * this.masterVolume;
      
      const handleSuccess = () => {
        this.audioElements.set(track.id, audio);
        audio.removeEventListener('canplaythrough', handleSuccess);
        audio.removeEventListener('error', handleError);
        audio.removeEventListener('loadeddata', handleLoadedData);
        resolve();
      };
      
      const handleLoadedData = () => {
        // Fallback for when canplaythrough doesn't fire
        setTimeout(handleSuccess, 100);
      };
      
      const handleError = (event: ErrorEvent | Event) => {
        audio.removeEventListener('canplaythrough', handleSuccess);
        audio.removeEventListener('error', handleError);
        audio.removeEventListener('loadeddata', handleLoadedData);
        
        // Try fallback source if available
        const fallbackUrl = this.getFallbackAudioUrl(track.id);
        if (fallbackUrl && track.url !== fallbackUrl) {
          console.warn(`Primary audio source failed for ${track.name}, trying fallback...`);
          track.url = fallbackUrl;
          this.loadAudioTrack(track).then(resolve).catch(reject);
          return;
        }
        
        const errorMessage = `Audio streaming failed for: ${track.name} (${track.url})`;
        console.warn(errorMessage);
        reject(new Error(errorMessage));
      };
      
      audio.addEventListener('canplaythrough', handleSuccess);
      audio.addEventListener('loadeddata', handleLoadedData);
      audio.addEventListener('error', handleError);
      
      // Set source and trigger loading
      try {
        audio.src = track.url;
        console.log(`🎵 Loading online audio: ${track.name} from ${track.url}`);
      } catch (error) {
        handleError(new ErrorEvent('source error', { error }));
      }
    });
  }

  private async loadVideoBackground(video: VideoBackground): Promise<void> {
    return new Promise((resolve, reject) => {
      const videoElement = document.createElement('video');
      videoElement.crossOrigin = 'anonymous'; // Enable CORS for online sources
      videoElement.preload = 'auto';
      videoElement.loop = video.loop;
      videoElement.muted = true; // Videos are background only, no sound
      videoElement.style.objectFit = 'cover';
      videoElement.playsInline = true; // Important for mobile devices
      
      const handleSuccess = () => {
        this.videoElement = videoElement;
        videoElement.removeEventListener('canplaythrough', handleSuccess);
        videoElement.removeEventListener('error', handleError);
        videoElement.removeEventListener('loadeddata', handleLoadedData);
        resolve();
      };
      
      const handleLoadedData = () => {
        // Fallback for when canplaythrough doesn't fire
        setTimeout(handleSuccess, 100);
      };
      
      const handleError = (event: ErrorEvent | Event) => {
        videoElement.removeEventListener('canplaythrough', handleSuccess);
        videoElement.removeEventListener('error', handleError);
        videoElement.removeEventListener('loadeddata', handleLoadedData);
        
        // Try fallback source if available
        const fallbackUrl = this.getFallbackVideoUrl(video.id);
        if (fallbackUrl && video.url !== fallbackUrl) {
          console.warn(`Primary video source failed for ${video.name}, trying fallback...`);
          video.url = fallbackUrl;
          this.loadVideoBackground(video).then(resolve).catch(reject);
          return;
        }
        
        const errorMessage = `Video streaming failed for: ${video.name} (${video.url})`;
        console.warn(errorMessage);
        reject(new Error(errorMessage));
      };
      
      videoElement.addEventListener('canplaythrough', handleSuccess);
      videoElement.addEventListener('loadeddata', handleLoadedData);
      videoElement.addEventListener('error', handleError);
      
      // Set source and trigger loading
      try {
        videoElement.src = video.url;
        console.log(`🎬 Loading online video: ${video.name} from ${video.url}`);
      } catch (error) {
        handleError(new ErrorEvent('source error', { error }));
      }
    });
  }

  async playSession(): Promise<void> {
    if (!this.currentSession) {
      console.warn('No session loaded');
      return;
    }

    const playPromises: Promise<void>[] = [];
    
    // Play all loaded audio tracks
    if (this.audioElements.size > 0) {
      this.audioElements.forEach((audio, trackId) => {
        playPromises.push(
          audio.play().then(() => {
            console.log(`✅ Playing audio track: ${trackId}`);
          }).catch(error => {
            console.warn(`❌ Failed to play audio track ${trackId}:`, error);
            // Try to play with user interaction
            const playWithInteraction = () => {
              audio.play().catch(e => console.warn(`Still failed after interaction: ${e}`));
            };
            document.addEventListener('click', playWithInteraction, { once: true });
          })
        );
      });
    } else {
      // If no audio tracks loaded, try fallback audio generation
      console.info('ℹ️  No audio tracks loaded, using fallback audio generation');
      this.startFallbackAudio();
    }

    // Play video background if available
    if (this.videoElement) {
      playPromises.push(
        this.videoElement.play().then(() => {
          console.log('✅ Playing video background');
        }).catch(error => {
          console.warn('❌ Failed to play video background:', error);
          // Try to play with user interaction
          const playWithInteraction = () => {
            if (this.videoElement) {
              this.videoElement.play().catch(e => console.warn(`Still failed after interaction: ${e}`));
            }
          };
          document.addEventListener('click', playWithInteraction, { once: true });
        })
      );
    } else {
      console.info('ℹ️  No video background loaded, using gradient background');
    }

    // Wait for all media to start playing (but don't fail if some don't work)
    await Promise.allSettled(playPromises);
    console.log('🎵 Meditation session playback initiated');
  }

  private async startFallbackAudio(): Promise<void> {
    try {
      // Choose fallback audio based on session type
      if (this.currentSession?.includes('breath')) {
        await fallbackAudioGenerator.createBinauralBeats(440, 444);
      } else if (this.currentSession?.includes('nature') || this.currentSession?.includes('stress')) {
        await fallbackAudioGenerator.createNatureSounds();
      } else {
        await fallbackAudioGenerator.createMeditationBells();
      }
      
      fallbackAudioGenerator.setVolume(this.masterVolume);
      this.usingFallbackAudio = true;
      console.log('🎼 Started fallback audio generation');
    } catch (error) {
      console.warn('Failed to start fallback audio:', error);
    }
  }

  pauseSession(): void {
    this.audioElements.forEach(audio => audio.pause());
    if (this.videoElement) {
      this.videoElement.pause();
    }
    if (this.usingFallbackAudio) {
      fallbackAudioGenerator.pause();
    }
  }

  stopSession(): void {
    this.audioElements.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    
    if (this.videoElement) {
      this.videoElement.pause();
      this.videoElement.currentTime = 0;
    }

    if (this.usingFallbackAudio) {
      fallbackAudioGenerator.stop();
      this.usingFallbackAudio = false;
    }
  }

  setVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.audioElements.forEach(audio => {
      const trackId = Array.from(this.audioElements.entries())
        .find(([_, element]) => element === audio)?.[0];
      if (trackId) {
        const originalVolume = this.getOriginalTrackVolume(trackId);
        audio.volume = originalVolume * this.masterVolume;
      }
    });

    // Also update fallback audio volume
    if (this.usingFallbackAudio) {
      fallbackAudioGenerator.setVolume(this.masterVolume);
    }
  }

  private getFallbackAudioUrl(trackId: string): string | null {
    // Return backup audio sources for common track types
    if (trackId.includes('bell') || trackId.includes('chime')) {
      return BACKUP_AUDIO_SOURCES.bell;
    }
    if (trackId.includes('nature') || trackId.includes('forest') || trackId.includes('ocean')) {
      return BACKUP_AUDIO_SOURCES.nature;
    }
    return BACKUP_AUDIO_SOURCES.music;
  }

  private getFallbackVideoUrl(videoId: string): string | null {
    // Return backup video sources for common video types
    if (videoId.includes('nature') || videoId.includes('forest')) {
      return BACKUP_VIDEO_SOURCES.nature;
    }
    if (videoId.includes('abstract') || videoId.includes('waves')) {
      return BACKUP_VIDEO_SOURCES.abstract;
    }
    return BACKUP_VIDEO_SOURCES.peaceful;
  }

  private getOriginalTrackVolume(trackId: string): number {
    // Return original track volume based on track ID
    const volumeMap: Record<string, number> = {
      'piano': 0.6,
      'nature': 0.8,
      'birds': 0.4,
      'guitar': 0.5,
      'breathing': 0.7,
      'chimes': 0.3,
      'ambient': 0.6,
      'violin': 0.7,
      'rain': 0.8,
      'harp': 0.5,
      'forest': 0.9,
      'creek': 0.6,
      'classical': 0.6,
      'wind': 0.7,
      'crickets': 0.4,
      'ocean': 0.8,
      'seagulls': 0.3,
      'bubbles': 0.4,
      'mountain-wind': 0.8,
      'eagles': 0.2,
      'tibetan-bowls': 0.6,
      'acoustic': 0.7,
      'vocals': 0.5,
      'bells': 0.4
    };
    return volumeMap[trackId] || 0.7;
  }

  getVideoElement(): HTMLVideoElement | null {
    return this.videoElement;
  }

  hasAudioTracks(): boolean {
    return this.audioElements.size > 0 || this.usingFallbackAudio;
  }

  getLoadedTrackCount(): number {
    return this.audioElements.size;
  }

  cleanup(): void {
    this.stopSession();
    this.audioElements.clear();
    this.videoElement = null;
    this.currentSession = null;
  }

  private getMediaConfig(sessionId: string): MeditationMedia | null {
    // Get configuration from online sources
    const onlineSource = ONLINE_MEDITATION_SOURCES[sessionId];
    if (!onlineSource) {
      console.warn(`No online media source found for session: ${sessionId}`);
      return null;
    }

    // Convert online source format to our internal format
    const mediaConfig: MeditationMedia = {
      sessionId: sessionId,
      description: `Online streaming: ${onlineSource.name}`,
      audioTracks: onlineSource.audioSources.map(source => ({
        id: source.id,
        name: source.name,
        url: source.url,
        volume: source.volume,
        loop: source.loop
      })),
      videoBackground: onlineSource.videoSource ? {
        id: onlineSource.videoSource.id,
        name: onlineSource.videoSource.name,
        url: onlineSource.videoSource.url,
        loop: onlineSource.videoSource.loop
      } : undefined
    };

    return mediaConfig;
  }
}

export const meditationAudioService = new MeditationAudioService();
