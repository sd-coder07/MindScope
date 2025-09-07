'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Mic, MicOff, RotateCcw, Settings, Volume2, VolumeX } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface VoiceControlsProps {
  onCommand?: (command: string, params?: any) => void;
  isEnabled?: boolean;
  language?: string;
}

interface Command {
  trigger: string[];
  action: string;
  description: string;
  category: 'navigation' | 'breathing' | 'mood' | 'settings' | 'emergency';
}

const VOICE_COMMANDS: Command[] = [
  // Navigation
  { trigger: ['go to dashboard', 'open dashboard', 'home'], action: 'navigate_dashboard', description: 'Navigate to dashboard', category: 'navigation' },
  { trigger: ['breathing exercise', 'start breathing', 'breathe'], action: 'start_breathing', description: 'Start breathing exercise', category: 'breathing' },
  { trigger: ['mood tracker', 'track mood', 'log mood'], action: 'open_mood_tracker', description: 'Open mood tracker', category: 'mood' },
  
  // Breathing controls
  { trigger: ['inhale', 'breathe in'], action: 'breathing_inhale', description: 'Breathing inhale phase', category: 'breathing' },
  { trigger: ['exhale', 'breathe out'], action: 'breathing_exhale', description: 'Breathing exhale phase', category: 'breathing' },
  { trigger: ['hold breath', 'pause breathing'], action: 'breathing_hold', description: 'Breathing hold phase', category: 'breathing' },
  { trigger: ['stop breathing', 'end exercise'], action: 'breathing_stop', description: 'Stop breathing exercise', category: 'breathing' },
  
  // Mood commands
  { trigger: ['feeling happy', 'mood happy', 'i am happy'], action: 'set_mood_happy', description: 'Set mood to happy', category: 'mood' },
  { trigger: ['feeling sad', 'mood sad', 'i am sad'], action: 'set_mood_sad', description: 'Set mood to sad', category: 'mood' },
  { trigger: ['feeling anxious', 'mood anxious', 'i am anxious'], action: 'set_mood_anxious', description: 'Set mood to anxious', category: 'mood' },
  { trigger: ['feeling calm', 'mood calm', 'i am calm'], action: 'set_mood_calm', description: 'Set mood to calm', category: 'mood' },
  
  // Settings
  { trigger: ['dark mode', 'enable dark mode'], action: 'toggle_dark_mode', description: 'Toggle dark mode', category: 'settings' },
  { trigger: ['light mode', 'enable light mode'], action: 'toggle_light_mode', description: 'Toggle light mode', category: 'settings' },
  { trigger: ['increase volume', 'volume up'], action: 'volume_up', description: 'Increase volume', category: 'settings' },
  { trigger: ['decrease volume', 'volume down'], action: 'volume_down', description: 'Decrease volume', category: 'settings' },
  
  // Emergency
  { trigger: ['help me', 'emergency', 'crisis'], action: 'emergency_support', description: 'Emergency support', category: 'emergency' },
  { trigger: ['call therapist', 'contact therapist'], action: 'contact_therapist', description: 'Contact therapist', category: 'emergency' }
];

