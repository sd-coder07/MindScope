'use client';

// Enhanced Data Persistence System for MindScope
export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    notifications: boolean;
    voiceEnabled: boolean;
    focusMode: boolean;
  };
  privacy: {
    dataRetention: 'session' | '7days' | '30days' | 'never';
    analytics: boolean;
    biometrics: boolean;
  };
  createdAt: string;
  lastActive: string;
}

export interface MoodEntry {
  id: string;
  userId: string;
  mood: 'happy' | 'sad' | 'anxious' | 'calm' | 'energetic' | 'tired' | 'stressed' | 'peaceful' | 'angry' | 'content';
  score: number; // 1-10
  intensity: number; // 1-5
  triggers?: string[];
  notes?: string;
  activities?: string[];
  timestamp: string;
  location?: string;
  weather?: string;
}

export interface UserStats {
  userId: string;
  moodScore: number;
  stressLevel: number;
  energyLevel: number;
  streakDays: number;
  sessionsCompleted: number;
  communityRank: number;
  wellnessScore: number;
  breathingMinutes: number;
  weeklyGoal: number;
  achievements: string[];
  totalXP: number;
  level: number;
  lastUpdated: string;
}

export interface BreathingSession {
  id: string;
  userId: string;
  pattern: string;
  duration: number;
  completed: boolean;
  startTime?: string;
  endTime?: string;
  timestamp: string;
  heartRateBefore?: number;
  heartRateAfter?: number;
  moodBefore?: number;
  moodAfter?: number;
}

export interface Achievement {
  id: string;
  userId: string;
  achievementType?: string;
  type?: string;
  title: string;
  description: string;
  xpReward?: number;
  points?: number;
  unlockedAt: string;
  category?: 'breathing' | 'mood' | 'consistency' | 'social' | 'milestone';
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

class DataPersistence {
  private readonly PREFIX = 'mindscope_';
  private readonly VERSION = '1.0';

  // User Profile Management
  saveUserProfile(profile: UserProfile): void {
    try {
      const data = {
        ...profile,
        version: this.VERSION,
        lastSaved: new Date().toISOString()
      };
      localStorage.setItem(`${this.PREFIX}profile`, JSON.stringify(data));
      this.logActivity('profile_saved');
    } catch (error) {
      console.error('Failed to save user profile:', error);
    }
  }

  getUserProfile(): UserProfile | null {
    try {
      const data = localStorage.getItem(`${this.PREFIX}profile`);
      if (data) {
        const profile = JSON.parse(data);
        // Update last active
        profile.lastActive = new Date().toISOString();
        this.saveUserProfile(profile);
        return profile;
      }
      return null;
    } catch (error) {
      console.error('Failed to load user profile:', error);
      return null;
    }
  }

  createDefaultProfile(): UserProfile {
    const profile: UserProfile = {
      id: this.generateId(),
      name: 'User',
      preferences: {
        theme: 'auto',
        language: 'en-US',
        notifications: true,
        voiceEnabled: true,
        focusMode: false
      },
      privacy: {
        dataRetention: '30days',
        analytics: false,
        biometrics: false
      },
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    };
    
    this.saveUserProfile(profile);
    return profile;
  }

  // Mood Tracking
  saveMoodEntry(entry: MoodEntry): void {
    try {
      const entries = this.getMoodEntries();
      entries.push(entry);
      
      // Keep only last 1000 entries to manage storage
      const trimmedEntries = entries.slice(-1000);
      
      localStorage.setItem(`${this.PREFIX}mood_entries`, JSON.stringify(trimmedEntries));
      this.updateUserStats(entry);
      this.logActivity('mood_saved');
    } catch (error) {
      console.error('Failed to save mood entry:', error);
    }
  }

  getMoodEntries(days?: number): MoodEntry[] {
    try {
      const data = localStorage.getItem(`${this.PREFIX}mood_entries`);
      if (data) {
        const entries: MoodEntry[] = JSON.parse(data);
        
        if (days) {
          const cutoff = new Date();
          cutoff.setDate(cutoff.getDate() - days);
          return entries.filter(entry => new Date(entry.timestamp) >= cutoff);
        }
        
        return entries;
      }
      return [];
    } catch (error) {
      console.error('Failed to load mood entries:', error);
      return [];
    }
  }

  getLatestMoodEntry(): MoodEntry | null {
    const entries = this.getMoodEntries();
    return entries.length > 0 ? entries[entries.length - 1] : null;
  }

