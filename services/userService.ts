import {
  BulkCreateUserRequest,
  BulkCreateUserResponse,
  CompleteUserRequest,
  CompleteUserResponse,
  CreateUserRequest,
  CreateUserResponse,
  GetUserProfileResponse,
  GetUserResponse,
  UpdateUserRequest,
  UpdateUserResponse,
  User,
  UserActivitiesResponse,
  UserStatsResponse,
  UserSummaryResponse,
} from "@/types/api";
import { httpClient } from "./httpClient";

class UserService {
  /**
   * Cria um usuário individual
   */
  async createUser(data: CreateUserRequest): Promise<CreateUserResponse> {
    try {
      console.log("👤 [UserService] Criando usuário:", data.clerkId);
      const response = await httpClient.post("/api/user/create", data);
      console.log("✅ [UserService] Usuário criado:", response);

      // Verificar se a resposta tem a estrutura esperada da documentação
      // A API pode retornar: { success: true, data: { message: "...", user: {...} } }
      if (response && response.success && response.data && response.data.user) {
        // Estrutura atual da API: { success: true, data: { message: "...", user: {...} } }
        return {
          success: true,
          message: response.data.message || "Usuário criado com sucesso",
          user: response.data.user,
        };
      } else if (response && response.success && response.user) {
        // Estrutura alternativa: { success: true, message: "...", user: {...} }
        return response;
      } else if (response && response.user) {
        // Estrutura alternativa: { user: {...} }
        return {
          success: true,
          message: "Usuário criado com sucesso",
          user: response.user,
        };
      } else {
        console.warn(
          "⚠️ [UserService] Resposta da criação do usuário não tem a estrutura esperada:",
          response
        );
        throw new Error("Erro ao criar usuário");
      }
    } catch (error) {
      console.error("❌ [UserService] Erro ao criar usuário:", error);
      throw error;
    }
  }

  /**
   * Cria múltiplos usuários
   */
  async bulkCreateUsers(
    data: BulkCreateUserRequest
  ): Promise<BulkCreateUserResponse> {
    try {
      console.log(`👤 [UserService] Criando ${data.users.length} usuários...`);
      const response = await httpClient.post("/api/user/bulk-create", data);
      console.log("✅ [UserService] Usuários criados:", response);

      // Verificar se a resposta tem a estrutura esperada da documentação
      if (response && response.success && response.results) {
        // Estrutura da documentação: { success: true, message: "...", results: {...} }
        return response;
      } else if (response && response.results) {
        // Estrutura alternativa: { results: {...} }
        return {
          success: true,
          message: "Processamento concluído",
          results: response.results,
        };
      } else {
        console.warn(
          "⚠️ [UserService] Resposta da criação em lote não tem a estrutura esperada:",
          response
        );
        throw new Error("Erro ao criar usuários em lote");
      }
    } catch (error) {
      console.error("❌ [UserService] Erro ao criar usuários em lote:", error);
      throw error;
    }
  }

  /**
   * Busca um usuário pelo Clerk ID
   */
  async getUser(clerkId?: string): Promise<GetUserResponse> {
    try {
      console.log(
        "👤 [UserService] Buscando usuário:",
        clerkId || "via header"
      );
      const url = clerkId ? `/api/user?clerkId=${clerkId}` : "/api/user";
      const response = await httpClient.get(url);
      console.log("✅ [UserService] Usuário encontrado:", response);

      // Verificar se a resposta tem a estrutura esperada da documentação
      // A API retorna: { success: true, data: { message: "...", user: {...} } }
      if (response && response.success && response.data && response.data.user) {
        // Estrutura atual da API: { success: true, data: { message: "...", user: {...} } }
        return {
          success: true,
          message: response.data.message || "Usuário encontrado com sucesso",
          user: response.data.user,
        };
      } else if (response && response.success && response.user) {
        // Estrutura alternativa: { success: true, message: "...", user: {...} }
        return response;
      } else if (response && response.user) {
        // Estrutura alternativa: { user: {...} }
        return {
          success: true,
          message: "Usuário encontrado com sucesso",
          user: response.user,
        };
      } else {
        console.warn(
          "⚠️ [UserService] Resposta da busca do usuário não tem a estrutura esperada:",
          response
        );
        throw new Error("Usuário não encontrado");
      }
    } catch (error) {
      console.error("❌ [UserService] Erro ao buscar usuário:", error);
      throw error;
    }
  }

