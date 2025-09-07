// Emotions API Routes
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

// POST - Record emotion entry
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
      emotion, 
      intensity, 
      confidence,
      context,
      sessionId,
      messageId,
      triggers,
      notes 
    } = body;

    if (!emotion || intensity === undefined) {
      return NextResponse.json(
        { error: 'Emotion and intensity are required' },
        { status: 400 }
      );
    }

    const emotionEntry = await conversationService.recordEmotion({
      userId: user.id,
      primaryEmotion: emotion,
      secondaryEmotions: [],
      intensity,
      confidence: confidence || 0.8,
      detectionSource: 'manual',
      trigger: triggers?.join(', '),
      context,
      sessionId,
      rawData: { messageId, notes }
    });

    return NextResponse.json({
      success: true,
      emotionEntry
    });

  } catch (error: any) {
    console.error('Record emotion error:', error);
    return NextResponse.json(
      { error: 'Failed to record emotion' },
      { status: 500 }
    );
  }
}

// GET - Fetch user emotions
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
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    // Use analytics method to get emotion data
    const analytics = await conversationService.getEmotionAnalytics(user.id, 30);
    
    return NextResponse.json({
      success: true,
      emotions: analytics || { totalEntries: 0, emotionCounts: {}, averageIntensity: 0 }
    });

  } catch (error: any) {
    console.error('Get emotions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch emotions' },
      { status: 500 }
    );
  }
}
