// TODO 6: Safety Systems - Crisis Detection, Risk Assessment & Professional Referrals
// Comprehensive safety protocols for mental health crisis intervention and professional support

export type RiskLevel = 'low' | 'moderate' | 'high' | 'imminent';
export type CrisisType = 'suicide' | 'self_harm' | 'psychosis' | 'substance_abuse' | 'domestic_violence' | 'eating_disorder' | 'severe_anxiety' | 'severe_depression';
export type InterventionType = 'immediate' | 'urgent' | 'routine' | 'monitoring';

export interface CrisisIndicator {
  keyword: string;
  weight: number; // 0-1 scale for crisis severity contribution
  category: CrisisType;
  context?: string[]; // Additional context words that increase relevance
}

export interface RiskAssessment {
  riskLevel: RiskLevel;
  crisisTypes: CrisisType[];
  confidence: number;
  triggerKeywords: string[];
  recommendedAction: InterventionType;
  immediateSteps: string[];
  professionalReferrals: ProfessionalResource[];
  timeframe: string; // When action should be taken
}

export interface ProfessionalResource {
  type: 'crisis_hotline' | 'emergency' | 'therapist' | 'psychiatrist' | 'support_group' | 'medical';
  name: string;
  phone?: string;
  website?: string;
  availability: '24/7' | 'business_hours' | 'varies';
  description: string;
  cost: 'free' | 'varies' | 'insurance_based';
  languages: string[];
}

export interface SafetyPlan {
  userId: string;
  warningSignals: string[];
  copingStrategies: string[];
  supportContacts: {
    name: string;
    relationship: string;
    phone: string;
    available: string;
  }[];
  professionalContacts: ProfessionalResource[];
  environmentalSafety: string[];
  reasonsForLiving: string[];
  createdAt: Date;
  lastUpdated: Date;
}

export interface CrisisResponse {
  isImmediate: boolean;
  riskAssessment: RiskAssessment;
  safetyPlan?: SafetyPlan;
  immediateResponse: string;
  followUpActions: string[];
  documentation: {
    timestamp: Date;
    triggerMessage: string;
    responseGiven: string;
    escalationRequired: boolean;
  };
}

export class SafetySystem {
  private crisisIndicators: CrisisIndicator[] = [];
  private professionalResources: ProfessionalResource[] = [];
  private safetyPlans: Map<string, SafetyPlan> = new Map();

  constructor() {
    this.initializeCrisisIndicators();
    this.initializeProfessionalResources();
  }

