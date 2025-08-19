import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "nativewind";
import React, { useEffect } from "react";
import { View } from "react-native";
import { create } from "zustand";
import { themes } from "../utils/themes";

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

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, themeMode, loadTheme } = useThemeStore();
  const { colorScheme, setColorScheme } = useColorScheme();

  // Carregar preferência salva na inicialização
  useEffect(() => {
    loadTheme();
  }, [loadTheme]);

  // Atualizar tema baseado no modo e colorScheme
  useEffect(() => {
    let newTheme: "light" | "dark";
    if (themeMode === "system") {
      newTheme = colorScheme === "dark" ? "dark" : "light";
    } else {
      newTheme = themeMode;
    }

    if (theme !== newTheme) {
      useThemeStore.setState({ theme: newTheme });
      setColorScheme(newTheme);
    }
  }, [colorScheme, themeMode, theme, setColorScheme]);

  return (
    <View style={themes[theme]} className="flex-1">
      {children}
    </View>
  );
}

// Hook de compatibilidade para manter a mesma API
export const useTheme = () => {
  const { theme, themeMode, setTheme } = useThemeStore();
  return { theme, themeMode, setTheme };
};
