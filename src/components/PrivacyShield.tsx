'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertTriangle,
    Camera,
    CheckCircle,
    Database,
    Download,
    Eye,
    FileText,
    Fingerprint,
    Globe,
    Info,
    Key,
    Lock,
    MapPin,
    Mic,
    Settings,
    Shield,
    Trash2,
    Wifi
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface PrivacySettings {
  dataCollection: boolean;
  analytics: boolean;
  personalization: boolean;
  thirdPartySharing: boolean;
  locationTracking: boolean;
  cameraAccess: boolean;
  microphoneAccess: boolean;
  biometricData: boolean;
  emotionData: boolean;
  voiceData: boolean;
  encryptionLevel: 'basic' | 'standard' | 'maximum';
  dataRetention: '30days' | '90days' | '1year' | 'forever';
  anonymousMode: boolean;
  autoDelete: boolean;
}

interface DataCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  dataPoints: number;
  lastAccessed: Date;
  canDelete: boolean;
  sensitive: boolean;
}

interface PrivacyShieldProps {
  onSettingsChange?: (settings: PrivacySettings) => void;
}

export default function PrivacyShield({ onSettingsChange }: PrivacyShieldProps) {
  const [settings, setSettings] = useState<PrivacySettings>({
    dataCollection: true,
    analytics: false,
    personalization: true,
    thirdPartySharing: false,
    locationTracking: false,
    cameraAccess: true,
    microphoneAccess: true,
    biometricData: true,
    emotionData: true,
    voiceData: false,
    encryptionLevel: 'maximum',
    dataRetention: '90days',
    anonymousMode: false,
    autoDelete: true
  });

  const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'data' | 'security'>('overview');
  const [showDataExport, setShowDataExport] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [privacyScore, setPrivacyScore] = useState(0);

  const dataCategories: DataCategory[] = [
    {
      id: 'emotion-data',
      name: 'Emotion Detection Data',
      description: 'Facial expression analysis and emotional state tracking',
      icon: <Eye className="w-5 h-5" />,
      dataPoints: 1247,
      lastAccessed: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      canDelete: true,
      sensitive: true
    },
    {
      id: 'mood-entries',
      name: 'Mood Journal Entries',
      description: 'Personal mood logs and journal entries',
      icon: <FileText className="w-5 h-5" />,
      dataPoints: 89,
      lastAccessed: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      canDelete: true,
      sensitive: true
    },
    {
      id: 'breathing-sessions',
      name: 'Breathing Exercise Data',
      description: 'Breathing patterns and exercise completion data',
      icon: <Wifi className="w-5 h-5" />,
      dataPoints: 156,
      lastAccessed: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      canDelete: true,
      sensitive: false
    },
    {
      id: 'voice-recordings',
      name: 'Voice Interaction Data',
      description: 'Voice commands and audio interaction logs',
      icon: <Mic className="w-5 h-5" />,
      dataPoints: 23,
      lastAccessed: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      canDelete: true,
      sensitive: true
    },
    {
      id: 'biometric-data',
      name: 'Biometric Information',
      description: 'Facial recognition templates and biometric markers',
      icon: <Fingerprint className="w-5 h-5" />,
      dataPoints: 45,
      lastAccessed: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      canDelete: false,
      sensitive: true
    },
    {
      id: 'usage-analytics',
      name: 'Usage Analytics',
      description: 'App usage patterns and feature interaction data',
      icon: <Globe className="w-5 h-5" />,
      dataPoints: 892,
      lastAccessed: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      canDelete: true,
      sensitive: false
    }
  ];

  const calculatePrivacyScore = useCallback(() => {
    let score = 0;
    const weights = {
      dataCollection: settings.dataCollection ? -5 : 10,
      analytics: settings.analytics ? -10 : 15,
      personalization: settings.personalization ? -3 : 5,
      thirdPartySharing: settings.thirdPartySharing ? -20 : 20,
      locationTracking: settings.locationTracking ? -15 : 15,
      cameraAccess: settings.cameraAccess ? -5 : 8,
      microphoneAccess: settings.microphoneAccess ? -5 : 8,
      biometricData: settings.biometricData ? -8 : 12,
      emotionData: settings.emotionData ? -10 : 15,
      voiceData: settings.voiceData ? -8 : 12,
      encryptionLevel: settings.encryptionLevel === 'maximum' ? 20 : settings.encryptionLevel === 'standard' ? 10 : 0,
      dataRetention: settings.dataRetention === '30days' ? 15 : settings.dataRetention === '90days' ? 10 : settings.dataRetention === '1year' ? 5 : -10,
      anonymousMode: settings.anonymousMode ? 15 : 0,
      autoDelete: settings.autoDelete ? 10 : -5
    };

    score = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    return Math.max(0, Math.min(100, score + 50)); // Normalize to 0-100
  }, [settings]);

  useEffect(() => {
    setPrivacyScore(calculatePrivacyScore());
    onSettingsChange?.(settings);
  }, [settings, onSettingsChange, calculatePrivacyScore]);

  const updateSetting = (key: keyof PrivacySettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const getPrivacyLevel = (score: number) => {
    if (score >= 80) return { level: 'Maximum', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (score >= 60) return { level: 'High', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    if (score >= 40) return { level: 'Medium', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { level: 'Low', color: 'text-red-600', bgColor: 'bg-red-100' };
  };

  const privacyLevel = getPrivacyLevel(privacyScore);

  const exportData = () => {
    // Simulate data export
    const exportData = {
      userId: 'user-123',
      exportDate: new Date().toISOString(),
      dataCategories: dataCategories.map(cat => ({
        category: cat.name,
        dataPoints: cat.dataPoints,
        lastAccessed: cat.lastAccessed
      })),
      settings: settings
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mindscope-data-export.json';
    a.click();
    URL.revokeObjectURL(url);
    setShowDataExport(false);
  };

  const deleteAllData = () => {
    // Simulate data deletion
    setShowDeleteConfirm(false);
    // In a real app, this would make an API call to delete user data
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: <Shield className="w-5 h-5" /> },
    { id: 'settings', name: 'Privacy Settings', icon: <Settings className="w-5 h-5" /> },
    { id: 'data', name: 'My Data', icon: <Database className="w-5 h-5" /> },
    { id: 'security', name: 'Security', icon: <Lock className="w-5 h-5" /> }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-slate-600 via-gray-600 to-slate-700 rounded-3xl p-8 text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <Shield className="w-8 h-8" />
                Privacy Shield
              </h1>
              <p className="text-white/80 text-lg">Advanced privacy and security controls</p>
            </div>
            <div className="text-right">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${privacyLevel.bgColor} ${privacyLevel.color} font-medium`}>
                <Shield className="w-5 h-5" />
                {privacyLevel.level} Privacy
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-4xl font-bold mb-2">{privacyScore}%</div>
                <div className="text-white/90">Privacy Score</div>
              </div>
              <div className="text-right">
                <div className="text-2xl mb-2">🛡️</div>
                <div className="text-white/90">Your data is protected</div>
              </div>
            </div>
            
            <div className="mt-4 bg-white/20 rounded-full h-3 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${privacyScore}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-white to-white/80 rounded-full"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-2 shadow-lg border border-gray-100"
      >
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors flex-1 ${
                activeTab === tab.id
                  ? 'bg-slate-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.icon}
              {tab.name}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Content Sections */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Privacy Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-green-100">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">Data Encrypted</h3>
                    <p className="text-sm text-gray-600">End-to-end encryption</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-green-600">{settings.encryptionLevel === 'maximum' ? '256-bit' : '128-bit'}</div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-blue-100">
                    <Database className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">Data Retention</h3>
                    <p className="text-sm text-gray-600">Auto-deletion policy</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {settings.dataRetention === '30days' ? '30 Days' : 
                   settings.dataRetention === '90days' ? '90 Days' : 
                   settings.dataRetention === '1year' ? '1 Year' : 'Forever'}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-purple-100">
                    <Eye className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">Anonymous Mode</h3>
                    <p className="text-sm text-gray-600">Identity protection</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {settings.anonymousMode ? 'Active' : 'Inactive'}
                </div>
              </div>
            </div>

            {/* Recent Privacy Events */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Privacy Events</h3>
              <div className="space-y-4">
                {[
                  { event: 'Data encryption key rotated', time: '2 hours ago', type: 'security' },
                  { event: 'Third-party data sharing disabled', time: '1 day ago', type: 'privacy' },
                  { event: 'Emotion data automatically deleted', time: '3 days ago', type: 'cleanup' },
                  { event: 'Privacy settings updated', time: '1 week ago', type: 'settings' }
                ].map((event, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                    <div className={`p-2 rounded-lg ${
                      event.type === 'security' ? 'bg-green-100 text-green-600' :
                      event.type === 'privacy' ? 'bg-blue-100 text-blue-600' :
                      event.type === 'cleanup' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-purple-100 text-purple-600'
                    }`}>
                      <Shield className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{event.event}</div>
                      <div className="text-sm text-gray-600">{event.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Data Collection Settings */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Data Collection</h3>
              <div className="space-y-4">
                {[
                  { key: 'dataCollection', label: 'General Data Collection', description: 'Allow collection of usage data for app improvement' },
                  { key: 'analytics', label: 'Analytics', description: 'Share anonymous usage analytics' },
                  { key: 'personalization', label: 'Personalization', description: 'Use data to personalize your experience' },
                  { key: 'thirdPartySharing', label: 'Third-party Sharing', description: 'Share data with trusted partners' }
                ].map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <div className="font-medium text-gray-800">{setting.label}</div>
                      <div className="text-sm text-gray-600">{setting.description}</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings[setting.key as keyof PrivacySettings] as boolean}
                        onChange={(e) => updateSetting(setting.key as keyof PrivacySettings, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Device Permissions */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Device Permissions</h3>
              <div className="space-y-4">
                {[
                  { key: 'cameraAccess', label: 'Camera Access', description: 'Allow access to camera for emotion detection', icon: <Camera className="w-5 h-5" /> },
                  { key: 'microphoneAccess', label: 'Microphone Access', description: 'Allow access to microphone for voice features', icon: <Mic className="w-5 h-5" /> },
                  { key: 'locationTracking', label: 'Location Tracking', description: 'Track location for context-aware features', icon: <MapPin className="w-5 h-5" /> }
                ].map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gray-200">
                        {setting.icon}
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">{setting.label}</div>
                        <div className="text-sm text-gray-600">{setting.description}</div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings[setting.key as keyof PrivacySettings] as boolean}
                        onChange={(e) => updateSetting(setting.key as keyof PrivacySettings, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Advanced Settings */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Advanced Settings</h3>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-medium text-gray-800">Encryption Level</div>
                      <div className="text-sm text-gray-600">Choose your data encryption strength</div>
                    </div>
                  </div>
                  <select
                    value={settings.encryptionLevel}
                    onChange={(e) => updateSetting('encryptionLevel', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="basic">Basic (128-bit)</option>
                    <option value="standard">Standard (192-bit)</option>
                    <option value="maximum">Maximum (256-bit)</option>
                  </select>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-medium text-gray-800">Data Retention</div>
                      <div className="text-sm text-gray-600">How long to keep your data</div>
                    </div>
                  </div>
                  <select
                    value={settings.dataRetention}
                    onChange={(e) => updateSetting('dataRetention', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="30days">30 Days</option>
                    <option value="90days">90 Days</option>
                    <option value="1year">1 Year</option>
                    <option value="forever">Forever</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'data' && (
          <motion.div
            key="data"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Data Categories */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Your Data</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDataExport(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete All
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                {dataCategories.map((category) => (
                  <div key={category.id} className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${category.sensitive ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                          {category.icon}
                        </div>
                        <div>
                          <div className="font-medium text-gray-800 flex items-center gap-2">
                            {category.name}
                            {category.sensitive && (
                              <span className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded-full">Sensitive</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">{category.description}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {category.dataPoints} data points • Last accessed {category.lastAccessed.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {category.canDelete && (
                          <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'security' && (
          <motion.div
            key="security"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Security Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-green-100">
                    <Lock className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">Encryption Status</h3>
                    <p className="text-sm text-gray-600">Your data is fully encrypted</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Data at rest</span>
                    <span className="text-green-600 font-medium">✓ Encrypted</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Data in transit</span>
                    <span className="text-green-600 font-medium">✓ Encrypted</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Biometric data</span>
                    <span className="text-green-600 font-medium">✓ Encrypted</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-blue-100">
                    <Key className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">Access Control</h3>
                    <p className="text-sm text-gray-600">Multi-factor authentication</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Biometric login</span>
                    <span className="text-green-600 font-medium">✓ Active</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Session timeout</span>
                    <span className="text-blue-600 font-medium">30 minutes</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Failed attempts</span>
                    <span className="text-green-600 font-medium">0 today</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Recommendations */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Security Recommendations</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-yellow-800">Enable Two-Factor Authentication</div>
                    <div className="text-sm text-yellow-700">Add an extra layer of security to your account</div>
                  </div>
                  <button className="ml-auto px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm hover:bg-yellow-700 transition-colors">
                    Enable
                  </button>
                </div>

                <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-blue-800">Regular Security Audits</div>
                    <div className="text-sm text-blue-700">We perform regular security audits to protect your data</div>
                  </div>
                  <div className="ml-auto text-sm text-blue-600 font-medium">Next: Dec 2024</div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl border border-green-200">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-green-800">Strong Password</div>
                    <div className="text-sm text-green-700">Your password meets all security requirements</div>
                  </div>
                  <div className="ml-auto text-sm text-green-600 font-medium">✓ Complete</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Data Export Modal */}
      <AnimatePresence>
        {showDataExport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDataExport(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Export Your Data</h2>
              <p className="text-gray-600 mb-6">
                Download a copy of all your data in JSON format. This includes your mood entries, 
                emotion data, and app settings.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDataExport(false)}
                  className="flex-1 py-3 px-6 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={exportData}
                  className="flex-1 py-3 px-6 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Delete All Data</h2>
                <p className="text-gray-600">
                  This will permanently delete all your data including mood entries, 
                  emotion detection data, and settings. This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3 px-6 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteAllData}
                  className="flex-1 py-3 px-6 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete All
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
