import { RankingResponse, UserPointsResponse } from "../types/api";
import { httpClient } from "./httpClient";

class RankingService {
  /**
   * Busca o ranking geral
   * @param page - Número da página (padrão: 1)
   * @param limit - Itens por página (padrão: 20, máximo: 100)
   */
  async getRanking(page: number = 1, limit: number = 20): Promise<RankingResponse> {
    try {
      console.log("🏆 [RankingService] Buscando ranking...", { page, limit });
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      const response = await httpClient.get(`/api/ranking?${params.toString()}`);
      console.log("✅ [RankingService] Ranking carregado:", response);

      // Verificar se a resposta tem a estrutura esperada e transformar se necessário
      let rankingData: RankingResponse;

      if (response && response.success && response.ranking) {
        // Estrutura da documentação: { success: true, ranking: [...], pagination: {...}, month: "..." }
        // Transformar os dados para garantir que usem firstName e lastName
        rankingData = {
          ranking: response.ranking.map((item: any) => {
            // Se o item já tem a estrutura correta com user.firstName e user.lastName
            if (item.user && (item.user.firstName || item.user.lastName)) {
              return item;
            }
            
            // Se o item tem firstName e lastName diretamente (sem user)
            if (item.firstName || item.lastName) {
              return {
                user: {
                  firstName: item.firstName,
                  lastName: item.lastName,
                  profileImage: item.profileImage,
                },
                points: item.points || 0,
                certificatesCount: item.certificatesCount || 0,
              };
            }
            
            // Se o item tem name (formato antigo), tentar dividir
            if (item.name) {
              const nameParts = item.name.trim().split(/\s+/);
              const firstName = nameParts[0] || "";
              const lastName = nameParts.slice(1).join(" ") || "";
              
              return {
                user: {
                  firstName: firstName || undefined,
                  lastName: lastName || undefined,
                  profileImage: item.profileImage,
                },
                points: item.points || 0,
                certificatesCount: item.certificatesCount || 0,
              };
            }
            
            // Fallback: retornar como está
            return item;
          }),
        };
      } else if (response && Array.isArray(response.ranking)) {
        // Estrutura alternativa: ranking como array direto
        rankingData = {
          ranking: response.ranking.map((item: any) => {
            if (item.user && (item.user.firstName || item.user.lastName)) {
              return item;
            }
            if (item.firstName || item.lastName) {
              return {
                user: {
                  firstName: item.firstName,
                  lastName: item.lastName,
                  profileImage: item.profileImage,
                },
                points: item.points || 0,
                certificatesCount: item.certificatesCount || 0,
              };
            }
            return item;
          }),
        };
      } else if (Array.isArray(response)) {
        // Estrutura alternativa: array direto
        rankingData = {
          ranking: response.map((item: any) => {
            if (item.user && (item.user.firstName || item.user.lastName)) {
              return item;
            }
            if (item.firstName || item.lastName) {
              return {
                user: {
                  firstName: item.firstName,
                  lastName: item.lastName,
                  profileImage: item.profileImage,
                },
                points: item.points || 0,
                certificatesCount: item.certificatesCount || 0,
              };
            }
            return item;
          }),
        };
      } else {
        console.warn(
          "⚠️ [RankingService] Resposta do ranking não tem a estrutura esperada:",
          response
        );
        rankingData = { ranking: [] };
      }

      return rankingData;
    } catch (error) {
      console.error("❌ [RankingService] Erro ao buscar ranking:", error);
      throw error;
    }
  }

  /**
   * Busca pontos do usuário
   */
  async getUserPoints(): Promise<UserPointsResponse> {
    try {
      console.log("🏆 [RankingService] Buscando pontos do usuário...");
      const response = await httpClient.get("/api/ranking/user");
      console.log(
        "✅ [RankingService] Pontos do usuário carregados:",
        response
      );
      return response;
    } catch (error) {
      console.error(
        "❌ [RankingService] Erro ao buscar pontos do usuário:",
        error
      );
      throw error;
    }
  }

  /**
   * Busca dados completos do ranking (ranking + pontos do usuário)
   */
  async getRankingData() {
    try {
      console.log("🏆 [RankingService] Buscando dados completos do ranking...");

      const [rankingResponse, userPointsResponse] = await Promise.all([
        this.getRanking(),
        this.getUserPoints(),
      ]);

      console.log("✅ [RankingService] Dados do ranking carregados");
      return {
        ranking: rankingResponse,
        userPoints: userPointsResponse,
      };
    } catch (error) {
      console.error(
        "❌ [RankingService] Erro ao buscar dados do ranking:",
        error
      );
      throw error;
    }
  }
}

// Instância singleton do serviço
export const rankingService = new RankingService();
