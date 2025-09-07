import Groq from 'groq-sdk';
import { NextRequest, NextResponse } from 'next/server';
import SafetySystem from '../../../lib/safetySystem';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || 'demo_key'
});

// Initialize safety system
const safetySystem = new SafetySystem();

// Enhanced therapeutic system prompts for different contexts with multilingual support
const getTherapeuticPrompt = (
  context: string, 
  emotionalState: string[], 
  intensity: number, 
  language?: string,
  culturalContext?: any,
  culturalAdaptations?: string[]
) => {
  const basePrompt = `You are an AI therapist trained in evidence-based therapeutic approaches including CBT, DBT, mindfulness, and ACT. You provide compassionate, professional support while maintaining appropriate boundaries.

Core principles:
- Use active listening and empathetic responses
- Validate emotions while offering perspective
- Suggest specific therapeutic techniques when appropriate
- Maintain professional boundaries (you are not a replacement for human therapy)
- Recognize crisis situations and suggest appropriate resources
- Use a warm, non-judgmental tone`;

  const intensityGuidance = intensity >= 8 
    ? "The user is experiencing high emotional intensity. Focus on immediate stabilization techniques and crisis support."
    : intensity >= 6 
    ? "The user is experiencing moderate distress. Offer supportive interventions and coping strategies."
    : "The user is experiencing mild distress. Focus on insight and skill-building.";

  const emotionalGuidance = emotionalState.length > 0 
    ? `Detected emotions: ${emotionalState.join(', ')}. Tailor your response to address these specific emotional states.`
    : "";

  // Language and cultural adaptations
  const languageGuidance = language && language !== 'en' 
    ? `Please respond in a culturally appropriate manner for ${language} speakers. Consider cultural communication styles and values.`
    : "";

  const culturalGuidance = culturalAdaptations && culturalAdaptations.length > 0
    ? `Cultural considerations: ${culturalAdaptations.join(', ')}. Adapt your therapeutic approach accordingly.`
    : "";

  return `${basePrompt}

${intensityGuidance}
${emotionalGuidance}
${languageGuidance}
${culturalGuidance}

Respond with empathy, validate their experience, and offer 1-2 specific therapeutic suggestions. Keep responses focused and actionable.`;
};

const getCBTPrompt = () => `You are a CBT-focused AI therapist. Help the user identify thought patterns, cognitive distortions, and develop more balanced thinking. Suggest specific CBT techniques like thought records, behavioral experiments, or cognitive restructuring when appropriate.`;

const getDBTPrompt = () => `You are a DBT-focused AI therapist. Help the user with emotional regulation, distress tolerance, interpersonal effectiveness, and mindfulness skills. Suggest specific DBT techniques like TIPP, PLEASE, wise mind, or DEAR MAN when appropriate.`;

