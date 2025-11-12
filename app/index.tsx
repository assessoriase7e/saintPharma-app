import { useAuth } from "@clerk/clerk-expo";
import { Redirect, useRootNavigationState } from "expo-router";
import { ActivityIndicator, Text, View } from "react-native";
import { useOnboardingCheck } from "@/hooks/useOnboardingCheck";

/**
 * Rota raiz que decide o redirecionamento inicial baseado no estado de autenticação e onboarding.
 * Esta rota é a primeira a ser renderizada e evita que o ProtectedLayout seja renderizado
 * para usuários não autenticados.
 */
export default function Index() {
  const { isSignedIn, isLoaded } = useAuth();
  const { isLoading, needsOnboarding } = useOnboardingCheck();
  const navigationState = useRootNavigationState();

  // Aguardar o sistema de navegação estar pronto
  if (!navigationState?.key) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-text-secondary mt-2">
          Carregando aplicação...
        </Text>
      </View>
    );
  }

  // Aguardar Clerk carregar
  if (!isLoaded) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-text-secondary mt-2">
          Verificando autenticação...
        </Text>
      </View>
    );
  }

  // Se não estiver logado, redirecionar para login
  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  // Aguardar verificação de onboarding
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-text-secondary mt-2">
          Verificando perfil...
        </Text>
      </View>
    );
  }

  // Se precisar de onboarding, redirecionar
  if (needsOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  // Tudo ok - redirecionar para a área protegida
  // Usamos um redirect para forçar o Expo Router a renderizar (protected)/index
  // que mapeia para "/" quando dentro do grupo protegido
  return <Redirect href="/" />;
}

