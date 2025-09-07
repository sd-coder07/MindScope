// Enhanced AI Therapist with Database Integration and Voice Features
'use client';

import useAITherapistDatabase from '@/hooks/useAITherapistDatabase';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai_therapist' | 'system';
  timestamp: string;
  emotion?: string;
  therapeuticTechnique?: string;
}

interface VoiceSettings {
  enabled: boolean;
  voice: SpeechSynthesisVoice | null;
  rate: number;
  pitch: number;
  volume: number;
}

const DatabaseIntegratedAITherapist: React.FC = () => {
  const {
    user,
    currentConversation,
    messages,
    isLoading,
    error,
    login,
    register,
    logout,
    startNewConversation,
    sendMessage,
    recordEmotion,
    clearError
  } = useAITherapistDatabase();

  // Voice and input states
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    enabled: true,
    voice: null,
    rate: 1,
    pitch: 1,
    volume: 0.8
  });
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  // Authentication states
  const [showAuth, setShowAuth] = useState(!user);
  const [isRegistering, setIsRegistering] = useState(false);
  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: ''
  });

  // Current emotion tracking
  const [currentEmotion, setCurrentEmotion] = useState({
    emotion: '',
    intensity: 5,
    context: ''
  });

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Initialize voice features
  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
      
      // Load available voices
      const loadVoices = () => {
        const voices = synthRef.current?.getVoices() || [];
        setAvailableVoices(voices);
        
        // Set default voice (prefer female voice for therapy)
        const defaultVoice = voices.find(v => 
          v.name.toLowerCase().includes('female') || 
          v.name.toLowerCase().includes('samantha') ||
          v.name.toLowerCase().includes('karen')
        ) || voices[0];
        
        setVoiceSettings(prev => ({ ...prev, voice: defaultVoice }));
      };

      loadVoices();
      if (synthRef.current) {
        synthRef.current.onvoiceschanged = loadVoices;
      }

      // Initialize speech recognition
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          setIsListening(false);
        };

        recognitionRef.current.onerror = () => {
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Text-to-speech function
  const speakMessage = (text: string) => {
    if (!voiceSettings.enabled || !synthRef.current || !voiceSettings.voice) return;

    // Cancel any ongoing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voiceSettings.voice;
    utterance.rate = voiceSettings.rate;
    utterance.pitch = voiceSettings.pitch;
    utterance.volume = voiceSettings.volume;

    synthRef.current.speak(utterance);
  };

  // Auto-speak AI responses
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.sender === 'ai_therapist' && voiceSettings.enabled) {
        // Delay speech slightly to ensure UI updates
        setTimeout(() => speakMessage(lastMessage.content), 500);
      }
    }
  }, [messages, voiceSettings.enabled]);

  // Start voice input
  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  // Stop voice input
  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Handle authentication
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (isRegistering) {
      if (authForm.password !== authForm.confirmPassword) {
        return;
      }
      const success = await register(authForm.email, authForm.password, authForm.fullName);
      if (success) {
        setShowAuth(false);
        await startNewConversation('Welcome Session', 'therapy');
      }
    } else {
      const success = await login(authForm.email, authForm.password);
      if (success) {
        setShowAuth(false);
        await startNewConversation('Therapy Session', 'therapy');
      }
    }
  };

  // Send message with emotion tracking
  const handleSendMessage = async () => {
    if (!input.trim() || !currentConversation) return;

    const messageText = input.trim();
    setInput('');

    // Record emotion if specified
    if (currentEmotion.emotion) {
      await recordEmotion(
        currentEmotion.emotion,
        currentEmotion.intensity,
        currentEmotion.context
      );
    }

    // Send message and get AI response
    await sendMessage(messageText, {
      emotion: currentEmotion.emotion,
      intensity: currentEmotion.intensity
    });

    // Reset emotion tracking
    setCurrentEmotion({ emotion: '', intensity: 5, context: '' });
  };

  // Handle logout
  const handleLogout = async () => {
    await logout();
    setShowAuth(true);
  };

  // Authentication UI
  if (showAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md"
        >
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">MindScope AI</h1>
            <p className="text-gray-600">Your AI Therapy Companion</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {isRegistering && (
              <input
                type="text"
                placeholder="Full Name"
                value={authForm.fullName}
                onChange={(e) => setAuthForm(prev => ({ ...prev, fullName: e.target.value }))}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            )}
            
            <input
              type="email"
              placeholder="Email"
              value={authForm.email}
              onChange={(e) => setAuthForm(prev => ({ ...prev, email: e.target.value }))}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
            
            <input
              type="password"
              placeholder="Password"
              value={authForm.password}
              onChange={(e) => setAuthForm(prev => ({ ...prev, password: e.target.value }))}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />

            {isRegistering && (
              <input
                type="password"
                placeholder="Confirm Password"
                value={authForm.confirmPassword}
                onChange={(e) => setAuthForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            )}

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Please wait...' : (isRegistering ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <div className="text-center mt-4">
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-blue-600 hover:underline"
            >
              {isRegistering ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Main therapy interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">MindScope AI Therapist</h1>
          <p className="text-gray-600">Welcome, {user?.fullName}</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Voice Settings */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setVoiceSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
              className={`p-2 rounded-lg ${voiceSettings.enabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}
            >
              🔊
            </button>
            
            {availableVoices.length > 0 && (
              <select
                value={voiceSettings.voice?.name || ''}
                onChange={(e) => {
                  const voice = availableVoices.find(v => v.name === e.target.value);
                  setVoiceSettings(prev => ({ ...prev, voice: voice || null }));
                }}
                className="text-sm border rounded p-1"
              >
                {availableVoices.map(voice => (
                  <option key={voice.name} value={voice.name}>
                    {voice.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 pb-24">
        <div className="max-w-4xl mx-auto space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-800 shadow-sm'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  
                  {message.therapeuticTechnique && (
                    <div className="mt-2 text-xs opacity-70">
                      Technique: {message.therapeuticTechnique}
                    </div>
                  )}
                  
                  {message.emotion && (
                    <div className="mt-2 text-xs opacity-70">
                      Emotion: {message.emotion}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <div className="max-w-4xl mx-auto">
          {/* Emotion Tracking */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Current Emotion (optional):</p>
            <div className="flex space-x-2 items-center">
              <select
                value={currentEmotion.emotion}
                onChange={(e) => setCurrentEmotion(prev => ({ ...prev, emotion: e.target.value }))}
                className="text-sm border rounded p-1"
              >
                <option value="">Select emotion...</option>
                <option value="happy">Happy</option>
                <option value="sad">Sad</option>
                <option value="anxious">Anxious</option>
                <option value="angry">Angry</option>
                <option value="frustrated">Frustrated</option>
                <option value="excited">Excited</option>
                <option value="calm">Calm</option>
                <option value="stressed">Stressed</option>
              </select>
              
              <input
                type="range"
                min="1"
                max="10"
                value={currentEmotion.intensity}
                onChange={(e) => setCurrentEmotion(prev => ({ ...prev, intensity: parseInt(e.target.value) }))}
                className="flex-1"
              />
              
              <span className="text-sm text-gray-600">{currentEmotion.intensity}/10</span>
            </div>
          </div>

          {/* Message Input */}
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Share your thoughts and feelings..."
              className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            
            <button
              onClick={isListening ? stopListening : startListening}
              className={`p-3 rounded-lg ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-600'}`}
            >
              🎤
            </button>
            
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? '...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseIntegratedAITherapist;
