// Conversations API Routes
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

// GET - Fetch user conversations
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
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    const conversations = await conversationService.getUserConversations(
      user.id,
      limit,
      offset
    );

    return NextResponse.json({
      success: true,
      conversations
    });

  } catch (error: any) {
    console.error('Get conversations error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

// POST - Create new conversation
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
    const { title, conversationType, sessionId } = body;

    if (!conversationType) {
      return NextResponse.json(
        { error: 'Conversation type is required' },
        { status: 400 }
      );
    }

    const conversation = await conversationService.createConversation({
      userId: user.id,
      title,
      conversationType,
      sessionId,
      language: user.preferredLanguage
    });

    return NextResponse.json({
      success: true,
      conversation
    });

  } catch (error: any) {
    console.error('Create conversation error:', error);
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}
