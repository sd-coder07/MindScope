'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  Move, 
  Eye, 
  EyeOff, 
  RotateCcw, 
  Save,
  Grid,
  Layout,
  Maximize,
  Minimize,
  Square
} from 'lucide-react';

export type WidgetSize = 'small' | 'medium' | 'large' | 'wide';
export type WidgetType = 'metrics' | 'chart' | 'analytics' | 'mood' | 'activity' | 'insights' | 'achievements';

export interface LayoutWidget {
  id: string;
  type: WidgetType;
  title: string;
  size: WidgetSize;
  position: { x: number; y: number };
  visible: boolean;
  locked?: boolean;
  component?: React.ComponentType<any>;
  props?: any;
}

export interface LayoutPreset {
  id: string;
  name: string;
  description: string;
  widgets: LayoutWidget[];
  isDefault?: boolean;
}

interface LayoutContextType {
  widgets: LayoutWidget[];
  activePreset: string;
  presets: LayoutPreset[];
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  updateWidget: (id: string, updates: Partial<LayoutWidget>) => void;
  addWidget: (widget: Omit<LayoutWidget, 'id'>) => void;
  removeWidget: (id: string) => void;
  toggleWidgetVisibility: (id: string) => void;
  applyPreset: (presetId: string) => void;
  saveCurrentAsPreset: (name: string, description: string) => void;
  resetToDefault: () => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};

const DEFAULT_WIDGETS: LayoutWidget[] = [
  {
    id: 'metrics-1',
    type: 'metrics',
    title: 'Key Metrics',
    size: 'wide',
    position: { x: 0, y: 0 },
    visible: true
  },
  {
    id: 'chart-1',
    type: 'chart',
    title: 'Mood Trends',
    size: 'large',
    position: { x: 0, y: 1 },
    visible: true
  },
  {
    id: 'analytics-1',
    type: 'analytics',
    title: 'Wellness Analytics',
    size: 'large',
    position: { x: 2, y: 1 },
    visible: true
  },
  {
    id: 'mood-1',
    type: 'mood',
    title: 'Current Mood',
    size: 'medium',
    position: { x: 0, y: 3 },
    visible: true
  },
  {
    id: 'activity-1',
    type: 'activity',
    title: 'Recent Activity',
    size: 'medium',
    position: { x: 1, y: 3 },
    visible: true
  },
  {
    id: 'insights-1',
    type: 'insights',
    title: 'AI Insights',
    size: 'medium',
    position: { x: 2, y: 3 },
    visible: true
  }
];

const DEFAULT_PRESETS: LayoutPreset[] = [
  {
    id: 'default',
    name: 'Default Dashboard',
    description: 'Balanced view with all key widgets',
    widgets: DEFAULT_WIDGETS,
    isDefault: true
  },
  {
    id: 'minimal',
    name: 'Minimal View',
    description: 'Clean, focused dashboard with essential widgets only',
    widgets: [
      {
        id: 'metrics-minimal',
        type: 'metrics',
        title: 'Key Metrics',
        size: 'wide',
        position: { x: 0, y: 0 },
        visible: true
      },
      {
        id: 'mood-minimal',
        type: 'mood',
        title: 'Mood Check',
        size: 'large',
        position: { x: 0, y: 1 },
        visible: true
      }
    ]
  },
  {
    id: 'analytics-focused',
    name: 'Analytics Focused',
    description: 'Data-heavy layout for detailed analysis',
    widgets: [
      {
        id: 'chart-main',
        type: 'chart',
        title: 'Primary Chart',
        size: 'large',
        position: { x: 0, y: 0 },
        visible: true
      },
      {
        id: 'analytics-main',
        type: 'analytics',
        title: 'Detailed Analytics',
        size: 'large',
        position: { x: 2, y: 0 },
        visible: true
      },
      {
        id: 'insights-main',
        type: 'insights',
        title: 'Data Insights',
        size: 'wide',
        position: { x: 0, y: 2 },
        visible: true
      }
    ]
  }
];

interface LayoutProviderProps {
  children: React.ReactNode;
}