  /**
   * Busca o perfil completo de um usuário
   */
  async getUserProfile(clerkId?: string): Promise<GetUserProfileResponse> {
    try {
      console.log(
        "👤 [UserService] Buscando perfil do usuário:",
        clerkId || "via header"
      );
      const url = clerkId
        ? `/api/user/profile?clerkId=${clerkId}`
        : "/api/user/profile";
      const response = await httpClient.get(url);
      console.log("✅ [UserService] Perfil encontrado:", response);

      // Verificar se a resposta tem a estrutura esperada da documentação
      // A API pode retornar: { success: true, data: { message: "...", profile: {...} } }
      if (
        response &&
        response.success &&
        response.data &&
        response.data.profile
      ) {
        // Estrutura atual da API: { success: true, data: { message: "...", profile: {...} } }
        return {
          success: true,
          message:
            response.data.message || "Perfil do usuário encontrado com sucesso",
          profile: response.data.profile,
        };
      } else if (response && response.success && response.profile) {
        // Estrutura alternativa: { success: true, message: "...", profile: {...} }
        return response;
      } else if (response && response.profile) {
        // Estrutura alternativa: { profile: {...} }
        return {
          success: true,
          message: "Perfil do usuário encontrado com sucesso",
          profile: response.profile,
        };
      } else {
        console.warn(
          "⚠️ [UserService] Resposta do perfil não tem a estrutura esperada:",
          response
        );
        throw new Error("Perfil não encontrado");
      }
    } catch (error) {
      console.error("❌ [UserService] Erro ao buscar perfil:", error);
      throw error;
    }
  }

  /**
   * Busca resumo detalhado do usuário
   */
  async getUserSummary(period: string = "all"): Promise<UserSummaryResponse> {
    try {
      console.log("👤 [UserService] Buscando resumo do usuário:", period);
      const response = await httpClient.get(
        `/api/user/summary?period=${period}`
      );
      console.log("✅ [UserService] Resumo encontrado:", response);

      // Se a resposta já tem a estrutura esperada, retornar diretamente
      if (response && response.success && response.data) {
        // Verificar se data já contém os dados ou se é outra estrutura aninhada
        if (response.data.success && response.data.data) {
          // API retornou estrutura duplicada, usar a camada interna
          return {
            success: true,
            data: response.data.data as UserSummaryResponse["data"],
          } as UserSummaryResponse;
        }
        // Estrutura normal: { success: true, data: {...} }
        return {
          success: true,
          data: response.data as UserSummaryResponse["data"],
        } as UserSummaryResponse;
      } else if (response && response.success) {
        // Estrutura alternativa: { success: true, ... } (dados no nível raiz)
        return {
          success: true,
          data: response as UserSummaryResponse["data"],
        } as UserSummaryResponse;
      }

      console.warn(
        "⚠️ [UserService] Resposta do resumo não tem a estrutura esperada:",
        response
      );
      throw new Error("Erro ao buscar resumo do usuário");
    } catch (error) {
      console.error("❌ [UserService] Erro ao buscar resumo:", error);
      throw error;
    }
  }

  /**
   * Busca estatísticas detalhadas do usuário
   */
  async getUserStats(
    clerkId?: string,
    period: string = "all",
    includeDetails: boolean = false
  ): Promise<UserStatsResponse> {
    try {
      console.log("👤 [UserService] Buscando estatísticas do usuário:", {
        clerkId,
        period,
        includeDetails,
      });
      const params = new URLSearchParams({
        period,
        includeDetails: includeDetails.toString(),
      });
      if (clerkId) params.append("clerkId", clerkId);

      const response = await httpClient.get(
        `/api/user/stats?${params.toString()}`
      );
      console.log("✅ [UserService] Estatísticas encontradas:", response);

      // Verificar se a resposta tem a estrutura esperada da documentação
      // A API retorna: { success: true, data: { message: "...", stats: {...} }, timestamp: "..." }
      if (
        response &&
        response.success &&
        response.data &&
        response.data.stats
      ) {
        // Estrutura da documentação: { success: true, data: { message: "...", stats: {...} }, timestamp: "..." }
        return {
          success: true,
          message:
            response.data.message ||
            "Estatísticas do usuário encontradas com sucesso",
          stats: response.data.stats,
        };
      } else if (response && response.success && response.stats) {
        // Estrutura alternativa: { success: true, message: "...", stats: {...} }
        return response;
      } else if (response && response.stats) {
        // Estrutura alternativa: { stats: {...} }
        return {
          success: true,
          message: "Estatísticas do usuário encontradas com sucesso",
          stats: response.stats,
        };
      } else {
        console.warn(
          "⚠️ [UserService] Resposta das estatísticas não tem a estrutura esperada:",
          response
        );
        throw new Error("Erro ao buscar estatísticas do usuário");
      }
    } catch (error) {
      console.error("❌ [UserService] Erro ao buscar estatísticas:", error);
      throw error;
    }
  }

