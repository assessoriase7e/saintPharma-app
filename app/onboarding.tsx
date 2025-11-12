import { useAuth } from "@clerk/clerk-expo";
import { Redirect, useRootNavigationState } from "expo-router";
import { ActivityIndicator, Text, View } from "react-native";
import { OnboardingForm } from "@/components/OnboardingForm";
import { useOnboardingCheck } from "@/hooks/useOnboardingCheck";

/**
 * Página de onboarding.
 * 
 * Esta página permite que usuários completem seu perfil.
 * Se o usuário já completou o onboarding, redireciona automaticamente para home.
 * 
 * A verificação de onboarding é feita pelo hook useOnboardingCheck,
 * evitando duplicação de lógica.
 */
export default function OnboardingPage() {
  const { userId, isLoaded } = useAuth();
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

  // Se não estiver logado, permitir acesso ao formulário (pode ser usado para cadastro)
  if (!userId) {
    return <OnboardingForm />;
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

  // Se o onboarding já estiver completo, redirecionar para home
  // O index.tsx vai decidir o destino final (pode redirecionar para onboarding novamente
  // se houver alguma inconsistência, mas isso é raro)
  if (!needsOnboarding) {
    return <Redirect href="/" />;
  }

  // Usuário precisa completar onboarding, mostrar formulário
  return <OnboardingForm />;
}
