import { Course, UserCourse } from "../types/api";
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

      if (
        response &&
        response.success &&
        response.data &&
        response.data.courses &&
        Array.isArray(response.data.courses)
      ) {
        // Estrutura da documentação: { success: true, data: { courses: UserCourse[] }, timestamp: "..." }
        userCoursesArray = response.data.courses;
      } else if (
        response &&
        response.courses &&
        Array.isArray(response.courses)
      ) {
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

      console.log(
        `✅ [CoursesService] ${userCoursesArray.length} cursos do usuário encontrados`
      );
      return userCoursesArray;
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
