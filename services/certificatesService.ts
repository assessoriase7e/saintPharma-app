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
      return response;
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
