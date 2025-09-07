import Groq from 'groq-sdk';

// Types for AI Therapist
export interface TherapistMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
  emotion?: string;
  context?: string;
}

export interface TherapistSession {
  id: string;
  messages: TherapistMessage[];
  userProfile?: {
    name?: string;
    age?: number;
    concerns?: string[];
    preferredLanguage?: string;
  };
  sessionMetadata?: {
    startTime: number;
    lastActivity: number;
    emotionalState?: string;
    therapeuticApproach?: string;
  };
}

export interface TherapistResponse {
  message: string;
  emotion: string;
  therapeuticTechnique?: string;
  followUpSuggestions?: string[];
  crisisLevel?: 'low' | 'medium' | 'high' | 'critical';
}

class AITherapistService {
  private groq: Groq | null = null;
  private model: string;
  private maxTokens: number;
  private temperature: number;

  constructor() {
    // Initialize Groq client if API key is available
    const apiKey = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY;
    
    if (apiKey && apiKey !== 'your_groq_api_key_here') {
      this.groq = new Groq({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true // Enable client-side usage
      });
    }

    this.model = process.env.AI_THERAPIST_MODEL || 'llama3-8b-8192';
    this.maxTokens = parseInt(process.env.AI_THERAPIST_MAX_TOKENS || '1000');
    this.temperature = parseFloat(process.env.AI_THERAPIST_TEMPERATURE || '0.7');
  }

  private getSystemPrompt(): string {
    return `You are a compassionate and professional AI therapist. Your role is to provide supportive, empathetic, and helpful responses to users seeking mental health guidance. 

Core Guidelines:
- Always respond with empathy and validation
- Use evidence-based therapeutic techniques (CBT, DBT, ACT, Mindfulness)
- Ask open-ended questions to encourage deeper reflection
- Provide practical coping strategies when appropriate
- Maintain professional boundaries while being warm and approachable
- If detecting crisis indicators, acknowledge the severity and suggest professional help
- Keep responses conversational but therapeutic
- Adapt your language to the user's communication style
- Encourage self-reflection and personal insights

Response Style:
- Be concise but thorough (2-4 sentences typically)
- Use "I" statements to show engagement ("I hear you saying...")
- Reflect emotions back to validate feelings
- Offer gentle reframes when helpful
- End with thoughtful questions when appropriate

Remember: You are a supportive therapeutic presence, not a replacement for professional therapy in crisis situations.`;
  }

  private getTherapeuticPrompts() {
    return {
      anxiety: "I notice you're experiencing anxiety. This is a very common and treatable concern. Let's use some grounding techniques together. Can you name 5 things you can see, 4 things you can touch, 3 things you can hear, 2 things you can smell, and 1 thing you can taste?",
      depression: "I hear the heaviness in what you're sharing, and I want you to know that depression is treatable. Let's try a behavioral activation approach - what's one small activity that used to bring you joy, even if it doesn't feel appealing right now?",
      stress: "Stress can feel overwhelming, but we can work through this together. Let's try a DBT skill called TIPP - Temperature (splash cold water), Intense exercise (jumping jacks), Paced breathing (4-7-8 breath), Paired muscle relaxation. Which would you like to try?",
      anger: "Anger often signals that something important to you feels violated. That's valid information. Let's use a CBT approach - what thoughts are going through your mind right now? Are there any thinking patterns we can examine together?",
      grief: "Grief is one of the most challenging human experiences, and there's no timeline for healing. Using principles from grief therapy, can you tell me about a positive memory with your loved one?",
      relationship: "Relationships can be complex. Let's use some interpersonal effectiveness skills from DBT. Can you describe the situation using DEARMAN - Describe, Express, Assert, Reinforce, Mindful, Appear confident, Negotiate?",
      work: "Work stress can impact every area of our lives. Let's create a stress management plan using CBT techniques. What aspects of work feel most controllable versus uncontrollable right now?",
      family: "Family dynamics often trigger deep patterns. Using family systems therapy principles, what role do you typically find yourself playing in family interactions?",
      trauma: "I recognize you're dealing with trauma, which takes tremendous courage to address. While I can provide support, EMDR and trauma-focused therapy with a specialized therapist would be most beneficial. For now, let's focus on grounding techniques.",
      general: "Thank you for sharing this with me. Using active listening and person-centered therapy principles, I want to reflect back what I'm hearing. What would feel most helpful for you right now?"
    };
  }

