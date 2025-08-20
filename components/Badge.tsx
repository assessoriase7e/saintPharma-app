import React from 'react';
import { View, Text } from 'react-native';

interface BadgeProps {
  badge: string;
  size?: 'small' | 'normal';
}

export default function Badge({ badge, size = 'normal' }: BadgeProps) {
  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case "Especialista":
        return {
          bg: "bg-purple-100 dark:bg-purple-900",
          text: "text-purple-800 dark:text-purple-200",
        };
      case "Avançado":
        return {
          bg: "bg-blue-100 dark:bg-blue-900",
          text: "text-blue-800 dark:text-blue-200",
        };
      case "Intermediário":
        return {
          bg: "bg-green-100 dark:bg-green-900",
          text: "text-green-800 dark:text-green-200",
        };
      default:
        return {
          bg: "bg-card border border-border",
          text: "text-text-secondary",
        };
    }
  };

  const badgeColors = getBadgeColor(badge);

  const sizeClasses = size === 'small' 
    ? 'px-1.5 py-0.5' 
    : 'px-2 py-1';
  
  const textSizeClass = size === 'small' 
    ? 'text-xs' 
    : 'text-xs';

  return (
    <View className={`${sizeClasses} rounded-full ${badgeColors.bg}`}>
      <Text className={`${textSizeClass} font-medium ${badgeColors.text}`}>
        {badge}
      </Text>
    </View>
  );
}