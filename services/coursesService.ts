import {
  Course,
  CourseProgressResponse,
  MultipleCourseProgressResponse,
  UserCourse,
} from "@/types/api";
import { httpClient } from "./httpClient";

class CoursesService {
  /**
   * Busca todos os cursos disponíveis
   */
  async getAllCourses(): Promise<UserCourse[]> {
    try {
      console.log("📚 [CoursesService] Buscando todos os cursos...");
      const response = await httpClient.get("/api/courses");
      console.log("✅ [CoursesService] Cursos carregados:", response);

      // Verificar se a resposta tem a estrutura esperada da documentação
      let coursesArray = [];

      if (
        response &&
        response.success &&
        response.data &&
        response.data.courses &&
        Array.isArray(response.data.courses)
      ) {
        // Estrutura da documentação: { success: true, data: { courses: Course[] }, timestamp: "..." }
        coursesArray = response.data.courses;
      } else if (
        response &&
        response.courses &&
        Array.isArray(response.courses)
      ) {
        // Estrutura alternativa: { courses: Course[] }
        coursesArray = response.courses;
      } else if (Array.isArray(response)) {
        // Estrutura alternativa: Course[] diretamente
        coursesArray = response;
      } else if (response && Array.isArray(response.data)) {
        // Estrutura alternativa: { data: Course[] }
        coursesArray = response.data;
      } else {
        console.warn(
          "⚠️ [CoursesService] Resposta da API não tem a estrutura esperada:",
          response
        );
        return [];
      }

      if (coursesArray.length > 0) {
        // Converter Course[] para UserCourse[] para compatibilidade
        const formattedCourses = coursesArray.map((course: Course) => ({
          id: course._id,
          courseId: course._id,
          course: course,
          enrolledAt: new Date().toISOString(),
          progress: {
            completedLectures: 0,
            totalLectures: 0,
            percentage: 0,
          },
          // Preservar campos de acesso premium vindos da API
          canAccess: course.canAccess,
          weekPointsRequired: course.weekPointsRequired,
          userWeekPoints: course.userWeekPoints,
        }));

        console.log(
          `✅ [CoursesService] ${formattedCourses.length} cursos formatados`
        );
        return formattedCourses;
      } else {
        console.log("ℹ️ [CoursesService] Nenhum curso encontrado");
        return [];
      }
    } catch (error) {
      console.error("❌ [CoursesService] Erro ao buscar cursos:", error);
      throw error;
    }
  }

