import { useAuth } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useApiClient } from "../services/api";
import {
  DEFAULT_LIVES_CONFIG,
  LivesContextType,
  LivesHistoryEntry,
  UserLives,
} from "../types/lives";

const LIVES_STORAGE_KEY = "@saintpharma_user_lives";

const LivesContext = createContext<LivesContextType | undefined>(undefined);

const getInitialLives = (): UserLives => ({
  currentLives: DEFAULT_LIVES_CONFIG.maxLives,
  maxLives: DEFAULT_LIVES_CONFIG.maxLives,
  lastRegeneration: new Date(),
  livesHistory: [],
});

interface LivesProviderProps {
  children: ReactNode;
}

export function LivesProvider({ children }: LivesProviderProps) {
  const [userLives, setUserLives] = useState<UserLives>(getInitialLives());
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { userId, isSignedIn } = useAuth();
  const apiClient = useApiClient();

  // Carregar dados da API ou AsyncStorage
  useEffect(() => {
    if (isSignedIn && userId) {
      loadLivesFromAPI();
    } else {
      loadLivesFromStorage();
    }
  }, [isSignedIn, userId]);

  // Auto-regeneração de vidas e sincronização com API
  useEffect(() => {
    if (!isLoaded) return;

    const checkRegeneration = () => {
      const now = new Date();
      const lastRegen = new Date(userLives.lastRegeneration);
      const hoursSinceLastRegen =
        (now.getTime() - lastRegen.getTime()) / (1000 * 60 * 60);

      if (
        hoursSinceLastRegen >= DEFAULT_LIVES_CONFIG.regenerationIntervalHours
      ) {
        regenerateLives();
      }
    };

    const syncWithAPI = async () => {
      if (isSignedIn && userId) {
        try {
          const apiLives = await apiClient.getUserLives();
          // Atualizar apenas se houver diferença significativa
          if (apiLives.remainingLives !== userLives.currentLives) {
            setUserLives((prev) => ({
              ...prev,
              currentLives: apiLives.remainingLives,
              maxLives: apiLives.totalLives,
            }));
          }
        } catch (error) {
          console.error("Erro na sincronização com API:", error);
        }
      }
    };

    // Verificar regeneração imediatamente
    checkRegeneration();

    // Verificar regeneração a cada minuto
    const regenInterval = setInterval(checkRegeneration, 60000);

    // Sincronizar com API a cada 5 minutos (apenas se autenticado)
    const syncInterval = setInterval(syncWithAPI, 300000);

    return () => {
      clearInterval(regenInterval);
      clearInterval(syncInterval);
    };
  }, [userLives.lastRegeneration, isLoaded, isSignedIn, userId]);

  // Salvar no AsyncStorage sempre que houver mudanças
  useEffect(() => {
    if (isLoaded) {
      saveLivesToStorage();
    }
  }, [userLives, isLoaded]);

  const loadLivesFromAPI = async () => {
    try {
      setError(null);
      const apiLives = await apiClient.getUserLives();

      // Converter dados da API para o formato local
      const convertedLives: UserLives = {
        currentLives: apiLives.remainingLives,
        maxLives: apiLives.totalLives,
        lastRegeneration: apiLives.lastDamageAt
          ? new Date(apiLives.lastDamageAt)
          : new Date(),
        livesHistory: [], // Histórico será mantido localmente por enquanto
      };

      setUserLives(convertedLives);
      // Salvar também no AsyncStorage como backup
      await saveLivesToStorage(convertedLives);
    } catch (error) {
      console.error("Erro ao carregar vidas da API:", error);
      setError("Erro ao carregar vidas da API");
      // Fallback para AsyncStorage
      await loadLivesFromStorage();
    } finally {
      setIsLoaded(true);
    }
  };

  const loadLivesFromStorage = async () => {
    try {
      const stored = await AsyncStorage.getItem(LIVES_STORAGE_KEY);
      if (stored) {
        const parsedLives = JSON.parse(stored);
        // Converter strings de data de volta para objetos Date
        parsedLives.lastRegeneration = new Date(parsedLives.lastRegeneration);
        parsedLives.livesHistory = parsedLives.livesHistory.map(
          (entry: any) => ({
            ...entry,
            timestamp: new Date(entry.timestamp),
          })
        );
        setUserLives(parsedLives);
      }
    } catch (error) {
      console.error("Erro ao carregar vidas:", error);
    } finally {
      setIsLoaded(true);
    }
  };

  const saveLivesToStorage = async (livesToSave?: UserLives) => {
    try {
      const lives = livesToSave || userLives;
      await AsyncStorage.setItem(LIVES_STORAGE_KEY, JSON.stringify(lives));
    } catch (error) {
      console.error("Erro ao salvar vidas:", error);
    }
  };

  const addHistoryEntry = (
    type: "lost" | "gained" | "regenerated",
    amount: number,
    reason: string,
    quizId?: number,
    courseId?: number
  ) => {
    const entry: LivesHistoryEntry = {
      id: Date.now().toString(),
      type,
      amount,
      reason,
      timestamp: new Date(),
      quizId,
      courseId,
    };

    setUserLives((prev) => ({
      ...prev,
      livesHistory: [entry, ...prev.livesHistory].slice(0, 50), // Manter apenas as últimas 50 entradas
    }));
  };

  const loseLives = async (
    amount: number,
    reason: string,
    quizId?: number,
    courseId?: number
  ) => {
    // Atualizar estado local imediatamente
    setUserLives((prev) => {
      const newLives = Math.max(0, prev.currentLives - amount);
      return {
        ...prev,
        currentLives: newLives,
      };
    });

    addHistoryEntry("lost", amount, reason, quizId, courseId);

    // Se o usuário estiver autenticado, sincronizar com a API
    if (isSignedIn && userId) {
      try {
        await apiClient.updateUserLives("reduce", { amount });
      } catch (error) {
        console.error("Erro ao atualizar vidas na API:", error);
        // Em caso de erro, manter apenas o estado local
      }
    }
  };

  const canAccessCourses = (): boolean => {
    return userLives.currentLives > 0;
  };

  const getTimeUntilNextRegeneration = (): number => {
    const now = new Date();
    const lastRegen = new Date(userLives.lastRegeneration);
    const nextRegen = new Date(
      lastRegen.getTime() +
        DEFAULT_LIVES_CONFIG.regenerationIntervalHours * 60 * 60 * 1000
    );
    return Math.max(0, nextRegen.getTime() - now.getTime());
  };

  const regenerateLives = () => {
    setUserLives((prev) => {
      const newLives = Math.min(
        prev.maxLives,
        prev.currentLives + DEFAULT_LIVES_CONFIG.livesPerRegeneration
      );
      const livesGained = newLives - prev.currentLives;

      if (livesGained > 0) {
        addHistoryEntry(
          "regenerated",
          livesGained,
          "Regeneração automática (24h)"
        );
      }

      return {
        ...prev,
        currentLives: newLives,
        lastRegeneration: new Date(),
      };
    });
  };

  const resetLives = () => {
    const initialLives = getInitialLives();
    setUserLives(initialLives);
    addHistoryEntry("gained", initialLives.currentLives, "Reset do sistema");
  };

  const contextValue: LivesContextType = {
    userLives,
    config: DEFAULT_LIVES_CONFIG,
    error,
    isLoaded,
    loseLives,
    canAccessCourses,
    getTimeUntilNextRegeneration,
    regenerateLives,
    resetLives,
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
    throw new Error("useLives deve ser usado dentro de um LivesProvider");
  }
  return context;
}
