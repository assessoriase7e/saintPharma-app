import {
  CreateExamRequest,
  ExamAttemptsResponse,
  ExamEligibilityResponse,
  ExamQuestionsResponse,
  ExamResponse,
  ExamSubmitRequest,
  ExamSubmitResponse,
  UpdateExamRequest,
} from "@/types/api";
import { httpClient } from "./httpClient";

class ExamsService {
  /**
   * Lista todos os exames do usuário
   */
  async getExams(): Promise<{ exams: ExamResponse['data']['exam'][] }> {
    try {
      console.log("📝 [ExamsService] Buscando exames do usuário...");
      const response = await httpClient.get("/api/exams");
      console.log("✅ [ExamsService] Exames carregados:", response);

      // Verificar se a resposta tem a estrutura esperada da documentação
      let examsArray = [];

      if (
        response &&
        response.success &&
        response.data &&
        Array.isArray(response.data.exams)
      ) {
        // Estrutura da documentação: { success: true, data: { exams: Exam[] }, timestamp: "..." }
        examsArray = response.data.exams;
      } else if (
        response &&
        response.exams &&
        Array.isArray(response.exams)
      ) {
        // Estrutura alternativa: { exams: Exam[] }
        examsArray = response.exams;
      } else if (Array.isArray(response)) {
        // Estrutura alternativa: Exam[] diretamente
        examsArray = response;
      } else if (
        response &&
        response.data &&
        Array.isArray(response.data)
      ) {
        // Estrutura alternativa: { data: Exam[] }
        examsArray = response.data;
      } else {
        console.warn(
          "⚠️ [ExamsService] Resposta dos exames não tem a estrutura esperada:",
          response
        );
        return { exams: [] };
      }

      return { exams: examsArray };
    } catch (error) {
      console.error("❌ [ExamsService] Erro ao buscar exames:", error);
      throw error;
    }
  }

  /**
   * Verifica se o usuário pode iniciar um exame (tem vidas disponíveis)
   */
  async checkExamEligibility(): Promise<ExamEligibilityResponse> {
    try {
      console.log("📝 [ExamsService] Verificando elegibilidade para exame...");
      const response = await httpClient.get("/api/exams/eligibility");
      console.log("✅ [ExamsService] Elegibilidade verificada:", response);

      // Verificar se a resposta tem a estrutura esperada da documentação
      let eligibilityData = null;

      if (response && response.success && response.data) {
        // Estrutura da documentação: { success: true, data: { canTakeExam: boolean, ... }, timestamp: "..." }
        eligibilityData = response;
      } else if (response && typeof response.canTakeExam === "boolean") {
        // Estrutura alternativa: { canTakeExam: boolean, remainingLives: number, ... }
        eligibilityData = {
          success: true,
          data: response,
          timestamp: new Date().toISOString(),
        };
      } else {
        console.warn(
          "⚠️ [ExamsService] Resposta da elegibilidade não tem a estrutura esperada:",
          response
        );
        throw new Error("Erro ao verificar elegibilidade");
      }

      return eligibilityData;
    } catch (error) {
      console.error(
        "❌ [ExamsService] Erro ao verificar elegibilidade:",
        error
      );
      throw error;
    }
  }

  /**
   * Cria um novo exame
   */
  async createExam(data: CreateExamRequest): Promise<ExamResponse> {
    try {
      console.log("📝 [ExamsService] Criando exame...");
      const response = await httpClient.post("/api/exams", data);
      console.log("✅ [ExamsService] Exame criado:", response);

      // Verificar se a resposta tem a estrutura esperada da documentação
      let examData = null;

      if (response && response.success && response.data) {
        // Estrutura da documentação: { success: true, data: { exam: {...}, quiz: {...}, lecture: {...} }, timestamp: "..." }
        examData = response;
      } else if (response && response.exam) {
        // Estrutura da documentação direta: { success: true, exam: {...}, quiz: {...}, lecture: {...} }
        examData = {
          success: true,
          data: {
            exam: response.exam,
            quiz: response.quiz,
            lecture: response.lecture,
          },
          timestamp: new Date().toISOString(),
        };
      } else if (response && response.success && response.exam) {
        // Estrutura alternativa com success: { success: true, exam: {...}, quiz: {...}, lecture: {...} }
        examData = {
          success: true,
          data: {
            exam: response.exam,
            quiz: response.quiz,
            lecture: response.lecture,
          },
          timestamp: response.timestamp || new Date().toISOString(),
        };
      } else {
        console.warn(
          "⚠️ [ExamsService] Resposta da criação do exame não tem a estrutura esperada:",
          response
        );
        throw new Error("Erro ao criar exame");
      }

      return examData;
    } catch (error) {
      console.error("❌ [ExamsService] Erro ao criar exame:", error);
      throw error;
    }
  }

