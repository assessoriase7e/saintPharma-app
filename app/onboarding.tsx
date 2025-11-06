import { useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { OnboardingForm } from "../components/OnboardingForm";
import { onboardingService } from "../services/onboarding";

export default function OnboardingPage() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!isLoaded) {
        setIsChecking(false);
        return;
      }

      // Se não estiver logado, permitir acesso ao formulário
      if (!userId) {
        console.log("⚠️ [OnboardingPage] Usuário não logado, permitindo acesso ao formulário");
        setIsChecking(false);
        return;
      }

      try {
        console.log("🔍 [OnboardingPage] Verificando se usuário já completou onboarding...");
        
        const status = await onboardingService.checkOnboardingStatus(userId);
        
        console.log("📊 [OnboardingPage] Status do onboarding:", {
          needsOnboarding: status.needsOnboarding,
          firstName: status.user?.firstName,
          lastName: status.user?.lastName,
          hasUser: !!status.user,
        });

        if (!status.needsOnboarding && status.user) {
          console.log("✅ [OnboardingPage] Onboarding já completo, redirecionando para home");
          router.replace("/");
          return;
        }

        console.log("🔄 [OnboardingPage] Usuário precisa completar onboarding");
      } catch (error: any) {
        console.error("❌ [OnboardingPage] Erro ao verificar onboarding:", error);
        // Em caso de erro, permitir acesso ao formulário
      } finally {
        setIsChecking(false);
      }
    };

    checkOnboardingStatus();
  }, [isLoaded, userId, router]);

  if (isChecking) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-text-secondary mt-2">Verificando perfil...</Text>
      </View>
    );
  }

  return <OnboardingForm />;
}
