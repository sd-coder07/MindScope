// Advanced Voice Analysis System for MindScope
// Provides emotion detection, voice biomarkers, and therapeutic voice synthesis

// Simplified type definitions to avoid conflicts
interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
}

export interface VoiceEmotion {
  primary: string;
  secondary: string[];
  confidence: number;
  intensity: number;
  valence: number; // -1 (negative) to 1 (positive)
  arousal: number; // 0 (calm) to 1 (excited)
  timestamp: number;
}

export interface VoiceBiomarkers {
  stress: number; // 0-1 scale
  fatigue: number;
  anxiety: number;
  depression: number;
  coherence: number; // Speech clarity/organization
  pace: number; // Words per minute
  volume: number; // Relative volume level
  breathingPattern: 'shallow' | 'normal' | 'deep' | 'irregular';
}

export interface VoiceAnalysisResult {
  emotions: VoiceEmotion[];
  biomarkers: VoiceBiomarkers;
  transcription: string;
  language: string;
  confidence: number;
  riskIndicators: string[];
  recommendations: string[];
}

export interface VoiceSynthesisSettings {
  language: string;
  voice: string;
  pitch: number;
  rate: number;
  volume: number;
  emotionalTone: 'calm' | 'warm' | 'encouraging' | 'professional';
  culturalAdaptation: boolean;
}

class AdvancedVoiceAnalysis {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recognition: SpeechRecognitionInstance | null = null;
  private synthesis: SpeechSynthesis | null = null;
  private isRecording = false;
  private audioBuffer: Float32Array[] = [];
  
  // Emotion detection patterns for different languages
  private emotionPatterns = {
    en: {
      stress: ['um', 'uh', 'like', 'you know', 'I mean'],
      anxiety: ['worried', 'scared', 'nervous', 'anxious', 'panic'],
      sadness: ['sad', 'down', 'empty', 'hopeless', 'worthless'],
      anger: ['angry', 'mad', 'furious', 'rage', 'irritated'],
      joy: ['happy', 'excited', 'great', 'wonderful', 'amazing']
    },
    es: {
      stress: ['eh', 'mm', 'o sea', 'sabes', 'digo'],
      anxiety: ['preocupado', 'asustado', 'nervioso', 'ansioso', 'pánico'],
      sadness: ['triste', 'mal', 'vacío', 'sin esperanza', 'inútil'],
      anger: ['enojado', 'furioso', 'rabia', 'irritado', 'molesto'],
      joy: ['feliz', 'emocionado', 'genial', 'maravilloso', 'increíble']
    },
    fr: {
      stress: ['euh', 'bah', 'tu vois', 'je veux dire', 'enfin'],
      anxiety: ['inquiet', 'effrayé', 'nerveux', 'anxieux', 'panique'],
      sadness: ['triste', 'mal', 'vide', 'désespéré', 'inutile'],
      anger: ['en colère', 'furieux', 'rage', 'irrité', 'énervé'],
      joy: ['heureux', 'excité', 'génial', 'merveilleux', 'incroyable']
    },
    de: {
      stress: ['äh', 'ähem', 'weißt du', 'ich meine', 'also'],
      anxiety: ['besorgt', 'ängstlich', 'nervös', 'panisch', 'unruhig'],
      sadness: ['traurig', 'schlecht', 'leer', 'hoffnungslos', 'wertlos'],
      anger: ['wütend', 'zornig', 'verärgert', 'sauer', 'gereizt'],
      joy: ['glücklich', 'aufgeregt', 'toll', 'wunderbar', 'erstaunlich']
    },
    'zh-CN': {
      stress: ['呃', '嗯', '就是', '你知道', '我的意思是'],
      anxiety: ['担心', '害怕', '紧张', '焦虑', '恐慌'],
      sadness: ['难过', '沮丧', '空虚', '绝望', '无价值'],
      anger: ['生气', '愤怒', '暴怒', '恼火', '烦躁'],
      joy: ['开心', '兴奋', '很棒', '精彩', '太好了']
    },
    ja: {
      stress: ['えー', 'うーん', 'その', 'なんか', 'つまり'],
      anxiety: ['心配', '怖い', '緊張', '不安', 'パニック'],
      sadness: ['悲しい', '落ち込む', '空虚', '絶望', '価値がない'],
      anger: ['怒り', '腹立つ', 'イライラ', 'ムカつく', '激怒'],
      joy: ['嬉しい', '興奮', '素晴らしい', '最高', 'すごい']
    },
    ar: {
      stress: ['إيه', 'أمم', 'يعني', 'تعرف', 'أقصد'],
      anxiety: ['قلق', 'خائف', 'متوتر', 'قلق', 'ذعر'],
      sadness: ['حزين', 'مكتئب', 'فارغ', 'يائس', 'بلا قيمة'],
      anger: ['غاضب', 'غضبان', 'محتج', 'منزعج', 'مستاء'],
      joy: ['سعيد', 'متحمس', 'رائع', 'مذهل', 'ممتاز']
    }
  };

