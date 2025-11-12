import React from "react";
import { Image, ImageSourcePropType, Text, View } from "react-native";
import { useTheme } from "@/stores";

interface AvatarProps {
  size?: "small" | "medium" | "large";
  source?: ImageSourcePropType;
  name?: string;
  showBorder?: boolean;
}

const sizeConfig = {
  small: {
    container: "w-8 h-8",
    text: "text-xs",
  },
  medium: {
    container: "w-12 h-12",
    text: "text-sm",
  },
  large: {
    container: "w-20 h-20",
    text: "text-lg",
  },
};

export default function Avatar({
  size = "medium",
  source,
  name = "User",
  showBorder = true,
}: AvatarProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const config = sizeConfig[size];
  const initials = name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const borderClass = showBorder ? "border-2 border-border" : "";

  if (source) {
    return (
      <View
        className={`${config.container} rounded-full overflow-hidden ${borderClass}`}
      >
        <Image source={source} className="w-full h-full" resizeMode="cover" />
      </View>
    );
  }

  return (
    <View
      className={`${config.container} rounded-full ${borderClass} items-center justify-center`}
      style={{
        backgroundColor: isDark ? "#3b82f6" : "#60a5fa",
      }}
    >
      <Text className={`${config.text} font-semibold text-white`}>
        {initials}
      </Text>
    </View>
  );
}