  private initializeCrisisIndicators() {
    this.crisisIndicators = [
      // High-risk suicide indicators
      { keyword: 'kill myself', weight: 1.0, category: 'suicide' },
      { keyword: 'end my life', weight: 1.0, category: 'suicide' },
      { keyword: 'suicide', weight: 0.9, category: 'suicide' },
      { keyword: 'suicidal', weight: 0.9, category: 'suicide' },
      { keyword: 'want to die', weight: 0.9, category: 'suicide' },
      { keyword: 'better off dead', weight: 0.8, category: 'suicide' },
      { keyword: 'end it all', weight: 0.8, category: 'suicide' },
      { keyword: 'no way out', weight: 0.7, category: 'suicide', context: ['hopeless', 'trapped', 'pain'] },
      { keyword: 'can\'t go on', weight: 0.7, category: 'suicide' },
      { keyword: 'goodbye forever', weight: 0.8, category: 'suicide' },
      { keyword: 'final goodbye', weight: 0.8, category: 'suicide' },

      // Self-harm indicators
      { keyword: 'cut myself', weight: 0.8, category: 'self_harm' },
      { keyword: 'hurt myself', weight: 0.7, category: 'self_harm' },
      { keyword: 'self harm', weight: 0.8, category: 'self_harm' },
      { keyword: 'cutting', weight: 0.6, category: 'self_harm', context: ['arms', 'wrists', 'legs'] },
      { keyword: 'burn myself', weight: 0.8, category: 'self_harm' },
      { keyword: 'razor', weight: 0.5, category: 'self_harm', context: ['cut', 'hurt', 'pain'] },

      // Psychosis indicators
      { keyword: 'hearing voices', weight: 0.9, category: 'psychosis' },
      { keyword: 'voices telling me', weight: 0.9, category: 'psychosis' },
      { keyword: 'seeing things', weight: 0.8, category: 'psychosis' },
      { keyword: 'hallucinations', weight: 0.9, category: 'psychosis' },
      { keyword: 'paranoid', weight: 0.6, category: 'psychosis', context: ['watching', 'following', 'conspiracy'] },
      { keyword: 'delusions', weight: 0.8, category: 'psychosis' },

      // Substance abuse indicators
      { keyword: 'overdose', weight: 0.9, category: 'substance_abuse' },
      { keyword: 'too many pills', weight: 0.8, category: 'substance_abuse' },
      { keyword: 'drinking too much', weight: 0.6, category: 'substance_abuse' },
      { keyword: 'addicted', weight: 0.7, category: 'substance_abuse' },
      { keyword: 'can\'t stop using', weight: 0.8, category: 'substance_abuse' },

      // Domestic violence indicators
      { keyword: 'hitting me', weight: 0.8, category: 'domestic_violence' },
      { keyword: 'abusing me', weight: 0.8, category: 'domestic_violence' },
      { keyword: 'afraid of him', weight: 0.7, category: 'domestic_violence' },
      { keyword: 'afraid of her', weight: 0.7, category: 'domestic_violence' },
      { keyword: 'violent partner', weight: 0.8, category: 'domestic_violence' },
      { keyword: 'domestic abuse', weight: 0.9, category: 'domestic_violence' },

      // Eating disorder indicators
      { keyword: 'starving myself', weight: 0.8, category: 'eating_disorder' },
      { keyword: 'purging', weight: 0.8, category: 'eating_disorder' },
      { keyword: 'binge eating', weight: 0.6, category: 'eating_disorder' },
      { keyword: 'anorexia', weight: 0.8, category: 'eating_disorder' },
      { keyword: 'bulimia', weight: 0.8, category: 'eating_disorder' },

      // Severe anxiety indicators
      { keyword: 'panic attacks', weight: 0.6, category: 'severe_anxiety' },
      { keyword: 'can\'t breathe', weight: 0.7, category: 'severe_anxiety', context: ['anxiety', 'panic', 'scared'] },
      { keyword: 'heart racing', weight: 0.5, category: 'severe_anxiety', context: ['anxiety', 'panic', 'fear'] },
      { keyword: 'agoraphobia', weight: 0.7, category: 'severe_anxiety' },

      // Severe depression indicators
      { keyword: 'completely hopeless', weight: 0.8, category: 'severe_depression' },
      { keyword: 'no point living', weight: 0.9, category: 'severe_depression' },
      { keyword: 'worthless', weight: 0.6, category: 'severe_depression', context: ['life', 'existence', 'myself'] },
      { keyword: 'can\'t function', weight: 0.7, category: 'severe_depression' }
    ];
  }

