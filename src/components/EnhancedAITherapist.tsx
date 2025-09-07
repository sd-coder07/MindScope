
'use client';

// Web Speech API type declarations
interface SpeechRecognitionInterface extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: ((this: SpeechRecognitionInterface, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognitionInterface, ev: SpeechRecognitionEvent) => any) | null;
  onend: ((this: SpeechRecognitionInterface, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognitionInterface, ev: SpeechRecognitionErrorEvent) => any) | null;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare global {
  interface Window {
    SpeechRecognition: {
      new(): SpeechRecognitionInterface;
    };
    webkitSpeechRecognition: {
      new(): SpeechRecognitionInterface;
    };
  }
}

import { AnimatePresence, motion } from 'framer-motion';
import {
    Brain,
    Download,
    History,
    Languages,
    Mic,
    MicOff,
    Radio,
    Settings,
    Volume2,
    VolumeX
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import EnhancedVoiceEmotionAnalyzer, {
    EmotionType,
    SupportedLanguage,
    VoiceEmotionData
} from '@/lib/enhancedVoiceAnalysis';
import MultilingualTherapeuticService from '@/lib/multilingualTherapy';

interface EnhancedAITherapistProps {
  className?: string;
}

interface VoiceVisualizationProps {
  isActive: boolean;
  emotionData: VoiceEmotionData | null;
}

const VoiceVisualization: React.FC<VoiceVisualizationProps> = ({ isActive, emotionData }) => {
  return (
    <div className="flex items-center justify-center h-24 mb-4">
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="flex space-x-1"
          >
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className={`w-2 rounded-full ${
                  emotionData?.emotion === 'anxiety' ? 'bg-red-400' :
                  emotionData?.emotion === 'depression' ? 'bg-blue-400' :
                  emotionData?.emotion === 'anger' ? 'bg-orange-400' :
                  emotionData?.emotion === 'calm' ? 'bg-green-400' :
                  emotionData?.emotion === 'joy' ? 'bg-yellow-400' :
                  'bg-purple-400'
                }`}
                animate={{
                  height: isActive ? [4, 32, 4] : 4,
                  opacity: isActive ? [0.5, 1, 0.5] : 0.3
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: "easeInOut"
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      
      {emotionData && (
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute mt-16 text-xs text-gray-600 dark:text-gray-400"
        >
          {emotionData.emotion} ({Math.round(emotionData.confidence * 100)}%)
        </motion.div>
      )}
    </div>
  );
};

const EnhancedAITherapist: React.FC<EnhancedAITherapistProps> = ({ className = '' }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('en');
  const [voiceEmotionData, setVoiceEmotionData] = useState<VoiceEmotionData | null>(null);
  const [isVoiceAnalysisActive, setIsVoiceAnalysisActive] = useState(false);
  const [messages, setMessages] = useState<Array<{
    id: string;
    text: string;
    isUser: boolean;
    emotion?: EmotionType;
    language: SupportedLanguage;
    timestamp: Date;
    confidence?: number;
    voiceData?: VoiceEmotionData;
  }>>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState({
    rate: 0.9,
    pitch: 1.0,
    volume: 0.8
  });

  // Voice and multilingual services
  const voiceAnalyzerRef = useRef<EnhancedVoiceEmotionAnalyzer | null>(null);
  const multilingualServiceRef = useRef<MultilingualTherapeuticService | null>(null);
  const speechRecognitionRef = useRef<any>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize services
  useEffect(() => {
    voiceAnalyzerRef.current = new EnhancedVoiceEmotionAnalyzer();
    multilingualServiceRef.current = new MultilingualTherapeuticService();

    // Setup voice analyzer event listeners
    const analyzer = voiceAnalyzerRef.current;
    analyzer.on('emotionDetected', (emotionData: VoiceEmotionData) => {
      setVoiceEmotionData(emotionData);
    });

    analyzer.on('analysisStarted', () => {
      setIsVoiceAnalysisActive(true);
    });

    analyzer.on('analysisStopped', () => {
      setIsVoiceAnalysisActive(false);
      setVoiceEmotionData(null);
    });

    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      speechRecognitionRef.current = new SpeechRecognition() as any;
      
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.continuous = true;
        speechRecognitionRef.current.interimResults = true;
        speechRecognitionRef.current.lang = getLanguageCode(currentLanguage);

        speechRecognitionRef.current.onstart = () => {
          setIsListening(true);
        };

        speechRecognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = Array.from(event.results)
            .map((result: SpeechRecognitionResult) => result[0])
            .map((result: SpeechRecognitionAlternative) => result.transcript)
            .join('');

          if (event.results[event.results.length - 1].isFinal) {
            setInputText(transcript);
            handleSendMessage(transcript);
          }
        };

        speechRecognitionRef.current.onend = () => {
          setIsListening(false);
        };

        speechRecognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };
      }
    }

    return () => {
      analyzer.removeAllListeners();
      analyzer.stopVoiceEmotionAnalysis();
    };
  }, [currentLanguage]);

  // Update voice settings when language changes
  useEffect(() => {
    if (multilingualServiceRef.current) {
      multilingualServiceRef.current.setLanguage(currentLanguage);
      const newVoiceSettings = multilingualServiceRef.current.getVoiceSettings();
      setVoiceSettings(newVoiceSettings);
    }
  }, [currentLanguage]);

  const getLanguageCode = (lang: SupportedLanguage): string => {
    const langMap: { [key in SupportedLanguage]: string } = {
      'en': 'en-US',
      'es': 'es-ES',
      'fr': 'fr-FR',
      'de': 'de-DE',
      'it': 'it-IT',
      'pt': 'pt-BR',
      'zh': 'zh-CN',
      'ja': 'ja-JP',
      'ko': 'ko-KR',
      'ar': 'ar-SA',
      'hi': 'hi-IN',
      'ru': 'ru-RU'
    };
    return langMap[lang] || 'en-US';
  };

  const startVoiceInput = useCallback(async () => {
    try {
      if (voiceAnalyzerRef.current && !isVoiceAnalysisActive) {
        await voiceAnalyzerRef.current.startVoiceEmotionAnalysis();
      }

      if (speechRecognitionRef.current && !isListening) {
        speechRecognitionRef.current.lang = getLanguageCode(currentLanguage);
        speechRecognitionRef.current.start();
      }
    } catch (error) {
      console.error('Error starting voice input:', error);
    }
  }, [isListening, isVoiceAnalysisActive, currentLanguage]);

  const stopVoiceInput = useCallback(() => {
    if (voiceAnalyzerRef.current) {
      voiceAnalyzerRef.current.stopVoiceEmotionAnalysis();
    }

    if (speechRecognitionRef.current && isListening) {
      speechRecognitionRef.current.stop();
    }
  }, [isListening]);

  const speakResponse = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      // Stop any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = getLanguageCode(currentLanguage);
      utterance.rate = voiceSettings.rate;
      utterance.pitch = voiceSettings.pitch;
      utterance.volume = voiceSettings.volume;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      speechSynthesisRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  }, [currentLanguage, voiceSettings]);

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const handleSendMessage = async (text: string = inputText) => {
    if (!text.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      language: currentLanguage,
      timestamp: new Date(),
      emotion: voiceEmotionData?.emotion,
      voiceData: voiceEmotionData || undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      if (!multilingualServiceRef.current) {
        throw new Error('Multilingual service not initialized');
      }

      const response = await multilingualServiceRef.current.generateMultilingualResponse(
        text.trim(),
        voiceEmotionData?.emotion || null,
        messages.slice(-5).map(m => `${m.isUser ? 'User' : 'AI'}: ${m.text}`).join('\n')
      );

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: response.response,
        isUser: false,
        language: currentLanguage,
        timestamp: new Date(),
        confidence: response.confidenceScore
      };

      setMessages(prev => [...prev, aiMessage]);

      // Speak the response if voice is enabled
      if (isVoiceAnalysisActive) {
        speakResponse(response.response);
      }

    } catch (error) {
      console.error('Error generating response:', error);
      
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: 'I apologize, but I\'m experiencing technical difficulties. Please try again in a moment.',
        isUser: false,
        language: currentLanguage,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageChange = (newLanguage: SupportedLanguage) => {
    setCurrentLanguage(newLanguage);
    
    // Update speech recognition language
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.lang = getLanguageCode(newLanguage);
    }

    // Stop current speech
    stopSpeaking();
  };

  const exportConversation = () => {
    const dataStr = JSON.stringify(messages, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `ai-therapist-conversation-${currentLanguage}-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const getSupportedLanguages = (): Array<{ code: SupportedLanguage; name: string }> => {
    if (!multilingualServiceRef.current) return [{ code: 'en', name: 'English' }];
    
    return multilingualServiceRef.current.getSupportedLanguages().map(config => ({
      code: config.code,
      name: config.name
    }));
  };

  return (
    <div className={`max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg ${className}`}>
      {/* Header with Language Selection and Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Enhanced AI Therapist</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Multilingual Support • Voice Emotion Analysis • Cultural Sensitivity
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Language Selector */}
          <select
            value={currentLanguage}
            onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
            className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500"
          >
            {getSupportedLanguages().map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>

          {/* Settings Button */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Export Button */}
          <button
            onClick={exportConversation}
            disabled={messages.length === 0}
            className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Voice Visualization */}
      <VoiceVisualization isActive={isVoiceAnalysisActive} emotionData={voiceEmotionData} />

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Voice Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Speech Rate: {voiceSettings.rate.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={voiceSettings.rate}
                  onChange={(e) => setVoiceSettings(prev => ({ ...prev, rate: parseFloat(e.target.value) }))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pitch: {voiceSettings.pitch.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={voiceSettings.pitch}
                  onChange={(e) => setVoiceSettings(prev => ({ ...prev, pitch: parseFloat(e.target.value) }))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Volume: {voiceSettings.volume.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={voiceSettings.volume}
                  onChange={(e) => setVoiceSettings(prev => ({ ...prev, volume: parseFloat(e.target.value) }))}
                  className="w-full"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Conversation Area */}
      <div className="h-96 overflow-y-auto mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mb-4 ${message.isUser ? 'text-right' : 'text-left'}`}
            >
              <div
                className={`inline-block max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.isUser
                    ? 'bg-purple-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600'
                }`}
              >
                <p className="text-sm">{message.text}</p>
                
                {/* Message metadata */}
                <div className="mt-2 text-xs opacity-70">
                  <div className="flex items-center justify-between">
                    <span>{message.timestamp.toLocaleTimeString()}</span>
                    <div className="flex items-center space-x-1">
                      {message.language !== 'en' && (
                        <span className="px-1 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-xs">
                          {message.language.toUpperCase()}
                        </span>
                      )}
                      {message.emotion && (
                        <span className="px-1 py-0.5 bg-blue-200 dark:bg-blue-800 rounded text-xs">
                          {message.emotion}
                        </span>
                      )}
                      {message.confidence && (
                        <span className="px-1 py-0.5 bg-green-200 dark:bg-green-800 rounded text-xs">
                          {Math.round(message.confidence * 100)}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-left mb-4"
          >
            <div className="inline-block px-4 py-2 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="flex items-center space-x-3">
        <div className="flex-1 flex items-center space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={`Type your message in ${getSupportedLanguages().find(l => l.code === currentLanguage)?.name || 'English'}...`}
            className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={isLoading || isListening}
          />
          
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isLoading}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>

        {/* Voice Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={isListening ? stopVoiceInput : startVoiceInput}
            className={`p-3 rounded-lg transition-colors ${
              isListening
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            onClick={isSpeaking ? stopSpeaking : undefined}
            disabled={!isSpeaking}
            className={`p-3 rounded-lg transition-colors ${
              isSpeaking
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed'
            }`}
          >
            {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="mt-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-4">
          {isVoiceAnalysisActive && (
            <div className="flex items-center space-x-1">
              <Radio className="w-3 h-3" />
              <span>Voice Analysis Active</span>
            </div>
          )}
          {voiceEmotionData && (
            <div className="flex items-center space-x-1">
              <Brain className="w-3 h-3" />
              <span>Emotion: {voiceEmotionData.emotion} ({Math.round(voiceEmotionData.confidence * 100)}%)</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Languages className="w-3 h-3" />
            <span>{getSupportedLanguages().find(l => l.code === currentLanguage)?.name}</span>
          </div>
          <div className="flex items-center space-x-1">
            <History className="w-3 h-3" />
            <span>{messages.length} messages</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedAITherapist;
