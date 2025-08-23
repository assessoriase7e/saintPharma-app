import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  label: string;
  value: string;
  subtitle: string;
  subtitleColor?: string;
}

export default function StatCard({
  icon,
  iconColor,
  label,
  value,
  subtitle,
  subtitleColor = "text-text-secondary",
}: StatCardProps) {
  return (
    <View className="bg-card border border-border rounded-lg p-4 flex-1 ">
      <View className="flex-row items-center">
        <Ionicons name={icon} size={20} color={iconColor} />
        <Text className="text-sm text-text-secondary ml-2">{label}</Text>
      </View>
      <Text className="text-2xl font-bold text-text-primary">{value}</Text>
      <Text className={`text-xs ${subtitleColor}`}>{subtitle}</Text>
    </View>
  );
}
