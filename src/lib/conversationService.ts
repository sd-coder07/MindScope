// Enhanced Conversation Service - Production Ready
import prisma from './database';

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

export interface ConversationWithMessages {
  id: string;
  userId: string;
  sessionId?: string;
  title?: string;
  conversationType: string;
  language?: string;
  totalMessages: number;
  lastMessageAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  messages: any[];
  session?: any;
}

class EnhancedConversationService {
  
  // Create a new conversation
  async createConversation(data: ConversationData): Promise<any> {
    try {
      const conversation = await prisma.conversation.create({
        data: {
          userId: data.userId,
          title: data.title || 'New Conversation',
          conversationType: data.conversationType,
          sessionId: data.sessionId,
          language: data.language || 'en',
          startedAt: new Date(),
          totalMessages: 0,
          keyTopics: [],
        },
      });

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
  async addMessage(data: MessageData): Promise<any> {
    try {
      const message = await prisma.message.create({
        data: {
          conversationId: data.conversationId,
          content: data.content,
          sender: data.sender,
          messageType: data.messageType || 'text',
          timestamp: new Date(),
          emotion: data.emotion,
          sentiment: data.sentiment,
          therapeuticTechnique: data.therapeuticTechnique,
          audioUrl: data.audioUrl,
          voiceAnalysis: data.voiceAnalysis,
          isRead: false,
          isDeleted: false,
        },
      });

      // Update conversation stats
      await prisma.conversation.update({
        where: { id: data.conversationId },
        data: {
          totalMessages: { increment: 1 },
          lastMessageAt: new Date(),
        },
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
          userId: userId,
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

        // Map Prisma result to our interface
        const result: ConversationWithMessages = {
          id: conversation.id,
          userId: conversation.userId,
          sessionId: conversation.sessionId || undefined,
          title: conversation.title || undefined,
          conversationType: conversation.conversationType,
          language: conversation.language || undefined,
          totalMessages: conversation.totalMessages,
          lastMessageAt: conversation.lastMessageAt || undefined,
          isActive: conversation.isActive,
          createdAt: conversation.createdAt,
          updatedAt: conversation.updatedAt,
          messages: conversation.messages,
          session: conversation.session,
        };

        return result;
      }

      return null;
    } catch (error) {
      console.error('Get conversation error:', error);
      return null;
    }
  }

  // Get user conversations
  async getUserConversations(userId: string, limit: number = 20, offset: number = 0): Promise<any[]> {
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
  async recordEmotion(data: EmotionData): Promise<any> {
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
          timestamp: new Date(),
          rawData: data.rawData || {},
        },
      });

      await this.logAnalytics('emotion_recorded', {
        emotionId: emotion.id,
        userId: data.userId,
        emotion: data.primaryEmotion,
        intensity: data.intensity
      });

      return emotion;
    } catch (error) {
      console.error('Record emotion error:', error);
      throw error;
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
      const emotionCounts: Record<string, number> = {};
      emotions.forEach((emotion: any) => {
        emotionCounts[emotion.primaryEmotion] = (emotionCounts[emotion.primaryEmotion] || 0) + 1;
      });

      const averageIntensity = emotions.length > 0 
        ? emotions.reduce((sum: any, e: any) => sum + e.intensity, 0) / emotions.length 
        : 0;

      return {
        totalEntries: emotions.length,
        emotionCounts,
        averageIntensity,
        mostCommonEmotion: Object.entries(emotionCounts)
          .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'neutral',
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
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          userId: userId,
        },
      });

      if (!conversation) {
        return false;
      }

      // Soft delete messages
      await prisma.message.updateMany({
        where: { conversationId },
        data: { isDeleted: true }
      });

      // Delete conversation
      await prisma.conversation.delete({
        where: { id: conversationId }
      });

      return true;
    } catch (error) {
      console.error('Delete conversation error:', error);
      return false;
    }
  }

  // Search conversations
  async searchConversations(userId: string, query: string, limit: number = 10): Promise<any[]> {
    try {
      const messages = await prisma.message.findMany({
        where: {
          conversation: { userId },
          content: { contains: query, mode: 'insensitive' },
          isDeleted: false
        },
        take: limit,
        orderBy: { timestamp: 'desc' },
        include: {
          conversation: {
            select: {
              id: true,
              title: true,
              conversationType: true
            }
          }
        }
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
              messages: true
            }
          },
          emotions: true,
          sessions: true
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      return {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          createdAt: user.createdAt
        },
        conversations: user.conversations.map((conv: any) => ({
          id: conv.id,
          title: conv.title,
          type: conv.conversationType,
          startTime: conv.startTime,
          endTime: conv.endTime,
          messages: conv.messages.map((msg: any) => ({
            content: msg.content,
            sender: msg.sender,
            timestamp: msg.timestamp,
            emotion: msg.emotion
          }))
        })),
        emotions: user.emotions.map((emotion: any) => ({
          emotion: emotion.primaryEmotion,
          intensity: emotion.intensity,
          timestamp: emotion.timestamp
        })),
        sessions: user.sessions.map((session: any) => ({
          id: session.id,
          type: session.sessionType,
          startTime: session.startTime,
          duration: session.duration
        }))
      };
    } catch (error) {
      console.error('Export user data error:', error);
      throw error;
    }
  }

  // Log analytics
  private async logAnalytics(metricName: string, metadata: any): Promise<void> {
    try {
      await prisma.analyticsEvent.create({
        data: {
          eventType: metricName,
          metadata,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      console.error('Log analytics error:', error);
    }
  }
}

// Export singleton instance
export const conversationService = new EnhancedConversationService();
export default conversationService;