  private initializeProfessionalResources() {
    this.professionalResources = [
      // Crisis Hotlines
      {
        type: 'crisis_hotline',
        name: 'National Suicide Prevention Lifeline',
        phone: '988',
        website: 'https://suicidepreventionlifeline.org',
        availability: '24/7',
        description: 'Free, confidential crisis support for people in suicidal crisis or emotional distress',
        cost: 'free',
        languages: ['English', 'Spanish']
      },
      {
        type: 'crisis_hotline',
        name: 'Crisis Text Line',
        phone: 'Text HOME to 741741',
        website: 'https://crisistextline.org',
        availability: '24/7',
        description: 'Free crisis support via text message',
        cost: 'free',
        languages: ['English', 'Spanish']
      },
      {
        type: 'crisis_hotline',
        name: 'National Domestic Violence Hotline',
        phone: '1-800-799-7233',
        website: 'https://thehotline.org',
        availability: '24/7',
        description: 'Confidential support for domestic violence survivors',
        cost: 'free',
        languages: ['English', 'Spanish', '200+ languages via interpreter']
      },
      {
        type: 'crisis_hotline',
        name: 'SAMHSA National Helpline',
        phone: '1-800-662-4357',
        website: 'https://findtreatment.gov',
        availability: '24/7',
        description: 'Treatment referral and information service for substance abuse',
        cost: 'free',
        languages: ['English', 'Spanish']
      },
      {
        type: 'crisis_hotline',
        name: 'National Eating Disorders Association',
        phone: '1-800-931-2237',
        website: 'https://nationaleatingdisorders.org',
        availability: 'varies',
        description: 'Support and resources for eating disorder recovery',
        cost: 'free',
        languages: ['English']
      },

      // Emergency Services
      {
        type: 'emergency',
        name: 'Emergency Services (911)',
        phone: '911',
        availability: '24/7',
        description: 'Immediate emergency response for life-threatening situations',
        cost: 'varies',
        languages: ['English', 'interpreter services available']
      },
      {
        type: 'emergency',
        name: 'Mobile Crisis Response',
        phone: 'Varies by location',
        availability: '24/7',
        description: 'Community-based crisis intervention teams',
        cost: 'varies',
        languages: ['varies by location']
      },

      // Professional Services
      {
        type: 'therapist',
        name: 'Psychology Today Therapist Directory',
        website: 'https://psychologytoday.com',
        availability: 'varies',
        description: 'Find licensed therapists in your area',
        cost: 'insurance_based',
        languages: ['multiple languages available']
      },
      {
        type: 'psychiatrist',
        name: 'American Psychiatric Association',
        website: 'https://finder.psychiatry.org',
        availability: 'business_hours',
        description: 'Find psychiatrists for medication management',
        cost: 'insurance_based',
        languages: ['varies by provider']
      },

      // Support Groups
      {
        type: 'support_group',
        name: 'NAMI Support Groups',
        website: 'https://nami.org/support',
        availability: 'varies',
        description: 'Peer support groups for mental health conditions',
        cost: 'free',
        languages: ['English', 'varies by location']
      },
      {
        type: 'support_group',
        name: 'Alcoholics Anonymous',
        website: 'https://aa.org',
        availability: 'varies',
        description: '12-step program for alcohol addiction recovery',
        cost: 'free',
        languages: ['multiple languages available']
      }
    ];
  }

  // Main crisis assessment function
  public assessCrisis(message: string, emotionalIntensity: number = 5, userHistory?: any[]): CrisisResponse {
    const lowerMessage = message.toLowerCase();
    const riskAssessment = this.calculateRiskLevel(lowerMessage, emotionalIntensity);
    
    const isImmediate = riskAssessment.riskLevel === 'imminent' || 
                       riskAssessment.crisisTypes.includes('suicide') ||
                       (riskAssessment.riskLevel === 'high' && emotionalIntensity >= 8);

    const immediateResponse = this.generateCrisisResponse(riskAssessment, isImmediate);
    const followUpActions = this.getFollowUpActions(riskAssessment);

    return {
      isImmediate,
      riskAssessment,
      immediateResponse,
      followUpActions,
      documentation: {
        timestamp: new Date(),
        triggerMessage: message,
        responseGiven: immediateResponse,
        escalationRequired: isImmediate
      }
    };
  }