const getMindfulnessPrompt = () => `You are a mindfulness-focused AI therapist. Guide the user toward present-moment awareness, acceptance, and mindful coping strategies. Suggest specific mindfulness practices like breathing exercises, body scans, or grounding techniques when appropriate.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      message, 
      context = 'general', 
      emotionalState = [], 
      intensity = 5, 
      sessionHistory = [],
      approach = 'general',
      language = 'en',
      culturalContext = null,
      culturalAdaptations = [],
      crisisDetection = null
    } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Handle multilingual crisis detection if provided
    let crisisResponse;
    if (crisisDetection && crisisDetection.isDetected) {
      // Use the crisis detection from the client-side multilingual system
      crisisResponse = {
        isImmediate: crisisDetection.confidence > 0.8,
        riskAssessment: {
          riskLevel: crisisDetection.confidence > 0.8 ? 'high' : 'moderate'
        },
        immediateResponse: `I'm concerned about what you've shared. Your safety is important. Please consider reaching out to a crisis support service.`,
        followUpActions: ['Contact emergency services if in immediate danger', 'Connect with mental health professional']
      };
    } else {
      // TODO 6: Safety System Integration - Crisis Detection & Risk Assessment
      crisisResponse = safetySystem.assessCrisis(message, intensity, sessionHistory);
    }
    
    // If immediate crisis is detected, return crisis response immediately
    if (crisisResponse.isImmediate) {
      console.log('CRISIS DETECTED:', {
        riskLevel: crisisResponse.riskAssessment.riskLevel,
        crisisTypes: crisisResponse.riskAssessment.crisisTypes,
        triggerKeywords: crisisResponse.riskAssessment.triggerKeywords
      });
      
      return NextResponse.json({ 
        response: crisisResponse.immediateResponse,
        crisisDetected: true,
        riskLevel: crisisResponse.riskAssessment.riskLevel,
        emergencyResources: safetySystem.getEmergencyResources(),
        followUpActions: crisisResponse.followUpActions
      });
    }

    // For moderate/high risk, include safety information in response
    const includesSafetyWarning = crisisResponse.riskAssessment.riskLevel === 'high' || 
                                  crisisResponse.riskAssessment.riskLevel === 'moderate';

    // Select appropriate system prompt based on context and approach
    let systemPrompt = getTherapeuticPrompt(
      context, 
      emotionalState, 
      intensity, 
      language, 
      culturalContext, 
      culturalAdaptations
    );
    
    // Add safety awareness to prompt if elevated risk detected
    if (includesSafetyWarning) {
      systemPrompt += `\n\nIMPORTANT SAFETY CONTEXT: The user may be experiencing elevated emotional distress (Risk Level: ${crisisResponse.riskAssessment.riskLevel}). Be extra attentive to their safety and wellbeing. Include appropriate resources and consider suggesting professional support.`;
    }
    
    if (approach === 'CBT') {
      systemPrompt = getCBTPrompt();
    } else if (approach === 'DBT') {
      systemPrompt = getDBTPrompt();
    } else if (approach === 'mindfulness') {
      systemPrompt = getMindfulnessPrompt();
    }

    // Build conversation history
    const messages: Array<{role: 'system' | 'user' | 'assistant', content: string}> = [
      {
        role: 'system',
        content: systemPrompt
      }
    ];

    // Add recent session history for context
    sessionHistory.slice(-3).forEach((msg: any) => {
      messages.push({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      });
    });

    // Add current message
    messages.push({
      role: 'user',
      content: message
    });

    // Check for demo/fallback mode
    if (process.env.GROQ_API_KEY === 'demo_key' || !process.env.GROQ_API_KEY) {
      console.log('Using fallback therapeutic response');
      
      // Use safety system for crisis detection even in fallback mode
      if (crisisResponse.isImmediate) {
        return NextResponse.json({ 
          response: crisisResponse.immediateResponse,
          crisisDetected: true,
          riskLevel: crisisResponse.riskAssessment.riskLevel,
          emergencyResources: safetySystem.getEmergencyResources()
        });
      }
      
      const fallbackResponse = generateFallbackTherapeuticResponse(message, emotionalState, intensity);
      const responseData: any = { response: fallbackResponse };
      
      if (includesSafetyWarning) {
        responseData.safetyAlert = {
          riskLevel: crisisResponse.riskAssessment.riskLevel,
          resources: crisisResponse.riskAssessment.professionalReferrals?.slice(0, 2) || []
        };
      }
      
      return NextResponse.json(responseData);
    }

    const completion = await groq.chat.completions.create({
      messages,
      model: 'llama-3.1-70b-versatile',
      temperature: 0.7,
      max_tokens: 800,
      top_p: 0.9,
      stream: false
    });

    const response = completion.choices[0]?.message?.content || 'I understand you\'re reaching out. Let\'s work through this together.';

    // Include safety information in response if elevated risk
    const responseData: any = { response };
    
    if (includesSafetyWarning) {
      responseData.safetyAlert = {
        riskLevel: crisisResponse.riskAssessment.riskLevel,
        recommendedAction: crisisResponse.riskAssessment.recommendedAction,
        resources: crisisResponse.riskAssessment.professionalReferrals?.slice(0, 2) || [], // Top 2 resources
        timeframe: crisisResponse.riskAssessment.timeframe
      };
    }

    // Always include basic crisis resources for any user
    responseData.emergencyContact = {
      suicide: '988',
      crisis: 'Text HOME to 741741',
      emergency: '911'
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Chat API error:', error);
    
    // Provide therapeutic fallback response
    const fallbackResponse = "I'm here to support you. While I'm experiencing a technical issue, please know that your feelings are valid and you're not alone. If you're in crisis, please reach out to a mental health professional or crisis helpline immediately.";
    
    return NextResponse.json({ response: fallbackResponse });
  }
}

// Enhanced fallback therapeutic responses
function generateFallbackTherapeuticResponse(message: string, emotionalState: string[], intensity: number): string {
  const lowerMessage = message.toLowerCase();
  
  // Crisis detection
  if (lowerMessage.includes('suicide') || lowerMessage.includes('kill myself') || lowerMessage.includes('end it all')) {
    return `I'm really concerned about what you're sharing. Your life has value, and there are people who want to help. Please reach out to a crisis helpline immediately:

