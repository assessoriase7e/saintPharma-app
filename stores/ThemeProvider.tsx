import { useColorScheme } from "nativewind";
import React, { useEffect } from "react";
import { View } from "react-native";
import { themes } from "@/utils/themes";
import { useThemeStore } from "./themeStore";

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { theme, themeMode, loadTheme } = useThemeStore();
  const { colorScheme } = useColorScheme();

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
    }
  }, [colorScheme, themeMode, theme]);

  return (
    <View style={themes[theme]} className="flex-1">
      {children}
    </View>
  );
}
