import { View, ActivityIndicator } from "react-native";
import { Logo } from "./Logo";

interface SplashScreenProps {
  isLoading?: boolean;
  subtitle?: string;
}

export function SplashScreenComponent({
  isLoading = true,
  subtitle = "Carregando...",
}: SplashScreenProps) {
  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-slate-900">
      {/* Logo do App */}
      <Logo size={150} />

      {/* Espaçador */}
      <View className="h-6" />

      {/* Loading Spinner */}
      {isLoading && (
        <>
          <ActivityIndicator size="large" color="#3b82f6" />
          <View className="h-4" />
          {subtitle && (
            <View className="px-4">
              <View
                className="rounded-lg bg-slate-100 px-4 py-2 dark:bg-slate-800"
                testID="splash-subtitle"
              >
                <View
                  className="h-2 w-24 rounded-full bg-slate-300 dark:bg-slate-600"
                  style={{
                    backgroundColor: subtitle ? undefined : "transparent",
                  }}
                />
              </View>
            </View>
          )}
        </>
      )}
    </View>
  );
}