  // User Statistics
  saveUserStats(stats: UserStats): void {
    try {
      const data = {
        ...stats,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(`${this.PREFIX}user_stats`, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save user stats:', error);
    }
  }

  getUserStats(): UserStats | null {
    try {
      const data = localStorage.getItem(`${this.PREFIX}user_stats`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to load user stats:', error);
      return null;
    }
  }

  createDefaultStats(userId: string): UserStats {
    const stats: UserStats = {
      userId,
      moodScore: 7.0,
      stressLevel: 5.0,
      energyLevel: 7.0,
      streakDays: 1,
      sessionsCompleted: 0,
      communityRank: 999999,
      wellnessScore: 70,
      breathingMinutes: 0,
      weeklyGoal: 60,
      achievements: [],
      totalXP: 0,
      level: 1,
      lastUpdated: new Date().toISOString()
    };
    
    this.saveUserStats(stats);
    return stats;
  }

  private updateUserStats(moodEntry: MoodEntry): void {
    const stats = this.getUserStats();
    if (stats) {
      // Update mood score (weighted average with recent bias)
      const recentEntries = this.getMoodEntries(7);
      const avgMood = recentEntries.reduce((sum, entry) => sum + entry.score, 0) / recentEntries.length;
      
      stats.moodScore = avgMood;
      stats.stressLevel = this.calculateStressLevel(recentEntries);
      stats.energyLevel = this.calculateEnergyLevel(recentEntries);
      stats.wellnessScore = this.calculateWellnessScore(stats);
      
      // Check for streaks
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const todayEntries = recentEntries.filter(e => new Date(e.timestamp).toDateString() === today);
      const yesterdayEntries = recentEntries.filter(e => new Date(e.timestamp).toDateString() === yesterday);
      
      if (todayEntries.length > 0) {
        if (yesterdayEntries.length > 0) {
          stats.streakDays += 1;
        } else {
          stats.streakDays = 1;
        }
      }
      
      this.saveUserStats(stats);
    }
  }

  // Breathing Sessions
  saveBreathingSession(session: BreathingSession): void {
    try {
      const sessions = this.getBreathingSessions();
      sessions.push(session);
      
      // Keep only last 100 sessions
      const trimmedSessions = sessions.slice(-100);
      
      localStorage.setItem(`${this.PREFIX}breathing_sessions`, JSON.stringify(trimmedSessions));
      
      // Update stats
      if (session.completed) {
        const stats = this.getUserStats();
        if (stats) {
          stats.breathingMinutes += session.duration / 60;
          stats.sessionsCompleted += 1;
          this.saveUserStats(stats);
        }
      }
    } catch (error) {
      console.error('Failed to save breathing session:', error);
    }
  }

  getBreathingSessions(days?: number): BreathingSession[] {
    try {
      const data = localStorage.getItem(`${this.PREFIX}breathing_sessions`);
      const sessions = data ? JSON.parse(data) : [];
      
      if (!days) return sessions;
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      return sessions.filter((session: BreathingSession) => 
        new Date(session.timestamp || session.startTime || 0) >= cutoffDate
      );
    } catch (error) {
      console.error('Failed to load breathing sessions:', error);
      return [];
    }
  }

  // Achievements
  saveAchievement(achievement: Achievement): void {
    try {
      const achievements = this.getAchievements();
      achievements.push(achievement);
      localStorage.setItem(`${this.PREFIX}achievements`, JSON.stringify(achievements));
      
      // Update user stats
      const stats = this.getUserStats();
      if (stats) {
        stats.achievements.push(achievement.id);
        stats.totalXP += achievement.xpReward || achievement.points || 0;
        stats.level = Math.floor(stats.totalXP / 1000) + 1;
        this.saveUserStats(stats);
      }
    } catch (error) {
      console.error('Failed to save achievement:', error);
    }
  }

  getAchievements(): Achievement[] {
    try {
      const data = localStorage.getItem(`${this.PREFIX}achievements`);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load achievements:', error);
      return [];
    }
  }

  // Utility Methods
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateStressLevel(entries: MoodEntry[]): number {
    const stressfulMoods = entries.filter(e => ['anxious', 'stressed', 'angry'].includes(e.mood));
    return Math.min(10, (stressfulMoods.length / Math.max(entries.length, 1)) * 10);
  }

  private calculateEnergyLevel(entries: MoodEntry[]): number {
    const energeticMoods = entries.filter(e => ['happy', 'energetic', 'content'].includes(e.mood));
    return Math.max(1, (energeticMoods.length / Math.max(entries.length, 1)) * 10);
  }

  private calculateWellnessScore(stats: UserStats): number {
    const moodWeight = 0.4;
    const stressWeight = 0.3;
    const energyWeight = 0.2;
    const streakWeight = 0.1;
    
    const moodScore = (stats.moodScore / 10) * 100;
    const stressScore = ((10 - stats.stressLevel) / 10) * 100;
    const energyScore = (stats.energyLevel / 10) * 100;
    const streakScore = Math.min(100, stats.streakDays * 10);
    
    return Math.round(
      moodScore * moodWeight +
      stressScore * stressWeight +
      energyScore * energyWeight +
      streakScore * streakWeight
    );
  }

  private logActivity(activity: string): void {
    try {
      const activities = JSON.parse(localStorage.getItem(`${this.PREFIX}activity_log`) || '[]');
      activities.push({
        activity,
        timestamp: new Date().toISOString()
      });
      
      // Keep only last 50 activities
      const trimmedActivities = activities.slice(-50);
      localStorage.setItem(`${this.PREFIX}activity_log`, JSON.stringify(trimmedActivities));
    } catch (error) {
      // Silent fail for activity logging
    }
  }

  // Data Export/Import
  exportUserData(): string {
    try {
      const data = {
        profile: this.getUserProfile(),
        stats: this.getUserStats(),
        moodEntries: this.getMoodEntries(),
        breathingSessions: this.getBreathingSessions(),
        achievements: this.getAchievements(),
        exportedAt: new Date().toISOString()
      };
      
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Failed to export user data:', error);
      return '';
    }
  }

  clearAllData(): void {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith(this.PREFIX));
      keys.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Failed to clear user data:', error);
    }
  }
}

// Singleton instance
export const dataPersistence = new DataPersistence();

// Hooks for React components
export const useUserProfile = () => {
  const profile = dataPersistence.getUserProfile();
  return profile || dataPersistence.createDefaultProfile();
};

export const useUserStats = () => {
  const profile = useUserProfile();
  const stats = dataPersistence.getUserStats();
  return stats || dataPersistence.createDefaultStats(profile.id);
};

export const useMoodEntries = (days?: number) => {
  return dataPersistence.getMoodEntries(days);
};
