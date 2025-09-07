// TODO 5: Therapeutic Protocol Engine
// Advanced therapeutic frameworks with CBT, DBT, mindfulness, and dynamic technique selection

export type TherapeuticApproach = 'CBT' | 'DBT' | 'ACT' | 'mindfulness' | 'psychodynamic' | 'humanistic' | 'somatic';
export type EmotionCategory = 'anxiety' | 'depression' | 'anger' | 'grief' | 'trauma' | 'stress' | 'relationship' | 'self_esteem';
export type InterventionType = 'immediate' | 'skill_building' | 'insight' | 'behavioral' | 'cognitive' | 'emotional_regulation';

export interface TherapeuticTechnique {
  id: string;
  name: string;
  approach: TherapeuticApproach;
  category: EmotionCategory[];
  type: InterventionType;
  description: string;
  instructions: string[];
  timeRequired: number; // minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  effectivenessScore: number; // 0-1
  contraindications?: string[];
}

export interface CBTTechnique extends TherapeuticTechnique {
  cognitiveDistortions: string[];
  thoughtChallenge: string[];
  behavioralExperiment?: string;
}

export interface DBTSkill extends TherapeuticTechnique {
  skillModule: 'mindfulness' | 'distress_tolerance' | 'emotion_regulation' | 'interpersonal_effectiveness';
  acronym?: string;
  steps: string[];
}

export interface MindfulnessPractice extends TherapeuticTechnique {
  practiceType: 'breathing' | 'body_scan' | 'loving_kindness' | 'observing' | 'grounding';
  guidedScript: string;
  audioUrl?: string;
}

export interface TherapeuticSession {
  userId: string;
  sessionId: string;
  startTime: Date;
  currentIssue: string;
  emotionalState: EmotionCategory[];
  selectedApproaches: TherapeuticApproach[];
  appliedTechniques: string[];
  userFeedback: { techniqueId: string; effectiveness: number; notes?: string; }[];
  progressNotes: string;
  nextSessionGoals: string[];
}

export class TherapeuticProtocolEngine {
  private cbtTechniques: CBTTechnique[] = [];
  private dbtSkills: DBTSkill[] = [];
  private mindfulnessPractices: MindfulnessPractice[] = [];
  private sessionHistory: Map<string, TherapeuticSession[]> = new Map();

  constructor() {
    this.initializeCBTTechniques();
    this.initializeDBTSkills();
    this.initializeMindfulnessPractices();
  }

  private initializeCBTTechniques() {
    this.cbtTechniques = [
      {
        id: 'cbt-thought-record',
        name: 'Thought Record',
        approach: 'CBT',
        category: ['anxiety', 'depression', 'stress'],
        type: 'cognitive',
        description: 'Identify and challenge negative thought patterns by examining evidence for and against automatic thoughts.',
        instructions: [
          'Identify the triggering situation or event',
          'Notice your immediate automatic thoughts',
          'Rate the intensity of your emotions (0-10)',
          'Identify the emotion(s) you\'re experiencing',
          'Look for evidence that supports your thought',
          'Look for evidence that contradicts your thought',
          'Develop a more balanced, realistic thought',
          'Re-rate your emotional intensity'
        ],
        timeRequired: 10,
        difficulty: 'beginner',
        effectivenessScore: 0.85,
        cognitiveDistortions: [
          'All-or-nothing thinking',
          'Catastrophizing',
          'Mind reading',
          'Fortune telling',
          'Emotional reasoning',
          'Should statements',
          'Labeling',
          'Personalization'
        ],
        thoughtChallenge: [
          'What evidence do I have for this thought?',
          'What evidence contradicts this thought?',
          'What would I tell a friend in this situation?',
          'Am I looking at the whole picture?',
          'What are alternative ways to view this situation?'
        ]
      },
      {
        id: 'cbt-behavioral-activation',
        name: 'Behavioral Activation',
        approach: 'CBT',
        category: ['depression', 'stress'],
        type: 'behavioral',
        description: 'Schedule meaningful and pleasurable activities to improve mood and break the cycle of depression.',
        instructions: [
          'Make a list of activities you used to enjoy',
          'Rate each activity for pleasure (P) and mastery (M) on a scale of 0-10',
          'Schedule 2-3 activities for the upcoming week',
          'Start with small, achievable activities',
          'Track your mood before and after each activity',
          'Notice patterns in what helps improve your mood',
          'Gradually increase activity level and complexity'
        ],
        timeRequired: 15,
        difficulty: 'beginner',
        effectivenessScore: 0.8,
        cognitiveDistortions: ['All-or-nothing thinking', 'Disqualifying the positive'],
        thoughtChallenge: [
          'What small step can I take today?',
          'How did I feel the last time I did this activity?',
          'What would happen if I just tried for 5 minutes?'
        ],
        behavioralExperiment: 'Track mood ratings before and after scheduled activities for one week'
      },
      {
        id: 'cbt-cognitive-restructuring',
        name: 'Cognitive Restructuring',
        approach: 'CBT',
        category: ['anxiety', 'depression', 'anger', 'self_esteem'],
        type: 'cognitive',
        description: 'Systematically identify, evaluate, and modify dysfunctional thought patterns.',
        instructions: [
          'Identify the problematic thought or belief',
          'Examine the thought for cognitive distortions',
          'Gather evidence for and against the thought',
          'Consider alternative perspectives',
          'Develop a more balanced thought',
          'Test the new thought through behavioral experiments',
          'Practice the new thinking pattern regularly'
        ],
        timeRequired: 20,
        difficulty: 'intermediate',
        effectivenessScore: 0.88,
        cognitiveDistortions: [
          'Mental filtering',
          'Jumping to conclusions',
          'Magnification/minimization',
          'Overgeneralization'
        ],
        thoughtChallenge: [
          'Is this thought helpful or unhelpful?',
          'What would be a more balanced way to think about this?',
          'How would someone else view this situation?',
          'What advice would I give someone else?'
        ]
      }
    ];
  }