  /**
   * Busca um exame específico
   */
  async getExam(examId: string): Promise<ExamResponse> {
    try {
      console.log(`📝 [ExamsService] Buscando exame ${examId}...`);
      const response = await httpClient.get(`/api/exams/${examId}`);
      console.log("✅ [ExamsService] Exame carregado:", response);

      // Verificar se a resposta tem a estrutura esperada da documentação
      let examData = null;

      if (response && response.success && response.data && response.data.exam) {
        // Estrutura da documentação: { success: true, data: { exam: {...} }, timestamp: "..." }
        examData = response;
      } else if (
        response &&
        response.success &&
        response.data &&
        response.data.id
      ) {
        // Estrutura alternativa: { success: true, data: { id: "...", lectureCMSid: "...", ... }, timestamp: "..." }
        examData = {
          success: true,
          data: {
            exam: response.data,
          },
          timestamp: response.timestamp || new Date().toISOString(),
        };
      } else if (response && response.exam) {
        // Estrutura alternativa: { exam: {...} }
        examData = {
          success: true,
          data: response,
          timestamp: new Date().toISOString(),
        };
      } else if (response && response.id) {
        // Estrutura direta: Exam diretamente
        examData = {
          success: true,
          data: {
            exam: response,
          },
          timestamp: new Date().toISOString(),
        };
      } else {
        console.warn(
          "⚠️ [ExamsService] Resposta do exame não tem a estrutura esperada:",
          response
        );
        throw new Error("Exame não encontrado");
      }

      return examData;
    } catch (error) {
      console.error(`❌ [ExamsService] Erro ao buscar exame ${examId}:`, error);
      throw error;
    }
  }

