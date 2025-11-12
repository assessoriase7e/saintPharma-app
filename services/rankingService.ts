import { RankingResponse, UserPointsResponse } from "@/types/api";
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
      const response = await httpClient.get<RankingResponse>(`/api/ranking?${params.toString()}`);
      console.log("✅ [RankingService] Ranking carregado:", response);

      // Verificar se a resposta tem a estrutura esperada
      if (response && response.success && response.ranking && response.pagination && response.week) {
        return response;
      }

      // Fallback para estrutura incompleta
      console.warn(
        "⚠️ [RankingService] Resposta do ranking não tem a estrutura esperada:",
        response
      );
      
      // Retornar estrutura mínima válida
      return {
        success: response?.success || false,
        ranking: response?.ranking || [],
        pagination: response?.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          pages: 0,
          hasNext: false,
          hasPrev: false,
        },
        week: response?.week || {
          start: new Date().toISOString().split('T')[0],
          end: new Date().toISOString().split('T')[0],
        },
      };
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
      
      // Normalizar resposta: a API pode retornar weekPoints ou weeklyPoints
      const normalizedResponse: UserPointsResponse = {
        totalPoints: response.totalPoints || (response as any).totalPoints || 0,
        weeklyPoints: (response as any).weekPoints || response.weeklyPoints || 0,
        position: response.position || (response as any).position || 0,
      };
      
      console.log("🏆 [RankingService] Resposta normalizada:", normalizedResponse);
      return normalizedResponse;
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
