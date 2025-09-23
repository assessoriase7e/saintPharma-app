import { RankingResponse, UserPointsResponse } from "../types/api";
import { httpClient } from "./httpClient";

class RankingService {
  /**
   * Busca o ranking geral
   */
  async getRanking(): Promise<RankingResponse> {
    try {
      console.log("🏆 [RankingService] Buscando ranking...");
      const response = await httpClient.get("/api/ranking");
      console.log("✅ [RankingService] Ranking carregado:", response);
      return response;
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
