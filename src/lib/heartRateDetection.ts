'use client';

// Real Heart Rate Detection Library using Camera
export class HeartRateDetector {
  private videoElement: HTMLVideoElement | null = null;
  private canvasElement: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private stream: MediaStream | null = null;
  private isRunning = false;
  private samples: number[] = [];
  private sampleRate = 30; // FPS
  private windowSize = 256; // samples for analysis
  private onHeartRateCallback: ((heartRate: number, confidence: number) => void) | null = null;
  private animationFrame: number | null = null;

  constructor() {
    // Initialize components
  }

  async initialize(video: HTMLVideoElement, canvas: HTMLCanvasElement): Promise<boolean> {
    try {
      this.videoElement = video;
      this.canvasElement = canvas;
      this.ctx = canvas.getContext('2d');

      if (!this.ctx) {
        throw new Error('Could not get canvas context');
      }

      // Check if we're in the browser and navigator is available
      if (typeof window === 'undefined' || !navigator?.mediaDevices?.getUserMedia) {
        throw new Error('Camera access not available in this environment');
      }

      // Request camera access with specific constraints for heart rate detection
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
          frameRate: { ideal: 30 }
        }
      });

      this.videoElement.srcObject = this.stream;
      return true;
    } catch (error) {
      console.error('Failed to initialize heart rate detector:', error);
      return false;
    }
  }

  setHeartRateCallback(callback: (heartRate: number, confidence: number) => void) {
    this.onHeartRateCallback = callback;
  }

  startDetection() {
    if (!this.videoElement || !this.canvasElement || !this.ctx || this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.samples = [];
    this.detectLoop();
  }

  stopDetection() {
    this.isRunning = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
  }

  private detectLoop() {
    if (!this.isRunning || !this.videoElement || !this.canvasElement || !this.ctx) {
      return;
    }

    try {
      // Extract red channel data from fingertip area
      const redValue = this.extractRedChannelValue();
      
      if (redValue > 0) {
        this.samples.push(redValue);
        
        // Keep only recent samples
        if (this.samples.length > this.windowSize) {
          this.samples.shift();
        }

        // Calculate heart rate if we have enough samples
        if (this.samples.length >= this.windowSize) {
          const { heartRate, confidence } = this.calculateHeartRate();
          
          if (this.onHeartRateCallback && heartRate > 0) {
            this.onHeartRateCallback(heartRate, confidence);
          }
        }
      }
    } catch (error) {
      console.error('Error in heart rate detection loop:', error);
    }

    // Continue loop
    this.animationFrame = requestAnimationFrame(() => this.detectLoop());
  }

  private extractRedChannelValue(): number {
    if (!this.videoElement || !this.canvasElement || !this.ctx) {
      return 0;
    }

    const video = this.videoElement;
    const canvas = this.canvasElement;
    const ctx = this.ctx;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    if (canvas.width === 0 || canvas.height === 0) {
      return 0;
    }

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Extract pixel data from center region (where fingertip should be)
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const regionSize = 50; // 50x50 pixel region

    const imageData = ctx.getImageData(
      centerX - regionSize / 2,
      centerY - regionSize / 2,
      regionSize,
      regionSize
    );

    // Calculate average red channel value
    let totalRed = 0;
    let pixelCount = 0;

    for (let i = 0; i < imageData.data.length; i += 4) {
      const red = imageData.data[i];
      const green = imageData.data[i + 1];
      const blue = imageData.data[i + 2];

      // Filter for skin-tone pixels (rough heuristic)
      if (red > green && red > blue && red > 60) {
        totalRed += red;
        pixelCount++;
      }
    }

    return pixelCount > 0 ? totalRed / pixelCount : 0;
  }

  private calculateHeartRate(): { heartRate: number; confidence: number } {
    if (this.samples.length < this.windowSize) {
      return { heartRate: 0, confidence: 0 };
    }

    try {
      // Apply bandpass filter (0.5-4 Hz for heart rate)
      const filtered = this.bandpassFilter(this.samples, this.sampleRate, 0.5, 4.0);
      
      // Find dominant frequency using FFT-like analysis
      const frequencies = this.findDominantFrequency(filtered, this.sampleRate);
      
      // Convert frequency to BPM
      const heartRate = Math.round(frequencies.dominantFreq * 60);
      
      // Calculate confidence based on signal strength and consistency
      const confidence = Math.min(frequencies.amplitude / 10, 1.0);
      
      // Validate heart rate range (40-200 BPM)
      if (heartRate >= 40 && heartRate <= 200 && confidence > 0.3) {
        return { heartRate, confidence };
      }
      
      return { heartRate: 0, confidence: 0 };
    } catch (error) {
      console.error('Error calculating heart rate:', error);
      return { heartRate: 0, confidence: 0 };
    }
  }

  private bandpassFilter(data: number[], sampleRate: number, lowFreq: number, highFreq: number): number[] {
    // Simple bandpass filter implementation
    const nyquist = sampleRate / 2;
    const lowNorm = lowFreq / nyquist;
    const highNorm = highFreq / nyquist;
    
    // Apply simple moving average for now (more sophisticated filtering could be added)
    const filtered: number[] = [];
    const windowSize = 5;
    
    for (let i = 0; i < data.length; i++) {
      let sum = 0;
      let count = 0;
      
      for (let j = Math.max(0, i - windowSize); j <= Math.min(data.length - 1, i + windowSize); j++) {
        sum += data[j];
        count++;
      }
      
      filtered[i] = sum / count;
    }
    
    return filtered;
  }

  private findDominantFrequency(data: number[], sampleRate: number): { dominantFreq: number; amplitude: number } {
    const N = data.length;
    const frequencies: number[] = [];
    const amplitudes: number[] = [];
    
    // Simple frequency analysis (basic implementation)
    for (let freq = 0.5; freq <= 4.0; freq += 0.1) {
      let real = 0;
      let imag = 0;
      
      for (let i = 0; i < N; i++) {
        const angle = 2 * Math.PI * freq * i / sampleRate;
        real += data[i] * Math.cos(angle);
        imag += data[i] * Math.sin(angle);
      }
      
      const amplitude = Math.sqrt(real * real + imag * imag);
      frequencies.push(freq);
      amplitudes.push(amplitude);
    }
    
    // Find peak frequency
    let maxAmplitude = 0;
    let dominantFreq = 0;
    
    for (let i = 0; i < amplitudes.length; i++) {
      if (amplitudes[i] > maxAmplitude) {
        maxAmplitude = amplitudes[i];
        dominantFreq = frequencies[i];
      }
    }
    
    return { dominantFreq, amplitude: maxAmplitude };
  }

  isDetecting(): boolean {
    return this.isRunning;
  }

  getSampleCount(): number {
    return this.samples.length;
  }

  getRequiredSamples(): number {
    return this.windowSize;
  }
}

