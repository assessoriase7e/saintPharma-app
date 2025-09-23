import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { certificatesService } from "../services";
import { CertificatesResponse } from "../types/api";

export default function Certificados() {
  const [certificates, setCertificates] = useState<CertificatesResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await certificatesService.getCertificates();
        setCertificates(response);
      } catch (err) {
        console.error("Erro ao carregar certificados:", err);
        setError("Erro ao carregar certificados. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-text-secondary mt-4">
          Carregando certificados...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-background justify-center items-center px-6">
        <Ionicons name="alert-circle" size={64} color="#ef4444" />
        <Text className="text-text-primary text-xl font-bold mt-4 text-center">
          Erro ao carregar certificados
        </Text>
        <Text className="text-text-secondary mt-2 text-center">{error}</Text>
      </View>
    );
  }

  const certificados = certificates?.certificates || [];

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="pt-12 px-6 pb-6">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-text-primary mb-2">
            Certificados
          </Text>
          <Text className="text-text-secondary">
            Acompanhe seus certificados e qualificações
          </Text>
        </View>

        {/* Estatísticas */}
        <View className="flex-row justify-between mb-6">
          <View className="bg-card border border-border rounded-lg p-4 flex-1 mr-2 ">
            <View className="flex-row items-center mb-2">
              <Ionicons name="ribbon" size={20} color="#10B981" />
              <Text className="text-sm text-text-secondary ml-2">
                Concluídos
              </Text>
            </View>
            <Text className="text-2xl font-bold text-text-primary">
              {certificados.length}
            </Text>
          </View>

          <View className="bg-card border border-border rounded-lg p-4 flex-1 ml-2 ">
            <View className="flex-row items-center mb-2">
              <Ionicons name="star" size={20} color="#F59E0B" />
              <Text className="text-sm text-text-secondary ml-2">
                Pontos Totais
              </Text>
            </View>
            <Text className="text-2xl font-bold text-text-primary">
              {certificados.reduce(
                (total: number, cert: any) => total + (cert.points || 0),
                0
              )}
            </Text>
          </View>
        </View>

        {/* Lista de Certificados */}
        <View className="space-y-4">
          {certificados.length > 0 ? (
            certificados.map((certificado: any) => (
              <View
                key={certificado.id}
                className="bg-card border border-border rounded-lg p-4"
              >
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-text-primary mb-1">
                      {certificado.courseTitle}
                    </Text>
                    <Text className="text-sm text-text-secondary">
                      {certificado.description}
                    </Text>
                  </View>
                  <View className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900">
                    <Text className="text-xs font-medium text-green-800 dark:text-green-200">
                      Concluído
                    </Text>
                  </View>
                </View>

                <View className="space-y-2">
                  <View className="flex-row items-center">
                    <Ionicons name="calendar" size={16} color="#6B7280" />
                    <Text className="text-sm text-text-secondary ml-2">
                      Emitido:{" "}
                      {new Date(certificado.createdAt).toLocaleDateString(
                        "pt-BR"
                      )}
                    </Text>
                  </View>

                  <View className="flex-row items-center">
                    <Ionicons name="star" size={16} color="#F59E0B" />
                    <Text className="text-sm text-text-secondary ml-2">
                      {certificado.points} pontos
                    </Text>
                  </View>

                  <View className="flex-row items-center">
                    <Ionicons name="time" size={16} color="#6B7280" />
                    <Text className="text-sm text-text-secondary ml-2">
                      Carga horária: {certificado.workload}h
                    </Text>
                  </View>
                </View>

                <View className="mt-3 pt-3 border-t border-border">
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-primary font-medium">
                      Baixar Certificado
                    </Text>
                    <Ionicons name="download" size={16} color="#3B82F6" />
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View className="bg-card border border-border rounded-lg p-6 items-center">
              <Ionicons name="ribbon-outline" size={48} color="#6B7280" />
              <Text className="text-text-primary text-lg font-semibold mt-4 mb-2">
                Nenhum certificado encontrado
              </Text>
              <Text className="text-text-secondary text-center">
                Complete alguns cursos para receber seus certificados
              </Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
