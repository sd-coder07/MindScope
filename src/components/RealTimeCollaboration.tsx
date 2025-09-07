'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  MessageCircle, 
  Share2, 
  Video, 
  Mic, 
  MicOff,
  Camera,
  CameraOff,
  Phone,
  PhoneOff,
  UserPlus,
  Settings,
  Star,
  Heart,
  ThumbsUp,
  Send,
  Smile,
  MapPin,
  Clock,
  Shield,
  CheckCircle,
  AlertCircle,
  Zap,
  Brain,
  Activity
} from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  role: 'therapist' | 'peer' | 'mentor' | 'friend';
  isVideoOn: boolean;
  isAudioOn: boolean;
  mood: number;
  lastSeen: string;
  location?: string;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  type: 'text' | 'mood' | 'support' | 'activity';
  timestamp: Date;
  reactions: { emoji: string; count: number; users: string[] }[];
}

interface Session {
  id: string;
  title: string;
  type: 'therapy' | 'peer-support' | 'meditation' | 'check-in';
  participants: Participant[];
  duration: number;
  isActive: boolean;
  privacy: 'private' | 'group' | 'public';
}

interface RealTimeCollaborationProps {
  isDarkMode?: boolean;
  currentUser?: {
    id: string;
    name: string;
    avatar: string;
  };
}

