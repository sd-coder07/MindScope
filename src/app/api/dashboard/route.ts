// User Dashboard API Route
import { authService } from '@/lib/authService';
import { conversationService } from '@/lib/conversationService';
import { NextRequest, NextResponse } from 'next/server';

// Get authentication from request
async function getAuthUser(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return null;
  }

  return await authService.verifyToken(token);
}

// GET - Get user dashboard data
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user conversations
    const conversations = await conversationService.getUserConversations(user.id, 10);
    
    // Get emotion analytics
    const emotionAnalytics = await conversationService.getEmotionAnalytics(user.id, 30);
    
    // Calculate session statistics
    const totalSessions = conversations.length;
    const activeSessions = conversations.filter(c => 
      c.endTime === null || c.endTime === undefined
    ).length;

    const dashboard = {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        memberSince: user.createdAt
      },
      statistics: {
        totalSessions,
        activeSessions,
        totalMessages: conversations.reduce((sum, conv) => sum + (conv.totalMessages || 0), 0),
        emotionEntries: emotionAnalytics?.totalEntries || 0
      },
      recentConversations: conversations.slice(0, 5).map(conv => ({
        id: conv.id,
        title: conv.title,
        type: conv.conversationType,
        lastMessage: conv.lastMessageAt,
        messageCount: conv.totalMessages || 0
      })),
      emotionAnalytics: emotionAnalytics ? {
        averageIntensity: emotionAnalytics.averageIntensity,
        mostCommonEmotion: emotionAnalytics.mostCommonEmotion,
        emotionDistribution: emotionAnalytics.emotionCounts,
        totalEntries: emotionAnalytics.totalEntries
      } : null
    };

    return NextResponse.json({
      success: true,
      dashboard
    });

  } catch (error: any) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to load dashboard data' },
      { status: 500 }
    );
  }
}
