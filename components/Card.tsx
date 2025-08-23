import React from "react";
import { View } from "react-native";

interface CardProps {
  children?: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
  content?: React.ReactNode;
  footer?: React.ReactNode;
}

export default function Card({
  children,
  className = "",
  header,
  content,
  footer,
}: CardProps) {
  return (
    <View className={`bg-card border border-border rounded-xl  ${className}`}>
      {header && (
        <View className="px-4 py-3 border-b border-border">{header}</View>
      )}

      {content && <View className="px-4 py-3">{content}</View>}

      {children && <View className="px-4 py-3">{children}</View>}

      {footer && (
        <View className="px-4 h-16 border-t border-border items-center justify-center">
          {footer}
        </View>
      )}
    </View>
  );
}
