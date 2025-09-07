// IndexedDB Service for AI Therapist Conversation Persistence
export interface StoredConversation {
  id: string;
  sessionId: string;
  messages: TherapistMessage[];
  startTime: number;
  lastActivity: number;
  emotionalSummary: {
    primaryEmotions: string[];
    contexts: string[];
    crisisLevels: string[];
    therapeuticTechniques: string[];
  };
  userMetrics: {
    messageCount: number;
    sessionDuration: number;
    averageResponseTime: number;
    emotionalProgress?: number; // -1 to 1 scale
  };
  tags: string[];
  archived: boolean;
}

export interface UserPreferences {
  id: string;
  voiceEnabled: boolean;
  preferredLanguage: string;
  therapeuticApproaches: string[];
  crisisContacts: Array<{
    name: string;
    phone: string;
    relationship: string;
  }>;
  privacySettings: {
    shareAnonymousData: boolean;
    retainConversations: boolean;
    autoDeleteAfterDays: number;
  };
  personalInfo?: {
    name?: string;
    age?: number;
    timezone?: string;
    preferredThemes: string[];
  };
}

export interface SessionAnalytics {
  totalSessions: number;
  totalMessages: number;
  averageSessionLength: number;
  emotionalTrends: Array<{
    date: string;
    emotion: string;
    intensity: number;
  }>;
  progressMetrics: {
    weeklyImprovement: number;
    consistencyScore: number;
    engagementLevel: number;
  };
  therapeuticInsights: {
    mostEffectiveTechniques: string[];
    commonTriggers: string[];
    improvementAreas: string[];
  };
}

// Import the types from the AI service
import type { TherapistMessage } from './aiTherapistService';

