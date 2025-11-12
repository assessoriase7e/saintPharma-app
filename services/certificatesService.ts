import {
  CertificateCreateRequest,
  CertificateCreateResponse,
  CertificatesResponse,
} from "@/types/api";
import { httpClient } from "./httpClient";

class CertificatesService {
  /**
   * Busca todos os certificados do usuário
   */
  async getCertificates(): Promise<CertificatesResponse> {
    try {
      console.log("🏅 [CertificatesService] Buscando certificados...");
      const response = await httpClient.get("/api/certificate");
      console.log(
        "✅ [CertificatesService] Certificados carregados:",
        response
      );

      // Verificar se a resposta tem a estrutura esperada da documentação
      // A API pode retornar: { success: true, data: { certificates: [...], pagination: {...} }, timestamp: "..." }
      // ou: { success: true, certificates: [...], pagination: {...} }
      let certificatesArray = [];
      let pagination = null;

      if (response && response.success && response.data) {
        // Estrutura atual da API: { success: true, data: { certificates: [...], pagination: {...} }, timestamp: "..." }
        if (response.data.certificates && Array.isArray(response.data.certificates)) {
          certificatesArray = response.data.certificates;
          pagination = response.data.pagination;
        }
      } else if (response && response.certificates && Array.isArray(response.certificates)) {
        // Estrutura alternativa: { success: true, certificates: [...], pagination: {...} }
        certificatesArray = response.certificates;
        pagination = response.pagination;
      } else if (Array.isArray(response)) {
        // Estrutura alternativa: Certificate[] diretamente
        certificatesArray = response;
      } else if (response && Array.isArray(response.data)) {
        // Estrutura alternativa: { data: Certificate[] }
        certificatesArray = response.data;
      }

      // Retornar no formato esperado pela página
      return {
        success: response?.success ?? true,
        certificates: certificatesArray,
        pagination: pagination || response?.pagination,
      };
    } catch (error) {
      console.error(
        "❌ [CertificatesService] Erro ao buscar certificados:",
        error
      );
      throw error;
    }
  }

  /**
   * Busca um certificado específico por ID
   */
  async getCertificateById(certificateId: string) {
    try {
      console.log(
        `🏅 [CertificatesService] Buscando certificado ${certificateId}...`
      );
      const response = await httpClient.get(
        `/api/certificate/${certificateId}`
      );
      console.log("✅ [CertificatesService] Certificado carregado:", response);
      return response;
    } catch (error) {
      console.error(
        `❌ [CertificatesService] Erro ao buscar certificado ${certificateId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Retorna a URL para download do PDF do certificado
   */
  getCertificatePDFUrl(certificateId: string): string {
    const baseURL = process.env.API_BASE_URL;
    
    if (!baseURL) {
      throw new Error("URL base da API não configurada");
    }

    return `${baseURL}/api/certificate/${certificateId}/download`;
  }

  /**
   * Obtém ou cria um certificado para o usuário autenticado
   * Se já existe um certificado para o curso, retorna o existente. Caso contrário, cria um novo.
   * 
   * A API aceita:
   * - course._id ou course.id (será normalizado para _id)
   * - course.name, course.title ou course.courseTitle (será normalizado para name)
   * 
   * Resposta esperada: { success: true, data: { certificate: {...} }, timestamp: "..." }
   */
  async getOrCreateCertificate(data: {
    course: {
      _id: string;
      name?: string;
      description?: string;
      points?: number;
      workload?: number;
      premiumPoints?: number;
      banner?: {
        asset: {
          url: string;
        };
      };
      slug?: string;
    };
  }): Promise<CertificateCreateResponse> {
    try {
      console.log("🏅 [CertificatesService] Obtendo ou criando certificado...");
      console.log("🏅 [CertificatesService] Dados:", {
        courseId: data.course._id,
        courseName: data.course.name,
      });
      
      const response = await httpClient.post("/api/certificate/for-user", data);
      console.log("✅ [CertificatesService] Certificado obtido/criado:", response);

      // Verificar se a resposta tem a estrutura esperada da documentação
      if (
        response &&
        response.success &&
        response.data &&
        response.data.certificate
      ) {
        return response;
      } else {
        console.warn(
          "⚠️ [CertificatesService] Resposta do certificado não tem a estrutura esperada:",
          response
        );
        throw new Error("Resposta inválida do servidor");
      }
    } catch (error) {
      console.error(
        "❌ [CertificatesService] Erro ao obter/criar certificado:",
        error
      );
      throw error;
    }
  }

  /**
   * Cria um novo certificado
   * 
   * A API aceita:
   * - userId: Clerk ID (começa com "user_") ou MongoDB ObjectId (será convertido automaticamente)
   * - course._id ou course.id (será normalizado para _id)
   * - course.name, course.title ou course.courseTitle (será normalizado para name)
   * 
   * Resposta esperada: { success: true, data: { certificate: {...} }, timestamp: "..." }
   */
  async createCertificate(
    data: CertificateCreateRequest
  ): Promise<CertificateCreateResponse> {
    try {
      console.log("🏅 [CertificatesService] Criando certificado...");
      console.log("🏅 [CertificatesService] Dados:", {
        userId: data.userId,
        courseId: data.course._id,
        courseName: data.course.name,
      });
      
      const response = await httpClient.post("/api/certificate/create", data);
      console.log("✅ [CertificatesService] Certificado criado:", response);

      // Verificar se a resposta tem a estrutura esperada da documentação
      // A API retorna: { success: true, data: { certificate: {...} }, timestamp: "..." }
      if (
        response &&
        response.success &&
        response.data &&
        response.data.certificate
      ) {
        // Estrutura da documentação: { success: true, data: { certificate: {...} }, timestamp: "..." }
        return response;
      } else {
        console.warn(
          "⚠️ [CertificatesService] Resposta do certificado não tem a estrutura esperada:",
          response
        );
        throw new Error("Resposta inválida do servidor");
      }
    } catch (error) {
      console.error(
        "❌ [CertificatesService] Erro ao criar certificado:",
        error
      );
      throw error;
    }
  }
}

// Instância singleton do serviço
export const certificatesService = new CertificatesService();
