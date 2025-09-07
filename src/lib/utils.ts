import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Event system for cross-component communication
export class EventBus {
  private static instance: EventBus;
  private listeners: Record<string, Function[]> = {};

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  on(event: string, callback: Function): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: string, callback: Function): void {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  emit(event: string, data?: any): void {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }
}

export function getEmotionalColor(emotion: string): string {
  const colorMap: Record<string, string> = {
    happy: 'sunset',
    sad: 'ocean',
    angry: 'destructive',
    calm: 'serenity',
    anxious: 'healing',
    excited: 'warm',
    focused: 'serenity',
    stressed: 'ocean',
    peaceful: 'healing',
    energetic: 'sunset'
  }
  
  return colorMap[emotion.toLowerCase()] || 'serenity'
}

export function formatMoodScore(score: number): string {
  if (score >= 8) return 'Excellent'
  if (score >= 6) return 'Good'
  if (score >= 4) return 'Fair'
  if (score >= 2) return 'Poor'
  return 'Critical'
}

export function generateBreathingPattern(type: 'calm' | 'energize' | 'focus'): number[] {
  const patterns = {
    calm: [4, 4, 4, 4], // 4-4-4-4 breathing
    energize: [4, 2, 6, 2], // Energizing breath
    focus: [4, 7, 8, 0] // 4-7-8 technique
  }
  
  return patterns[type]
}

export function calculateStressLevel(heartRate: number, age: number): number {
  const maxHR = 220 - age
  const percentage = (heartRate / maxHR) * 100
  
  if (percentage > 85) return 5 // Very high stress
  if (percentage > 70) return 4 // High stress
  if (percentage > 60) return 3 // Moderate stress
  if (percentage > 50) return 2 // Low stress
  return 1 // Very low stress
}

export function getTherapyRecommendation(emotions: string[], stressLevel: number): string {
  if (stressLevel >= 4) {
    return 'Immediate breathing exercises and grounding techniques recommended'
  }
  
  if (emotions.includes('anxious') || emotions.includes('stressed')) {
    return 'CBT anxiety management module suggested'
  }
  
  if (emotions.includes('sad') || emotions.includes('depressed')) {
    return 'Mood lifting activities and DBT skills training'
  }
  
  return 'Continue with regular mindfulness practice'
}

export function simulateEmotionDetection(): {
  emotion: string;
  confidence: number;
  timestamp: Date;
} {
  const emotions = ['happy', 'calm', 'focused', 'peaceful', 'energetic', 'content']
  const emotion = emotions[Math.floor(Math.random() * emotions.length)]
  const confidence = 0.7 + Math.random() * 0.3
  
  return {
    emotion,
    confidence,
    timestamp: new Date()
  }
}

export function generateMoodData(days: number) {
  const data = []
  const today = new Date()
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    const mood = Math.random() * 10
    const stress = Math.random() * 10
    const energy = Math.random() * 10
    
    data.push({
      date: date.toISOString().split('T')[0],
      mood: Math.round(mood * 10) / 10,
      stress: Math.round(stress * 10) / 10,
      energy: Math.round(energy * 10) / 10
    })
  }
  
  return data
}
