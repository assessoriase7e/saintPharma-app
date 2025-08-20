import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Badge from './Badge';
import Card from './Card';

interface RankingUserCardProps {
  position: number;
  name: string;
  points: number;
  completedCourses: number;
  badge: string;
  avatar: string;
}

export default function RankingUserCard({
  position,
  name,
  points,
  completedCourses,
  badge,
  avatar
}: RankingUserCardProps) {
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
      content={
        <View className="flex-row items-center">
          {/* Posição à esquerda */}
          <View className="flex-row items-center mr-4">
            <View className="w-12 h-12 rounded-full bg-background border border-border items-center justify-center mr-2">
              <Text className="text-lg font-bold text-text-primary">
                {position}
              </Text>
            </View>
            <Ionicons
              name={posicaoIcon.icon as any}
              size={20}
              color={posicaoIcon.color}
            />
          </View>

          {/* Informações à direita, uma abaixo da outra */}
          <View className="flex-1">
            <Text className="text-lg font-semibold text-text-primary mb-1">
              {name}
            </Text>
            <Text className="text-sm text-text-secondary mb-2">
              {completedCourses} cursos completos
            </Text>
            <View className="flex-row items-center">
              <Text className="text-xl font-bold text-primary mr-1">
                {points.toLocaleString()}
              </Text>
              <Text className="text-xs text-text-secondary">pontos</Text>
            </View>
          </View>
        </View>
      }
      footer={
         <Badge badge={badge} size="small" />
       }
    />
  );
}