  private calculateRiskLevel(message: string, emotionalIntensity: number): RiskAssessment {
    let totalRiskScore = 0;
    let maxCategoryScore = 0;
    const detectedCrises: CrisisType[] = [];
    const triggerKeywords: string[] = [];

    // Check for crisis indicators
    this.crisisIndicators.forEach(indicator => {
      if (message.includes(indicator.keyword)) {
        let score = indicator.weight;
        
        // Check for context words that increase relevance
        if (indicator.context) {
          const contextMatches = indicator.context.filter(context => message.includes(context));
          if (contextMatches.length > 0) {
            score *= (1 + (contextMatches.length * 0.2)); // Increase score by 20% per context match
          }
        }

        totalRiskScore += score;
        maxCategoryScore = Math.max(maxCategoryScore, score);
        
        if (!detectedCrises.includes(indicator.category)) {
          detectedCrises.push(indicator.category);
        }
        triggerKeywords.push(indicator.keyword);
      }
    });

    // Adjust risk based on emotional intensity
    const intensityMultiplier = emotionalIntensity >= 8 ? 1.5 : emotionalIntensity >= 6 ? 1.2 : 1.0;
    totalRiskScore *= intensityMultiplier;

    // Determine risk level
    let riskLevel: RiskLevel;
    let recommendedAction: InterventionType;

    if (totalRiskScore >= 0.9 || maxCategoryScore >= 0.9) {
      riskLevel = 'imminent';
      recommendedAction = 'immediate';
    } else if (totalRiskScore >= 0.6 || maxCategoryScore >= 0.7) {
      riskLevel = 'high';
      recommendedAction = 'urgent';
    } else if (totalRiskScore >= 0.3 || emotionalIntensity >= 7) {
      riskLevel = 'moderate';
      recommendedAction = 'routine';
    } else {
      riskLevel = 'low';
      recommendedAction = 'monitoring';
    }

    const confidence = Math.min(1, totalRiskScore + (triggerKeywords.length * 0.1));
    const timeframe = this.getTimeframe(riskLevel);
    const immediateSteps = this.getImmediateSteps(riskLevel, detectedCrises);
    const professionalReferrals = this.getRelevantResources(detectedCrises, riskLevel);

    return {
      riskLevel,
      crisisTypes: detectedCrises,
      confidence,
      triggerKeywords,
      recommendedAction,
      immediateSteps,
      professionalReferrals,
      timeframe
    };
  }

  private generateCrisisResponse(assessment: RiskAssessment, isImmediate: boolean): string {
    if (isImmediate || assessment.riskLevel === 'imminent') {
      return this.getImmediateCrisisResponse(assessment);
    }

    if (assessment.riskLevel === 'high') {
      return this.getHighRiskResponse(assessment);
    }

    if (assessment.riskLevel === 'moderate') {
      return this.getModerateRiskResponse(assessment);
    }

    return this.getLowRiskResponse(assessment);
  }

  private getImmediateCrisisResponse(assessment: RiskAssessment): string {
    const resources = assessment.professionalReferrals
      .filter(r => r.availability === '24/7')
      .slice(0, 3)
      .map(r => `• ${r.name}: ${r.phone}`)
      .join('\n');

    return `🚨 I'm very concerned about what you're sharing. Your life has value and there are people who want to help you right now.

**IMMEDIATE HELP AVAILABLE:**
${resources}

**If you're in immediate danger:**
• Call 911 or go to your nearest emergency room
• Call the National Suicide Prevention Lifeline: 988
• Text HOME to 741741 for Crisis Text Line

**Right now:**
• You are not alone
• This pain is temporary, even though it doesn't feel that way
• Professional help is available 24/7
• Your life matters

Please reach out to one of these resources immediately. You don't have to go through this alone.`;
  }

  private getHighRiskResponse(assessment: RiskAssessment): string {
    const primaryResource = assessment.professionalReferrals[0];
    
    return `I'm really concerned about what you're experiencing. What you're going through sounds very difficult, and I want to make sure you get the support you need.

**Important resources:**
• ${primaryResource.name}: ${primaryResource.phone}
• Crisis Text Line: Text HOME to 741741

**Please consider:**
• Reaching out to a mental health professional today
• Talking to someone you trust about how you're feeling
• Creating a safety plan with specific coping strategies

**Remember:**
• These intense feelings can change with proper support
• You deserve care and compassion
• Professional help can make a real difference

Would you like help creating a safety plan or finding professional support in your area?`;
  }

