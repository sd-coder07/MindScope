'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Award, Brain, Crown, Flame, Heart, Star, Trophy, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

interface GamificationSystemProps {
  userId?: string;
  onLevelUp?: (level: number, rewards: string[]) => void;
  onAchievementUnlocked?: (achievement: Achievement) => void;
}

interface UserProgress {
  level: number;
  xp: number;
  xpToNext: number;
  totalXP: number;
  streak: number;
  achievements: string[];
  badges: string[];
  stats: {
    breathingMinutes: number;
    moodEntries: number;
    daysActive: number;
    challengesCompleted: number;
    helpOthers: number;
  };
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'breathing' | 'mood' | 'consistency' | 'social' | 'milestone';
  requirement: number;
  currentProgress: number;
  xpReward: number;
  unlocked: boolean;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'special';
  category: 'breathing' | 'mood' | 'mindfulness' | 'social';
  target: number;
  currentProgress: number;
  xpReward: number;
  deadline: Date;
  completed: boolean;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_breath',
    title: 'First Breath',
    description: 'Complete your first breathing exercise',
    icon: <Zap className="w-5 h-5" />,
    rarity: 'common',
    category: 'breathing',
    requirement: 1,
    currentProgress: 0,
    xpReward: 50,
    unlocked: false
  },
  {
    id: 'zen_master',
    title: 'Zen Master',
    description: 'Complete 100 breathing exercises',
    icon: <Brain className="w-5 h-5" />,
    rarity: 'epic',
    category: 'breathing',
    requirement: 100,
    currentProgress: 0,
    xpReward: 500,
    unlocked: false
  },
  {
    id: 'mood_tracker',
    title: 'Emotion Explorer',
    description: 'Log your mood for 7 consecutive days',
    icon: <Heart className="w-5 h-5" />,
    rarity: 'rare',
    category: 'consistency',
    requirement: 7,
    currentProgress: 0,
    xpReward: 200,
    unlocked: false
  },
  {
    id: 'week_warrior',
    title: 'Week Warrior',
    description: 'Maintain a 7-day activity streak',
    icon: <Flame className="w-5 h-5" />,
    rarity: 'rare',
    category: 'consistency',
    requirement: 7,
    currentProgress: 0,
    xpReward: 300,
    unlocked: false
  },
  {
    id: 'mindful_month',
    title: 'Mindful Month',
    description: 'Stay active for 30 days',
    icon: <Crown className="w-5 h-5" />,
    rarity: 'legendary',
    category: 'milestone',
    requirement: 30,
    currentProgress: 0,
    xpReward: 1000,
    unlocked: false
  }
];

const DAILY_CHALLENGES: Challenge[] = [
  {
    id: 'daily_breath',
    title: 'Daily Breathing',
    description: 'Complete 3 breathing exercises today',
    type: 'daily',
    category: 'breathing',
    target: 3,
    currentProgress: 0,
    xpReward: 100,
    deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
    completed: false
  },
  {
    id: 'mood_check',
    title: 'Mood Check-in',
    description: 'Log your mood 2 times today',
    type: 'daily',
    category: 'mood',
    target: 2,
    currentProgress: 0,
    xpReward: 75,
    deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
    completed: false
  },
  {
    id: 'mindful_minutes',
    title: 'Mindful Minutes',
    description: 'Spend 15 minutes in mindfulness activities',
    type: 'daily',
    category: 'mindfulness',
    target: 15,
    currentProgress: 0,
    xpReward: 120,
    deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
    completed: false
  }
];

