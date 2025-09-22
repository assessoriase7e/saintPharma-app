import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { ThemeToggle } from "../components/ThemeToggle";
import { useApiClient } from "../services/api";
import { UserInfoResponse } from "../types/api";

export default function Perfil() {
  const [userInfo, setUserInfo] = useState<UserInfoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userId } = useAuth();
  const apiClient = useApiClient();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        // Definir o userId do usuário logado
        if (userId) {
          apiClient.setUserId(userId);
        } else {
          throw new Error("Usuário não autenticado");
        }

        const response = await apiClient.getUserInfo();
        console.log(response);
        setUserInfo(response);
      } catch (err) {
        console.error("Erro ao carregar perfil do usuário:", err);
        const errorMessage = err instanceof Error ? err.message : "Erro inesperado ao carregar dados do perfil. Tente novamente.";
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
    <ScrollView className="flex-1 bg-background">
      <View className="pt-12 px-4 pb-4">
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
            {userInfo?.name}
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
                <Text className="text-text-primary">
                  {userInfo?.email}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Configurações */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-text-primary mb-4">
            Configurações
          </Text>

          <ThemeToggle />

          <View className="bg-card border border-border rounded-lg p-3 flex-row items-center justify-between mt-4">
            <View className="flex-row items-center">
              <Ionicons
                name="notifications"
                size={20}
                color="#6b7280"
                style={{ marginRight: 12 }}
              />
              <Text className="text-text-primary font-medium">
                Notificações
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </View>

          <View className="bg-card border border-border rounded-lg p-3 flex-row items-center justify-between mt-4">
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
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