  private getModerateRiskResponse(assessment: RiskAssessment): string {
    return `Thank you for sharing something so difficult with me. I can hear that you're struggling, and I want you to know that support is available.

**Helpful resources:**
• If you need immediate support: Call 988 (Suicide Prevention Lifeline)
• For ongoing support: Consider speaking with a mental health professional

**Some things that might help:**
• Practice grounding techniques when emotions feel overwhelming
• Reach out to trusted friends or family members
• Consider keeping a mood journal to track patterns
• Remember that seeking help is a sign of strength

**Professional support options:**
• Your primary care doctor can provide referrals
• Employee assistance programs (if available through work)
• Community mental health centers

How are you taking care of yourself right now? What support systems do you have available?`;
  }

  private getLowRiskResponse(assessment: RiskAssessment): string {
    return `I appreciate you sharing what's on your mind. It's important to acknowledge when we're struggling, and reaching out is a positive step.

**General wellness resources:**
• National Alliance on Mental Illness (NAMI): nami.org
• Psychology Today therapist directory: psychologytoday.com
• Crisis Text Line: Text HOME to 741741 (available anytime)

**Self-care strategies:**
• Regular sleep schedule and exercise
• Mindfulness or meditation practices
• Connecting with supportive people in your life
• Engaging in activities you usually enjoy

**When to seek additional help:**
• If symptoms worsen or persist
• If you're having thoughts of self-harm
• If you're unable to function in daily activities

What coping strategies have been helpful for you in the past?`;
  }

  private getTimeframe(riskLevel: RiskLevel): string {
    switch (riskLevel) {
      case 'imminent': return 'Immediate (within minutes)';
      case 'high': return 'Urgent (within 24 hours)';
      case 'moderate': return 'Soon (within 1 week)';
      case 'low': return 'Routine (within 1 month)';
    }
  }

  private getImmediateSteps(riskLevel: RiskLevel, crisisTypes: CrisisType[]): string[] {
    const steps: string[] = [];

    if (riskLevel === 'imminent') {
      steps.push('Call emergency services (911) if in immediate danger');
      steps.push('Contact crisis hotline immediately (988)');
      steps.push('Remove means of self-harm from environment');
      steps.push('Stay with trusted person or in safe location');
      steps.push('Go to emergency room if suicidal thoughts persist');
    } else if (riskLevel === 'high') {
      steps.push('Contact mental health crisis line within 24 hours');
      steps.push('Reach out to trusted friend or family member');
      steps.push('Schedule appointment with mental health professional');
      steps.push('Implement safety planning strategies');
      steps.push('Avoid alcohol and drugs');
    } else if (riskLevel === 'moderate') {
      steps.push('Consider scheduling therapy appointment');
      steps.push('Practice immediate coping strategies');
      steps.push('Connect with support system');
      steps.push('Monitor symptoms and mood changes');
    } else {
      steps.push('Continue current coping strategies');
      steps.push('Maintain healthy routines');
      steps.push('Consider preventive mental health support');
    }

    // Add crisis-specific steps
    if (crisisTypes.includes('substance_abuse')) {
      steps.push('Contact SAMHSA helpline for substance abuse support');
      steps.push('Consider inpatient or outpatient treatment options');
    }

    if (crisisTypes.includes('domestic_violence')) {
      steps.push('Contact National Domestic Violence Hotline');
      steps.push('Develop safety plan for leaving dangerous situation');
    }

    return steps;
  }

