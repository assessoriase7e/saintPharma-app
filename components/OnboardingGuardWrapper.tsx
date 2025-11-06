import { useAuth } from "@clerk/clerk-expo";
import { useRouter, useSegments } from "expo-router";
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
  const segments = useSegments();
  const { isLoading, needsOnboarding, error } = useOnboardingCheck();
  const [hasChecked, setHasChecked] = useState(false);

  // Verificar se estamos em uma rota que não precisa de verificação de onboarding
  const currentRoute = segments[0];
  const isOnboardingRoute = currentRoute === "onboarding";
  const isAuthRoute = currentRoute === "(auth)";
  const isSSOCallbackRoute = currentRoute === "sso-callback";

  console.log("🔍 [OnboardingGuard] Estado atual:", {
    isSignedIn,
    isLoaded,
    isAuthRoute,
    isSSOCallbackRoute,
    isOnboardingRoute,
    currentRoute,
    segments,
    hasChecked,
    isLoading,
    needsOnboarding,
    error,
  });

  useEffect(() => {
    if (!isLoaded) return;

    // Se não estiver logado e não estiver em rota permitida, redirecionar para login
    if (!isSignedIn && !isAuthRoute && !isSSOCallbackRoute && !isOnboardingRoute) {
      console.log(
        "🔄 [OnboardingGuard] Usuário não logado, redirecionando para login"
      );
      router.replace("/(auth)/sign-in");
      return;
    }

    // Se estiver logado e em rota de auth, redirecionar para home
    if (isSignedIn && isAuthRoute) {
      console.log(
        "🔄 [OnboardingGuard] Usuário logado em rota de auth, redirecionando para home"
      );
      router.replace("/");
      return;
    }

    // Marcar que já verificou
    setHasChecked(true);
  }, [isLoaded, isSignedIn, isAuthRoute, isSSOCallbackRoute, isOnboardingRoute, router]);

  // Se estiver em rota de onboarding, renderizar children sem verificação
  // (permitir acesso mesmo sem estar logado, pois o formulário verifica isso)
  if (isOnboardingRoute) {
    console.log(
      "🔄 [OnboardingGuard] Em rota de onboarding, renderizando children"
    );
    return <>{children}</>;
  }

  // Se não estiver logado e não estiver em rota permitida, não renderizar nada (já redirecionou)
  if (!isSignedIn) {
    console.log("🔄 [OnboardingGuard] Usuário não logado, retornando null");
    return null;
  }

  // Mostrar loading enquanto verifica onboarding
  if (isLoading) {
    console.log(
      "🔄 [OnboardingGuard] Verificando onboarding, renderizando loading"
    );
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-text-secondary mt-2">Verificando perfil...</Text>
      </View>
    );
  }

  // Se precisa de onboarding, não renderizar children (já redirecionou)
  if (needsOnboarding) {
    console.log("🔄 [OnboardingGuard] Precisa de onboarding, retornando null");
    return null;
  }

  // Se houver erro, mostrar mensagem de erro
  if (error) {
    console.log(
      "🔄 [OnboardingGuard] Erro encontrado, renderizando mensagem de erro"
    );
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
  console.log("✅ [OnboardingGuard] Tudo ok, renderizando children");
  return <>{children}</>;
}