  /**
   * Atualiza um exame
   */
  async updateExam(
    examId: string,
    data: UpdateExamRequest
  ): Promise<ExamResponse> {
    try {
      console.log(`📝 [ExamsService] Atualizando exame ${examId}...`);
      const response = await httpClient.put(`/api/exams/${examId}`, data);
      console.log("✅ [ExamsService] Exame atualizado:", response);

      // Verificar se a resposta tem a estrutura esperada da documentação
      let examData = null;

      if (response && response.success && response.data) {
        // Estrutura da documentação: { success: true, data: { message: "...", exam: {...}, lectureCompleted: boolean, pointsEarned: number }, timestamp: "..." }
        examData = response;
      } else if (response && response.exam) {
        // Estrutura alternativa: { message: "...", exam: {...}, lectureCompleted: boolean, pointsEarned: number }
        examData = {
          success: true,
          data: response,
          timestamp: new Date().toISOString(),
        };
      } else {
        console.warn(
          "⚠️ [ExamsService] Resposta da atualização do exame não tem a estrutura esperada:",
          response
        );
        throw new Error("Erro ao atualizar exame");
      }

      return examData;
    } catch (error) {
      console.error(
        `❌ [ExamsService] Erro ao atualizar exame ${examId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Busca questões de um exame
   */
  async getExamQuestions(examId: string): Promise<ExamQuestionsResponse> {
    try {
      console.log(`📝 [ExamsService] Buscando questões do exame ${examId}...`);
      const response = await httpClient.get(`/api/exams/${examId}/questions`);
      console.log("✅ [ExamsService] Questões do exame carregadas:", response);

      // Verificar se a resposta tem a estrutura esperada da documentação
      let questionsData = null;

      if (response && response.success && response.data) {
        // Estrutura da documentação: { success: true, data: { exam: {...} }, timestamp: "..." }
        questionsData = response;
      } else if (response && response.exam) {
        // Estrutura alternativa: { exam: {...} }
        questionsData = {
          success: true,
          data: response,
          timestamp: new Date().toISOString(),
        };
      } else {
        console.warn(
          "⚠️ [ExamsService] Resposta das questões do exame não tem a estrutura esperada:",
          response
        );
        throw new Error("Erro ao buscar questões do exame");
      }

      return questionsData;
    } catch (error) {
      console.error(
        `❌ [ExamsService] Erro ao buscar questões do exame ${examId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Submete respostas de um exame
   */
  async submitExam(
    examId: string,
    data: ExamSubmitRequest
  ): Promise<ExamSubmitResponse> {
    try {
      console.log(`📝 [ExamsService] Submetendo exame ${examId}...`);
      const response = await httpClient.post(
        `/api/exams/${examId}/submit`,
        data
      );
      console.log("✅ [ExamsService] Exame submetido:", response);

      // Verificar se a resposta tem a estrutura esperada da documentação
      let submitData = null;

      if (response && response.success && response.data) {
        // Estrutura da documentação: { success: true, data: { message: "...", result: {...} }, timestamp: "..." }
        submitData = response;
      } else if (response && response.result) {
        // Estrutura alternativa: { message: "...", result: {...} }
        submitData = {
          success: true,
          data: response,
          timestamp: new Date().toISOString(),
        };
      } else {
        console.warn(
          "⚠️ [ExamsService] Resposta da submissão do exame não tem a estrutura esperada:",
          response
        );
        throw new Error("Erro ao submeter exame");
      }

      return submitData;
    } catch (error) {
      console.error(
        `❌ [ExamsService] Erro ao submeter exame ${examId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Busca tentativas de um exame
   */
  async getExamAttempts(
    examId: string,
    page: number = 0,
    limit: number = 10
  ): Promise<ExamAttemptsResponse> {
    try {
      console.log(
        `📝 [ExamsService] Buscando tentativas do exame ${examId}...`
      );
      const response = await httpClient.get(
        `/api/exams/${examId}/attempts?page=${page}&limit=${limit}`
      );
      console.log(
        "✅ [ExamsService] Tentativas do exame carregadas:",
        response
      );

      // Verificar se a resposta tem a estrutura esperada da documentação
      let attemptsData = null;

      if (response && response.success && response.data) {
        // Estrutura da documentação: { success: true, data: { attempts: [...], pagination: {...} }, timestamp: "..." }
        attemptsData = response;
      } else if (response && response.attempts) {
        // Estrutura alternativa: { attempts: [...], pagination: {...} }
        attemptsData = {
          success: true,
          data: response,
          timestamp: new Date().toISOString(),
        };
      } else {
        console.warn(
          "⚠️ [ExamsService] Resposta das tentativas do exame não tem a estrutura esperada:",
          response
        );
        throw new Error("Erro ao buscar tentativas do exame");
      }

      return attemptsData;
    } catch (error) {
      console.error(
        `❌ [ExamsService] Erro ao buscar tentativas do exame ${examId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Deleta um exame
   */
  async deleteExam(examId: string): Promise<{ message: string }> {
    try {
      console.log(`📝 [ExamsService] Deletando exame ${examId}...`);
      const response = await httpClient.delete(`/api/exams/${examId}`);
      console.log("✅ [ExamsService] Exame deletado:", response);

      // Verificar se a resposta tem a estrutura esperada da documentação
      if (
        response &&
        response.success &&
        response.data &&
        response.data.message
      ) {
        // Estrutura da documentação: { success: true, data: { message: "..." }, timestamp: "..." }
        return { message: response.data.message };
      } else if (response && response.message) {
        // Estrutura alternativa: { message: "..." }
        return { message: response.message };
      } else {
        console.warn(
          "⚠️ [ExamsService] Resposta da exclusão do exame não tem a estrutura esperada:",
          response
        );
        return { message: "Exame deletado com sucesso" };
      }
    } catch (error) {
      console.error(
        `❌ [ExamsService] Erro ao deletar exame ${examId}:`,
        error
      );
      throw error;
    }
  }
}

// Instância singleton do serviço
export const examsService = new ExamsService();