  private getRelevantResources(crisisTypes: CrisisType[], riskLevel: RiskLevel): ProfessionalResource[] {
    let relevantResources = [...this.professionalResources];

    // Filter by crisis type
    if (crisisTypes.includes('suicide') || crisisTypes.includes('self_harm')) {
      relevantResources = relevantResources.filter(r => 
        r.type === 'crisis_hotline' || r.type === 'emergency' || r.name.includes('Suicide')
      );
    } else if (crisisTypes.includes('substance_abuse')) {
      relevantResources = relevantResources.filter(r => 
        r.name.includes('SAMHSA') || r.name.includes('Alcoholics') || r.type === 'crisis_hotline'
      );
    } else if (crisisTypes.includes('domestic_violence')) {
      relevantResources = relevantResources.filter(r => 
        r.name.includes('Domestic Violence') || r.type === 'crisis_hotline'
      );
    } else if (crisisTypes.includes('eating_disorder')) {
      relevantResources = relevantResources.filter(r => 
        r.name.includes('Eating Disorders') || r.type === 'crisis_hotline'
      );
    }

    // Ensure we always include basic crisis resources for high risk
    if (riskLevel === 'imminent' || riskLevel === 'high') {
      const basicCrisisResources = this.professionalResources.filter(r => 
        r.name.includes('Suicide Prevention') || r.name.includes('Crisis Text') || r.type === 'emergency'
      );
      relevantResources = [...basicCrisisResources, ...relevantResources];
    }

    // Remove duplicates and limit to top 5
    const uniqueResources = relevantResources.filter((resource, index, self) => 
      index === self.findIndex(r => r.name === resource.name)
    );

    return uniqueResources.slice(0, 5);
  }

  private getFollowUpActions(assessment: RiskAssessment): string[] {
    const actions: string[] = [];

    if (assessment.riskLevel === 'imminent' || assessment.riskLevel === 'high') {
      actions.push('Document crisis intervention in user record');
      actions.push('Follow up within 24-48 hours');
      actions.push('Assess need for ongoing crisis monitoring');
      actions.push('Coordinate with professional mental health services');
    } else {
      actions.push('Monitor for escalation in future sessions');
      actions.push('Provide ongoing emotional support and resources');
      actions.push('Encourage professional mental health evaluation');
    }

    return actions;
  }

  // Safety plan creation and management
  public createSafetyPlan(userId: string, planData: Partial<SafetyPlan>): SafetyPlan {
    const safetyPlan: SafetyPlan = {
      userId,
      warningSignals: planData.warningSignals || [],
      copingStrategies: planData.copingStrategies || [],
      supportContacts: planData.supportContacts || [],
      professionalContacts: planData.professionalContacts || this.professionalResources.slice(0, 3),
      environmentalSafety: planData.environmentalSafety || [],
      reasonsForLiving: planData.reasonsForLiving || [],
      createdAt: new Date(),
      lastUpdated: new Date()
    };

    this.safetyPlans.set(userId, safetyPlan);
    return safetyPlan;
  }

  public getSafetyPlan(userId: string): SafetyPlan | null {
    return this.safetyPlans.get(userId) || null;
  }

  public updateSafetyPlan(userId: string, updates: Partial<SafetyPlan>): SafetyPlan | null {
    const existingPlan = this.safetyPlans.get(userId);
    if (!existingPlan) return null;

    const updatedPlan = {
      ...existingPlan,
      ...updates,
      lastUpdated: new Date()
    };

    this.safetyPlans.set(userId, updatedPlan);
    return updatedPlan;
  }

  // Quick access to emergency resources
  public getEmergencyResources(): ProfessionalResource[] {
    return this.professionalResources.filter(r => 
      r.availability === '24/7' && (r.type === 'crisis_hotline' || r.type === 'emergency')
    );
  }

  // Check if message contains any crisis indicators
  public containsCrisisIndicators(message: string): boolean {
    const lowerMessage = message.toLowerCase();
    return this.crisisIndicators.some(indicator => lowerMessage.includes(indicator.keyword));
  }

  // Get risk level color for UI
  public getRiskLevelColor(riskLevel: RiskLevel): string {
    switch (riskLevel) {
      case 'imminent': return 'text-red-700 bg-red-100 border-red-300';
      case 'high': return 'text-orange-700 bg-orange-100 border-orange-300';
      case 'moderate': return 'text-yellow-700 bg-yellow-100 border-yellow-300';
      case 'low': return 'text-green-700 bg-green-100 border-green-300';
    }
  }
}

export default SafetySystem;