  /**
   * Busca cursos do usuário logado
   * A resposta já inclui informações de progresso, então não é necessário buscar separadamente
   */
  async getUserCourses(): Promise<UserCourse[]> {
    try {
      console.log("📚 [CoursesService] Buscando cursos do usuário...");
      const response = await httpClient.get("/api/user/courses");
      console.log(
        "✅ [CoursesService] Cursos do usuário carregados:",
        response
      );

      // Verificar se a resposta tem a estrutura esperada da documentação
      let userCoursesArray = [];

      // A resposta pode vir em diferentes formatos:
      // 1. { success: true, data: { completed: [...], inProgress: [...] } } - estrutura atual da API
      // 2. { success: true, completed: [...], inProgress: [...] } - estrutura alternativa
      // 3. { success: true, courses: [...] } - quando filtrado por status
      // 4. { success: true, data: { courses: [...] } }
      // 5. Array direto
      
      if (response && response.success) {
        // Verificar primeiro se tem data.completed e data.inProgress (estrutura atual)
        if (response.data && response.data.completed && response.data.inProgress) {
          userCoursesArray = [...response.data.completed, ...response.data.inProgress];
        } else if (response.completed && response.inProgress) {
          // Estrutura alternativa: completed e inProgress no nível raiz
          userCoursesArray = [...response.completed, ...response.inProgress];
        } else if (response.courses && Array.isArray(response.courses)) {
          userCoursesArray = response.courses;
        } else if (response.data && response.data.courses && Array.isArray(response.data.courses)) {
          userCoursesArray = response.data.courses;
        } else if (Array.isArray(response.data)) {
          userCoursesArray = response.data;
        }
      } else if (response && response.courses && Array.isArray(response.courses)) {
        // Estrutura alternativa: { courses: UserCourse[] }
        userCoursesArray = response.courses;
      } else if (Array.isArray(response)) {
        // Estrutura alternativa: UserCourse[] diretamente
        userCoursesArray = response;
      } else if (response && Array.isArray(response.data)) {
        // Estrutura alternativa: { data: UserCourse[] }
        userCoursesArray = response.data;
      } else {
        console.warn(
          "⚠️ [CoursesService] Resposta dos cursos do usuário não tem a estrutura esperada:",
          response
        );
        return [];
      }

      // Mapear os cursos para o formato UserCourse, incluindo progresso que já vem na resposta
      const mappedCourses: UserCourse[] = userCoursesArray.map((courseData: any) => {
        // Extrair informações de progresso da resposta
        // A API retorna progressDetails ou campos diretos (progress, completedLectures, totalLectures)
        const progressDetails = courseData.progressDetails || {};
        const progressPercentage = 
          progressDetails.percentage ?? 
          courseData.progress ?? 
          0;
        const completedLectures = 
          progressDetails.completedLectures ?? 
          courseData.completedLectures ?? 
          0;
        const totalLectures = 
          progressDetails.totalLectures ?? 
          courseData.totalLectures ?? 
          0;

        // Garantir que os valores são numéricos
        const finalProgressPercentage = Number(progressPercentage) || 0;
        const finalCompletedLectures = Number(completedLectures) || 0;
        const finalTotalLectures = Number(totalLectures) || 0;

        // Log para debug do progresso
        console.log(`📊 [CoursesService] Mapeando curso ${courseData.id || courseData._id}:`, {
          progressDetails,
          progress: courseData.progress,
          completedLectures: finalCompletedLectures,
          totalLectures: finalTotalLectures,
          progressPercentage: finalProgressPercentage,
        });

        // Mapear o curso para o formato Course esperado
        const course: Course = {
          _id: courseData.id || courseData._id || courseData.courseId,
          name: courseData.title || courseData.name,
          description: courseData.description || "",
          workload: courseData.workload || 0,
          points: courseData.points || 0,
          premiumPoints: courseData.premiumPoints || null,
          canAccess: courseData.canAccess,
          weekPointsRequired: courseData.weekPointsRequired || null,
          userWeekPoints: courseData.userWeekPoints || null,
          slug: courseData.slug || null,
          banner: courseData.imageUrl ? {
            asset: {
              url: courseData.imageUrl
            }
          } : undefined,
        };

        return {
          id: courseData.id || courseData._id || courseData.courseId,
          courseId: courseData.id || courseData._id || courseData.courseId,
          course: course,
          enrolledAt: courseData.createdAt || new Date().toISOString(),
          completedAt: courseData.completedAt || undefined,
          progress: {
            completedLectures: finalCompletedLectures,
            totalLectures: finalTotalLectures,
            percentage: finalProgressPercentage,
          },
          lastAccessedAt: courseData.lastActivity || undefined,
          // Preservar campos de acesso premium vindos da API
          canAccess: courseData.canAccess,
          weekPointsRequired: courseData.weekPointsRequired || null,
          userWeekPoints: courseData.userWeekPoints || null,
        };
      });

      console.log(
        `✅ [CoursesService] ${mappedCourses.length} cursos do usuário encontrados com progresso incluído`
      );
      return mappedCourses;
    } catch (error) {
      console.error(
        "❌ [CoursesService] Erro ao buscar cursos do usuário:",
        error
      );
      // Retornar array vazio em caso de erro para não quebrar a interface
      return [];
    }
  }

