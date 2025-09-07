'use client';

import { motion } from 'framer-motion';
import {
  Brain,
  CheckCircle,
  Info,
  MessageSquare,
  Mic,
  MicOff,
  Volume2,
  Zap
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface VoiceCommand {
  command: string;
  action: string;
  category: 'navigation' | 'wellness' | 'data' | 'control';
}

interface VoiceCommandsProps {
  isDarkMode?: boolean;
  onCommand?: (command: string, action: string) => void;
}

const VoiceCommands: React.FC<VoiceCommandsProps> = ({
  isDarkMode = false,
  onCommand
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [lastCommand, setLastCommand] = useState('');
  const recognitionRef = useRef<any>(null);
  const router = useRouter();

  const voiceCommands: VoiceCommand[] = [
    // Navigation - Enhanced with more natural variations
    { command: 'go to dashboard', action: 'navigate_dashboard', category: 'navigation' },
    { command: 'open dashboard', action: 'navigate_dashboard', category: 'navigation' },
    { command: 'take me to dashboard', action: 'navigate_dashboard', category: 'navigation' },
    { command: 'show dashboard', action: 'navigate_dashboard', category: 'navigation' },
    { command: 'home', action: 'navigate_dashboard', category: 'navigation' },
    { command: 'go home', action: 'navigate_dashboard', category: 'navigation' },
    
    { command: 'go to mood tracker', action: 'navigate_mood', category: 'navigation' },
    { command: 'open mood tracker', action: 'navigate_mood', category: 'navigation' },
    { command: 'track my mood', action: 'navigate_mood', category: 'navigation' },
    { command: 'mood tracking', action: 'navigate_mood', category: 'navigation' },
    
    { command: 'go to therapy', action: 'navigate_therapy', category: 'navigation' },
    { command: 'open therapy', action: 'navigate_therapy', category: 'navigation' },
    { command: 'start therapy', action: 'navigate_therapy', category: 'navigation' },
    { command: 'therapy session', action: 'navigate_therapy', category: 'navigation' },
    
    { command: 'go to community', action: 'navigate_community', category: 'navigation' },
    { command: 'open community', action: 'navigate_community', category: 'navigation' },
    { command: 'community page', action: 'navigate_community', category: 'navigation' },
    { command: 'show community', action: 'navigate_community', category: 'navigation' },
    
    { command: 'go to vr', action: 'navigate_vr', category: 'navigation' },
    { command: 'open vr', action: 'navigate_vr', category: 'navigation' },
    { command: 'virtual reality', action: 'navigate_vr', category: 'navigation' },
    { command: 'vr experience', action: 'navigate_vr', category: 'navigation' },
    
    { command: 'go to emotion analysis', action: 'navigate_emotion', category: 'navigation' },
    { command: 'open emotion analysis', action: 'navigate_emotion', category: 'navigation' },
    { command: 'emotion detection', action: 'navigate_emotion', category: 'navigation' },
    { command: 'analyze emotions', action: 'navigate_emotion', category: 'navigation' },
    
    { command: 'go to demo', action: 'navigate_demo', category: 'navigation' },
    { command: 'open demo', action: 'navigate_demo', category: 'navigation' },
    { command: 'show demo', action: 'navigate_demo', category: 'navigation' },
    { command: 'demo page', action: 'navigate_demo', category: 'navigation' },
    
    { command: 'go to onboarding', action: 'navigate_onboarding', category: 'navigation' },
    { command: 'open onboarding', action: 'navigate_onboarding', category: 'navigation' },
    { command: 'onboarding process', action: 'navigate_onboarding', category: 'navigation' },
    { command: 'getting started', action: 'navigate_onboarding', category: 'navigation' },
    
    { command: 'go to breathing', action: 'navigate_breathing', category: 'navigation' },
    { command: 'open breathing exercise', action: 'navigate_breathing', category: 'navigation' },
    { command: 'breathing exercises', action: 'navigate_breathing', category: 'navigation' },
    { command: 'breath work', action: 'navigate_breathing', category: 'navigation' },
    
    // Wellness - Enhanced
    { command: 'start breathing exercise', action: 'start_breathing', category: 'wellness' },
    { command: 'begin meditation', action: 'start_meditation', category: 'wellness' },
    { command: 'log my mood', action: 'log_mood', category: 'wellness' },
    { command: 'track stress level', action: 'track_stress', category: 'wellness' },
    { command: 'play relaxing music', action: 'play_relaxing_music', category: 'wellness' },
    { command: 'play meditation music', action: 'play_meditation_music', category: 'wellness' },
    { command: 'play sleep sounds', action: 'play_sleep_sounds', category: 'wellness' },
    { command: 'play nature sounds', action: 'play_nature_sounds', category: 'wellness' },
    { command: 'play focus music', action: 'play_focus_music', category: 'wellness' },
    { command: 'play anxiety relief', action: 'play_anxiety_relief', category: 'wellness' },
    { command: 'play depression help', action: 'play_depression_help', category: 'wellness' },
    { command: 'play motivational music', action: 'play_motivational', category: 'wellness' },
    
    // Chat & Communication
    { command: 'chat with mentor', action: 'chat_mentor', category: 'wellness' },
    { command: 'talk to mentor', action: 'chat_mentor', category: 'wellness' },
    { command: 'chat with doctor', action: 'chat_doctor', category: 'wellness' },
    { command: 'talk to doctor', action: 'chat_doctor', category: 'wellness' },
    { command: 'chat with ai', action: 'chat_ai', category: 'wellness' },
    { command: 'talk to ai assistant', action: 'chat_ai', category: 'wellness' },
    { command: 'get support', action: 'get_support', category: 'wellness' },
    { command: 'find help', action: 'get_support', category: 'wellness' },
    
    // Data - Enhanced
    { command: 'show my progress', action: 'show_progress', category: 'data' },
    { command: 'export data', action: 'export_data', category: 'data' },
    { command: 'view statistics', action: 'view_stats', category: 'data' },
    { command: 'generate report', action: 'generate_report', category: 'data' },
    { command: 'show analytics', action: 'show_analytics', category: 'data' },
    { command: 'view my mood history', action: 'show_mood_history', category: 'data' },
    
    // Control - Enhanced
    { command: 'toggle dark mode', action: 'toggle_theme', category: 'control' },
    { command: 'enable notifications', action: 'enable_notifications', category: 'control' },
    { command: 'pause session', action: 'pause_session', category: 'control' },
    { command: 'save progress', action: 'save_progress', category: 'control' },
    { command: 'stop music', action: 'stop_music', category: 'control' },
    { command: 'pause music', action: 'pause_music', category: 'control' },
    { command: 'resume music', action: 'resume_music', category: 'control' },
    { command: 'next song', action: 'next_song', category: 'control' }
  ];

  const showNotification = (message: string, type: string = 'success') => {
    // Create a temporary notification
    const notification = document.createElement('div');
    const bgColor = type === 'error' ? 'bg-red-500' : 
                   type === 'warning' ? 'bg-yellow-500' : 'bg-green-500';
    notification.className = `fixed top-4 right-4 ${bgColor} text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 3000);
  };

  const executeCommand = (action: string) => {
    switch (action) {
      // Navigation Commands - Using Next.js Router
      case 'navigate_dashboard':
        showNotification('🏠 Navigating to dashboard...', 'success');
        router.push('/dashboard');
        break;
      case 'navigate_mood':
        showNotification('😊 Opening mood tracker...', 'success');
        // Try to find mood tracker on current page first, then navigate
        setTimeout(() => {
          let moodButton = document.querySelector('[data-testid="mood-tracker"], .mood-tracker, [aria-label*="mood"]') as HTMLElement;
          
          if (!moodButton) {
            // Look for buttons with mood-related text
            const allButtons = document.querySelectorAll('button');
            for (const button of allButtons) {
              const buttonText = button.textContent?.toLowerCase() || '';
              if (buttonText.includes('mood')) {
                moodButton = button as HTMLElement;
                break;
              }
            }
          }
          
          if (moodButton) {
            moodButton.click();
          } else {
            // Navigate to dashboard where mood tracker is available
            router.push('/dashboard');
          }
        }, 500);
        break;
      case 'navigate_therapy':
        showNotification('🧠 Opening therapy session...', 'success');
        router.push('/therapy');
        break;
      case 'navigate_community':
        showNotification('👥 Opening community...', 'success');
        router.push('/community');
        break;
      case 'navigate_vr':
        showNotification('🥽 Opening VR experience...', 'success');
        router.push('/vr');
        break;
      case 'navigate_emotion':
        showNotification('🎭 Opening emotion analysis...', 'success');
        router.push('/emotion-analysis');
        break;
      case 'navigate_demo':
        showNotification('🎮 Opening demo...', 'success');
        router.push('/demo');
        break;
      case 'navigate_onboarding':
        showNotification('🌟 Opening onboarding...', 'success');
        router.push('/onboarding');
        break;
      case 'navigate_breathing':
        showNotification('🌬️ Opening breathing exercise...', 'success');
        // Try to trigger breathing exercise or navigate to breathing page
        setTimeout(() => {
          let breathingButton = document.querySelector('[data-testid="breathing"], .breathing-button, [aria-label*="breathing"]') as HTMLElement;
          
          if (!breathingButton) {
            // Look for buttons with breathing-related text
            const allButtons = document.querySelectorAll('button');
            for (const button of allButtons) {
              const buttonText = button.textContent?.toLowerCase() || '';
              if (buttonText.includes('breathing')) {
                breathingButton = button as HTMLElement;
                break;
              }
            }
          }
          
          if (breathingButton) {
            breathingButton.click();
          } else {
            // Navigate to dashboard where breathing exercise is available
            router.push('/dashboard');
          }
        }, 500);
        break;

      // YouTube Music Integration - Enhanced
      case 'play_relaxing_music':
        showNotification('🎵 Playing relaxing music...', 'success');
        playYouTubePlaylist('relaxing music for anxiety and stress relief 1 hour');
        break;
      case 'play_meditation_music':
        showNotification('🧘 Playing meditation music...', 'success');
        playYouTubePlaylist('guided meditation music calm peaceful');
        break;
      case 'play_sleep_sounds':
        showNotification('😴 Playing sleep sounds...', 'success');
        playYouTubePlaylist('8 hour rain sounds for deep sleep');
        break;
      case 'play_nature_sounds':
        showNotification('🌿 Playing nature sounds...', 'success');
        playYouTubePlaylist('nature sounds forest birds water stream');
        break;
      case 'play_focus_music':
        showNotification('🎯 Playing focus music...', 'success');
        playYouTubePlaylist('focus music deep work concentration study');
        break;
      case 'play_anxiety_relief':
        showNotification('😌 Playing anxiety relief music...', 'success');
        playYouTubePlaylist('anxiety relief meditation music calming');
        break;
      case 'play_depression_help':
        showNotification('💝 Playing uplifting music...', 'success');
        playYouTubePlaylist('depression recovery motivational uplifting music');
        break;
      case 'play_motivational':
        showNotification('💪 Playing motivational music...', 'success');
        playYouTubePlaylist('motivational music positive energy inspiration');
        break;

      // Chat Commands
      case 'chat_mentor':
        showNotification('👨‍🏫 Connecting with mentor...', 'chat');
        openChatModal('mentor');
        break;
      case 'chat_doctor':
        showNotification('👩‍⚕️ Connecting with doctor...', 'chat');
        openChatModal('doctor');
        break;
      case 'chat_ai':
        showNotification('🤖 Opening AI assistant...', 'chat');
        openChatModal('ai');
        break;
      case 'get_support':
        showNotification('🆘 Getting support...', 'support');
        openSupportModal();
        break;

      // Wellness Actions - Enhanced to actually work
      case 'start_breathing':
        showNotification('🌬️ Starting breathing exercise...', 'success');
        // Multiple strategies to start breathing exercise
        setTimeout(() => {
          // Strategy 1: Look for breathing exercise button
          let breathingButton = document.querySelector('button[data-action="start-breathing"]') as HTMLElement;
          
          if (!breathingButton) {
            // Strategy 2: Look for breathing related buttons by text content
            const allButtons = document.querySelectorAll('button');
            for (const button of allButtons) {
              const buttonText = button.textContent?.toLowerCase() || '';
              if (buttonText.includes('start') || buttonText.includes('begin') || buttonText.includes('breathing')) {
                breathingButton = button as HTMLElement;
                break;
              }
            }
          }
          
          if (!breathingButton) {
            // Strategy 3: Look for buttons with breathing-related attributes
            breathingButton = document.querySelector('.breathing-start, [aria-label*="start breathing"], [aria-label*="breathing"]') as HTMLElement;
          }
          
          if (!breathingButton) {
            // Strategy 4: Look for play button in breathing section
            breathingButton = document.querySelector('.breathing button, [data-testid="breathing"] button, .breathing-exercise button') as HTMLElement;
          }
          
          if (breathingButton) {
            breathingButton.click();
            showNotification('✅ Breathing exercise started!', 'success');
          } else {
            // Strategy 5: Trigger custom event for breathing exercise
            const event = new CustomEvent('startBreathingExercise', { detail: { source: 'voice' } });
            window.dispatchEvent(event);
            showNotification('🌬️ Breathing exercise activated via voice!', 'success');
          }
        }, 500);
        break;
      case 'start_meditation':
        showNotification('🧘 Starting meditation...', 'success');
        setTimeout(() => {
          let meditationButton = document.querySelector('button[data-action="start-meditation"]') as HTMLElement;
          
          if (!meditationButton) {
            // Look for meditation buttons by text content
            const allButtons = document.querySelectorAll('button');
            for (const button of allButtons) {
              const buttonText = button.textContent?.toLowerCase() || '';
              if (buttonText.includes('meditate') || buttonText.includes('meditation')) {
                meditationButton = button as HTMLElement;
                break;
              }
            }
          }
          
          if (!meditationButton) {
            // Look for meditation-related attributes
            meditationButton = document.querySelector('.meditation-start, [aria-label*="meditation"]') as HTMLElement;
          }
          
          if (meditationButton) {
            meditationButton.click();
            showNotification('✅ Meditation started!', 'success');
          } else {
            // Navigate to dashboard where meditation is available
            router.push('/dashboard');
            showNotification('🧘 Opening meditation section...', 'success');
          }
        }, 500);
        break;
      case 'log_mood':
        showNotification('😊 Opening mood logger...', 'success');
        setTimeout(() => {
          let moodLogger = document.querySelector('button[data-action="log-mood"]') as HTMLElement;
          
          if (!moodLogger) {
            // Look for mood logging buttons by text content
            const allButtons = document.querySelectorAll('button');
            for (const button of allButtons) {
              const buttonText = button.textContent?.toLowerCase() || '';
              if (buttonText.includes('log mood') || buttonText.includes('mood log')) {
                moodLogger = button as HTMLElement;
                break;
              }
            }
          }
          
          if (!moodLogger) {
            // Look for mood-related attributes
            moodLogger = document.querySelector('.mood-log, [aria-label*="mood"]') as HTMLElement;
          }
          
          if (moodLogger) {
            moodLogger.click();
            showNotification('✅ Mood logger opened!', 'success');
          } else {
            // Trigger custom event for mood logging
            const event = new CustomEvent('openMoodLogger', { detail: { source: 'voice' } });
            window.dispatchEvent(event);
            showNotification('😊 Mood logger activated!', 'success');
          }
        }, 500);
        break;

      // Data Actions
      case 'show_progress':
        showNotification('📈 Showing progress...', 'data');
        setTimeout(() => {
          const progressButton = document.querySelector('[data-tab="progress"]') as HTMLElement;
          if (progressButton) progressButton.click();
        }, 500);
        break;
      case 'show_analytics':
        showNotification('📊 Displaying analytics...', 'data');
        setTimeout(() => {
          const analyticsButton = document.querySelector('[data-tab="analytics"]') as HTMLElement;
          if (analyticsButton) analyticsButton.click();
        }, 500);
        break;
      case 'view_stats':
        showNotification('📋 Viewing statistics...', 'data');
        break;
      case 'show_mood_history':
        showNotification('📝 Showing mood history...', 'data');
        break;

      // Control Actions
      case 'toggle_theme':
        showNotification('🌙 Toggling theme...', 'control');
        setTimeout(() => {
          const themeToggle = document.querySelector('[data-action="toggle-theme"]') as HTMLElement;
          if (themeToggle) themeToggle.click();
        }, 500);
        break;
      case 'stop_music':
        showNotification('⏹️ Stopping music...', 'control');
        stopCurrentMusic();
        break;
      case 'pause_music':
        showNotification('⏸️ Pausing music...', 'control');
        pauseCurrentMusic();
        break;
      case 'resume_music':
        showNotification('▶️ Resuming music...', 'control');
        resumeCurrentMusic();
        break;

      default:
        showNotification(`Command executed: ${action}`, 'info');
        break;
    }

    if (onCommand) {
      onCommand(lastCommand, action);
    }
  };

  // YouTube Integration Functions - Enhanced
  const playYouTubePlaylist = (searchQuery: string) => {
    // Create a more specific search that's likely to find good content
    const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
    
    // Open in a new window with specific size
    const newWindow = window.open(youtubeUrl, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
    
    if (newWindow) {
      // Store reference for music control
      (window as any).currentMusicWindow = newWindow;
      
      // Try to auto-click first video after page loads (if possible)
      newWindow.addEventListener('load', () => {
        setTimeout(() => {
          try {
            // This will only work if same-origin, but worth trying
            const firstVideo = newWindow.document.querySelector('#video-title') as HTMLElement;
            if (firstVideo) {
              firstVideo.click();
            }
          } catch (e) {
            // Cross-origin restriction, expected
            console.log('Auto-play blocked by CORS, user will need to click manually');
          }
        }, 2000);
      });
      
      // Show follow-up notification
      setTimeout(() => {
        showNotification('🎵 Click on the first video to start playing', 'info');
      }, 3000);
    } else {
      showNotification('❌ Popup blocked. Please allow popups for this site.', 'error');
    }
  };

  const stopCurrentMusic = () => {
    if ((window as any).currentMusicWindow && !(window as any).currentMusicWindow.closed) {
      (window as any).currentMusicWindow.close();
      (window as any).currentMusicWindow = null;
    }
  };

  const pauseCurrentMusic = () => {
    // In a real implementation, you'd use YouTube API or postMessage
    showNotification('🎵 Please pause manually in the YouTube tab', 'info');
  };

  const resumeCurrentMusic = () => {
    // In a real implementation, you'd use YouTube API or postMessage
    showNotification('🎵 Please resume manually in the YouTube tab', 'info');
  };

  // Chat Modal Functions
  const openChatModal = (type: 'mentor' | 'doctor' | 'ai') => {
    const chatData = {
      mentor: {
        title: 'Chat with Mentor',
        description: 'Connect with a wellness mentor for guidance and support',
        avatar: '👨‍🏫',
        suggestions: [
          'I need motivation to continue my wellness journey',
          'How can I build better habits?',
          'I want to discuss my progress',
          'Share some success stories'
        ]
      },
      doctor: {
        title: 'Chat with Doctor',
        description: 'Speak with a licensed mental health professional',
        avatar: '👩‍⚕️',
        suggestions: [
          'I\'m experiencing anxiety symptoms',
          'I need help with sleep issues',
          'I want to discuss therapy options',
          'Emergency support needed'
        ]
      },
      ai: {
        title: 'AI Wellness Assistant',
        description: 'Get instant support from our AI assistant',
        avatar: '🤖',
        suggestions: [
          'Recommend videos for my mood',
          'Suggest breathing exercises',
          'Find meditation podcasts',
          'Help me track my progress'
        ]
      }
    };

    createChatModal(chatData[type]);
  };

  const createChatModal = (data: any) => {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm';
    modal.innerHTML = `
      <div class="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-3">
            <div class="text-3xl">${data.avatar}</div>
            <div>
              <h3 class="text-xl font-bold text-gray-800">${data.title}</h3>
              <p class="text-sm text-gray-600">${data.description}</p>
            </div>
          </div>
          <button class="chat-close text-gray-500 hover:text-gray-700 text-xl">×</button>
        </div>
        <div class="space-y-3 mb-4">
          <p class="text-sm font-medium text-gray-700">Quick topics:</p>
          ${data.suggestions.map((suggestion: string) => 
            `<button class="chat-suggestion w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm transition-colors">${suggestion}</button>`
          ).join('')}
        </div>
        <div class="flex space-x-2">
          <input type="text" placeholder="Type your message..." class="chat-input flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          <button class="chat-send bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">Send</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Event handlers
    modal.querySelector('.chat-close')?.addEventListener('click', () => {
      document.body.removeChild(modal);
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });

    modal.querySelectorAll('.chat-suggestion').forEach(button => {
      button.addEventListener('click', (e) => {
        const input = modal.querySelector('.chat-input') as HTMLInputElement;
        if (input) {
          input.value = (e.target as HTMLElement).textContent || '';
        }
      });
    });

    modal.querySelector('.chat-send')?.addEventListener('click', () => {
      const input = modal.querySelector('.chat-input') as HTMLInputElement;
      if (input?.value.trim()) {
        showNotification(`💬 Message sent: "${input.value}"`, 'success');
        // Here you would integrate with your actual chat system
        input.value = '';
      }
    });
  };

  const openSupportModal = () => {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm';
    modal.innerHTML = `
      <div class="bg-white rounded-2xl p-6 max-w-lg w-full mx-4 shadow-2xl">
        <div class="text-center mb-6">
          <div class="text-4xl mb-3">🆘</div>
          <h3 class="text-2xl font-bold text-gray-800 mb-2">Get Support</h3>
          <p class="text-gray-600">Choose how you'd like to get help</p>
        </div>
        <div class="space-y-3">
          <button class="support-option w-full flex items-center p-4 bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-left">
            <div class="text-2xl mr-4">🚨</div>
            <div>
              <div class="font-semibold text-red-800">Crisis Support</div>
              <div class="text-sm text-red-600">Immediate help for crisis situations</div>
            </div>
          </button>
          <button class="support-option w-full flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left">
            <div class="text-2xl mr-4">💬</div>
            <div>
              <div class="font-semibold text-blue-800">Live Chat</div>
              <div class="text-sm text-blue-600">Chat with a support specialist</div>
            </div>
          </button>
          <button class="support-option w-full flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left">
            <div class="text-2xl mr-4">📞</div>
            <div>
              <div class="font-semibold text-green-800">Phone Support</div>
              <div class="text-sm text-green-600">Talk to someone immediately</div>
            </div>
          </button>
          <button class="support-option w-full flex items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left">
            <div class="text-2xl mr-4">📚</div>
            <div>
              <div class="font-semibold text-purple-800">Resources</div>
              <div class="text-sm text-purple-600">Self-help guides and information</div>
            </div>
          </button>
        </div>
        <button class="support-close w-full mt-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Close</button>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('.support-close')?.addEventListener('click', () => {
      document.body.removeChild(modal);
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });

    modal.querySelectorAll('.support-option').forEach(button => {
      button.addEventListener('click', () => {
        showNotification('🆘 Connecting you with support...', 'success');
        document.body.removeChild(modal);
      });
    });
  };

  const processVoiceCommand = (transcript: string) => {
    const lowerTranscript = transcript.toLowerCase().trim();
    
    for (const command of voiceCommands) {
      if (lowerTranscript.includes(command.command.toLowerCase())) {
        executeCommand(command.action);
        setLastCommand(command.command);
        return true;
      }
    }
    
    showNotification(`Command not recognized: "${transcript}"`, 'warning');
    return false;
  };

  const handleVoiceCommand = useCallback((command: string, action: string) => {
    console.log(`Voice command executed: ${command} -> ${action}`);
    
    // Call parent onCommand callback if provided
    if (onCommand) {
      onCommand(command, action);
    }
    
    // Execute the action
    executeCommand(action);
    setLastCommand(command);
  }, [onCommand]);

  const processCommand = useCallback((spokenText: string) => {
    const lowerText = spokenText.toLowerCase().trim();
    console.log('Processing voice command:', lowerText);
    
    // Find matching command with better fuzzy matching
    let matchedCommand = null;
    
    // First try exact matches
    for (const command of voiceCommands) {
      if (lowerText.includes(command.command.toLowerCase())) {
        matchedCommand = command;
        break;
      }
    }
    
    // If no exact match, try partial matches
    if (!matchedCommand) {
      for (const command of voiceCommands) {
        const commandWords = command.command.toLowerCase().split(' ');
        const spokenWords = lowerText.split(' ');
        
        // Check if at least 60% of command words are in the spoken text
        const matchingWords = commandWords.filter(word => 
          spokenWords.some(spokenWord => spokenWord.includes(word) || word.includes(spokenWord))
        );
        
        if (matchingWords.length >= Math.ceil(commandWords.length * 0.6)) {
          matchedCommand = command;
          break;
        }
      }
    }
    
    if (matchedCommand) {
      console.log('✅ Voice command matched:', matchedCommand.command, '→', matchedCommand.action);
      setLastCommand(matchedCommand.command);
      setTranscript(`✅ ${matchedCommand.command}`);
      
      // Execute the command using the new handler
      handleVoiceCommand(matchedCommand.command, matchedCommand.action);
      
      // Clear command feedback after 3 seconds
      setTimeout(() => {
        setLastCommand('');
        setTranscript('');
      }, 3000);
    } else {
      console.warn('❌ No matching command found for:', lowerText);
      setTranscript(`❌ Command not recognized: "${spokenText}"`);
      showNotification(`Command not recognized: "${spokenText}"`, 'warning');
      
      setTimeout(() => {
        setTranscript('');
      }, 3000);
    }
  }, [handleVoiceCommand, voiceCommands]);

  useEffect(() => {
    // Delay the speech recognition setup to ensure proper browser initialization
    const initSpeechRecognition = () => {
      // Check if Web Speech API is supported
      const hasWebkit = 'webkitSpeechRecognition' in window;
      const hasStandard = 'SpeechRecognition' in window;
      
      if (hasWebkit || hasStandard) {
        console.log('✅ Web Speech API is supported');
        setIsSupported(true);
        
        try {
          const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
          console.log('Creating SpeechRecognition instance...');
          recognitionRef.current = new SpeechRecognition();
          
          // Configure speech recognition
          recognitionRef.current.continuous = false;
          recognitionRef.current.interimResults = true;
          recognitionRef.current.lang = 'en-US';
          recognitionRef.current.maxAlternatives = 3;
          
          recognitionRef.current.onstart = () => {
            console.log('✅ Speech recognition started successfully');
            setIsListening(true);
            setTranscript('');
          };
        
        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = '';
          let interimTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            const confidence = event.results[i][0].confidence;
            
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
              setConfidence(confidence);
              console.log('🎤 Voice detected:', finalTranscript, `(${Math.round(confidence * 100)}% confidence)`);
            } else {
              interimTranscript += transcript;
            }
          }
          
          setTranscript(finalTranscript || interimTranscript);
          
          if (finalTranscript) {
            processCommand(finalTranscript);
          }
        };
        
        recognitionRef.current.onerror = (event: any) => {
          // Handle different types of speech recognition errors gracefully
          if (event.error === 'no-speech') {
            // User didn't speak, this is normal - don't show error
            console.log('No speech detected - user may not have spoken');
            showNotification('🔇 No speech detected. Try again.', 'warning');
          } else if (event.error === 'aborted') {
            // Recognition was aborted (usually by user stopping it) - this is normal
            console.log('Speech recognition was stopped by user');
            // Don't show notification for aborted - it's expected behavior
          } else if (event.error === 'audio-capture') {
            console.error('Speech recognition error - no microphone access:', event.error);
            showNotification('🎤 Please allow microphone access', 'error');
          } else if (event.error === 'not-allowed') {
            console.error('Speech recognition error - permission denied:', event.error);
            showNotification('🚫 Microphone permission required', 'error');
          } else if (event.error === 'network') {
            console.error('Speech recognition error - network issue:', event.error);
            showNotification('🌐 Network error. Check your connection.', 'error');
          } else {
            console.error('Speech recognition error - unknown:', event.error);
            showNotification(`❌ Voice recognition error: ${event.error}`, 'error');
          }
          setIsListening(false);
        };
        
        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
        
        // Setup complete
        console.log('✅ Voice commands initialized successfully');
        showNotification('✅ Voice commands ready!', 'success');
        
      } catch (error) {
        console.error('❌ Error setting up speech recognition:', error);
        setIsSupported(false);
        showNotification('❌ Failed to initialize voice recognition', 'error');
      }
      
    } else {
      console.warn('❌ Web Speech API not supported in this browser');
      console.log('Available speech APIs:', Object.keys(window).filter(key => key.toLowerCase().includes('speech')));
      setIsSupported(false);
      showNotification('❌ Voice commands require a modern browser with Web Speech API support', 'error');
    }
    };

    // Initialize speech recognition after a short delay
    const timeoutId = setTimeout(initSpeechRecognition, 100);
    
    return () => {
      clearTimeout(timeoutId);
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [processCommand]);

  const startListening = async () => {
    if (!isSupported) {
      console.warn('Voice commands not supported');
      showNotification('❌ Voice commands not supported in this browser', 'error');
      return;
    }
    
    if (!recognitionRef.current) {
      console.error('Speech recognition not initialized');
      showNotification('❌ Speech recognition not initialized', 'error');
      return;
    }
    
    if (isListening) {
      console.log('Already listening, ignoring start request');
      return;
    }

    // Check for microphone permission first
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop()); // Stop the stream immediately
        console.log('✅ Microphone permission granted');
      }
    } catch (permissionError) {
      console.error('Microphone permission error:', permissionError);
      showNotification('🎤 Please allow microphone access to use voice commands', 'error');
      return;
    }
    
    try {
      console.log('🎤 Starting voice recognition...');
      recognitionRef.current.start();
      showNotification('🎤 Voice recognition activated - speak now!', 'success');
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      showNotification('❌ Failed to start voice recognition. Try again.', 'error');
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      try {
        console.log('🔇 Stopping voice recognition...');
        recognitionRef.current.stop();
        showNotification('🔇 Voice recognition stopped', 'info');
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
        setIsListening(false);
      }
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'navigation': return MessageSquare;
      case 'wellness': return Brain;
      case 'data': return Info;
      case 'control': return Zap;
      default: return CheckCircle;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'navigation': return 'from-blue-500 to-cyan-500';
      case 'wellness': return 'from-green-500 to-emerald-500';
      case 'data': return 'from-purple-500 to-pink-500';
      case 'control': return 'from-orange-500 to-red-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl border backdrop-blur-md transition-all duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-slate-900/90 via-purple-900/20 to-slate-800/90 border-slate-700/50 shadow-2xl' 
        : 'bg-gradient-to-br from-white/90 via-blue-50/30 to-indigo-50/90 border-gray-200/50 shadow-xl'
    }`}>
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 animate-pulse" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_40%,rgba(120,119,198,0.3),transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(255,119,198,0.2),transparent_50%)]" />
      </div>

      {/* Header with Enhanced Design */}
      <div className="relative z-10 p-6 pb-4">
        <div className="flex items-center space-x-4 mb-6">
          <div className={`relative p-3 rounded-xl ${
            isDarkMode 
              ? 'bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg shadow-purple-500/25' 
              : 'bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30'
          }`}>
            <Volume2 className="w-6 h-6 text-white" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
          </div>
          <div>
            <h3 className={`text-xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Voice Commands
            </h3>
            <p className={`text-sm ${
              isDarkMode ? 'text-purple-300' : 'text-purple-600'
            }`}>
              Control MindScope with your voice
            </p>
          </div>
          <div className="ml-auto flex items-center space-x-2">
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              isSupported 
                ? isDarkMode 
                  ? 'bg-green-900/30 text-green-300 border border-green-700/50' 
                  : 'bg-green-100 text-green-700 border border-green-200'
                : isDarkMode 
                  ? 'bg-red-900/30 text-red-300 border border-red-700/50' 
                  : 'bg-red-100 text-red-700 border border-red-200'
            }`}>
              {isSupported ? '● Online' : '● Offline'}
            </div>
          </div>
        </div>

        {/* Voice Control Interface with Glassmorphism */}
        <div className={`relative p-8 rounded-2xl border transition-all duration-500 ${
          isListening 
            ? isDarkMode
              ? 'border-green-500/50 bg-gradient-to-br from-green-900/20 via-emerald-900/10 to-green-800/20 shadow-lg shadow-green-500/10' 
              : 'border-green-400/50 bg-gradient-to-br from-green-50/80 via-emerald-50/60 to-green-100/80 shadow-lg shadow-green-500/20'
            : isDarkMode 
              ? 'border-slate-700/50 bg-gradient-to-br from-slate-800/30 via-slate-700/20 to-slate-600/30' 
              : 'border-gray-300/50 bg-gradient-to-br from-white/60 via-gray-50/40 to-white/80'
        }`}>
          
          {/* Floating Voice Visualizer */}
          <div className="text-center relative">
            {isListening && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-1 bg-gradient-to-t from-purple-500 to-pink-500 rounded-full animate-pulse ${
                        isDarkMode ? 'opacity-80' : 'opacity-60'
                      }`}
                      style={{
                        height: `${Math.random() * 20 + 10}px`,
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: '0.8s'
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                console.log('Voice button clicked, isListening:', isListening, 'isSupported:', isSupported);
                if (isListening) {
                  stopListening();
                } else {
                  startListening();
                }
              }}
              disabled={!isSupported}
              className={`relative w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 transition-all duration-300 group ${
                isListening
                  ? 'bg-gradient-to-br from-red-500 via-pink-500 to-red-600 animate-pulse shadow-lg shadow-red-500/30'
                  : isDarkMode
                    ? 'bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-500 hover:via-blue-500 hover:to-indigo-500 shadow-lg shadow-purple-500/25'
                    : 'bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-500 hover:from-purple-400 hover:via-blue-400 hover:to-indigo-400 shadow-lg shadow-purple-500/30'
              } ${!isSupported ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {/* Ripple Effect */}
              {isListening && (
                <div className="absolute inset-0 rounded-full animate-ping bg-gradient-to-br from-red-500 to-pink-500 opacity-20" />
              )}
              
              {isListening ? (
                <MicOff className="w-8 h-8 text-white relative z-10" />
              ) : (
                <Mic className="w-8 h-8 text-white relative z-10 group-hover:scale-110 transition-transform" />
              )}
              
              {/* Glow Effect */}
              <div className={`absolute inset-0 rounded-full blur-md ${
                isListening 
                  ? 'bg-gradient-to-br from-red-500 to-pink-500 opacity-30' 
                  : 'bg-gradient-to-br from-purple-500 to-blue-500 opacity-20'
              }`} />
            </motion.button>
            
            <p className={`text-base font-medium mb-4 ${
              isDarkMode ? 'text-gray-200' : 'text-gray-700'
            }`}>
              {!isSupported ? '⚠️ Voice commands not supported in this browser' :
               isListening ? '🎤 Listening... (speak now)' : '✨ Click to start voice command'}
            </p>

            {/* Enhanced Status Indicators */}
            <div className="flex justify-center space-x-4 mb-4">
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                isDarkMode ? 'bg-slate-800/50' : 'bg-white/50'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  isSupported ? 'bg-green-400 animate-pulse' : 'bg-red-400'
                }`} />
                <span className={`text-xs font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {isSupported ? 'Ready' : 'Unavailable'}
                </span>
              </div>
              
              {confidence > 0 && (
                <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                  isDarkMode ? 'bg-slate-800/50' : 'bg-white/50'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    confidence > 0.7 ? 'bg-green-400' : confidence > 0.4 ? 'bg-yellow-400' : 'bg-red-400'
                  }`} />
                  <span className={`text-xs font-medium ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {Math.round(confidence * 100)}% confident
                  </span>
                </div>
              )}
            </div>

            {/* Debug Information */}
            <div className={`mb-4 p-3 rounded-lg text-xs ${
              isDarkMode ? 'bg-slate-800/30 text-gray-300' : 'bg-gray-100/50 text-gray-600'
            }`}>
              <div className="grid grid-cols-2 gap-2">
                <div>Browser Support: {('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) ? '✅' : '❌'}</div>
                <div>Recognition Ready: {recognitionRef.current ? '✅' : '❌'}</div>
                <div>Is Supported: {isSupported ? '✅' : '❌'}</div>
                <div>Is Listening: {isListening ? '🎤' : '🔇'}</div>
              </div>
              <div className="mt-2 text-center">
                <button
                  onClick={async () => {
                    try {
                      console.log('Manual permission request...');
                      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                      stream.getTracks().forEach(track => track.stop());
                      showNotification('✅ Microphone permission granted!', 'success');
                    } catch (error) {
                      console.error('Permission error:', error);
                      showNotification('❌ Microphone permission denied', 'error');
                    }
                  }}
                  className={`px-3 py-1 rounded text-xs ${
                    isDarkMode 
                      ? 'bg-blue-600/30 text-blue-300 hover:bg-blue-600/50' 
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  Test Microphone Access
                </button>
              </div>
            </div>

            {/* Test Input for debugging */}
            {isSupported && (
              <div className="mt-4 space-y-3">
                <input
                  type="text"
                  placeholder="Type command to test (e.g., 'start breathing')"
                  className={`w-full px-4 py-3 text-sm rounded-xl border transition-all duration-200 ${
                    isDarkMode 
                      ? 'bg-slate-800/50 border-slate-600/50 text-white placeholder-gray-400 focus:border-purple-500/50 focus:bg-slate-700/50' 
                      : 'bg-white/60 border-gray-300/50 text-gray-900 placeholder-gray-500 focus:border-purple-500/50 focus:bg-white/80'
                  } focus:ring-2 focus:ring-purple-500/20 focus:outline-none backdrop-blur-sm`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      processCommand(e.currentTarget.value.trim());
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      console.log('Debug button clicked');
                      showNotification('🔧 Debug: Button click working!', 'success');
                    }}
                    className={`flex-1 px-4 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30 hover:bg-blue-600/30' 
                        : 'bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200'
                    }`}
                  >
                    🔧 Test Click
                  </button>
                  <button
                    onClick={() => {
                      console.log('Testing voice recognition setup...');
                      console.log('isSupported:', isSupported);
                      console.log('recognitionRef.current:', !!recognitionRef.current);
                      console.log('Web Speech API support:', 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
                      showNotification(`🔧 Debug: Supported=${isSupported}, Recognition=${!!recognitionRef.current}`, 'info');
                    }}
                    className={`flex-1 px-4 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-green-600/20 text-green-300 border border-green-500/30 hover:bg-green-600/30' 
                        : 'bg-green-100 text-green-700 border border-green-200 hover:bg-green-200'
                    }`}
                  >
                    🛠️ Test Setup
                  </button>
                </div>
                <p className={`text-xs ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Press Enter to test command processing or use debug buttons
                </p>
              </div>
            )}
            
            {transcript && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 p-4 rounded-xl border ${
                  isDarkMode 
                    ? 'bg-blue-900/30 border-blue-700/50 backdrop-blur-sm' 
                    : 'bg-blue-50/80 border-blue-200/50 backdrop-blur-sm'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${
                    isDarkMode ? 'bg-blue-600/20' : 'bg-blue-100'
                  }`}>
                    <MessageSquare className={`w-4 h-4 ${
                      isDarkMode ? 'text-blue-300' : 'text-blue-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${
                      isDarkMode ? 'text-blue-200' : 'text-blue-800'
                    }`}>
                      &ldquo;{transcript}&rdquo;
                    </p>
                    {confidence > 0 && (
                      <div className="flex items-center space-x-2 mt-2">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${confidence * 100}%` }}
                          />
                        </div>
                        <span className={`text-xs font-medium ${
                          isDarkMode ? 'text-blue-300' : 'text-blue-600'
                        }`}>
                          {Math.round(confidence * 100)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
            
            {lastCommand && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`mt-4 p-4 rounded-xl border ${
                  isDarkMode 
                    ? 'bg-green-900/30 border-green-700/50 backdrop-blur-sm' 
                    : 'bg-green-50/80 border-green-200/50 backdrop-blur-sm'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    isDarkMode ? 'bg-green-600/20' : 'bg-green-100'
                  }`}>
                    <CheckCircle className={`w-4 h-4 ${
                      isDarkMode ? 'text-green-300' : 'text-green-600'
                    }`} />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${
                      isDarkMode ? 'text-green-200' : 'text-green-800'
                    }`}>
                      ✅ Command Executed
                    </p>
                    <p className={`text-xs ${
                      isDarkMode ? 'text-green-300' : 'text-green-600'
                    }`}>
                      &ldquo;{lastCommand}&rdquo;
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Available Commands Section */}
      <div className="relative z-10 px-6 pb-6">
        <div className="flex items-center justify-between mb-6">
          <h4 className={`text-lg font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Available Commands
          </h4>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            isDarkMode 
              ? 'bg-purple-900/30 text-purple-300 border border-purple-700/50' 
              : 'bg-purple-100 text-purple-700 border border-purple-200'
          }`}>
            {voiceCommands.length} commands
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {['navigation', 'wellness', 'data', 'control'].map((category) => {
            const categoryCommands = voiceCommands.filter(cmd => cmd.category === category);
            const IconComponent = getCategoryIcon(category);
            const gradientColor = getCategoryColor(category);
            
            return (
              <motion.div 
                key={category} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`group relative overflow-hidden p-5 rounded-xl border backdrop-blur-sm transition-all duration-300 hover:scale-105 ${
                  isDarkMode 
                    ? 'bg-gradient-to-br from-slate-800/60 via-slate-700/40 to-slate-800/60 border-slate-600/50 hover:border-slate-500/70' 
                    : 'bg-gradient-to-br from-white/70 via-gray-50/50 to-white/70 border-gray-200/50 hover:border-gray-300/70'
                } hover:shadow-lg`}
              >
                {/* Background Gradient Overlay */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-gradient-to-br ${gradientColor}`} />
                
                <div className="relative z-10">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`p-2.5 rounded-lg bg-gradient-to-br ${gradientColor} shadow-lg`}>
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h5 className={`font-semibold capitalize ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {category}
                      </h5>
                      <p className={`text-xs ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {categoryCommands.length} commands available
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {categoryCommands.slice(0, 3).map((cmd, index) => (
                      <motion.div
                        key={cmd.command}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                        className={`flex items-center space-x-2 p-2 rounded-lg transition-all duration-200 ${
                          isDarkMode 
                            ? 'hover:bg-slate-700/30' 
                            : 'hover:bg-gray-100/50'
                        }`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${gradientColor}`} />
                        <p className={`text-xs font-medium ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          &ldquo;{cmd.command}&rdquo;
                        </p>
                      </motion.div>
                    ))}
                    
                    {categoryCommands.length > 3 && (
                      <div className={`text-xs text-center pt-2 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        +{categoryCommands.length - 3} more commands
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Decorative Corner Element */}
                <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl ${gradientColor} opacity-5 rounded-bl-full`} />
              </motion.div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className={`mt-6 p-4 rounded-xl border ${
          isDarkMode 
            ? 'bg-gradient-to-r from-slate-800/40 to-slate-700/40 border-slate-600/50' 
            : 'bg-gradient-to-r from-gray-50/60 to-white/60 border-gray-200/50'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h5 className={`font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Quick Start
              </h5>
              <p className={`text-xs ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Try saying: &ldquo;start breathing&rdquo; or &ldquo;play relaxing music&rdquo;
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => processCommand('start breathing')}
                className={`px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
                  isDarkMode 
                    ? 'bg-green-600/20 text-green-300 border border-green-500/30 hover:bg-green-600/30' 
                    : 'bg-green-100 text-green-700 border border-green-200 hover:bg-green-200'
                }`}
              >
                🌬️ Breathing
              </button>
              <button
                onClick={() => processCommand('play relaxing music')}
                className={`px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
                  isDarkMode 
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/30' 
                    : 'bg-purple-100 text-purple-700 border border-purple-200 hover:bg-purple-200'
                }`}
              >
                🎵 Music
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceCommands;
