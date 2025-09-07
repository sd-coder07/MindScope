// TODO 4: Enhanced Voice & Multilingual Support
// Advanced voice emotion analysis and multilingual therapeutic responses

import { EventEmitter } from 'events';

// Voice emotion analysis types
export interface VoiceEmotionData {
  timestamp: number;
  emotion: EmotionType;
  confidence: number;
  pitch: number;
  volume: number;
  speechRate: number;
  voiceStress: number;
  breathingPattern: 'normal' | 'rapid' | 'shallow' | 'irregular';
  pauseFrequency: number;
  tonalVariability: number;
}

export type EmotionType = 
  | 'anxiety' | 'depression' | 'anger' | 'grief' | 'stress' | 'joy' 
  | 'calm' | 'excitement' | 'fear' | 'frustration' | 'sadness' | 'neutral';

export type SupportedLanguage = 
  | 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'zh' | 'ja' | 'ko' | 'ar' | 'hi' | 'ru';

export interface LanguageConfig {
  code: SupportedLanguage;
  name: string;
  culturalContext: string[];
  therapeuticApproaches: string[];
  crisisKeywords: string[];
  supportiveResponses: string[];
  voiceSettings: {
    rate: number;
    pitch: number;
    volume: number;
  };
}

export interface MultilingualResponse {
  originalLanguage: SupportedLanguage;
  response: string;
  culturallyAdapted: boolean;
  therapeuticTechnique: string;
  confidenceScore: number;
  alternativeLanguages?: { [key in SupportedLanguage]?: string };
}

class EnhancedVoiceEmotionAnalyzer extends EventEmitter {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private isAnalyzing = false;
  private emotionHistory: VoiceEmotionData[] = [];
  private recognitionLanguage: SupportedLanguage = 'en';

  // Advanced audio analysis parameters
  private readonly SAMPLE_RATE = 44100;
  private readonly FFT_SIZE = 2048;
  private readonly ANALYSIS_INTERVAL = 100; // ms
  private readonly EMOTION_CONFIDENCE_THRESHOLD = 0.7;

  constructor() {
    super();
    this.initializeAudioContext();
  }

