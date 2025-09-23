import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { httpClient } from "../services";
import {
  DEFAULT_LIVES_CONFIG,
  LivesHistoryEntry,
  UserLives,
} from "../types/lives";

const LIVES_STORAGE_KEY = "@saintpharma_user_lives";

interface LivesStore {
  // Estado
  userLives: UserLives;
  isLoaded: boolean;
  error: string | null;

  // Ações
  setUserLives: (lives: UserLives) => void;
  setIsLoaded: (loaded: boolean) => void;
  setError: (error: string | null) => void;

  // Métodos principais
  loadLivesFromAPI: () => Promise<void>;
  loadLivesFromStorage: () => Promise<void>;
  saveLivesToStorage: (livesToSave?: UserLives) => Promise<void>;
  loseLives: (
    amount: number,
    reason: string,
    quizId?: number,
    courseId?: number
  ) => Promise<void>;
  regenerateLives: () => void;
  resetLives: () => void;
  addHistoryEntry: (
    type: "lost" | "gained" | "regenerated",
    amount: number,
    reason: string,
    quizId?: number,
    courseId?: number
  ) => void;

  // Métodos utilitários
  canAccessCourses: () => boolean;
  getTimeUntilNextRegeneration: () => number;

  // Inicialização
  initialize: () => Promise<void>;
}

const getInitialLives = (): UserLives => ({
  currentLives: DEFAULT_LIVES_CONFIG.maxLives,
  maxLives: DEFAULT_LIVES_CONFIG.maxLives,
  lastRegeneration: new Date(),
  livesHistory: [],
});

export const useLivesStore = create<LivesStore>((set, get) => ({
  // Estado inicial
  userLives: getInitialLives(),
  isLoaded: false,
  error: null,

  // Setters básicos
  setUserLives: (lives) => set({ userLives: lives }),
  setIsLoaded: (loaded) => set({ isLoaded: loaded }),
  setError: (error) => set({ error }),

  // Carregar vidas da API
  loadLivesFromAPI: async () => {
    try {
      set({ error: null });
      const apiLives = await httpClient.get("/api/user/lives");

      // Converter dados da API para o formato local
      const convertedLives: UserLives = {
        currentLives: apiLives.remainingLives,
        maxLives: apiLives.totalLives,
        lastRegeneration: apiLives.lastDamageAt
          ? new Date(apiLives.lastDamageAt)
          : new Date(),
        livesHistory: [], // Histórico será mantido localmente por enquanto
      };

      set({ userLives: convertedLives });
      // Salvar também no AsyncStorage como backup
      await get().saveLivesToStorage(convertedLives);
    } catch (error) {
      console.error("Erro ao carregar vidas da API:", error);
      set({ error: "Erro ao carregar vidas da API" });
      // Fallback para AsyncStorage
      await get().loadLivesFromStorage();
    } finally {
      set({ isLoaded: true });
    }
  },

  // Carregar vidas do AsyncStorage
  loadLivesFromStorage: async () => {
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
        set({ userLives: parsedLives });
      }
    } catch (error) {
      console.error("Erro ao carregar vidas:", error);
    } finally {
      set({ isLoaded: true });
    }
  },

  // Salvar vidas no AsyncStorage
  saveLivesToStorage: async (livesToSave?: UserLives) => {
    try {
      const { userLives } = get();
      const lives = livesToSave || userLives;
      await AsyncStorage.setItem(LIVES_STORAGE_KEY, JSON.stringify(lives));
    } catch (error) {
      console.error("Erro ao salvar vidas:", error);
    }
  },

  // Adicionar entrada no histórico
  addHistoryEntry: (type, amount, reason, quizId?, courseId?) => {
    const entry: LivesHistoryEntry = {
      id: Date.now().toString(),
      type,
      amount,
      reason,
      timestamp: new Date(),
      quizId,
      courseId,
    };

    set((state) => ({
      userLives: {
        ...state.userLives,
        livesHistory: [entry, ...state.userLives.livesHistory].slice(0, 50), // Manter apenas as últimas 50 entradas
      },
    }));
  },

  // Perder vidas
  loseLives: async (amount, reason, quizId?, courseId?) => {
    const { userLives } = get();

    // Atualizar estado local imediatamente
    set((state) => ({
      userLives: {
        ...state.userLives,
        currentLives: Math.max(0, state.userLives.currentLives - amount),
      },
    }));

    get().addHistoryEntry("lost", amount, reason, quizId, courseId);

    // Se o usuário estiver autenticado, sincronizar com a API
    try {
      // Nota: A verificação de autenticação deve ser feita no componente que chama este método
      await httpClient.delete("/api/user/lives", {
        data: {
          amount,
        },
      });
    } catch (error) {
      console.error("Erro ao atualizar vidas na API:", error);
      // Em caso de erro, manter apenas o estado local
    }
  },

  // Verificar se pode acessar cursos
  canAccessCourses: () => {
    const { userLives } = get();
    return userLives.currentLives > 0;
  },

  // Obter tempo até próxima regeneração
  getTimeUntilNextRegeneration: () => {
    const { userLives } = get();
    const now = new Date();
    const lastRegen = new Date(userLives.lastRegeneration);
    const nextRegen = new Date(
      lastRegen.getTime() +
        DEFAULT_LIVES_CONFIG.regenerationIntervalHours * 60 * 60 * 1000
    );
    return Math.max(0, nextRegen.getTime() - now.getTime());
  },

  // Regenerar vidas
  regenerateLives: () => {
    set((state) => {
      const newLives = Math.min(
        state.userLives.maxLives,
        state.userLives.currentLives + DEFAULT_LIVES_CONFIG.livesPerRegeneration
      );
      const livesGained = newLives - state.userLives.currentLives;

      if (livesGained > 0) {
        get().addHistoryEntry(
          "regenerated",
          livesGained,
          "Regeneração automática (24h)"
        );
      }

      return {
        userLives: {
          ...state.userLives,
          currentLives: newLives,
          lastRegeneration: new Date(),
        },
      };
    });
  },

  // Resetar vidas
  resetLives: () => {
    const initialLives = getInitialLives();
    set({ userLives: initialLives });
    get().addHistoryEntry(
      "gained",
      initialLives.currentLives,
      "Reset do sistema"
    );
  },

  // Inicialização
  initialize: async () => {
    // Nota: A verificação de autenticação deve ser feita no componente que chama este método
    // Por padrão, tenta carregar da API primeiro, depois do storage
    try {
      await get().loadLivesFromAPI();
    } catch (error) {
      console.log("Falha ao carregar da API, tentando storage...");
      await get().loadLivesFromStorage();
    }
  },
}));

// Hook para usar o store com a mesma API do contexto anterior
export const useLives = () => {
  const store = useLivesStore();

  return {
    userLives: store.userLives,
    config: DEFAULT_LIVES_CONFIG,
    error: store.error,
    isLoaded: store.isLoaded,
    loseLives: store.loseLives,
    canAccessCourses: store.canAccessCourses,
    getTimeUntilNextRegeneration: store.getTimeUntilNextRegeneration,
    regenerateLives: store.regenerateLives,
    resetLives: store.resetLives,
  };
};
