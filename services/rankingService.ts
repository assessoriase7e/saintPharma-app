import { RankingResponse, RankingApiResponse, UserPointsResponse, UserPointsApiResponse } from "@/types/api";
import { httpClient } from "./httpClient";

/**
 * Calcula o início e fim da semana (domingo a sábado - semana brasileira)
 * @param date - Data de referência (padrão: hoje)
 * @returns Objeto com start e end da semana em formato ISO (YYYY-MM-DD)
 */
function calculateWeekRange(date: Date = new Date()): { start: string; end: string } {
  // Criar uma cópia da data para não modificar a original
  const currentDate = new Date(date);
  
  // Obter o dia da semana (0 = domingo, 1 = segunda, ..., 6 = sábado)
  const dayOfWeek = currentDate.getDay();
  
  // Calcular o início da semana (domingo)
  // Se for domingo (0), não precisa voltar; caso contrário, voltar dayOfWeek dias
  const daysToSunday = dayOfWeek;
  const startDate = new Date(currentDate);
  startDate.setDate(currentDate.getDate() - daysToSunday);
  startDate.setHours(0, 0, 0, 0);
  
  // Calcular o fim da semana (sábado) - 6 dias após o domingo
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  endDate.setHours(23, 59, 59, 999);
  
  // Formatar como YYYY-MM-DD
  const formatDate = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  return {
    start: formatDate(startDate),
    end: formatDate(endDate),
  };
}

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
      const response = await httpClient.get<RankingApiResponse>(`/api/ranking?${params.toString()}`);
      console.log("✅ [RankingService] Ranking carregado:", response);

      // Extrair dados de dentro de data conforme documentação
      if (response && response.success && response.data) {
        const { ranking, pagination, week } = response.data;
        
        // Validar se a semana tem start e end diferentes
        if (week && week.start && week.end && week.start !== week.end) {
          return {
            success: response.success,
            ranking,
            pagination,
            week,
          };
        } else {
          console.warn(
            "⚠️ [RankingService] Semana retornada pela API é inválida (start === end), usando cálculo local:",
            week
          );
          // Se a semana for inválida, usar o cálculo local
          return {
            success: response.success,
            ranking,
            pagination,
            week: calculateWeekRange(),
          };
        }
      }

      // Fallback para estrutura incompleta
      console.warn(
        "⚠️ [RankingService] Resposta do ranking não tem a estrutura esperada:",
        response
      );
      
      // Retornar estrutura mínima válida
      return {
        success: response?.success || false,
        ranking: response?.data?.ranking || [],
        pagination: response?.data?.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          pages: 0,
          hasNext: false,
          hasPrev: false,
        },
        week: response?.data?.week || calculateWeekRange(),
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
      const response = await httpClient.get<UserPointsApiResponse>("/api/ranking/user");
      console.log(
        "✅ [RankingService] Pontos do usuário carregados:",
        response
      );
      
      // Extrair dados de dentro de data conforme documentação
      if (response && response.success && response.data) {
        const { userId, userName, totalPoints, weekPoints, profileImage } = response.data;
        
        return {
          userId,
          userName,
          totalPoints,
          weekPoints,
          profileImage,
        };
      }

      // Fallback para estrutura incompleta
      console.warn(
        "⚠️ [RankingService] Resposta dos pontos do usuário não tem a estrutura esperada:",
        response
      );
      
      return {
        userId: (response as any)?.data?.userId || "",
        userName: (response as any)?.data?.userName || "",
        totalPoints: (response as any)?.data?.totalPoints || 0,
        weekPoints: (response as any)?.data?.weekPoints || 0,
        profileImage: (response as any)?.data?.profileImage,
      };
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
