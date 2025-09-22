import { useAuth, useUser } from "@clerk/clerk-expo";
import {
  OnboardingData,
  OnboardingResult,
  OnboardingStatus,
} from "../types/onboarding";

class OnboardingService {
  /**
   * Completa o processo de onboarding criando o usuário na API externa
   */
  async completeOnboarding(data: OnboardingData): Promise<OnboardingResult> {
    try {
      console.log("🔄 [OnboardingService] Iniciando processo de onboarding...");

      // Fazer requisição para a rota unificada da API externa
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_BASE_URL}/onboarding`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.EXPO_PUBLIC_API_TOKEN}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (response.status === 201) {
        const responseData = await response.json();
        console.log("✅ [OnboardingService] Onboarding concluído com sucesso");

        return {
          success: true,
          data: responseData.data,
          message: "Onboarding concluído com sucesso",
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `Erro HTTP ${response.status}`;

        console.error(
          "❌ [OnboardingService] Erro no onboarding:",
          errorMessage
        );

        return {
          success: false,
          error: errorMessage,
        };
      }
    } catch (error: any) {
      console.error("❌ [OnboardingService] Erro inesperado:", error);

      return {
        success: false,
        error: error.message || "Erro inesperado durante o onboarding",
      };
    }
  }

  /**
   * Verifica o status do onboarding do usuário
   */
  async checkOnboardingStatus(userId: string): Promise<OnboardingStatus> {
    try {
      console.log(
        "🔍 [OnboardingService] Verificando status do onboarding para:",
        userId
      );

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_BASE_URL}/onboarding/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.EXPO_PUBLIC_API_TOKEN}`,
          },
        }
      );

      if (response.status === 200) {
        const responseData = await response.json();
        const data = responseData.data;
        const meta = data.meta;

        const status: OnboardingStatus = {
          needsOnboarding:
            !meta.userExists || !meta.storeCustomerExists || !meta.hasAddress,
          userExists: meta.userExists,
          storeCustomerExists: meta.storeCustomerExists,
          hasAddress: meta.hasAddress,
          user: data.user,
          storeCustomer: data.storeCustomer,
          address: data.addresses?.[0] || null,
        };

        console.log("✅ [OnboardingService] Status verificado:", status);
        return status;
      } else {
        // Se não conseguir verificar, assumir que precisa de onboarding
        console.warn(
          "⚠️ [OnboardingService] Não foi possível verificar status, assumindo que precisa de onboarding"
        );

        return {
          needsOnboarding: true,
          userExists: false,
          storeCustomerExists: false,
          hasAddress: false,
        };
      }
    } catch (error: any) {
      console.error("❌ [OnboardingService] Erro ao verificar status:", error);

      // Em caso de erro, assumir que precisa de onboarding
      return {
        needsOnboarding: true,
        userExists: false,
        storeCustomerExists: false,
        hasAddress: false,
      };
    }
  }

  /**
   * Sincroniza o usuário do Clerk com a API externa
   */
  async syncClerkUser(): Promise<OnboardingResult> {
    try {
      console.log("🔄 [OnboardingService] Sincronizando usuário do Clerk...");

      // Esta função seria chamada quando o usuário já existe no Clerk
      // mas precisa ser criado na API externa
      // Por enquanto, retornamos que precisa de onboarding manual

      return {
        success: false,
        error: "Usuário precisa completar o onboarding manual",
        message: "Complete o processo de onboarding para continuar",
      };
    } catch (error: any) {
      console.error("❌ [OnboardingService] Erro na sincronização:", error);

      return {
        success: false,
        error: error.message || "Erro na sincronização do usuário",
      };
    }
  }
}

// Instância singleton do serviço
export const onboardingService = new OnboardingService();

// Hook para usar o serviço de onboarding
export const useOnboardingService = () => {
  const { userId } = useAuth();
  const { user } = useUser();

  return {
    onboardingService,
    userId,
    user,
  };
};
