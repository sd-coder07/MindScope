import { AnimatePresence, motion } from 'framer-motion';
import {
  Award,
  Brain,
  Flame,
  Lock,
  Star,
  Trophy,
  Zap
} from 'lucide-react';
import { useState } from 'react';

// Import game components
import BreathingRhythmGame from './games/BreathingRhythmGame';
import MemoryMatrixGame from './games/MemoryMatrixGame';
import ZenColorFlowGame from './games/ZenColorFlowGame';

interface RealGamificationSystemProps {
  isDarkMode?: boolean;
}

interface UserProgress {
  level: number;
  totalPoints: number;
  nextLevelProgress: number;
  weeklyStreak: number;
  achievementsUnlocked: string[];
  gamesCompleted: number;
  moodEntries: number;
  rankTitle: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: React.ComponentType<any>;
  requirements: {
    type: 'entries' | 'streak' | 'mood_average' | 'games_played' | 'memory_games' | 'breathing_time' | 'coloring_games';
    value: number;
    period?: number;
  };
  category: 'mood' | 'consistency' | 'achievement' | 'games';
}

export default function RealGamificationSystem({ isDarkMode = false }: RealGamificationSystemProps) {
  const [userProgress, setUserProgress] = useState<UserProgress>({
    level: 1,
    totalPoints: 0,
    nextLevelProgress: 0,
    weeklyStreak: 0,
    achievementsUnlocked: [],
    gamesCompleted: 0,
    moodEntries: 0,
    rankTitle: 'Wellness Beginner'
  });

  const [showAchievement, setShowAchievement] = useState<{
    id: string;
    title: string;
    description: string;
    points: number;
  } | null>(null);

  const [activeGame, setActiveGame] = useState<string | null>(null);

  const handleGameComplete = (xp: number) => {
    setUserProgress(prev => {
      const newPoints = prev.totalPoints + xp;
      const newLevel = Math.floor(newPoints / 100) + 1;
      const progress = (newPoints % 100);
      
      return {
        ...prev,
        totalPoints: newPoints,
        level: newLevel,
        nextLevelProgress: progress,
        gamesCompleted: prev.gamesCompleted + 1
      };
    });
    
    // Close the game modal after completion
    setActiveGame(null);
  };

  const handleGameStart = (gameId: string) => {
    setActiveGame(gameId);
  };

  // Define available achievements
  const achievements: Achievement[] = [
    {
      id: 'first-mood',
      title: 'First Steps',
      description: 'Log your first mood entry',
      points: 10,
      icon: Star,
      requirements: { type: 'entries', value: 1 },
      category: 'mood'
    },
    {
      id: 'week-streak',
      title: 'Week Warrior',
      description: 'Log mood for 7 consecutive days',
      points: 50,
      icon: Flame,
      requirements: { type: 'streak', value: 7 },
      category: 'consistency'
    },
    {
      id: 'month-streak',
      title: 'Monthly Master',
      description: 'Log mood for 30 consecutive days',
      points: 200,
      icon: Trophy,
      requirements: { type: 'streak', value: 30 },
      category: 'consistency'
    },
    {
      id: 'game-master',
      title: 'Game Master',
      description: 'Complete 10 wellness games',
      points: 100,
      icon: Brain,
      requirements: { type: 'games_played', value: 10 },
      category: 'games'
    },
    {
      id: 'memory-champion',
      title: 'Memory Champion',
      description: 'Complete 5 Memory Matrix games',
      points: 75,
      icon: Zap,
      requirements: { type: 'memory_games', value: 5 },
      category: 'games'
    },
    {
      id: 'breathing-guru',
      title: 'Breathing Guru',
      description: 'Complete 30 minutes of breathing exercises',
      points: 80,
      icon: Award,
      requirements: { type: 'breathing_time', value: 30 },
      category: 'games'
    },
    {
      id: 'color-artist',
      title: 'Color Artist',
      description: 'Complete 3 Zen Color Flow sessions',
      points: 60,
      icon: Star,
      requirements: { type: 'coloring_games', value: 3 },
      category: 'games'
    }
  ];

  const isAchievementUnlocked = (badgeId: string) => {
    return userProgress.achievementsUnlocked.includes(badgeId);
  };

  return (
    <div className={`max-w-6xl mx-auto space-y-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      {/* Game Modals */}
      <MemoryMatrixGame
        isOpen={activeGame === 'memory-matrix'}
        onClose={() => setActiveGame(null)}
        onComplete={handleGameComplete}
        isDarkMode={isDarkMode}
      />
      
      <BreathingRhythmGame
        isOpen={activeGame === 'breathing-rhythm'}
        onClose={() => setActiveGame(null)}
        onComplete={handleGameComplete}
        isDarkMode={isDarkMode}
      />
      
      <ZenColorFlowGame
        isOpen={activeGame === 'zen-color-flow'}
        onClose={() => setActiveGame(null)}
        onComplete={handleGameComplete}
        isDarkMode={isDarkMode}
      />

      {/* Achievement Unlock Animation */}
      <AnimatePresence>
        {showAchievement && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -100 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-6 rounded-2xl shadow-2xl"
          >
            <div className="flex items-center space-x-4">
              <Trophy className="w-8 h-8" />
              <div>
                <h3 className="text-xl font-bold">{showAchievement.title}</h3>
                <p className="text-yellow-100">{showAchievement.description}</p>
                <p className="text-yellow-200 font-semibold">+{showAchievement.points} XP</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        } rounded-3xl p-8 border shadow-xl`}
      >
        <div className="flex flex-col lg:flex-row items-center justify-between space-y-6 lg:space-y-0">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              Level {userProgress.level}
            </h2>
            <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {userProgress.rankTitle}
            </p>
            <div className="flex items-center space-x-2 mt-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold">{userProgress.totalPoints} XP</span>
            </div>
          </div>
          
          <div className="flex-1 max-w-md">
            <div className="flex justify-between text-sm mb-2">
              <span>Progress to Level {userProgress.level + 1}</span>
              <span>{userProgress.nextLevelProgress}/100 XP</span>
            </div>
            <div className={`w-full h-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${userProgress.nextLevelProgress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
              />
            </div>
          </div>
          
          <div className="flex space-x-6 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-500">{userProgress.weeklyStreak}</div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Day Streak</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-pink-500">{userProgress.gamesCompleted}</div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Games Played</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Wellness Games */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        } rounded-3xl p-8 border shadow-xl`}
      >
        <h3 className="text-2xl font-bold mb-6 flex items-center">
          <Brain className="w-7 h-7 mr-3 text-purple-500" />
          Mind-Refreshing Games
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              id: 'memory-matrix',
              name: 'Memory Matrix',
              description: 'Test and improve your memory with pattern sequences',
              xpReward: '10-25 XP',
              difficulty: 'Progressive',
              icon: Brain,
              color: 'from-blue-500 to-purple-600'
            },
            {
              id: 'breathing-rhythm',
              name: 'Breathing Rhythm',
              description: 'Guided breathing exercises for mindfulness and calm',
              xpReward: '5 XP/min',
              difficulty: 'Relaxing',
              icon: Award,
              color: 'from-green-500 to-teal-600'
            },
            {
              id: 'zen-color-flow',
              name: 'Zen Color Flow',
              description: 'Mindful digital coloring for stress relief',
              xpReward: '15+ XP',
              difficulty: 'Peaceful',
              icon: Star,
              color: 'from-pink-500 to-rose-600'
            }
          ].map((game) => (
            <motion.div
              key={game.id}
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              className={`${
                isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 border-gray-600' 
                  : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
              } rounded-2xl p-6 border cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl`}
              onClick={() => handleGameStart(game.id)}
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${game.color} flex items-center justify-center mb-4 mx-auto`}>
                <game.icon className="w-8 h-8 text-white" />
              </div>
              
              <h4 className="text-xl font-semibold text-center mb-2">{game.name}</h4>
              <p className={`text-sm text-center mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {game.description}
              </p>
              
              <div className="flex justify-between items-center text-sm">
                <span className={`px-3 py-1 rounded-full ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                  {game.difficulty}
                </span>
                <span className="font-semibold text-purple-500">{game.xpReward}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className={`${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        } rounded-3xl p-8 border shadow-xl`}
      >
        <h3 className="text-2xl font-bold mb-6 flex items-center">
          <Trophy className="w-7 h-7 mr-3 text-yellow-500" />
          Achievements
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement) => {
            const isUnlocked = isAchievementUnlocked(achievement.id);
            const IconComponent = achievement.icon;
            
            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={isUnlocked ? { scale: 1.05 } : {}}
                className={`p-4 rounded-2xl border transition-all duration-300 ${
                  isUnlocked
                    ? `${isDarkMode ? 'bg-yellow-900/20 border-yellow-500/30' : 'bg-yellow-50 border-yellow-200'} shadow-lg`
                    : `${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'} opacity-60`
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-xl ${
                    isUnlocked 
                      ? 'bg-yellow-500 text-white' 
                      : `${isDarkMode ? 'bg-gray-600 text-gray-400' : 'bg-gray-300 text-gray-500'}`
                  }`}>
                    {isUnlocked ? (
                      <IconComponent className="w-5 h-5" />
                    ) : (
                      <Lock className="w-5 h-5" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className={`font-semibold ${isUnlocked ? 'text-yellow-600' : (isDarkMode ? 'text-gray-400' : 'text-gray-500')}`}>
                      {achievement.title}
                    </h4>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} ${!isUnlocked && 'opacity-75'}`}>
                      {achievement.description}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {achievement.category}
                      </span>
                      <span className={`text-sm font-medium ${isUnlocked ? 'text-yellow-600' : (isDarkMode ? 'text-gray-400' : 'text-gray-500')}`}>
                        +{achievement.points} XP
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { label: 'Total XP', value: userProgress.totalPoints, icon: Star, color: 'text-yellow-500' },
          { label: 'Current Level', value: userProgress.level, icon: Trophy, color: 'text-purple-500' },
          { label: 'Games Completed', value: userProgress.gamesCompleted, icon: Brain, color: 'text-blue-500' },
          { label: 'Achievements', value: userProgress.achievementsUnlocked.length, icon: Award, color: 'text-green-500' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            whileHover={{ scale: 1.05 }}
            className={`${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            } rounded-2xl p-6 border text-center shadow-lg`}
          >
            <stat.icon className={`w-8 h-8 mx-auto mb-2 ${stat.color}`} />
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {stat.label}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
