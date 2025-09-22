import { useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { onboardingService } from "../services/onboarding";
import { OnboardingCheckResult, OnboardingStatus } from "../types/onboarding";

export function useOnboardingCheck(): OnboardingCheckResult {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (!isLoaded || !userId) return;

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

        console.log("📊 [useOnboardingCheck] Status do onboarding:", status);

        if (status.needsOnboarding) {
          console.log("🚀 [useOnboardingCheck] Redirecionando para onboarding");
          setNeedsOnboarding(true);
          router.push("/onboarding");
        } else {
          console.log("✅ [useOnboardingCheck] Onboarding já completo");
          setNeedsOnboarding(false);
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
  }, [isLoaded, userId, router]);

  return {
    isLoading,
    needsOnboarding,
    error,
  };
}
