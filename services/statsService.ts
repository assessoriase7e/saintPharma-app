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
   * Os dados são obtidos diretamente da API /api/user/summary
   */
  async getUserStats(): Promise<StatItem[]> {
    try {
      console.log("📊 [StatsService] Buscando estatísticas do usuário...");

      const summaryResponse = await userService.getUserSummary();
      
      // Extrair dados da estrutura normalizada: { success: true, data: { courses: {...}, studyHours: {...} } }
      const coursesData = summaryResponse?.data?.courses;
      const studyHoursData = summaryResponse?.data?.studyHours;
      
      console.log("📊 [StatsService] Dados extraídos:", {
        courses: coursesData,
        studyHours: studyHoursData,
        fullResponse: summaryResponse,
      });

      // Usar dados da API se disponíveis, senão usar valores padrão
      const completed = coursesData?.completed ?? 0;
      const inProgress = coursesData?.inProgress ?? 0;
      const totalHours = studyHoursData?.total ?? 0;

      const stats: StatItem[] = [
        {
          titulo: "Concluídos",
          valor: completed.toString(),
          icone: "checkmark-circle",
          cor: "#10b981",
        },
        {
          titulo: "Em Progresso",
          valor: inProgress.toString(),
          icone: "play-circle",
          cor: "#3b82f6",
        },
        {
          titulo: "Horas Estudadas",
          valor: `${Math.floor(totalHours)}h`,
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

