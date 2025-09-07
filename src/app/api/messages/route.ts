// Messages API Routes
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

// POST - Send message and get AI response
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      conversationId, 
      content, 
      messageType = 'text',
      emotionData,
      sessionId 
    } = body;

    if (!conversationId || !content) {
      return NextResponse.json(
        { error: 'Conversation ID and content are required' },
        { status: 400 }
      );
    }

    // Save user message
    const userMessage = await conversationService.addMessage({
      conversationId,
      content,
      sender: 'user',
      messageType,
      emotion: emotionData?.emotion,
      sentiment: emotionData?.sentiment,
      metadata: {
        sessionId,
        timestamp: new Date().toISOString()
      }
    });

    // Generate AI response (this would integrate with your AI service)
    const aiResponse = await generateAIResponse(content, conversationId, user.id);

    // Save AI message
    const aiMessage = await conversationService.addMessage({
      conversationId,
      content: aiResponse.content,
      sender: 'ai_therapist',
      messageType: 'text',
      therapeuticTechnique: aiResponse.therapeuticTechnique,
      metadata: {
        sessionId,
        timestamp: new Date().toISOString(),
        confidence_score: aiResponse.confidenceScore
      }
    });

    return NextResponse.json({
      success: true,
      userMessage,
      aiMessage
    });

  } catch (error: any) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

// GET - Fetch conversation messages
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const conversationId = url.searchParams.get('conversationId');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      );
    }

    const messages = await conversationService.getConversation(conversationId, user.id);
    
    return NextResponse.json({
      success: true,
      messages: messages?.messages || []
    });

  } catch (error: any) {
    console.error('Get messages error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// Helper function to generate AI response
async function generateAIResponse(userMessage: string, conversationId: string, userId: string) {
  try {
    // Get conversation history for context
    const conversation = await conversationService.getConversation(conversationId, userId);
    const recentMessages = conversation?.messages.slice(-10) || [];
    
    // This would integrate with your enhanced AI therapist service
    // For now, return a simple therapeutic response
    return {
      content: `I understand you're sharing "${userMessage}". Let's explore this together. Can you tell me more about what you're feeling right now?`,
      therapeuticTechnique: 'active_listening',
      confidenceScore: 0.85
    };
  } catch (error) {
    console.error('AI response generation error:', error);
    return {
      content: "I'm here to listen and support you. Can you share more about what's on your mind?",
      therapeuticTechnique: 'supportive_response',
      confidenceScore: 0.7
    };
  }
}
