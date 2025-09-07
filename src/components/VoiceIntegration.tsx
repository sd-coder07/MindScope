'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
    Activity,
    AlertTriangle,
    Brain,
    Globe,
    Headphones,
    Heart,
    Mic,
    MicOff,
    Settings,
    Volume2,
    VolumeX,
    Waves
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CulturalContext } from '../lib/languageSupport';
import { AdvancedVoiceAnalysis, VoiceAnalysisResult, VoiceBiomarkers, VoiceEmotion } from '../lib/voiceAnalysis';

interface VoiceIntegrationProps {
  language: string;
  culturalContext: CulturalContext;
  onVoiceAnalysis?: (result: VoiceAnalysisResult) => void;
  onCrisisDetected?: (indicators: string[]) => void;
  isEnabled?: boolean;
  therapeuticMode?: 'assessment' | 'therapy' | 'crisis' | 'monitoring';
}

interface RealTimeMetrics {
  stress: number;
  anxiety: number;
  depression: number;
  coherence: number;
  energy: number;
  timestamp: number;
}

const VoiceIntegration: React.FC<VoiceIntegrationProps> = ({
  language = 'en',
  culturalContext,
  onVoiceAnalysis,
  onCrisisDetected,
  isEnabled = true,
  therapeuticMode = 'therapy'
}) => {
  // Core state
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Voice analysis state
  const [currentEmotion, setCurrentEmotion] = useState<VoiceEmotion | null>(null);
  const [biomarkers, setBiomarkers] = useState<VoiceBiomarkers | null>(null);
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeMetrics[]>([]);
  const [transcription, setTranscription] = useState('');
  const [crisisIndicators, setCrisisIndicators] = useState<string[]>([]);
  
  // Configuration state
  const [voiceSettings, setVoiceSettings] = useState({
    sensitivity: 0.7,
    noiseReduction: true,
    emotionalAdaptation: true,
    culturalAdaptation: true,
    voiceGender: 'female' as 'male' | 'female' | 'neutral',
    therapeuticTone: 'warm' as 'calm' | 'warm' | 'encouraging' | 'professional'
  });
  
  // UI state
  const [showSettings, setShowSettings] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [permissionStatus, setPermissionStatus] = useState<'pending' | 'granted' | 'denied'>('pending');
  
  // Refs
  const voiceAnalysisRef = useRef<AdvancedVoiceAnalysis | null>(null);
  const metricsIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const analysisBufferRef = useRef<VoiceAnalysisResult[]>([]);

  // Initialize voice analysis system
  useEffect(() => {
    if (isEnabled) {
      try {
        voiceAnalysisRef.current = new AdvancedVoiceAnalysis();
        setConnectionStatus('connected');
      } catch (error) {
        console.error('Failed to initialize voice analysis:', error);
        setConnectionStatus('error');
      }
    }
    
    return () => {
      if (voiceAnalysisRef.current) {
        voiceAnalysisRef.current.dispose();
      }
      if (metricsIntervalRef.current) {
        clearInterval(metricsIntervalRef.current);
      }
    };
  }, [isEnabled]);

  // Request microphone permission
  const requestMicrophonePermission = useCallback(async () => {
    try {
      setPermissionStatus('pending');
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setPermissionStatus('granted');
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setPermissionStatus('denied');
    }
  }, []);

  // Start voice recording and analysis
  const startVoiceAnalysis = useCallback(async () => {
    if (!voiceAnalysisRef.current || !isEnabled) return;
    
    try {
      setIsRecording(true);
      setIsListening(true);
      setIsAnalyzing(true);
      setConnectionStatus('connecting');
      
      await voiceAnalysisRef.current.startVoiceAnalysis(language);
      setConnectionStatus('connected');
      
      // Start real-time metrics collection
      metricsIntervalRef.current = setInterval(() => {
        if (biomarkers) {
          const metrics: RealTimeMetrics = {
            stress: biomarkers.stress,
            anxiety: biomarkers.anxiety,
            depression: biomarkers.depression,
            coherence: biomarkers.coherence,
            energy: biomarkers.volume,
            timestamp: Date.now()
          };
          
          setRealTimeMetrics(prev => {
            const updated = [...prev, metrics];
            // Keep only last 60 seconds of data
            const cutoff = Date.now() - 60000;
            return updated.filter(m => m.timestamp > cutoff);
          });
        }
      }, 1000);
      
    } catch (error) {
      console.error('Failed to start voice analysis:', error);
      setConnectionStatus('error');
      setIsRecording(false);
      setIsListening(false);
      setIsAnalyzing(false);
    }
  }, [language, isEnabled, biomarkers]);

  // Stop voice recording and analysis
  const stopVoiceAnalysis = useCallback(() => {
    if (voiceAnalysisRef.current) {
      voiceAnalysisRef.current.stopVoiceAnalysis();
    }
    
    if (metricsIntervalRef.current) {
      clearInterval(metricsIntervalRef.current);
      metricsIntervalRef.current = null;
    }
    
    setIsRecording(false);
    setIsListening(false);
    setIsAnalyzing(false);
    setConnectionStatus('disconnected');
  }, []);

  // Process voice analysis results
  const processVoiceAnalysis = useCallback(async (audioData: Blob, transcript: string) => {
    if (!voiceAnalysisRef.current) return;
    
    try {
      // Analyze emotions from transcript
      const emotions = voiceAnalysisRef.current.analyzeEmotionFromText(transcript, language);
      const primaryEmotion = emotions[0] || null;
      
      // Get current biomarkers (simulated for demo)
      const currentBiomarkers: VoiceBiomarkers = biomarkers || {
        stress: Math.random() * 0.6,
        fatigue: Math.random() * 0.4,
        anxiety: Math.random() * 0.5,
        depression: Math.random() * 0.3,
        coherence: 0.7 + Math.random() * 0.3,
        pace: 140 + Math.random() * 40,
        volume: 0.3 + Math.random() * 0.4,
        breathingPattern: 'normal'
      };
      
      // Detect crisis indicators
      const crisisIndicators = voiceAnalysisRef.current.detectCrisisIndicators(transcript, currentBiomarkers);
      
      // Create analysis result
      const analysisResult: VoiceAnalysisResult = {
        emotions,
        biomarkers: currentBiomarkers,
        transcription: transcript,
        language,
        confidence: primaryEmotion?.confidence || 0.5,
        riskIndicators: crisisIndicators,
        recommendations: generateRecommendations(currentBiomarkers, emotions, culturalContext)
      };
      
      // Update state
      setCurrentEmotion(primaryEmotion);
      setBiomarkers(currentBiomarkers);
      setTranscription(transcript);
      setCrisisIndicators(crisisIndicators);
      
      // Store in buffer
      analysisBufferRef.current.push(analysisResult);
      if (analysisBufferRef.current.length > 10) {
        analysisBufferRef.current.shift();
      }
      
      // Trigger callbacks
      onVoiceAnalysis?.(analysisResult);
      
      if (crisisIndicators.length > 0) {
        onCrisisDetected?.(crisisIndicators);
      }
      
    } catch (error) {
      console.error('Error processing voice analysis:', error);
    }
  }, [language, biomarkers, culturalContext, onVoiceAnalysis, onCrisisDetected]);

  // Generate therapeutic recommendations
  const generateRecommendations = (
    biomarkers: VoiceBiomarkers, 
    emotions: VoiceEmotion[], 
    cultural: CulturalContext
  ): string[] => {
    const recommendations: string[] = [];
    
    // Stress-based recommendations
    if (biomarkers.stress > 0.7) {
      recommendations.push(cultural.preferredTherapeuticApproaches?.includes('mindfulness') 
        ? 'Consider a brief mindfulness breathing exercise'
        : 'Try taking slow, deep breaths to reduce stress');
    }
    
    // Anxiety-based recommendations
    if (biomarkers.anxiety > 0.6) {
      recommendations.push(cultural.preferredTherapeuticApproaches?.includes('behavioral') 
        ? 'Use the 5-4-3-2-1 grounding technique'
        : 'Focus on relaxing your shoulders and jaw');
    }
    
    // Depression indicators
    if (biomarkers.depression > 0.5) {
      recommendations.push(cultural.culturalValues?.includes('family-oriented')
        ? 'Consider reaching out to family or close friends'
        : 'Remember that these feelings are temporary');
    }
    
    // Cultural adaptations
    if (cultural.communicationStyle === 'high-context') {
      recommendations.push('Take time to reflect on these insights');
    } else {
      recommendations.push('Let\'s work together on specific coping strategies');
    }
    
    return recommendations;
  };

  // Speak therapeutic response
  const speakTherapeuticResponse = useCallback(async (text: string) => {
    if (!voiceAnalysisRef.current || isSpeaking) return;
    
    try {
      setIsSpeaking(true);
      
      await voiceAnalysisRef.current.synthesizeTherapeuticVoice(text, {
        language,
        voice: voiceSettings.voiceGender,
        pitch: 1.0,
        rate: 0.9,
        volume: 0.8,
        emotionalTone: voiceSettings.therapeuticTone,
        culturalAdaptation: voiceSettings.culturalAdaptation
      }, currentEmotion || undefined);
      
    } catch (error) {
      console.error('Error synthesizing speech:', error);
    } finally {
      setIsSpeaking(false);
    }
  }, [language, voiceSettings, currentEmotion, isSpeaking]);

  // Get stress level color
  const getStressColor = (level: number): string => {
    if (level < 0.3) return 'text-green-500';
    if (level < 0.6) return 'text-yellow-500';
    if (level < 0.8) return 'text-orange-500';
    return 'text-red-500';
  };

  // Get connection status color
  const getConnectionColor = (): string => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-500';
      case 'connecting': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  // Permission check
  useEffect(() => {
    requestMicrophonePermission();
  }, [requestMicrophonePermission]);

  if (!isEnabled) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg text-center">
        <Headphones className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600">Voice integration is not enabled</p>
      </div>
    );
  }

  if (permissionStatus === 'denied') {
    return (
      <div className="p-6 bg-red-50 rounded-lg text-center">
        <MicOff className="w-12 h-12 mx-auto mb-4 text-red-500" />
        <p className="text-red-700 mb-4">Microphone access is required for voice analysis</p>
        <button
          onClick={requestMicrophonePermission}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Request Permission
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Voice Control Panel */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'}`} />
            <h3 className="text-lg font-semibold text-gray-900">Voice Analysis</h3>
            <span className={`text-sm ${getConnectionColor()}`}>
              {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <Globe className="w-4 h-4" />
              <span>{language.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Main Voice Controls */}
        <div className="flex items-center justify-center space-x-6 mb-6">
          <motion.button
            onClick={isRecording ? stopVoiceAnalysis : startVoiceAnalysis}
            disabled={connectionStatus === 'error'}
            className={`relative p-4 rounded-full transition-all duration-300 ${
              isRecording 
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg' 
                : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            whileTap={{ scale: 0.95 }}
            animate={isRecording ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 1, repeat: isRecording ? Infinity : 0 }}
          >
            {isRecording ? (
              <MicOff className="w-8 h-8" />
            ) : (
              <Mic className="w-8 h-8" />
            )}
            
            {/* Recording pulse effect */}
            {isRecording && (
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-red-300"
                animate={{ scale: [1, 1.5], opacity: [1, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
          </motion.button>

          <div className="text-center">
            <div className="text-sm font-medium text-gray-900">
              {isRecording ? 'Recording...' : 'Ready to Record'}
            </div>
            <div className="text-xs text-gray-500">
              {isListening ? 'Listening for voice' : 'Click to start analysis'}
            </div>
          </div>
        </div>

        {/* Real-time Biomarkers */}
        {biomarkers && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
          >
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <Activity className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">Stress</span>
              </div>
              <div className={`text-lg font-bold ${getStressColor(biomarkers.stress)}`}>
                {Math.round(biomarkers.stress * 100)}%
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <Heart className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium text-gray-700">Anxiety</span>
              </div>
              <div className={`text-lg font-bold ${getStressColor(biomarkers.anxiety)}`}>
                {Math.round(biomarkers.anxiety * 100)}%
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <Brain className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium text-gray-700">Coherence</span>
              </div>
              <div className="text-lg font-bold text-green-500">
                {Math.round(biomarkers.coherence * 100)}%
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <Waves className="w-4 h-4 text-indigo-500" />
                <span className="text-sm font-medium text-gray-700">Energy</span>
              </div>
              <div className="text-lg font-bold text-blue-500">
                {Math.round(biomarkers.volume * 100)}%
              </div>
            </div>
          </motion.div>
        )}

        {/* Current Emotion */}
        {currentEmotion && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 mb-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Detected Emotion</h4>
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-semibold text-purple-700 capitalize">
                    {currentEmotion.primary}
                  </span>
                  <div className="flex items-center space-x-1">
                    <span className="text-sm text-gray-600">Confidence:</span>
                    <span className="text-sm font-medium text-purple-600">
                      {Math.round(currentEmotion.confidence * 100)}%
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-600 mb-1">Intensity</div>
                <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-purple-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${currentEmotion.intensity * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Crisis Indicators */}
        {crisisIndicators.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 mb-4"
          >
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h4 className="font-medium text-red-900">Crisis Indicators Detected</h4>
            </div>
            <div className="space-y-1">
              {crisisIndicators.map((indicator, index) => (
                <div key={index} className="text-sm text-red-700">
                  • {indicator.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2')}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Transcription */}
        {transcription && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Live Transcription</h4>
            <div className="text-gray-700 italic">
              "{transcription}"
            </div>
          </div>
        )}
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Voice Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sensitivity
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={voiceSettings.sensitivity}
                  onChange={(e) => setVoiceSettings(prev => ({
                    ...prev,
                    sensitivity: parseFloat(e.target.value)
                  }))}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {Math.round(voiceSettings.sensitivity * 100)}%
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Therapeutic Tone
                </label>
                <select
                  value={voiceSettings.therapeuticTone}
                  onChange={(e) => setVoiceSettings(prev => ({
                    ...prev,
                    therapeuticTone: e.target.value as any
                  }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="calm">Calm</option>
                  <option value="warm">Warm</option>
                  <option value="encouraging">Encouraging</option>
                  <option value="professional">Professional</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Voice Gender
                </label>
                <select
                  value={voiceSettings.voiceGender}
                  onChange={(e) => setVoiceSettings(prev => ({
                    ...prev,
                    voiceGender: e.target.value as any
                  }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="neutral">Neutral</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={voiceSettings.noiseReduction}
                    onChange={(e) => setVoiceSettings(prev => ({
                      ...prev,
                      noiseReduction: e.target.checked
                    }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Noise Reduction</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={voiceSettings.emotionalAdaptation}
                    onChange={(e) => setVoiceSettings(prev => ({
                      ...prev,
                      emotionalAdaptation: e.target.checked
                    }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Emotional Adaptation</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={voiceSettings.culturalAdaptation}
                    onChange={(e) => setVoiceSettings(prev => ({
                      ...prev,
                      culturalAdaptation: e.target.checked
                    }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Cultural Adaptation</span>
                </label>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Real-time Metrics Graph */}
      {realTimeMetrics.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Real-time Emotional State</h3>
          
          <div className="h-64 bg-gray-50 rounded-lg p-4">
            <div className="text-center text-gray-500 pt-20">
              <Activity className="w-8 h-8 mx-auto mb-2" />
              <p>Real-time voice metrics visualization</p>
              <p className="text-sm">Stress, anxiety, and coherence levels over time</p>
            </div>
          </div>
        </div>
      )}

      {/* Test Voice Synthesis */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Voice Response</h3>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => speakTherapeuticResponse('Hello, I\'m here to support you today. How are you feeling?')}
            disabled={isSpeaking}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{isSpeaking ? 'Speaking...' : 'Test Voice'}</span>
          </button>
          
          <div className="text-sm text-gray-600">
            Culturally adapted therapeutic voice in {language.toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceIntegration;