  private initializeDBTSkills() {
    this.dbtSkills = [
      {
        id: 'dbt-tipp',
        name: 'TIPP (Temperature, Intense Exercise, Paced Breathing, Paired Muscle Relaxation)',
        approach: 'DBT',
        category: ['anxiety', 'anger', 'trauma'],
        type: 'immediate',
        description: 'Crisis survival technique to quickly change body chemistry and reduce intense emotions.',
        instructions: [
          'Use when emotions feel overwhelming (8-10 intensity)',
          'Choose one TIPP technique to implement immediately',
          'Practice the technique until emotional intensity decreases',
          'Use other skills once emotions are more manageable'
        ],
        timeRequired: 5,
        difficulty: 'beginner',
        effectivenessScore: 0.82,
        skillModule: 'distress_tolerance',
        acronym: 'TIPP',
        steps: [
          'T - Temperature: Hold ice cubes, splash cold water on face, or take a cold shower',
          'I - Intense Exercise: Do jumping jacks, run in place, or do pushups for 10 minutes',
          'P - Paced Breathing: Breathe out longer than you breathe in (4 in, 6 out)',
          'P - Paired Muscle Relaxation: Tense and release different muscle groups'
        ]
      },
      {
        id: 'dbt-please',
        name: 'PLEASE (Physical Health)',
        approach: 'DBT',
        category: ['depression', 'anxiety', 'stress'],
        type: 'skill_building',
        description: 'Maintain physical health to support emotional regulation and reduce vulnerability to negative emotions.',
        instructions: [
          'Assess your current physical health habits',
          'Choose one PLEASE area to focus on this week',
          'Make small, achievable changes',
          'Track your mood in relation to physical health changes',
          'Gradually incorporate all PLEASE elements'
        ],
        timeRequired: 30,
        difficulty: 'beginner',
        effectivenessScore: 0.75,
        skillModule: 'emotion_regulation',
        acronym: 'PLEASE',
        steps: [
          'P - Treat Physical illness: Take medications, see doctors when needed',
          'L - Balance eating: Eat regularly, avoid emotional eating',
          'E - Avoid mood-Altering substances: Limit alcohol, drugs, caffeine',
          'A - Balance sleep: 7-9 hours per night, consistent sleep schedule',
          'S - Get Exercise: 30 minutes of movement daily',
          'E - Build mastery: Do activities that make you feel competent'
        ]
      },
      {
        id: 'dbt-wise-mind',
        name: 'Wise Mind',
        approach: 'DBT',
        category: ['anxiety', 'anger', 'relationship', 'self_esteem'],
        type: 'insight',
        description: 'Access the wise part of yourself that integrates emotional and rational thinking.',
        instructions: [
          'Find a quiet space and sit comfortably',
          'Take several deep breaths to center yourself',
          'Notice your emotional mind (what you feel)',
          'Notice your rational mind (what you think)',
          'Ask yourself: "What does my wise mind know about this situation?"',
          'Listen for the answer that feels both true and helpful',
          'Trust the wisdom that emerges'
        ],
        timeRequired: 10,
        difficulty: 'intermediate',
        effectivenessScore: 0.85,
        skillModule: 'mindfulness',
        steps: [
          'Recognize when you\'re in emotional mind (all feelings, impulsive)',
          'Recognize when you\'re in rational mind (all logic, disconnected from feelings)',
          'Practice accessing wise mind through meditation and reflection',
          'Ask wise mind questions before making important decisions',
          'Trust the balanced perspective that emerges'
        ]
      },
      {
        id: 'dbt-interpersonal-dear-man',
        name: 'DEAR MAN (Interpersonal Effectiveness)',
        approach: 'DBT',
        category: ['relationship', 'anger', 'self_esteem'],
        type: 'skill_building',
        description: 'Effectively communicate your needs and set boundaries in relationships.',
        instructions: [
          'Identify what you want to achieve in the interaction',
          'Prepare what you want to say using DEAR MAN structure',
          'Choose an appropriate time and place for the conversation',
          'Deliver your message calmly and clearly',
          'Stay focused on your objective',
          'Be willing to negotiate while maintaining your core needs'
        ],
        timeRequired: 15,
        difficulty: 'intermediate',
        effectivenessScore: 0.83,
        skillModule: 'interpersonal_effectiveness',
        acronym: 'DEAR MAN',
        steps: [
          'D - Describe the situation objectively',
          'E - Express your feelings and opinions',
          'A - Assert your needs clearly',
          'R - Reinforce the benefits of getting what you want',
          'M - Stay Mindful of your goal',
          'A - Appear confident in your communication',
          'N - Negotiate when possible'
        ]
      }
    ];
  }

  private initializeMindfulnessPractices() {
    this.mindfulnessPractices = [
      {
        id: 'mindfulness-breathing-anchor',
        name: 'Breathing Anchor',
        approach: 'mindfulness',
        category: ['anxiety', 'stress'],
        type: 'immediate',
        description: 'Use your breath as an anchor to the present moment, reducing anxiety and stress.',
        instructions: [
          'Find a comfortable position sitting or lying down',
          'Close your eyes or soften your gaze',
          'Bring attention to your natural breath',
          'Notice the sensation of breathing in and out',
          'When your mind wanders, gently return to the breath',
          'Continue for the desired duration'
        ],
        timeRequired: 5,
        difficulty: 'beginner',
        effectivenessScore: 0.78,
        practiceType: 'breathing',
        guidedScript: 'Allow your breathing to find its natural rhythm... Notice the air entering through your nose... Feel your chest and belly gently rising... As you exhale, release any tension you may be holding... Each breath is an opportunity to return to this moment...'
      },
      {
        id: 'mindfulness-body-scan',
        name: 'Progressive Body Scan',
        approach: 'mindfulness',
        category: ['stress', 'trauma', 'anxiety'],
        type: 'emotional_regulation',
        description: 'Systematically bring awareness to different parts of your body to release tension and increase body awareness.',
        instructions: [
          'Lie down comfortably or sit in a supportive chair',
          'Start with your toes and slowly move up your body',
          'Notice sensations in each body part without trying to change anything',
          'Breathe into areas of tension or discomfort',
          'If you notice numbness or disconnection, that\'s okay too',
          'End by noticing your whole body as one connected system'
        ],
        timeRequired: 20,
        difficulty: 'beginner',
        effectivenessScore: 0.81,
        practiceType: 'body_scan',
        guidedScript: 'Begin by noticing your toes... Are they warm or cool? Tense or relaxed?... Move your attention to your feet, ankles, calves... Notice without judgment... Breathe into any areas that feel tight... Continue up through your thighs, hips, lower back...'
      },
      {
        id: 'mindfulness-loving-kindness',
        name: 'Loving-Kindness Meditation',
        approach: 'mindfulness',
        category: ['depression', 'self_esteem', 'relationship'],
        type: 'emotional_regulation',
        description: 'Cultivate feelings of compassion and love for yourself and others.',
        instructions: [
          'Sit comfortably and bring to mind an image of yourself',
          'Silently repeat phrases of loving-kindness to yourself',
          'Then bring to mind someone you love and repeat the phrases',
          'Continue with a neutral person, then someone difficult',
          'End by sending loving-kindness to all beings everywhere',
          'Notice any resistance with compassion'
        ],
        timeRequired: 15,
        difficulty: 'intermediate',
        effectivenessScore: 0.84,
        practiceType: 'loving_kindness',
        guidedScript: 'May I be happy... May I be healthy... May I be at peace... May I live with ease... Now bring to mind someone you care about... May you be happy... May you be healthy... May you be at peace...'
      },
      {
        id: 'mindfulness-grounding-5-4-3-2-1',
        name: '5-4-3-2-1 Grounding Technique',
        approach: 'mindfulness',
        category: ['anxiety', 'trauma', 'stress'],
        type: 'immediate',
        description: 'Use your five senses to ground yourself in the present moment during anxiety or dissociation.',
        instructions: [
          'Look around and name 5 things you can see',
          'Notice 4 things you can touch or feel',
          'Listen for 3 things you can hear',
          'Identify 2 things you can smell',
          'Notice 1 thing you can taste',
          'Take a deep breath and notice how you feel now'
        ],
        timeRequired: 3,
        difficulty: 'beginner',
        effectivenessScore: 0.86,
        practiceType: 'grounding',
        guidedScript: 'Right now, look around you and find 5 things you can see... Name them to yourself... Now notice 4 things you can touch... Feel the texture, temperature... Listen carefully for 3 sounds around you... Take a moment to notice 2 scents... And finally, one thing you can taste...'
      }
    ];
  }