const RealTimeCollaboration: React.FC<RealTimeCollaborationProps> = ({
  isDarkMode = false,
  currentUser = {
    id: 'user-1',
    name: 'You',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
  }
}) => {
  const [activeTab, setActiveTab] = useState<'sessions' | 'chat' | 'connect'>('sessions');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [myVideoOn, setMyVideoOn] = useState(false);
  const [myAudioOn, setMyAudioOn] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [onlineCount, setOnlineCount] = useState(0);

  // Real-time simulation
  const simulateRealTimeActivity = useCallback(() => {
    // Simulate users joining/leaving
    const activities = [
      'Dr. Sarah Chen joined the session',
      'Alex Rivera is typing...',
      'Jordan Kim shared their mood: 😊',
      'New peer support request',
      'Mindfulness session starting in 5 minutes'
    ];
    
    // Random activity every 10-15 seconds
    const randomDelay = Math.random() * 5000 + 10000;
    setTimeout(() => {
      const activity = activities[Math.floor(Math.random() * activities.length)];
      console.log('Real-time activity:', activity);
      
      // Update online count randomly
      setOnlineCount(prev => Math.max(1, prev + (Math.random() > 0.5 ? 1 : -1)));
      
      simulateRealTimeActivity();
    }, randomDelay);
  }, []);

  // Auto-send supportive messages
  const sendSupportMessage = useCallback(() => {
    const supportMessages = [
      "You're doing great! Keep it up! 💪",
      "Remember to breathe deeply and stay present 🧘‍♀️",
      "The community is here to support you ❤️",
      "Take it one step at a time 🌟",
      "Your mental health journey matters 🌱"
    ];
    
    if (messages.length < 10) { // Limit auto messages
      const newMessage: Message = {
        id: `auto-${Date.now()}`,
        senderId: 'system',
        senderName: 'MindScope Support',
        content: supportMessages[Math.floor(Math.random() * supportMessages.length)],
        type: 'support',
        timestamp: new Date(),
        reactions: []
      };
      
      setMessages(prev => [...prev, newMessage]);
    }
  }, [messages.length]);

  const tabs = [
    { id: 'sessions', label: 'Live Sessions', icon: Video },
    { id: 'chat', label: 'Support Chat', icon: MessageCircle },
    { id: 'connect', label: 'Find Support', icon: UserPlus }
  ];

  // Initialize demo data and real-time features
  useEffect(() => {
    const demoParticipants: Participant[] = [
      {
        id: 'therapist-1',
        name: 'Dr. Sarah Chen',
        avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=40&h=40&fit=crop&crop=face',
        status: 'online',
        role: 'therapist',
        isVideoOn: true,
        isAudioOn: true,
        mood: 8,
        lastSeen: 'now',
        location: 'San Francisco'
      },
      {
        id: 'peer-1',
        name: 'Alex Rivera',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
        status: 'online',
        role: 'peer',
        isVideoOn: false,
        isAudioOn: true,
        mood: 6,
        lastSeen: '2 min ago'
      },
      {
        id: 'mentor-1',
        name: 'Jordan Kim',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
        status: 'away',
        role: 'mentor',
        isVideoOn: true,
        isAudioOn: false,
        mood: 7,
        lastSeen: '5 min ago'
      }
    ];

    const demoSessions: Session[] = [
      {
        id: 'session-1',
        title: 'Morning Mindfulness Circle',
        type: 'meditation',
        participants: demoParticipants.slice(0, 2),
        duration: 25,
        isActive: true,
        privacy: 'group'
      },
      {
        id: 'session-2',
        title: 'Anxiety Support Group',
        type: 'peer-support',
        participants: demoParticipants,
        duration: 45,
        isActive: true,
        privacy: 'private'
      },
      {
        id: 'session-3',
        title: 'One-on-One Therapy',
        type: 'therapy',
        participants: [demoParticipants[0]],
        duration: 60,
        isActive: false,
        privacy: 'private'
      }
    ];

    const demoMessages: Message[] = [
      {
        id: 'msg-1',
        senderId: 'therapist-1',
        senderName: 'Dr. Sarah Chen',
        content: 'Good morning everyone! How are we all feeling today?',
        type: 'text',
        timestamp: new Date(Date.now() - 300000),
        reactions: [
          { emoji: '👋', count: 3, users: ['peer-1', 'mentor-1', 'user-1'] }
        ]
      },
      {
        id: 'msg-2',
        senderId: 'peer-1',
        senderName: 'Alex Rivera',
        content: 'Feeling a bit anxious about the day, but ready to practice mindfulness',
        type: 'text',
        timestamp: new Date(Date.now() - 240000),
        reactions: [
          { emoji: '🤗', count: 2, users: ['therapist-1', 'mentor-1'] }
        ]
      },
      {
        id: 'msg-3',
        senderId: 'mentor-1',
        senderName: 'Jordan Kim',
        content: 'Shared a breathing exercise',
        type: 'activity',
        timestamp: new Date(Date.now() - 180000),
        reactions: [
          { emoji: '❤️', count: 4, users: ['therapist-1', 'peer-1', 'user-1', 'user-2'] }
        ]
      }
    ];

    setParticipants(demoParticipants);
    setSessions(demoSessions);
    setMessages(demoMessages);
    setOnlineCount(demoParticipants.filter(p => p.status === 'online').length);
    
    // Start real-time simulation
    simulateRealTimeActivity();
    
    // Simulate connection process
    setConnectionStatus('connecting');
    setTimeout(() => {
      setConnectionStatus('connected');
      setIsConnected(true);
    }, 2000);
    
    // Send supportive messages every 30 seconds
    const supportInterval = setInterval(sendSupportMessage, 30000);
    
    return () => {
      clearInterval(supportInterval);
    };
  }, [simulateRealTimeActivity, sendSupportMessage]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      content: newMessage,
      type: 'text',
      timestamp: new Date(),
      reactions: []
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    
    // Simulate responses from other participants
    setTimeout(() => {
      const responses = [
        { sender: 'Dr. Sarah Chen', text: 'Thank you for sharing! How does that make you feel?' },
        { sender: 'Alex Rivera', text: 'I completely understand. You\'re not alone in this.' },
        { sender: 'Jordan Kim', text: 'That\'s a great insight! Keep up the good work.' },
        { sender: 'MindScope Support', text: 'Remember, every step forward counts. You\'re doing amazing! 💪' }
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      const autoResponse: Message = {
        id: `auto-${Date.now()}`,
        senderId: 'auto',
        senderName: randomResponse.sender,
        content: randomResponse.text,
        type: randomResponse.sender === 'MindScope Support' ? 'support' : 'text',
        timestamp: new Date(),
        reactions: [
          { emoji: '❤️', count: Math.floor(Math.random() * 3) + 1, users: ['user-1', 'user-2'] }
        ]
      };
      
      setMessages(prev => [...prev, autoResponse]);
    }, 1500 + Math.random() * 2000);
  };

  const handleReaction = (messageId: string, emoji: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const existingReaction = msg.reactions.find(r => r.emoji === emoji);
        if (existingReaction) {
          if (existingReaction.users.includes(currentUser.id)) {
            // Remove reaction
            existingReaction.count--;
            existingReaction.users = existingReaction.users.filter(u => u !== currentUser.id);
            if (existingReaction.count === 0) {
              msg.reactions = msg.reactions.filter(r => r.emoji !== emoji);
            }
          } else {
            // Add reaction
            existingReaction.count++;
            existingReaction.users.push(currentUser.id);
          }
        } else {
          // New reaction
          msg.reactions.push({
            emoji,
            count: 1,
            users: [currentUser.id]
          });
        }
      }
      return msg;
    }));
  };

  const joinSession = (sessionId: string) => {
    // Show connecting status
    setConnectionStatus('connecting');
    
    // Create a notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse';
    notification.textContent = '🎥 Joining session...';
    document.body.appendChild(notification);
    
    setTimeout(() => {
      setSessions(prev => prev.map(session => {
        if (session.id === sessionId) {
          const newParticipant: Participant = {
            id: currentUser.id,
            name: currentUser.name,
            avatar: currentUser.avatar,
            status: 'online',
            role: 'peer',
            isVideoOn: myVideoOn,
            isAudioOn: myAudioOn,
            mood: 7,
            lastSeen: 'now'
          };
          
          if (!session.participants.find(p => p.id === currentUser.id)) {
            session.participants.push(newParticipant);
          }
          session.isActive = true;
        }
        return session;
      }));
      
      setIsConnected(true);
      setConnectionStatus('connected');
      setOnlineCount(prev => prev + 1);
      
      // Update notification
      notification.textContent = '✅ Successfully joined session!';
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 3000);
    }, 1500);
  };

  const disconnectFromSession = () => {
    setIsConnected(false);
    setConnectionStatus('disconnected');
    setMyVideoOn(false);
    setMyAudioOn(false);
  };

  const toggleVideo = () => {
    setMyVideoOn(!myVideoOn);
    const message = !myVideoOn ? '📹 Camera turned on' : '📷 Camera turned off';
    showNotification(message);
  };

  const toggleAudio = () => {
    setMyAudioOn(!myAudioOn);
    const message = !myAudioOn ? '🎤 Microphone enabled' : '🔇 Microphone muted';
    showNotification(message);
  };

  const showNotification = (message: string) => {
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 2000);
  };

  const handleFindSupport = (type: 'peer' | 'therapist' | 'mentor') => {
    const messages = {
      peer: '👥 Searching for peer supporters...',
      therapist: '👩‍⚕️ Finding available therapists...',
      mentor: '🎓 Connecting with mentors...'
    };
    
    // Show searching notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse';
    notification.textContent = messages[type];
    document.body.appendChild(notification);
    
    // Simulate search and connection
    setTimeout(() => {
      const successMessages = {
        peer: '✅ Found 3 peer supporters nearby!',
        therapist: '✅ Dr. Sarah Chen is available now!',
        mentor: '✅ Connected with Jordan Kim!'
      };
      
      notification.textContent = successMessages[type];
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      
      // Auto-switch to chat tab to show the connection
      setTimeout(() => {
        setActiveTab('chat');
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 2000);
    }, 1500);
  };

  const getStatusColor = (status: Participant['status']) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getRoleColor = (role: Participant['role']) => {
    switch (role) {
      case 'therapist': return 'text-purple-600 bg-purple-100';
      case 'mentor': return 'text-blue-600 bg-blue-100';
      case 'peer': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-green-600 to-teal-600">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Real-time Collaboration
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Connect, share, and support together
            </p>
          </div>
        </div>

        {/* Connection Status */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${
              connectionStatus === 'connected' ? 'bg-green-500' : 
              connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-gray-400'
            }`} />
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {connectionStatus === 'connected' ? `Connected (${onlineCount} online)` : 
               connectionStatus === 'connecting' ? 'Connecting...' : 'Offline'}
            </span>
          </div>
          
          {/* Quick Controls */}
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleAudio}
              className={`p-2 rounded-lg ${
                myAudioOn 
                  ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400' 
                  : 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
              }`}
            >
              {myAudioOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleVideo}
              className={`p-2 rounded-lg ${
                myVideoOn 
                  ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400' 
                  : 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
              }`}
            >
              {myVideoOn ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 p-1 rounded-lg bg-gray-100 dark:bg-slate-700">
        {tabs.map(tab => {
          const IconComponent = tab.icon;
          return (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-600 shadow-sm text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <IconComponent className="w-4 h-4" />
              <span>{tab.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'sessions' && (
          <motion.div
            key="sessions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {sessions.map(session => (
              <motion.div
                key={session.id}
                whileHover={{ scale: 1.02 }}
                className={`p-6 rounded-xl border backdrop-blur-sm ${
                  isDarkMode ? 'bg-slate-800/50 border-slate-600' : 'bg-white/80 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      {session.title}
                    </h4>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${getRoleColor('peer')}`}>
                        {session.type}
                      </span>
                      <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {session.duration} min
                      </span>
                      <div className="flex items-center space-x-1">
                        <Users className="w-3 h-3 text-gray-400" />
                        <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {session.participants.length}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {session.isActive && (
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-xs text-red-500 font-medium">LIVE</span>
                      </div>
                    )}
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => joinSession(session.id)}
                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white text-sm font-medium rounded-lg hover:from-green-600 hover:to-teal-600 transition-all duration-300"
                    >
                      {session.participants.find(p => p.id === currentUser.id) ? 'Rejoin' : 'Join'}
                    </motion.button>
                  </div>
                </div>

                {/* Participants */}
                <div className="flex items-center space-x-3">
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Participants:
                  </span>
                  <div className="flex -space-x-2">
                    {session.participants.slice(0, 4).map(participant => (
                      <div key={participant.id} className="relative">
                        <Image
                          src={participant.avatar}
                          alt={participant.name}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-600"
                        />
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-slate-600 ${getStatusColor(participant.status)}`} />
                      </div>
                    ))}
                    {session.participants.length > 4 && (
                      <div className={`w-8 h-8 rounded-full border-2 border-white dark:border-slate-600 flex items-center justify-center text-xs font-medium ${
                        isDarkMode ? 'bg-slate-600 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        +{session.participants.length - 4}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeTab === 'chat' && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-6 rounded-xl border backdrop-blur-sm ${
              isDarkMode ? 'bg-slate-800/50 border-slate-600' : 'bg-white/80 border-gray-200'
            }`}
          >
            {/* Chat Messages */}
            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
              {messages.map(message => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex space-x-3"
                >
                  <Image
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"
                    alt={message.senderName}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        {message.senderName}
                      </span>
                      <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {message.content}
                    </p>
                    
                    {/* Reactions */}
                    {message.reactions.length > 0 && (
                      <div className="flex items-center space-x-2 mt-2">
                        {message.reactions.map(reaction => (
                          <motion.button
                            key={reaction.emoji}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleReaction(message.id, reaction.emoji)}
                            className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
                              reaction.users.includes(currentUser.id)
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                : isDarkMode
                                  ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            <span>{reaction.emoji}</span>
                            <span>{reaction.count}</span>
                          </motion.button>
                        ))}
                        
                        {/* Add Reaction */}
                        <div className="flex space-x-1">
                          {['❤️', '👍', '😊', '🤗'].map(emoji => (
                            <motion.button
                              key={emoji}
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.8 }}
                              onClick={() => handleReaction(message.id, emoji)}
                              className="w-6 h-6 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center justify-center text-sm"
                            >
                              {emoji}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Message Input */}
            <div className="flex items-center space-x-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a supportive message..."
                  className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {activeTab === 'connect' && (
          <motion.div
            key="connect"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Available Supporters */}
            <div className={`p-6 rounded-xl border backdrop-blur-sm ${
              isDarkMode ? 'bg-slate-800/50 border-slate-600' : 'bg-white/80 border-gray-200'
            }`}>
              <h4 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Available for Support
              </h4>
              
              <div className="space-y-3">
                {participants.filter(p => p.status === 'online').map(participant => (
                  <motion.div
                    key={participant.id}
                    whileHover={{ scale: 1.02 }}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Image
                          src={participant.avatar}
                          alt={participant.name}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full"
                        />
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-slate-600 ${getStatusColor(participant.status)}`} />
                      </div>
                      
                      <div>
                        <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                          {participant.name}
                        </p>
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${getRoleColor(participant.role)}`}>
                            {participant.role}
                          </span>
                          {participant.location && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-3 h-3 text-gray-400" />
                              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {participant.location}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                      >
                        <Video className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Quick Connect Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleFindSupport('peer')}
                className={`p-6 rounded-xl border-2 border-dashed transition-all duration-300 ${
                  isDarkMode
                    ? 'border-slate-600 hover:border-blue-500 hover:bg-slate-800/50'
                    : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                }`}
              >
                <div className="text-center space-y-3">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full w-fit mx-auto">
                    <UserPlus className="w-6 h-6 text-blue-600" />
                  </div>
                  <h5 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    Find Peer Support
                  </h5>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Connect with others on similar journeys
                  </p>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleFindSupport('therapist')}
                className={`p-6 rounded-xl border-2 border-dashed transition-all duration-300 ${
                  isDarkMode
                    ? 'border-slate-600 hover:border-purple-500 hover:bg-slate-800/50'
                    : 'border-gray-300 hover:border-purple-500 hover:bg-purple-50'
                }`}
              >
                <div className="text-center space-y-3">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full w-fit mx-auto">
                    <Video className="w-6 h-6 text-purple-600" />
                  </div>
                  <h5 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    Book Therapy Session
                  </h5>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Schedule time with a licensed therapist
                  </p>
                </div>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RealTimeCollaboration;
