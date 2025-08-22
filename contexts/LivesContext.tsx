import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserLives, LivesContextType, LivesHistoryEntry, DEFAULT_LIVES_CONFIG } from '../app/types/lives';

const LIVES_STORAGE_KEY = '@saintpharma_user_lives';

const LivesContext = createContext<LivesContextType | undefined>(undefined);

const getInitialLives = (): UserLives => ({
  currentLives: DEFAULT_LIVES_CONFIG.maxLives,
  maxLives: DEFAULT_LIVES_CONFIG.maxLives,
  lastRegeneration: new Date(),
  livesHistory: []
});

interface LivesProviderProps {
  children: ReactNode;
}

export function LivesProvider({ children }: LivesProviderProps) {
  const [userLives, setUserLives] = useState<UserLives>(getInitialLives());
  const [isLoaded, setIsLoaded] = useState(false);

  // Carregar dados do AsyncStorage
  useEffect(() => {
    loadLivesFromStorage();
  }, []);

  // Auto-regeneração de vidas
  useEffect(() => {
    if (!isLoaded) return;

    const checkRegeneration = () => {
      const now = new Date();
      const lastRegen = new Date(userLives.lastRegeneration);
      const hoursSinceLastRegen = (now.getTime() - lastRegen.getTime()) / (1000 * 60 * 60);

      if (hoursSinceLastRegen >= DEFAULT_LIVES_CONFIG.regenerationIntervalHours) {
        regenerateLives();
      }
    };

    // Verificar imediatamente
    checkRegeneration();

    // Verificar a cada minuto
    const interval = setInterval(checkRegeneration, 60000);

    return () => clearInterval(interval);
  }, [userLives.lastRegeneration, isLoaded]);

  // Salvar no AsyncStorage sempre que houver mudanças
  useEffect(() => {
    if (isLoaded) {
      saveLivesToStorage();
    }
  }, [userLives, isLoaded]);

  const loadLivesFromStorage = async () => {
    try {
      const stored = await AsyncStorage.getItem(LIVES_STORAGE_KEY);
      if (stored) {
        const parsedLives = JSON.parse(stored);
        // Converter strings de data de volta para objetos Date
        parsedLives.lastRegeneration = new Date(parsedLives.lastRegeneration);
        parsedLives.livesHistory = parsedLives.livesHistory.map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp)
        }));
        setUserLives(parsedLives);
      }
    } catch (error) {
      console.error('Erro ao carregar vidas:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const saveLivesToStorage = async () => {
    try {
      await AsyncStorage.setItem(LIVES_STORAGE_KEY, JSON.stringify(userLives));
    } catch (error) {
      console.error('Erro ao salvar vidas:', error);
    }
  };

  const addHistoryEntry = (type: 'lost' | 'gained' | 'regenerated', amount: number, reason: string, quizId?: number, courseId?: number) => {
    const entry: LivesHistoryEntry = {
      id: Date.now().toString(),
      type,
      amount,
      reason,
      timestamp: new Date(),
      quizId,
      courseId
    };

    setUserLives(prev => ({
      ...prev,
      livesHistory: [entry, ...prev.livesHistory].slice(0, 50) // Manter apenas as últimas 50 entradas
    }));
  };

  const loseLives = (amount: number, reason: string, quizId?: number, courseId?: number) => {
    setUserLives(prev => {
      const newLives = Math.max(0, prev.currentLives - amount);
      return {
        ...prev,
        currentLives: newLives
      };
    });

    addHistoryEntry('lost', amount, reason, quizId, courseId);
  };

  const canAccessCourses = (): boolean => {
    return userLives.currentLives > 0;
  };

  const getTimeUntilNextRegeneration = (): number => {
    const now = new Date();
    const lastRegen = new Date(userLives.lastRegeneration);
    const nextRegen = new Date(lastRegen.getTime() + (DEFAULT_LIVES_CONFIG.regenerationIntervalHours * 60 * 60 * 1000));
    return Math.max(0, nextRegen.getTime() - now.getTime());
  };

  const regenerateLives = () => {
    setUserLives(prev => {
      const newLives = Math.min(prev.maxLives, prev.currentLives + DEFAULT_LIVES_CONFIG.livesPerRegeneration);
      const livesGained = newLives - prev.currentLives;
      
      if (livesGained > 0) {
        addHistoryEntry('regenerated', livesGained, 'Regeneração automática (24h)');
      }

      return {
        ...prev,
        currentLives: newLives,
        lastRegeneration: new Date()
      };
    });
  };

  const resetLives = () => {
    const initialLives = getInitialLives();
    setUserLives(initialLives);
    addHistoryEntry('gained', initialLives.currentLives, 'Reset do sistema');
  };

  const contextValue: LivesContextType = {
    userLives,
    config: DEFAULT_LIVES_CONFIG,
    loseLives,
    canAccessCourses,
    getTimeUntilNextRegeneration,
    regenerateLives,
    resetLives
  };

  if (!isLoaded) {
    return null; // ou um loading spinner
  }

  return (
    <LivesContext.Provider value={contextValue}>
      {children}
    </LivesContext.Provider>
  );
}

export function useLives(): LivesContextType {
  const context = useContext(LivesContext);
  if (!context) {
    throw new Error('useLives deve ser usado dentro de um LivesProvider');
  }
  return context;
}