  /**
   * Busca detalhes de um curso específico
   */
  async getCourseById(courseId: string) {
    try {
      console.log(`📚 [CoursesService] Buscando curso ${courseId}...`);
      const response = await httpClient.get(`/api/courses/${courseId}`);
      console.log("✅ [CoursesService] Curso carregado:", response);

      // Verificar se a resposta tem a estrutura esperada da documentação
      let courseData = null;

      if (
        response &&
        response.success &&
        response.data &&
        response.data.course
      ) {
        // Estrutura da documentação: { success: true, data: { course: Course }, timestamp: "..." }
        courseData = response.data.course;
      } else if (response && response._id) {
        // Estrutura real da API: Course diretamente
        courseData = response;
      } else if (response && response.data && response.data._id) {
        // Estrutura alternativa: { data: Course }
        courseData = response.data;
      } else {
        console.warn(
          "⚠️ [CoursesService] Resposta da API não tem a estrutura esperada:",
          response
        );
        throw new Error("Curso não encontrado");
      }

      return courseData;
    } catch (error) {
      console.error(
        `❌ [CoursesService] Erro ao buscar curso ${courseId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Busca aulas de um curso
   */
  async getCourseLectures(courseId: string) {
    try {
      console.log(`📚 [CoursesService] Buscando aulas do curso ${courseId}...`);
      const response = await httpClient.get(
        `/api/lectures?courseId=${courseId}`
      );
      console.log("✅ [CoursesService] Aulas carregadas:", response);

      // Verificar se a resposta tem a estrutura esperada da documentação
      let lecturesData = null;

      if (
        response &&
        response.success &&
        response.data &&
        response.data.lectures
      ) {
        // Estrutura da documentação: { success: true, data: { lectures: Lecture[] }, timestamp: "..." }
        lecturesData = response.data;
      } else if (Array.isArray(response)) {
        // Estrutura real da API: Lecture[] diretamente
        lecturesData = {
          lectures: response,
          course: { _id: courseId },
          progress: {
            completed: 0,
            total: response.length,
            percentage: 0,
          },
        };
      } else if (response && response.lectures) {
        // Estrutura alternativa: { lectures: Lecture[] }
        lecturesData = response;
      } else {
        console.warn(
          "⚠️ [CoursesService] Resposta das aulas não tem a estrutura esperada:",
          response
        );
        return {
          lectures: [],
          course: { _id: courseId },
          progress: {
            completed: 0,
            total: 0,
            percentage: 0,
          },
        };
      }

      return lecturesData;
    } catch (error) {
      console.error(
        `❌ [CoursesService] Erro ao buscar aulas do curso ${courseId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Completa um curso
   */
  async completeCourse(courseId: string) {
    try {
      console.log(`📚 [CoursesService] Completando curso ${courseId}...`);
      const response = await httpClient.post(
        `/api/courses/${courseId}/complete`
      );
      console.log("✅ [CoursesService] Curso completado:", response);
      return response;
    } catch (error) {
      console.error(
        `❌ [CoursesService] Erro ao completar curso ${courseId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Adiciona um curso ao usuário
   */
  async addUserCourse(courseId: string) {
    try {
      console.log(
        `📚 [CoursesService] Adicionando curso ${courseId} ao usuário...`
      );
      const response = await httpClient.post("/api/user/courses", { courseId });
      console.log("✅ [CoursesService] Curso adicionado:", response);
      return response;
    } catch (error) {
      console.error(
        `❌ [CoursesService] Erro ao adicionar curso ${courseId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Busca progresso de um único curso
   */
  async getCourseProgress(
    courseId: string,
    options?: {
      includeLectures?: boolean;
      includeExams?: boolean;
    }
  ): Promise<CourseProgressResponse> {
    try {
      console.log(`📊 [CoursesService.getCourseProgress] ==========================================`);
      console.log(`📊 [CoursesService.getCourseProgress] Iniciando busca de progresso...`);
      console.log(`📊 [CoursesService.getCourseProgress] Course ID: ${courseId}`);
      console.log(`📊 [CoursesService.getCourseProgress] Opções:`, {
        includeLectures: options?.includeLectures ?? false,
        includeExams: options?.includeExams ?? false,
      });
      
      const params = new URLSearchParams();
      if (options?.includeLectures) {
        params.append("includeLectures", "true");
      }
      if (options?.includeExams) {
        params.append("includeExams", "true");
      }
      
      const url = `/api/courses/${courseId}/progress${params.toString() ? `?${params.toString()}` : ""}`;
      console.log(`📊 [CoursesService.getCourseProgress] URL: ${url}`);
      console.log(`📊 [CoursesService.getCourseProgress] Fazendo requisição GET...`);
      
      const startTime = Date.now();
      const response = await httpClient.get<any>(url);
      const duration = Date.now() - startTime;
      
      console.log(`✅ [CoursesService.getCourseProgress] Requisição concluída em ${duration}ms`);
      
      // Extrair dados da resposta - pode vir em diferentes estruturas
      let progressData: CourseProgressResponse | null = null;
      
      if (response && response.success) {
        // Estrutura 1: { success: true, data: { course, progress, lectures, certificate } }
        if (response.data && response.data.course && response.data.progress) {
          progressData = {
            success: true,
            course: response.data.course,
            progress: response.data.progress,
            certificate: response.data.certificate || null,
            lectures: response.data.lectures || undefined,
            exams: response.data.exams || undefined,
            examStats: response.data.examStats || undefined,
            lastActivity: response.data.lastActivity || new Date().toISOString(),
          };
        }
        // Estrutura 2: { success: true, course, progress, lectures, certificate } (dados no nível raiz)
        else if (response.course && response.progress) {
          progressData = {
            success: true,
            course: response.course,
            progress: response.progress,
            certificate: response.certificate || null,
            lectures: response.lectures || undefined,
            exams: response.exams || undefined,
            examStats: response.examStats || undefined,
            lastActivity: response.lastActivity || new Date().toISOString(),
          };
        }
      }
      
      if (progressData) {
        console.log(`✅ [CoursesService.getCourseProgress] Progresso válido retornado para curso ${courseId}`);
        console.log(`✅ [CoursesService.getCourseProgress] Resposta processada:`, {
          hasCourse: !!progressData.course,
          hasProgress: !!progressData.progress,
          progressPercentage: progressData.progress.percentage,
          completedLectures: progressData.progress.completedLectures,
          totalLectures: progressData.progress.totalLectures,
          hasLectures: !!progressData.lectures,
          lecturesCount: progressData.lectures?.length ?? 0,
        });
        console.log(`📊 [CoursesService.getCourseProgress] ==========================================`);
        return progressData;
      } else {
        console.warn(
          "⚠️ [CoursesService.getCourseProgress] Resposta do progresso não tem a estrutura esperada:",
          response
        );
        throw new Error("Resposta inválida do servidor");
      }
    } catch (error) {
      console.error(
        `❌ [CoursesService.getCourseProgress] Erro ao buscar progresso do curso ${courseId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Busca progresso de múltiplos cursos de uma vez
   */
  async getMultipleCoursesProgress(
    courseIds: string[],
    options?: {
      includeLectures?: boolean;
      includeExams?: boolean;
    }
  ): Promise<MultipleCourseProgressResponse> {
    try {
      console.log(`📊 [CoursesService.getMultipleCoursesProgress] ==========================================`);
      console.log(`📊 [CoursesService.getMultipleCoursesProgress] Iniciando busca de progresso de múltiplos cursos`);
      console.log(`📊 [CoursesService.getMultipleCoursesProgress] Total de cursos: ${courseIds.length}`);
      console.log(`📊 [CoursesService.getMultipleCoursesProgress] IDs dos cursos:`, courseIds);
      console.log(`📊 [CoursesService.getMultipleCoursesProgress] Opções:`, {
        includeLectures: options?.includeLectures ?? false,
        includeExams: options?.includeExams ?? false,
      });
      
      if (courseIds.length === 0) {
        console.log(`ℹ️ [CoursesService.getMultipleCoursesProgress] Nenhum curso para buscar, retornando array vazio`);
        return {
          success: true,
          courses: [],
          total: 0,
        };
      }
      
      const params = new URLSearchParams();
      params.append("courseIds", courseIds.join(","));
      if (options?.includeLectures) {
        params.append("includeLectures", "true");
      }
      if (options?.includeExams) {
        params.append("includeExams", "true");
      }
      
      // Usar o primeiro ID no path (será ignorado se courseIds estiver presente)
      const url = `/api/courses/${courseIds[0]}/progress?${params.toString()}`;
      console.log(`📊 [CoursesService.getMultipleCoursesProgress] URL: ${url}`);
      console.log(`📊 [CoursesService.getMultipleCoursesProgress] Fazendo requisição GET...`);
      
      const startTime = Date.now();
      const response = await httpClient.get<MultipleCourseProgressResponse>(url);
      const duration = Date.now() - startTime;
      
      console.log(`✅ [CoursesService.getMultipleCoursesProgress] Requisição concluída em ${duration}ms`);
      console.log(`✅ [CoursesService.getMultipleCoursesProgress] Resposta recebida:`, {
        success: response?.success,
        total: response?.total,
        coursesCount: response?.courses?.length ?? 0,
      });
      
      if (response?.courses && response.courses.length > 0) {
        console.log(`📊 [CoursesService.getMultipleCoursesProgress] Detalhes dos cursos retornados:`);
        response.courses.forEach((courseData, index) => {
          console.log(`  [${index + 1}] Curso ID: ${courseData.course.id}`);
          console.log(`      Nome: ${courseData.course.name}`);
          console.log(`      Progresso: ${courseData.progress.percentage}%`);
          console.log(`      Aulas: ${courseData.progress.completedLectures}/${courseData.progress.totalLectures}`);
          console.log(`      Status: ${courseData.progress.status}`);
          console.log(`      Concluído: ${courseData.progress.isCompleted ? 'Sim' : 'Não'}`);
        });
      }
      
      // Verificar estrutura da resposta
      if (response && response.success && Array.isArray(response.courses)) {
        console.log(`✅ [CoursesService.getMultipleCoursesProgress] Progresso válido retornado para ${response.courses.length} cursos`);
        console.log(`📊 [CoursesService.getMultipleCoursesProgress] ==========================================`);
        return response;
      } else {
        console.warn(
          "⚠️ [CoursesService.getMultipleCoursesProgress] Resposta do progresso de múltiplos cursos não tem a estrutura esperada:",
          response
        );
        throw new Error("Resposta inválida do servidor");
      }
    } catch (error) {
      console.error(
        `❌ [CoursesService.getMultipleCoursesProgress] Erro ao buscar progresso de múltiplos cursos:`,
        error
      );
      throw error;
    }
  }

  /**
   * Filtra cursos para mostrar apenas os não matriculados
   */
  getExploreCourses(
    allCourses: UserCourse[],
    userCourses: UserCourse[]
  ): UserCourse[] {
    if (!allCourses || allCourses.length === 0) {
      return [];
    }

    if (!userCourses || userCourses.length === 0) {
      return allCourses;
    }

    // Para usuários logados, mostrar apenas cursos que não estão matriculados
    const userCourseIds = userCourses.map((uc) => uc.courseId);
    return allCourses.filter(
      (course) => !userCourseIds.includes(course.courseId)
    );
  }
}

// Instância singleton do serviço
export const coursesService = new CoursesService();
