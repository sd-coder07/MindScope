'use client';

import { motion } from 'framer-motion';
import {
    Activity,
    Brain,
    Globe,
    Headphones,
    Heart,
    Mic,
    Play,
    RotateCcw,
    Shield,
    Volume2
} from 'lucide-react';
import React, { useState } from 'react';
import VoiceIntegration from '../../../components/VoiceIntegration';
import LanguageSupport from '../../../lib/languageSupport';
import { VoiceAnalysisResult } from '../../../lib/voiceAnalysis';

const VoiceIntegrationDemo: React.FC = () => {
  // State management
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isDemo, setIsDemo] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const [voiceAnalysisResults, setVoiceAnalysisResults] = useState<VoiceAnalysisResult[]>([]);
  const [detectedCrisis, setDetectedCrisis] = useState<string[]>([]);
  
  // Language support
  const languageSupport = new LanguageSupport();
  const currentLanguageConfig = languageSupport.getLanguageConfig(selectedLanguage);
  const currentCulturalContext = languageSupport.getCulturalContext(selectedLanguage);

  // Ensure we have valid data
  if (!currentLanguageConfig || !currentCulturalContext) {
    return <div className="p-8 text-center text-red-500">Error loading language configuration</div>;
  }

  // Demo scenarios
  const demoScenarios = [
    {
      title: 'Stress Detection',
      description: 'Demonstrating real-time stress analysis through voice patterns',
      simulatedInput: 'I feel so overwhelmed... There\'s just too much pressure and I can\'t seem to handle everything.',
      expectedOutput: {
        stress: 0.85,
        anxiety: 0.72,
        recommendations: ['breathing exercises', 'stress management techniques']
      }
    },
    {
      title: 'Emotional Support',
      description: 'Culturally-sensitive emotional recognition and therapeutic response',
      simulatedInput: 'I\'ve been feeling really down lately, like nothing I do matters anymore.',
      expectedOutput: {
        depression: 0.78,
        energy: 0.23,
        recommendations: ['professional support', 'activity scheduling']
      }
    },
    {
      title: 'Crisis Intervention',
      description: 'Immediate crisis detection and emergency response protocols',
      simulatedInput: 'I just can\'t take this anymore. I feel like giving up completely.',
      expectedOutput: {
        crisisLevel: 'high',
        immediateAction: 'emergency protocols activated',
        recommendations: ['immediate professional help', 'crisis hotline']
      }
    },
    {
      title: 'Multilingual Analysis',
      description: 'Voice analysis across different languages and cultural contexts',
      simulatedInput: '很焦虑，工作压力太大了',
      expectedOutput: {
        language: 'zh-CN',
        culturalAdaptation: 'high-context communication',
        recommendations: ['family support', 'work-life balance']
      }
    }
  ];

  // Handle voice analysis results
  const handleVoiceAnalysis = (result: VoiceAnalysisResult) => {
    setVoiceAnalysisResults(prev => {
      const updated = [...prev, result];
      return updated.slice(-5); // Keep last 5 results
    });
  };

  // Handle crisis detection
  const handleCrisisDetected = (indicators: string[]) => {
    setDetectedCrisis(indicators);
  };

  // Start demo
  const startDemo = () => {
    setIsDemo(true);
    setDemoStep(0);
  };

  // Next demo step
  const nextDemoStep = () => {
    if (demoStep < demoScenarios.length - 1) {
      setDemoStep(prev => prev + 1);
    } else {
      setIsDemo(false);
      setDemoStep(0);
    }
  };

  // Reset demo
  const resetDemo = () => {
    setIsDemo(false);
    setDemoStep(0);
    setVoiceAnalysisResults([]);
    setDetectedCrisis([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Headphones className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">MindScope Voice Integration</h1>
              </div>
              <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-blue-100 rounded-full">
                <Brain className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Advanced AI Voice Analysis</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Language Selector */}
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-gray-600" />
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="zh-CN">中文</option>
                  <option value="ja">日本語</option>
                  <option value="ar">العربية</option>
                </select>
              </div>
              
              {/* Demo Controls */}
              <div className="flex items-center space-x-2">
                {!isDemo ? (
                  <button
                    onClick={startDemo}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    <span>Start Demo</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={nextDemoStep}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Play className="w-4 h-4" />
                      <span>Next ({demoStep + 1}/{demoScenarios.length})</span>
                    </button>
                    <button
                      onClick={resetDemo}
                      className="flex items-center space-x-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Demo Scenario Display */}
        {isDemo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Demo: {demoScenarios[demoStep].title}
              </h2>
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  {demoScenarios.map((_, index) => (
                    <div
                      key={index}
                      className={`w-3 h-3 rounded-full ${
                        index === demoStep ? 'bg-blue-500' : 
                        index < demoStep ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <p className="text-gray-700 mb-4">{demoScenarios[demoStep].description}</p>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Simulated Voice Input:</h3>
              <p className="text-gray-700 italic">"{demoScenarios[demoStep].simulatedInput}"</p>
            </div>
          </motion.div>
        )}

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Voice Integration Component */}
          <div className="lg:col-span-2">
            <VoiceIntegration
              language={selectedLanguage}
              culturalContext={currentCulturalContext}
              onVoiceAnalysis={handleVoiceAnalysis}
              onCrisisDetected={handleCrisisDetected}
              isEnabled={true}
              therapeuticMode={isDemo ? 'assessment' : 'therapy'}
            />
          </div>

          {/* Sidebar with Results and Info */}
          <div className="space-y-6">
            {/* Cultural Context Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cultural Context</h3>
              
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-700">Language:</span>
                  <span className="ml-2 text-sm text-gray-900">{currentLanguageConfig.name}</span>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-700">Communication Style:</span>
                  <span className="ml-2 text-sm text-gray-900 capitalize">
                    {currentCulturalContext.communicationStyle.replace('-', ' ')}
                  </span>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-700">Family Involvement:</span>
                  <span className="ml-2 text-sm text-gray-900 capitalize">
                    High
                  </span>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-700">Religious Integration:</span>
                  <span className="ml-2 text-sm text-gray-900 capitalize">
                    {currentCulturalContext.religiousConsiderations}
                  </span>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-700">Therapeutic Preferences:</span>
                  <div className="mt-1">
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-1 mb-1">
                      CBT
                    </span>
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-1 mb-1">
                      Mindfulness
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Analysis Results */}
            {voiceAnalysisResults.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Analysis</h3>
                
                <div className="space-y-3">
                  {voiceAnalysisResults.slice(-3).map((result, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-gray-50 rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          Analysis #{voiceAnalysisResults.length - index}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(result.emotions[0]?.timestamp || Date.now()).toLocaleTimeString()}
                        </span>
                      </div>
                      
                      {result.emotions[0] && (
                        <div className="flex items-center space-x-2 mb-1">
                          <Heart className="w-4 h-4 text-red-500" />
                          <span className="text-sm text-gray-700">
                            {result.emotions[0].primary} ({Math.round(result.emotions[0].confidence * 100)}%)
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2">
                        <Activity className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-gray-700">
                          Stress: {Math.round(result.biomarkers.stress * 100)}%
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Crisis Alerts */}
            {detectedCrisis.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 border-2 border-red-200 rounded-xl p-6"
              >
                <div className="flex items-center space-x-2 mb-3">
                  <Shield className="w-6 h-6 text-red-500" />
                  <h3 className="text-lg font-semibold text-red-900">Crisis Alert</h3>
                </div>
                
                <div className="space-y-2">
                  {detectedCrisis.map((indicator, index) => (
                    <div key={index} className="text-sm text-red-800">
                      • {indicator.replace(/_/g, ' ').toUpperCase()}
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 p-3 bg-red-100 rounded-lg">
                  <p className="text-sm text-red-800 font-medium">
                    Emergency protocols have been activated. Professional support is recommended immediately.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Emergency Resources */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Resources</h3>
              
              <div className="space-y-3">
                {currentLanguageConfig.emergencyResources.slice(0, 3).map((resource, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 capitalize">{resource.type.replace('_', ' ')}:</span>
                    <span className={`text-sm font-mono ${resource.type === 'crisis' ? 'text-red-600' : 'text-blue-600'}`}>
                      {resource.phone}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 text-xs text-gray-500">
                Resources are automatically localized based on detected language and cultural context.
              </div>
            </div>

            {/* Features Overview */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Voice Analysis Features</h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Real-time emotion detection</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Voice biomarker analysis</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Crisis pattern recognition</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Multilingual support (7+ languages)</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Cultural adaptation</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Therapeutic voice synthesis</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Capabilities */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Advanced Voice Analysis Capabilities</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mic className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Voice Biomarkers</h3>
              <p className="text-sm text-gray-600">
                Extract stress, anxiety, depression, and fatigue indicators from vocal patterns
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Emotion Recognition</h3>
              <p className="text-sm text-gray-600">
                Identify emotional states with confidence scoring and intensity measurement
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Crisis Detection</h3>
              <p className="text-sm text-gray-600">
                Real-time identification of suicidal ideation and severe mental health episodes
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Volume2 className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Therapeutic Synthesis</h3>
              <p className="text-sm text-gray-600">
                Culturally-adapted voice responses with emotional intelligence
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceIntegrationDemo;
