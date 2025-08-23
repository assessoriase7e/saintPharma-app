import { useAuth } from "@clerk/clerk-expo";
import {
  ApiConfig,
  ApiError,
  CertificatesResponse,
  CompleteLectureRequest,
  CourseCompleteResponse,
  CourseDetailResponse,
  CoursesResponse,
  CreateExamRequest,
  ExamResponse,
  LecturesResponse,
  Lives,
  RankingResponse,
  UpdateExamRequest,
  UserInfoResponse,
  UserLectureResponse,
  UserPointsResponse,
} from "../app/types/api";

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
        throw new Error(
          errorData.error || `Request failed with status ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error occurred");
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

  // Métodos de Certificados
  async getCertificates(page = 0, limit = 10): Promise<CertificatesResponse> {
    return this.request<CertificatesResponse>(
      `/certificates?page=${page}&limit=${limit}`
    );
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
  async getUserSummary(period: "week" | "month" | "all" = "all"): Promise<any> {
    return this.request<any>(`/user/summary?period=${period}`);
  }

  // Métodos de Progresso
  async getUserProgress(courseId?: string, status?: string): Promise<any> {
    const params = new URLSearchParams();
    if (courseId) params.append("courseId", courseId);
    if (status) params.append("status", status);

    const queryString = params.toString();
    return this.request<any>(
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

  async getUserCourses(page = 1, limit = 10): Promise<any> {
    return this.request<any>(`/user/courses?page=${page}&limit=${limit}`);
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
