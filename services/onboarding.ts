import { useAuth, useUser } from "@clerk/clerk-expo";
import {
  OnboardingData,
  OnboardingResult,
  OnboardingStatus,
} from "../types/onboarding";
import { httpClient } from "./httpClient";

class OnboardingService {
  /**
   * Completa o processo de onboarding usando a API /user/complete
   */
  async completeOnboarding(data: OnboardingData): Promise<OnboardingResult> {
    try {
      console.log(
        "🔄 [OnboardingService] Iniciando processo de onboarding...",
        {
          userId: data.user.id,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          apiUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
          hasApiToken: !!process.env.EXPO_PUBLIC_API_TOKEN,
        }
      );

      // Verificar se as variáveis de ambiente estão configuradas
      if (
        !process.env.EXPO_PUBLIC_API_BASE_URL ||
        !process.env.EXPO_PUBLIC_API_TOKEN
      ) {
        console.error(
          "❌ [OnboardingService] Variáveis de ambiente não configuradas"
        );
        console.error("❌ [OnboardingService] Crie um arquivo .env com:");
        console.error(
          "❌ [OnboardingService] EXPO_PUBLIC_API_BASE_URL=https://your-api-url.com"
        );
        console.error(
          "❌ [OnboardingService] EXPO_PUBLIC_API_TOKEN=your-api-token"
        );

        return {
          success: false,
          error:
            "Configuração da API não encontrada. Verifique as variáveis de ambiente no arquivo .env",
        };
      }

      // Usar o endpoint /api/user/complete conforme documentação
      httpClient.setUserId(data.user.id); // ID do Clerk

      const responseData = await httpClient.put("/api/user/complete", {
        firstName: data.user.firstName,
        lastName: data.user.lastName,
      });

      console.log("✅ [OnboardingService] Onboarding concluído com sucesso");

      return {
        success: true,
        data: responseData.data,
        message: "Onboarding concluído com sucesso",
      };
    } catch (error: any) {
      console.error("❌ [OnboardingService] Erro inesperado:", error);

      return {
        success: false,
        error: error.message || "Erro inesperado durante o onboarding",
      };
    }
  }

  /**
   * Verifica o status do onboarding do usuário usando /auth/user
   */
  async checkOnboardingStatus(userId: string): Promise<OnboardingStatus> {
    try {
      console.log(
        "🔍 [OnboardingService] Verificando status do onboarding para:",
        userId
      );

      httpClient.setUserId(userId);

      const responseData = await httpClient.get("/api/auth/user");
      const user = responseData.data;

      // Verificar se o usuário tem nome completo (indica que completou onboarding)
      const hasCompleteName = user.name && user.name.trim().length > 0;

      const status: OnboardingStatus = {
        needsOnboarding: !hasCompleteName,
        userExists: true,
        storeCustomerExists: true, // Assumir que existe se o usuário existe
        hasAddress: true, // Não precisamos mais de endereço
        user: user,
      };

      console.log("✅ [OnboardingService] Status verificado:", status);
      return status;
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