  private async initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = this.FFT_SIZE;
      console.log('Enhanced Voice Emotion Analyzer initialized');
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
    }
  }

  async startVoiceEmotionAnalysis(): Promise<boolean> {
    try {
      if (!this.audioContext || !this.analyser) {
        await this.initializeAudioContext();
      }

      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: this.SAMPLE_RATE,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false
        }
      });

      const source = this.audioContext!.createMediaStreamSource(this.mediaStream);
      source.connect(this.analyser!);

      this.isAnalyzing = true;
      this.startEmotionAnalysisLoop();
      
      this.emit('analysisStarted');
      return true;
    } catch (error) {
      console.error('Failed to start voice emotion analysis:', error);
      this.emit('analysisError', error);
      return false;
    }
  }

  private startEmotionAnalysisLoop() {
    if (!this.isAnalyzing || !this.analyser) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const timeDataArray = new Uint8Array(bufferLength);

    const analyze = () => {
      if (!this.isAnalyzing) return;

      this.analyser!.getByteFrequencyData(dataArray);
      this.analyser!.getByteTimeDomainData(timeDataArray);

      const emotionData = this.analyzeAudioFeatures(dataArray, timeDataArray);
      
      if (emotionData.confidence > this.EMOTION_CONFIDENCE_THRESHOLD) {
        this.emotionHistory.push(emotionData);
        this.emit('emotionDetected', emotionData);
        
        // Keep only last 50 samples for memory efficiency
        if (this.emotionHistory.length > 50) {
          this.emotionHistory = this.emotionHistory.slice(-50);
        }
      }

      setTimeout(analyze, this.ANALYSIS_INTERVAL);
    };

    analyze();
  }

  private analyzeAudioFeatures(freqData: Uint8Array, timeData: Uint8Array): VoiceEmotionData {
    // Calculate acoustic features
    const pitch = this.calculatePitch(freqData);
    const volume = this.calculateVolume(timeData);
    const speechRate = this.calculateSpeechRate(timeData);
    const voiceStress = this.calculateVoiceStress(freqData, timeData);
    const pauseFrequency = this.calculatePauseFrequency(timeData);
    const tonalVariability = this.calculateTonalVariability(freqData);
    const breathingPattern = this.analyzeBreathingPattern(timeData);

    // Emotion classification based on acoustic features
    const emotion = this.classifyEmotion({
      pitch,
      volume,
      speechRate,
      voiceStress,
      pauseFrequency,
      tonalVariability,
      breathingPattern
    });

    const confidence = this.calculateEmotionConfidence({
      pitch,
      volume,
      speechRate,
      voiceStress,
      tonalVariability
    });

    return {
      timestamp: Date.now(),
      emotion,
      confidence,
      pitch,
      volume,
      speechRate,
      voiceStress,
      breathingPattern,
      pauseFrequency,
      tonalVariability
    };
  }

  private calculatePitch(freqData: Uint8Array): number {
    // Find dominant frequency (simplified pitch detection)
    let maxIndex = 0;
    let maxValue = 0;
    
    for (let i = 1; i < freqData.length / 4; i++) {
      if (freqData[i] > maxValue) {
        maxValue = freqData[i];
        maxIndex = i;
      }
    }
    
    // Convert bin index to frequency
    const frequency = (maxIndex * this.audioContext!.sampleRate) / (2 * freqData.length);
    return Math.max(80, Math.min(400, frequency)); // Human speech range
  }

  private calculateVolume(timeData: Uint8Array): number {
    let sum = 0;
    for (let i = 0; i < timeData.length; i++) {
      const sample = (timeData[i] - 128) / 128;
      sum += sample * sample;
    }
    return Math.sqrt(sum / timeData.length);
  }

  private calculateSpeechRate(timeData: Uint8Array): number {
    // Simplified speech rate calculation based on zero crossings
    let crossings = 0;
    for (let i = 1; i < timeData.length; i++) {
      if ((timeData[i] - 128) * (timeData[i - 1] - 128) < 0) {
        crossings++;
      }
    }
    return crossings / timeData.length;
  }

  private calculateVoiceStress(freqData: Uint8Array, timeData: Uint8Array): number {
    // Voice stress indicator based on frequency distribution and amplitude variation
    const highFreqEnergy = freqData.slice(freqData.length / 2).reduce((a, b) => a + b, 0);
    const totalEnergy = freqData.reduce((a, b) => a + b, 0);
    const highFreqRatio = totalEnergy > 0 ? highFreqEnergy / totalEnergy : 0;
    
    const amplitudeVariation = this.calculateAmplitudeVariation(timeData);
    
    return Math.min(1, (highFreqRatio * 2 + amplitudeVariation) / 2);
  }

  private calculateAmplitudeVariation(timeData: Uint8Array): number {
    const mean = timeData.reduce((a, b) => a + b, 0) / timeData.length;
    const variance = timeData.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / timeData.length;
    return Math.sqrt(variance) / 128; // Normalize
  }

  private calculatePauseFrequency(timeData: Uint8Array): number {
    const silenceThreshold = 5; // Threshold for detecting silence
    let pauseCount = 0;
    let inPause = false;

    for (let i = 0; i < timeData.length; i++) {
      const amplitude = Math.abs(timeData[i] - 128);
      
      if (amplitude < silenceThreshold) {
        if (!inPause) {
          pauseCount++;
          inPause = true;
        }
      } else {
        inPause = false;
      }
    }

    return pauseCount / (timeData.length / 1000); // Pauses per second equivalent
  }

  private calculateTonalVariability(freqData: Uint8Array): number {
    if (freqData.length < 2) return 0;
    
    let variation = 0;
    for (let i = 1; i < freqData.length; i++) {
      variation += Math.abs(freqData[i] - freqData[i - 1]);
    }
    
    return variation / (freqData.length - 1) / 255; // Normalize
  }

  private analyzeBreathingPattern(timeData: Uint8Array): 'normal' | 'rapid' | 'shallow' | 'irregular' {
    const volume = this.calculateVolume(timeData);
    const pauseFreq = this.calculatePauseFrequency(timeData);
    const amplitudeVar = this.calculateAmplitudeVariation(timeData);

    if (pauseFreq > 0.8) return 'rapid';
    if (volume < 0.1) return 'shallow';
    if (amplitudeVar > 0.7) return 'irregular';
    return 'normal';
  }

  private classifyEmotion(features: {
    pitch: number;
    volume: number;
    speechRate: number;
    voiceStress: number;
    pauseFrequency: number;
    tonalVariability: number;
    breathingPattern: string;
  }): EmotionType {
    const { pitch, volume, speechRate, voiceStress, pauseFrequency, tonalVariability, breathingPattern } = features;

    // Emotion classification rules based on acoustic features
    if (voiceStress > 0.7 && pitch > 200 && speechRate > 0.6) {
      return pauseFrequency > 0.5 ? 'anxiety' : 'anger';
    }
    
    if (volume < 0.2 && pitch < 120 && speechRate < 0.3) {
      return pauseFrequency > 0.4 ? 'depression' : 'sadness';
    }
    
    if (voiceStress > 0.6 && tonalVariability > 0.6) {
      return breathingPattern === 'rapid' ? 'stress' : 'frustration';
    }
    
    if (pitch > 250 && volume > 0.6 && speechRate > 0.5) {
      return 'excitement';
    }
    
    if (voiceStress > 0.5 && breathingPattern === 'irregular') {
      return 'fear';
    }
    
    if (volume > 0.5 && tonalVariability > 0.4 && voiceStress < 0.3) {
      return 'joy';
    }
    
    if (voiceStress < 0.3 && pauseFrequency < 0.3 && breathingPattern === 'normal') {
      return 'calm';
    }

    return 'neutral';
  }

  private calculateEmotionConfidence(features: {
    pitch: number;
    volume: number;
    speechRate: number;
    voiceStress: number;
    tonalVariability: number;
  }): number {
    // Confidence based on feature consistency and strength
    const featureStrengths = [
      Math.abs(features.pitch - 150) / 150, // Deviation from neutral pitch
      features.volume,
      features.speechRate,
      features.voiceStress,
      features.tonalVariability
    ];

    const avgStrength = featureStrengths.reduce((a, b) => a + b, 0) / featureStrengths.length;
    return Math.min(1, Math.max(0.3, avgStrength));
  }

  stopVoiceEmotionAnalysis() {
    this.isAnalyzing = false;
    
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    
    this.emit('analysisStopped');
  }

  getEmotionHistory(): VoiceEmotionData[] {
    return [...this.emotionHistory];
  }

  getCurrentEmotionalState(): EmotionType | null {
    if (this.emotionHistory.length === 0) return null;
    
    // Return most recent high-confidence emotion
    const recentEmotions = this.emotionHistory.slice(-5);
    const highConfidenceEmotions = recentEmotions.filter(e => e.confidence > this.EMOTION_CONFIDENCE_THRESHOLD);
    
    if (highConfidenceEmotions.length === 0) return null;
    
    return highConfidenceEmotions[highConfidenceEmotions.length - 1].emotion;
  }

  setRecognitionLanguage(language: SupportedLanguage) {
    this.recognitionLanguage = language;
    this.emit('languageChanged', language);
  }

  getRecognitionLanguage(): SupportedLanguage {
    return this.recognitionLanguage;
  }
}

export default EnhancedVoiceEmotionAnalyzer;
