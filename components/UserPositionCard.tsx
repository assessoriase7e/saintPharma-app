import React from "react";
import { Text, View } from "react-native";
import Card from "./Card";

interface UserPositionCardProps {
  position: number;
  points: number;
  badge: string;
}

export default function UserPositionCard({
  position,
  points,
  badge,
}: UserPositionCardProps) {
  return (
    <Card
      className="mb-6"
      content={
        <View className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4">
          <View className="flex-row items-center">
            <View className="bg-white/20 rounded-full w-12 h-12 items-center justify-center mr-4">
              <Text className="text-white font-bold text-lg">
                {position || 0}
              </Text>
            </View>
            <View>
              <Text className="text-white font-semibold text-lg">
                Sua Posição
              </Text>
              <Text className="text-white/80 text-sm">
                {position || 0}º lugar • {(points || 0).toLocaleString()} pontos
              </Text>
            </View>
          </View>
        </View>
      }
      footer={
        <View className="bg-primary/20 rounded-full px-3 py-1">
          <Text className="text-primary font-medium text-sm">
            {badge || "Iniciante"}
          </Text>
        </View>
      }
    />
  );
}