  private detectEmotionAndContext(message: string): { emotion: string; context: string } {
    const lowerMessage = message.toLowerCase();
    
    // Emotion detection keywords
    const emotionKeywords = {
      anxiety: ['anxious', 'worried', 'nervous', 'panic', 'fear', 'overwhelmed', 'stress'],
      depression: ['sad', 'depressed', 'hopeless', 'empty', 'numb', 'worthless', 'tired'],
      anger: ['angry', 'mad', 'furious', 'frustrated', 'irritated', 'rage', 'annoyed'],
      grief: ['loss', 'death', 'died', 'grief', 'mourning', 'miss', 'goodbye'],
      stress: ['stressed', 'pressure', 'overwhelming', 'busy', 'deadline', 'exhausted'],
      trauma: ['trauma', 'abuse', 'ptsd', 'flashback', 'triggered', 'nightmares', 'assault']
    };

    // Context detection keywords
    const contextKeywords = {
      work: ['work', 'job', 'boss', 'colleague', 'office', 'career', 'workplace'],
      relationship: ['relationship', 'partner', 'boyfriend', 'girlfriend', 'spouse', 'dating'],
      family: ['family', 'parents', 'mother', 'father', 'siblings', 'children', 'relatives'],
      health: ['health', 'sick', 'illness', 'doctor', 'medical', 'pain', 'symptoms'],
      financial: ['money', 'financial', 'debt', 'bills', 'income', 'job loss', 'expenses']
    };

    let detectedEmotion = 'general';
    let detectedContext = 'general';

    // Detect primary emotion
    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        detectedEmotion = emotion;
        break;
      }
    }

    // Detect context
    for (const [context, keywords] of Object.entries(contextKeywords)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        detectedContext = context;
        break;
      }
    }

    return { emotion: detectedEmotion, context: detectedContext };
  }

  private assessCrisisLevel(message: string): 'low' | 'medium' | 'high' | 'critical' {
    const lowerMessage = message.toLowerCase();
    
    const criticalKeywords = ['suicide', 'kill myself', 'end my life', 'want to die', 'hurt myself'];
    const highKeywords = ['self-harm', 'cutting', 'suicidal thoughts', 'thoughts of death', 'not worth living'];
    const mediumKeywords = ['hopeless', 'can\'t go on', 'everything is pointless', 'no way out'];

    if (criticalKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return 'critical';
    }
    if (highKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return 'high';
    }
    if (mediumKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return 'medium';
    }
    
    return 'low';
  }

  async generateResponse(
    userMessage: string, 
    conversationHistory: TherapistMessage[] = []
  ): Promise<TherapistResponse> {
    try {
      const { emotion, context } = this.detectEmotionAndContext(userMessage);
      const crisisLevel = this.assessCrisisLevel(userMessage);

      // Handle crisis situations immediately
      if (crisisLevel === 'critical' || crisisLevel === 'high') {
        const crisisResponse = this.getCrisisResponse(crisisLevel);
        return {
          message: crisisResponse,
          emotion: 'concerned',
          therapeuticTechnique: 'crisis_intervention',
          crisisLevel,
          followUpSuggestions: [
            'Contact a crisis helpline immediately',
            'Reach out to a trusted friend or family member',
            'Go to your nearest emergency room',
            'Call emergency services if in immediate danger'
          ]
        };
      }

      // Use Groq API if available, otherwise use fallback
      if (this.groq) {
        return await this.generateGroqResponse(userMessage, conversationHistory, emotion, context, crisisLevel);
      } else {
        return this.generateFallbackResponse(userMessage, emotion, context, crisisLevel);
      }

    } catch (error) {
      console.error('Error generating therapist response:', error);
      return this.generateFallbackResponse(userMessage, 'general', 'general', 'low');
    }
  }

  private async generateGroqResponse(
    userMessage: string,
    conversationHistory: TherapistMessage[],
    emotion: string,
    context: string,
    crisisLevel: 'low' | 'medium' | 'high' | 'critical'
  ): Promise<TherapistResponse> {
    if (!this.groq) throw new Error('Groq client not initialized');

    // Build conversation context
    const messages = [
      { role: 'system' as const, content: this.getSystemPrompt() },
      ...conversationHistory.slice(-6).map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      { 
        role: 'user' as const, 
        content: `[Context: ${context}, Emotion: ${emotion}, Crisis Level: ${crisisLevel}] ${userMessage}` 
      }
    ];

    const completion = await this.groq.chat.completions.create({
      messages,
      model: this.model,
      max_tokens: this.maxTokens,
      temperature: this.temperature,
      stream: false
    });

    const response = completion.choices[0]?.message?.content || this.getFallbackMessage(emotion);

    return {
      message: response,
      emotion: this.mapEmotionToTherapistEmotion(emotion),
      therapeuticTechnique: this.getTherapeuticTechnique(emotion, context),
      crisisLevel,
      followUpSuggestions: this.getFollowUpSuggestions(emotion, context)
    };
  }

  private generateFallbackResponse(
    userMessage: string,
    emotion: string,
    context: string,
    crisisLevel: 'low' | 'medium' | 'high' | 'critical'
  ): TherapistResponse {
    const prompts = this.getTherapeuticPrompts();
    const message = prompts[emotion as keyof typeof prompts] || prompts.general;

    return {
      message,
      emotion: this.mapEmotionToTherapistEmotion(emotion),
      therapeuticTechnique: this.getTherapeuticTechnique(emotion, context),
      crisisLevel,
      followUpSuggestions: this.getFollowUpSuggestions(emotion, context)
    };
  }

  private getCrisisResponse(crisisLevel: 'high' | 'critical'): string {
    if (crisisLevel === 'critical') {
      return "I'm deeply concerned about what you've shared with me. Your safety is the most important thing right now. Please reach out to a crisis helpline immediately at 988 (Suicide & Crisis Lifeline) or go to your nearest emergency room. You don't have to go through this alone - there are people trained to help you through this crisis.";
    } else {
      return "I hear that you're going through an incredibly difficult time, and I'm concerned about your wellbeing. While I'm here to support you, it's important that you also connect with a mental health professional who can provide more intensive support. Have you considered reaching out to a crisis helpline or scheduling an appointment with a therapist?";
    }
  }

  private mapEmotionToTherapistEmotion(userEmotion: string): string {
    const mapping: Record<string, string> = {
      anxiety: 'calming',
      depression: 'compassionate',
      anger: 'understanding',
      grief: 'gentle',
      stress: 'supportive',
      general: 'empathetic'
    };
    return mapping[userEmotion] || 'empathetic';
  }

  private getTherapeuticTechnique(emotion: string, context: string): string {
    const techniques: Record<string, string> = {
      anxiety: 'CBT_grounding_5_4_3_2_1',
      depression: 'behavioral_activation_CBT',
      anger: 'DBT_emotion_regulation',
      grief: 'grief_processing_therapy',
      stress: 'DBT_TIPP_technique',
      trauma: 'grounding_stabilization',
      relationship: 'DBT_interpersonal_effectiveness',
      work: 'CBT_stress_management',
      family: 'family_systems_approach',
      general: 'person_centered_active_listening'
    };
    return techniques[emotion] || 'supportive_conversation';
  }

  private getFollowUpSuggestions(emotion: string, context: string): string[] {
    const suggestions: Record<string, string[]> = {
      anxiety: [
        'Practice the 4-7-8 breathing technique (inhale 4, hold 7, exhale 8)',
        'Try progressive muscle relaxation starting with your toes',
        'Use the 5-4-3-2-1 grounding technique when anxiety peaks',
        'Challenge anxious thoughts: "Is this thought helpful or harmful?"',
        'Consider a guided meditation for anxiety relief'
      ],
      depression: [
        'Schedule one small pleasant activity today (behavioral activation)',
        'Practice three things you\'re grateful for (gratitude intervention)',
        'Take a 10-minute walk outside if possible (nature therapy)',
        'Reach out to one supportive person in your life',
        'Challenge negative self-talk with evidence-based thinking'
      ],
      stress: [
        'Try the DBT TIPP technique when overwhelmed',
        'Practice paced breathing for 5 minutes',
        'Use the "wise mind" DBT skill to make decisions',
        'Create a priority list using the urgent/important matrix',
        'Set boundaries using assertiveness techniques'
      ],
      anger: [
        'Use the DBT STOP skill (Stop, Take a breath, Observe, Proceed mindfully)',
        'Try opposite action - do something gentle when feeling angry',
        'Practice radical acceptance of things you cannot change',
        'Use "I" statements to express needs without blame',
        'Take a cooling-off period before responding'
      ],
      grief: [
        'Allow yourself to feel without judgment',
        'Create a memory ritual or keepsake',
        'Consider joining a grief support group',
        'Practice self-compassion during difficult moments',
        'Maintain routines while allowing for grief waves'
      ],
      trauma: [
        'Practice grounding techniques when triggered',
        'Use bilateral stimulation (butterfly hug or cross-lateral movements)',
        'Consider EMDR therapy with a qualified professional',
        'Create a safety plan for overwhelming moments',
        'Practice the "container" visualization for difficult memories'
      ],
      relationship: [
        'Use the DEARMAN skill for effective communication',
        'Practice validation of others\' perspectives',
        'Set healthy boundaries using assertiveness',
        'Consider couples therapy for relationship issues',
        'Work on emotional regulation before difficult conversations'
      ],
      general: [
        'Continue to check in with your feelings throughout the day',
        'Practice mindfulness meditation for 5-10 minutes',
        'Consider journaling about your thoughts and emotions',
        'Engage in self-care activities that nurture you',
        'Consider professional therapy for ongoing support'
      ]
    };
    return suggestions[emotion] || suggestions.general;
  }

  private getFallbackMessage(emotion: string): string {
    const messages: Record<string, string> = {
      anxiety: "I understand you're feeling anxious. That can be really overwhelming. Let's work through this together. What's helping you feel most grounded right now?",
      depression: "I hear the pain in what you're sharing. Depression can make everything feel so much harder. You're brave for reaching out. What's one small thing that might bring you a moment of comfort?",
      anger: "It sounds like you're feeling really angry about something. Anger often tells us that something important is being threatened. What do you think is underneath this feeling?",
      grief: "Grief is one of the most difficult experiences we can go through. There's no timeline for healing. How are you caring for yourself during this time?",
      stress: "It sounds like you're under a lot of pressure right now. Stress can feel overwhelming when it builds up. What feels most urgent to address?",
      general: "Thank you for sharing this with me. It takes courage to open up about difficult feelings. What would feel most helpful for you right now?"
    };
    return messages[emotion] || messages.general;
  }

  // Method to check if Groq API is configured
  isConfigured(): boolean {
    return this.groq !== null;
  }

  // Method to get configuration status
  getStatus(): { configured: boolean; model: string; fallbackMode: boolean } {
    return {
      configured: this.groq !== null,
      model: this.model,
      fallbackMode: this.groq === null
    };
  }
}

// Export singleton instance
export const aiTherapistService = new AITherapistService();
export default aiTherapistService;