export default function VoiceControls({ onCommand, isEnabled = true, language = 'en-US' }: VoiceControlsProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [lastCommand, setLastCommand] = useState('');
  const [showCommands, setShowCommands] = useState(false);
  const [volume, setVolume] = useState(0);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const setupSpeechRecognition = useCallback((SpeechRecognition: any) => {
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = language;
    recognitionRef.current.maxAlternatives = 1;

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      setupAudioAnalysis();
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
      setVolume(0);
    };

    recognitionRef.current.onresult = (event: any) => {
      const lastResult = event.results[event.results.length - 1];
      const transcript = lastResult[0].transcript.toLowerCase().trim();
      const confidence = lastResult[0].confidence;
      
      setTranscript(transcript);
      setConfidence(confidence);
      
      if (lastResult.isFinal && confidence > 0.7) {
        processVoiceCommand(transcript);
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  useEffect(() => {
    // Check for Web Speech API support
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      setIsSupported(!!SpeechRecognition);
      
      if (SpeechRecognition) {
        setupSpeechRecognition(SpeechRecognition);
      }
      
      synthRef.current = window.speechSynthesis;
    }

    // Cleanup function
    return () => {
      // Cancel animation frames
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      
      // Stop speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      
      // Clean up audio context and microphone
      if (microphoneRef.current) {
        microphoneRef.current.disconnect();
        microphoneRef.current = null;
      }
      
      if (analyserRef.current) {
        analyserRef.current.disconnect();
        analyserRef.current = null;
      }
      
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      
      // Stop speech synthesis
      if (synthRef.current) {
        synthRef.current.cancel();
        synthRef.current = null;
      }
    };
  }, [language, setupSpeechRecognition]);

  const setupAudioAnalysis = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
      
      microphoneRef.current.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
      
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      
      const updateVolume = () => {
        if (analyserRef.current && isListening) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setVolume(Math.min(100, (average / 255) * 200));
          animationFrameRef.current = requestAnimationFrame(updateVolume);
        }
      };
      
      updateVolume();
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const processVoiceCommand = (transcript: string) => {
    const normalizedTranscript = transcript.toLowerCase().trim();
    
    for (const command of VOICE_COMMANDS) {
      const match = command.trigger.find(trigger => 
        normalizedTranscript.includes(trigger.toLowerCase())
      );
      
      if (match) {
        setLastCommand(command.description);
        
        // Execute the actual command action
        executeVoiceAction(command.action, { transcript: normalizedTranscript, confidence });
        
        // Also call the callback for external handling
        onCommand?.(command.action, { transcript: normalizedTranscript, confidence });
        
        // Provide voice feedback
        if (speechEnabled) {
          speak(`${command.description} activated`);
        }
        
        // Visual feedback
        setTimeout(() => setLastCommand(''), 3000);
        break;
      }
    }
  };

  const executeVoiceAction = (action: string, params: any) => {
    // Execute actual navigation and UI actions based on voice commands
    switch (action) {
      case 'navigate_dashboard':
        if (typeof window !== 'undefined') {
          window.location.hash = '#overview';
          // Trigger dashboard navigation
          const event = new CustomEvent('voiceNavigate', { detail: { tab: 'overview' } });
          window.dispatchEvent(event);
        }
        break;
        
      case 'start_breathing':
        if (typeof window !== 'undefined') {
          const event = new CustomEvent('voiceNavigate', { detail: { tab: 'breathing' } });
          window.dispatchEvent(event);
        }
        break;
        
      case 'open_mood_tracker':
        if (typeof window !== 'undefined') {
          const event = new CustomEvent('voiceNavigate', { detail: { tab: 'mood' } });
          window.dispatchEvent(event);
        }
        break;
        
      case 'breathing_inhale':
      case 'breathing_exhale':
      case 'breathing_hold':
      case 'breathing_stop':
        // Trigger breathing exercise events
        if (typeof window !== 'undefined') {
          const event = new CustomEvent('breathingControl', { 
            detail: { action: action.replace('breathing_', ''), params } 
          });
          window.dispatchEvent(event);
        }
        break;
        
      case 'set_mood_happy':
      case 'set_mood_sad':
      case 'set_mood_anxious':
      case 'set_mood_calm':
        // Trigger mood setting events
        if (typeof window !== 'undefined') {
          const mood = action.replace('set_mood_', '');
          const event = new CustomEvent('setMood', { 
            detail: { mood, timestamp: new Date().toISOString() } 
          });
          window.dispatchEvent(event);
        }
        break;
        
      case 'toggle_dark_mode':
      case 'toggle_light_mode':
        // Trigger theme change events
        if (typeof window !== 'undefined') {
          const theme = action.includes('dark') ? 'dark' : 'light';
          const event = new CustomEvent('themeChange', { detail: { theme } });
          window.dispatchEvent(event);
        }
        break;
        
      case 'volume_up':
      case 'volume_down':
        // Handle volume changes
        const change = action === 'volume_up' ? 10 : -10;
        setVolume(prev => Math.max(0, Math.min(100, prev + change)));
        break;
        
      case 'emergency_support':
        // Trigger emergency support
        if (typeof window !== 'undefined') {
          const event = new CustomEvent('emergencySupport', { detail: params });
          window.dispatchEvent(event);
          alert('Emergency support activated. Please seek immediate help if needed.');
        }
        break;
        
      case 'contact_therapist':
        // Trigger therapist contact
        if (typeof window !== 'undefined') {
          const event = new CustomEvent('contactTherapist', { detail: params });
          window.dispatchEvent(event);
          alert('Contacting your therapist...');
        }
        break;
        
      default:
        console.log('Unknown voice action:', action);
    }
  };

  const speak = (text: string) => {
    if (synthRef.current && speechEnabled) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      synthRef.current.speak(utterance);
    }
  };

  const toggleListening = () => {
    if (!isSupported) return;
    
    if (isListening) {
      recognitionRef.current?.stop();
      audioContextRef.current?.close();
    } else {
      recognitionRef.current?.start();
    }
  };

  const categoryColors = {
    navigation: 'bg-blue-500',
    breathing: 'bg-green-500',
    mood: 'bg-purple-500',
    settings: 'bg-gray-500',
    emergency: 'bg-red-500'
  };

  if (!isSupported) {
    return (
      <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
        <p className="text-sm">Voice controls not supported in this browser</p>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Main Control Panel */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-4 space-y-4"
      >
        {/* Voice Status */}
        <div className="flex items-center space-x-3">
          <motion.button
            onClick={toggleListening}
            disabled={!isEnabled}
            className={`p-3 rounded-full transition-all ${
              isListening 
                ? 'bg-red-500 text-white shadow-lg' 
                : 'bg-serenity-500 text-white hover:bg-serenity-600'
            } ${!isEnabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </motion.button>
          
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-800">
              {isListening ? 'Listening...' : 'Voice Inactive'}
            </div>
            <div className="text-xs text-gray-600">
              {confidence > 0 && `Confidence: ${Math.round(confidence * 100)}%`}
            </div>
          </div>
          
          <button
            onClick={() => setSpeechEnabled(!speechEnabled)}
            className={`p-2 rounded-lg transition-all ${
              speechEnabled ? 'bg-ocean-100 text-ocean-600' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {speechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>

        {/* Volume Indicator */}
        {isListening && (
          <div className="space-y-2">
            <div className="text-xs text-gray-600">Volume Level</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-serenity-500 h-2 rounded-full"
                style={{ width: `${volume}%` }}
                animate={{ width: `${volume}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </div>
        )}

        {/* Live Transcript */}
        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-50 rounded-lg p-3"
          >
            <div className="text-xs text-gray-600 mb-1">You said:</div>
            <div className="text-sm text-gray-800">{transcript}</div>
          </motion.div>
        )}

        {/* Last Command Feedback */}
        <AnimatePresence>
          {lastCommand && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-green-100 border border-green-400 text-green-700 p-3 rounded-lg"
            >
              <div className="text-xs font-medium">Command Executed:</div>
              <div className="text-sm">{lastCommand}</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls */}
        <div className="flex space-x-2">
          <button
            onClick={() => setShowCommands(!showCommands)}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-xs transition-all"
          >
            <Settings className="w-4 h-4 mx-auto" />
          </button>
          
          <button
            onClick={() => {
              setTranscript('');
              setLastCommand('');
              setConfidence(0);
            }}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-xs transition-all"
          >
            <RotateCcw className="w-4 h-4 mx-auto" />
          </button>
        </div>
      </motion.div>

      {/* Command Reference */}
      <AnimatePresence>
        {showCommands && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-full right-0 mb-4 bg-white rounded-2xl shadow-2xl p-6 w-80 max-h-96 overflow-y-auto"
          >
            <h3 className="text-lg font-bold text-gray-800 mb-4">Voice Commands</h3>
            
            {Object.entries(
              VOICE_COMMANDS.reduce((acc, cmd) => {
                if (!acc[cmd.category]) acc[cmd.category] = [];
                acc[cmd.category].push(cmd);
                return acc;
              }, {} as Record<string, Command[]>)
            ).map(([category, commands]) => (
              <div key={category} className="mb-4">
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white mb-2 ${categoryColors[category as keyof typeof categoryColors]}`}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </div>
                
                <div className="space-y-2">
                  {commands.map((cmd, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-lg p-3">
                      <div className="text-sm font-medium text-gray-800">{cmd.description}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        Say: &quot;{cmd.trigger[0]}&quot;
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-600 leading-relaxed">
                Speak clearly and wait for the microphone to activate. Commands work best in a quiet environment.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
