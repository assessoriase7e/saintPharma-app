import { onboardingService } from "@/services/onboarding";
import { OnboardingCheckResult, OnboardingStatus } from "@/types/onboarding";
import { useAuth } from "@clerk/clerk-expo";
import { useSegments } from "expo-router";
import { useEffect, useState } from "react";

export function useOnboardingCheck(): OnboardingCheckResult {
  const { userId, isLoaded } = useAuth();
  const segments = useSegments();
  const [isLoading, setIsLoading] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [error, setError] = useState<string | undefined>();

  // Verificar se estamos em uma rota que não precisa de verificação de onboarding
  const currentRoute = segments[0] as string;
  const isOnboardingRoute = currentRoute === "onboarding";
  const isAuthRoute = currentRoute === "sign-in" || currentRoute === "sign-up";
  const isSSOCallbackRoute = currentRoute === "sso-callback";

  useEffect(() => {
    // Não executar verificação se não houver userId válido
    // Isso evita redirecionar usuários não autenticados
    if (!isLoaded) {
      setIsLoading(false);
      setNeedsOnboarding(false);
      return;
    }

    if (!userId) {
      // Se não houver userId, não precisa de onboarding (usuário não autenticado)
      setIsLoading(false);
      setNeedsOnboarding(false);
      setError(undefined);
      return;
    }

    // Não verificar onboarding se estiver em rotas específicas
    if (isOnboardingRoute || isAuthRoute || isSSOCallbackRoute) {
      // Mas ainda verificar se estiver na rota de onboarding para mostrar se já completo
      if (isOnboardingRoute) {
        const checkOnboarding = async () => {
          try {
            setIsLoading(true);
            const status = await onboardingService.checkOnboardingStatus(
              userId
            );
            if (!status.needsOnboarding) {
              console.log(
                "✅ [useOnboardingCheck] Onboarding já completo na rota de onboarding"
              );
              setNeedsOnboarding(false);
            } else {
              console.log(
                "🚀 [useOnboardingCheck] Usuário ainda precisa completar onboarding"
              );
              setNeedsOnboarding(true);
            }
          } catch (err: any) {
            console.error(
              "❌ [useOnboardingCheck] Erro ao verificar onboarding na rota:",
              err
            );
            // O serviço já trata erros e retorna um status apropriado
            // Se chegou aqui, é um erro inesperado (exceção não tratada)
            // Não assumir que precisa de onboarding para evitar redirecionamentos indevidos
            setError(err.message || "Erro ao verificar status do onboarding");
            setNeedsOnboarding(false); // Não redirecionar em caso de erro inesperado
          } finally {
            setIsLoading(false);
          }
        };
        checkOnboarding();
      } else {
        // Em rotas de auth, não mostrar loading
        setIsLoading(false);
        setNeedsOnboarding(false);
        setError(undefined);
      }
      return;
    }

    const checkOnboarding = async () => {
      try {
        setIsLoading(true);
        setError(undefined);

        console.log(
          "🔍 [useOnboardingCheck] Verificando onboarding para usuário:",
          userId
        );

        const status: OnboardingStatus =
          await onboardingService.checkOnboardingStatus(userId);

        console.log("📊 [useOnboardingCheck] Status do onboarding:", {
          needsOnboarding: status.needsOnboarding,
          userExists: status.userExists,
          user: status.user
            ? {
                id: status.user.id,
                firstName: status.user.firstName,
                lastName: status.user.lastName,
              }
            : null,
        });

        if (status.needsOnboarding) {
          console.log(
            "🚀 [useOnboardingCheck] Usuário precisa completar onboarding"
          );
          setNeedsOnboarding(true);
        } else {
          console.log("✅ [useOnboardingCheck] Onboarding já completo");
          setNeedsOnboarding(false);
        }
      } catch (err: any) {
        console.error(
          "❌ [useOnboardingCheck] Erro ao verificar onboarding:",
          err
        );

        // O serviço já trata erros e retorna um status apropriado
        // Se chegou aqui, é um erro inesperado (ex: exceção não tratada)
        // Não assumir que precisa de onboarding para evitar redirecionamentos indevidos
        setError(err.message || "Erro ao verificar status do onboarding");
        setNeedsOnboarding(false); // Não redirecionar em caso de erro inesperado
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboarding();
  }, [isLoaded, userId, isOnboardingRoute, isAuthRoute, isSSOCallbackRoute]);

  return {
    isLoading,
    needsOnboarding,
    error,
  };
}