export default function GamificationSystem({ userId, onLevelUp, onAchievementUnlocked }: GamificationSystemProps) {
  const [userProgress, setUserProgress] = useState<UserProgress>({
    level: 1,
    xp: 150,
    xpToNext: 350,
    totalXP: 150,
    streak: 3,
    achievements: [],
    badges: [],
    stats: {
      breathingMinutes: 45,
      moodEntries: 12,
      daysActive: 5,
      challengesCompleted: 8,
      helpOthers: 2
    }
  });

  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS);
  const [challenges, setChallenges] = useState<Challenge[]>(DAILY_CHALLENGES);
  const [showPanel, setShowPanel] = useState(false);
  const [activeTab, setActiveTab] = useState<'progress' | 'achievements' | 'challenges'>('progress');
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    // Check for level ups
    if (userProgress.xp >= userProgress.xpToNext) {
      levelUp();
    }
    
    // Check for achievement unlocks
    checkAchievements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProgress.xp, userProgress.stats]);

  const levelUp = () => {
    const newLevel = userProgress.level + 1;
    const rewards = [`Level ${newLevel} Badge`, 'Special Theme Unlock'];
    
    setUserProgress(prev => ({
      ...prev,
      level: newLevel,
      xp: prev.xp - prev.xpToNext,
      xpToNext: Math.floor(prev.xpToNext * 1.5),
      badges: [...prev.badges, `level_${newLevel}`]
    }));

    onLevelUp?.(newLevel, rewards);
    addNotification({
      type: 'levelUp',
      title: `Level ${newLevel} Reached!`,
      message: `You've earned ${rewards.join(', ')}`,
      icon: <Crown className="w-6 h-6 text-yellow-500" />
    });
  };

  const checkAchievements = () => {
    achievements.forEach(achievement => {
      if (!achievement.unlocked) {
        let progress = 0;
        
        switch (achievement.category) {
          case 'breathing':
            progress = userProgress.stats.breathingMinutes;
            break;
          case 'mood':
            progress = userProgress.stats.moodEntries;
            break;
          case 'consistency':
            progress = userProgress.streak;
            break;
          case 'milestone':
            progress = userProgress.stats.daysActive;
            break;
        }

        if (progress >= achievement.requirement) {
          unlockAchievement(achievement.id);
        } else {
          updateAchievementProgress(achievement.id, progress);
        }
      }
    });
  };

  const unlockAchievement = (achievementId: string) => {
    setAchievements(prev => prev.map(ach => 
      ach.id === achievementId 
        ? { ...ach, unlocked: true, currentProgress: ach.requirement }
        : ach
    ));

    const achievement = achievements.find(a => a.id === achievementId);
    if (achievement) {
      setUserProgress(prev => ({
        ...prev,
        xp: prev.xp + achievement.xpReward,
        totalXP: prev.totalXP + achievement.xpReward,
        achievements: [...prev.achievements, achievementId]
      }));

      onAchievementUnlocked?.(achievement);
      addNotification({
        type: 'achievement',
        title: 'Achievement Unlocked!',
        message: achievement.title,
        icon: achievement.icon,
        rarity: achievement.rarity
      });
    }
  };

  const updateAchievementProgress = (achievementId: string, progress: number) => {
    setAchievements(prev => prev.map(ach => 
      ach.id === achievementId 
        ? { ...ach, currentProgress: Math.min(progress, ach.requirement) }
        : ach
    ));
  };

  const addNotification = (notification: any) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { ...notification, id }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const addXP = (amount: number, activity: string) => {
    setUserProgress(prev => ({
      ...prev,
      xp: prev.xp + amount,
      totalXP: prev.totalXP + amount
    }));

    addNotification({
      type: 'xp',
      title: `+${amount} XP`,
      message: activity,
      icon: <Star className="w-5 h-5 text-yellow-500" />
    });
  };

  const completeChallenge = (challengeId: string) => {
    setChallenges(prev => prev.map(challenge => 
      challenge.id === challengeId 
        ? { ...challenge, completed: true, currentProgress: challenge.target }
        : challenge
    ));

    const challenge = challenges.find(c => c.id === challengeId);
    if (challenge) {
      addXP(challenge.xpReward, `Completed ${challenge.title}`);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600 bg-gray-100';
      case 'rare': return 'text-blue-600 bg-blue-100';
      case 'epic': return 'text-purple-600 bg-purple-100';
      case 'legendary': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <>
      {/* Floating Progress Button */}
      <motion.button
        onClick={() => setShowPanel(!showPanel)}
        className="fixed top-4 right-20 bg-gradient-to-r from-serenity-500 to-ocean-500 text-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all z-50"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="flex items-center space-x-2">
          <Trophy className="w-5 h-5" />
          <div className="text-sm font-medium">
            Lv. {userProgress.level}
          </div>
        </div>
        
        {/* XP Bar */}
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-white/30 rounded-full">
          <div 
            className="h-full bg-white rounded-full transition-all duration-500"
            style={{ width: `${(userProgress.xp / userProgress.xpToNext) * 100}%` }}
          />
        </div>
      </motion.button>

      {/* Gamification Panel */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, x: 300, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.9 }}
            className="fixed top-20 right-4 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 w-96 max-h-96 overflow-hidden z-50"
          >
            {/* Tabs */}
            <div className="flex space-x-2 mb-4">
              {['progress', 'achievements', 'challenges'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab
                      ? 'bg-serenity-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className="overflow-y-auto max-h-80">
              {/* Progress Tab */}
              {activeTab === 'progress' && (
                <div className="space-y-4">
                  {/* Level Progress */}
                  <div className="bg-gradient-to-r from-serenity-50 to-ocean-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Crown className="w-5 h-5 text-yellow-600" />
                        <span className="font-medium">Level {userProgress.level}</span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {userProgress.xp}/{userProgress.xpToNext} XP
                      </span>
                    </div>
                    <div className="w-full bg-white/50 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-serenity-500 to-ocean-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${(userProgress.xp / userProgress.xpToNext) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-serenity-600">
                        {userProgress.stats.breathingMinutes}
                      </div>
                      <div className="text-xs text-gray-600">Minutes Breathing</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-ocean-600">
                        {userProgress.streak}
                      </div>
                      <div className="text-xs text-gray-600">Day Streak</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-healing-600">
                        {userProgress.stats.moodEntries}
                      </div>
                      <div className="text-xs text-gray-600">Mood Entries</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-purple-600">
                        {userProgress.achievements.length}
                      </div>
                      <div className="text-xs text-gray-600">Achievements</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Achievements Tab */}
              {activeTab === 'achievements' && (
                <div className="space-y-3">
                  {achievements.map((achievement) => (
                    <motion.div
                      key={achievement.id}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        achievement.unlocked
                          ? 'bg-green-50 border-green-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${getRarityColor(achievement.rarity)}`}>
                          {achievement.icon}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">{achievement.title}</div>
                          <div className="text-sm text-gray-600">{achievement.description}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            +{achievement.xpReward} XP
                          </div>
                        </div>
                        {achievement.unlocked && (
                          <Award className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                      
                      {!achievement.unlocked && (
                        <div className="mt-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-serenity-500 h-2 rounded-full transition-all"
                              style={{ width: `${(achievement.currentProgress / achievement.requirement) * 100}%` }}
                            />
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {achievement.currentProgress}/{achievement.requirement}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Challenges Tab */}
              {activeTab === 'challenges' && (
                <div className="space-y-3">
                  {challenges.map((challenge) => (
                    <motion.div
                      key={challenge.id}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        challenge.completed
                          ? 'bg-green-50 border-green-200'
                          : 'bg-blue-50 border-blue-200'
                      }`}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-gray-800">{challenge.title}</div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          challenge.type === 'daily' ? 'bg-yellow-100 text-yellow-800' :
                          challenge.type === 'weekly' ? 'bg-blue-100 text-blue-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {challenge.type}
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-3">{challenge.description}</div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">+{challenge.xpReward} XP</div>
                        <div className="text-xs text-gray-500">
                          {challenge.currentProgress}/{challenge.target}
                        </div>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${(challenge.currentProgress / challenge.target) * 100}%` }}
                        />
                      </div>
                      
                      {challenge.completed && (
                        <div className="flex items-center space-x-2 mt-2 text-green-600">
                          <Trophy className="w-4 h-4" />
                          <span className="text-sm font-medium">Completed!</span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications */}
      <div className="fixed top-4 right-4 space-y-2 z-50">
        <AnimatePresence>
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 300, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.8 }}
              className={`bg-white rounded-lg shadow-lg p-4 border-l-4 ${
                notification.type === 'levelUp' ? 'border-yellow-500' :
                notification.type === 'achievement' ? 'border-purple-500' :
                'border-blue-500'
              }`}
            >
              <div className="flex items-center space-x-3">
                {notification.icon}
                <div>
                  <div className="font-medium text-gray-800">{notification.title}</div>
                  <div className="text-sm text-gray-600">{notification.message}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Quick Action Buttons */}
      <div className="fixed bottom-20 right-4 space-y-2">
        <motion.button
          onClick={() => addXP(25, 'Breathing Exercise')}
          className="bg-green-500 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Complete Breathing Exercise (+25 XP)"
        >
          <Zap className="w-5 h-5" />
        </motion.button>
        
        <motion.button
          onClick={() => addXP(15, 'Mood Entry')}
          className="bg-purple-500 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Log Mood (+15 XP)"
        >
          <Heart className="w-5 h-5" />
        </motion.button>
      </div>
    </>
  );
}