export const LayoutProvider: React.FC<LayoutProviderProps> = ({ children }) => {
  const [widgets, setWidgets] = useState<LayoutWidget[]>(DEFAULT_WIDGETS);
  const [activePreset, setActivePreset] = useState('default');
  const [presets, setPresets] = useState<LayoutPreset[]>(DEFAULT_PRESETS);
  const [isEditing, setIsEditing] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedLayout = localStorage.getItem('mindscope-layout');
    if (savedLayout) {
      try {
        const parsed = JSON.parse(savedLayout);
        setWidgets(parsed.widgets || DEFAULT_WIDGETS);
        setActivePreset(parsed.activePreset || 'default');
        setPresets(parsed.presets || DEFAULT_PRESETS);
      } catch (error) {
        console.warn('Failed to load saved layout:', error);
      }
    }
  }, []);

  // Save to localStorage when layout changes
  useEffect(() => {
    const layoutData = {
      widgets,
      activePreset,
      presets
    };
    localStorage.setItem('mindscope-layout', JSON.stringify(layoutData));
  }, [widgets, activePreset, presets]);

  const updateWidget = useCallback((id: string, updates: Partial<LayoutWidget>) => {
    setWidgets(prev => prev.map(widget => 
      widget.id === id ? { ...widget, ...updates } : widget
    ));
  }, []);

  const addWidget = useCallback((widget: Omit<LayoutWidget, 'id'>) => {
    const id = `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setWidgets(prev => [...prev, { ...widget, id }]);
  }, []);

  const removeWidget = useCallback((id: string) => {
    setWidgets(prev => prev.filter(widget => widget.id !== id));
  }, []);

  const toggleWidgetVisibility = useCallback((id: string) => {
    updateWidget(id, { visible: !widgets.find(w => w.id === id)?.visible });
  }, [widgets, updateWidget]);

  const applyPreset = useCallback((presetId: string) => {
    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      setWidgets(preset.widgets);
      setActivePreset(presetId);
    }
  }, [presets]);

  const saveCurrentAsPreset = useCallback((name: string, description: string) => {
    const newPreset: LayoutPreset = {
      id: `preset-${Date.now()}`,
      name,
      description,
      widgets: [...widgets]
    };
    setPresets(prev => [...prev, newPreset]);
  }, [widgets]);

  const resetToDefault = useCallback(() => {
    applyPreset('default');
  }, [applyPreset]);

  return (
    <LayoutContext.Provider value={{
      widgets,
      activePreset,
      presets,
      isEditing,
      setIsEditing,
      updateWidget,
      addWidget,
      removeWidget,
      toggleWidgetVisibility,
      applyPreset,
      saveCurrentAsPreset,
      resetToDefault
    }}>
      {children}
    </LayoutContext.Provider>
  );
};

interface CustomizableLayoutProps {
  children: React.ReactNode;
  isDarkMode?: boolean;
}

export const CustomizableLayout: React.FC<CustomizableLayoutProps> = ({
  children,
  isDarkMode = false
}) => {
  const { 
    widgets, 
    isEditing, 
    setIsEditing, 
    updateWidget, 
    toggleWidgetVisibility 
  } = useLayout();

  const getSizeClasses = (size: WidgetSize) => {
    const sizeMap = {
      small: 'col-span-1 row-span-1',
      medium: 'col-span-2 row-span-1',
      large: 'col-span-2 row-span-2',
      wide: 'col-span-4 row-span-1'
    };
    return sizeMap[size];
  };

  const handleWidgetDrag = (id: string, newPosition: { x: number; y: number }) => {
    updateWidget(id, { position: newPosition });
  };

  return (
    <div className="relative">
      {/* Edit Mode Toggle */}
      <div className="fixed top-4 right-4 z-40">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsEditing(!isEditing)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            isEditing
              ? 'bg-blue-500 text-white'
              : isDarkMode
                ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>{isEditing ? 'Exit Edit' : 'Customize'}</span>
          </div>
        </motion.button>
      </div>

      {/* Grid Layout */}
      <div className={`grid grid-cols-4 gap-4 p-4 ${isEditing ? 'editing-mode' : ''}`}>
        {widgets
          .filter(widget => widget.visible)
          .map((widget) => (
            <motion.div
              key={widget.id}
              layout
              className={`
                ${getSizeClasses(widget.size)}
                ${isEditing ? 'cursor-move border-2 border-dashed border-blue-300' : ''}
                relative rounded-lg overflow-hidden
              `}
              style={{
                gridColumnStart: widget.position.x + 1,
                gridRowStart: widget.position.y + 1
              }}
              drag={isEditing}
              dragConstraints={false}
              onDragEnd={(event, info) => {
                // Calculate new grid position based on drag
                const rect = (event.target as HTMLElement).getBoundingClientRect();
                const gridX = Math.round(info.point.x / 320); // Approximate grid size
                const gridY = Math.round(info.point.y / 240);
                handleWidgetDrag(widget.id, { x: Math.max(0, gridX), y: Math.max(0, gridY) });
              }}
            >
              {/* Widget Controls (only in edit mode) */}
              {isEditing && (
                <div className="absolute top-2 right-2 z-10 flex space-x-1">
                  <button
                    onClick={() => toggleWidgetVisibility(widget.id)}
                    className="p-1 bg-gray-800 text-white rounded opacity-75 hover:opacity-100"
                  >
                    <EyeOff className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => updateWidget(widget.id, { 
                      size: widget.size === 'small' ? 'medium' : 
                            widget.size === 'medium' ? 'large' : 
                            widget.size === 'large' ? 'wide' : 'small' 
                    })}
                    className="p-1 bg-gray-800 text-white rounded opacity-75 hover:opacity-100"
                  >
                    <Square className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Widget Content */}
              <div className="h-full">
                {children}
              </div>
            </motion.div>
          ))}
      </div>
    </div>
  );
};

interface LayoutControlPanelProps {
  isDarkMode?: boolean;
}

export const LayoutControlPanel: React.FC<LayoutControlPanelProps> = ({
  isDarkMode = false
}) => {
  const { 
    widgets, 
    presets, 
    activePreset, 
    applyPreset, 
    resetToDefault,
    toggleWidgetVisibility 
  } = useLayout();
  
  const [showPanel, setShowPanel] = useState(false);

  return (
    <>
      {/* Toggle Button - Hidden since integrated in dashboard */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowPanel(!showPanel)}
        className="hidden"
        title="Layout Controls"
      >
        <Layout className="w-5 h-5" />
      </motion.button>

      {/* Control Panel */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            className={`fixed top-0 right-0 h-full w-80 p-6 shadow-xl ${
              isDarkMode ? 'bg-slate-800 text-white' : 'bg-white text-gray-900'
            } overflow-y-auto z-50`}
          >
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Layout Controls</h3>
                <button
                  onClick={() => setShowPanel(false)}
                  className="p-1 rounded hover:bg-gray-200"
                >
                  ×
                </button>
              </div>

              {/* Presets */}
              <div>
                <h4 className="font-medium mb-3">Layout Presets</h4>
                <div className="space-y-2">
                  {presets.map((preset) => (
                    <motion.button
                      key={preset.id}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => applyPreset(preset.id)}
                      className={`w-full p-3 text-left rounded-lg border transition-colors ${
                        activePreset === preset.id
                          ? 'border-blue-500 bg-blue-50'
                          : isDarkMode
                            ? 'border-gray-600 hover:bg-gray-700'
                            : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-medium">{preset.name}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        {preset.description}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Widget Visibility */}
              <div>
                <h4 className="font-medium mb-3">Widget Visibility</h4>
                <div className="space-y-2">
                  {widgets.map((widget) => (
                    <div key={widget.id} className="flex items-center justify-between">
                      <span className="text-sm">{widget.title}</span>
                      <button
                        onClick={() => toggleWidgetVisibility(widget.id)}
                        className={`p-1 rounded ${
                          widget.visible ? 'text-green-500' : 'text-gray-400'
                        }`}
                      >
                        {widget.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reset Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={resetToDefault}
                className={`w-full p-3 rounded-lg border transition-colors ${
                  isDarkMode
                    ? 'border-gray-600 hover:bg-gray-700'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset to Default</span>
                </div>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay */}
      {showPanel && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowPanel(false)}
          className="fixed inset-0 bg-black/20 z-40"
        />
      )}
    </>
  );
};

export default LayoutProvider;
