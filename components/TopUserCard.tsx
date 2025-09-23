import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import Badge from "./Badge";
import Card from "./Card";

interface TopUserCardProps {
  position: number;
  name: string;
  points: number;
  completedCourses: number;
  avatar: string;
  badge?: string;
}

export default function TopUserCard({
  position,
  name,
  points,
  completedCourses,
  avatar,
  badge,
}: TopUserCardProps) {
  const getPosicaoIcon = (posicao: number) => {
    switch (posicao) {
      case 1:
        return { icon: "trophy", color: "#FFD700" };
      case 2:
        return { icon: "medal", color: "#C0C0C0" };
      case 3:
        return { icon: "medal", color: "#CD7F32" };
      default:
        return { icon: "ribbon", color: "#6B7280" };
    }
  };

  const posicaoIcon = getPosicaoIcon(position);

  return (
    <Card
      className="flex-1 mx-1"
      content={
        <View className="items-center h-[150]">
          <View className="relative mb-3">
            <View className="w-12 h-12 rounded-full bg-background border border-border items-center justify-center">
              <Text className="text-lg font-bold text-text-primary">
                {position}
              </Text>
            </View>
            <View className="absolute -top-2 -right-2">
              <Ionicons
                name={posicaoIcon.icon as any}
                size={20}
                color={posicaoIcon.color}
              />
            </View>
          </View>
          <Text className="text-sm font-semibold text-text-primary text-center mb-1">
            {name || "Usuário"}
          </Text>
          <Text className="text-lg font-bold text-primary mb-1">
            {(points || 0).toLocaleString()}
          </Text>
          <Text className="text-xs text-text-secondary">
            {completedCourses || 0} cursos
          </Text>
        </View>
      }
      footer={badge && <Badge badge={badge} size="small" />}
    />
  );
}
