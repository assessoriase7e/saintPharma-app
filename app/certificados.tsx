import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, Text, View } from "react-native";

export default function Certificados() {
  const certificados = [
    {
      id: 1,
      nome: "Farmacologia Básica",
      instituicao: "Instituto de Saúde",
      dataEmissao: "15/03/2024",
      status: "Concluído",
      validade: "15/03/2027",
    },
    {
      id: 2,
      nome: "Gestão Farmacêutica",
      instituicao: "Universidade Federal",
      dataEmissao: "22/01/2024",
      status: "Concluído",
      validade: "22/01/2027",
    },
    {
      id: 3,
      nome: "Atenção Farmacêutica",
      instituicao: "Conselho Regional",
      dataEmissao: "10/12/2023",
      status: "Concluído",
      validade: "10/12/2026",
    },
    {
      id: 4,
      nome: "Farmácia Clínica",
      instituicao: "Centro de Estudos",
      dataEmissao: "Em andamento",
      status: "Em Progresso",
      validade: "-",
    },
  ];

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
          <View className="bg-card border border-border rounded-lg p-4 flex-1 mr-2 shadow-sm">
            <View className="flex-row items-center mb-2">
              <Ionicons name="ribbon" size={20} color="#10B981" />
              <Text className="text-sm text-text-secondary ml-2">
                Concluídos
              </Text>
            </View>
            <Text className="text-2xl font-bold text-text-primary">3</Text>
          </View>

          <View className="bg-card border border-border rounded-lg p-4 flex-1 ml-2 shadow-sm">
            <View className="flex-row items-center mb-2">
              <Ionicons name="time" size={20} color="#F59E0B" />
              <Text className="text-sm text-text-secondary ml-2">
                Em Progresso
              </Text>
            </View>
            <Text className="text-2xl font-bold text-text-primary">1</Text>
          </View>
        </View>

        {/* Lista de Certificados */}
        <View className="space-y-4">
          {certificados.map((certificado) => (
            <View
              key={certificado.id}
              className="bg-card border border-border rounded-lg p-4 shadow-sm"
            >
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-text-primary mb-1">
                    {certificado.nome}
                  </Text>
                  <Text className="text-sm text-text-secondary">
                    {certificado.instituicao}
                  </Text>
                </View>
                <View
                  className={`px-3 py-1 rounded-full ${
                    certificado.status === "Concluído"
                      ? "bg-green-100 dark:bg-green-900"
                      : "bg-yellow-100 dark:bg-yellow-900"
                  }`}
                >
                  <Text
                    className={`text-xs font-medium ${
                      certificado.status === "Concluído"
                        ? "text-green-800 dark:text-green-200"
                        : "text-yellow-800 dark:text-yellow-200"
                    }`}
                  >
                    {certificado.status}
                  </Text>
                </View>
              </View>

              <View className="grid">
                <View className="flex-row items-center">
                  <Ionicons
                    name="calendar"
                    size={16}
                    color="#6B7280"
                    className="mr-2"
                  />
                  <Text className="text-sm text-text-secondary ml-1">
                    Emitido: {certificado.dataEmissao}
                  </Text>
                </View>

                {certificado.validade !== "-" && (
                  <View className="flex-row items-center">
                    <Ionicons
                      name="shield-checkmark"
                      size={16}
                      color="#6B7280"
                      className="mr-2"
                    />
                    <Text className="text-sm text-text-secondary ml-1">
                      Válido até: {certificado.validade}
                    </Text>
                  </View>
                )}
              </View>

              {certificado.status === "Concluído" && (
                <View className="mt-3 pt-3 border-t border-border">
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-primary font-medium">
                      Baixar Certificado
                    </Text>
                    <Ionicons name="download" size={16} color="#3B82F6" />
                  </View>
                </View>
              )}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
