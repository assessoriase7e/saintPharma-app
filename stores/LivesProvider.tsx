import { useAuth } from "@clerk/clerk-expo";
import { useEffect } from "react";
import { httpClient } from "../services";
import { DEFAULT_LIVES_CONFIG } from "../types/lives";
import { useLivesStore } from "./livesStore";

interface LivesProviderProps {
  children: React.ReactNode;
}

export function LivesProvider({ children }: LivesProviderProps) {
  const { userId, isSignedIn } = useAuth();
  const { userLives, isLoaded, initialize, setUserLives, saveLivesToStorage } =
    useLivesStore();

  // Inicializar quando o usuário mudar
  useEffect(() => {
    if (isSignedIn && userId) {
      initialize();
    } else {
      initialize();
    }
  }, [isSignedIn, userId, initialize]);

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
        useLivesStore.getState().regenerateLives();
      }
    };

    const syncWithAPI = async () => {
      if (isSignedIn && userId) {
        try {
          const apiLives = await httpClient.get("/api/user/lives");
          // Atualizar apenas se houver diferença significativa
          if (apiLives.remainingLives !== userLives.currentLives) {
            setUserLives({
              ...userLives,
              currentLives: apiLives.remainingLives,
              maxLives: apiLives.totalLives,
            });
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
  }, [userLives.lastRegeneration, isLoaded, isSignedIn, userId, setUserLives]);

  // Salvar no AsyncStorage sempre que houver mudanças
  useEffect(() => {
    if (isLoaded) {
      saveLivesToStorage();
    }
  }, [userLives, isLoaded, saveLivesToStorage]);

  return <>{children}</>;
}
