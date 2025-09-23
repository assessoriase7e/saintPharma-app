import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

type ThemeMode = "light" | "dark" | "system";

interface ThemeStore {
  theme: "light" | "dark";
  themeMode: ThemeMode;
  setTheme: (mode: ThemeMode) => Promise<void>;
  loadTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: "light",
  themeMode: "system",
  setTheme: async (mode: ThemeMode) => {
    set({ themeMode: mode });
    try {
      await AsyncStorage.setItem("theme-preference", mode);
    } catch (error) {
      console.log("Erro ao salvar tema:", error);
    }
  },
  loadTheme: async () => {
    try {
      const savedTheme = await AsyncStorage.getItem("theme-preference");
      if (savedTheme) {
        set({ themeMode: savedTheme as ThemeMode });
      }
    } catch (error) {
      console.log("Erro ao carregar tema:", error);
    }
  },
}));

// Hook de compatibilidade para manter a mesma API
export const useTheme = () => {
  const { theme, themeMode, setTheme } = useThemeStore();
  return { theme, themeMode, setTheme };
};
