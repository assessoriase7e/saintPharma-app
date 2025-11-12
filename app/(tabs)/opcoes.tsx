import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Redirect } from "expo-router";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/stores";

export default function OpcoesScreen() {
  const { isSignedIn, isLoaded, signOut } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Aguardar Clerk carregar
  if (!isLoaded) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-text-secondary mt-4">Carregando...</Text>
      </View>
    );
  }

  // Se não estiver logado, redirecionar para login
  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <View className="px-4 pb-6 pt-4">
        <Text className="text-3xl font-bold text-text-primary mb-2">
          Opções
        </Text>
      </View>

      {/* Content */}
      <View className="flex-1 px-4 py-6">
        {/* Options */}
        <View className="bg-card border border-border rounded-xl  overflow-hidden">
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

          {/* Sign Out */}
          <TouchableOpacity
            onPress={async () => await signOut()}
            className="px-6 py-4 active:opacity-70"
          >
            <View className="flex-row items-center">
              <Ionicons name="log-out-outline" size={24} color="#ef4444" />
              <Text className="ml-3 text-base font-medium text-red-500">
                Sair da conta
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
