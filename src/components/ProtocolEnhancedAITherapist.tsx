// TODO 5: Enhanced AI Therapist with Therapeutic Protocol Engine Integration
// Complete therapeutic platform with CBT, DBT, mindfulness, and personalized interventions

'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
    BookOpen,
    Brain,
    Heart,
    Lightbulb,
    MessageCircle,
    Mic,
    MicOff,
    Play,
    Target,
    TrendingUp
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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
}

interface TherapySession {
  sessionId: string;
  startTime: Date;
  currentIssue: string;
  emotionalJourney: { timestamp: Date; emotions: EmotionCategory[]; intensity: number; }[];
  techniquesUsed: string[];
  userFeedback: { techniqueId: string; rating: number; notes?: string; }[];
  insights: string[];
  goals: string[];
}

interface TechniqueProgress {
  technique: TherapeuticTechnique;
  isActive: boolean;
  currentStep: number;
  startTime?: Date;
  userRating?: number;
  notes?: string;
}

const ProtocolEnhancedAITherapist: React.FC = () => {
  // Core state
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSession, setCurrentSession] = useState<TherapySession | null>(null);
  
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
      goals: []
    };
    setCurrentSession(newSession);
    
    // Welcome message
    const welcomeMessage: Message = {
      id: `msg_${Date.now()}`,
      content: `Hello! I'm your AI Therapist powered by evidence-based therapeutic protocols. I'm here to support you with CBT, DBT, mindfulness, and other proven techniques. 

What would you like to explore today? I can help you with:
• Managing anxiety, depression, or stress
• Working through relationship challenges
• Building emotional regulation skills
• Developing coping strategies
• Processing difficult emotions

How are you feeling right now, and what brings you here today?`,
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

  const generateTherapeuticResponse = useCallback(async (userMessage: string, emotionalAnalysis: any): Promise<string> => {
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
      return data.response;
    } catch (error) {
      console.error('Error generating therapeutic response:', error);
      return generateFallbackResponse(emotionalAnalysis);
    }
  }, [messages]);

  const generateFallbackResponse = (emotionalAnalysis: any): string => {
    const { emotions, intensity } = emotionalAnalysis;
    
    if (intensity >= 8) {
      return `I can sense you're experiencing intense emotions right now. Let's focus on some immediate coping strategies. Would you like to try a quick grounding technique to help you feel more centered?`;
    }
    
    if (emotions.includes('anxiety')) {
      return `It sounds like you're dealing with some anxiety. That's completely understandable. I have several evidence-based techniques that can help, including breathing exercises and cognitive restructuring. What feels most overwhelming right now?`;
    }
    
    if (emotions.includes('depression')) {
      return `I hear that you're struggling with some difficult feelings. Depression can make everything feel harder. Let's work together on some strategies that can help lift your mood gradually. Have you been able to do any activities you usually enjoy recently?`;
    }
    
    return `Thank you for sharing that with me. I'm here to support you through whatever you're experiencing. Let's explore some therapeutic techniques that might be helpful for your current situation.`;
  };

  const recommendTechniques = useCallback((emotionalAnalysis: any): TherapeuticTechnique[] => {
    const { emotions, intensity } = emotionalAnalysis;
    
    const preferredApproaches = selectedApproach === 'all' ? 
      undefined : 
      [selectedApproach as TherapeuticApproach];
    
    return protocolEngine.selectOptimalTechniques(
      emotions,
      intensity,
      20, // Assume 20 minutes available
      { preferredApproaches },
      currentSession?.techniquesUsed || []
    );
  }, [protocolEngine, selectedApproach, currentSession]);

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

    // Get technique recommendations
    const recommendedTechniques = recommendTechniques(emotionalAnalysis);
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
            intensity: emotionalAnalysis.intensity
          }
        ]
      };
      setCurrentSession(updatedSession);
    }

    try {
      const therapeuticResponse = await generateTherapeuticResponse(inputValue, emotionalAnalysis);
      
      const assistantMessage: Message = {
        id: `msg_${Date.now()}_assistant`,
        content: therapeuticResponse,
        sender: 'therapist',
        timestamp: new Date(),
        recommendedTechniques
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: `msg_${Date.now()}_error`,
        content: 'I apologize, but I encountered an issue. Let\'s continue with some therapeutic techniques I can offer you right now.',
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

  const nextTechniqueStep = () => {
    if (currentTechniqueProgress && currentTechniqueProgress.currentStep < currentTechniqueProgress.technique.instructions.length - 1) {
      setCurrentTechniqueProgress(prev => prev ? {
        ...prev,
        currentStep: prev.currentStep + 1
      } : null);
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

  const getApproachIcon = (approach: TherapeuticApproach) => {
    switch (approach) {
      case 'CBT': return <Brain className="w-4 h-4" />;
      case 'DBT': return <Target className="w-4 h-4" />;
      case 'mindfulness': return <Heart className="w-4 h-4" />;
      case 'ACT': return <Lightbulb className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getIntensityColor = (intensity: number) => {
    if (intensity >= 8) return 'text-red-600 bg-red-50';
    if (intensity >= 6) return 'text-orange-600 bg-orange-50';
    if (intensity >= 4) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-md border-b border-white/20 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-800">AI Therapist Pro</h1>
                <p className="text-sm text-gray-600">Evidence-based therapeutic support</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {currentSession && (
                <div className="text-sm text-gray-600">
                  Session: {formatTimeAgo(currentSession.startTime)}
                </div>
              )}
              
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-white/50 rounded-lg transition-colors"
              >
                <TrendingUp className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setShowTechniquePanel(!showTechniquePanel)}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-white/50 rounded-lg transition-colors"
              >
                <BookOpen className="w-5 h-5" />
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
                      : 'bg-white/80 backdrop-blur-md text-gray-800'
                  }`}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    
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
                      <span className={`px-2 py-1 rounded-full ${getIntensityColor(message.emotionalAnalysis.intensity)}`}>
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

        {/* Input Area */}
        <div className="bg-white/80 backdrop-blur-md border-t border-white/20 p-4">
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Share what's on your mind..."
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
              <span className="text-gray-600">Detected emotions:</span>
              {userEmotionalState.map((emotion) => (
                <span key={emotion} className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                  {emotion}
                </span>
              ))}
              <span className={`px-2 py-1 rounded-full ${getIntensityColor(emotionalIntensity)}`}>
                Intensity: {emotionalIntensity}/10
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Technique Panel */}
      <AnimatePresence>
        {showTechniquePanel && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            className="w-96 bg-white/90 backdrop-blur-md border-l border-white/20 p-6 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Therapeutic Techniques</h2>
              <button
                onClick={() => setShowTechniquePanel(false)}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* Current Technique Progress */}
            {currentTechniqueProgress && (
              <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-2 mb-3">
                  <Play className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-800">Active Technique</span>
                </div>
                
                <h3 className="font-semibold text-gray-800 mb-2">
                  {currentTechniqueProgress.technique.name}
                </h3>
                
                <div className="mb-3">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Step {currentTechniqueProgress.currentStep + 1} of {currentTechniqueProgress.technique.instructions.length}</span>
                    <span>{currentTechniqueProgress.technique.timeRequired} min</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${((currentTechniqueProgress.currentStep + 1) / currentTechniqueProgress.technique.instructions.length) * 100}%` 
                      }}
                    />
                  </div>
                </div>
                
                <div className="p-3 bg-white rounded-lg mb-4">
                  <p className="text-gray-700">
                    {currentTechniqueProgress.technique.instructions[currentTechniqueProgress.currentStep]}
                  </p>
                </div>
                
                <div className="flex space-x-2">
                  {currentTechniqueProgress.currentStep < currentTechniqueProgress.technique.instructions.length - 1 ? (
                    <button
                      onClick={nextTechniqueStep}
                      className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Next Step
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        const rating = window.prompt('How helpful was this technique? (1-10)');
                        if (rating) {
                          completeTechnique(parseInt(rating));
                        }
                      }}
                      className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Complete & Rate
                    </button>
                  )}
                  
                  <button
                    onClick={() => setCurrentTechniqueProgress(null)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Stop
                  </button>
                </div>
              </div>
            )}

            {/* Approach Filter */}
            <div className="mb-4">
              <select
                value={selectedApproach}
                onChange={(e) => setSelectedApproach(e.target.value as TherapeuticApproach | 'all')}
                className="w-full p-2 border border-gray-300 rounded-lg bg-white"
              >
                <option value="all">All Approaches</option>
                <option value="CBT">Cognitive Behavioral Therapy</option>
                <option value="DBT">Dialectical Behavior Therapy</option>
                <option value="mindfulness">Mindfulness</option>
                <option value="ACT">Acceptance & Commitment Therapy</option>
              </select>
            </div>

            {/* Available Techniques */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-800">Available Techniques</h3>
              {availableTechniques.length > 0 ? (
                availableTechniques
                  .filter(technique => selectedApproach === 'all' || technique.approach === selectedApproach)
                  .map((technique) => (
                    <div key={technique.id} className="p-4 bg-white rounded-lg border border-gray-200 hover:border-purple-300 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getApproachIcon(technique.approach)}
                          <h4 className="font-medium text-gray-800">{technique.name}</h4>
                        </div>
                        <span className="text-xs text-gray-500">{technique.timeRequired}m</span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{technique.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                            {technique.approach}
                          </span>
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                            {technique.difficulty}
                          </span>
                        </div>
                        
                        <button
                          onClick={() => startTechnique(technique)}
                          className="px-3 py-1 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600 transition-colors"
                        >
                          Start
                        </button>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Share your thoughts to get personalized technique recommendations</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analytics Panel */}
      <AnimatePresence>
        {showAnalytics && currentSession && (
          <motion.div
            initial={{ y: 400, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 400, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-white/20 p-6 max-h-96 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Session Analytics</h2>
              <button
                onClick={() => setShowAnalytics(false)}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Emotional Journey */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">Emotional Journey</h3>
                <div className="space-y-2">
                  {currentSession.emotionalJourney.slice(-3).map((entry, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{formatTimeAgo(entry.timestamp)}</span>
                      <span className={`px-2 py-1 rounded-full ${getIntensityColor(entry.intensity)}`}>
                        {entry.intensity}/10
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Techniques Used */}
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                <h3 className="font-medium text-green-800 mb-2">Techniques Used</h3>
                <div className="text-sm text-gray-600">
                  {currentSession.techniquesUsed.length > 0 ? (
                    <span>{currentSession.techniquesUsed.length} techniques practiced</span>
                  ) : (
                    <span>No techniques used yet</span>
                  )}
                </div>
              </div>

              {/* Session Progress */}
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                <h3 className="font-medium text-purple-800 mb-2">Session Progress</h3>
                <div className="text-sm text-gray-600">
                  <div>Duration: {Math.floor((Date.now() - currentSession.startTime.getTime()) / (1000 * 60))}m</div>
                  <div>Messages: {messages.length}</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProtocolEnhancedAITherapist;
