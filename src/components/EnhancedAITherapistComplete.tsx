'use client';

import { aiTherapistService, type TherapistMessage } from '@/lib/aiTherapistService';
import EnhancedTherapeuticProtocolEngine, {
    type EmotionCategory,
    type TherapeuticApproach,
    type TherapeuticTechnique
} from '@/lib/enhancedTherapeuticProtocolEngine';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Bot,
    Brain,
    Heart,
    Lightbulb,
    Mic,
    MicOff,
    Send,
    Volume2,
    VolumeX,
    X
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import InteractiveGuidedMeditation from './InteractiveGuidedMeditation';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: number;
  emotion?: string;
  therapeuticTechnique?: string;
  crisisLevel?: 'low' | 'medium' | 'high' | 'critical';
  followUpSuggestions?: string[];
  recommendedTechniques?: TherapeuticTechnique[];
}

interface EnhancedAITherapistProps {
  isDarkMode?: boolean;
}

export default function EnhancedAITherapist({ isDarkMode = false }: EnhancedAITherapistProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationHistory, setConversationHistory] = useState<TherapistMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [sessionStarted, setSessionStarted] = useState(false);
  
  // Enhanced therapeutic features
  const [showTechniques, setShowTechniques] = useState(false);
  const [showMeditation, setShowMeditation] = useState(false);
  const [selectedTechnique, setSelectedTechnique] = useState<TherapeuticTechnique | null>(null);
  const [currentEmotions, setCurrentEmotions] = useState<EmotionCategory[]>([]);
  const [emotionalIntensity, setEmotionalIntensity] = useState(5);
  const [preferredApproaches, setPreferredApproaches] = useState<TherapeuticApproach[]>(['CBT', 'mindfulness']);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);
  const protocolEngine = useRef(new EnhancedTherapeuticProtocolEngine());

  // Initialize speech recognition and synthesis
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

  const detectEmotionFromMessage = (message: string): EmotionCategory[] => {
    const lowerMessage = message.toLowerCase();
    const detectedEmotions: EmotionCategory[] = [];

    const emotionKeywords = {
      anxiety: ['anxious', 'worried', 'nervous', 'panic', 'fear', 'overwhelmed'],
      depression: ['sad', 'depressed', 'hopeless', 'empty', 'numb', 'worthless'],
      anger: ['angry', 'mad', 'furious', 'frustrated', 'irritated', 'rage'],
      grief: ['loss', 'death', 'died', 'grief', 'mourning', 'miss'],
      trauma: ['trauma', 'abuse', 'ptsd', 'flashback', 'triggered', 'nightmares'],
      stress: ['stressed', 'pressure', 'overwhelming', 'busy', 'deadline'],
      relationship: ['relationship', 'partner', 'family', 'conflict', 'communication'],
      self_esteem: ['worthless', 'inadequate', 'failure', 'self-doubt', 'confidence']
    };

    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        detectedEmotions.push(emotion as EmotionCategory);
      }
    }

    return detectedEmotions.length > 0 ? detectedEmotions : ['anxiety']; // Default fallback
  };

  const generateTherapistResponse = async (userMessage: string): Promise<Message> => {
    try {
      // Detect emotions from the message
      const detectedEmotions = detectEmotionFromMessage(userMessage);
      setCurrentEmotions(detectedEmotions);

      // Get therapeutic technique recommendations
      const recommendedTechniques = protocolEngine.current.getRecommendedTechniques(
        detectedEmotions,
        emotionalIntensity,
        15, // 15 minutes available
        preferredApproaches
      );

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
        followUpSuggestions: response.followUpSuggestions,
        recommendedTechniques: recommendedTechniques.slice(0, 3) // Top 3 recommendations
      };

      return aiMessage;
    } catch (error) {
      console.error('Error generating therapist response:', error);
      
      // Fallback response with basic technique recommendation
      const fallbackTechniques = protocolEngine.current.getRecommendedTechniques(
        ['anxiety'],
        5,
        10,
        ['mindfulness']
      );

      return {
        id: (Date.now() + 1).toString(),
        content: "I'm here to listen and support you. Sometimes I may have technical difficulties, but I want you to know that your feelings are valid and important. What would you like to talk about?",
        isUser: false,
        timestamp: Date.now(),
        emotion: 'supportive',
        recommendedTechniques: fallbackTechniques.slice(0, 2)
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

  const startSession = () => {
    setSessionStarted(true);
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      content: "Hello! I'm your Enhanced AI Therapist with advanced therapeutic protocols including CBT, DBT, EMDR-informed techniques, and mindfulness practices. I can provide personalized therapeutic interventions and guided meditations. How are you feeling today?",
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

  const startTechnique = (technique: TherapeuticTechnique) => {
    setSelectedTechnique(technique);
    const techniqueMessage: Message = {
      id: Date.now().toString(),
      content: `Let's try the ${technique.name} technique. This is a ${technique.approach} approach that can help with ${technique.category.join(', ')}. ${technique.description}`,
      isUser: false,
      timestamp: Date.now(),
      therapeuticTechnique: technique.id
    };
    setMessages(prev => [...prev, techniqueMessage]);
    
    if (voiceEnabled) {
      speakMessage(techniqueMessage.content);
    }
  };

  if (!sessionStarted) {
    return (
      <div className={`w-full h-[700px] rounded-3xl p-8 flex flex-col items-center justify-center ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } border shadow-xl`}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-6"
        >
          <div className={`w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 flex items-center justify-center mx-auto mb-6`}>
            <Brain className="w-12 h-12 text-white" />
          </div>
          
          <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Enhanced AI Therapist
          </h2>
          
          <p className={`text-lg max-w-2xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Advanced therapeutic support with CBT, DBT, EMDR-informed techniques, and guided meditations. 
            I provide personalized interventions based on your current needs.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="flex flex-col items-center space-y-2">
              <Brain className={`w-8 h-8 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>CBT Techniques</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Heart className={`w-8 h-8 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>DBT Skills</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Lightbulb className={`w-8 h-8 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>EMDR-Informed</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Volume2 className={`w-8 h-8 ${isDarkMode ? 'text-pink-400' : 'text-pink-600'}`} />
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Guided Meditation</span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startSession}
            className="bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 text-white px-10 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
          >
            Start Enhanced Therapy Session
          </motion.button>

          <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            This AI therapist provides evidence-based therapeutic techniques and doesn't replace professional therapy
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Chat Interface */}
      <div className={`w-full h-[600px] rounded-3xl flex flex-col ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } border shadow-xl overflow-hidden`}>
        
        {/* Header */}
        <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Enhanced AI Therapist
                </h3>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {isSpeaking ? 'Speaking...' : 'CBT • DBT • EMDR • Mindfulness'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowTechniques(!showTechniques)}
                className={`p-2 rounded-lg transition-colors ${
                  showTechniques
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                    : isDarkMode
                      ? 'hover:bg-gray-700 text-gray-300'
                      : 'hover:bg-gray-100 text-gray-600'
                }`}
                title="Therapeutic techniques"
              >
                <Brain className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowMeditation(!showMeditation)}
                className={`p-2 rounded-lg transition-colors ${
                  showMeditation
                    ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
                    : isDarkMode
                      ? 'hover:bg-gray-700 text-gray-300'
                      : 'hover:bg-gray-100 text-gray-600'
                }`}
                title="Guided meditation"
              >
                <Heart className="w-4 h-4" />
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
                    ? 'bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 text-white'
                    : isDarkMode
                      ? 'bg-gray-700 text-gray-100'
                      : 'bg-gray-100 text-gray-900'
                }`}>
                  <p className="text-sm leading-relaxed">{message.content}</p>

                  {/* Recommended Techniques */}
                  {!message.isUser && message.recommendedTechniques && message.recommendedTechniques.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs opacity-60 font-medium">Recommended techniques:</p>
                      {message.recommendedTechniques.map((technique, index) => (
                        <button
                          key={index}
                          onClick={() => startTechnique(technique)}
                          className={`w-full text-left p-2 rounded-lg text-xs transition-colors ${
                            isDarkMode 
                              ? 'bg-gray-600 hover:bg-gray-500 text-gray-200'
                              : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
                          }`}
                        >
                          <div className="font-medium">{technique.name}</div>
                          <div className="opacity-70">{technique.approach} • {technique.timeRequired} min</div>
                        </button>
                      ))}
                    </div>
                  )}

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
                className="p-3 rounded-xl bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 text-white hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Guided Meditation Panel */}
      {showMeditation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <InteractiveGuidedMeditation 
            isDarkMode={isDarkMode}
            onComplete={(sessionId, duration) => {
              console.log('Meditation completed:', sessionId, duration);
              const completionMessage: Message = {
                id: Date.now().toString(),
                content: `Wonderful! You completed the ${sessionId} meditation for ${Math.round(duration / 60)} minutes. How are you feeling now?`,
                isUser: false,
                timestamp: Date.now(),
                emotion: 'supportive'
              };
              setMessages(prev => [...prev, completionMessage]);
              if (voiceEnabled) {
                speakMessage(completionMessage.content);
              }
            }}
          />
        </motion.div>
      )}
    </div>
  );
}