  // Dynamic technique selection based on user state and preferences
  public selectOptimalTechniques(
    emotionalState: EmotionCategory[],
    intensity: number,
    timeAvailable: number,
    userPreferences: { preferredApproaches?: TherapeuticApproach[]; difficulty?: 'beginner' | 'intermediate' | 'advanced' },
    previousTechniques: string[] = []
  ): TherapeuticTechnique[] {
    const allTechniques: TherapeuticTechnique[] = [
      ...this.cbtTechniques,
      ...this.dbtSkills,
      ...this.mindfulnessPractices
    ];

    // Filter techniques based on criteria
    let suitableTechniques = allTechniques.filter(technique => {
      // Match emotional categories
      const matchesEmotion = technique.category.some(cat => emotionalState.includes(cat));
      
      // Match time availability
      const fitsTimeframe = technique.timeRequired <= timeAvailable;
      
      // Match difficulty preference
      const matchesDifficulty = !userPreferences.difficulty || technique.difficulty === userPreferences.difficulty;
      
      // Match approach preference
      const matchesApproach = !userPreferences.preferredApproaches || 
        userPreferences.preferredApproaches.includes(technique.approach);
      
      // Avoid recently used techniques (for variety)
      const isNovel = !previousTechniques.includes(technique.id);
      
      return matchesEmotion && fitsTimeframe && matchesDifficulty && matchesApproach && isNovel;
    });

    // If intensity is high (8-10), prioritize immediate intervention techniques
    if (intensity >= 8) {
      suitableTechniques = suitableTechniques.filter(t => t.type === 'immediate');
    }

    // Sort by effectiveness score and return top 3
    suitableTechniques.sort((a, b) => b.effectivenessScore - a.effectivenessScore);
    
    return suitableTechniques.slice(0, 3);
  }

  // Get specific technique by approach type
  public getCBTTechniques(emotionalState?: EmotionCategory[]): CBTTechnique[] {
    if (!emotionalState) return this.cbtTechniques;
    return this.cbtTechniques.filter(technique => 
      technique.category.some(cat => emotionalState.includes(cat))
    );
  }

  public getDBTSkills(module?: 'mindfulness' | 'distress_tolerance' | 'emotion_regulation' | 'interpersonal_effectiveness'): DBTSkill[] {
    if (!module) return this.dbtSkills;
    return this.dbtSkills.filter(skill => skill.skillModule === module);
  }

  public getMindfulnessPractices(practiceType?: 'breathing' | 'body_scan' | 'loving_kindness' | 'observing' | 'grounding'): MindfulnessPractice[] {
    if (!practiceType) return this.mindfulnessPractices;
    return this.mindfulnessPractices.filter(practice => practice.practiceType === practiceType);
  }

