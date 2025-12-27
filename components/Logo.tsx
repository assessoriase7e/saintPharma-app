import { Image, ImageProps, View } from "react-native";

interface LogoProps {
  size?: number;
  className?: string;
  style?: ImageProps["style"];
}

export function Logo({ size = 120, className, style }: LogoProps) {
  return (
    <View className={`items-center justify-center ${className || ""}`}>
      <Image
        source={require("@/assets/images/icon.png")}
        style={[
          {
            width: size,
            height: size,
            resizeMode: "contain",
          },
          style,
        ]}
      />
    </View>
  );
}












