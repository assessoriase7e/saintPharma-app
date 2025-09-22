import { useAuth } from "@clerk/clerk-expo";
import {
  ApiConfig,
  ApiError,
  CertificateCreateRequest,
  CertificateCreateResponse,
  CertificatesResponse,
  CompleteLectureRequest,
  CourseCompleteResponse,
  CourseDetailResponse,
  CoursesResponse,
  CreateExamRequest,
  ExamResponse,
  LectureDetailResponse,
  LecturesResponse,
  Lives,
  QuestionResponse,
  RankingResponse,
  SanityRevalidateRequest,
  SanityRevalidateResponse,
  UpdateExamRequest,
  UserCoursesResponse,
  UserInfoResponse,
  UserLectureResponse,
  UserPointsResponse,
  UserProgressResponse,
  UserSummaryResponse,
} from "../types/api";

class ApiClient {
  private config: ApiConfig;

  constructor() {
    this.config = {
      baseUrl: process.env.EXPO_PUBLIC_API_BASE_URL as string,
      apiToken: process.env.EXPO_PUBLIC_API_TOKEN || "",
    };
  }

  setUserId(userId: string) {
    this.config.userId = userId;
  }

  private translateErrorMessage(errorMessage: string): string {
    const errorTranslations: Record<string, string> = {
      "Header X-User-Id é obrigatório":
        "Erro de autenticação. Faça login novamente.",
      "lectureCMSid é obrigatório":
        "Dados da aula não encontrados. Tente novamente.",
      "Usuário não encontrado": "Usuário não encontrado. Verifique sua conta.",
      "Lecture não encontrada":
        "Aula não encontrada. Verifique se ela ainda está disponível.",
      "Quiz não encontrado para esta lecture":
        "Esta aula não possui questionário disponível.",
      "Network error occurred":
        "Erro de conexão. Verifique sua internet e tente novamente.",
    };

    // Verifica se existe uma tradução específica
    if (errorTranslations[errorMessage]) {
      return errorTranslations[errorMessage];
    }

    // Verifica se a mensagem contém alguma das chaves conhecidas
    for (const [key, translation] of Object.entries(errorTranslations)) {
      if (errorMessage.includes(key)) {
        return translation;
      }
    }

    // Traduz erros HTTP genéricos
    if (errorMessage.includes("HTTP 400")) {
      return "Dados inválidos. Verifique as informações e tente novamente.";
    }
    if (errorMessage.includes("HTTP 401")) {
      return "Acesso negado. Faça login novamente.";
    }
    if (errorMessage.includes("HTTP 403")) {
      return "Você não tem permissão para realizar esta ação.";
    }
    if (errorMessage.includes("HTTP 404")) {
      return "Conteúdo não encontrado.";
    }
    if (errorMessage.includes("HTTP 500")) {
      return "Erro interno do servidor. Tente novamente mais tarde.";
    }

    // Retorna a mensagem original se não houver tradução
    return errorMessage;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.config.apiToken}`,
      ...(options.headers as Record<string, string>),
    };

    // Adiciona o header X-User-Id se o userId estiver disponível
    if (this.config.userId) {
      headers["X-User-Id"] = this.config.userId;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({
          error: `HTTP ${response.status}: ${response.statusText}`,
        }));

        const originalError =
          errorData.error || `Request failed with status ${response.status}`;
        const translatedError = this.translateErrorMessage(originalError);

        throw new Error(translatedError);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        // Traduz a mensagem de erro antes de relançar
        const translatedMessage = this.translateErrorMessage(error.message);
        throw new Error(translatedMessage);
      }
      throw new Error(this.translateErrorMessage("Network error occurred"));
    }
  }

  // Métodos de Autenticação
  async getUserInfo(): Promise<UserInfoResponse> {
    return this.request<UserInfoResponse>("/auth/user");
  }

  // Nota: Login e logout são gerenciados pelo Clerk
  // Removidos métodos login() e logout()

  // Métodos de Cursos
  async getCourses(): Promise<CoursesResponse> {
    return this.request<CoursesResponse>("/courses");
  }

  async getCourseById(id: string): Promise<CourseDetailResponse> {
    return this.request<CourseDetailResponse>(`/courses/${id}`);
  }

  async completeCourse(id: string): Promise<CourseCompleteResponse> {
    return this.request<CourseCompleteResponse>(`/courses/${id}/complete`, {
      method: "POST",
    });
  }

  // Métodos de Aulas
  async getLectures(courseId: string): Promise<LecturesResponse> {
    return this.request<LecturesResponse>(`/lectures?courseId=${courseId}`);
  }

  async getLecture(id: string): Promise<LectureDetailResponse> {
    return this.request<LectureDetailResponse>(`/lectures/${id}`);
  }

  async completeLecture(
    id: string,
    data: CompleteLectureRequest
  ): Promise<UserLectureResponse> {
    return this.request<UserLectureResponse>(`/lectures/${id}/complete`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Métodos de Exames
  async createExam(data: CreateExamRequest): Promise<ExamResponse> {
    return this.request<ExamResponse>("/exams", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getExam(id: string): Promise<ExamResponse> {
    return this.request<ExamResponse>(`/exams/${id}`);
  }

  async updateExam(id: string, data: UpdateExamRequest): Promise<ExamResponse> {
    return this.request<ExamResponse>(`/exams/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteExam(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/exams/${id}`, {
      method: "DELETE",
    });
  }

  // Método para buscar questões de uma aula
  async getLectureQuestions(lectureId: string): Promise<QuestionResponse> {
    return this.request<QuestionResponse>(`/lectures/${lectureId}/questions`);
  }

  // Métodos de Certificados
  async getCertificates(): Promise<CertificatesResponse> {
    return this.request<CertificatesResponse>("/certificates");
  }

  async createCertificate(
    data: CertificateCreateRequest
  ): Promise<CertificateCreateResponse> {
    return this.request<CertificateCreateResponse>("/certificate/create", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Métodos de Ranking
  async getRanking(): Promise<RankingResponse> {
    return this.request<RankingResponse>("/ranking");
  }

  async getUserPoints(): Promise<UserPointsResponse> {
    return this.request<UserPointsResponse>("/ranking/user");
  }

  // Métodos de Vidas
  async getUserLives(): Promise<Lives> {
    return this.request<Lives>("/user/lives");
  }

  async updateUserLives(
    action: "reduce" | "delete_damage" | "reset_all",
    options?: {
      amount?: number;
      damageId?: string;
    }
  ): Promise<{ message: string }> {
    return this.request<{ message: string }>("/user/lives", {
      method: "DELETE",
      body: JSON.stringify({
        action,
        ...options,
      }),
    });
  }

  // Métodos de Pontuação
  async updateUserPoints(
    operation: "add" | "subtract" | "set",
    points: number
  ): Promise<{ message: string }> {
    return this.request<{ message: string }>("/user/points", {
      method: "PUT",
      body: JSON.stringify({
        operation,
        points,
      }),
    });
  }

  // Métodos de Resumo
  async getUserSummary(
    period: "week" | "month" | "all" = "all"
  ): Promise<UserSummaryResponse> {
    return this.request<UserSummaryResponse>(`/user/summary?period=${period}`);
  }

  // Métodos de Progresso
  async getUserProgress(
    courseId?: string,
    status?: string
  ): Promise<UserProgressResponse> {
    const params = new URLSearchParams();
    if (courseId) params.append("courseId", courseId);
    if (status) params.append("status", status);

    const queryString = params.toString();
    return this.request<UserProgressResponse>(
      `/user/progress${queryString ? `?${queryString}` : ""}`
    );
  }

  // Métodos de Cursos do Usuário
  async addUserCourse(courseId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>("/user/courses", {
      method: "POST",
      body: JSON.stringify({ courseId }),
    });
  }

  async getUserCourses(status?: string): Promise<UserCoursesResponse> {
    const params = new URLSearchParams();
    if (status) params.append("status", status);

    const queryString = params.toString();
    return this.request<UserCoursesResponse>(
      `/user/courses${queryString ? `?${queryString}` : ""}`
    );
  }

  // Métodos de Sanity
  async revalidateSanity(
    data: SanityRevalidateRequest
  ): Promise<SanityRevalidateResponse> {
    return this.request<SanityRevalidateResponse>("/sanity/revalidate", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
}

// Instância singleton do cliente da API
export const apiClient = new ApiClient();

// Hook para usar o cliente da API com autenticação automática
export const useApiClient = () => {
  const { userId } = useAuth();

  // Atualiza o userId no cliente sempre que mudar
  if (userId && apiClient["config"].userId !== userId) {
    apiClient.setUserId(userId);
  }

  return apiClient;
};

export default apiClient;
