'use client';

interface UserData {
  id: string;
  name?: string;
  email?: string;
  preferences: UserPreferences;
  wellnessData: WellnessData;
  sessionData: SessionData;
  privacy: PrivacySettings;
  lastUpdated: number;
  created: number;
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: boolean;
  voiceEnabled: boolean;
  cameraEnabled: boolean;
  dataSharing: boolean;
  autoSave: boolean;
}

interface WellnessData {
  moodHistory: MoodEntry[];
  breathingHistory: BreathingSession[];
  emotionHistory: EmotionDetection[];
  stressLevels: StressReading[];
  sleepData: SleepEntry[];
  goals: WellnessGoal[];
  achievements: Achievement[];
  streaks: StreakData;
}

interface MoodEntry {
  id: string;
  mood: number; // 1-10 scale
  emotions: string[];
  notes?: string;
  timestamp: number;
  context?: {
    activity?: string;
    location?: string;
    weather?: string;
    socialContext?: string;
  };
}

interface BreathingSession {
  id: string;
  pattern: number[];
  duration: number; // seconds
  completedCycles: number;
  avgHeartRate?: number;
  effectiveness: number; // 1-10 scale
  timestamp: number;
}

interface EmotionDetection {
  id: string;
  emotion: string;
  confidence: number;
  timestamp: number;
  sessionId: string;
  faceMetrics?: any;
}

interface StressReading {
  id: string;
  level: number; // 1-10 scale
  heartRateVariability?: number;
  source: 'manual' | 'biometric' | 'questionnaire';
  timestamp: number;
}

interface SleepEntry {
  id: string;
  quality: number; // 1-10 scale
  duration: number; // hours
  bedtime: number;
  wakeTime: number;
  notes?: string;
}

interface WellnessGoal {
  id: string;
  type: 'mood' | 'breathing' | 'sleep' | 'stress' | 'custom';
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  deadline?: number;
  isCompleted: boolean;
  created: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  type: 'streak' | 'milestone' | 'improvement' | 'consistency';
  unlockedAt: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: number;
  streakType: 'daily' | 'weekly' | 'monthly';
}

interface SessionData {
  currentSessionId: string;
  sessionStartTime: number;
  totalTimeSpent: number;
  activitiesCompleted: string[];
  currentActivity?: string;
  deviceInfo: {
    userAgent: string;
    screen: string;
    timezone: string;
  };
}

interface PrivacySettings {
  dataRetention: 'session' | '7days' | '30days' | '90days' | 'never';
  localOnly: boolean;
  encryptData: boolean;
  anonymizeData: boolean;
  shareAnalytics: boolean;
  exportEnabled: boolean;
}

class SecureStorage {
  private storageKey = 'mindscope_user_data';
  private encryptionKey?: CryptoKey;
  
  async initialize(): Promise<void> {
    if (typeof window === 'undefined') return;
    
    try {
      // Generate or retrieve encryption key
      const keyData = localStorage.getItem('mindscope_key');
      if (keyData) {
        const keyBuffer = this.base64ToArrayBuffer(keyData);
        this.encryptionKey = await crypto.subtle.importKey(
          'raw',
          keyBuffer,
          'AES-GCM',
          false,
          ['encrypt', 'decrypt']
        );
      } else {
        await this.generateNewKey();
      }
    } catch (error) {
      console.error('Failed to initialize encryption:', error);
      // Fallback to unencrypted storage
    }
  }
  
