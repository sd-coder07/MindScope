'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { DataPersistence, UserData, UserPreferences } from '@/lib/secureDataPersistence';

interface AuthUser {
  id: string;
  name?: string;
  email?: string;
  preferences: UserPreferences;
  isGuest: boolean;
  sessionId: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<AuthUser>) => Promise<void>;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Try to load existing session
      const userData = await DataPersistence.loadUserData();
      
      if (userData && userData.sessionData.currentSessionId) {
        // Restore session
        setUser({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          preferences: userData.preferences,
          isGuest: !userData.email,
          sessionId: userData.sessionData.currentSessionId
        });
      } else {
        // No existing session - will need to login or continue as guest
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsGuest = async () => {
    try {
      const sessionId = generateSessionId();
      const guestUser: AuthUser = {
        id: `guest_${sessionId}`,
        isGuest: true,
        sessionId,
        preferences: {
          theme: 'auto',
          language: 'en',
          notifications: false,
          voiceEnabled: false,
          cameraEnabled: false,
          dataSharing: false,
          autoSave: true
        }
      };

      const userData: UserData = {
        id: guestUser.id,
        preferences: guestUser.preferences,
        wellnessData: {
          moodHistory: [],
          breathingHistory: [],
          emotionHistory: [],
          stressLevels: [],
          sleepData: [],
          goals: [],
          achievements: [],
          streaks: {
            currentStreak: 0,
            longestStreak: 0,
            lastActivityDate: 0,
            streakType: 'daily'
          }
        },
        sessionData: {
          currentSessionId: sessionId,
          sessionStartTime: Date.now(),
          totalTimeSpent: 0,
          activitiesCompleted: [],
          deviceInfo: {
            userAgent: navigator.userAgent,
            screen: `${screen.width}x${screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
          }
        },
        privacy: {
          dataRetention: 'session',
          localOnly: true,
          encryptData: true,
          anonymizeData: true,
          shareAnalytics: false,
          exportEnabled: true
        },
        lastUpdated: Date.now(),
        created: Date.now()
      };

      await DataPersistence.saveUserData(userData);
      setUser(guestUser);
    } catch (error) {
      console.error('Failed to login as guest:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // For demo purposes, we'll simulate authentication
      // In a real app, this would call your authentication API
      
      if (email && password.length >= 6) {
        const sessionId = generateSessionId();
        const authenticatedUser: AuthUser = {
          id: `user_${btoa(email).replace(/[^a-zA-Z0-9]/g, '')}`,
          name: email.split('@')[0],
          email,
          isGuest: false,
          sessionId,
          preferences: {
            theme: 'auto',
            language: 'en',
            notifications: true,
            voiceEnabled: true,
            cameraEnabled: true,
            dataSharing: false,
            autoSave: true
          }
        };

        const userData: UserData = {
          id: authenticatedUser.id,
          name: authenticatedUser.name,
          email: authenticatedUser.email,
          preferences: authenticatedUser.preferences,
          wellnessData: {
            moodHistory: [],
            breathingHistory: [],
            emotionHistory: [],
            stressLevels: [],
            sleepData: [],
            goals: [],
            achievements: [],
            streaks: {
              currentStreak: 0,
              longestStreak: 0,
              lastActivityDate: 0,
              streakType: 'daily'
            }
          },
          sessionData: {
            currentSessionId: sessionId,
            sessionStartTime: Date.now(),
            totalTimeSpent: 0,
            activitiesCompleted: [],
            deviceInfo: {
              userAgent: navigator.userAgent,
              screen: `${screen.width}x${screen.height}`,
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            }
          },
          privacy: {
            dataRetention: '30days',
            localOnly: false,
            encryptData: true,
            anonymizeData: false,
            shareAnalytics: true,
            exportEnabled: true
          },
          lastUpdated: Date.now(),
          created: Date.now()
        };

        await DataPersistence.saveUserData(userData);
        setUser(authenticatedUser);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      if (user?.isGuest) {
        // Clear guest data
        await DataPersistence.clearUserData();
      }
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const updateProfile = async (updates: Partial<AuthUser>) => {
    if (!user) return;

    try {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);

      const userData = await DataPersistence.loadUserData();
      if (userData) {
        const updatedUserData: UserData = {
          ...userData,
          name: updatedUser.name,
          email: updatedUser.email,
          lastUpdated: Date.now()
        };
        await DataPersistence.saveUserData(updatedUserData);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const updatePreferences = async (preferenceUpdates: Partial<UserPreferences>) => {
    if (!user) return;

    try {
      const updatedPreferences = { ...user.preferences, ...preferenceUpdates };
      const updatedUser = { ...user, preferences: updatedPreferences };
      setUser(updatedUser);

      const userData = await DataPersistence.loadUserData();
      if (userData) {
        const updatedUserData: UserData = {
          ...userData,
          preferences: updatedPreferences,
          lastUpdated: Date.now()
        };
        await DataPersistence.saveUserData(updatedUserData);
      }
    } catch (error) {
      console.error('Failed to update preferences:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    loginAsGuest,
    logout,
    updateProfile,
    updatePreferences
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export default AuthProvider;