  // Crisis detection in voice patterns
  private crisisIndicators = {
    suicidalIdeation: {
      vocal: ['monotone', 'low_energy', 'slow_speech', 'long_pauses'],
      linguistic: ['death', 'end', 'give up', 'no point', 'burden']
    },
    acutePanic: {
      vocal: ['rapid_speech', 'high_pitch', 'shallow_breathing', 'trembling'],
      linguistic: ['cant_breathe', 'heart_racing', 'dying', 'losing_control']
    },
    severeDepression: {
      vocal: ['low_volume', 'slow_pace', 'flat_tone', 'minimal_variation'],
      linguistic: ['worthless', 'hopeless', 'empty', 'nothing_matters']
    }
  };

  constructor() {
    this.initializeAudioContext();
    this.initializeSpeechRecognition();
    this.initializeSpeechSynthesis();
  }

  private initializeAudioContext(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
    } catch (error) {
      console.error('Error initializing audio context:', error);
    }
  }

  private initializeSpeechRecognition(): void {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      if (this.recognition) {
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
      }
    }
  }

  private initializeSpeechSynthesis(): void {
    if ('speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
    }
  }

  async startVoiceAnalysis(language: string = 'en'): Promise<void> {
    if (!this.audioContext || !this.analyser || !this.recognition) {
      throw new Error('Voice analysis not supported in this browser');
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        } 
      });

      // Connect audio stream to analyser
      const source = this.audioContext.createMediaStreamSource(stream);
      source.connect(this.analyser);

      // Setup media recorder for detailed analysis
      this.mediaRecorder = new MediaRecorder(stream);
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.processAudioChunk(event.data);
        }
      };

      // Configure speech recognition for the language
      this.recognition.lang = this.getLanguageCode(language);
      this.recognition.start();

      this.isRecording = true;
      this.mediaRecorder.start(100); // Collect data every 100ms

    } catch (error) {
      console.error('Error starting voice analysis:', error);
      throw error;
    }
  }

  stopVoiceAnalysis(): void {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
    }
    
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  private async processAudioChunk(audioData: Blob): Promise<void> {
    try {
      const arrayBuffer = await audioData.arrayBuffer();
      const audioBuffer = await this.audioContext!.decodeAudioData(arrayBuffer);
      const audioArray = audioBuffer.getChannelData(0);
      
      this.audioBuffer.push(audioArray);
      
      // Keep only last 10 seconds of audio for analysis
      if (this.audioBuffer.length > 1000) {
        this.audioBuffer.shift();
      }
      
      // Perform real-time analysis
      this.analyzeVoiceBiomarkers(audioArray);
      
    } catch (error) {
      console.error('Error processing audio chunk:', error);
    }
  }

  private analyzeVoiceBiomarkers(audioData: Float32Array): VoiceBiomarkers {
    // Analyze fundamental frequency (pitch)
    const pitch = this.extractPitch(audioData);
    
    // Analyze amplitude variations
    const amplitude = this.extractAmplitude(audioData);
    
    // Analyze spectral features
    const spectralFeatures = this.extractSpectralFeatures(audioData);
    
    // Calculate stress indicators
    const stress = this.calculateStressLevel(pitch, amplitude, spectralFeatures);
    
    // Calculate other biomarkers
    const fatigue = this.calculateFatigueLevel(pitch, spectralFeatures);
    const anxiety = this.calculateAnxietyLevel(pitch, amplitude);
    const depression = this.calculateDepressionLevel(pitch, amplitude, spectralFeatures);
    
    return {
      stress: Math.min(1, Math.max(0, stress)),
      fatigue: Math.min(1, Math.max(0, fatigue)),
      anxiety: Math.min(1, Math.max(0, anxiety)),
      depression: Math.min(1, Math.max(0, depression)),
      coherence: this.calculateCoherence(audioData),
      pace: this.calculateSpeechPace(audioData),
      volume: amplitude,
      breathingPattern: this.detectBreathingPattern(audioData)
    };
  }

  private extractPitch(audioData: Float32Array): number {
    // Simple autocorrelation-based pitch detection
    const bufferSize = audioData.length;
    const correlations = new Array(bufferSize / 2);
    
    for (let lag = 0; lag < bufferSize / 2; lag++) {
      let correlation = 0;
      for (let i = 0; i < bufferSize / 2; i++) {
        correlation += audioData[i] * audioData[i + lag];
      }
      correlations[lag] = correlation;
    }
    
    // Find the lag with maximum correlation (excluding lag 0)
    let maxCorrelation = 0;
    let bestLag = 0;
    
    for (let lag = 20; lag < correlations.length; lag++) {
      if (correlations[lag] > maxCorrelation) {
        maxCorrelation = correlations[lag];
        bestLag = lag;
      }
    }
    
    return bestLag > 0 ? 44100 / bestLag : 0; // Convert to frequency
  }

  private extractAmplitude(audioData: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < audioData.length; i++) {
      sum += Math.abs(audioData[i]);
    }
    return sum / audioData.length;
  }

  private extractSpectralFeatures(audioData: Float32Array): any {
    // Perform FFT to get frequency domain representation
    const fftSize = 512;
    const fft = new Array(fftSize);
    
    for (let i = 0; i < fftSize && i < audioData.length; i++) {
      fft[i] = audioData[i];
    }
    
    // Calculate spectral centroid (brightness)
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < fftSize / 2; i++) {
      const magnitude = Math.abs(fft[i]);
      numerator += i * magnitude;
      denominator += magnitude;
    }
    
    const spectralCentroid = denominator > 0 ? numerator / denominator : 0;
    
    return {
      centroid: spectralCentroid,
      rolloff: this.calculateSpectralRolloff(fft),
      flux: this.calculateSpectralFlux(fft)
    };
  }

  private calculateStressLevel(pitch: number, amplitude: number, spectral: any): number {
    // Stress indicators: higher pitch, irregular amplitude, spectral changes
    let stressScore = 0;
    
    // Pitch-based stress (higher pitch under stress)
    if (pitch > 200) stressScore += 0.3;
    if (pitch > 300) stressScore += 0.2;
    
    // Amplitude variability (stress causes voice tremor)
    const amplitudeVariability = this.calculateVariability(this.audioBuffer.map(arr => this.extractAmplitude(arr)));
    if (amplitudeVariability > 0.1) stressScore += 0.3;
    
    // Spectral features (stress affects voice quality)
    if (spectral.centroid > 1000) stressScore += 0.2;
    
    return stressScore;
  }

  private calculateFatigueLevel(pitch: number, spectral: any): number {
    // Fatigue indicators: lower pitch, reduced spectral energy
    let fatigueScore = 0;
    
    if (pitch < 150) fatigueScore += 0.4;
    if (spectral.centroid < 500) fatigueScore += 0.3;
    if (spectral.rolloff < 2000) fatigueScore += 0.3;
    
    return fatigueScore;
  }

  private calculateAnxietyLevel(pitch: number, amplitude: number): number {
    // Anxiety indicators: higher pitch, rapid speech, voice tremor
    let anxietyScore = 0;
    
    const pitchVariability = this.calculateVariability(this.audioBuffer.map(arr => this.extractPitch(arr)));
    if (pitchVariability > 50) anxietyScore += 0.4;
    
    const amplitudeVariability = this.calculateVariability(this.audioBuffer.map(arr => this.extractAmplitude(arr)));
    if (amplitudeVariability > 0.15) anxietyScore += 0.3;
    
    if (pitch > 250) anxietyScore += 0.3;
    
    return anxietyScore;
  }

  private calculateDepressionLevel(pitch: number, amplitude: number, spectral: any): number {
    // Depression indicators: monotone, low energy, slow speech
    let depressionScore = 0;
    
    // Monotone voice (low pitch variability)
    const pitchVariability = this.calculateVariability(this.audioBuffer.map(arr => this.extractPitch(arr)));
    if (pitchVariability < 20) depressionScore += 0.4;
    
    // Low energy (low amplitude)
    if (amplitude < 0.05) depressionScore += 0.3;
    
    // Reduced spectral energy
    if (spectral.centroid < 600) depressionScore += 0.3;
    
    return depressionScore;
  }

  private calculateCoherence(audioData: Float32Array): number {
    // Measure speech coherence based on pause patterns and amplitude consistency
    const silenceThreshold = 0.01;
    let speechSegments = 0;
    let pauseSegments = 0;
    let inSpeech = false;
    
    for (let i = 0; i < audioData.length; i++) {
      const isSpeech = Math.abs(audioData[i]) > silenceThreshold;
      
      if (isSpeech && !inSpeech) {
        speechSegments++;
        inSpeech = true;
      } else if (!isSpeech && inSpeech) {
        pauseSegments++;
        inSpeech = false;
      }
    }
    
    // Good coherence has balanced speech and pause segments
    const segmentRatio = speechSegments > 0 ? pauseSegments / speechSegments : 0;
    return Math.min(1, Math.max(0, 1 - Math.abs(segmentRatio - 0.3) / 0.3));
  }

  private calculateSpeechPace(audioData: Float32Array): number {
    // Estimate words per minute based on speech segments
    const silenceThreshold = 0.01;
    let speechTime = 0;
    
    for (let i = 0; i < audioData.length; i++) {
      if (Math.abs(audioData[i]) > silenceThreshold) {
        speechTime++;
      }
    }
    
    const speechDuration = speechTime / 44100; // Convert to seconds
    const estimatedSyllables = speechTime / 1000; // Rough estimate
    const wordsPerMinute = (estimatedSyllables / 2.5) * (60 / speechDuration);
    
    return Math.min(300, Math.max(60, wordsPerMinute)); // Reasonable bounds
  }

  private detectBreathingPattern(audioData: Float32Array): 'shallow' | 'normal' | 'deep' | 'irregular' {
    // Analyze low-frequency components for breathing patterns
    const breathingFrequency = this.extractBreathingFrequency(audioData);
    const breathingRegularity = this.calculateBreathingRegularity(audioData);
    
    if (breathingRegularity < 0.3) return 'irregular';
    if (breathingFrequency < 0.2) return 'shallow';
    if (breathingFrequency > 0.8) return 'deep';
    return 'normal';
  }

  private calculateVariability(values: number[]): number {
    if (values.length < 2) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    
    return Math.sqrt(variance);
  }

  private calculateSpectralRolloff(fft: number[]): number {
    const totalEnergy = fft.reduce((sum, val) => sum + Math.abs(val), 0);
    const threshold = 0.85 * totalEnergy;
    
    let cumulativeEnergy = 0;
    for (let i = 0; i < fft.length; i++) {
      cumulativeEnergy += Math.abs(fft[i]);
      if (cumulativeEnergy >= threshold) {
        return i;
      }
    }
    
    return fft.length - 1;
  }

  private calculateSpectralFlux(fft: number[]): number {
    // Simplified spectral flux calculation
    let flux = 0;
    for (let i = 1; i < fft.length; i++) {
      flux += Math.abs(Math.abs(fft[i]) - Math.abs(fft[i-1]));
    }
    return flux / fft.length;
  }

  private extractBreathingFrequency(audioData: Float32Array): number {
    // Extract low-frequency components associated with breathing
    const lowFreqEnergy = audioData.slice(0, 100).reduce((sum, val) => sum + Math.abs(val), 0);
    const totalEnergy = audioData.reduce((sum, val) => sum + Math.abs(val), 0);
    
    return totalEnergy > 0 ? lowFreqEnergy / totalEnergy : 0;
  }

  private calculateBreathingRegularity(audioData: Float32Array): number {
    // Analyze regularity of breathing patterns
    const segmentSize = 4410; // 0.1 second segments
    const segments = [];
    
    for (let i = 0; i < audioData.length - segmentSize; i += segmentSize) {
      const segment = audioData.slice(i, i + segmentSize);
      const energy = segment.reduce((sum, val) => sum + Math.abs(val), 0);
      segments.push(energy);
    }
    
    return segments.length > 1 ? 1 - this.calculateVariability(segments) : 0;
  }

  analyzeEmotionFromText(text: string, language: string): VoiceEmotion[] {
    const patterns = this.emotionPatterns[language as keyof typeof this.emotionPatterns] || this.emotionPatterns.en;
    const emotions: VoiceEmotion[] = [];
    const words = text.toLowerCase().split(/\s+/);
    
    Object.entries(patterns).forEach(([emotion, keywords]) => {
      const matches = words.filter(word => keywords.some(keyword => word.includes(keyword)));
      
      if (matches.length > 0) {
        const confidence = Math.min(1, matches.length / words.length * 10);
        
        emotions.push({
          primary: emotion,
          secondary: [],
          confidence,
          intensity: confidence,
          valence: this.getEmotionValence(emotion),
          arousal: this.getEmotionArousal(emotion),
          timestamp: Date.now()
        });
      }
    });
    
    return emotions.sort((a, b) => b.confidence - a.confidence);
  }

  detectCrisisIndicators(text: string, biomarkers: VoiceBiomarkers): string[] {
    const indicators: string[] = [];
    const words = text.toLowerCase().split(/\s+/);
    
    // Check linguistic crisis indicators
    Object.entries(this.crisisIndicators).forEach(([crisis, patterns]) => {
      const linguisticMatches = words.filter(word => 
        patterns.linguistic.some(indicator => word.includes(indicator))
      );
      
      if (linguisticMatches.length > 0) {
        indicators.push(`linguistic_${crisis}`);
      }
    });
    
    // Check vocal crisis indicators from biomarkers
    if (biomarkers.stress > 0.8 && biomarkers.anxiety > 0.7) {
      indicators.push('vocal_acute_panic');
    }
    
    if (biomarkers.depression > 0.8 && biomarkers.coherence < 0.3) {
      indicators.push('vocal_severe_depression');
    }
    
    if (biomarkers.fatigue > 0.9 && biomarkers.volume < 0.2) {
      indicators.push('vocal_suicidal_ideation');
    }
    
    return indicators;
  }

  private getEmotionValence(emotion: string): number {
    const valenceMap: Record<string, number> = {
      joy: 0.8,
      happiness: 0.7,
      excitement: 0.6,
      calm: 0.3,
      neutral: 0,
      anxiety: -0.4,
      sadness: -0.6,
      anger: -0.5,
      fear: -0.7,
      depression: -0.8
    };
    
    return valenceMap[emotion] || 0;
  }

  private getEmotionArousal(emotion: string): number {
    const arousalMap: Record<string, number> = {
      excitement: 0.9,
      anger: 0.8,
      anxiety: 0.7,
      joy: 0.6,
      fear: 0.6,
      sadness: 0.3,
      depression: 0.2,
      calm: 0.1,
      neutral: 0.4
    };
    
    return arousalMap[emotion] || 0.4;
  }

  private getLanguageCode(language: string): string {
    const languageCodes: Record<string, string> = {
      'en': 'en-US',
      'es': 'es-ES',
      'fr': 'fr-FR',
      'de': 'de-DE',
      'zh-CN': 'zh-CN',
      'ja': 'ja-JP',
      'ar': 'ar-SA'
    };
    
    return languageCodes[language] || 'en-US';
  }

  // Voice synthesis with emotional adaptation
  async synthesizeTherapeuticVoice(
    text: string, 
    settings: VoiceSynthesisSettings,
    emotionalContext?: VoiceEmotion
  ): Promise<void> {
    if (!this.synthesis) {
      throw new Error('Speech synthesis not supported');
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure voice based on language
    const voices = this.synthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.lang.startsWith(settings.language) && 
      voice.name.toLowerCase().includes('female') // Prefer female voices for therapy
    ) || voices.find(voice => voice.lang.startsWith(settings.language));
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    // Adapt speech parameters based on emotional tone
    utterance.pitch = this.calculateTherapeuticPitch(settings.emotionalTone, emotionalContext);
    utterance.rate = this.calculateTherapeuticRate(settings.emotionalTone, emotionalContext);
    utterance.volume = settings.volume;
    
    // Add cultural adaptation
    if (settings.culturalAdaptation) {
      utterance.rate *= this.getCulturalRateModifier(settings.language);
      utterance.pitch *= this.getCulturalPitchModifier(settings.language);
    }
    
    return new Promise((resolve, reject) => {
      utterance.onend = () => resolve();
      utterance.onerror = (error) => reject(error);
      this.synthesis!.speak(utterance);
    });
  }

  private calculateTherapeuticPitch(tone: string, emotion?: VoiceEmotion): number {
    const basePitch = 1.0;
    const toneModifiers = {
      calm: 0.9,
      warm: 1.0,
      encouraging: 1.1,
      professional: 0.95
    };
    
    let pitch = basePitch * (toneModifiers[tone as keyof typeof toneModifiers] || 1.0);
    
    // Adapt to user's emotional state
    if (emotion) {
      if (emotion.valence < -0.5) pitch *= 0.95; // Lower pitch for negative emotions
      if (emotion.arousal > 0.7) pitch *= 0.9; // Calming effect for high arousal
    }
    
    return Math.min(2, Math.max(0.5, pitch));
  }

  private calculateTherapeuticRate(tone: string, emotion?: VoiceEmotion): number {
    const baseRate = 0.9; // Slightly slower than normal for clarity
    const toneModifiers = {
      calm: 0.8,
      warm: 0.9,
      encouraging: 1.0,
      professional: 0.85
    };
    
    let rate = baseRate * (toneModifiers[tone as keyof typeof toneModifiers] || 0.9);
    
    // Adapt to user's emotional state
    if (emotion) {
      if (emotion.arousal > 0.7) rate *= 0.8; // Slower for high arousal
      if (emotion.valence < -0.6) rate *= 0.85; // Slower for very negative emotions
    }
    
    return Math.min(1.5, Math.max(0.5, rate));
  }

  private getCulturalRateModifier(language: string): number {
    // Cultural preferences for speech rate
    const rateModifiers: Record<string, number> = {
      'en': 1.0,
      'es': 1.1, // Slightly faster in Spanish-speaking cultures
      'fr': 0.95, // Slightly slower in French
      'de': 0.9, // More deliberate in German
      'zh-CN': 0.85, // More careful pronunciation in Chinese
      'ja': 0.9, // Respectful pace in Japanese
      'ar': 0.95 // Moderate pace in Arabic
    };
    
    return rateModifiers[language] || 1.0;
  }

  private getCulturalPitchModifier(language: string): number {
    // Cultural preferences for pitch
    const pitchModifiers: Record<string, number> = {
      'en': 1.0,
      'es': 1.05, // Slightly higher in Spanish
      'fr': 0.98, // Slightly lower in French
      'de': 0.95, // Lower, more authoritative in German
      'zh-CN': 1.02, // Tonal considerations
      'ja': 1.1, // Higher, more polite in Japanese
      'ar': 1.0 // Standard pitch
    };
    
    return pitchModifiers[language] || 1.0;
  }

  // Cleanup resources
  dispose(): void {
    this.stopVoiceAnalysis();
    
    if (this.audioContext) {
      this.audioContext.close();
    }
    
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }
}

export { AdvancedVoiceAnalysis };
