'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { RotateCcw, Trophy, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface MemoryMatrixGameProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (xp: number) => void;
  isDarkMode?: boolean;
}

interface GridCell {
  id: number;
  isActive: boolean;
  isRevealed: boolean;
  isCorrect?: boolean;
}

export default function MemoryMatrixGame({ isOpen, onClose, onComplete, isDarkMode = false }: MemoryMatrixGameProps) {
  const [gameState, setGameState] = useState<'intro' | 'showing' | 'playing' | 'completed' | 'failed'>('intro');
  const [grid, setGrid] = useState<GridCell[]>([]);
  const [sequence, setSequence] = useState<number[]>([]);
  const [currentSequenceIndex, setCurrentSequenceIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const gridSize = 4; // 4x4 grid

  const initializeGame = useCallback(() => {
    const newGrid: GridCell[] = [];
    for (let i = 0; i < gridSize * gridSize; i++) {
      newGrid.push({
        id: i,
        isActive: false,
        isRevealed: false
      });
    }
    
    // Generate sequence based on level (3 + level cells)
    const sequenceLength = Math.min(3 + level, 8);
    const newSequence: number[] = [];
    while (newSequence.length < sequenceLength) {
      const randomCell = Math.floor(Math.random() * (gridSize * gridSize));
      if (!newSequence.includes(randomCell)) {
        newSequence.push(randomCell);
      }
    }
    
    setGrid(newGrid);
    setSequence(newSequence);
    setCurrentSequenceIndex(0);
    setGameState('intro');
  }, [level]);

  const showSequence = useCallback(() => {
    // Safety checks before proceeding
    if (!grid || grid.length === 0 || !sequence || sequence.length === 0) {
      console.warn('Grid or sequence not properly initialized');
      return;
    }
    
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    setGameState('showing');
    const newGrid = [...grid];
    
    // Reset all cells
    newGrid.forEach(cell => {
      cell.isActive = false;
      cell.isRevealed = false;
    });
    
    // Show sequence one by one
    let index = 0;
    intervalRef.current = setInterval(() => {
      if (index < sequence.length) {
        const cellIndex = sequence[index];
        
        // Bounds check to prevent undefined access
        if (cellIndex >= 0 && cellIndex < newGrid.length && newGrid[cellIndex]) {
          newGrid[cellIndex].isActive = true;
          setGrid([...newGrid]);
          
          setTimeout(() => {
            // Additional bounds check for the timeout
            if (cellIndex >= 0 && cellIndex < newGrid.length && newGrid[cellIndex]) {
              newGrid[cellIndex].isActive = false;
              setGrid([...newGrid]);
            }
          }, 600);
        }
        
        index++;
      } else {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setTimeout(() => {
          setGameState('playing');
        }, 800);
      }
    }, 800);
  }, [grid, sequence]);

  const handleCellClick = (cellId: number) => {
    if (gameState !== 'playing') return;
    
    // Bounds check
    if (cellId < 0 || cellId >= grid.length) return;
    
    const newGrid = [...grid];
    const cell = newGrid[cellId];
    
    // Additional safety check
    if (!cell || cell.isRevealed) return;
    
    cell.isRevealed = true;
    
    if (sequence[currentSequenceIndex] === cellId) {
      // Correct cell
      cell.isCorrect = true;
      setCurrentSequenceIndex(prev => prev + 1);
      
      if (currentSequenceIndex + 1 === sequence.length) {
        // Level completed
        const earnedXP = 10 + (level * 5);
        setScore(prev => prev + earnedXP);
        setLevel(prev => prev + 1);
        
        setTimeout(() => {
          if (level >= 5) {
            // Game completed
            setGameState('completed');
            onComplete(score + earnedXP);
          } else {
            // Next level
            initializeGame();
          }
        }, 1000);
      }
    } else {
      // Wrong cell
      cell.isCorrect = false;
      setLives(prev => prev - 1);
      
      if (lives <= 1) {
        setGameState('failed');
      } else {
        // Show correct sequence briefly
        sequence.forEach(id => {
          newGrid[id].isActive = true;
        });
        
        setTimeout(() => {
          initializeGame();
        }, 1500);
      }
    }
    
    setGrid(newGrid);
  };

  const resetGame = () => {
    setScore(0);
    setLevel(1);
    setLives(3);
    initializeGame();
  };

  useEffect(() => {
    if (isOpen) {
      initializeGame();
    } else {
      // Clean up interval when modal closes
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [isOpen, initializeGame]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={`relative w-full max-w-md rounded-2xl p-6 ${
            isDarkMode 
              ? 'bg-slate-800 border border-slate-700' 
              : 'bg-white border border-gray-200'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Memory Matrix 🧩
              </h2>
              <div className="flex items-center space-x-4 mt-1">
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Level {level}
                </span>
                <span className={`text-sm font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                  {score} XP
                </span>
                <span className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                  ❤️ {lives}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-full transition-colors ${
                isDarkMode 
                  ? 'hover:bg-slate-700 text-gray-400 hover:text-white' 
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Game Status */}
          <div className="mb-4">
            {gameState === 'intro' && (
              <div className="text-center">
                <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Remember the sequence of highlighted cells
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={showSequence}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium"
                >
                  Start Level {level}
                </motion.button>
              </div>
            )}
            
            {gameState === 'showing' && (
              <div className="text-center">
                <p className={`text-sm ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                  Watch the sequence carefully...
                </p>
              </div>
            )}
            
            {gameState === 'playing' && (
              <div className="text-center">
                <p className={`text-sm ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                  Click the cells in the same order ({currentSequenceIndex + 1}/{sequence.length})
                </p>
              </div>
            )}
            
            {gameState === 'completed' && (
              <div className="text-center">
                <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
                <p className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                  Congratulations!
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  You earned {score} XP!
                </p>
              </div>
            )}
            
            {gameState === 'failed' && (
              <div className="text-center">
                <p className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                  Game Over
                </p>
                <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Final Score: {score} XP
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetGame}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg font-medium flex items-center space-x-2 mx-auto"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Try Again</span>
                </motion.button>
              </div>
            )}
          </div>

          {/* Game Grid */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            {grid.map((cell) => (
              <motion.button
                key={cell.id}
                whileHover={{ scale: gameState === 'playing' ? 1.05 : 1 }}
                whileTap={{ scale: gameState === 'playing' ? 0.95 : 1 }}
                onClick={() => handleCellClick(cell.id)}
                disabled={gameState !== 'playing'}
                className={`
                  aspect-square rounded-lg border-2 transition-all duration-300
                  ${cell.isActive ? 'bg-blue-500 border-blue-400 shadow-lg shadow-blue-500/50' : ''}
                  ${cell.isRevealed && cell.isCorrect ? 'bg-green-500 border-green-400' : ''}
                  ${cell.isRevealed && cell.isCorrect === false ? 'bg-red-500 border-red-400' : ''}
                  ${!cell.isActive && !cell.isRevealed ? (
                    isDarkMode 
                      ? 'bg-slate-700 border-slate-600 hover:bg-slate-600' 
                      : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
                  ) : ''}
                  ${gameState === 'playing' ? 'cursor-pointer' : 'cursor-default'}
                `}
              />
            ))}
          </div>

          {/* Controls */}
          {(gameState === 'completed' || gameState === 'failed') && (
            <div className="flex space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetGame}
                className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-lg font-medium"
              >
                Play Again
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className={`flex-1 py-2 rounded-lg font-medium border-2 ${
                  isDarkMode 
                    ? 'border-slate-600 text-gray-300 hover:bg-slate-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Close
              </motion.button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
