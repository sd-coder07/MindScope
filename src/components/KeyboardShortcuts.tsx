'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Command, 
  Search, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight,
  Keyboard,
  HelpCircle,
  X
} from 'lucide-react';

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
  action: () => void;
}

interface KeyboardShortcutsProps {
  isDarkMode?: boolean;
  onNavigate?: (path: string) => void;
  onToggleTheme?: () => void;
  onOpenSearch?: () => void;
  onOpenHelp?: () => void;
}

export const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({
  isDarkMode = false,
  onNavigate,
  onToggleTheme,
  onOpenSearch,
  onOpenHelp
}) => {
  const [showHelp, setShowHelp] = useState(false);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [recentShortcut, setRecentShortcut] = useState<string | null>(null);

  const shortcuts: Shortcut[] = useMemo(() => [
    // Navigation
    {
      keys: ['g', 'd'],
      description: 'Go to Dashboard',
      category: 'Navigation',
      action: () => onNavigate?.('/dashboard')
    },
    {
      keys: ['g', 'a'],
      description: 'Go to Analytics',
      category: 'Navigation',
      action: () => console.log('Navigate to Analytics')
    },
    {
      keys: ['g', 'i'],
      description: 'Go to Interventions',
      category: 'Navigation',
      action: () => console.log('Navigate to Interventions')
    },
    {
      keys: ['g', 's'],
      description: 'Go to Settings',
      category: 'Navigation',
      action: () => console.log('Navigate to Settings')
    },
    
    // Actions
    {
      keys: ['cmd', 'k'],
      description: 'Open Search',
      category: 'Actions',
      action: () => onOpenSearch?.()
    },
    {
      keys: ['cmd', 't'],
      description: 'Toggle Theme',
      category: 'Actions',
      action: () => onToggleTheme?.()
    },
    {
      keys: ['cmd', 's'],
      description: 'Save Current State',
      category: 'Actions',
      action: () => {
        localStorage.setItem('dashboardState', JSON.stringify({ timestamp: Date.now() }));
        setRecentShortcut('State Saved!');
      }
    },
    {
      keys: ['cmd', 'r'],
      description: 'Refresh Data',
      category: 'Actions',
      action: () => {
        window.location.reload();
      }
    },
    
    // Help
    {
      keys: ['?'],
      description: 'Show Keyboard Shortcuts',
      category: 'Help',
      action: () => setShowHelp(true)
    },
    {
      keys: ['h'],
      description: 'Show Help',
      category: 'Help',
      action: () => onOpenHelp?.()
    },
    {
      keys: ['escape'],
      description: 'Close Modal/Cancel',
      category: 'Help',
      action: () => setShowHelp(false)
    }
  ], [onNavigate, onToggleTheme, onOpenSearch, onOpenHelp]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    const newPressedKeys = new Set(pressedKeys);
    
    // Handle modifier keys
    if (e.metaKey) newPressedKeys.add('cmd');
    if (e.ctrlKey) newPressedKeys.add('ctrl');
    if (e.altKey) newPressedKeys.add('alt');
    if (e.shiftKey) newPressedKeys.add('shift');
    
    newPressedKeys.add(key);
    setPressedKeys(newPressedKeys);

    // Check for shortcut matches
    const pressedArray = Array.from(newPressedKeys);
    const matchedShortcut = shortcuts.find(shortcut => 
      shortcut.keys.length === pressedArray.length &&
      shortcut.keys.every(k => pressedArray.includes(k))
    );

    if (matchedShortcut) {
      e.preventDefault();
      matchedShortcut.action();
      setRecentShortcut(matchedShortcut.description);
      
      // Clear recent shortcut after 3 seconds
      setTimeout(() => setRecentShortcut(null), 3000);
    }
  }, [pressedKeys, shortcuts]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    const newPressedKeys = new Set(pressedKeys);
    
    // Remove the released key
    newPressedKeys.delete(e.key.toLowerCase());
    
    // Remove modifier keys when released
    if (!e.metaKey) newPressedKeys.delete('cmd');
    if (!e.ctrlKey) newPressedKeys.delete('ctrl');
    if (!e.altKey) newPressedKeys.delete('alt');
    if (!e.shiftKey) newPressedKeys.delete('shift');
    
    setPressedKeys(newPressedKeys);
  }, [pressedKeys]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, Shortcut[]>);

  const renderKey = (key: string) => {
    const keyIcons: Record<string, React.ComponentType<any>> = {
      cmd: Command,
      arrowup: ArrowUp,
      arrowdown: ArrowDown,
      arrowleft: ArrowLeft,
      arrowright: ArrowRight
    };

    const Icon = keyIcons[key.toLowerCase()];

    return (
      <kbd
        key={key}
        className={`inline-flex items-center px-2 py-1 text-xs font-mono rounded border ${
          isDarkMode
            ? 'bg-slate-700 border-slate-600 text-gray-300'
            : 'bg-gray-100 border-gray-300 text-gray-700'
        }`}
      >
        {Icon ? <Icon className="w-3 h-3" /> : key}
      </kbd>
    );
  };

  return (
    <>
      {/* Recent Shortcut Notification */}
      <AnimatePresence>
        {recentShortcut && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 right-6 z-50"
          >
            <div className={`px-4 py-2 rounded-lg shadow-lg border ${
              isDarkMode
                ? 'bg-slate-800 border-slate-600 text-green-400'
                : 'bg-white border-gray-200 text-green-600'
            }`}>
              <div className="flex items-center space-x-2">
                <Keyboard className="w-4 h-4" />
                <span className="text-sm font-medium">{recentShortcut}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Modal */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowHelp(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`max-w-4xl w-full max-h-[80vh] overflow-y-auto rounded-2xl border shadow-2xl ${
                isDarkMode
                  ? 'bg-slate-800 border-slate-600'
                  : 'bg-white border-gray-200'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-600">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <Keyboard className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Keyboard Shortcuts
                    </h2>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Navigate faster with these keyboard shortcuts
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowHelp(false)}
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode
                      ? 'hover:bg-slate-700 text-gray-400'
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
                    <div key={category}>
                      <h3 className={`text-lg font-semibold mb-4 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {category}
                      </h3>
                      <div className="space-y-3">
                        {categoryShortcuts.map((shortcut, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between"
                          >
                            <span className={`text-sm ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              {shortcut.description}
                            </span>
                            <div className="flex items-center space-x-1">
                              {shortcut.keys.map((key, keyIndex) => (
                                <React.Fragment key={keyIndex}>
                                  {keyIndex > 0 && (
                                    <span className={`text-xs ${
                                      isDarkMode ? 'text-gray-500' : 'text-gray-400'
                                    }`}>
                                      +
                                    </span>
                                  )}
                                  {renderKey(key)}
                                </React.Fragment>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className={`px-6 py-4 border-t ${
                isDarkMode ? 'border-slate-600 bg-slate-700/50' : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-center justify-between">
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Press <kbd className="px-1 py-0.5 text-xs bg-gray-200 dark:bg-slate-600 rounded">Escape</kbd> to close
                  </p>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Shortcuts Active
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard Shortcut Indicator */}
      <AnimatePresence>
        {pressedKeys.size > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-6 right-6 z-40"
          >
            <div className={`px-3 py-2 rounded-lg shadow-lg border ${
              isDarkMode
                ? 'bg-slate-800 border-slate-600'
                : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center space-x-1">
                {Array.from(pressedKeys).map((key, index) => (
                  <React.Fragment key={key}>
                    {index > 0 && (
                      <span className={`text-xs ${
                        isDarkMode ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        +
                      </span>
                    )}
                    {renderKey(key)}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default KeyboardShortcuts;
