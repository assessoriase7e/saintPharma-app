import {
  CompleteLectureRequest,
  LectureDetailResponse,
  LecturesResponse,
  UserLectureResponse,
} from "../types/api";
import { httpClient } from "./httpClient";

class LecturesService {
  /**
   * Busca detalhes de uma aula específica
   */
  async getLecture(lectureId: string): Promise<LectureDetailResponse> {
    try {
      console.log(`📖 [LecturesService] Buscando aula ${lectureId}...`);
      const response = await httpClient.get(`/api/lectures/${lectureId}`);
      console.log("✅ [LecturesService] Aula carregada:", response);

      // Verificar se a resposta tem a estrutura esperada da documentação
      let lectureData = null;

      if (
        response &&
        response.success &&
        response.data &&
        response.data.lecture
      ) {
        // Estrutura da documentação: { success: true, data: { lecture: Lecture }, timestamp: "..." }
        lectureData = response.data.lecture;
      } else if (response && response._id) {
        // Estrutura real da API: Lecture diretamente
        lectureData = response;
      } else if (response && response.data && response.data._id) {
        // Estrutura alternativa: { data: Lecture }
        lectureData = response.data;
      } else {
        console.warn(
          "⚠️ [LecturesService] Resposta da aula não tem a estrutura esperada:",
          response
        );
        throw new Error("Aula não encontrada");
      }

      return lectureData;
    } catch (error) {
      console.error(
        `❌ [LecturesService] Erro ao buscar aula ${lectureId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Busca aulas de um curso
   */
  async getLectures(courseId: string): Promise<LecturesResponse> {
    try {
      console.log(
        `📖 [LecturesService] Buscando aulas do curso ${courseId}...`
      );
      const response = await httpClient.get(
        `/api/lectures?courseId=${courseId}`
      );
      console.log("✅ [LecturesService] Aulas carregadas:", response);

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
          "⚠️ [LecturesService] Resposta das aulas não tem a estrutura esperada:",
          response
        );
        return {
          lectures: [],
          course: { _id: courseId, name: "Curso" },
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
        `❌ [LecturesService] Erro ao buscar aulas do curso ${courseId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Completa uma aula
   */
  async completeLecture(
    lectureId: string,
    data: CompleteLectureRequest
  ): Promise<UserLectureResponse> {
    try {
      console.log(`📖 [LecturesService] Completando aula ${lectureId}...`);
      const response = await httpClient.post(
        `/api/lectures/${lectureId}/complete`,
        data
      );
      console.log("✅ [LecturesService] Aula completada:", response);
      return response;
    } catch (error) {
      console.error(
        `❌ [LecturesService] Erro ao completar aula ${lectureId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Busca questões de uma aula
   */
  async getLectureQuestions(lectureId: string) {
    try {
      console.log(
        `📖 [LecturesService] Buscando questões da aula ${lectureId}...`
      );
      const response = await httpClient.get(
        `/api/lectures/${lectureId}/questions`
      );
      console.log("✅ [LecturesService] Questões carregadas:", response);
      return response;
    } catch (error) {
      console.error(
        `❌ [LecturesService] Erro ao buscar questões da aula ${lectureId}:`,
        error
      );
      throw error;
    }
  }
}

// Instância singleton do serviço
export const lecturesService = new LecturesService();
