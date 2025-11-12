import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Linking, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { userService } from "@/services";
import { UserInfoResponse } from "@/types/api";

export default function Perfil() {
  const { isSignedIn, isLoaded, userId } = useAuth();

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

  const [userInfo, setUserInfo] = useState<UserInfoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!userId) {
          throw new Error("Usuário não autenticado");
        }

        const response = await userService.getUser(userId);
        console.log(response);
        setUserInfo({
          ...response.user,
          lives: response.user.lives || 0,
          points: response.user.points || 0,
          createdAt: response.user.createdAt || new Date().toISOString(),
          updatedAt: response.user.updatedAt || new Date().toISOString(),
        });
      } catch (err) {
        console.error("Erro ao carregar perfil do usuário:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Erro inesperado ao carregar dados do perfil. Tente novamente.";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  if (loading) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-text-secondary mt-4">Carregando perfil...</Text>
      </View>
    );
  }

  if (error && !userInfo) {
    return (
      <View className="flex-1 bg-background justify-center items-center px-4">
        <Ionicons name="alert-circle" size={64} color="#ef4444" />
        <Text className="text-text-primary text-xl font-bold mt-4 text-center">
          Erro ao carregar perfil
        </Text>
        <Text className="text-text-secondary mt-2 text-center">{error}</Text>
        <Text className="text-text-secondary mt-2 text-center">
          Verifique sua conexão e tente novamente.
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView className="flex-1">
        <View className="px-4 pb-4 pt-4">
        {/* Título da Página */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-text-primary mb-2">
            Perfil
          </Text>
          {error && (
            <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2">
              <Text className="text-yellow-800 text-sm">{error}</Text>
            </View>
          )}
        </View>

        {/* Header do Perfil */}
        <View className="items-center mb-8">
          <View className="w-24 h-24 bg-primary rounded-full items-center justify-center mb-4">
            <Ionicons name="person" size={48} color="white" />
          </View>
          <Text className="text-2xl font-bold text-text-primary">
            {userInfo?.firstName && userInfo?.lastName
              ? `${userInfo.firstName} ${userInfo.lastName}`
              : userInfo?.firstName || userInfo?.lastName || userInfo?.name || "Usuário"}
          </Text>
          <Text className="text-text-secondary">{userInfo?.email}</Text>

          {/* Mostrar pontos e vidas */}
          <View className="flex-row mt-4 space-x-4">
            <View className="bg-card border border-border rounded-lg px-4 py-2 items-center">
              <Ionicons name="star" size={20} color="#fbbf24" />
              <Text className="text-text-primary font-semibold">
                {userInfo?.points}
              </Text>
              <Text className="text-text-secondary text-xs">Pontos</Text>
            </View>
            <View className="bg-card border border-border rounded-lg px-4 py-2 items-center">
              <Ionicons name="heart" size={20} color="#ef4444" />
              <Text className="text-text-primary font-semibold">
                {userInfo?.lives}
              </Text>
              <Text className="text-text-secondary text-xs">Vidas</Text>
            </View>
          </View>
        </View>

        {/* Informações do Perfil */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-text-primary mb-4">
            Informações Pessoais
          </Text>

          <View className="bg-card border border-border rounded-lg p-4 mb-4">
            <View className="flex-row items-center mb-3">
              <Ionicons
                name="mail"
                size={20}
                color="#6b7280"
                style={{ marginRight: 12 }}
              />
              <View>
                <Text className="text-text-secondary text-sm">Email</Text>
                <Text className="text-text-primary">{userInfo?.email}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Configurações */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-text-primary mb-4">
            Configurações
          </Text>

          <TouchableOpacity
            onPress={async () => {
              try {
                const baseURL = process.env.API_BASE_URL;
                
                if (!baseURL) {
                  Alert.alert("Erro", "URL base da API não configurada");
                  return;
                }

                // Remover /api do final da URL se existir
                const serverUrl = baseURL.replace(/\/api\/?$/, "");
                const privacyUrl = `${serverUrl}/privacy-policy`;

                console.log("🔗 [Perfil] Abrindo política de privacidade:", privacyUrl);

                const canOpen = await Linking.canOpenURL(privacyUrl);
                if (!canOpen) {
                  Alert.alert("Erro", "Não foi possível abrir a política de privacidade");
                  return;
                }

                await Linking.openURL(privacyUrl);
              } catch (err) {
                console.error("❌ [Perfil] Erro ao abrir URL:", err);
                Alert.alert(
                  "Erro",
                  err instanceof Error
                    ? err.message
                    : "Não foi possível abrir a política de privacidade. Tente novamente."
                );
              }
            }}
            className="bg-card border border-border rounded-lg p-3 flex-row items-center justify-between mt-4 active:opacity-70"
          >
            <View className="flex-row items-center">
              <Ionicons
                name="shield-checkmark"
                size={20}
                color="#6b7280"
                style={{ marginRight: 12 }}
              />
              <Text className="text-text-primary font-medium">Privacidade</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}
