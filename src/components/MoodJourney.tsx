'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowRight,
    BarChart3,
    Clock,
    Frown,
    Heart,
    Meh,
    Plus,
    Smile,
    TrendingUp
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface MoodEntry {
  id: string;
  mood: number; // 1-10 scale
  emotion: string;
  note: string;
  timestamp: Date;
  tags: string[];
  energy: number;
  stress: number;
  sleep: number;
}

interface MoodJourneyProps {
  onMoodUpdate?: (mood: MoodEntry) => void;
}

export default function MoodJourney({ onMoodUpdate }: MoodJourneyProps) {
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [currentMood, setCurrentMood] = useState<number>(5);
  const [currentEmotion, setCurrentEmotion] = useState<string>('neutral');
  const [moodNote, setMoodNote] = useState<string>('');
  const [showMoodLogger, setShowMoodLogger] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [energy, setEnergy] = useState<number>(5);
  const [stress, setStress] = useState<number>(5);
  const [sleep, setSleep] = useState<number>(5);

  // Generate sample mood data
  useEffect(() => {
    const generateSampleData = () => {
      const sampleEntries: MoodEntry[] = [];
      const emotions = ['happy', 'calm', 'excited', 'anxious', 'sad', 'peaceful', 'energetic', 'tired'];
      
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        sampleEntries.push({
          id: `mood-${i}`,
          mood: Math.floor(Math.random() * 10) + 1,
          emotion: emotions[Math.floor(Math.random() * emotions.length)],
          note: i === 0 ? "Feeling great today!" : "",
          timestamp: date,
          tags: ['work', 'exercise', 'social'].slice(0, Math.floor(Math.random() * 3) + 1),
          energy: Math.floor(Math.random() * 10) + 1,
          stress: Math.floor(Math.random() * 10) + 1,
          sleep: Math.floor(Math.random() * 10) + 1
        });
      }
      
      setMoodEntries(sampleEntries.reverse());
    };

    generateSampleData();
  }, []);

  const moodEmojis = {
    1: '😢', 2: '😔', 3: '😕', 4: '😐', 5: '😊',
    6: '😄', 7: '😁', 8: '🤗', 9: '😍', 10: '🤩'
  };

  const emotionTags = [
    'happy', 'sad', 'anxious', 'calm', 'excited', 'tired', 
    'peaceful', 'stressed', 'energetic', 'lonely', 'grateful', 'confident'
  ];

  const contextTags = [
    'work', 'exercise', 'social', 'family', 'sleep', 'food',
    'weather', 'health', 'meditation', 'music', 'reading', 'nature'
  ];

  const getMoodColor = (mood: number) => {
    if (mood <= 3) return 'from-red-400 to-red-600';
    if (mood <= 5) return 'from-yellow-400 to-orange-500';
    if (mood <= 7) return 'from-green-400 to-green-600';
    return 'from-blue-400 to-purple-600';
  };

  const getMoodIcon = (mood: number) => {
    if (mood <= 3) return <Frown className="w-5 h-5" />;
    if (mood <= 7) return <Meh className="w-5 h-5" />;
    return <Smile className="w-5 h-5" />;
  };

  const getAverageMood = () => {
    const last7Days = moodEntries.slice(-7);
    if (last7Days.length === 0) return 0;
    return Math.round(last7Days.reduce((sum, entry) => sum + entry.mood, 0) / last7Days.length);
  };

  const getMoodTrend = () => {
    if (moodEntries.length < 2) return 0;
    const recent = moodEntries.slice(-7);
    const previous = moodEntries.slice(-14, -7);
    
    const recentAvg = recent.reduce((sum, entry) => sum + entry.mood, 0) / recent.length;
    const previousAvg = previous.reduce((sum, entry) => sum + entry.mood, 0) / previous.length;
    
    return recentAvg - previousAvg;
  };

  const handleMoodSubmit = () => {
    const newEntry: MoodEntry = {
      id: `mood-${Date.now()}`,
      mood: currentMood,
      emotion: currentEmotion,
      note: moodNote,
      timestamp: new Date(),
      tags: selectedTags,
      energy,
      stress,
      sleep
    };

    setMoodEntries(prev => [...prev, newEntry]);
    onMoodUpdate?.(newEntry);
    
    // Reset form
    setCurrentMood(5);
    setCurrentEmotion('neutral');
    setMoodNote('');
    setSelectedTags([]);
    setEnergy(5);
    setStress(5);
    setSleep(5);
    setShowMoodLogger(false);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const averageMood = getAverageMood();
  const moodTrend = getMoodTrend();

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-pink-500 via-rose-500 to-red-500 rounded-3xl p-8 text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <Heart className="w-8 h-8" />
                Mood Journey
              </h1>
              <p className="text-white/80 text-lg">Track your emotional patterns and insights</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowMoodLogger(true)}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-2xl px-6 py-3 font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Log Mood
            </motion.button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="text-4xl font-bold mb-2">{averageMood}/10</div>
              <div className="text-white/90">7-Day Average</div>
              <div className="mt-2 text-2xl">{moodEmojis[averageMood as keyof typeof moodEmojis]}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-6 h-6" />
                <span className="text-2xl font-bold">
                  {moodTrend > 0 ? '+' : ''}{moodTrend.toFixed(1)}
                </span>
              </div>
              <div className="text-white/90">Trend This Week</div>
              <div className="mt-2 text-sm text-white/70">
                {moodTrend > 0 ? 'Improving ↗️' : moodTrend < 0 ? 'Declining ↘️' : 'Stable →'}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="text-4xl font-bold mb-2">{moodEntries.length}</div>
              <div className="text-white/90">Total Entries</div>
              <div className="mt-2 text-sm text-white/70">Keep tracking!</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mood Chart */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
      >
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-pink-500" />
          Mood Timeline (Last 30 Days)
        </h3>
        <div className="h-64 flex items-end justify-between gap-1 bg-gray-50 rounded-xl p-4">
          {moodEntries.slice(-30).map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ height: 0 }}
              animate={{ height: `${(entry.mood / 10) * 100}%` }}
              transition={{ delay: index * 0.02 }}
              className={`w-full bg-gradient-to-t ${getMoodColor(entry.mood)} rounded-t-sm hover:opacity-80 transition-opacity cursor-pointer relative group`}
              title={`${entry.emotion} - ${entry.mood}/10 - ${entry.timestamp.toLocaleDateString()}`}
            >
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-black/80 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                  {entry.emotion} - {entry.mood}/10
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Entries */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
      >
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Clock className="w-6 h-6 text-pink-500" />
          Recent Entries
        </h3>
        <div className="space-y-4">
          {moodEntries.slice(-5).reverse().map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className={`p-3 rounded-xl bg-gradient-to-br ${getMoodColor(entry.mood)} text-white`}>
                {getMoodIcon(entry.mood)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-gray-800">{entry.emotion}</span>
                  <span className="text-2xl">{moodEmojis[entry.mood as keyof typeof moodEmojis]}</span>
                  <span className="text-sm text-gray-500">{entry.mood}/10</span>
                </div>
                {entry.note && (
                  <p className="text-gray-600 text-sm mb-2">{entry.note}</p>
                )}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{entry.timestamp.toLocaleDateString()}</span>
                  {entry.tags.length > 0 && (
                    <>
                      <span>•</span>
                      <div className="flex gap-1">
                        {entry.tags.map(tag => (
                          <span key={tag} className="bg-gray-200 rounded px-2 py-1">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Mood Logger Modal */}
      <AnimatePresence>
        {showMoodLogger && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowMoodLogger(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <Heart className="w-7 h-7 text-pink-500" />
                How are you feeling?
              </h2>

              {/* Mood Scale */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Mood Level: {currentMood}/10 {moodEmojis[currentMood as keyof typeof moodEmojis]}
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={currentMood}
                  onChange={(e) => setCurrentMood(Number(e.target.value))}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Very Low</span>
                  <span>Amazing</span>
                </div>
              </div>

              {/* Emotion Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Primary Emotion
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {emotionTags.map(emotion => (
                    <button
                      key={emotion}
                      onClick={() => setCurrentEmotion(emotion)}
                      className={`p-3 rounded-xl text-sm font-medium transition-colors ${
                        currentEmotion === emotion
                          ? 'bg-pink-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {emotion}
                    </button>
                  ))}
                </div>
              </div>

              {/* Additional Metrics */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Energy: {energy}/10
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={energy}
                    onChange={(e) => setEnergy(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stress: {stress}/10
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={stress}
                    onChange={(e) => setStress(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sleep: {sleep}/10
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={sleep}
                    onChange={(e) => setSleep(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Context Tags */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What influenced your mood? (Optional)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {contextTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedTags.includes(tag)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Note */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={moodNote}
                  onChange={(e) => setMoodNote(e.target.value)}
                  placeholder="How was your day? What made you feel this way?"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowMoodLogger(false)}
                  className="flex-1 py-3 px-6 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMoodSubmit}
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  Save Entry
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
