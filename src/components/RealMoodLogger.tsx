'use client';

import { dataPersistence, MoodEntry } from '@/lib/dataPersistence';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Activity,
    AlertCircle,
    Angry,
    BarChart3,
    Bed,
    Cloud,
    Frown,
    Heart,
    RotateCcw,
    Save,
    Smile,
    Star,
    Sun,
    Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function RealMoodLogger() {
  const [currentMood, setCurrentMood] = useState<string>('');
  const [moodScore, setMoodScore] = useState<number>(5);
  const [intensity, setIntensity] = useState<number>(3);
  const [notes, setNotes] = useState<string>('');
  const [triggers, setTriggers] = useState<string[]>([]);
  const [activities, setActivities] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [recentEntries, setRecentEntries] = useState<MoodEntry[]>([]);
  const [showStats, setShowStats] = useState(false);

  const moods = [
    { id: 'happy', label: 'Happy', icon: Smile, color: 'bg-yellow-500', gradient: 'from-yellow-400 to-orange-400' },
    { id: 'calm', label: 'Calm', icon: Cloud, color: 'bg-blue-500', gradient: 'from-blue-400 to-cyan-400' },
    { id: 'energetic', label: 'Energetic', icon: Zap, color: 'bg-green-500', gradient: 'from-green-400 to-emerald-400' },
    { id: 'content', label: 'Content', icon: Heart, color: 'bg-pink-500', gradient: 'from-pink-400 to-rose-400' },
    { id: 'peaceful', label: 'Peaceful', icon: Sun, color: 'bg-purple-500', gradient: 'from-purple-400 to-violet-400' },
    { id: 'sad', label: 'Sad', icon: Frown, color: 'bg-indigo-500', gradient: 'from-indigo-400 to-blue-500' },
    { id: 'anxious', label: 'Anxious', icon: AlertCircle, color: 'bg-orange-500', gradient: 'from-orange-400 to-red-400' },
    { id: 'stressed', label: 'Stressed', icon: Activity, color: 'bg-red-500', gradient: 'from-red-400 to-pink-400' },
    { id: 'tired', label: 'Tired', icon: Bed, color: 'bg-gray-500', gradient: 'from-gray-400 to-slate-400' },
    { id: 'angry', label: 'Angry', icon: Angry, color: 'bg-red-600', gradient: 'from-red-500 to-red-600' }
  ];

  const commonTriggers = [
    'Work stress', 'Relationship', 'Health', 'Finance', 'Family', 'Weather',
    'Sleep', 'Exercise', 'Social media', 'News', 'Traffic', 'Deadlines'
  ];

  const commonActivities = [
    'Meditation', 'Exercise', 'Reading', 'Music', 'Walking', 'Cooking',
    'Socializing', 'Gaming', 'Working', 'Studying', 'Watching TV', 'Shopping'
  ];

  useEffect(() => {
    loadRecentEntries();
  }, []);

  const loadRecentEntries = () => {
    const entries = dataPersistence.getMoodEntries(7);
    setRecentEntries(entries);
  };

  const handleMoodSelect = (moodId: string) => {
    setCurrentMood(moodId);
    
    // Auto-adjust score based on mood
    const moodScores = {
      happy: 8, calm: 7, energetic: 8, content: 7, peaceful: 8,
      sad: 3, anxious: 4, stressed: 3, tired: 4, angry: 2
    };
    setMoodScore(moodScores[moodId as keyof typeof moodScores] || 5);
  };

  const handleTriggerToggle = (trigger: string) => {
    setTriggers(prev => 
      prev.includes(trigger) 
        ? prev.filter(t => t !== trigger)
        : [...prev, trigger]
    );
  };

  const handleActivityToggle = (activity: string) => {
    setActivities(prev => 
      prev.includes(activity) 
        ? prev.filter(a => a !== activity)
        : [...prev, activity]
    );
  };

  const saveMoodEntry = () => {
    if (!currentMood) return;

    const entry: MoodEntry = {
      id: `mood_${Date.now()}`,
      userId: 'current_user', // This would come from auth system
      mood: currentMood as any,
      score: moodScore,
      intensity,
      triggers: triggers.length > 0 ? triggers : undefined,
      notes: notes.trim() || undefined,
      activities: activities.length > 0 ? activities : undefined,
      timestamp: new Date().toISOString(),
      location: undefined, // Could add geolocation
      weather: undefined // Could add weather API
    };

    dataPersistence.saveMoodEntry(entry);
    
    // Show success animation
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
    
    // Reset form
    resetForm();
    loadRecentEntries();

    // Dispatch event for dashboard update
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('moodEntryAdded', { detail: entry });
      window.dispatchEvent(event);
    }
  };

  const resetForm = () => {
    setCurrentMood('');
    setMoodScore(5);
    setIntensity(3);
    setNotes('');
    setTriggers([]);
    setActivities([]);
  };

  const getAverageMood = () => {
    if (recentEntries.length === 0) return 0;
    return recentEntries.reduce((sum, entry) => sum + entry.score, 0) / recentEntries.length;
  };

  const getMoodTrend = () => {
    if (recentEntries.length < 2) return 'stable';
    const recent = recentEntries.slice(-3);
    const older = recentEntries.slice(-6, -3);
    
    const recentAvg = recent.reduce((sum, entry) => sum + entry.score, 0) / recent.length;
    const olderAvg = older.reduce((sum, entry) => sum + entry.score, 0) / older.length;
    
    if (recentAvg > olderAvg + 0.5) return 'improving';
    if (recentAvg < olderAvg - 0.5) return 'declining';
    return 'stable';
  };

  const selectedMoodData = moods.find(m => m.id === currentMood);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Success Animation */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -50 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center space-x-2"
          >
            <Star className="w-5 h-5" />
            <span className="font-medium">Mood logged successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-3xl font-bold text-gray-800">How are you feeling?</h1>
          <p className="text-gray-600">Take a moment to check in with yourself</p>
        </motion.div>

        {/* Quick Stats */}
        <div className="flex justify-center space-x-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{recentEntries.length}</div>
            <div className="text-sm text-gray-500">Entries this week</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{getAverageMood().toFixed(1)}</div>
            <div className="text-sm text-gray-500">Average mood</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              getMoodTrend() === 'improving' ? 'text-green-600' : 
              getMoodTrend() === 'declining' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {getMoodTrend() === 'improving' ? '↗️' : getMoodTrend() === 'declining' ? '↘️' : '→'}
            </div>
            <div className="text-sm text-gray-500">Trend</div>
          </div>
        </div>
      </div>

      {/* Mood Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg p-8"
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Select your current mood</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {moods.map((mood, index) => (
            <motion.button
              key={mood.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleMoodSelect(mood.id)}
              className={`p-4 rounded-xl border-2 transition-all ${
                currentMood === mood.id
                  ? `border-gray-400 bg-gradient-to-br ${mood.gradient} text-white shadow-lg`
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
            >
              <mood.icon className="w-8 h-8 mx-auto mb-2" />
              <div className="text-sm font-medium">{mood.label}</div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Mood Details */}
      <AnimatePresence>
        {currentMood && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-6"
          >
            {/* Intensity and Score */}
            <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
              <h3 className="text-lg font-semibold text-gray-800">Mood Details</h3>
              
              {/* Mood Score */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Mood Score: {moodScore}/10
                </label>
                <div className="relative">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={moodScore}
                    onChange={(e) => setMoodScore(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Very Low</span>
                    <span>Moderate</span>
                    <span>Very High</span>
                  </div>
                </div>
              </div>

              {/* Intensity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Intensity: {intensity}/5
                </label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map(level => (
                    <button
                      key={level}
                      onClick={() => setIntensity(level)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        intensity >= level
                          ? `${selectedMoodData?.color} border-transparent text-white`
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Triggers */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">What triggered this mood?</h3>
              <div className="flex flex-wrap gap-2">
                {commonTriggers.map(trigger => (
                  <button
                    key={trigger}
                    onClick={() => handleTriggerToggle(trigger)}
                    className={`px-3 py-1 rounded-full text-sm border transition-all ${
                      triggers.includes(trigger)
                        ? 'bg-red-100 border-red-300 text-red-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {trigger}
                  </button>
                ))}
              </div>
            </div>

            {/* Activities */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">What have you been doing?</h3>
              <div className="flex flex-wrap gap-2">
                {commonActivities.map(activity => (
                  <button
                    key={activity}
                    onClick={() => handleActivityToggle(activity)}
                    className={`px-3 py-1 rounded-full text-sm border transition-all ${
                      activities.includes(activity)
                        ? 'bg-green-100 border-green-300 text-green-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {activity}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional notes</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How are you feeling? What's on your mind? (optional)"
                className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                maxLength={500}
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {notes.length}/500 characters
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={saveMoodEntry}
                className={`flex-1 py-3 px-6 rounded-xl font-semibold text-white bg-gradient-to-r ${
                  selectedMoodData?.gradient || 'from-blue-500 to-cyan-500'
                } shadow-lg hover:shadow-xl transition-all`}
              >
                <Save className="w-5 h-5 inline mr-2" />
                Save Mood Entry
              </motion.button>
              
              <button
                onClick={resetForm}
                className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent Entries */}
      {recentEntries.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Recent Entries</h3>
            <button
              onClick={() => setShowStats(!showStats)}
              className="text-blue-600 hover:text-blue-700 flex items-center space-x-1"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="text-sm">View Stats</span>
            </button>
          </div>
          
          <div className="space-y-3">
            {recentEntries.slice(-5).reverse().map((entry, index) => {
              const moodData = moods.find(m => m.id === entry.mood);
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  {moodData && <moodData.icon className="w-6 h-6 text-gray-600" />}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium capitalize">{entry.mood}</span>
                      <span className="text-sm text-gray-500">Score: {entry.score}/10</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(entry.timestamp).toLocaleDateString()} at {new Date(entry.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`w-3 h-3 rounded-full ${moodData?.color || 'bg-gray-400'}`}></div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
