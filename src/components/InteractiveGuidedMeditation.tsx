'use client';

import { motion } from 'framer-motion';
import {
    Headphones,
    Heart,
    Mountain,
    Pause,
    Play,
    RotateCcw,
    Volume2,
    Waves
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface MeditationSession {
  id: string;
  title: string;
  description: string;
  duration: number; // in seconds
  type: 'breathing' | 'body_scan' | 'loving_kindness' | 'mindfulness' | 'stress_relief';
  script: string[];
  icon: React.ReactNode;
  color: string;
}

interface InteractiveGuidedMeditationProps {
  isDarkMode?: boolean;
  onComplete?: (sessionId: string, duration: number) => void;
}

const InteractiveGuidedMeditation: React.FC<InteractiveGuidedMeditationProps> = ({
  isDarkMode = false,
  onComplete
}) => {
  const [selectedSession, setSelectedSession] = useState<MeditationSession | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);

  const meditationSessions: MeditationSession[] = [
    {
      id: 'breathing',
      title: '4-7-8 Breathing',
      description: 'A calming breathing technique to reduce anxiety and promote relaxation.',
      duration: 300, // 5 minutes
      type: 'breathing',
      icon: <Waves className="w-6 h-6" />,
      color: 'from-blue-400 to-cyan-500',
      script: [
        "Welcome to the 4-7-8 breathing technique. Find a comfortable position and close your eyes if you'd like.",
        "Place one hand on your chest and one on your belly. We'll breathe together.",
        "Inhale slowly through your nose for 4 counts... 1... 2... 3... 4...",
        "Now hold your breath for 7 counts... 1... 2... 3... 4... 5... 6... 7...",
        "Exhale completely through your mouth for 8 counts... 1... 2... 3... 4... 5... 6... 7... 8...",
        "Excellent. Let's repeat this cycle. Inhale for 4... 1... 2... 3... 4...",
        "Hold for 7... 1... 2... 3... 4... 5... 6... 7...",
        "Exhale for 8... 1... 2... 3... 4... 5... 6... 7... 8...",
        "Continue this pattern on your own. Focus on the counts and the sensation of your breath.",
        "If your mind wanders, gently bring your attention back to your breathing.",
        "You're doing wonderfully. Take three more cycles at your own pace.",
        "When you're ready, slowly open your eyes and notice how you feel. Well done."
      ]
    },
    {
      id: 'body_scan',
      title: 'Progressive Body Scan',
      description: 'Release tension and increase body awareness through guided relaxation.',
      duration: 600, // 10 minutes
      type: 'body_scan',
      icon: <Heart className="w-6 h-6" />,
      color: 'from-green-400 to-emerald-500',
      script: [
        "Welcome to progressive body scan meditation. Lie down or sit comfortably.",
        "Close your eyes and take three deep breaths to center yourself.",
        "Begin by noticing your toes. Wiggle them gently, then let them relax completely.",
        "Move your attention to your feet. Notice any sensations, then consciously relax them.",
        "Feel your ankles and calves. If there's tension, breathe into those areas and let it go.",
        "Notice your knees and thighs. Allow any tightness to melt away with each exhale.",
        "Bring awareness to your hips and lower back. Breathe softness into these areas.",
        "Feel your abdomen rising and falling with each breath. Let it be natural and easy.",
        "Notice your chest and heart center. Send gratitude to your heart for its constant work.",
        "Feel your shoulders. Many of us hold stress here. Consciously drop them and relax.",
        "Notice your arms, from shoulders to fingertips. Let them become heavy and relaxed.",
        "Bring attention to your neck and throat. Release any tension with gentle breathing.",
        "Feel your jaw, often tight from stress. Let it soften and slightly open.",
        "Notice your face - forehead, eyes, cheeks. Let all facial muscles completely relax.",
        "Feel your entire body now, heavy and relaxed. Rest in this state of complete ease.",
        "Take a few deeper breaths and slowly return your awareness to the room."
      ]
    },
    {
      id: 'loving_kindness',
      title: 'Loving-Kindness Meditation',
      description: 'Cultivate compassion and love for yourself and others.',
      duration: 480, // 8 minutes
      type: 'loving_kindness',
      icon: <Heart className="w-6 h-6" />,
      color: 'from-pink-400 to-rose-500',
      script: [
        "Welcome to loving-kindness meditation. Sit comfortably and close your eyes gently.",
        "Begin by placing your hand on your heart and taking three deep breaths.",
        "Bring yourself to mind - your face, your whole being. Offer yourself these wishes:",
        "May I be happy. May I be healthy. May I be safe. May I live with ease.",
        "Repeat silently: May I be happy. May I be healthy. May I be safe. May I live with ease.",
        "Now bring to mind someone you love deeply - a family member, friend, or pet.",
        "See their face and offer them the same loving wishes:",
        "May you be happy. May you be healthy. May you be safe. May you live with ease.",
        "Feel the warmth in your heart as you send these loving wishes to them.",
        "Now think of a neutral person - someone you neither particularly like nor dislike.",
        "Perhaps a cashier, neighbor, or acquaintance. Offer them the same wishes:",
        "May you be happy. May you be healthy. May you be safe. May you live with ease.",
        "Finally, if you feel ready, think of someone you have difficulty with.",
        "Start small if needed. Offer them these wishes: May you be happy. May you be healthy.",
        "Expand your loving-kindness to all beings everywhere: May all beings be happy and free.",
        "Rest in this feeling of universal love and compassion. You are connected to all life."
      ]
    },
    {
      id: 'mindfulness',
      title: 'Present Moment Awareness',
      description: 'Develop mindfulness and presence through anchoring in the now.',
      duration: 420, // 7 minutes
      type: 'mindfulness',
      icon: <Mountain className="w-6 h-6" />,
      color: 'from-purple-400 to-indigo-500',
      script: [
        "Welcome to present moment awareness meditation. Find a comfortable seated position.",
        "Begin by simply noticing that you are here, right now, in this moment.",
        "Take three conscious breaths, feeling each inhale and exhale completely.",
        "Notice five things you can see around you, even with eyes closed - light, shadows, colors.",
        "Notice four things you can hear - perhaps sounds nearby and far away.",
        "Notice three things you can feel - your body in the chair, air on your skin, clothing.",
        "Notice two things you can smell - perhaps subtle scents in the air around you.",
        "Notice one thing you can taste - maybe just the taste in your mouth right now.",
        "You've just practiced the 5-4-3-2-1 grounding technique. You are fully present.",
        "Now rest your attention on your breath, not changing it, just observing.",
        "When your mind wanders to past or future, gently return to your breath.",
        "There's nowhere to go, nothing to do, just this moment, just this breath.",
        "You are exactly where you need to be. Rest in this knowing.",
        "Continue breathing mindfully until you're ready to open your eyes.",
        "Carry this presence with you as you continue your day."
      ]
    }
  ];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      speechSynthesisRef.current = window.speechSynthesis;
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
      }
    };
  }, []);

  const speakText = useCallback((text: string) => {
    if (speechSynthesisRef.current && voiceEnabled) {
      speechSynthesisRef.current.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.7;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      const voices = speechSynthesisRef.current.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Natural') || 
        voice.name.includes('Calm') ||
        voice.lang.startsWith('en')
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      speechSynthesisRef.current.speak(utterance);
    }
  }, [voiceEnabled]);

  const startMeditation = (session: MeditationSession) => {
    setSelectedSession(session);
    setCurrentStep(0);
    setElapsedTime(0);
    setIsPlaying(true);
    
    // Speak the first instruction
    speakText(session.script[0]);
    
    // Start timer
    timerRef.current = setInterval(() => {
      setElapsedTime(prev => {
        const newTime = prev + 1;
        
        // Auto-advance steps based on timing
        if (session.script.length > 1) {
          const stepDuration = session.duration / session.script.length;
          const newStep = Math.floor(newTime / stepDuration);
          
          if (newStep < session.script.length && newStep !== Math.floor(prev / stepDuration)) {
            setCurrentStep(newStep);
            speakText(session.script[newStep]);
          }
        }
        
        // Complete meditation
        if (newTime >= session.duration) {
          setIsPlaying(false);
          onComplete?.(session.id, newTime);
          return session.duration;
        }
        
        return newTime;
      });
    }, 1000);
  };

  const pauseMeditation = () => {
    setIsPlaying(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
    }
  };

  const resumeMeditation = () => {
    if (!selectedSession) return;
    
    setIsPlaying(true);
    
    // Continue speaking current step
    speakText(selectedSession.script[currentStep]);
    
    // Resume timer
    timerRef.current = setInterval(() => {
      setElapsedTime(prev => {
        const newTime = prev + 1;
        
        if (selectedSession.script.length > 1) {
          const stepDuration = selectedSession.duration / selectedSession.script.length;
          const newStep = Math.floor(newTime / stepDuration);
          
          if (newStep < selectedSession.script.length && newStep !== Math.floor(prev / stepDuration)) {
            setCurrentStep(newStep);
            speakText(selectedSession.script[newStep]);
          }
        }
        
        if (newTime >= selectedSession.duration) {
          setIsPlaying(false);
          onComplete?.(selectedSession.id, newTime);
          return selectedSession.duration;
        }
        
        return newTime;
      });
    }, 1000);
  };

  const resetMeditation = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setElapsedTime(0);
    setSelectedSession(null);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!selectedSession) {
    return (
      <div className={`w-full rounded-2xl p-6 ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } border shadow-lg`}>
        <div className="text-center mb-6">
          <h3 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Guided Meditations
          </h3>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Choose a meditation practice to help with your current needs
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {meditationSessions.map((session) => (
            <motion.button
              key={session.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => startMeditation(session)}
              className={`p-4 rounded-xl text-left transition-all ${
                isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 border-gray-600' 
                  : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
              } border`}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${session.color}`}>
                  {session.icon}
                </div>
                <div className="flex-1">
                  <h4 className={`font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {session.title}
                  </h4>
                  <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {session.description}
                  </p>
                  <div className="flex items-center space-x-4 text-xs">
                    <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {formatTime(session.duration)}
                    </span>
                    <span className={`px-2 py-1 rounded-full ${
                      isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {session.type.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full rounded-2xl p-6 ${
      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    } border shadow-lg`}>
      {/* Header */}
      <div className="text-center mb-6">
        <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${selectedSession.color} mb-3`}>
          {selectedSession.icon}
        </div>
        <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {selectedSession.title}
        </h3>
        <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {selectedSession.description}
        </p>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Step {currentStep + 1} of {selectedSession.script.length}
          </span>
          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {formatTime(elapsedTime)} / {formatTime(selectedSession.duration)}
          </span>
        </div>
        <div className={`w-full h-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
          <div
            className={`h-full rounded-full bg-gradient-to-r ${selectedSession.color} transition-all duration-1000`}
            style={{ width: `${(elapsedTime / selectedSession.duration) * 100}%` }}
          />
        </div>
      </div>

      {/* Current Instruction */}
      <div className={`p-4 rounded-xl mb-6 ${
        isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
      }`}>
        <p className={`text-center leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {selectedSession.script[currentStep]}
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={() => setVoiceEnabled(!voiceEnabled)}
          className={`p-3 rounded-xl transition-all ${
            voiceEnabled 
              ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' 
              : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
          }`}
        >
          {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <Headphones className="w-5 h-5" />}
        </button>

        <button
          onClick={isPlaying ? pauseMeditation : resumeMeditation}
          className={`p-4 rounded-xl bg-gradient-to-r ${selectedSession.color} text-white hover:opacity-90 transition-opacity`}
        >
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
        </button>

        <button
          onClick={resetMeditation}
          className={`p-3 rounded-xl transition-all ${
            isDarkMode 
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default InteractiveGuidedMeditation;