  /**
   * Busca atividades do usuário
   */
  async getUserActivities(
    clerkId?: string,
    type: string = "all",
    period: string = "all",
    page: number = 1,
    limit: number = 20
  ): Promise<UserActivitiesResponse> {
    try {
      console.log("👤 [UserService] Buscando atividades do usuário:", {
        clerkId,
        type,
        period,
        page,
        limit,
      });
      const params = new URLSearchParams({
        type,
        period,
        page: page.toString(),
        limit: limit.toString(),
      });
      if (clerkId) params.append("clerkId", clerkId);

      const response = await httpClient.get(
        `/api/user/activities?${params.toString()}`
      );
      console.log("✅ [UserService] Atividades encontradas:", response);

      // Verificar se a resposta tem a estrutura esperada da documentação
      if (response && response.success && response.activities) {
        // Estrutura da documentação: { success: true, message: "...", activities: [...], stats: {...}, pagination: {...} }
        return response;
      } else if (response && response.activities) {
        // Estrutura alternativa: { activities: [...], stats: {...}, pagination: {...} }
        return {
          success: true,
          message: "Atividades do usuário encontradas com sucesso",
          activities: response.activities,
          stats: response.stats,
          pagination: response.pagination,
        };
      } else {
        console.warn(
          "⚠️ [UserService] Resposta das atividades não tem a estrutura esperada:",
          response
        );
        throw new Error("Erro ao buscar atividades do usuário");
      }
    } catch (error) {
      console.error("❌ [UserService] Erro ao buscar atividades:", error);
      throw error;
    }
  }

  /**
   * Atualiza informações do usuário
   */
  async updateUser(data: UpdateUserRequest): Promise<UpdateUserResponse> {
    try {
      console.log("👤 [UserService] Atualizando usuário:", data);
      const response = await httpClient.put("/api/user/update", data);
      console.log("✅ [UserService] Usuário atualizado:", response);

      // Verificar se a resposta tem a estrutura esperada da documentação
      // A API retorna: { success: true, message: "...", user: {...} }
      if (response && response.success && response.user) {
        // Estrutura da documentação: { success: true, message: "...", user: {...} }
        return {
          success: true,
          message: response.message || "Usuário atualizado com sucesso",
          user: response.user,
        };
      } else if (
        response &&
        response.success &&
        response.data &&
        response.data.user
      ) {
        // Estrutura alternativa: { success: true, data: { message: "...", user: {...} } }
        return {
          success: true,
          message: response.data.message || "Usuário atualizado com sucesso",
          user: response.data.user,
        };
      } else if (response && response.user) {
        // Estrutura alternativa: { user: {...} }
        return {
          success: true,
          message: "Usuário atualizado com sucesso",
          user: response.user,
        };
      } else {
        console.warn(
          "⚠️ [UserService] Resposta da atualização não tem a estrutura esperada:",
          response
        );
        throw new Error("Erro ao atualizar usuário");
      }
    } catch (error) {
      console.error("❌ [UserService] Erro ao atualizar usuário:", error);
      throw error;
    }
  }

  /**
   * Completa dados do usuário (sobrenome e/ou nome)
   */
  async completeUser(data: CompleteUserRequest): Promise<CompleteUserResponse> {
    try {
      console.log("👤 [UserService] Completando dados do usuário:", data);
      const response = await httpClient.put("/api/user/complete", data);
      console.log("✅ [UserService] Dados completados:", response);

      // Verificar se a resposta tem a estrutura esperada da documentação
      // A API retorna: { success: true, message: "...", user: {...} }
      if (response && response.success && response.user) {
        // Estrutura da documentação: { success: true, message: "...", user: {...} }
        return {
          success: true,
          message:
            response.message || "Dados do usuário completados com sucesso",
          user: response.user,
        };
      } else if (
        response &&
        response.success &&
        response.data &&
        response.data.user
      ) {
        // Estrutura alternativa: { success: true, data: { message: "...", user: {...} } }
        return {
          success: true,
          message:
            response.data.message || "Dados do usuário completados com sucesso",
          user: response.data.user,
        };
      } else if (response && response.user) {
        // Estrutura alternativa: { user: {...} }
        return {
          success: true,
          message: "Dados do usuário completados com sucesso",
          user: response.user,
        };
      } else {
        console.warn(
          "⚠️ [UserService] Resposta da completação não tem a estrutura esperada:",
          response
        );
        throw new Error("Erro ao completar dados do usuário");
      }
    } catch (error) {
      console.error("❌ [UserService] Erro ao completar dados:", error);
      throw error;
    }
  }

  /**
   * Verifica se um usuário existe e o cria se necessário
   */
  async ensureUserExists(
    clerkId: string,
    email: string,
    firstName?: string,
    lastName?: string,
    profileImage?: string
  ): Promise<User> {
    try {
      console.log("👤 [UserService] Verificando se usuário existe:", clerkId);

      // Primeiro, tenta buscar o usuário
      try {
        const userResponse = await this.getUser(clerkId);
        console.log("✅ [UserService] Usuário já existe:", userResponse.user);
        return userResponse.user;
      } catch (error) {
        // Se não encontrou, cria o usuário
        console.log("👤 [UserService] Usuário não encontrado, criando...");
        const createResponse = await this.createUser({
          clerkId,
          email,
          firstName,
          lastName,
          profileImage,
        });
        console.log("✅ [UserService] Usuário criado:", createResponse.user);
        return createResponse.user;
      }
    } catch (error) {
      console.error(
        "❌ [UserService] Erro ao garantir existência do usuário:",
        error
      );
      throw error;
    }
  }
}

export const userService = new UserService();
