// TODO 6: Safety-Enhanced AI Therapist with Crisis Detection & Professional Referrals
// Complete therapeutic platform with comprehensive safety protocols and risk assessment

'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertCircle,
    AlertTriangle,
    BookOpen,
    Brain,
    Heart,
    Lightbulb,
    MessageCircle,
    Mic,
    MicOff,
    Phone,
    Shield,
    Target,
    TrendingUp
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import SafetySystem, { CrisisResponse, ProfessionalResource, RiskLevel } from '../lib/safetySystem';
import TherapeuticProtocolEngine, {
    EmotionCategory,
    TherapeuticApproach,
    TherapeuticTechnique
} from '../lib/therapeuticProtocolEngine';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'therapist';
  timestamp: Date;
  emotionalAnalysis?: {
    emotions: EmotionCategory[];
    intensity: number;
    confidence: number;
  };
  recommendedTechniques?: TherapeuticTechnique[];
  appliedTechnique?: TherapeuticTechnique;
  safetyAlert?: {
    riskLevel: RiskLevel;
    recommendedAction: string;
    resources: ProfessionalResource[];
    timeframe: string;
  };
  crisisDetected?: boolean;
}

interface TherapySession {
  sessionId: string;
  startTime: Date;
  currentIssue: string;
  emotionalJourney: { timestamp: Date; emotions: EmotionCategory[]; intensity: number; riskLevel?: RiskLevel; }[];
  techniquesUsed: string[];
  userFeedback: { techniqueId: string; rating: number; notes?: string; }[];
  insights: string[];
  goals: string[];
  safetyFlags: { timestamp: Date; riskLevel: RiskLevel; action: string; }[];
}

interface TechniqueProgress {
  technique: TherapeuticTechnique;
  isActive: boolean;
  currentStep: number;
  startTime?: Date;
  userRating?: number;
  notes?: string;
}