  private async generateNewKey(): Promise<void> {
    this.encryptionKey = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
    
    const keyBuffer = await crypto.subtle.exportKey('raw', this.encryptionKey);
    localStorage.setItem('mindscope_key', this.arrayBufferToBase64(keyBuffer));
  }
  
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
  
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }
  
  async encryptData(data: any): Promise<string> {
    if (!this.encryptionKey) {
      return JSON.stringify(data);
    }
    
    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(JSON.stringify(data));
      
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encryptedBuffer = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        this.encryptionKey,
        dataBuffer
      );
      
      const encryptedData = {
        iv: this.arrayBufferToBase64(iv.buffer),
        data: this.arrayBufferToBase64(encryptedBuffer)
      };
      
      return JSON.stringify(encryptedData);
    } catch (error) {
      console.error('Encryption failed:', error);
      return JSON.stringify(data);
    }
  }
  
  async decryptData(encryptedString: string): Promise<any> {
    if (!this.encryptionKey) {
      return JSON.parse(encryptedString);
    }
    
    try {
      const encryptedData = JSON.parse(encryptedString);
      if (!encryptedData.iv || !encryptedData.data) {
        // Unencrypted data
        return JSON.parse(encryptedString);
      }
      
      const iv = this.base64ToArrayBuffer(encryptedData.iv);
      const dataBuffer = this.base64ToArrayBuffer(encryptedData.data);
      
      const decryptedBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        this.encryptionKey,
        dataBuffer
      );
      
      const decoder = new TextDecoder();
      const decryptedString = decoder.decode(decryptedBuffer);
      return JSON.parse(decryptedString);
    } catch (error) {
      console.error('Decryption failed:', error);
      // Try to parse as unencrypted
      return JSON.parse(encryptedString);
    }
  }
  
  async saveUserData(userData: UserData): Promise<void> {
    try {
      const encryptedData = await this.encryptData(userData);
      localStorage.setItem(this.storageKey, encryptedData);
      
      // Also save to IndexedDB for larger data
      await this.saveToIndexedDB(userData);
    } catch (error) {
      console.error('Failed to save user data:', error);
    }
  }
  
  async loadUserData(): Promise<UserData | null> {
    try {
      const encryptedData = localStorage.getItem(this.storageKey);
      if (!encryptedData) return null;
      
      return await this.decryptData(encryptedData);
    } catch (error) {
      console.error('Failed to load user data:', error);
      return null;
    }
  }
  
  private async saveToIndexedDB(userData: UserData): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('MindScopeDB', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = async () => {
        const db = request.result;
        const transaction = db.transaction(['userData'], 'readwrite');
        const store = transaction.objectStore('userData');
        
        const encryptedData = await this.encryptData(userData);
        store.put({ id: 'current', data: encryptedData });
        
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      };
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('userData')) {
          db.createObjectStore('userData', { keyPath: 'id' });
        }
      };
    });
  }
  
  async exportUserData(): Promise<string> {
    const userData = await this.loadUserData();
    if (!userData) throw new Error('No user data found');
    
    // Remove sensitive information for export
    const exportData = {
      ...userData,
      id: 'exported',
      email: undefined, // Remove email for privacy
      sessionData: {
        ...userData.sessionData,
        deviceInfo: {
          ...userData.sessionData.deviceInfo,
          userAgent: 'removed' // Remove user agent
        }
      }
    };
    
    return JSON.stringify(exportData, null, 2);
  }
  
  async clearUserData(): Promise<void> {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem('mindscope_key');
    
    // Clear IndexedDB
    return new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase('MindScopeDB');
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

// Create singleton instance
const secureStorage = new SecureStorage();

// Initialize on first use
let initialized = false;
const ensureInitialized = async () => {
  if (!initialized && typeof window !== 'undefined') {
    await secureStorage.initialize();
    initialized = true;
  }
};

// Public API
export const DataPersistence = {
  async saveUserData(userData: UserData): Promise<void> {
    await ensureInitialized();
    return secureStorage.saveUserData(userData);
  },
  
  async loadUserData(): Promise<UserData | null> {
    await ensureInitialized();
    return secureStorage.loadUserData();
  },
  
  async exportUserData(): Promise<string> {
    await ensureInitialized();
    return secureStorage.exportUserData();
  },
  
  async clearUserData(): Promise<void> {
    await ensureInitialized();
    return secureStorage.clearUserData();
  },
  
  // Utility functions for specific data types
  async saveMoodEntry(moodEntry: MoodEntry): Promise<void> {
    const userData = await this.loadUserData();
    if (userData) {
      userData.wellnessData.moodHistory.push(moodEntry);
      userData.lastUpdated = Date.now();
      await this.saveUserData(userData);
    }
  },
  
  async saveBreathingSession(session: BreathingSession): Promise<void> {
    const userData = await this.loadUserData();
    if (userData) {
      userData.wellnessData.breathingHistory.push(session);
      userData.lastUpdated = Date.now();
      await this.saveUserData(userData);
    }
  },
  
  async saveEmotionDetection(emotion: EmotionDetection): Promise<void> {
    const userData = await this.loadUserData();
    if (userData) {
      userData.wellnessData.emotionHistory.push(emotion);
      userData.lastUpdated = Date.now();
      await this.saveUserData(userData);
    }
  },
  
  async getWellnessStats(): Promise<any> {
    const userData = await this.loadUserData();
    if (!userData) return null;
    
    const { wellnessData } = userData;
    const now = Date.now();
    const weekAgo = now - (7 * 24 * 60 * 60 * 1000);
    
    return {
      totalMoodEntries: wellnessData.moodHistory.length,
      recentMoodEntries: wellnessData.moodHistory.filter(m => m.timestamp > weekAgo).length,
      averageMood: wellnessData.moodHistory.reduce((sum, m) => sum + m.mood, 0) / wellnessData.moodHistory.length || 0,
      totalBreathingSessions: wellnessData.breathingHistory.length,
      totalBreathingMinutes: wellnessData.breathingHistory.reduce((sum, s) => sum + s.duration, 0) / 60,
      currentStreak: wellnessData.streaks.currentStreak,
      achievements: wellnessData.achievements.length,
      goalsCompleted: wellnessData.goals.filter(g => g.isCompleted).length,
      totalGoals: wellnessData.goals.length
    };
  }
};

// Type exports
export type {
  UserData,
  UserPreferences,
  WellnessData,
  MoodEntry,
  BreathingSession,
  EmotionDetection,
  StressReading,
  SleepEntry,
  WellnessGoal,
  Achievement,
  StreakData,
  SessionData,
  PrivacySettings
};

export default DataPersistence;
