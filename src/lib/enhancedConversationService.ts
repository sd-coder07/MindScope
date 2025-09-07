// Enhanced Conversation Storage Service with Database Integration
import prisma from './database';
import type { 
  Conversation, 
  Message, 
  EmotionEntry, 
  TherapySession,
  User 
} from '@prisma/client';

export interface ConversationData {
  userId: string;
  sessionId?: string;
  title?: string;
  conversationType: 'therapy' | 'crisis' | 'check_in' | 'assessment';
  language?: string;
}

export interface MessageData {
  conversationId: string;
  content: string;
  sender: 'user' | 'ai_therapist' | 'system';
  messageType?: 'text' | 'audio' | 'image' | 'file';
  emotion?: string;
  sentiment?: number;
  therapeuticTechnique?: string;
  audioUrl?: string;
  voiceAnalysis?: any;
  metadata?: any;
}

export interface EmotionData {
  userId: string;
  sessionId?: string;
  primaryEmotion: string;
  secondaryEmotions?: string[];
  intensity: number;
  confidence: number;
  detectionSource: 'text' | 'voice' | 'facial' | 'manual' | 'multimodal';
  trigger?: string;
  context?: string;
  rawData?: any;
}

export interface ConversationWithMessages extends Conversation {
  messages: Message[];
  session?: TherapySession;
}

class EnhancedConversationService {
  
  // Create new conversation
  async createConversation(data: ConversationData): Promise<Conversation> {
    try {
      const conversation = await prisma.conversation.create({
        data: {
          userId: data.userId,
          sessionId: data.sessionId,
          title: data.title,
          conversationType: data.conversationType,
          language: data.language || 'en',
          isEncrypted: true,
          totalMessages: 0,
        },
      });

      // Log conversation creation
      await this.logAnalytics('conversation_created', {
        conversationId: conversation.id,
        userId: data.userId,
        type: data.conversationType
      });

      return conversation;
    } catch (error) {
      console.error('Create conversation error:', error);
      throw error;
    }
  }

  // Add message to conversation
  async addMessage(data: MessageData): Promise<Message> {
    try {
      const message = await prisma.message.create({
        data: {
          conversationId: data.conversationId,
          content: data.content,
          sender: data.sender,
          messageType: data.messageType || 'text',
          emotion: data.emotion,
          sentiment: data.sentiment,
          therapeuticTechnique: data.therapeuticTechnique,
          audioUrl: data.audioUrl,
          voiceAnalysis: data.voiceAnalysis,
          timestamp: new Date(),
        },
      });

      // Update conversation metadata
      await prisma.conversation.update({
        where: { id: data.conversationId },
        data: {
          totalMessages: { increment: 1 },
          lastMessageAt: new Date(),
        },
      });

      // Check for crisis flags
      if (data.sentiment !== undefined && data.sentiment < -0.7) {
        await this.flagCrisisMessage(message.id, 'negative_sentiment');
      }

      // Log message analytics
      await this.logAnalytics('message_sent', {
        messageId: message.id,
        conversationId: data.conversationId,
        sender: data.sender,
        hasEmotion: !!data.emotion
      });

      return message;
    } catch (error) {
      console.error('Add message error:', error);
      throw error;
    }
  }