const SafetyEnhancedAITherapist: React.FC = () => {
  // Core state
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSession, setCurrentSession] = useState<TherapySession | null>(null);
  
  // Safety system state
  const [safetySystem] = useState(() => new SafetySystem());
  const [currentRiskLevel, setCurrentRiskLevel] = useState<RiskLevel>('low');
  const [emergencyResources, setEmergencyResources] = useState<ProfessionalResource[]>([]);
  const [showSafetyPanel, setShowSafetyPanel] = useState(false);
  const [showEmergencyDialog, setShowEmergencyDialog] = useState(false);
  
  // Therapeutic protocol state
  const [protocolEngine] = useState(() => new TherapeuticProtocolEngine());
  const [currentTechniqueProgress, setCurrentTechniqueProgress] = useState<TechniqueProgress | null>(null);
  const [availableTechniques, setAvailableTechniques] = useState<TherapeuticTechnique[]>([]);
  const [userEmotionalState, setUserEmotionalState] = useState<EmotionCategory[]>([]);
  const [emotionalIntensity, setEmotionalIntensity] = useState<number>(5);
  
  // UI state
  const [showTechniquePanel, setShowTechniquePanel] = useState(false);
  const [selectedApproach, setSelectedApproach] = useState<TherapeuticApproach | 'all'>('all');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  // Voice integration
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize emergency resources
  useEffect(() => {
    const resources = safetySystem.getEmergencyResources();
    setEmergencyResources(resources);
  }, [safetySystem]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      setSpeechSupported(true);
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize session
  useEffect(() => {
    if (!currentSession) {
      startNewSession();
    }
  }, []);

  const startNewSession = () => {
    const sessionId = `therapy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newSession: TherapySession = {
      sessionId,
      startTime: new Date(),
      currentIssue: '',
      emotionalJourney: [],
      techniquesUsed: [],
      userFeedback: [],
      insights: [],
      goals: [],
      safetyFlags: []
    };
    setCurrentSession(newSession);
    
    // Welcome message with safety information
    const welcomeMessage: Message = {
      id: `msg_${Date.now()}`,
      content: `Hello! I'm your AI Therapist with integrated safety protocols. I'm here to provide evidence-based therapeutic support while prioritizing your safety and wellbeing.

**Important Safety Information:**
• If you're having thoughts of suicide or self-harm, I'm equipped to provide immediate crisis resources
• Emergency services: 911 | Crisis Text Line: Text HOME to 741741 | Suicide Prevention: 988
• I monitor our conversation for safety concerns and will offer appropriate resources

I use CBT, DBT, mindfulness, and other proven therapeutic approaches. I can help you with:
• Managing anxiety, depression, or stress
• Working through relationship challenges  
• Building emotional regulation skills
• Developing healthy coping strategies
• Processing difficult emotions

How are you feeling today, and what would you like to work on? Your safety and wellbeing are my top priority.`,
      sender: 'therapist',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  const analyzeEmotionalContent = useCallback((text: string): { emotions: EmotionCategory[]; intensity: number; confidence: number; } => {
    const emotionKeywords = {
      anxiety: ['worried', 'anxious', 'nervous', 'panic', 'fear', 'scared', 'overwhelmed', 'stress'],
      depression: ['sad', 'depressed', 'hopeless', 'empty', 'worthless', 'tired', 'exhausted', 'lonely'],
      anger: ['angry', 'furious', 'frustrated', 'mad', 'irritated', 'annoyed', 'rage', 'pissed'],
      grief: ['loss', 'death', 'mourning', 'grief', 'miss', 'gone', 'died', 'funeral'],
      trauma: ['trauma', 'ptsd', 'flashback', 'nightmare', 'abuse', 'assault', 'accident'],
      stress: ['stress', 'pressure', 'deadline', 'busy', 'overload', 'tension', 'strain'],
      relationship: ['relationship', 'partner', 'family', 'friend', 'conflict', 'breakup', 'divorce'],
      self_esteem: ['confidence', 'self-worth', 'insecure', 'doubt', 'failure', 'success', 'proud']
    };

    const intensityWords = {
      high: ['extremely', 'very', 'really', 'so', 'completely', 'totally', 'absolutely'],
      medium: ['quite', 'fairly', 'somewhat', 'pretty', 'rather'],
      low: ['a little', 'slightly', 'kind of', 'sort of', 'barely']
    };

    const lowerText = text.toLowerCase();
    const detectedEmotions: EmotionCategory[] = [];
    let totalIntensity = 0;
    let emotionCount = 0;

    // Detect emotions
    Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
      const matches = keywords.filter(keyword => lowerText.includes(keyword));
      if (matches.length > 0) {
        detectedEmotions.push(emotion as EmotionCategory);
        emotionCount++;
      }
    });

    // Calculate intensity
    if (intensityWords.high.some(word => lowerText.includes(word))) {
      totalIntensity += 8;
    } else if (intensityWords.medium.some(word => lowerText.includes(word))) {
      totalIntensity += 6;
    } else if (intensityWords.low.some(word => lowerText.includes(word))) {
      totalIntensity += 3;
    } else {
      totalIntensity += 5; // Default moderate
    }

    const intensity = emotionCount > 0 ? Math.min(10, totalIntensity) : 5;
    const confidence = detectedEmotions.length > 0 ? Math.min(1, detectedEmotions.length * 0.3 + 0.4) : 0.5;

    return {
      emotions: detectedEmotions.length > 0 ? detectedEmotions : ['stress'], // Default to stress
      intensity,
      confidence
    };
  }, []);

  const generateTherapeuticResponse = useCallback(async (userMessage: string, emotionalAnalysis: any): Promise<any> => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          context: 'therapeutic',
          emotionalState: emotionalAnalysis.emotions,
          intensity: emotionalAnalysis.intensity,
          sessionHistory: messages.slice(-5) // Include recent context
        })
      });

      if (!response.ok) throw new Error('Failed to get response');
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error generating therapeutic response:', error);
      return {
        response: generateFallbackResponse(emotionalAnalysis),
        emergencyContact: {
          suicide: '988',
          crisis: 'Text HOME to 741741',
          emergency: '911'
        }
      };
    }
  }, [messages]);

  const generateFallbackResponse = (emotionalAnalysis: any): string => {
    const { emotions, intensity } = emotionalAnalysis;
    
    if (intensity >= 8) {
      return `I can sense you're experiencing intense emotions right now. Let's focus on some immediate coping strategies. Would you like to try a quick grounding technique to help you feel more centered?

**Crisis Resources:**
• National Suicide Prevention Lifeline: 988
• Crisis Text Line: Text HOME to 741741
• Emergency Services: 911`;
    }
    
    if (emotions.includes('anxiety')) {
      return `It sounds like you're dealing with some anxiety. That's completely understandable. I have several evidence-based techniques that can help, including breathing exercises and cognitive restructuring. What feels most overwhelming right now?`;
    }
    
    return `Thank you for sharing that with me. I'm here to support you through whatever you're experiencing. Let's explore some therapeutic techniques that might be helpful for your current situation.`;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      content: inputValue.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    // Analyze emotional content
    const emotionalAnalysis = analyzeEmotionalContent(inputValue);
    userMessage.emotionalAnalysis = emotionalAnalysis;

    // Perform safety assessment
    const crisisResponse: CrisisResponse = safetySystem.assessCrisis(
      inputValue, 
      emotionalAnalysis.intensity, 
      messages.slice(-5)
    );

    // Update risk level
    setCurrentRiskLevel(crisisResponse.riskAssessment.riskLevel);

    // Handle immediate crisis
    if (crisisResponse.isImmediate) {
      userMessage.crisisDetected = true;
      userMessage.safetyAlert = {
        riskLevel: crisisResponse.riskAssessment.riskLevel,
        recommendedAction: crisisResponse.riskAssessment.recommendedAction,
        resources: crisisResponse.riskAssessment.professionalReferrals,
        timeframe: crisisResponse.riskAssessment.timeframe
      };
      
      setShowEmergencyDialog(true);
      setMessages(prev => [...prev, userMessage]);
      
      // Create immediate crisis response message
      const crisisMessage: Message = {
        id: `msg_${Date.now()}_crisis`,
        content: crisisResponse.immediateResponse,
        sender: 'therapist',
        timestamp: new Date(),
        crisisDetected: true
      };
      
      setMessages(prev => [...prev, crisisMessage]);
      setInputValue('');
      
      // Log safety flag
      if (currentSession) {
        const updatedSession = {
          ...currentSession,
          safetyFlags: [
            ...currentSession.safetyFlags,
            {
              timestamp: new Date(),
              riskLevel: crisisResponse.riskAssessment.riskLevel,
              action: 'Crisis intervention triggered'
            }
          ]
        };
        setCurrentSession(updatedSession);
      }
      
      return;
    }

    // Get technique recommendations
    const recommendedTechniques = protocolEngine.selectOptimalTechniques(
      emotionalAnalysis.emotions,
      emotionalAnalysis.intensity,
      20, // Assume 20 minutes available
      { preferredApproaches: selectedApproach === 'all' ? undefined : [selectedApproach as TherapeuticApproach] },
      currentSession?.techniquesUsed || []
    );
    userMessage.recommendedTechniques = recommendedTechniques;

    setMessages(prev => [...prev, userMessage]);
    setUserEmotionalState(emotionalAnalysis.emotions);
    setEmotionalIntensity(emotionalAnalysis.intensity);
    setAvailableTechniques(recommendedTechniques);
    setInputValue('');
    setIsLoading(true);

    // Update session
    if (currentSession) {
      const updatedSession = {
        ...currentSession,
        emotionalJourney: [
          ...currentSession.emotionalJourney,
          {
            timestamp: new Date(),
            emotions: emotionalAnalysis.emotions,
            intensity: emotionalAnalysis.intensity,
            riskLevel: crisisResponse.riskAssessment.riskLevel
          }
        ]
      };
      
      // Add safety flag if elevated risk
      if (crisisResponse.riskAssessment.riskLevel === 'high' || crisisResponse.riskAssessment.riskLevel === 'moderate') {
        updatedSession.safetyFlags = [
          ...updatedSession.safetyFlags,
          {
            timestamp: new Date(),
            riskLevel: crisisResponse.riskAssessment.riskLevel,
            action: `Elevated risk detected - ${crisisResponse.riskAssessment.recommendedAction}`
          }
        ];
      }
      
      setCurrentSession(updatedSession);
    }

    try {
      const responseData = await generateTherapeuticResponse(inputValue, emotionalAnalysis);
      
      const assistantMessage: Message = {
        id: `msg_${Date.now()}_assistant`,
        content: responseData.response,
        sender: 'therapist',
        timestamp: new Date(),
        recommendedTechniques,
        safetyAlert: responseData.safetyAlert
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Show safety panel if safety alert is present
      if (responseData.safetyAlert) {
        setShowSafetyPanel(true);
      }
      
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: `msg_${Date.now()}_error`,
        content: 'I apologize, but I encountered an issue. Let\'s continue with some therapeutic techniques I can offer you right now. If you\'re in crisis, please call 988 or 911 immediately.',
        sender: 'therapist',
        timestamp: new Date(),
        recommendedTechniques
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const startTechnique = (technique: TherapeuticTechnique) => {
    setCurrentTechniqueProgress({
      technique,
      isActive: true,
      currentStep: 0,
      startTime: new Date()
    });
    setShowTechniquePanel(true);

    // Record technique usage
    if (currentSession) {
      const updatedSession = {
        ...currentSession,
        techniquesUsed: [...currentSession.techniquesUsed, technique.id]
      };
      setCurrentSession(updatedSession);
    }
  };

  const completeTechnique = (rating: number, notes?: string) => {
    if (currentTechniqueProgress && currentSession) {
      // Record feedback
      const feedback = {
        techniqueId: currentTechniqueProgress.technique.id,
        rating,
        notes
      };

      const updatedSession = {
        ...currentSession,
        userFeedback: [...currentSession.userFeedback, feedback]
      };
      setCurrentSession(updatedSession);

      // Record in protocol engine
      protocolEngine.recordUserFeedback(
        'current_user', // In real app, use actual user ID
        currentSession.sessionId,
        currentTechniqueProgress.technique.id,
        rating,
        notes
      );
    }

    setCurrentTechniqueProgress(null);
    setShowTechniquePanel(false);
  };

  const startVoiceInput = () => {
    if (speechSupported && recognitionRef.current) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getRiskLevelColor = (riskLevel: RiskLevel) => {
    return safetySystem.getRiskLevelColor(riskLevel);
  };

  const getApproachIcon = (approach: TherapeuticApproach) => {
    switch (approach) {
      case 'CBT': return <Brain className="w-4 h-4" />;
      case 'DBT': return <Target className="w-4 h-4" />;
      case 'mindfulness': return <Heart className="w-4 h-4" />;
      case 'ACT': return <Lightbulb className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col">
        {/* Header with Safety Status */}
        <div className="bg-white/80 backdrop-blur-md border-b border-white/20 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-800">AI Therapist Pro</h1>
                <p className="text-sm text-gray-600">Safety-Enhanced Therapeutic Support</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Risk Level Indicator */}
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(currentRiskLevel)}`}>
                <div className="flex items-center space-x-1">
                  <Shield className="w-3 h-3" />
                  <span>Risk: {currentRiskLevel}</span>
                </div>
              </div>
              
              {currentSession && (
                <div className="text-sm text-gray-600">
                  Session: {formatTimeAgo(currentSession.startTime)}
                </div>
              )}
              
              <button
                onClick={() => setShowSafetyPanel(!showSafetyPanel)}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-white/50 rounded-lg transition-colors"
              >
                <Shield className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-white/50 rounded-lg transition-colors"
              >
                <TrendingUp className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                  <div className={`p-4 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : message.crisisDetected
                      ? 'bg-gradient-to-r from-red-100 to-red-50 text-red-900 border border-red-200'
                      : 'bg-white/80 backdrop-blur-md text-gray-800'
                  }`}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    
                    {/* Crisis Alert */}
                    {message.crisisDetected && (
                      <div className="mt-3 p-3 bg-red-200/50 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                          <span className="font-semibold text-red-800">Crisis Support Activated</span>
                        </div>
                        <p className="text-sm text-red-700">
                          Immediate help is available. Please contact emergency services if needed.
                        </p>
                      </div>
                    )}
                    
                    {/* Safety Alert */}
                    {message.safetyAlert && (
                      <div className="mt-3 p-3 bg-yellow-100 rounded-lg border border-yellow-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <AlertCircle className="w-4 h-4 text-yellow-600" />
                          <span className="font-medium text-yellow-800">Safety Check</span>
                        </div>
                        <div className="text-sm text-yellow-700">
                          <p>Risk Level: <span className="font-medium">{message.safetyAlert.riskLevel}</span></p>
                          <p>Recommended Action: {message.safetyAlert.recommendedAction}</p>
                          <p>Timeframe: {message.safetyAlert.timeframe}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Emotional Analysis Display */}
                    {message.emotionalAnalysis && message.sender === 'user' && (
                      <div className="mt-3 p-3 bg-white/20 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Heart className="w-4 h-4" />
                          <span className="text-sm font-medium">Emotional Analysis</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {message.emotionalAnalysis.emotions.map((emotion) => (
                            <span key={emotion} className="px-2 py-1 bg-white/20 rounded-full text-xs">
                              {emotion}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <span>Intensity:</span>
                          <div className="flex-1 bg-white/20 rounded-full h-2">
                            <div 
                              className="bg-white rounded-full h-2 transition-all duration-300"
                              style={{ width: `${message.emotionalAnalysis.intensity * 10}%` }}
                            />
                          </div>
                          <span>{message.emotionalAnalysis.intensity}/10</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Recommended Techniques */}
                  {message.recommendedTechniques && message.recommendedTechniques.length > 0 && (
                    <div className="mt-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                      <div className="flex items-center space-x-2 mb-3">
                        <Lightbulb className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-blue-800">Recommended Techniques</span>
                      </div>
                      <div className="space-y-2">
                        {message.recommendedTechniques.map((technique) => (
                          <div key={technique.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                            <div className="flex items-center space-x-3">
                              {getApproachIcon(technique.approach)}
                              <div>
                                <p className="font-medium text-gray-800">{technique.name}</p>
                                <p className="text-sm text-gray-600">{technique.approach} • {technique.timeRequired} min</p>
                              </div>
                            </div>
                            <button
                              onClick={() => startTechnique(technique)}
                              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                              Start
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <span>{formatTimeAgo(message.timestamp)}</span>
                    {message.emotionalAnalysis && (
                      <span className={`px-2 py-1 rounded-full ${
                        message.emotionalAnalysis.intensity >= 8 ? 'text-red-600 bg-red-50' :
                        message.emotionalAnalysis.intensity >= 6 ? 'text-orange-600 bg-orange-50' :
                        message.emotionalAnalysis.intensity >= 4 ? 'text-yellow-600 bg-yellow-50' : 'text-green-600 bg-green-50'
                      }`}>
                        {message.emotionalAnalysis.intensity >= 8 ? 'High Intensity' :
                         message.emotionalAnalysis.intensity >= 6 ? 'Moderate Intensity' :
                         message.emotionalAnalysis.intensity >= 4 ? 'Mild Intensity' : 'Low Intensity'}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area with Emergency Button */}
        <div className="bg-white/80 backdrop-blur-md border-t border-white/20 p-4">
          <div className="flex items-center space-x-2">
            {/* Emergency Button */}
            <button
              onClick={() => setShowEmergencyDialog(true)}
              className="px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all flex items-center space-x-2"
              title="Emergency Resources"
            >
              <Phone className="w-5 h-5" />
              <span className="hidden sm:inline">Emergency</span>
            </button>
            
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Share what's on your mind... (Your safety is our priority)"
                className="w-full p-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/80"
                disabled={isLoading}
              />
              
              {speechSupported && (
                <button
                  onClick={isListening ? stopVoiceInput : startVoiceInput}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg transition-colors ${
                    isListening ? 'text-red-500 bg-red-50' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
              )}
            </div>
            
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <MessageCircle className="w-5 h-5" />
            </button>
          </div>
          
          {userEmotionalState.length > 0 && (
            <div className="mt-3 flex items-center space-x-2 text-sm">
              <span className="text-gray-600">Current state:</span>
              {userEmotionalState.map((emotion) => (
                <span key={emotion} className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                  {emotion}
                </span>
              ))}
              <span className={`px-2 py-1 rounded-full ${getRiskLevelColor(currentRiskLevel)}`}>
                Risk: {currentRiskLevel}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Emergency Resources Dialog */}
      <AnimatePresence>
        {showEmergencyDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowEmergencyDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center space-x-2 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <h2 className="text-xl font-semibold text-gray-800">Emergency Resources</h2>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <h3 className="font-semibold text-red-800 mb-2">Immediate Crisis Support</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Emergency Services:</span>
                      <a href="tel:911" className="font-semibold text-red-600">911</a>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Suicide Prevention:</span>
                      <a href="tel:988" className="font-semibold text-red-600">988</a>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Crisis Text Line:</span>
                      <span className="font-semibold text-red-600">Text HOME to 741741</span>
                    </div>
                  </div>
                </div>
                
                {emergencyResources.map((resource) => (
                  <div key={resource.name} className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-800">{resource.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{resource.description}</p>
                    {resource.phone && (
                      <p className="text-sm">
                        <span className="font-medium">Phone:</span> 
                        <a href={`tel:${resource.phone}`} className="text-blue-600 ml-1">
                          {resource.phone}
                        </a>
                      </p>
                    )}
                    <p className="text-xs text-gray-500">Available: {resource.availability}</p>
                  </div>
                ))}
              </div>
              
              <button
                onClick={() => setShowEmergencyDialog(false)}
                className="w-full mt-6 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Safety Panel */}
      <AnimatePresence>
        {showSafetyPanel && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            className="w-96 bg-white/90 backdrop-blur-md border-l border-white/20 p-6 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Safety Dashboard</h2>
              <button
                onClick={() => setShowSafetyPanel(false)}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* Current Risk Level */}
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-3">
                <Shield className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-800">Current Risk Assessment</span>
              </div>
              
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getRiskLevelColor(currentRiskLevel)}`}>
                Risk Level: {currentRiskLevel.toUpperCase()}
              </div>
              
              <p className="text-sm text-gray-600 mt-2">
                Your safety is continuously monitored throughout our conversation.
              </p>
            </div>

            {/* Emergency Resources */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-800 mb-3">Quick Access Resources</h3>
              <div className="space-y-2">
                <button className="w-full p-3 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors text-left">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4" />
                    <span className="font-medium">Emergency: 911</span>
                  </div>
                </button>
                <button className="w-full p-3 bg-orange-100 text-orange-800 rounded-lg hover:bg-orange-200 transition-colors text-left">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4" />
                    <span className="font-medium">Suicide Prevention: 988</span>
                  </div>
                </button>
                <button className="w-full p-3 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors text-left">
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="w-4 h-4" />
                    <span className="font-medium">Crisis Text: HOME to 741741</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Safety History */}
            {currentSession && currentSession.safetyFlags.length > 0 && (
              <div className="mb-6">
                <h3 className="font-medium text-gray-800 mb-3">Session Safety Log</h3>
                <div className="space-y-2">
                  {currentSession.safetyFlags.slice(-3).map((flag, index) => (
                    <div key={index} className="p-2 bg-gray-50 rounded-lg text-sm">
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 rounded-full text-xs ${getRiskLevelColor(flag.riskLevel)}`}>
                          {flag.riskLevel}
                        </span>
                        <span className="text-gray-500">{formatTimeAgo(flag.timestamp)}</span>
                      </div>
                      <p className="text-gray-700 mt-1">{flag.action}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SafetyEnhancedAITherapist;
