import {
  CertificateCreateRequest,
  CertificateCreateResponse,
  CertificatesResponse,
} from "../types/api";
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
    const baseURL = process.env.EXPO_PUBLIC_API_BASE_URL;
    
    if (!baseURL) {
      throw new Error("URL base da API não configurada");
    }

    return `${baseURL}/api/certificate/${certificateId}/download`;
  }

  /**
   * Cria um novo certificado
   */
  async createCertificate(
    data: CertificateCreateRequest
  ): Promise<CertificateCreateResponse> {
    try {
      console.log("🏅 [CertificatesService] Criando certificado...");
      const response = await httpClient.post("/api/certificate/create", data);
      console.log("✅ [CertificatesService] Certificado criado:", response);
      return response;
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
