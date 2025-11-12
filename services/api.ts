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
} from "@/types/api";

class ApiClient {
  private config: ApiConfig;

  constructor() {
    const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
    const apiToken = process.env.EXPO_PUBLIC_API_TOKEN;

    // Log de configuração para debug
    console.log("🔧 [ApiClient] Inicializando com configuração:", {
      baseUrl: baseUrl || "❌ NÃO CONFIGURADO",
      hasToken: !!apiToken,
      tokenLength: apiToken?.length || 0,
      allEnvVars: Object.keys(process.env)
        .filter((key) => key.startsWith("EXPO_PUBLIC"))
        .map((key) => `${key}=${process.env[key]?.substring(0, 20)}...`),
    });

    // Validar se as variáveis de ambiente estão configuradas
    if (!baseUrl) {
      const errorMessage = 
        "❌ [ApiClient] EXPO_PUBLIC_API_BASE_URL não está configurada!\n" +
        "Crie um arquivo .env na raiz do projeto com:\n" +
        "EXPO_PUBLIC_API_BASE_URL=http://localhost:3000/api\n" +
        "EXPO_PUBLIC_API_TOKEN=seu-token-aqui";
      
      console.error(errorMessage);
    }

    if (!apiToken) {
      console.warn("⚠️ [ApiClient] EXPO_PUBLIC_API_TOKEN não está configurado!");
    }

    this.config = {
      baseUrl: baseUrl || "",
      apiToken: apiToken || "",
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
    // Validar se baseUrl está configurada antes de fazer a requisição
    if (!this.config.baseUrl) {
      const errorMessage = 
        "URL base da API não configurada. Verifique as variáveis de ambiente no arquivo .env";
      console.error(`❌ [ApiClient] ${errorMessage}`);
      throw new Error(errorMessage);
    }

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
      console.log(`🌐 [ApiClient.request] Iniciando requisição para: ${url}`);
      console.log(`🌐 [ApiClient.request] BaseURL: ${this.config.baseUrl}`);
      console.log(`🌐 [ApiClient.request] URL completa: ${url}`);
      console.log(`🌐 [ApiClient.request] Método: ${options.method || "GET"}`);
      console.log(`🌐 [ApiClient.request] Headers:`, headers);
      
      const response = await fetch(url, config);
      
      console.log(`📡 [ApiClient.request] Resposta recebida:`, {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url,
      });

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
  // Nota: Usa /api/user pois a autenticação é gerenciada pelo Clerk
  async getUserInfo(): Promise<UserInfoResponse> {
    return this.request<UserInfoResponse>("/api/user");
  }

  // Nota: Login e logout são gerenciados pelo Clerk
  // Removidos métodos login() e logout()

  // Métodos de Cursos
  async getCourses(): Promise<CoursesResponse> {
    return this.request<CoursesResponse>("/api/courses");
  }

  async getCourseById(id: string): Promise<CourseDetailResponse> {
    return this.request<CourseDetailResponse>(`/api/courses/${id}`);
  }

  async completeCourse(id: string): Promise<CourseCompleteResponse> {
    return this.request<CourseCompleteResponse>(`/api/courses/${id}/complete`, {
      method: "POST",
    });
  }

  // Métodos de Aulas
  async getLectures(courseId: string): Promise<LecturesResponse> {
    return this.request<LecturesResponse>(`/api/lectures?courseId=${courseId}`);
  }

  async getLecture(id: string): Promise<LectureDetailResponse> {
    return this.request<LectureDetailResponse>(`/api/lectures/${id}`);
  }

  async completeLecture(
    id: string,
    data: CompleteLectureRequest
  ): Promise<UserLectureResponse> {
    return this.request<UserLectureResponse>(`/api/lectures/${id}/complete`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Métodos de Exames
  async getExams(): Promise<{ exams: ExamResponse['data']['exam'][] }> {
    return this.request<{ exams: ExamResponse['data']['exam'][] }>("/api/exams");
  }

  async checkExamEligibility() {
    return this.request("/api/exams/eligibility");
  }

  async createExam(data: CreateExamRequest): Promise<ExamResponse> {
    return this.request<ExamResponse>("/api/exams", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getExam(id: string): Promise<ExamResponse> {
    return this.request<ExamResponse>(`/api/exams/${id}`);
  }

  async getExamQuestions(id: string) {
    return this.request(`/api/exams/${id}/questions`);
  }

  async submitExam(id: string, data: any) {
    return this.request(`/api/exams/${id}/submit`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getExamAttempts(id: string, page: number = 0, limit: number = 10) {
    return this.request(
      `/api/exams/${id}/attempts?page=${page}&limit=${limit}`
    );
  }

  // Rotas de usuário
  async createUser(data: any) {
    return this.request("/api/user/create", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async bulkCreateUsers(data: any) {
    return this.request("/api/user/bulk-create", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getUser(clerkId?: string) {
    const url = clerkId ? `/api/user?clerkId=${clerkId}` : "/api/user";
    return this.request(url);
  }

  async getUserProfile(clerkId?: string) {
    const url = clerkId
      ? `/api/user/profile?clerkId=${clerkId}`
      : "/api/user/profile";
    return this.request(url);
  }

  async getUserStats(
    clerkId?: string,
    period: string = "all",
    includeDetails: boolean = false
  ) {
    const params = new URLSearchParams({
      period,
      includeDetails: includeDetails.toString(),
    });
    if (clerkId) params.append("clerkId", clerkId);
    return this.request(`/api/user/stats?${params.toString()}`);
  }

  async getUserActivities(
    clerkId?: string,
    type: string = "all",
    period: string = "all",
    page: number = 1,
    limit: number = 20
  ) {
    const params = new URLSearchParams({
      type,
      period,
      page: page.toString(),
      limit: limit.toString(),
    });
    if (clerkId) params.append("clerkId", clerkId);
    return this.request(`/api/user/activities?${params.toString()}`);
  }

  async updateUser(data: any) {
    return this.request("/api/user/update", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async completeUser(data: any) {
    return this.request("/api/user/complete", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async updateExam(id: string, data: UpdateExamRequest): Promise<ExamResponse> {
    return this.request<ExamResponse>(`/api/exams/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteExam(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/exams/${id}`, {
      method: "DELETE",
    });
  }

  // Método para buscar questões de uma aula
  async getLectureQuestions(lectureId: string): Promise<QuestionResponse> {
    return this.request<QuestionResponse>(
      `/api/lectures/${lectureId}/questions`
    );
  }

  // Métodos de Certificados
  async getCertificates(): Promise<CertificatesResponse> {
    return this.request<CertificatesResponse>("/api/certificate");
  }

  async getCertificateById(certificateId: string) {
    return this.request(`/api/certificate/${certificateId}`);
  }

  async createCertificate(
    data: CertificateCreateRequest
  ): Promise<CertificateCreateResponse> {
    return this.request<CertificateCreateResponse>("/api/certificate/create", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Métodos de Ranking
  async getRanking(page: number = 1, limit: number = 20): Promise<RankingResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    const response = await this.request<RankingResponse>(`/api/ranking?${params.toString()}`);
    
    // Verificar se a resposta tem a estrutura esperada
    if (response && response.success && response.ranking && response.pagination && response.week) {
      return response;
    }
    
    // Fallback para estrutura incompleta
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
  }

  async getUserPoints(): Promise<UserPointsResponse> {
    return this.request<UserPointsResponse>("/api/ranking/user");
  }

  // Métodos de Vidas
  async getUserLives(): Promise<Lives> {
    return this.request<Lives>("/api/user/lives");
  }

  async updateUserLives(
    amount?: number
  ): Promise<{ message: string }> {
    const body = amount !== undefined ? { amount } : {};
    return this.request<{ message: string }>("/api/user/lives", {
      method: "DELETE",
      body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined,
    });
  }

  // Métodos de Pontuação
  async updateUserPoints(
    points: number,
    operation?: "add" | "subtract" | "set",
    reason?: string
  ): Promise<{ message: string }> {
    const body: any = { points };
    if (operation) body.operation = operation;
    if (reason) body.reason = reason;
    return this.request<{ message: string }>("/api/user/points", {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  // Métodos de Resumo
  async getUserSummary(
    period: "week" | "month" | "all" = "all"
  ): Promise<UserSummaryResponse> {
    return this.request<UserSummaryResponse>(
      `/api/user/summary?period=${period}`
    );
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
      `/api/user/progress${queryString ? `?${queryString}` : ""}`
    );
  }

  // Métodos de Cursos do Usuário
  async addUserCourse(courseId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>("/api/user/courses", {
      method: "POST",
      body: JSON.stringify({ courseId }),
    });
  }

  async getUserCourses(status?: string): Promise<UserCoursesResponse> {
    const params = new URLSearchParams();
    if (status) params.append("status", status);

    const queryString = params.toString();
    return this.request<UserCoursesResponse>(
      `/api/user/courses${queryString ? `?${queryString}` : ""}`
    );
  }

  // Métodos de Sanity
  async revalidateSanity(
    data: SanityRevalidateRequest
  ): Promise<SanityRevalidateResponse> {
    return this.request<SanityRevalidateResponse>("/api/sanity/revalidate", {
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
