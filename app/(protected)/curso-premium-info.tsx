import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CursoPremiumInfo() {
  const insets = useSafeAreaInsets();
  
  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="bg-card border-b border-border px-6 pb-6" style={{ paddingTop: insets.top + 12 }}>
        <View className="flex-row items-center mb-4">
          <Pressable onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#3b82f6" />
          </Pressable>
          <View className="flex-row items-center flex-1">
            <Ionicons name="star" size={24} color="#f59e0b" />
            <Text className="text-text-primary text-xl font-bold ml-2">
              Curso Premium
            </Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-6">
        <View className="mb-6">
          <Text className="text-text-secondary text-base leading-6 mb-6">
            Os cursos premium são cursos especiais que requerem que você atinja uma certa pontuação durante a semana para acessá-los.
          </Text>
          
          <View className="bg-background border border-border rounded-lg p-4 mb-6">
            <Text className="text-text-primary text-lg font-semibold mb-3">
              Como funciona?
            </Text>
            <View>
              <View className="flex-row items-start mb-3">
                <Text className="text-text-secondary text-base leading-6 flex-1">
                  • Complete aulas e exames para ganhar pontos
                </Text>
              </View>
              <View className="flex-row items-start mb-3">
                <Text className="text-text-secondary text-base leading-6 flex-1">
                  • Os pontos são contabilizados semanalmente
                </Text>
              </View>
              <View className="flex-row items-start mb-3">
                <Text className="text-text-secondary text-base leading-6 flex-1">
                  • Atingindo a pontuação necessária, você desbloqueia o curso premium
                </Text>
              </View>
              <View className="flex-row items-start">
                <Text className="text-text-secondary text-base leading-6 flex-1">
                  • Continue estudando para manter seu acesso!
                </Text>
              </View>
            </View>
          </View>

          <View className="bg-card border border-border rounded-lg p-4">
            <Text className="text-text-primary text-lg font-semibold mb-3">
              Dicas para ganhar pontos
            </Text>
            <View>
              <View className="flex-row items-start mb-3">
                <View className="mr-2 mt-1">
                  <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                </View>
                <Text className="text-text-secondary text-base leading-6 flex-1">
                  Complete todas as aulas do curso para ganhar pontos
                </Text>
              </View>
              <View className="flex-row items-start mb-3">
                <View className="mr-2 mt-1">
                  <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                </View>
                <Text className="text-text-secondary text-base leading-6 flex-1">
                  Faça os exames e acerte as questões para ganhar mais pontos
                </Text>
              </View>
              <View className="flex-row items-start">
                <View className="mr-2 mt-1">
                  <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                </View>
                <Text className="text-text-secondary text-base leading-6 flex-1">
                  Conclua cursos para receber certificados e pontos adicionais
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

