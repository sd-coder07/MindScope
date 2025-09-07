// Fallback Audio Generation using Web Audio API
// Creates basic meditation sounds when streaming sources fail

export class FallbackAudioGenerator {
  private audioContext: AudioContext | null = null;
  private oscillators: OscillatorNode[] = [];
  private gainNodes: GainNode[] = [];
  private isPlaying: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeAudioContext();
    }
  }

  private initializeAudioContext() {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContext();
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  async createBinauralBeats(frequency1: number = 440, frequency2: number = 444): Promise<void> {
    if (!this.audioContext) return;

    await this.audioContext.resume();

    // Create two oscillators for binaural beats
    const osc1 = this.audioContext.createOscillator();
    const osc2 = this.audioContext.createOscillator();
    
    // Create gain nodes for volume control
    const gain1 = this.audioContext.createGain();
    const gain2 = this.audioContext.createGain();
    const masterGain = this.audioContext.createGain();

    // Set frequencies
    osc1.frequency.setValueAtTime(frequency1, this.audioContext.currentTime);
    osc2.frequency.setValueAtTime(frequency2, this.audioContext.currentTime);

    // Set waveforms
    osc1.type = 'sine';
    osc2.type = 'sine';

    // Set initial volumes (very quiet)
    gain1.gain.setValueAtTime(0.05, this.audioContext.currentTime);
    gain2.gain.setValueAtTime(0.05, this.audioContext.currentTime);
    masterGain.gain.setValueAtTime(0.3, this.audioContext.currentTime);

    // Connect the audio graph
    osc1.connect(gain1);
    osc2.connect(gain2);
    gain1.connect(masterGain);
    gain2.connect(masterGain);
    masterGain.connect(this.audioContext.destination);

    // Store references
    this.oscillators.push(osc1, osc2);
    this.gainNodes.push(gain1, gain2, masterGain);

    // Start oscillators
    osc1.start();
    osc2.start();

    this.isPlaying = true;
  }

  async createNatureSounds(): Promise<void> {
    if (!this.audioContext) return;

    await this.audioContext.resume();

    // Create white noise for rain/wind effect
    const bufferSize = this.audioContext.sampleRate * 2; // 2 seconds of audio
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = buffer.getChannelData(0);

    // Generate white noise
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    // Create buffer source
    const whiteNoise = this.audioContext.createBufferSource();
    whiteNoise.buffer = buffer;
    whiteNoise.loop = true;

    // Create filter to shape the noise
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.audioContext.currentTime);

    // Create gain for volume control
    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(0.1, this.audioContext.currentTime);

    // Connect nodes
    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioContext.destination);

    // Store references
    this.gainNodes.push(gain);

    // Start the noise
    whiteNoise.start();

    this.isPlaying = true;
  }

  async createMeditationBells(): Promise<void> {
    if (!this.audioContext) return;

    await this.audioContext.resume();

    const playBell = () => {
      // Create oscillator for bell sound
      const osc = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();

      // Bell-like frequencies (multiple harmonics)
      osc.frequency.setValueAtTime(523.25, this.audioContext!.currentTime); // C5
      osc.type = 'sine';

      // Bell envelope (quick attack, slow decay)
      gain.gain.setValueAtTime(0, this.audioContext!.currentTime);
      gain.gain.linearRampToValueAtTime(0.3, this.audioContext!.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext!.currentTime + 3);

      // Connect and play
      osc.connect(gain);
      gain.connect(this.audioContext!.destination);

      osc.start();
      osc.stop(this.audioContext!.currentTime + 3);

      // Schedule next bell (every 30 seconds)
      if (this.isPlaying) {
        setTimeout(playBell, 30000);
      }
    };

    // Start with first bell
    playBell();
    this.isPlaying = true;
  }

  setVolume(volume: number): void {
    const normalizedVolume = Math.max(0, Math.min(1, volume));
    this.gainNodes.forEach(gain => {
      gain.gain.setValueAtTime(normalizedVolume * 0.3, gain.context.currentTime);
    });
  }

  stop(): void {
    this.isPlaying = false;
    
    // Stop all oscillators
    this.oscillators.forEach(osc => {
      try {
        osc.stop();
      } catch (error) {
        // Oscillator may already be stopped
      }
    });

    // Clear arrays
    this.oscillators = [];
    this.gainNodes = [];
  }

  pause(): void {
    this.gainNodes.forEach(gain => {
      gain.gain.setValueAtTime(0, gain.context.currentTime);
    });
  }

  resume(): void {
    this.gainNodes.forEach(gain => {
      gain.gain.setValueAtTime(0.3, gain.context.currentTime);
    });
  }

  isGenerating(): boolean {
    return this.isPlaying;
  }
}

export const fallbackAudioGenerator = new FallbackAudioGenerator();
