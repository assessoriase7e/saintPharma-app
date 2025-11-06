import { useAuth } from "@clerk/clerk-expo";
import { useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { onboardingService } from "../services/onboarding";
import { OnboardingCheckResult, OnboardingStatus } from "../types/onboarding";

export function useOnboardingCheck(): OnboardingCheckResult {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const [isLoading, setIsLoading] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [error, setError] = useState<string | undefined>();

  // Verificar se estamos em uma rota que não precisa de verificação de onboarding
  const currentRoute = segments[0];
  const isOnboardingRoute = currentRoute === "onboarding";
  const isAuthRoute = currentRoute === "(auth)";
  const isSSOCallbackRoute = currentRoute === "sso-callback";

  useEffect(() => {
    if (!isLoaded || !userId) return;

    // Não verificar onboarding se estiver em rotas específicas
    if (isOnboardingRoute || isAuthRoute || isSSOCallbackRoute) {
      // Mas ainda verificar se estiver na rota de onboarding para redirecionar se já completo
      if (isOnboardingRoute) {
        const checkOnboarding = async () => {
          try {
            setIsLoading(true);
            const status = await onboardingService.checkOnboardingStatus(userId);
            if (!status.needsOnboarding) {
              console.log("✅ [useOnboardingCheck] Onboarding já completo, redirecionando da rota de onboarding");
              router.replace("/");
            }
          } catch (err: any) {
            console.error("❌ [useOnboardingCheck] Erro ao verificar onboarding na rota:", err);
          } finally {
            setIsLoading(false);
          }
        };
        checkOnboarding();
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
          user: status.user ? {
            id: status.user.id,
            firstName: status.user.firstName,
            lastName: status.user.lastName,
          } : null,
        });

        if (status.needsOnboarding) {
          console.log("🚀 [useOnboardingCheck] Usuário precisa completar onboarding");
          setNeedsOnboarding(true);
          // Só redirecionar se não estiver já na rota de onboarding
          if (!isOnboardingRoute) {
            router.replace("/onboarding");
          }
        } else {
          console.log("✅ [useOnboardingCheck] Onboarding já completo");
          setNeedsOnboarding(false);
          // Se estiver na rota de onboarding mas não precisa, redirecionar para home
          if (isOnboardingRoute) {
            router.replace("/");
          }
        }
      } catch (err: any) {
        console.error(
          "❌ [useOnboardingCheck] Erro ao verificar onboarding:",
          err
        );

        // Em caso de erro, assumir que precisa de onboarding
        setError(err.message || "Erro ao verificar status do onboarding");
        setNeedsOnboarding(true);
        router.push("/onboarding");
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboarding();
  }, [
    isLoaded,
    userId,
    isOnboardingRoute,
    isAuthRoute,
    isSSOCallbackRoute,
    router,
  ]);

  return {
    isLoading,
    needsOnboarding,
    error,
  };
}