// Utility functions for biometric analysis
export const BiometricUtils = {
  // Calculate stress level based on heart rate variability
  calculateStressLevel(heartRates: number[]): number {
    if (heartRates.length < 5) return 0;
    
    // Calculate heart rate variability (HRV)
    const intervals = [];
    for (let i = 1; i < heartRates.length; i++) {
      intervals.push(Math.abs(heartRates[i] - heartRates[i - 1]));
    }
    
    const meanInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((a, b) => a + Math.pow(b - meanInterval, 2), 0) / intervals.length;
    const hrv = Math.sqrt(variance);
    
    // Higher HRV generally indicates lower stress (simplified)
    const stressLevel = Math.max(0, Math.min(10, 10 - (hrv / 5)));
    return Math.round(stressLevel * 10) / 10;
  },

  // Analyze breathing rate from heart rate data
  estimateBreathingRate(heartRates: number[]): number {
    if (heartRates.length < 10) return 0;
    
    // Breathing affects heart rate in cycles
    // This is a simplified estimation
    const cycles = this.countCycles(heartRates);
    const breathingRate = cycles * 6; // Approximate breaths per minute
    
    return Math.max(8, Math.min(30, breathingRate)); // Normal range
  },

  countCycles(data: number[]): number {
    let cycles = 0;
    let trend = 0; // -1: decreasing, 1: increasing
    
    for (let i = 1; i < data.length; i++) {
      const newTrend = data[i] > data[i - 1] ? 1 : -1;
      
      if (trend !== 0 && trend !== newTrend) {
        cycles++;
      }
      
      trend = newTrend;
    }
    
    return Math.floor(cycles / 2); // Full cycle = up + down
  },

  // Validate heart rate reading
  validateHeartRate(heartRate: number, confidence: number): boolean {
    return heartRate >= 40 && 
           heartRate <= 200 && 
           confidence >= 0.3;
  },

  // Get heart rate category
  getHeartRateCategory(heartRate: number, age: number = 30): string {
    const maxHR = 220 - age;
    const percentage = (heartRate / maxHR) * 100;
    
    if (percentage < 50) return 'Resting';
    if (percentage < 60) return 'Light';
    if (percentage < 70) return 'Moderate';
    if (percentage < 85) return 'Vigorous';
    return 'Maximum';
  }
};
