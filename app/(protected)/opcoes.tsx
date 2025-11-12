import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Avatar from "@/components/Avatar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/stores";

export default function OpcoesScreen() {
  const { theme } = useTheme();
  const { signOut } = useAuth();
  const isDark = theme === "dark";

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <View className="px-4 pb-6 pt-4">
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <Ionicons
            name="arrow-back"
            size={24}
            color={isDark ? "#f3f4f6" : "#374151"}
          />
        </TouchableOpacity>

        <Text className="text-3xl font-bold text-text-primary mb-2">
          Opções
        </Text>
      </View>

      {/* Content */}
      <View className="flex-1 px-4 py-6">
        {/* Profile Section */}
        <View className="bg-card border border-border rounded-xl p-6 mb-6 ">
          <View className="flex-row items-center mb-4">
            <Avatar size="large" name="João Silva" showBorder={true} />
            <View className="ml-4 flex-1">
              <Text className="text-xl font-semibold text-text-primary">
                Dr. João Silva
              </Text>
              <Text className="text-sm text-text-secondary">
                Farmacêutico Responsável
              </Text>
            </View>
          </View>
        </View>

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