  // Session management
  public startTherapeuticSession(userId: string, currentIssue: string, emotionalState: EmotionCategory[]): string {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session: TherapeuticSession = {
      userId,
      sessionId,
      startTime: new Date(),
      currentIssue,
      emotionalState,
      selectedApproaches: [],
      appliedTechniques: [],
      userFeedback: [],
      progressNotes: '',
      nextSessionGoals: []
    };

    if (!this.sessionHistory.has(userId)) {
      this.sessionHistory.set(userId, []);
    }
    this.sessionHistory.get(userId)!.push(session);

    return sessionId;
  }

  public recordTechniqueApplication(userId: string, sessionId: string, techniqueId: string): void {
    const userSessions = this.sessionHistory.get(userId);
    if (userSessions) {
      const session = userSessions.find(s => s.sessionId === sessionId);
      if (session) {
        session.appliedTechniques.push(techniqueId);
      }
    }
  }

  public recordUserFeedback(
    userId: string, 
    sessionId: string, 
    techniqueId: string, 
    effectiveness: number, 
    notes?: string
  ): void {
    const userSessions = this.sessionHistory.get(userId);
    if (userSessions) {
      const session = userSessions.find(s => s.sessionId === sessionId);
      if (session) {
        session.userFeedback.push({ techniqueId, effectiveness, notes });
      }
    }
  }

  // Analytics and adaptation
  public getUserTechniqueEffectiveness(userId: string): { [techniqueId: string]: number } {
    const userSessions = this.sessionHistory.get(userId) || [];
    const effectiveness: { [techniqueId: string]: number[] } = {};

    userSessions.forEach(session => {
      session.userFeedback.forEach(feedback => {
        if (!effectiveness[feedback.techniqueId]) {
          effectiveness[feedback.techniqueId] = [];
        }
        effectiveness[feedback.techniqueId].push(feedback.effectiveness);
      });
    });

    // Calculate average effectiveness for each technique
    const averageEffectiveness: { [techniqueId: string]: number } = {};
    Object.keys(effectiveness).forEach(techniqueId => {
      const scores = effectiveness[techniqueId];
      averageEffectiveness[techniqueId] = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    });

    return averageEffectiveness;
  }

  public getPersonalizedRecommendations(userId: string, currentEmotionalState: EmotionCategory[]): TherapeuticTechnique[] {
    const userEffectiveness = this.getUserTechniqueEffectiveness(userId);
    const recentTechniques = this.getRecentlyUsedTechniques(userId, 5);

    return this.selectOptimalTechniques(
      currentEmotionalState,
      5, // moderate intensity
      20, // 20 minutes available
      { preferredApproaches: this.getUserPreferredApproaches(userId) },
      recentTechniques
    );
  }

  private getRecentlyUsedTechniques(userId: string, count: number): string[] {
    const userSessions = this.sessionHistory.get(userId) || [];
    const recentSessions = userSessions.slice(-3); // Last 3 sessions
    const recentTechniques: string[] = [];

    recentSessions.forEach(session => {
      recentTechniques.push(...session.appliedTechniques);
    });

    return recentTechniques.slice(-count);
  }

  private getUserPreferredApproaches(userId: string): TherapeuticApproach[] {
    const userEffectiveness = this.getUserTechniqueEffectiveness(userId);
    const allTechniques: TherapeuticTechnique[] = [
      ...this.cbtTechniques,
      ...this.dbtSkills,
      ...this.mindfulnessPractices
    ];

    const approachEffectiveness: { [approach: string]: number[] } = {};

    Object.keys(userEffectiveness).forEach(techniqueId => {
      const technique = allTechniques.find(t => t.id === techniqueId);
      if (technique) {
        if (!approachEffectiveness[technique.approach]) {
          approachEffectiveness[technique.approach] = [];
        }
        approachEffectiveness[technique.approach].push(userEffectiveness[techniqueId]);
      }
    });

    // Calculate average effectiveness by approach and return top approaches
    const avgApproachEffectiveness = Object.keys(approachEffectiveness).map(approach => ({
      approach: approach as TherapeuticApproach,
      effectiveness: approachEffectiveness[approach].reduce((sum, score) => sum + score, 0) / approachEffectiveness[approach].length
    }));

    return avgApproachEffectiveness
      .sort((a, b) => b.effectiveness - a.effectiveness)
      .slice(0, 3)
      .map(item => item.approach);
  }
}

export default TherapeuticProtocolEngine;
