import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Avatar from "../components/Avatar";
import { ThemeToggle } from "../components/ThemeToggle";
import { useTheme } from "../contexts/ThemeContext";

export default function OpcoesScreen() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className={`pt-12 px-4 pb-6`}>
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <Ionicons
            name="arrow-back"
            size={24}
            color={isDark ? "#f3f4f6" : "#374151"}
          />
        </TouchableOpacity>

        <Text className="text-3xl font-bold text-text-primary mb-2">
          Opções
        </Text>
      </View>

      {/* Content */}
      <View className="flex-1 px-4 py-6">
        {/* Profile Section */}
        <View className="bg-card border border-border rounded-xl p-6 mb-6 shadow-sm">
          <View className="flex-row items-center mb-4">
            <Avatar size="large" name="João Silva" showBorder={true} />
            <View className="ml-4 flex-1">
              <Text className="text-xl font-semibold text-text-primary">
                Dr. João Silva
              </Text>
              <Text className="text-sm text-text-secondary">
                Farmacêutico Responsável
              </Text>
            </View>
          </View>
        </View>

        {/* Options */}
        <View className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          {/* Theme Toggle */}
          <View className="px-6 py-4 border-b border-border">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons
                  name="color-palette-outline"
                  size={24}
                  color={isDark ? "#9ca3af" : "#6b7280"}
                />
                <Text className="ml-3 text-base font-medium text-text-primary">
                  Tema
                </Text>
              </View>
              <ThemeToggle />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