class ConversationStorageService {
  private dbName = 'MindScopeTherapist';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  // Initialize IndexedDB
  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        resolve(); // SSR safety
        return;
      }

      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('Error opening IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Conversations store
        if (!db.objectStoreNames.contains('conversations')) {
          const conversationStore = db.createObjectStore('conversations', { keyPath: 'id' });
          conversationStore.createIndex('sessionId', 'sessionId', { unique: false });
          conversationStore.createIndex('startTime', 'startTime', { unique: false });
          conversationStore.createIndex('lastActivity', 'lastActivity', { unique: false });
          conversationStore.createIndex('archived', 'archived', { unique: false });
        }

        // User preferences store
        if (!db.objectStoreNames.contains('preferences')) {
          db.createObjectStore('preferences', { keyPath: 'id' });
        }

        // Analytics store
        if (!db.objectStoreNames.contains('analytics')) {
          const analyticsStore = db.createObjectStore('analytics', { keyPath: 'id' });
          analyticsStore.createIndex('date', 'date', { unique: false });
        }

        // Session metadata store
        if (!db.objectStoreNames.contains('sessions')) {
          const sessionStore = db.createObjectStore('sessions', { keyPath: 'id' });
          sessionStore.createIndex('startTime', 'startTime', { unique: false });
        }
      };
    });
  }

  // Save conversation
  async saveConversation(conversation: StoredConversation): Promise<void> {
    if (!this.db) await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['conversations'], 'readwrite');
      const store = transaction.objectStore('conversations');
      
      const request = store.put({
        ...conversation,
        lastActivity: Date.now()
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Get conversation by ID
  async getConversation(id: string): Promise<StoredConversation | null> {
    if (!this.db) await this.initialize();
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['conversations'], 'readonly');
      const store = transaction.objectStore('conversations');
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result || null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Get all conversations (with optional filters)
  async getConversations(options: {
    limit?: number;
    archived?: boolean;
    dateRange?: { start: Date; end: Date };
    emotionFilter?: string[];
  } = {}): Promise<StoredConversation[]> {
    if (!this.db) await this.initialize();
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['conversations'], 'readonly');
      const store = transaction.objectStore('conversations');
      const index = store.index('lastActivity');
      const request = index.openCursor(null, 'prev'); // Most recent first

      const conversations: StoredConversation[] = [];
      let count = 0;

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        
        if (cursor && (!options.limit || count < options.limit)) {
          const conversation = cursor.value as StoredConversation;
          
          // Apply filters
          let include = true;
          
          if (options.archived !== undefined && conversation.archived !== options.archived) {
            include = false;
          }
          
          if (options.dateRange) {
            const conversationDate = new Date(conversation.startTime);
            if (conversationDate < options.dateRange.start || conversationDate > options.dateRange.end) {
              include = false;
            }
          }
          
          if (options.emotionFilter && options.emotionFilter.length > 0) {
            const hasMatchingEmotion = conversation.emotionalSummary.primaryEmotions.some(
              emotion => options.emotionFilter!.includes(emotion)
            );
            if (!hasMatchingEmotion) {
              include = false;
            }
          }

          if (include) {
            conversations.push(conversation);
            count++;
          }
          
          cursor.continue();
        } else {
          resolve(conversations);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  // Delete conversation
  async deleteConversation(id: string): Promise<void> {
    if (!this.db) await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['conversations'], 'readwrite');
      const store = transaction.objectStore('conversations');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Archive conversation
  async archiveConversation(id: string): Promise<void> {
    const conversation = await this.getConversation(id);
    if (conversation) {
      conversation.archived = true;
      await this.saveConversation(conversation);
    }
  }

  // Save user preferences
  async savePreferences(preferences: UserPreferences): Promise<void> {
    if (!this.db) await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['preferences'], 'readwrite');
      const store = transaction.objectStore('preferences');
      const request = store.put(preferences);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Get user preferences
  async getPreferences(): Promise<UserPreferences | null> {
    if (!this.db) await this.initialize();
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['preferences'], 'readonly');
      const store = transaction.objectStore('preferences');
      const request = store.get('default');

      request.onsuccess = () => {
        resolve(request.result || null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Generate analytics
  async generateAnalytics(): Promise<SessionAnalytics> {
    const conversations = await this.getConversations({ archived: false });
    
    if (conversations.length === 0) {
      return {
        totalSessions: 0,
        totalMessages: 0,
        averageSessionLength: 0,
        emotionalTrends: [],
        progressMetrics: {
          weeklyImprovement: 0,
          consistencyScore: 0,
          engagementLevel: 0
        },
        therapeuticInsights: {
          mostEffectiveTechniques: [],
          commonTriggers: [],
          improvementAreas: []
        }
      };
    }

    // Calculate basic metrics
    const totalSessions = conversations.length;
    const totalMessages = conversations.reduce((sum, conv) => sum + conv.userMetrics.messageCount, 0);
    const averageSessionLength = conversations.reduce((sum, conv) => sum + conv.userMetrics.sessionDuration, 0) / totalSessions;

    // Emotional trends (last 30 days)
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const recentConversations = conversations.filter(conv => conv.startTime >= thirtyDaysAgo);
    
    const emotionalTrends = recentConversations.map(conv => ({
      date: new Date(conv.startTime).toISOString().split('T')[0],
      emotion: conv.emotionalSummary.primaryEmotions[0] || 'neutral',
      intensity: conv.emotionalSummary.crisisLevels.includes('high') || conv.emotionalSummary.crisisLevels.includes('critical') ? 0.8 : 0.4
    }));

    // Progress metrics
    const weeklyImprovement = this.calculateWeeklyImprovement(recentConversations);
    const consistencyScore = this.calculateConsistencyScore(conversations);
    const engagementLevel = totalMessages / Math.max(totalSessions, 1);

    // Therapeutic insights
    const allTechniques = conversations.flatMap(conv => conv.emotionalSummary.therapeuticTechniques);
    const techniqueFrequency = this.getFrequencyMap(allTechniques);
    const mostEffectiveTechniques = Object.entries(techniqueFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([technique]) => technique);

    const allEmotions = conversations.flatMap(conv => conv.emotionalSummary.primaryEmotions);
    const emotionFrequency = this.getFrequencyMap(allEmotions);
    const commonTriggers = Object.entries(emotionFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([emotion]) => emotion);

    return {
      totalSessions,
      totalMessages,
      averageSessionLength,
      emotionalTrends,
      progressMetrics: {
        weeklyImprovement,
        consistencyScore,
        engagementLevel: Math.min(engagementLevel / 10, 1) // Normalize to 0-1
      },
      therapeuticInsights: {
        mostEffectiveTechniques,
        commonTriggers,
        improvementAreas: ['stress_management', 'emotional_regulation', 'communication_skills'] // Placeholder
      }
    };
  }

  // Helper methods
  private calculateWeeklyImprovement(conversations: StoredConversation[]): number {
    if (conversations.length < 2) return 0;
    
    // Sort by date
    const sorted = conversations.sort((a, b) => a.startTime - b.startTime);
    const recent = sorted.slice(-7); // Last 7 sessions
    const earlier = sorted.slice(-14, -7); // Previous 7 sessions
    
    if (recent.length === 0 || earlier.length === 0) return 0;
    
    const recentCrisisScore = this.calculateAverageCrisisScore(recent);
    const earlierCrisisScore = this.calculateAverageCrisisScore(earlier);
    
    // Improvement is reduction in crisis score (lower is better)
    return Math.max(-1, Math.min(1, (earlierCrisisScore - recentCrisisScore) / 2));
  }

  private calculateAverageCrisisScore(conversations: StoredConversation[]): number {
    const crisisScores = conversations.map(conv => {
      const levels = conv.emotionalSummary.crisisLevels;
      if (levels.includes('critical')) return 4;
      if (levels.includes('high')) return 3;
      if (levels.includes('medium')) return 2;
      return 1;
    });
    
    return crisisScores.reduce((sum, score) => sum + score, 0) / crisisScores.length;
  }

  private calculateConsistencyScore(conversations: StoredConversation[]): number {
    if (conversations.length < 2) return 0;
    
    // Calculate days between sessions
    const sorted = conversations.sort((a, b) => a.startTime - b.startTime);
    const gaps: number[] = [];
    
    for (let i = 1; i < sorted.length; i++) {
      const daysDiff = (sorted[i].startTime - sorted[i-1].startTime) / (24 * 60 * 60 * 1000);
      gaps.push(daysDiff);
    }
    
    // Consistency is inversely related to variance in gaps
    const avgGap = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
    const variance = gaps.reduce((sum, gap) => sum + Math.pow(gap - avgGap, 2), 0) / gaps.length;
    
    // Normalize to 0-1 scale (lower variance = higher consistency)
    return Math.max(0, Math.min(1, 1 - (variance / 100)));
  }

  private getFrequencyMap(items: string[]): Record<string, number> {
    const frequency: Record<string, number> = {};
    items.forEach(item => {
      frequency[item] = (frequency[item] || 0) + 1;
    });
    return frequency;
  }

  // Export conversation data
  async exportConversations(): Promise<string> {
    const conversations = await this.getConversations();
    const preferences = await this.getPreferences();
    const analytics = await this.generateAnalytics();

    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      conversations,
      preferences,
      analytics,
      totalConversations: conversations.length
    };

    return JSON.stringify(exportData, null, 2);
  }

  // Import conversation data
  async importConversations(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.conversations) {
        for (const conversation of data.conversations) {
          await this.saveConversation(conversation);
        }
      }
      
      if (data.preferences) {
        await this.savePreferences(data.preferences);
      }
    } catch (error) {
      console.error('Error importing conversations:', error);
      throw new Error('Invalid import data format');
    }
  }

  // Clear all data (for privacy)
  async clearAllData(): Promise<void> {
    if (!this.db) await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    const stores = ['conversations', 'preferences', 'analytics', 'sessions'];
    
    for (const storeName of stores) {
      await new Promise<void>((resolve, reject) => {
        const transaction = this.db!.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  }
}

// Export singleton instance
export const conversationStorage = new ConversationStorageService();
export default conversationStorage;
