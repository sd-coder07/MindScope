'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertCircle,
    Bot,
    Calendar,
    CheckCircle,
    Clock,
    Headphones,
    Heart,
    MessageSquare,
    Mic,
    Paperclip,
    Phone,
    Send,
    Star,
    User,
    UserCheck,
    Video,
    Wind,
    X
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

// Add styles for recommendation cards
const recommendationStyles = `
  .recommendation-container {
    margin: 10px 0;
  }
  
  .rec-title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 12px;
  }
  
  .rec-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .rec-item {
    border: 1px solid;
    border-radius: 16px;
    padding: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    backdrop-filter: blur(10px);
  }
  
  /* Light mode styles */
  .rec-item.light {
    background: linear-gradient(135deg, rgba(248, 250, 255, 0.9) 0%, rgba(241, 245, 255, 0.9) 100%);
    border-color: #e5e7eb;
  }
  
  .rec-item.light:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(79, 70, 229, 0.15);
    border-color: #4F46E5;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 255, 0.95) 100%);
  }
  
  .rec-item.light .rec-title {
    color: #4F46E5;
  }
  
  .rec-item.light .rec-item-title {
    color: #1f2937;
  }
  
  .rec-item.light .rec-description {
    color: #6b7280;
  }
  
  /* Dark mode styles */
  .rec-item.dark {
    background: linear-gradient(135deg, rgba(17, 24, 39, 0.9) 0%, rgba(31, 41, 55, 0.9) 100%);
    border-color: #374151;
  }
  
  .rec-item.dark:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(99, 102, 241, 0.25);
    border-color: #6366f1;
    background: linear-gradient(135deg, rgba(31, 41, 55, 0.95) 0%, rgba(55, 65, 81, 0.95) 100%);
  }
  
  .rec-item.dark .rec-title {
    color: #818cf8;
  }
  
  .rec-item.dark .rec-item-title {
    color: #f9fafb;
  }
  
  .rec-item.dark .rec-description {
    color: #d1d5db;
  }
  
  .rec-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }
  
  .rec-icon {
    font-size: 18px;
  }
  
  .rec-duration {
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
  }
  
  .rec-duration.light {
    background: #4F46E5;
    color: white;
  }
  
  .rec-duration.dark {
    background: #6366f1;
    color: white;
  }
  
  .rec-item-title {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 6px;
    line-height: 1.3;
  }
  
  .rec-description {
    font-size: 12px;
    margin-bottom: 10px;
    line-height: 1.4;
  }
  
  .rec-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }
  
  .rec-tag {
    padding: 2px 6px;
    border-radius: 8px;
    font-size: 10px;
    font-weight: 500;
  }
  
  .rec-tag.light {
    background: #e0e7ff;
    color: #4338ca;
  }
  
  .rec-tag.dark {
    background: #312e81;
    color: #c7d2fe;
  }
  
  .rec-item::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #4F46E5, #7C3AED, #EC4899);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  .rec-item:hover::before {
    opacity: 1;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = recommendationStyles;
  document.head.appendChild(styleElement);
}

interface ChatSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

interface Message {
  id: string;
  sender: 'user' | 'support' | 'bot';
  content: string;
  timestamp: Date;
  type: 'text' | 'system' | 'suggestion';
  avatar?: string;
  senderName?: string;
}

interface SupportAgent {
  id: string;
  name: string;
  role: 'therapist' | 'crisis' | 'peer' | 'ai';
  status: 'online' | 'busy' | 'away';
  specialty: string;
  avatar: string;
  responseTime: string;
  rating: number;
}

interface MediaRecommendation {
  id: string;
  title: string;
  type: 'youtube' | 'podcast' | 'article' | 'meditation';
  url: string;
  duration: string;
  thumbnail?: string;
  description: string;
  tags: string[];
}

const ChatSupportModal: React.FC<ChatSupportModalProps> = ({ isOpen, onClose, isDarkMode }) => {
  const [activeTab, setActiveTab] = useState('chat');
  const [selectedAgent, setSelectedAgent] = useState<SupportAgent | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const supportAgents: SupportAgent[] = [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      role: 'therapist',
      status: 'online',
      specialty: 'Anxiety & Depression',
      avatar: '👩‍⚕️',
      rating: 4.9,
      responseTime: '< 2 min'
    },
    {
      id: '2', 
      name: 'Mike Chen',
      role: 'peer',
      status: 'online',
      specialty: 'Peer Support Specialist',
      avatar: '👨‍💼',
      rating: 4.8,
      responseTime: '< 1 min'
    },
    {
      id: '3',
      name: 'Crisis Support Team',
      role: 'crisis',
      status: 'online',
      specialty: '24/7 Emergency Support',
      avatar: '🚨',
      rating: 5.0,
      responseTime: 'Immediate'
    },
    {
      id: '4',
      name: 'MindScope AI',
      role: 'ai',
      status: 'online',
      specialty: 'AI Wellness Assistant',
      avatar: '🤖',
      rating: 4.7,
      responseTime: 'Instant'
    }
  ];

  const quickSuggestions = [
    "I'm feeling anxious today",
    "Need help with sleep issues",
    "Relationship problems",
    "Work stress management",
    "Depression support",
    "Panic attack help",
    "Recommend calming videos",
    "Find meditation podcasts",
    "Suggest motivational content",
    "Show breathing exercises"
  ];

  // Media recommendations based on mood and context
  const getMediaRecommendations = (context: string): MediaRecommendation[] => {
    const recommendations: { [key: string]: MediaRecommendation[] } = {
      anxiety: [
        {
          id: '1',
          title: '10-Minute Anxiety Relief Meditation',
          type: 'youtube',
          url: 'https://www.youtube.com/results?search_query=10+minute+anxiety+relief+meditation',
          duration: '10 min',
          description: 'Guided meditation specifically designed to reduce anxiety and promote calm',
          tags: ['anxiety', 'meditation', 'relaxation']
        },
        {
          id: '2',
          title: 'The Anxiety Guy Podcast',
          type: 'podcast',
          url: 'https://open.spotify.com/search/anxiety%20guy%20podcast',
          duration: '30-45 min',
          description: 'Dennis Simsek shares practical anxiety management techniques',
          tags: ['anxiety', 'podcast', 'mental health']
        },
        {
          id: '3',
          title: 'Box Breathing for Anxiety',
          type: 'youtube',
          url: 'https://www.youtube.com/results?search_query=box+breathing+anxiety+relief',
          duration: '5 min',
          description: 'Learn the 4-4-4-4 breathing technique to calm your nervous system',
          tags: ['breathing', 'anxiety', 'technique']
        }
      ],
      depression: [
        {
          id: '4',
          title: 'Morning Motivation for Depression',
          type: 'youtube',
          url: 'https://www.youtube.com/results?search_query=morning+motivation+depression+recovery',
          duration: '15 min',
          description: 'Uplifting content to start your day with hope and positivity',
          tags: ['depression', 'motivation', 'morning']
        },
        {
          id: '5',
          title: 'Mental Health Happy Hour Podcast',
          type: 'podcast',
          url: 'https://open.spotify.com/search/mental%20health%20happy%20hour',
          duration: '60 min',
          description: 'Paul Gilmartin explores mental health with humor and honesty',
          tags: ['depression', 'podcast', 'humor']
        }
      ],
      sleep: [
        {
          id: '6',
          title: 'Rain Sounds for Deep Sleep',
          type: 'youtube',
          url: 'https://www.youtube.com/results?search_query=rain+sounds+deep+sleep+8+hours',
          duration: '8 hours',
          description: 'Natural rain sounds to help you fall asleep and stay asleep',
          tags: ['sleep', 'nature', 'relaxation']
        },
        {
          id: '7',
          title: 'Sleep With Me Podcast',
          type: 'podcast',
          url: 'https://open.spotify.com/search/sleep%20with%20me%20podcast',
          duration: '60 min',
          description: 'Boring bedtime stories to help you fall asleep',
          tags: ['sleep', 'podcast', 'bedtime']
        }
      ],
      stress: [
        {
          id: '8',
          title: '5-Minute Stress Relief Meditation',
          type: 'youtube',
          url: 'https://www.youtube.com/results?search_query=5+minute+stress+relief+meditation',
          duration: '5 min',
          description: 'Quick meditation to release tension and stress',
          tags: ['stress', 'meditation', 'quick']
        },
        {
          id: '9',
          title: 'On Being Podcast',
          type: 'podcast',
          url: 'https://open.spotify.com/search/on%20being%20podcast',
          duration: '50 min',
          description: 'Krista Tippett explores meaning, spirituality, and stress management',
          tags: ['stress', 'spirituality', 'wisdom']
        }
      ],
      motivation: [
        {
          id: '10',
          title: 'Daily Motivation | Mental Health Recovery',
          type: 'youtube',
          url: 'https://www.youtube.com/results?search_query=daily+motivation+mental+health+recovery',
          duration: '10 min',
          description: 'Inspiring messages for mental health recovery and personal growth',
          tags: ['motivation', 'recovery', 'inspiration']
        },
        {
          id: '11',
          title: 'The Tim Ferriss Show',
          type: 'podcast',
          url: 'https://open.spotify.com/search/tim%20ferriss%20show',
          duration: '90 min',
          description: 'World-class performers share tactics, tools, and routines',
          tags: ['motivation', 'success', 'growth']
        }
      ]
    };

    // Match context to recommendations
    for (const [key, recs] of Object.entries(recommendations)) {
      if (context.toLowerCase().includes(key)) {
        return recs;
      }
    }

    // Default recommendations
    return recommendations.anxiety;
  };

  const tabs = [
    { id: 'chat', label: 'Live Chat', icon: MessageSquare },
    { id: 'agents', label: 'Support Team', icon: UserCheck },
    { id: 'crisis', label: 'Crisis Support', icon: AlertCircle },
    { id: 'resources', label: 'Resources', icon: Heart }
  ];

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Initialize with welcome message
      setMessages([
        {
          id: '1',
          sender: 'bot',
          content: "Hi! I'm here to help connect you with the right support. How are you feeling today?",
          timestamp: new Date(),
          type: 'text',
          senderName: 'MindScope Support'
        }
      ]);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: inputMessage,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate support response
    setTimeout(() => {
      const supportResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'support',
        content: generateSupportResponse(inputMessage),
        timestamp: new Date(),
        type: 'text',
        senderName: selectedAgent?.name || 'Support Team'
      };
      setMessages(prev => [...prev, supportResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateSupportResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('anxious') || lowerMessage.includes('anxiety')) {
      // Add media recommendations after the response
      setTimeout(() => {
        addMediaRecommendations('anxiety');
      }, 2000);
      return "I understand you're feeling anxious. That's completely valid. Let's work through this together. Have you tried any breathing exercises today? I can guide you through a quick 4-7-8 breathing technique. I'll also share some helpful resources in a moment.";
    } else if (lowerMessage.includes('sleep') || lowerMessage.includes('insomnia')) {
      setTimeout(() => {
        addMediaRecommendations('sleep');
      }, 2000);
      return "Sleep issues can really impact your wellbeing. I'd like to help you develop better sleep hygiene. What time do you usually go to bed, and what's your evening routine like? I have some excellent sleep resources to share with you.";
    } else if (lowerMessage.includes('sad') || lowerMessage.includes('depression')) {
      setTimeout(() => {
        addMediaRecommendations('depression');
      }, 2000);
      return "Thank you for sharing that with me. It takes courage to reach out. You're not alone in this. Would you like to talk about what's been contributing to these feelings? I have some uplifting content that might help.";
    } else if (lowerMessage.includes('stress')) {
      setTimeout(() => {
        addMediaRecommendations('stress');
      }, 2000);
      return "Stress can be overwhelming. Let's work on some strategies to help you manage it better. What's been your biggest source of stress lately? I'll share some quick stress-relief techniques with you.";
    } else if (lowerMessage.includes('recommend') || lowerMessage.includes('video') || lowerMessage.includes('podcast')) {
      setTimeout(() => {
        addMediaRecommendations('motivation');
      }, 2000);
      return "I'd love to share some personalized recommendations with you! Based on your needs, I'll suggest videos, podcasts, and other resources that can support your wellness journey.";
    } else if (lowerMessage.includes('motivation') || lowerMessage.includes('inspire')) {
      setTimeout(() => {
        addMediaRecommendations('motivation');
      }, 2000);
      return "Everyone needs motivation sometimes! I have some wonderful inspirational content that can help boost your mood and energy. What kind of motivation resonates with you most?";
    } else if (lowerMessage.includes('crisis') || lowerMessage.includes('emergency')) {
      return "I want to make sure you get immediate help. If you're in crisis, please call 988 (Suicide & Crisis Lifeline) or go to your nearest emergency room. Would you like me to connect you with our crisis support team right now?";
    } else {
      return "Thank you for reaching out. I'm here to listen and support you. Can you tell me more about what's on your mind today? Remember, this is a safe space.";
    }
  };

  const addMediaRecommendations = (context: string) => {
    const recommendations = getMediaRecommendations(context);
    
    const recommendationMessage: Message = {
      id: (Date.now() + Math.random()).toString(),
      sender: 'bot',
      content: createRecommendationHTML(recommendations, context),
      timestamp: new Date(),
      type: 'suggestion',
      senderName: 'MindScope AI'
    };
    
    setMessages(prev => [...prev, recommendationMessage]);
  };

  const createRecommendationHTML = (recommendations: MediaRecommendation[], context: string): string => {
    const contextLabels: { [key: string]: string } = {
      anxiety: '🌊 Calming Resources for Anxiety',
      depression: '🌟 Uplifting Content for You',
      sleep: '😴 Sleep & Relaxation Aids',
      stress: '🧘 Stress Relief Resources',
      motivation: '💪 Motivational Content'
    };

    const title = contextLabels[context] || '🎯 Recommended Resources';
    const themeClass = isDarkMode ? 'dark' : 'light';
    
    let html = `<div class="recommendation-container">
      <h4 class="rec-title ${themeClass}">${title}</h4>
      <div class="rec-grid">`;
    
    recommendations.forEach(rec => {
      const icon = rec.type === 'youtube' ? '📺' : 
                   rec.type === 'podcast' ? '🎧' : 
                   rec.type === 'meditation' ? '🧘' : '📖';
      
      html += `
        <div class="rec-item ${themeClass}" onclick="window.open('${rec.url}', '_blank')">
          <div class="rec-header">
            <span class="rec-icon">${icon}</span>
            <span class="rec-duration ${themeClass}">${rec.duration}</span>
          </div>
          <h5 class="rec-item-title">${rec.title}</h5>
          <p class="rec-description">${rec.description}</p>
          <div class="rec-tags">
            ${rec.tags.map(tag => `<span class="rec-tag ${themeClass}">#${tag}</span>`).join('')}
          </div>
        </div>`;
    });
    
    html += `</div></div>`;
    
    return html;
  };

  const handleQuickSuggestion = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  const handleConnectAgent = (agent: SupportAgent) => {
    setSelectedAgent(agent);
    setActiveTab('chat');
    
    const connectionMessage: Message = {
      id: Date.now().toString(),
      sender: 'bot',
      content: `You're now connected with ${agent.name}, ${agent.specialty}. They'll be with you shortly.`,
      timestamp: new Date(),
      type: 'system'
    };
    
    setMessages(prev => [...prev, connectionMessage]);
  };

  if (!isOpen) return null;

  const renderChat = () => (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className={`p-4 border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {selectedAgent ? selectedAgent.name : 'Support Chat'}
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {selectedAgent ? `${selectedAgent.specialty} • Online` : 'Connect with support'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}
            >
              <Phone className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}
            >
              <Video className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${
              message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}>
              {message.sender !== 'user' && (
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === 'system' ? 'bg-blue-500' : 
                  message.sender === 'bot' ? 'bg-purple-500' : 'bg-green-500'
                }`}>
                  {message.type === 'system' ? <CheckCircle className="w-4 h-4 text-white" /> :
                   message.sender === 'bot' ? <Bot className="w-4 h-4 text-white" /> :
                   <User className="w-4 h-4 text-white" />}
                </div>
              )}
              <div className={`px-4 py-2 rounded-2xl ${
                message.sender === 'user'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                  : message.type === 'system'
                    ? isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-50 text-blue-700'
                    : isDarkMode ? 'bg-slate-700 text-gray-200' : 'bg-gray-100 text-gray-800'
              }`}>
                {message.type === 'suggestion' ? (
                  <div 
                    dangerouslySetInnerHTML={{ __html: message.content }}
                    className="recommendation-message"
                  />
                ) : (
                  <p className="text-sm">{message.content}</p>
                )}
                <p className={`text-xs mt-1 ${
                  message.sender === 'user' 
                    ? 'text-purple-200' 
                    : isDarkMode ? 'text-gray-500' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
        
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className={`px-4 py-2 rounded-2xl ${isDarkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions */}
      {messages.length <= 1 && (
        <div className="p-4 border-t border-b border-gray-200">
          <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Quick topics:
          </p>
          <div className="flex flex-wrap gap-2">
            {quickSuggestions.map((suggestion, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.05 }}
                onClick={() => handleQuickSuggestion(suggestion)}
                className={`px-3 py-2 rounded-full text-sm border transition-all ${
                  isDarkMode
                    ? 'border-slate-600 text-gray-300 hover:border-purple-500 hover:text-white'
                    : 'border-gray-300 text-gray-600 hover:border-purple-500 hover:text-purple-600'
                }`}
              >
                {suggestion}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className={`p-4 border-t ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
        <div className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
              className={`w-full px-4 py-3 rounded-2xl border transition-all ${
                isDarkMode
                  ? 'bg-slate-800 border-slate-600 text-white placeholder-gray-400 focus:border-purple-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500'
              } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
              <motion.button
                whileHover={{ scale: 1.1 }}
                className={`p-1 rounded-lg ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}
              >
                <Paperclip className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                className={`p-1 rounded-lg ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}
              >
                <Mic className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </motion.button>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
            className={`p-3 rounded-2xl transition-all ${
              inputMessage.trim()
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                : isDarkMode ? 'bg-slate-700 text-gray-500' : 'bg-gray-200 text-gray-400'
            }`}
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </div>
  );

  const renderAgents = () => (
    <div className="space-y-4">
      {supportAgents.map((agent) => (
        <motion.div
          key={agent.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            isDarkMode
              ? 'bg-slate-800 border-slate-700 hover:border-purple-500'
              : 'bg-white border-gray-200 hover:border-purple-500'
          }`}
          onClick={() => handleConnectAgent(agent)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                agent.role === 'therapist' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                agent.role === 'crisis' ? 'bg-gradient-to-r from-red-500 to-pink-500' :
                agent.role === 'peer' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                'bg-gradient-to-r from-purple-500 to-indigo-500'
              }`}>
                {agent.role === 'ai' ? <Bot className="w-6 h-6 text-white" /> : <User className="w-6 h-6 text-white" />}
              </div>
              <div>
                <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {agent.name}
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {agent.specialty}
                </p>
                <div className="flex items-center space-x-3 mt-1">
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-yellow-500" />
                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {agent.rating}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-blue-500" />
                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {agent.responseTime}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                agent.status === 'online' ? 'bg-green-500' :
                agent.status === 'busy' ? 'bg-yellow-500' : 'bg-gray-400'
              }`} />
              <span className={`text-xs capitalize ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {agent.status}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderCrisis = () => (
    <div className="space-y-6">
      <div className={`p-6 rounded-xl border-2 border-red-500/30 ${
        isDarkMode ? 'bg-red-900/20' : 'bg-red-50'
      }`}>
        <div className="flex items-center space-x-3 mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
          <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Crisis Support
          </h3>
        </div>
        <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          If you&apos;re experiencing a mental health crisis, immediate help is available 24/7.
        </p>
        <div className="space-y-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            className="w-full p-4 bg-red-600 text-white rounded-xl font-semibold flex items-center justify-center space-x-2"
          >
            <Phone className="w-5 h-5" />
            <span>Call 988 - Crisis Lifeline</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            className="w-full p-4 bg-blue-600 text-white rounded-xl font-semibold flex items-center justify-center space-x-2"
          >
            <MessageSquare className="w-5 h-5" />
            <span>Text HOME to 741741</span>
          </motion.button>
        </div>
      </div>

      <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-white'} border ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
        <h4 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Emergency Resources
        </h4>
        <div className="space-y-2">
          {[
            { label: 'National Suicide Prevention Lifeline', number: '988' },
            { label: 'Crisis Text Line', number: 'Text HOME to 741741' },
            { label: 'SAMHSA National Helpline', number: '1-800-662-4357' },
            { label: 'Emergency Services', number: '911' }
          ].map((resource, index) => (
            <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {resource.label}
              </span>
              <span className={`text-sm font-mono ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                {resource.number}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderResources = () => (
    <div className="space-y-4">
      {[
        {
          title: 'Self-Care Toolkit',
          description: 'Immediate coping strategies and exercises',
          icon: Heart,
          color: 'from-pink-500 to-rose-500'
        },
        {
          title: 'Guided Meditations',
          description: 'Audio sessions for anxiety and stress relief',
          icon: Headphones,
          color: 'from-purple-500 to-indigo-500'
        },
        {
          title: 'Breathing Exercises',
          description: 'Quick techniques to calm your mind',
          icon: Wind,
          color: 'from-blue-500 to-cyan-500'
        },
        {
          title: 'Emergency Contacts',
          description: 'Quick access to crisis support numbers',
          icon: Phone,
          color: 'from-red-500 to-pink-500'
        },
        {
          title: 'Schedule Appointment',
          description: 'Book a session with a licensed therapist',
          icon: Calendar,
          color: 'from-green-500 to-emerald-500'
        }
      ].map((resource, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            isDarkMode
              ? 'bg-slate-800 border-slate-700 hover:border-purple-500'
              : 'bg-white border-gray-200 hover:border-purple-500'
          }`}
        >
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 bg-gradient-to-r ${resource.color} rounded-lg flex items-center justify-center`}>
              <resource.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {resource.title}
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {resource.description}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-lg z-[9999] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 60 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 60 }}
          transition={{ type: "spring", damping: 30, stiffness: 400 }}
          onClick={(e) => e.stopPropagation()}
          className={`w-full max-w-5xl h-[92vh] rounded-3xl overflow-hidden relative ${
            isDarkMode 
              ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 border border-gray-700' 
              : 'bg-gradient-to-br from-white via-gray-50 to-slate-100 border border-gray-200'
          } shadow-2xl flex flex-col`}
        >
          {/* Glassmorphism overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none" />
          
          {/* Header */}
          <div className={`relative z-10 p-6 border-b backdrop-blur-sm ${
            isDarkMode ? 'border-slate-700/50 bg-gray-900/50' : 'border-gray-200/50 bg-white/50'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className={`text-2xl font-bold bg-gradient-to-r ${
                    isDarkMode 
                      ? 'from-white via-blue-100 to-purple-100' 
                      : 'from-gray-900 via-blue-900 to-purple-900'
                  } bg-clip-text text-transparent`}>
                    Live Chat Support
                  </h2>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Connect with mental health professionals
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className={`p-3 rounded-2xl backdrop-blur-sm transition-all ${
                  isDarkMode 
                    ? 'hover:bg-slate-800/80 border border-slate-700' 
                    : 'hover:bg-gray-100/80 border border-gray-200'
                }`}
              >
                <X className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              </motion.button>
            </div>

            {/* Enhanced Tabs */}
            <div className="flex space-x-2 mt-6 p-1 bg-gray-100/50 dark:bg-gray-800/50 rounded-2xl backdrop-blur-sm">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all font-medium ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-lg'
                      : isDarkMode
                        ? 'text-gray-400 hover:text-white hover:bg-slate-800/60'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="text-sm">{tab.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden relative z-10">
            {activeTab === 'chat' && renderChat()}
            {activeTab === 'agents' && (
              <div className="p-6 overflow-y-auto h-full">
                {renderAgents()}
              </div>
            )}
            {activeTab === 'crisis' && (
              <div className="p-6 overflow-y-auto h-full">
                {renderCrisis()}
              </div>
            )}
            {activeTab === 'resources' && (
              <div className="p-6 overflow-y-auto h-full">
                {renderResources()}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ChatSupportModal;