• National Suicide Prevention Lifeline: 988
• Crisis Text Line: Text HOME to 741741
• Or go to your nearest emergency room

You don't have to go through this alone. Professional help is available 24/7.`;
  }

  // High intensity responses
  if (intensity >= 8) {
    return `I can sense you're experiencing very intense emotions right now. Let's focus on getting you through this moment safely.

Try this grounding technique:
• Name 5 things you can see
• 4 things you can touch
• 3 things you can hear
• 2 things you can smell
• 1 thing you can taste

Take slow, deep breaths. You're safe right now. What you're feeling is temporary, even though it feels overwhelming.`;
  }

  // Anxiety-specific responses
  if (emotionalState.includes('anxiety') || lowerMessage.includes('anxious') || lowerMessage.includes('worried')) {
    return `I hear that anxiety is making things difficult for you right now. Anxiety often makes us think the worst-case scenario is inevitable, but let's challenge that together.

Try this breathing technique:
• Breathe in for 4 counts
• Hold for 4 counts  
• Breathe out for 6 counts
• Repeat 4-5 times

What specific worry is bothering you most? Sometimes naming our fears helps reduce their power over us.`;
  }

  // Depression-specific responses
  if (emotionalState.includes('depression') || lowerMessage.includes('depressed') || lowerMessage.includes('hopeless')) {
    return `Thank you for sharing something so difficult. Depression can make everything feel heavy and pointless, but you took a step by reaching out today - that takes real strength.

When we're depressed, our brain tells us things that aren't always true. One small thing you could try:
• Think of one tiny activity you used to enjoy
• Commit to doing it for just 5 minutes today
• Notice how you feel afterward

You don't have to feel better immediately. Healing happens gradually, and you deserve support through this process.`;
  }

  // Relationship-specific responses
  if (emotionalState.includes('relationship') || lowerMessage.includes('partner') || lowerMessage.includes('family')) {
    return `Relationship challenges can be really painful. It sounds like you're dealing with some difficult dynamics.

When emotions are high in relationships, try the STOP technique:
• **S**top what you're doing
• **T**ake a breath
• **O**bserve what you're feeling
• **P**roceed thoughtfully

What's the most important thing you want the other person to understand? Sometimes focusing on one clear message helps communication.`;
  }

  // General supportive response
  return `Thank you for sharing what's on your mind. I can hear that you're going through something challenging right now.

Your feelings are completely valid. Sometimes just putting our thoughts into words can help us process them better.

Here's a simple technique that might help:
• Take a moment to breathe deeply
• Ask yourself: "What do I need most right now?"
• Give yourself permission to feel whatever you're feeling

What would feel most supportive for you in this moment? I'm here to listen and help you work through this.`;
}

export async function GET() {
  return NextResponse.json({ 
    message: 'AI Therapist Chat API is running',
    version: '2.0.0',
    features: [
      'Therapeutic conversation support',
      'CBT, DBT, and mindfulness integration',
      'Emotional state analysis',
      'Crisis detection and response',
      'Evidence-based interventions'
    ]
  });
}
