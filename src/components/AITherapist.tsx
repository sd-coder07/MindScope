'use client';

import { aiTherapistService, type TherapistMessage } from '@/lib/aiTherapistService';
import { conversationStorage, type StoredConversation, type UserPreferences } from '@/lib/conversationStorage';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  Bot,
  Download,
  History,
  MessageCircle,
  Mic,
  MicOff,
  Save,
  Send,
  Volume2,
  VolumeX,
  X
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: number;
  emotion?: string;
  audioUrl?: string;
  therapeuticTechnique?: string;
  crisisLevel?: 'low' | 'medium' | 'high' | 'critical';
  followUpSuggestions?: string[];
}

interface AITherapistProps {
  isDarkMode?: boolean;
}

export default function AITherapist({ isDarkMode = false }: AITherapistProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationHistory, setConversationHistory] = useState<TherapistMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [aiStatus, setAiStatus] = useState(aiTherapistService.getStatus());

  // New conversation persistence state
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<number>(0);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [showConversationHistory, setShowConversationHistory] = useState(false);
  const [savedConversations, setSavedConversations] = useState<StoredConversation[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);
  const saveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    // Initialize speech synthesis
    if (typeof window !== 'undefined') {
      synthesisRef.current = window.speechSynthesis;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthesisRef.current) {
        synthesisRef.current.cancel();
      }
    };
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize conversation storage and load preferences
  useEffect(() => {
    const initializeStorage = async () => {
      try {
        await conversationStorage.initialize();
        const preferences = await conversationStorage.getPreferences();
        if (preferences) {
          setUserPreferences(preferences);
          setVoiceEnabled(preferences.voiceEnabled);
        } else {
          // Create default preferences
          const defaultPreferences: UserPreferences = {
            id: 'default',
            voiceEnabled: true,
            preferredLanguage: 'en-US',
            therapeuticApproaches: ['CBT', 'mindfulness'],
            crisisContacts: [],
            privacySettings: {
              shareAnonymousData: false,
              retainConversations: true,
              autoDeleteAfterDays: 90
            }
          };
          await conversationStorage.savePreferences(defaultPreferences);
          setUserPreferences(defaultPreferences);
        }

        // Load recent conversations
        const recent = await conversationStorage.getConversations({ limit: 10 });
        setSavedConversations(recent);
      } catch (error) {
        console.error('Error initializing conversation storage:', error);
      }
    };

    initializeStorage();
  }, []);

  // Auto-save conversation periodically
  useEffect(() => {
    if (sessionStarted && conversationHistory.length > 0) {
      saveIntervalRef.current = setInterval(() => {
        saveCurrentConversation();
      }, 30000); // Save every 30 seconds

      return () => {
        if (saveIntervalRef.current) {
          clearInterval(saveIntervalRef.current);
        }
      };
    }
  }, [sessionStarted, conversationHistory]);

  // Save conversation when session ends
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (sessionStarted && conversationHistory.length > 0) {
        saveCurrentConversation();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [sessionStarted, conversationHistory]);

  // Save current conversation to IndexedDB
  const saveCurrentConversation = async () => {
    if (!sessionStarted || conversationHistory.length === 0) return;

    try {
      setIsAutoSaving(true);
      
      // Generate session ID if not exists
      let sessionId = currentSessionId;
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        setCurrentSessionId(sessionId);
      }

      // Analyze conversation for emotional summary
      const emotionalSummary = analyzeConversationEmotions(messages);
      const userMetrics = calculateUserMetrics(messages);

      const conversationData: StoredConversation = {
        id: sessionId,
        sessionId,
        messages: conversationHistory,
        startTime: messages[0]?.timestamp || Date.now(),
        lastActivity: Date.now(),
        emotionalSummary,
        userMetrics,
        tags: generateConversationTags(emotionalSummary),
        archived: false
      };

      await conversationStorage.saveConversation(conversationData);
      setLastSavedAt(Date.now());
      
      // Update saved conversations list
      const recent = await conversationStorage.getConversations({ limit: 10 });
      setSavedConversations(recent);
      
    } catch (error) {
      console.error('Error saving conversation:', error);
    } finally {
      setIsAutoSaving(false);
    }
  };

  // Analyze conversation emotions for summary
  const analyzeConversationEmotions = (messages: Message[]) => {
    const emotions: string[] = [];
    const contexts: string[] = [];
    const crisisLevels: string[] = [];
    const therapeuticTechniques: string[] = [];

    messages.forEach(message => {
      if (message.emotion) emotions.push(message.emotion);
      if (message.crisisLevel) crisisLevels.push(message.crisisLevel);
      if (message.therapeuticTechnique) therapeuticTechniques.push(message.therapeuticTechnique);
    });

    // Get unique values and most frequent ones
    const uniqueEmotions = [...new Set(emotions)];
    const uniqueContexts = [...new Set(contexts)];
    const uniqueCrisisLevels = [...new Set(crisisLevels)];
    const uniqueTechniques = [...new Set(therapeuticTechniques)];

    return {
      primaryEmotions: uniqueEmotions.slice(0, 3), // Top 3 emotions
      contexts: uniqueContexts.slice(0, 3),
      crisisLevels: uniqueCrisisLevels,
      therapeuticTechniques: uniqueTechniques
    };
  };

  // Calculate user engagement metrics
  const calculateUserMetrics = (messages: Message[]) => {
    const userMessages = messages.filter(m => m.isUser);
    const sessionDuration = messages.length > 0 
      ? (messages[messages.length - 1].timestamp - messages[0].timestamp) / 1000 
      : 0;

    return {
      messageCount: userMessages.length,
      sessionDuration,
      averageResponseTime: sessionDuration / Math.max(userMessages.length, 1),
      emotionalProgress: 0 // Placeholder for future sentiment analysis
    };
  };

  // Generate conversation tags
  const generateConversationTags = (emotionalSummary: any): string[] => {
    const tags: string[] = [];
    
    // Add emotion-based tags
    emotionalSummary.primaryEmotions.forEach((emotion: string) => {
      tags.push(`emotion:${emotion}`);
    });

    // Add context-based tags
    emotionalSummary.contexts.forEach((context: string) => {
      tags.push(`context:${context}`);
    });

    // Add crisis level tags
    if (emotionalSummary.crisisLevels.includes('high') || emotionalSummary.crisisLevels.includes('critical')) {
      tags.push('needs_attention');
    }

    // Add technique tags
    emotionalSummary.therapeuticTechniques.forEach((technique: string) => {
      tags.push(`technique:${technique}`);
    });

    return tags;
  };

  // Load previous conversation
  const loadConversation = async (conversationId: string) => {
    try {
      const conversation = await conversationStorage.getConversation(conversationId);
      if (conversation) {
        setConversationHistory(conversation.messages);
        
        // Convert to display messages
        const displayMessages: Message[] = conversation.messages.map((msg, index) => ({
          id: `loaded_${index}`,
          content: msg.content,
          isUser: msg.role === 'user',
          timestamp: msg.timestamp || Date.now(),
          emotion: msg.emotion
        }));
        
        setMessages(displayMessages);
        setCurrentSessionId(conversation.sessionId);
        setSessionStarted(true);
        setShowConversationHistory(false);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const startSession = () => {
    setSessionStarted(true);
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      content: aiStatus.configured 
        ? "Hello! I'm your AI Therapist powered by advanced language models. I'm here to listen and support you through whatever you're experiencing. How are you feeling today?"
        : "Hello! I'm your AI Therapist. I'm here to listen and support you through whatever you're experiencing. How are you feeling today? (Note: I'm currently running in demonstration mode with therapeutic conversation patterns.)",
      isUser: false,
      timestamp: Date.now(),
      emotion: 'welcoming'
    };
    setMessages([welcomeMessage]);
    
    // Add to conversation history
    setConversationHistory([{
      role: 'assistant',
      content: welcomeMessage.content,
      timestamp: Date.now(),
      emotion: 'welcoming'
    }]);
    
    if (voiceEnabled) {
      speakMessage(welcomeMessage.content);
    }
  };

  const speakMessage = (text: string) => {
    if (synthesisRef.current && voiceEnabled) {
      setIsSpeaking(true);
      
      // Cancel any ongoing speech
      synthesisRef.current.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 0.9;
      
      // Try to use a more natural voice if available
      const voices = synthesisRef.current.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Natural') || 
        voice.name.includes('Enhanced') || 
        voice.name.includes('Neural') ||
        voice.lang.startsWith('en')
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      utterance.onstart = () => {
        console.log('Speech started');
      };
      
      utterance.onend = () => {
        setIsSpeaking(false);
        console.log('Speech ended');
      };
      
      utterance.onerror = (event) => {
        setIsSpeaking(false);
        console.error('Speech error:', event);
      };
      
      synthesisRef.current.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else if (recognitionRef.current) {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const generateTherapistResponse = async (userMessage: string): Promise<Message> => {
    try {
      // Generate AI response using the service
      const response = await aiTherapistService.generateResponse(userMessage, conversationHistory);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.message,
        isUser: false,
        timestamp: Date.now(),
        emotion: response.emotion,
        therapeuticTechnique: response.therapeuticTechnique,
        crisisLevel: response.crisisLevel,
        followUpSuggestions: response.followUpSuggestions
      };

      return aiMessage;
    } catch (error) {
      console.error('Error generating therapist response:', error);
      
      // Fallback response
      return {
        id: (Date.now() + 1).toString(),
        content: "I'm here to listen and support you. Sometimes I may have technical difficulties, but I want you to know that your feelings are valid and important. What would you like to talk about?",
        isUser: false,
        timestamp: Date.now(),
        emotion: 'supportive'
      };
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      isUser: true,
      timestamp: Date.now()
    };

    // Add user message to conversation history
    const userHistoryMessage: TherapistMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setConversationHistory(prev => [...prev, userHistoryMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Generate AI response
      const aiMessage = await generateTherapistResponse(inputMessage);
      
      setTimeout(() => {
        setMessages(prev => [...prev, aiMessage]);
        setIsTyping(false);

        // Add AI response to conversation history
        const aiHistoryMessage: TherapistMessage = {
          role: 'assistant',
          content: aiMessage.content,
          timestamp: aiMessage.timestamp,
          emotion: aiMessage.emotion
        };
        setConversationHistory(prev => [...prev, aiHistoryMessage]);

        // Speak the response if voice is enabled
        if (voiceEnabled) {
          speakMessage(aiMessage.content);
        }
      }, 1500); // Simulate thinking time

    } catch (error) {
      console.error('Error generating response:', error);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!sessionStarted) {
    return (
      <div className={`w-full h-[600px] rounded-3xl p-8 flex flex-col items-center justify-center ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } border shadow-xl`}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-6"
        >
          <div className={`w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-6`}>
            <Bot className="w-10 h-10 text-white" />
          </div>
          
          <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            AI Therapist
          </h2>
          
          <p className={`text-lg max-w-md ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            A safe, confidential space to talk about your thoughts and feelings. 
            I'm here to listen and support you.
          </p>

          <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center space-x-2">
              <MessageCircle className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Text Chat</span>
            </div>
            <div className="flex items-center space-x-2">
              <Volume2 className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Voice Responses</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mic className={`w-5 h-5 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Voice Input</span>
            </div>
          </div>

          {/* AI Status Indicator */}
          <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs ${
            aiStatus.configured 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              aiStatus.configured ? 'bg-green-500' : 'bg-yellow-500'
            }`} />
            <span>
              {aiStatus.configured 
                ? `AI Model: ${aiStatus.model}` 
                : 'Demo Mode - Therapeutic Patterns'
              }
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startSession}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Start New Session
            </motion.button>

            {savedConversations.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowConversationHistory(true)}
                className={`px-6 py-2 rounded-lg border transition-colors ${
                  isDarkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <History className="w-4 h-4" />
                  <span>Continue Previous Session ({savedConversations.length})</span>
                </div>
              </motion.button>
            )}
          </div>

          <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            This AI therapist is for support only and doesn't replace professional therapy
          </p>
        </motion.div>

        {/* Conversation History Modal */}
        {showConversationHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowConversationHistory(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-md p-6 rounded-2xl ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              } border shadow-2xl max-h-[500px] overflow-y-auto`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Previous Sessions
                </h3>
                <button
                  onClick={() => setShowConversationHistory(false)}
                  className={`p-1 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <X className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
              </div>

              <div className="space-y-3">
                {savedConversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => loadConversation(conversation.id)}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                      isDarkMode 
                        ? 'hover:bg-gray-700 border border-gray-600'
                        : 'hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {new Date(conversation.startTime).toLocaleDateString()} at{' '}
                          {new Date(conversation.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {conversation.userMetrics.messageCount} messages • {Math.round(conversation.userMetrics.sessionDuration / 60)} min
                        </p>
                        {conversation.emotionalSummary.primaryEmotions.length > 0 && (
                          <div className="flex space-x-1 mt-2">
                            {conversation.emotionalSummary.primaryEmotions.slice(0, 3).map((emotion, index) => (
                              <span
                                key={index}
                                className={`px-2 py-1 text-xs rounded-full ${
                                  isDarkMode 
                                    ? 'bg-blue-900/30 text-blue-300'
                                    : 'bg-blue-100 text-blue-700'
                                }`}
                              >
                                {emotion}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      {conversation.emotionalSummary.crisisLevels.some(level => ['high', 'critical'].includes(level)) && (
                        <AlertTriangle className="w-4 h-4 text-orange-500 mt-1" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {savedConversations.length === 0 && (
                <p className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  No previous sessions found
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </div>
    );
  }

  return (
    <div className={`w-full h-[600px] rounded-3xl flex flex-col ${
      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    } border shadow-xl overflow-hidden`}>
      
      {/* Header */}
      <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                AI Therapist
              </h3>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {isSpeaking ? 'Speaking...' : 'Online and ready to help'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Auto-save indicator */}
            {isAutoSaving && (
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
                isDarkMode 
                  ? 'bg-blue-900/20 text-blue-300'
                  : 'bg-blue-100 text-blue-600'
              }`}>
                <Save className="w-3 h-3 animate-pulse" />
                <span>Saving...</span>
              </div>
            )}

            {/* Manual save button */}
            <button
              onClick={saveCurrentConversation}
              disabled={conversationHistory.length === 0}
              className={`p-2 rounded-lg transition-colors ${
                conversationHistory.length > 0
                  ? isDarkMode
                    ? 'hover:bg-gray-700 text-gray-300'
                    : 'hover:bg-gray-100 text-gray-600'
                  : 'text-gray-400 cursor-not-allowed'
              }`}
              title="Save conversation"
            >
              <Save className="w-4 h-4" />
            </button>

            {/* Export conversation */}
            <button
              onClick={async () => {
                try {
                  const exportData = await conversationStorage.exportConversations();
                  const blob = new Blob([exportData], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `therapy-conversations-${new Date().toISOString().split('T')[0]}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                } catch (error) {
                  console.error('Error exporting conversations:', error);
                }
              }}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'hover:bg-gray-700 text-gray-300'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
              title="Export all conversations"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`p-2 rounded-lg transition-colors ${
                voiceEnabled 
                  ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' 
                  : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
              }`}
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            
            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                className="p-2 rounded-lg bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400"
              >
                <X className="w-4 h-4" />
              </button>
            )}
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
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] rounded-2xl p-4 ${
                message.isUser
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : isDarkMode
                    ? 'bg-gray-700 text-gray-100'
                    : 'bg-gray-100 text-gray-900'
              }`}>
                {/* Crisis Level Alert */}
                {!message.isUser && (message.crisisLevel === 'high' || message.crisisLevel === 'critical') && (
                  <div className={`flex items-center space-x-2 mb-3 p-2 rounded-lg ${
                    message.crisisLevel === 'critical' 
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      : 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                  }`}>
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-xs font-medium">
                      {message.crisisLevel === 'critical' ? 'Crisis Support Needed' : 'Professional Support Recommended'}
                    </span>
                  </div>
                )}

                <p className="text-sm leading-relaxed">{message.content}</p>

                {/* Follow-up Suggestions */}
                {!message.isUser && message.followUpSuggestions && message.followUpSuggestions.length > 0 && (
                  <div className="mt-3 space-y-1">
                    <p className="text-xs opacity-60 font-medium">Suggestions:</p>
                    {message.followUpSuggestions.map((suggestion, index) => (
                      <div key={index} className="text-xs opacity-80 flex items-start space-x-1">
                        <span>•</span>
                        <span>{suggestion}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between mt-2">
                  <p className={`text-xs opacity-70`}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {!message.isUser && message.therapeuticTechnique && (
                    <span className="text-xs opacity-50 italic">
                      {message.therapeuticTechnique.replace(/_/g, ' ')}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className={`rounded-2xl p-4 ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <div className="flex space-x-1">
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                  className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-gray-400' : 'bg-gray-500'}`}
                />
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                  className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-gray-400' : 'bg-gray-500'}`}
                />
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                  className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-gray-400' : 'bg-gray-500'}`}
                />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Share what's on your mind..."
              className={`w-full p-3 rounded-xl resize-none max-h-24 ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
              } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
              rows={1}
            />
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={toggleListening}
              disabled={isTyping}
              className={`p-3 rounded-xl transition-colors ${
                isListening
                  ? 'bg-red-500 text-white'
                  : isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } disabled:opacity-50`}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
