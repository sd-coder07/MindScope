// Enhanced Therapeutic Protocol Engine with Advanced Interventions
// Includes CBT, DBT, EMDR-informed techniques, and Mindfulness protocols

export type TherapeuticApproach = 'CBT' | 'DBT' | 'EMDR' | 'mindfulness' | 'ACT' | 'psychodynamic' | 'humanistic';
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
  audioScript?: string[];
  interactiveElements?: InteractiveElement[];
}

export interface InteractiveElement {
  type: 'breathing' | 'visualization' | 'movement' | 'reflection' | 'writing';
  instruction: string;
  duration?: number; // seconds
  audioGuidance?: string;
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

export interface EMDRTechnique extends TherapeuticTechnique {
  phase: 'preparation' | 'stabilization' | 'resource_installation' | 'grounding';
  bilateralStimulation: 'eye_movements' | 'tapping' | 'audio' | 'tactile';
  safetyProtocols: string[];
}

export interface MindfulnessPractice extends TherapeuticTechnique {
  practiceType: 'breathing' | 'body_scan' | 'loving_kindness' | 'observing' | 'grounding';
  guidedScript: string[];
  audioUrl?: string;
}

export class EnhancedTherapeuticProtocolEngine {
  private cbtTechniques: CBTTechnique[] = [];
  private dbtSkills: DBTSkill[] = [];
  private emdrTechniques: EMDRTechnique[] = [];
  private mindfulnessPractices: MindfulnessPractice[] = [];

  constructor() {
    this.initializeCBTTechniques();
    this.initializeDBTSkills();
    this.initializeEMDRTechniques();
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
        description: 'Identify and challenge negative automatic thoughts using evidence-based questioning.',
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
        timeRequired: 15,
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
        ],
        interactiveElements: [
          {
            type: 'reflection',
            instruction: 'Write down the triggering situation in detail',
            duration: 120
          },
          {
            type: 'reflection',
            instruction: 'List your automatic thoughts without judgment',
            duration: 180
          }
        ]
      },
      {
        id: 'cbt-behavioral-activation',
        name: 'Behavioral Activation',
        approach: 'CBT',
        category: ['depression', 'stress'],
        type: 'behavioral',
        description: 'Schedule meaningful activities to improve mood and break the cycle of depression.',
        instructions: [
          'Make a list of activities you used to enjoy',
          'Rate each activity for pleasure (P) and mastery (M) on a scale of 0-10',
          'Schedule 2-3 activities for the upcoming week',
          'Start with small, achievable activities',
          'Track your mood before and after each activity',
          'Notice patterns in what helps improve your mood',
          'Gradually increase activity level and complexity'
        ],
        timeRequired: 20,
        difficulty: 'beginner',
        effectivenessScore: 0.8,
        cognitiveDistortions: ['All-or-nothing thinking', 'Disqualifying the positive'],
        thoughtChallenge: [
          'What small step can I take today?',
          'How did I feel the last time I did this activity?',
          'What would happen if I just tried for 5 minutes?'
        ],
        behavioralExperiment: 'Track mood ratings before and after scheduled activities for one week'
      }
    ];
  }

  private initializeDBTSkills() {
    this.dbtSkills = [
      {
        id: 'dbt-tipp',
        name: 'TIPP Technique',
        approach: 'DBT',
        category: ['anxiety', 'anger', 'stress'],
        type: 'immediate',
        description: 'Quick distress tolerance skill to change body chemistry and reduce intense emotions.',
        instructions: [
          'Temperature: Use cold water on face or hold ice cubes',
          'Intense Exercise: Do jumping jacks or run in place for 10 minutes',
          'Paced Breathing: Breathe out longer than breathing in',
          'Paired Muscle Relaxation: Tense and release muscle groups'
        ],
        timeRequired: 10,
        difficulty: 'beginner',
        effectivenessScore: 0.9,
        skillModule: 'distress_tolerance',
        acronym: 'TIPP',
        steps: [
          'Choose one T.I.P.P. technique that feels most accessible right now',
          'If using Temperature: splash cold water on face or hold ice',
          'If using Intense exercise: do 10 minutes of cardio movement',
          'If using Paced breathing: exhale longer than your inhale',
          'If using Paired muscle relaxation: tense each muscle group for 5 seconds, then release'
        ],
        interactiveElements: [
          {
            type: 'breathing',
            instruction: 'Practice paced breathing: inhale for 4, exhale for 8',
            duration: 60,
            audioGuidance: 'Breathe in for 4 counts... now breathe out slowly for 8 counts...'
          }
        ]
      },
      {
        id: 'dbt-stop',
        name: 'STOP Skill',
        approach: 'DBT',
        category: ['anger', 'stress'],
        type: 'immediate',
        description: 'Mindfulness skill to pause and respond wisely instead of reacting impulsively.',
        instructions: [
          'Stop what you\'re doing',
          'Take a breath - one mindful breath',
          'Observe what\'s happening inside and outside you',
          'Proceed with awareness and your wise mind'
        ],
        timeRequired: 2,
        difficulty: 'beginner',
        effectivenessScore: 0.75,
        skillModule: 'mindfulness',
        acronym: 'STOP',
        steps: [
          'Literally stop your current activity',
          'Take one slow, deep breath',
          'Observe your thoughts, feelings, and body sensations',
          'Observe what\'s happening around you',
          'Proceed with intention rather than reaction'
        ]
      },
      {
        id: 'dbt-dearman',
        name: 'DEARMAN Communication',
        approach: 'DBT',
        category: ['relationship'],
        type: 'skill_building',
        description: 'Interpersonal effectiveness skill for getting your needs met in relationships.',
        instructions: [
          'Describe the situation objectively',
          'Express your feelings about the situation',
          'Assert what you want clearly',
          'Reinforce the benefits of getting what you want',
          'Mindful - stay focused on your goal',
          'Appear confident in your communication',
          'Negotiate when possible'
        ],
        timeRequired: 15,
        difficulty: 'intermediate',
        effectivenessScore: 0.82,
        skillModule: 'interpersonal_effectiveness',
        acronym: 'DEARMAN',
        steps: [
          'Write out the facts of the situation without opinions',
          'Identify and name your emotions about it',
          'State clearly what you want or need',
          'Explain how this benefits both parties',
          'Stay focused on your main point',
          'Use confident body language and tone',
          'Be open to compromise when appropriate'
        ]
      }
    ];
  }

  private initializeEMDRTechniques() {
    this.emdrTechniques = [
      {
        id: 'emdr-butterfly-hug',
        name: 'Butterfly Hug Self-Soothing',
        approach: 'EMDR',
        category: ['trauma', 'anxiety', 'stress'],
        type: 'immediate',
        description: 'Self-administered bilateral stimulation technique for calming and grounding.',
        instructions: [
          'Cross your arms over your chest',
          'Place hands on opposite shoulders',
          'Alternately tap your shoulders with your hands',
          'Tap slowly and gently like butterfly wings',
          'Breathe deeply while tapping',
          'Continue for 1-2 minutes or until calm'
        ],
        timeRequired: 5,
        difficulty: 'beginner',
        effectivenessScore: 0.78,
        phase: 'stabilization',
        bilateralStimulation: 'tapping',
        safetyProtocols: [
          'Stop if you feel overwhelmed',
          'Ground yourself by naming 5 things you can see',
          'Remember you are safe in the present moment',
          'Seek professional help for trauma processing'
        ],
        audioScript: [
          'Cross your arms over your chest and place your hands on your shoulders',
          'Begin tapping alternately, like gentle butterfly wings',
          'Breathe slowly and deeply as you tap',
          'Let yourself feel grounded and safe',
          'Continue this soothing rhythm'
        ],
        interactiveElements: [
          {
            type: 'movement',
            instruction: 'Practice the butterfly hug tapping motion',
            duration: 60,
            audioGuidance: 'Tap gently and rhythmically, feeling the calming bilateral stimulation'
          }
        ]
      },
      {
        id: 'emdr-safe-place',
        name: 'Safe Place Visualization',
        approach: 'EMDR',
        category: ['trauma', 'anxiety'],
        type: 'emotional_regulation',
        description: 'Create and strengthen a mental safe place for emotional regulation.',
        instructions: [
          'Close your eyes and imagine a place where you feel completely safe',
          'This can be real or imaginary - wherever you feel most peaceful',
          'Notice all the details: what you see, hear, smell, feel',
          'Notice the positive feelings this place brings up',
          'Add bilateral stimulation by tapping your knees alternately',
          'Hold this image and feeling for several minutes',
          'Practice returning to this place when needed'
        ],
        timeRequired: 10,
        difficulty: 'beginner',
        effectivenessScore: 0.85,
        phase: 'resource_installation',
        bilateralStimulation: 'tapping',
        safetyProtocols: [
          'Choose a place that feels completely safe and peaceful',
          'If distressing images arise, open your eyes and ground yourself',
          'This is a resource to return to when feeling overwhelmed',
          'Practice strengthening this image regularly'
        ]
      }
    ];
  }

  private initializeMindfulnessPractices() {
    this.mindfulnessPractices = [
      {
        id: 'mindfulness-5-4-3-2-1',
        name: '5-4-3-2-1 Grounding',
        approach: 'mindfulness',
        category: ['anxiety', 'trauma', 'stress'],
        type: 'immediate',
        description: 'Sensory grounding technique to bring awareness to the present moment.',
        instructions: [
          'Name 5 things you can see around you',
          'Name 4 things you can touch or feel',
          'Name 3 things you can hear',
          'Name 2 things you can smell',
          'Name 1 thing you can taste'
        ],
        timeRequired: 5,
        difficulty: 'beginner',
        effectivenessScore: 0.88,
        practiceType: 'grounding',
        guidedScript: [
          'Let\'s ground ourselves in the present moment using our senses',
          'Look around and name 5 things you can see... take your time',
          'Now notice 4 things you can touch or feel... your clothes, the chair, the air',
          'Listen carefully and identify 3 sounds you can hear',
          'Take a gentle breath and notice 2 things you can smell',
          'Finally, notice 1 thing you can taste, perhaps just in your mouth',
          'You are here, you are present, you are safe'
        ],
        interactiveElements: [
          {
            type: 'reflection',
            instruction: 'Look around and mentally note 5 things you can see',
            duration: 30
          }
        ]
      },
      {
        id: 'mindfulness-body-scan',
        name: 'Progressive Body Scan',
        approach: 'mindfulness',
        category: ['stress', 'anxiety'],
        type: 'emotional_regulation',
        description: 'Systematic attention to body sensations for relaxation and awareness.',
        instructions: [
          'Lie down or sit comfortably',
          'Start with your toes and work upward',
          'Notice sensations in each body part',
          'Breathe into areas of tension',
          'Release and relax each area',
          'End with whole-body awareness'
        ],
        timeRequired: 15,
        difficulty: 'beginner',
        effectivenessScore: 0.83,
        practiceType: 'body_scan',
        guidedScript: [
          'Find a comfortable position and close your eyes if you\'d like',
          'Begin by noticing your toes... wiggle them gently, then let them relax',
          'Move up to your feet and ankles... notice any sensations',
          'Continue up through your calves and knees',
          'Feel your thighs and hips... breathe into any tension',
          'Notice your abdomen rising and falling with each breath',
          'Feel your chest, shoulders, and arms',
          'Notice your neck and head... let your jaw soften',
          'Take a moment to feel your whole body, relaxed and at peace'
        ]
      }
    ];
  }

  // Get personalized technique recommendations
  getRecommendedTechniques(
    emotions: EmotionCategory[],
    severity: number,
    timeAvailable: number,
    preferredApproaches: TherapeuticApproach[] = []
  ): TherapeuticTechnique[] {
    const allTechniques = [
      ...this.cbtTechniques,
      ...this.dbtSkills,
      ...this.emdrTechniques,
      ...this.mindfulnessPractices
    ];

    let filtered = allTechniques.filter(technique => {
      // Match emotions
      const emotionMatch = emotions.some(emotion => 
        technique.category.includes(emotion)
      );
      
      // Match time available
      const timeMatch = technique.timeRequired <= timeAvailable;
      
      // Match preferred approaches (if specified)
      const approachMatch = preferredApproaches.length === 0 || 
        preferredApproaches.includes(technique.approach);

      return emotionMatch && timeMatch && approachMatch;
    });

    // Prioritize by severity and effectiveness
    if (severity >= 8) {
      // High severity - prioritize immediate interventions
      filtered = filtered.filter(t => t.type === 'immediate')
        .sort((a, b) => b.effectivenessScore - a.effectivenessScore);
    } else {
      // Lower severity - include skill-building techniques
      filtered = filtered.sort((a, b) => {
        // Prioritize immediate techniques, then by effectiveness
        if (a.type === 'immediate' && b.type !== 'immediate') return -1;
        if (b.type === 'immediate' && a.type !== 'immediate') return 1;
        return b.effectivenessScore - a.effectivenessScore;
      });
    }

    return filtered.slice(0, 5); // Return top 5 recommendations
  }

  // Get technique by ID
  getTechniqueById(id: string): TherapeuticTechnique | null {
    const allTechniques = [
      ...this.cbtTechniques,
      ...this.dbtSkills,
      ...this.emdrTechniques,
      ...this.mindfulnessPractices
    ];

    return allTechniques.find(technique => technique.id === id) || null;
  }

  // Get all techniques by approach
  getTechniquesByApproach(approach: TherapeuticApproach): TherapeuticTechnique[] {
    switch (approach) {
      case 'CBT':
        return this.cbtTechniques;
      case 'DBT':
        return this.dbtSkills;
      case 'EMDR':
        return this.emdrTechniques;
      case 'mindfulness':
        return this.mindfulnessPractices;
      default:
        return [];
    }
  }
}

export default EnhancedTherapeuticProtocolEngine;
