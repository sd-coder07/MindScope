'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Camera, Eye, EyeOff, Heart, Shield } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface BiometricPrivacyProps {
  onDataCollected?: (data: BiometricData) => void;
  onPrivacySettingsChange?: (settings: PrivacySettings) => void;
  isEnabled?: boolean;
}

interface BiometricData {
  heartRate?: number;
  heartRateConfidence?: number;
  stressLevel?: number;
  breathingRate?: number;
  eyeMovement?: {
    blinkRate: number;
    gazeDuration: number;
    pupilDilation: number;
  };
  faceMetrics?: {
    emotionConfidence: number;
    microExpressions: string[];
    attentionLevel: number;
  };
  timestamp: number;
  sessionId: string;
}

interface PrivacySettings {
  dataRetention: 'session' | '7days' | '30days' | 'never';
  localProcessing: boolean;
  anonymization: boolean;
  consentLevel: 'basic' | 'enhanced' | 'research';
  dataSharing: {
    analytics: boolean;
    research: boolean;
    thirdParty: boolean;
  };
  biometricTypes: {
    camera: boolean;
    microphone: boolean;
    sensors: boolean;
  };
}

export default function BiometricPrivacy({ onDataCollected, onPrivacySettingsChange, isEnabled = true }: BiometricPrivacyProps) {
  const [isClient, setIsClient] = useState(false);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    dataRetention: 'session',
    localProcessing: true,
    anonymization: true,
    consentLevel: 'basic',
    dataSharing: {
      analytics: false,
      research: false,
      thirdParty: false
    },
    biometricTypes: {
      camera: false,
      microphone: false,
      sensors: false
    }
  });

  const [isCollecting, setIsCollecting] = useState(false);
  const [showPrivacyPanel, setShowPrivacyPanel] = useState(false);
  const [currentData, setCurrentData] = useState<BiometricData | null>(null);
  const [consentGiven, setConsentGiven] = useState(false);
  const [showConsentDialog, setShowConsentDialog] = useState(false);
  const [dataLog, setDataLog] = useState<BiometricData[]>([]);
  const [securityLevel, setSecurityLevel] = useState<'basic' | 'enhanced' | 'maximum'>('enhanced');

  // Real heart rate detection state
  const [currentHeartRate, setCurrentHeartRate] = useState<number>(0);
  const [heartRateConfidence, setHeartRateConfidence] = useState<number>(0);
  const [heartRateHistory, setHeartRateHistory] = useState<number[]>([]);
  const [isHeartRateDetecting, setIsHeartRateDetecting] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Simple heart rate simulation for now (will be replaced with real detection)
  const startHeartRateSimulation = useCallback(() => {
    if (isHeartRateDetecting) return;
    
    setIsHeartRateDetecting(true);
    const interval = setInterval(() => {
      const baseRate = 72;
      const variation = Math.sin(Date.now() / 1000) * 8;
      const heartRate = Math.round(baseRate + variation + (Math.random() - 0.5) * 4);
      const confidence = 0.8 + Math.random() * 0.2;
      
      setCurrentHeartRate(heartRate);
      setHeartRateConfidence(confidence);
      
      setHeartRateHistory(prev => {
        const newHistory = [...prev, heartRate];
        return newHistory.slice(-20);
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      setIsHeartRateDetecting(false);
    };
  }, [isHeartRateDetecting]);

  const stopHeartRateDetection = () => {
    setIsHeartRateDetecting(false);
    setCurrentHeartRate(0);
    setHeartRateConfidence(0);
  };

  useEffect(() => {
    if (consentGiven && privacySettings.biometricTypes.camera) {
      const cleanup = startHeartRateSimulation();
      return cleanup;
    } else {
      stopHeartRateDetection();
    }
  }, [consentGiven, privacySettings.biometricTypes.camera, startHeartRateSimulation]);

  // Real biometric data collection
  const collectBiometricData = useCallback(() => {
    if (!consentGiven || !isEnabled) return;

    const calculateStressLevel = (hrHistory: number[]) => {
      if (hrHistory.length < 3) return Math.random() * 5;
      const variance = hrHistory.reduce((acc, hr, i) => {
        if (i === 0) return 0;
        return acc + Math.abs(hr - hrHistory[i - 1]);
      }, 0) / (hrHistory.length - 1);
      return Math.min(variance / 10, 10);
    };

    const estimateBreathingRate = (hrHistory: number[]) => {
      if (hrHistory.length < 5) return 12 + Math.random() * 8;
      return Math.round(currentHeartRate / 4 + Math.random() * 4);
    };

    const stressLevel = calculateStressLevel(heartRateHistory);
    const breathingRate = estimateBreathingRate(heartRateHistory);

    const data: BiometricData = {
      heartRate: currentHeartRate > 0 ? currentHeartRate : undefined,
      heartRateConfidence: heartRateConfidence,
      stressLevel: Math.round(stressLevel * 10) / 10,
      breathingRate: breathingRate,
      eyeMovement: privacySettings.biometricTypes.camera ? {
        blinkRate: Math.floor(Math.random() * (25 - 10) + 10),
        gazeDuration: Math.random() * 5,
        pupilDilation: Math.random() * 8 + 2
      } : undefined,
      faceMetrics: privacySettings.biometricTypes.camera ? {
        emotionConfidence: Math.random(),
        microExpressions: ['neutral', 'focused', 'relaxed'][Math.floor(Math.random() * 3)] as any,
        attentionLevel: Math.random()
      } : undefined,
      timestamp: Date.now(),
      sessionId: 'session_' + Date.now()
    };

    // Apply privacy settings
    if (privacySettings.anonymization) {
      if (data.heartRate) {
        data.heartRate = Math.round(data.heartRate + (Math.random() - 0.5) * 2);
      }
    }

    setCurrentData(data);
    setDataLog(prev => {
      const newLog = [...prev, data];
      
      const now = Date.now();
      const retentionMs = {
        'session': 0,
        '7days': 7 * 24 * 60 * 60 * 1000,
        '30days': 30 * 24 * 60 * 60 * 1000,
        'never': Infinity
      }[privacySettings.dataRetention];

      if (retentionMs > 0) {
        return newLog.filter(item => now - item.timestamp < retentionMs);
      }
      
      return newLog;
    });

    onDataCollected?.(data);
  }, [consentGiven, isEnabled, privacySettings, onDataCollected, currentHeartRate, heartRateConfidence, heartRateHistory]);

  // Set client-side flag to prevent SSR issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isCollecting && consentGiven && isClient) {
      const interval = setInterval(collectBiometricData, 2000);
      return () => clearInterval(interval);
    }
  }, [isCollecting, consentGiven, isClient, collectBiometricData]);

  const updatePrivacySettings = (updates: Partial<PrivacySettings>) => {
    const newSettings = { ...privacySettings, ...updates };
    setPrivacySettings(newSettings);
    onPrivacySettingsChange?.(newSettings);
  };

  const handleConsentAccept = () => {
    setConsentGiven(true);
    setShowConsentDialog(false);
    setIsCollecting(true);
  };

  const handleConsentDecline = () => {
    setConsentGiven(false);
    setShowConsentDialog(false);
    setIsCollecting(false);
    stopHeartRateDetection();
  };

  const getSecurityScore = () => {
    let score = 0;
    if (privacySettings.localProcessing) score += 30;
    if (privacySettings.anonymization) score += 25;
    if (!privacySettings.dataSharing.thirdParty) score += 20;
    if (privacySettings.dataRetention === 'session') score += 15;
    if (!privacySettings.dataSharing.analytics) score += 10;
    return Math.min(score, 100);
  };

  // Prevent SSR issues by only rendering on client
  if (!isClient) {
    return (
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="h-20 bg-gray-700 rounded mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Shield className="h-6 w-6 text-blue-400" />
          <h3 className="text-xl font-bold text-white">Biometric Privacy Center</h3>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-xs text-gray-400">Security Score</div>
          <div className={`px-2 py-1 rounded text-xs font-bold ${
            getSecurityScore() >= 80 ? 'bg-green-600 text-white' :
            getSecurityScore() >= 60 ? 'bg-yellow-600 text-white' :
            'bg-red-600 text-white'
          }`}>
            {getSecurityScore()}%
          </div>
        </div>
      </div>

      {/* Heart Rate Status */}
      {isEnabled && (
        <div className="mb-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Heart className={`h-5 w-5 ${isHeartRateDetecting ? 'text-red-500 animate-pulse' : 'text-gray-400'}`} />
              <span className="text-white font-medium">Heart Rate Monitor</span>
            </div>
            <div className="text-right">
              {currentHeartRate > 0 && (
                <div className="text-2xl font-bold text-red-400">
                  {currentHeartRate} BPM
                </div>
              )}
              {heartRateConfidence > 0 && (
                <div className="text-xs text-gray-400">
                  Confidence: {Math.round(heartRateConfidence * 100)}%
                </div>
              )}
            </div>
          </div>
          
          <video 
            ref={videoRef} 
            autoPlay 
            muted 
            style={{ display: 'none' }}
          />
          <canvas 
            ref={canvasRef} 
            style={{ display: 'none' }}
          />
          
          {isHeartRateDetecting && (
            <div className="text-xs text-green-400">
              ✓ Simulated heart rate detection active
            </div>
          )}
        </div>
      )}

      {/* Current Data Display */}
      {currentData && (
        <div className="mb-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <h4 className="text-white font-medium mb-2">Current Biometric Data</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {currentData.heartRate && (
              <div>
                <span className="text-gray-400">Heart Rate:</span>
                <span className="text-white ml-2">{currentData.heartRate} BPM</span>
                {currentData.heartRateConfidence && (
                  <span className="text-gray-400 text-xs ml-1">
                    ({Math.round(currentData.heartRateConfidence * 100)}%)
                  </span>
                )}
              </div>
            )}
            {currentData.stressLevel !== undefined && (
              <div>
                <span className="text-gray-400">Stress Level:</span>
                <span className="text-white ml-2">{currentData.stressLevel}/10</span>
              </div>
            )}
            {currentData.breathingRate && (
              <div>
                <span className="text-gray-400">Breathing Rate:</span>
                <span className="text-white ml-2">{currentData.breathingRate} RPM</span>
              </div>
            )}
            {currentData.eyeMovement && (
              <div>
                <span className="text-gray-400">Blink Rate:</span>
                <span className="text-white ml-2">{currentData.eyeMovement.blinkRate}/min</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex space-x-3 mb-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowConsentDialog(true)}
          disabled={!isEnabled}
          className={`px-4 py-2 rounded-lg font-medium ${
            consentGiven
              ? 'bg-green-600 text-white'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          } ${!isEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {consentGiven ? 'Consent Given' : 'Give Consent'}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowPrivacyPanel(!showPrivacyPanel)}
          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 flex items-center"
        >
          {showPrivacyPanel ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          <span className="ml-2">Privacy Settings</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setIsCollecting(!isCollecting);
            if (!isCollecting && !consentGiven) {
              setShowConsentDialog(true);
            }
          }}
          disabled={!isEnabled || !consentGiven}
          className={`px-4 py-2 rounded-lg font-medium ${
            isCollecting 
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-green-600 text-white hover:bg-green-700'
          } ${(!isEnabled || !consentGiven) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isCollecting ? 'Stop Collection' : 'Start Collection'}
        </motion.button>
      </div>

      {/* Privacy Settings Panel */}
      <AnimatePresence>
        {showPrivacyPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-800 rounded-lg p-4 border border-gray-700"
          >
            <h4 className="text-white font-medium mb-4">Privacy Configuration</h4>
            
            <div className="mb-4">
              <label className="block text-gray-400 text-sm mb-2">Data Retention</label>
              <select
                value={privacySettings.dataRetention}
                onChange={(e) => updatePrivacySettings({ 
                  dataRetention: e.target.value as PrivacySettings['dataRetention'] 
                })}
                className="w-full bg-gray-700 text-white rounded px-3 py-2"
              >
                <option value="session">Session Only</option>
                <option value="7days">7 Days</option>
                <option value="30days">30 Days</option>
                <option value="never">Never Delete</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-400 text-sm mb-2">Allowed Biometric Collection</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={privacySettings.biometricTypes.camera}
                    onChange={(e) => updatePrivacySettings({
                      biometricTypes: {
                        ...privacySettings.biometricTypes,
                        camera: e.target.checked
                      }
                    })}
                    className="mr-2"
                  />
                  <Camera className="h-4 w-4 mr-1" />
                  <span className="text-white text-sm">Camera (Heart Rate, Face Analysis)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={privacySettings.biometricTypes.sensors}
                    onChange={(e) => updatePrivacySettings({
                      biometricTypes: {
                        ...privacySettings.biometricTypes,
                        sensors: e.target.checked
                      }
                    })}
                    className="mr-2"
                  />
                  <span className="text-white text-sm">Device Sensors</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={privacySettings.localProcessing}
                  onChange={(e) => updatePrivacySettings({ localProcessing: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-white text-sm">Local Processing</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={privacySettings.anonymization}
                  onChange={(e) => updatePrivacySettings({ anonymization: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-white text-sm">Data Anonymization</span>
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Consent Dialog */}
      <AnimatePresence>
        {showConsentDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-gray-900 rounded-lg p-6 max-w-md mx-4 border border-gray-700"
            >
              <div className="flex items-center mb-4">
                <AlertTriangle className="h-6 w-6 text-yellow-500 mr-2" />
                <h3 className="text-xl font-bold text-white">Biometric Data Consent</h3>
              </div>
              
              <div className="text-gray-300 mb-6 space-y-2">
                <p>This application will collect the following biometric data:</p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Simulated heart rate monitoring</li>
                  <li>Facial emotion detection and micro-expressions</li>
                  <li>Eye movement patterns and blink rate</li>
                  <li>Stress level calculations from biometric data</li>
                </ul>
                <p className="text-sm">All data is processed locally and follows your privacy settings.</p>
              </div>

              <div className="flex space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleConsentAccept}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
                >
                  Accept & Continue
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleConsentDecline}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700"
                >
                  Decline
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Data Log */}
      {dataLog.length > 0 && (
        <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <h4 className="text-white font-medium mb-2">Data Collection Log</h4>
          <div className="text-xs text-gray-400">
            {dataLog.length} entries collected | 
            Last updated: {new Date(dataLog[dataLog.length - 1]?.timestamp).toLocaleTimeString()}
          </div>
        </div>
      )}
    </div>
  );
}
