// Database Integration Hook for AI Therapist
import { useState } from 'react';

interface User {
  id: string;
  email: string;
  fullName: string;
}

interface Conversation {
  id: string;
  title: string;
  conversationType: string;
  startTime: string;
  lastMessageAt?: string;
}

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai_therapist' | 'system';
  timestamp: string;
  emotion?: string;
  therapeuticTechnique?: string;
}

interface EmotionEntry {
  id: string;
  primaryEmotion: string;
  intensity: number;
  timestamp: string;
  context?: string;
}

export const useAITherapistDatabase = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Authentication functions
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
        return true;
      } else {
        setError(data.error || 'Login failed');
        return false;
      }
    } catch (error) {
      setError('Network error during login');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, fullName: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName }),
      });

      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
        return true;
      } else {
        setError(data.error || 'Registration failed');
        return false;
      }
    } catch (error) {
      setError('Network error during registration');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setCurrentConversation(null);
      setMessages([]);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Conversation functions
  const startNewConversation = async (
    title: string = 'New Therapy Session', 
    type: 'therapy' | 'crisis' | 'check_in' | 'assessment' = 'therapy'
  ): Promise<Conversation | null> => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          conversationType: type,
          sessionId: crypto.randomUUID(),
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setCurrentConversation(data.conversation);
        setMessages([]);
        return data.conversation;
      }
      
      return null;
    } catch (error) {
      console.error('Start conversation error:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (
    content: string, 
    emotionData?: { emotion: string; intensity: number }
  ): Promise<Message | null> => {
    if (!currentConversation) {
      setError('No active conversation');
      return null;
    }

    try {
      setIsLoading(true);
      
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: currentConversation.id,
          content,
          emotionData,
          sessionId: currentConversation.id,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Add both user and AI messages to the conversation
        setMessages(prev => [...prev, data.userMessage, data.aiMessage]);
        return data.aiMessage;
      }
      
      return null;
    } catch (error) {
      console.error('Send message error:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const recordEmotion = async (
    emotion: string,
    intensity: number,
    context?: string,
    triggers?: string[]
  ): Promise<boolean> => {
    try {
      const response = await fetch('/api/emotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emotion,
          intensity,
          context,
          triggers,
          sessionId: currentConversation?.id,
        }),
      });

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Record emotion error:', error);
      return false;
    }
  };

  const loadConversations = async (): Promise<Conversation[]> => {
    try {
      const response = await fetch('/api/conversations');
      const data = await response.json();
      
      if (data.success) {
        return data.conversations;
      }
      
      return [];
    } catch (error) {
      console.error('Load conversations error:', error);
      return [];
    }
  };

  const loadConversationMessages = async (conversationId: string): Promise<Message[]> => {
    try {
      const response = await fetch(`/api/messages?conversationId=${conversationId}`);
      const data = await response.json();
      
      if (data.success) {
        setMessages(data.messages);
        return data.messages;
      }
      
      return [];
    } catch (error) {
      console.error('Load messages error:', error);
      return [];
    }
  };

  const getEmotionAnalytics = async (): Promise<any> => {
    try {
      const response = await fetch('/api/emotions');
      const data = await response.json();
      
      if (data.success) {
        return data.emotions;
      }
      
      return null;
    } catch (error) {
      console.error('Get emotion analytics error:', error);
      return null;
    }
  };

  return {
    // State
    user,
    currentConversation,
    messages,
    isLoading,
    error,
    
    // Authentication
    login,
    register,
    logout,
    
    // Conversations
    startNewConversation,
    sendMessage,
    loadConversations,
    loadConversationMessages,
    
    // Emotions
    recordEmotion,
    getEmotionAnalytics,
    
    // Utilities
    clearError: () => setError(null),
    setCurrentConversation,
  };
};

export default useAITherapistDatabase;