  // Get conversation with messages
  async getConversation(conversationId: string, userId: string): Promise<ConversationWithMessages | null> {
    try {
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          userId: userId, // Ensure user owns the conversation
        },
        include: {
          messages: {
            orderBy: { timestamp: 'asc' },
            where: { isDeleted: false }
          },
          session: true,
        },
      });

      if (conversation) {
        // Mark messages as read
        await prisma.message.updateMany({
          where: {
            conversationId: conversationId,
            isRead: false,
            sender: { not: 'user' }
          },
          data: { isRead: true }
        });
      }

      return conversation;
    } catch (error) {
      console.error('Get conversation error:', error);
      return null;
    }
  }

  // Get user conversations
  async getUserConversations(
    userId: string, 
    limit: number = 20, 
    offset: number = 0
  ): Promise<Conversation[]> {
    try {
      const conversations = await prisma.conversation.findMany({
        where: { userId },
        orderBy: { lastMessageAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          messages: {
            take: 1,
            orderBy: { timestamp: 'desc' },
            select: {
              content: true,
              sender: true,
              timestamp: true,
            }
          }
        }
      });

      return conversations;
    } catch (error) {
      console.error('Get user conversations error:', error);
      return [];
    }
  }
    try {
      const conversations = await prisma.conversation.findMany({
        where: { userId },
        orderBy: { lastMessageAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          messages: {
            take: 1,
            orderBy: { timestamp: 'desc' },
            select: {
              content: true,
              sender: true,
              timestamp: true,
            }
          }
        }
      });

      return conversations;
    } catch (error) {
      console.error('Get user conversations error:', error);
      return [];
    }
  }

  // Record emotion entry
  async recordEmotion(data: EmotionData): Promise<EmotionEntry> {
    try {
      const emotion = await prisma.emotionEntry.create({
        data: {
          userId: data.userId,
          sessionId: data.sessionId,
          primaryEmotion: data.primaryEmotion,
          secondaryEmotions: data.secondaryEmotions || [],
          intensity: data.intensity,
          confidence: data.confidence,
          detectionSource: data.detectionSource,
          trigger: data.trigger,
          context: data.context,
          rawData: data.rawData,
          timestamp: new Date(),
        },
      });

      // Check for concerning emotion patterns
      await this.analyzeEmotionPattern(data.userId, emotion);

      // Log emotion analytics
      await this.logAnalytics('emotion_recorded', {
        emotionId: emotion.id,
        userId: data.userId,
        emotion: data.primaryEmotion,
        intensity: data.intensity,
        source: data.detectionSource
      });

      return emotion;
    } catch (error) {
      console.error('Record emotion error:', error);
      throw error;
    }
  }

  // Get emotion history
  async getEmotionHistory(
    userId: string, 
    days: number = 30
  ): Promise<EmotionEntry[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const emotions = await prisma.emotionEntry.findMany({
        where: {
          userId,
          timestamp: { gte: startDate }
        },
        orderBy: { timestamp: 'desc' },
      });

      return emotions;
    } catch (error) {
      console.error('Get emotion history error:', error);
      return [];
    }
  }

  // Get emotion analytics
  async getEmotionAnalytics(userId: string, days: number = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const emotions = await prisma.emotionEntry.findMany({
        where: {
          userId,
          timestamp: { gte: startDate }
        },
      });

      // Calculate analytics
      const emotionCounts = emotions.reduce((acc, emotion) => {
        acc[emotion.primaryEmotion] = (acc[emotion.primaryEmotion] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const averageIntensity = emotions.length > 0 
        ? emotions.reduce((sum, e) => sum + e.intensity, 0) / emotions.length 
        : 0;

      const trends = this.calculateEmotionTrends(emotions);

      return {
        totalEntries: emotions.length,
        emotionCounts,
        averageIntensity,
        trends,
        mostCommonEmotion: Object.entries(emotionCounts)
          .sort(([,a], [,b]) => b - a)[0]?.[0] || 'neutral',
        period: days
      };
    } catch (error) {
      console.error('Get emotion analytics error:', error);
      return null;
    }
  }

  // Delete conversation
  async deleteConversation(conversationId: string, userId: string): Promise<boolean> {
    try {
      // Verify ownership
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          userId: userId
        }
      });

      if (!conversation) {
        throw new Error('Conversation not found or access denied');
      }

      // Soft delete messages first
      await prisma.message.updateMany({
        where: { conversationId },
        data: { isDeleted: true }
      });

      // Delete conversation
      await prisma.conversation.delete({
        where: { id: conversationId }
      });

      // Log deletion
      await this.logAnalytics('conversation_deleted', {
        conversationId,
        userId
      });

      return true;
    } catch (error) {
      console.error('Delete conversation error:', error);
      return false;
    }
  }

  // Search conversations
  async searchConversations(userId: string, query: string, limit: number = 10): Promise<Message[]> {
    try {
      const messages = await prisma.message.findMany({
        where: {
          conversation: { userId },
          content: {
            contains: query,
            mode: 'insensitive'
          },
          isDeleted: false
        },
        include: {
          conversation: {
            select: {
              id: true,
              title: true,
              conversationType: true
            }
          }
        },
        orderBy: { timestamp: 'desc' },
        take: limit
      });

      return messages;
    } catch (error) {
      console.error('Search conversations error:', error);
      return [];
    }
  }

  // Export user data
  async exportUserData(userId: string): Promise<any> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          conversations: {
            include: {
              messages: {
                where: { isDeleted: false }
              }
            }
          },
          emotions: true,
          sessions: true,
          journalEntries: true,
          goals: true,
          assessments: true
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Remove sensitive data
      const exportData = {
        profile: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          createdAt: user.createdAt,
          preferredLanguage: user.preferredLanguage,
          therapeuticApproaches: user.therapeuticApproaches
        },
        conversations: user.conversations.map(conv => ({
          id: conv.id,
          title: conv.title,
          type: conv.conversationType,
          startedAt: conv.startedAt,
          messageCount: conv.totalMessages,
          messages: conv.messages.map(msg => ({
            content: msg.content,
            sender: msg.sender,
            timestamp: msg.timestamp,
            emotion: msg.emotion
          }))
        })),
        emotions: user.emotions.map(emotion => ({
          emotion: emotion.primaryEmotion,
          intensity: emotion.intensity,
          timestamp: emotion.timestamp,
          context: emotion.context
        })),
        sessions: user.sessions.map(session => ({
          type: session.sessionType,
          startTime: session.startTime,
          duration: session.duration,
          mood: {
            initial: session.initialMood,
            final: session.finalMood
          }
        })),
        analytics: await this.getEmotionAnalytics(userId, 365) // Full year
      };

      // Log export
      await this.logAnalytics('data_exported', {
        userId,
        exportSize: JSON.stringify(exportData).length
      });

      return exportData;
    } catch (error) {
      console.error('Export user data error:', error);
      throw error;
    }
  }

  // Private helper methods
  private async flagCrisisMessage(messageId: string, reason: string): Promise<void> {
    try {
      await prisma.message.update({
        where: { id: messageId },
        data: { crisisFlag: true }
      });

      // TODO: Implement crisis intervention protocols
      console.log(`Crisis message flagged: ${messageId}, reason: ${reason}`);
    } catch (error) {
      console.error('Flag crisis message error:', error);
    }
  }

  private async analyzeEmotionPattern(userId: string, currentEmotion: EmotionEntry): Promise<void> {
    try {
      // Get recent emotions for pattern analysis
      const recentEmotions = await prisma.emotionEntry.findMany({
        where: {
          userId,
          timestamp: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        },
        orderBy: { timestamp: 'desc' },
        take: 10
      });

      // Check for concerning patterns
      const highIntensityCount = recentEmotions.filter(e => e.intensity >= 8).length;
      const negativeEmotions = recentEmotions.filter(e => 
        ['depression', 'anxiety', 'anger', 'grief', 'trauma'].includes(e.primaryEmotion)
      ).length;

      if (highIntensityCount >= 5 || negativeEmotions >= 7) {
        // Create alert notification
        await prisma.notification.create({
          data: {
            userId,
            title: 'Emotional Wellness Check',
            message: 'We\'ve noticed some concerning emotional patterns. Consider reaching out for additional support.',
            type: 'alert',
            priority: 'high',
            actionRequired: true,
            actionUrl: '/crisis-support'
          }
        });
      }
    } catch (error) {
      console.error('Analyze emotion pattern error:', error);
    }
  }

  private calculateEmotionTrends(emotions: EmotionEntry[]) {
    // Group emotions by day
    const dailyEmotions = emotions.reduce((acc, emotion) => {
      const date = emotion.timestamp.toISOString().split('T')[0];
      if (!acc[date]) acc[date] = [];
      acc[date].push(emotion);
      return acc;
    }, {} as Record<string, EmotionEntry[]>);

    // Calculate daily averages
    const trends = Object.entries(dailyEmotions).map(([date, dayEmotions]) => ({
      date,
      averageIntensity: dayEmotions.reduce((sum, e) => sum + e.intensity, 0) / dayEmotions.length,
      emotionCount: dayEmotions.length,
      dominantEmotion: this.getDominantEmotion(dayEmotions)
    }));

    return trends.sort((a, b) => a.date.localeCompare(b.date));
  }

  private getDominantEmotion(emotions: EmotionEntry[]): string {
    const counts = emotions.reduce((acc, emotion) => {
      acc[emotion.primaryEmotion] = (acc[emotion.primaryEmotion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'neutral';
  }

  private async logAnalytics(metricName: string, metadata: any): Promise<void> {
    try {
      await prisma.systemAnalytics.create({
        data: {
          metricName,
          metricValue: 1,
          timeframe: 'daily',
          category: 'usage',
          metadata,
          userId: metadata.userId
        }
      });
    } catch (error) {
      console.error('Log analytics error:', error);
    }
  }
}

export const conversationService = new EnhancedConversationService();
export default conversationService;
