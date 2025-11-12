import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { certificatesService } from "@/services";
import { httpClient } from "@/services/httpClient";

interface Certificate {
  id: string;
  courseTitle: string;
  workload: number;
  description: string;
  points: number;
  courseCmsId: string;
  createdAt: string;
  updatedAt?: string;
}

export default function CertificateView() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { userId } = useAuth();
  const insets = useSafeAreaInsets();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCertificate = async () => {
      if (!id) {
        setError("ID do certificado não fornecido");
        setLoading(false);
        return;
      }

      if (!userId) {
        setError("Usuário não autenticado");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Configurar X-User-Id header conforme documentação
        httpClient.setUserId(userId);

        const response = await certificatesService.getCertificateById(id);
        
        // Tratar diferentes estruturas de resposta
        let certData = null;
        if (response && response.success && response.data) {
          certData = response.data.certificate || response.data;
        } else if (response && response.certificate) {
          certData = response.certificate;
        } else if (response && response.id) {
          certData = response;
        }

        if (certData) {
          setCertificate(certData);
        } else {
          setError("Certificado não encontrado");
        }
      } catch (err) {
        console.error("Erro ao carregar certificado:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Erro ao carregar certificado. Tente novamente."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [id, userId]);

  const handleViewCertificate = async () => {
    if (!certificate || !id) {
      Alert.alert("Erro", "Certificado não disponível");
      return;
    }

    try {
      const baseURL = process.env.API_BASE_URL;
      
      if (!baseURL) {
        Alert.alert("Erro", "URL base da API não configurada");
        return;
      }

      // Remover /api do final da URL se existir, pois a rota pública não está em /api
      const serverUrl = baseURL.replace(/\/api\/?$/, "");
      const publicUrl = `${serverUrl}/certificate/public/${id}`;

      console.log("🔗 [CertificateView] Abrindo URL pública:", publicUrl);

      const canOpen = await Linking.canOpenURL(publicUrl);
      if (!canOpen) {
        Alert.alert("Erro", "Não foi possível abrir a URL do certificado");
        return;
      }

      await Linking.openURL(publicUrl);
    } catch (err) {
      console.error("❌ [CertificateView] Erro ao abrir URL:", err);
      Alert.alert(
        "Erro",
        err instanceof Error
          ? err.message
          : "Não foi possível abrir o certificado. Tente novamente."
      );
    }
  };


  if (loading) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-text-secondary mt-4">
          Carregando certificado...
        </Text>
      </View>
    );
  }

  if (error || !certificate) {
    return (
      <View className="flex-1 bg-background justify-center items-center px-6">
        <Ionicons name="alert-circle" size={64} color="#ef4444" />
        <Text className="text-text-primary text-xl font-bold mt-4 text-center">
          {error || "Certificado não encontrado"}
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="mt-6 bg-primary px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold">Voltar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="px-6 pb-6" style={{ paddingTop: insets.top + 12 }}>
        {/* Header com botão voltar */}
        <Pressable
          onPress={() => router.back()}
          className="mb-6 flex-row items-center"
        >
          <Ionicons name="arrow-back" size={24} color="#3b82f6" />
          <Text className="text-primary ml-2 font-medium">Voltar</Text>
        </Pressable>

        {/* Certificado */}
        <View className="bg-card border border-border rounded-lg p-6 mb-6">
          {/* Título */}
          <View className="items-center mb-6">
            <Ionicons name="ribbon" size={64} color="#10B981" />
            <Text className="text-2xl font-bold text-text-primary mt-4 text-center">
              Certificado de Conclusão
            </Text>
            <Text className="text-text-secondary mt-2 text-center">
              Este certificado comprova que
            </Text>
          </View>

          {/* Nome do curso */}
          <View className="bg-background rounded-lg p-4 mb-6">
            <Text className="text-xl font-semibold text-text-primary text-center">
              {certificate.courseTitle}
            </Text>
          </View>

          {/* Descrição */}
          {certificate.description && (
            <View className="mb-6">
              <Text className="text-text-secondary text-center">
                {certificate.description}
              </Text>
            </View>
          )}

          {/* Informações */}
          <View className="space-y-4 mb-6">
            <View className="flex-row items-center justify-between py-3 border-b border-border">
              <View className="flex-row items-center">
                <Ionicons name="time" size={20} color="#6B7280" />
                <Text className="text-text-secondary ml-2">Carga Horária</Text>
              </View>
              <Text className="text-text-primary font-semibold">
                {certificate.workload}h
              </Text>
            </View>

            <View className="flex-row items-center justify-between py-3 border-b border-border">
              <View className="flex-row items-center">
                <Ionicons name="star" size={20} color="#F59E0B" />
                <Text className="text-text-secondary ml-2">Pontos</Text>
              </View>
              <Text className="text-text-primary font-semibold">
                {certificate.points}
              </Text>
            </View>

            <View className="flex-row items-center justify-between py-3">
              <View className="flex-row items-center">
                <Ionicons name="calendar" size={20} color="#6B7280" />
                <Text className="text-text-secondary ml-2">Data de Emissão</Text>
              </View>
              <Text className="text-text-primary font-semibold">
                {new Date(certificate.createdAt).toLocaleDateString("pt-BR")}
              </Text>
            </View>
          </View>

          {/* ID do Certificado */}
          <View className="bg-background rounded-lg p-3 mb-6">
            <Text className="text-xs text-text-secondary text-center">
              ID do Certificado: {certificate.id}
            </Text>
          </View>
        </View>

        {/* Botão de Ação */}
        <View className="space-y-3">
          <Pressable
            onPress={handleViewCertificate}
            className="bg-primary rounded-lg py-4 px-6 flex-row items-center justify-center"
          >
            <Ionicons name="open-outline" size={20} color="white" />
            <Text className="text-white font-semibold ml-2 text-lg">
              Ver Certificado
            </Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

