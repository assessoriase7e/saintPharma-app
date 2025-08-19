import React from "react";
import { Pressable, Text } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

export function ThemeToggle() {
  const { theme, themeMode, setTheme } = useTheme();

  const toggleTheme = () => {
    if (themeMode === "light") {
      setTheme("dark");
    } else if (themeMode === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  const getThemeLabel = () => {
    switch (themeMode) {
      case "light":
        return "☀️ Claro";
      case "dark":
        return "🌙 Escuro";
      case "system":
        return "📱 Sistema";
    }
  };

  return (
    <Pressable
      onPress={toggleTheme}
      className="bg-card border border-border rounded-lg p-3 flex-row items-center justify-between"
    >
      <Text className="text-text-primary font-medium">Tema</Text>
      <Text className="text-text-secondary">{getThemeLabel()}</Text>
    </Pressable>
  );
}
