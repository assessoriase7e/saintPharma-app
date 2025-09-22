import { useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useOnboardingCheck } from "../hooks/useOnboardingCheck";

interface OnboardingGuardWrapperProps {
  children: React.ReactNode;
}

export function OnboardingGuardWrapper({
  children,
}: OnboardingGuardWrapperProps) {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const { isLoading, needsOnboarding, error } = useOnboardingCheck();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      // Se não estiver logado, redirecionar para login
      router.replace("/(auth)/sign-in");
      return;
    }

    // Marcar que já verificou
    setHasChecked(true);
  }, [isLoaded, isSignedIn, router]);

  // Mostrar loading enquanto verifica autenticação
  if (!isLoaded || !hasChecked) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-text-secondary mt-2">
          Verificando autenticação...
        </Text>
      </View>
    );
  }

  // Se não estiver logado, não renderizar nada (já redirecionou)
  if (!isSignedIn) {
    return null;
  }

  // Mostrar loading enquanto verifica onboarding
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-text-secondary mt-2">Verificando perfil...</Text>
      </View>
    );
  }

  // Se precisa de onboarding, não renderizar children (já redirecionou)
  if (needsOnboarding) {
    return null;
  }

  // Se houver erro, mostrar mensagem de erro
  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-background px-4">
        <Text className="text-text-primary text-xl font-bold mb-2">
          Erro de Verificação
        </Text>
        <Text className="text-text-secondary text-center mb-4">{error}</Text>
        <Text className="text-text-secondary text-center text-sm">
          Redirecionando para completar o perfil...
        </Text>
      </View>
    );
  }

  // Se tudo estiver ok, renderizar children
  return <>{children}</>;
}
