import { userService } from "./userService";

interface StatItem {
  titulo: string;
  valor: string;
  icone: "checkmark-circle" | "play-circle" | "time";
  cor: string;
}

class StatsService {
  // Estatísticas padrão quando não há dados da API
  private defaultStats: StatItem[] = [
    {
      titulo: "Concluídos",
      valor: "0",
      icone: "checkmark-circle",
      cor: "#10b981",
    },
    {
      titulo: "Em Progresso",
      valor: "0",
      icone: "play-circle",
      cor: "#3b82f6",
    },
    {
      titulo: "Horas Estudadas",
      valor: "0h",
      icone: "time",
      cor: "#f59e0b",
    },
  ];

  /**
   * Busca estatísticas do usuário
   */
  async getUserStats(userCourses: any[] = []): Promise<StatItem[]> {
    try {
      console.log("📊 [StatsService] Buscando estatísticas do usuário...");

      const summaryResponse = await userService.getUserSummary();

      const stats: StatItem[] = [
        {
          titulo: "Concluídos",
          valor: summaryResponse.completedCourses.toString(),
          icone: "checkmark-circle",
          cor: "#10b981",
        },
        {
          titulo: "Em Progresso",
          valor: (
            (userCourses?.length || 0) - summaryResponse.completedCourses
          ).toString(),
          icone: "play-circle",
          cor: "#3b82f6",
        },
        {
          titulo: "Horas Estudadas",
          valor: `${Math.floor(summaryResponse.totalTimeSpent / 60)}h`,
          icone: "time",
          cor: "#f59e0b",
        },
      ];

      console.log("✅ [StatsService] Estatísticas carregadas:", stats);
      return stats;
    } catch (error) {
      console.warn(
        "⚠️ [StatsService] Erro ao buscar estatísticas, usando padrão:",
        error
      );
      return this.defaultStats;
    }
  }

  /**
   * Retorna estatísticas padrão
   */
  getDefaultStats(): StatItem[] {
    return this.defaultStats;
  }
}

// Instância singleton do serviço
export const statsService = new StatsService();
